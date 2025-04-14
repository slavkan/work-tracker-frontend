import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  Checkbox,
  Tabs,
  Tooltip,
} from "@mantine/core";
import styles from "@/app/components/adminComponents/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Department } from "@/app/utils/types";

interface EditDepartmentModalProps {
  token: string | undefined;
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshDepartments: (value: boolean) => void;
  setDepartmentsChanged: (value: boolean) => void;
  departmentEdit: Department | null;
  setDepartmentEdit: (value: Department | null) => void;
  companyId: number;
}

export default function EditDepartmentModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  setRefreshDepartments,
  setDepartmentsChanged,
  departmentEdit,
  setDepartmentEdit,
  companyId,
}: EditDepartmentModalProps) {
  const [invalidName, setInvalidName] = useState(false);
  const [invalidAbbreviation, setInvalidAbbreviation] = useState(false);

  const handleClose = () => {
    setDepartmentEdit(null);
    setNewDepartmentForm({
      name: "",
      company: {
        id: companyId
      }
    });
    close();
  };

  const [departmentId, setDepartmentId] = useState<string | null>(null);

  const [newDepartmentForm, setNewDepartmentForm] = useState({
    name: "",
      company: {
        id: companyId
      }
  });

  useEffect(() => {
    if (departmentEdit) {
      setDepartmentId(departmentEdit.id.toString());
      setNewDepartmentForm({
        name: departmentEdit.name || "",
        company: {
          id: companyId
        }
      });
    }
  }, [opened, departmentEdit]);

  const handleFormInput = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "name") {
      setNewDepartmentForm({ ...newDepartmentForm, name: value });
      setInvalidName(false);
    }
  };

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/department/${departmentId}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(newDepartmentForm),
        }
      );

      if (response.ok) {
        setRefreshDepartments(true);
        setDepartmentsChanged(true);
        handleClose();
        notifications.show({
          color: "green",
          withBorder: true,
          title: "Odjel uređen",
          message: `${newDepartmentForm.name} je uspješno uređen`,
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
      <Modal opened={opened} onClose={handleClose} title="Uredi odjel">
        <form onSubmit={onSubmit}>
          <TextInput
            data-autofocus
            value={newDepartmentForm.name}
            name="name"
            label="Naziv odjela"
            onChange={handleFormInput}
            error={invalidName ? "Naziv mora biti popunjen" : undefined}
            mb={10}
            required
          />
          <Button type="submit" fullWidth mt={20}>
            Uredi
          </Button>
        </form>
      </Modal>
    </>
  );
}
