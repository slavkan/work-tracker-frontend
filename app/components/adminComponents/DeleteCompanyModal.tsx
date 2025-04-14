import React, { useEffect, useState } from "react";
import { Modal, Button, TextInput, Checkbox, Loader } from "@mantine/core";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Company } from "@/app/utils/types";
import styles from "@/app/components/adminComponents/DeleteUserModal.module.css";

interface DeleteCompanyModalProps {
  token: string | undefined,
  opened: boolean;
  open: () => void;
  close: () => void;
  setRefreshCompanies: (value: boolean) => void;
  companyDelete: Company | null;
  setCompanyDelete: (value: Company | null) => void;
}

export default function DeleteCompanyModal({
  token,
  opened,
  open,
  close,
  setRefreshCompanies,
  companyDelete,
  setCompanyDelete,
}: DeleteCompanyModalProps) {
  const handleClose = () => {
    setCompanyDelete(null);
    setDeleteCompanyForm({
      name: "",
      abbreviation: "",
    });
    close();
  };

  const [companyId, setCompanyId] = useState<string | null>(null);

  const [loadingButtonQuery, setLoadingButtonQuery] = useState(false);

  const [deleteCompanyForm, setDeleteCompanyForm] = useState({
    name: "",
    abbreviation: "",
  });

  useEffect(() => {
    if (companyDelete) {
      setCompanyId(companyDelete.id.toString());
      setDeleteCompanyForm({
        name: companyDelete.name || "",
        abbreviation: companyDelete.abbreviation || "",
      });
    }
  }, [opened, companyDelete]);

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    setLoadingButtonQuery(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}`,
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoadingButtonQuery(false);

      if (response.ok) {
        setRefreshCompanies(true);
        handleClose();
        notifications.show({
          color: "red",
          withBorder: true,
          title: "Kompanija obrisana",
          message: `Kompanija ${deleteCompanyForm.name} je uspješno obrisana`,
        });
      } else {
        const errorData = await response.json();
        if (errorData.message === "Cannot delete company due to foreign key constraints") {
          notifications.show({
            color: "red",
            withBorder: true,
            title: "Greška",
            message: `${deleteCompanyForm.name} nije moguće obrisati jer postoje povezane reference`,
          });
        }
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
      <Modal opened={opened} onClose={handleClose} title="Brisanje kompanije">
        <form onSubmit={onSubmit}>
          <p>Da li ste sigurni da želite obrisati kompaniju <b>{companyDelete?.name}</b></p>
          <div className={styles.buttonsContainer}>
            <Button
              fullWidth
              mt={20}
              color="gray"
              onClick={handleClose}
            >
              Zatvori
            </Button>
            <Button type="submit" fullWidth mt={20} color="red">
              Obriši
              {loadingButtonQuery &&
                <Loader color="white" size={20} ml={10} />
              }
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
