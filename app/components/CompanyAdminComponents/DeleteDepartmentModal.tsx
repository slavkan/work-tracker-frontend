import React, { useEffect, useState } from "react";
import { Modal, Button, TextInput, Checkbox } from "@mantine/core";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Department } from "@/app/utils/types";
import styles from "@/app/components/adminComponents/DeleteUserModal.module.css";

interface DeleteDepartmentModalProps {
  token: string | undefined,
  opened: boolean;
  open: () => void;
  close: () => void;
  setRefreshDepartments: (value: boolean) => void;
  setDepartmentsChanged: (value: boolean) => void;
  departmentDelete: Department | null;
  setDepartmentDelete: (value: Department | null) => void;
}

export default function DeleteDepartmentModal({
  token,
  opened,
  open,
  close,
  setRefreshDepartments,
  setDepartmentsChanged,
  departmentDelete,
  setDepartmentDelete,
}: DeleteDepartmentModalProps) {
  const handleClose = () => {
    setDepartmentDelete(null);
    setDeleteDepartmentForm({
      name: "",
    });
    close();
  };

  const [departmentId, setDepartmentId] = useState<string | null>(null);

  const [deleteDepartmentForm, setDeleteDepartmentForm] = useState({
    name: "",
  });

  useEffect(() => {
    if (departmentDelete) {
      setDepartmentId(departmentDelete.id.toString());
      setDeleteDepartmentForm({
        name: departmentDelete.name || "",
      });
    }
  }, [opened, departmentDelete]);

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/department/${departmentId}`,
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setRefreshDepartments(true);
        setDepartmentsChanged(true);
        handleClose();
        notifications.show({
          color: "red",
          withBorder: true,
          title: "Odjel obrisan",
          message: `${deleteDepartmentForm.name} je uspješno obrisan`,
        });
      } else {
        const errorData = await response.json();
        if (errorData.message === "Cannot delete department due to foreign key constraints") {
          notifications.show({
            color: "red",
            withBorder: true,
            title: "Greška",
            message: `${deleteDepartmentForm.name} nije moguće obrisati jer postoje povezane reference`,
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
      <Modal opened={opened} onClose={handleClose} title="Brisanje odjela">
        <form onSubmit={onSubmit}>
          <p>Da li ste sigurni da želite obrisati odjel <b>{departmentDelete?.name}</b></p>
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
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
