import React, { useState } from "react";
import { Modal, Button, TextInput, Checkbox } from "@mantine/core";
import styles from "@/app/components/adminComponents/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Company } from "@/app/utils/types";

interface AddCompanyModalProps {
  token: string | undefined,
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshCompanies: (value: boolean) => void;
}

export default function AddCompanyModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  setRefreshCompanies,
}: AddCompanyModalProps) {
  const [invalidName, setInvalidName] = useState(false);
  const [invalidAbbreviation, setInvalidAbbreviation] = useState(false);

  const handleClose = () => {
    setNewCompanyForm({
      name: "",
      abbreviation: "",
    });
    close();
  };

  const [newCompanyForm, setNewCompanyForm] = useState({
    name: "",
    abbreviation: "",
  });

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
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(newCompanyForm),
        }
      );

      if (response.ok) {
        setRefreshCompanies(true);
        handleClose();
        notifications.show({
          withBorder: true,
          title: "Kompanija dodana",
          message: `Kompanija ${newCompanyForm.name} je uspješno dodana`,
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
      <Modal opened={opened} onClose={handleClose} title="Dodaj kompaniju">
        <form onSubmit={onSubmit}>
          <TextInput
            data-autofocus
            name="name"
            label="Ime"
            onChange={handleFormInput}
            error={invalidName ? "Ime mora biti popunjeno" : undefined}
            mb={10}
            required
          />
          <TextInput
            name="abbreviation"
            label="Kratica"
            onChange={handleFormInput}
            error={invalidAbbreviation ? "Kratica mora biti popunjena" : undefined}
            mb={10}
            required
          />
          <Button type="submit" fullWidth mt={20}>
            Dodaj
          </Button>
        </form>
      </Modal>
    </>
  );
}
