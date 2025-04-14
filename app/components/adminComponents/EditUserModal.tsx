import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  Checkbox,
  Tabs,
  Tooltip,
  Loader,
} from "@mantine/core";
import styles from "@/app/components/adminComponents/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Company, CompanyPerson, Person } from "@/app/utils/types";
import { PageLoading } from "@/app/components/PageLoading";

interface EditUserModalProps {
  token: string | undefined,
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshUsers: (value: boolean) => void;
  personEdit: Person | null;
  setPersonEdit: (value: Person | null) => void;
  companies: Company[] | null;
}

export default function EditUserModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  setRefreshUsers,
  personEdit,
  setPersonEdit,
  companies,
}: EditUserModalProps) {
  const [invalidFirstName, setInvalidFirstName] = useState(false);
  const [invalidLastName, setInvalidLastName] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidUsername, setInvalidUsername] = useState(false);
  const [invalidIndexNumber, setInvalidIndexNumber] = useState(false);
  const [invalidAcademicTitle, setInvalidAcademicTitle] = useState(false);

  const [loadingButtonQuery, setLoadingButtonQuery] = useState(false);

  const [loadingUserCompanies, setLoadingUserCompanies] = useState(false);

  const handleClose = () => {
    setPersonEdit(null);
    setNewPersonForm({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      phone: "",
      admin: false,
      companyAdmin: false,
      supervisor: false,
      worker: false,
    });
    close();
  };

  const [personId, setPersonId] = useState<string | null>(null);
  const [companyPerson, setCompanyPerson] = useState<CompanyPerson | null>(
    null
  );
  const [companyIds, setCompanyIds] = useState<number[]>([]);
  const [personCompanyBeingConnected, setPersonCompanyBeingConnected] =
    useState(false);

  const [newPersonForm, setNewPersonForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    admin: false,
    companyAdmin: false,
    supervisor: false,
    worker: false,
  });

  useEffect(() => {
    if (personEdit) {
      setPersonId(personEdit.id.toString());
      setNewPersonForm({
        firstName: personEdit.firstName || "",
        lastName: personEdit.lastName || "",
        email: personEdit.email || "",
        username: personEdit.username || "",
        phone: personEdit.phone || "",
        admin: personEdit.admin || false,
        companyAdmin: personEdit.companyAdmin || false,
        supervisor: personEdit.supervisor || false,
        worker: personEdit.worker || false,
      });
    }
  }, [opened, personEdit]);

  const handleFormInput = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "firstName") {
      setNewPersonForm({ ...newPersonForm, firstName: value });
      setInvalidFirstName(false);
    } else if (name === "lastName") {
      setNewPersonForm({ ...newPersonForm, lastName: value });
      setInvalidLastName(false);
    } else if (name === "email") {
      setNewPersonForm({ ...newPersonForm, email: value });
      setInvalidEmail(false);
    } else if (name === "username") {
      setNewPersonForm({ ...newPersonForm, username: value });
      setInvalidUsername(false);
    } else if (name === "phone") {
      setNewPersonForm({ ...newPersonForm, phone: value });
      setInvalidIndexNumber(false);
    } else if (name === "admin") {
      setNewPersonForm({ ...newPersonForm, admin: e.target.checked });
    } else if (name === "companyAdmin") {
      setNewPersonForm({ ...newPersonForm, companyAdmin: e.target.checked });
    } else if (name === "supervisor") {
      setNewPersonForm({ ...newPersonForm, supervisor: e.target.checked });
    } else if (name === "worker") {
      setNewPersonForm({ ...newPersonForm, worker: e.target.checked });
    }
  };

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    setLoadingButtonQuery(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/persons/${personId}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newPersonForm),
        }
      );
      setLoadingButtonQuery(false);

      if (response.ok) {
        setRefreshUsers(true);
        handleClose();
        notifications.show({
          color: "green",
          withBorder: true,
          title: "Korisnik uređen",
          message: `Korisnik ${newPersonForm.firstName} ${newPersonForm.lastName} je uspješno uređen`,
        });
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData.message);
          if (errorData.message === "Email already exists") {
            setInvalidEmail(true);
          } else if (errorData.message === "Username already exists") {
            setInvalidUsername(true);
          }
        }
      }
    } catch (error) {
      console.log("Error attempting to login", error);
    }
  };

  // Generate new password for a user
  const generatePassword = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/generate-password/${personId}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        notifications.show({
          color: "green",
          withBorder: true,
          title: "Nova lozinka generirana",
          message: `Lozinka za korisnika ${newPersonForm.firstName} ${newPersonForm.lastName} je uspješno generirana, podaci za prijavu su poslani na njegov email`,
        });
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData.message);
        }
      }
    } catch (error) {
      console.log("Error attempting to login", error);
    }
  };

  // PersonCompany connection
  const handlePersonCompanyConnection = async (
    e: React.ChangeEvent<any>,
    isDeleting: boolean
  ) => {
    const { name, value } = e.target;
    const companyId = parseInt(name);

    setLoadingUserCompanies(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company-person?personId=${personId}&companyId=${companyId}`,
        {
          method: isDeleting ? "DELETE" : "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoadingUserCompanies(false);

      if (response.ok) {
        // setRefreshUsers(true);
        setCompanyIds((prevCompanyIds) =>
          isDeleting
            ? prevCompanyIds.filter((id) => id !== companyId)
            : [...prevCompanyIds, companyId]
        );
        // handleClose();
        notifications.show({
          color: isDeleting ? "red" : "green",
          withBorder: true,
          title: isDeleting
            ? "Korisnik uklonjen iz kompanije"
            : "Korisnik dodan u kompaniju",
          message: isDeleting
            ? `Korisnik ${newPersonForm.firstName} ${newPersonForm.lastName} je uspješno uklonjen iz kompanije`
            : `Korisnik ${newPersonForm.firstName} ${newPersonForm.lastName} je uspješno dodan u kompaniju`,
        });
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData.message);
          if (errorData.message === "Email already exists") {
            setInvalidEmail(true);
          } else if (errorData.message === "Username already exists") {
            setInvalidUsername(true);
          }
        }
      }
    } catch (error) {
      console.log("Error attempting to login", error);
    }
  };

  useEffect(() => {
    console.log("Fetching user's companies");
    setLoadingUserCompanies(true);
    const fetchCompanies = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/company-person?personId=${personId}`,
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLoadingUserCompanies(false);
        if (response.ok) {
          const data: CompanyPerson[] = await response.json();
          const extractedCompanyIds = data.map((item) => item.company.id);
          setCompanyIds(extractedCompanyIds);
        } else {
          console.error("Failed to fetch companies");
        }
      } catch (error) {
        console.error("Error fetching companies", error);
      }
    };

    if (opened) {
      fetchCompanies();
    }
  }, [personId, opened]);

  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="Uredi korisnika">
        <Tabs defaultValue="editPerson">
          <Tabs.List mb={10}>
            <Tabs.Tab value="editPerson">Uređivanje korisnika</Tabs.Tab>
            <Tabs.Tab value="editPersonCompany">
              Povezivanje sa kompanijama
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="editPerson">
            <form onSubmit={onSubmit}>
              <TextInput
                data-autofocus
                value={newPersonForm.firstName}
                name="firstName"
                label="Ime"
                onChange={handleFormInput}
                error={invalidFirstName ? "Ime mora biti popunjeno" : undefined}
                mb={10}
                required
              />
              <TextInput
                value={newPersonForm.lastName}
                name="lastName"
                label="Prezime"
                onChange={handleFormInput}
                error={
                  invalidLastName ? "Prezime mora biti popunjeno" : undefined
                }
                mb={10}
                required
              />
              <TextInput
                value={newPersonForm.email}
                name="email"
                label="Email"
                onChange={handleFormInput}
                error={invalidEmail ? "Email je zauzet" : undefined}
                mb={10}
                required
              />
              <TextInput
                value={newPersonForm.username}
                name="username"
                label="Korisničko ime"
                onChange={handleFormInput}
                error={
                  invalidUsername ? "Korisničko ime je zauzeto" : undefined
                }
                mb={10}
                required
              />
              <TextInput
                value={newPersonForm.phone}
                name="phone"
                label="Broj telefona"
                onChange={handleFormInput}
                mb={10}
              />
              <div className={styles.checkboxTwoRows}>
                <div>
                  <Checkbox
                    checked={newPersonForm.admin}
                    mb={10}
                    name="admin"
                    label="Admin"
                    onChange={handleFormInput}
                  />
                  <Checkbox
                    checked={newPersonForm.companyAdmin}
                    mb={10}
                    name="companyAdmin"
                    label="Admin kompanije"
                    onChange={handleFormInput}
                  />
                </div>
                <div>
                  <Checkbox
                    checked={newPersonForm.supervisor}
                    mb={10}
                    name="supervisor"
                    label="Voditelj smjene"
                    onChange={handleFormInput}
                  />
                  <Checkbox
                    checked={newPersonForm.worker}
                    mb={10}
                    name="worker"
                    label="radnik"
                    onChange={handleFormInput}
                  />
                </div>
              </div>
              <Button type="submit" fullWidth mt={20}>
                Uredi
                {loadingButtonQuery &&
                  <Loader color="white" size={20} ml={10} />
                }
              </Button>
              <Button
                type="button"
                fullWidth
                mt={10}
                color="gray"
                onClick={(e) => generatePassword(e)}
              >
                Generiraj novu lozinku
              </Button>
              {invalidUsername && (
                <div className={styles.error}>Korisničko ime već postoji</div>
              )}
              {invalidEmail && (
                <div className={styles.error}>Email već postoji</div>
              )}
            </form>
          </Tabs.Panel>
          <Tabs.Panel value="editPersonCompany">
            <h4>{`${newPersonForm.firstName} ${newPersonForm.lastName}`}</h4>
            <div className={styles.companyCheckboxContainer}>
              {companies && companies.length > 0 ? (
                companies.map((company) => {
                  const isConnected = companyIds.includes(company.id);
                  return (
                    <div key={company.id}>
                      {loadingUserCompanies ? (
                        <Loader size={20} />
                      ):(
                        <Checkbox
                        name={company.id.toString()}
                        label={`${company.name}`}
                        checked={isConnected}
                        onChange={(e) =>
                          handlePersonCompanyConnection(e, isConnected)
                        }
                      />
                      )}
                      
                    </div>
                  );
                })
              ) : (
                <div>Nema kompanija</div>
              )}
            </div>
          </Tabs.Panel>
        </Tabs>
        <PageLoading visible={personCompanyBeingConnected} />
      </Modal>
    </>
  );
}
