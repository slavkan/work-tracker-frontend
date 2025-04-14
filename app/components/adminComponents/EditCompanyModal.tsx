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
import { Company } from "@/app/utils/types";
import { PageLoading } from "@/app/components/PageLoading";

interface EditCompanyModalProps {
  token: string | undefined;
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshCompanies: (value: boolean) => void;
  companyEdit: Company | null;
  setCompanyEdit: (value: Company | null) => void;
}

export default function EditCompanyModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  setRefreshCompanies,
  companyEdit,
  setCompanyEdit,
}: EditCompanyModalProps) {
  const [invalidName, setInvalidName] = useState(false);
  const [invalidAbbreviation, setInvalidAbbreviation] = useState(false);

  const [loadingButtonQuery, setLoadingButtonQuery] = useState(false);

  const handleClose = () => {
    setCompanyEdit(null);
    setNewCompanyForm({
      name: "",
      abbreviation: "",
    });
    close();
  };

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyIds, setCompanyIds] = useState<number[]>([]);

  const [newCompanyForm, setNewCompanyForm] = useState({
    name: "",
    abbreviation: "",
  });

  useEffect(() => {
    if (companyEdit) {
      setCompanyId(companyEdit.id.toString());
      setNewCompanyForm({
        name: companyEdit.name || "",
        abbreviation: companyEdit.abbreviation || "",
      });
    }
  }, [opened, companyEdit]);

  const handleFormInput = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "name") {
      setNewCompanyForm({ ...newCompanyForm, name: value });
      setInvalidName(false);
    } else if (name === "abbreviation") {
      setNewCompanyForm({ ...newCompanyForm, abbreviation: value });
      setInvalidAbbreviation(false);
    }
  };

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    setLoadingButtonQuery(true);
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newCompanyForm),
        }
      );

      setLoadingButtonQuery(false);

      if (response.ok) {
        setRefreshCompanies(true);
        handleClose();
        notifications.show({
          color: "green",
          withBorder: true,
          title: "Kompanija uređena",
          message: `Kompanija ${newCompanyForm.name} je uspješno uređena`,
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

  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="Uredi kompnaiju">
        <form onSubmit={onSubmit}>
          <TextInput
            data-autofocus
            value={newCompanyForm.name}
            name="name"
            label="Ime"
            onChange={handleFormInput}
            error={invalidName ? "Ime mora biti popunjeno" : undefined}
            mb={10}
            required
          />
          <TextInput
            value={newCompanyForm.abbreviation}
            name="abbreviation"
            label="Kratica"
            onChange={handleFormInput}
            error={invalidAbbreviation ? "kratica mora biti popunjena" : undefined}
            mb={10}
            required
          />
          <Button type="submit" fullWidth mt={20}>
            Uredi
            {loadingButtonQuery &&
              <Loader color="white" size={20} ml={10} />
            }
          </Button>
        </form>
      </Modal>
    </>
  );
}
