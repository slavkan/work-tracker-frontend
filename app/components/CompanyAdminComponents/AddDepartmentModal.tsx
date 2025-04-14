import React, { useState } from "react";
import { Modal, Button, TextInput, Checkbox, Loader } from "@mantine/core";
import styles from "@/app/components/adminComponents/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";

interface AddDepartmentModalProps {
  token: string | undefined,
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshDepartments: (value: boolean) => void;
  setDepartmentsChanged: (value: boolean) => void;
  companyId: number;
}

export default function AddDepartmentModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  setRefreshDepartments,
  setDepartmentsChanged,
  companyId,
}: AddDepartmentModalProps) {
  const [invalidName, setInvalidName] = useState(false);
  const [invalidAbbreviation, setInvalidAbbreviation] = useState(false);

  const [loadingButtonQuery, setLoadingButtonQuery] = useState(false);

  const handleClose = () => {
    setNewDepartmentForm({
      name: "",
      company: {
        id: companyId
      }
    });
    close();
  };

  const [newDepartmentForm, setNewDepartmentForm] = useState({
    name: "",
    company: {
      id: companyId
    }
  });

  const handleFormInput = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "name") {
      setNewDepartmentForm({ ...newDepartmentForm, name: value });
      setInvalidName(false);
    }
  };



  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    setLoadingButtonQuery(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/department`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(newDepartmentForm),
        }
      );

      setLoadingButtonQuery(false);

      if (response.ok) {
        setRefreshDepartments(true);
        setDepartmentsChanged(true);
        handleClose();
        notifications.show({
          withBorder: true,
          title: "Odjel dodan",
          message: `Odjel ${newDepartmentForm.name} je uspješno dodan`,
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
      <Modal opened={opened} onClose={handleClose} title="Dodaj odjel">
        <form onSubmit={onSubmit}>
          <TextInput
            data-autofocus
            name="name"
            label="Naziv odjela"
            onChange={handleFormInput}
            error={invalidName ? "Ime mora biti popunjeno" : undefined}
            mb={10}
            required
          />
          <Button type="submit" fullWidth mt={20}>
            Dodaj
            {loadingButtonQuery &&
              <Loader color="white" size={20} ml={10} />
            }
          </Button>
        </form>
      </Modal>
    </>
  );
}
