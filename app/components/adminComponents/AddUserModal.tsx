import React, { useState } from "react";
import { Modal, Button, TextInput, Checkbox, Loader } from "@mantine/core";
import styles from "@/app/components/adminComponents/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Person } from "@/app/utils/types";

interface AddUserModalProps {
  token: string | undefined,
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshUsers: (value: boolean) => void;
}

export default function AddUserModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  setRefreshUsers,
}: AddUserModalProps) {
  const [invalidFirstName, setInvalidFirstName] = useState(false);
  const [invalidLastName, setInvalidLastName] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidUsername, setInvalidUsername] = useState(false);
  const [invalidPhone, setInvalidPhone] = useState(false);

  const [loadingButtonQuery, setLoadingButtonQuery] = useState(false);

  const handleClose = () => {
    setNewPersonForm({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      phone: "",
      admin: false,
      worker: false,
      professor: false,
      student: false,
    });
    close();
  };

  const [newPersonForm, setNewPersonForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    admin: false,
    worker: false,
    professor: false,
    student: false,
  });

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
      setInvalidPhone(false);
    } else if (name === "admin") {
      setNewPersonForm({ ...newPersonForm, admin: e.target.checked });
    } else if (name === "worker") {
      setNewPersonForm({ ...newPersonForm, worker: e.target.checked });
    } else if (name === "professor") {
      setNewPersonForm({ ...newPersonForm, professor: e.target.checked });
    } else if (name === "student") {
      setNewPersonForm({ ...newPersonForm, student: e.target.checked });
    }
  };

  

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    setLoadingButtonQuery(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/persons`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(newPersonForm),
        }
      );

      setLoadingButtonQuery(false);
      if (response.ok) {
        setRefreshUsers(true);
        handleClose();
        notifications.show({
          withBorder: true,
          title: "Korisnik dodan",
          message: `Korisnik ${newPersonForm.firstName} ${newPersonForm.lastName} je uspješno dodan`,
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

  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="Dodaj korisnika">
        <form onSubmit={onSubmit}>
          <TextInput
            data-autofocus
            name="firstName"
            label="Ime"
            onChange={handleFormInput}
            error={invalidFirstName ? "Ime mora biti popunjeno" : undefined}
            mb={10}
            required
          />
          <TextInput
            name="lastName"
            label="Prezime"
            onChange={handleFormInput}
            error={invalidLastName ? "Prezime mora biti popunjeno" : undefined}
            mb={10}
            required
          />
          <TextInput
            name="email"
            label="Email"
            onChange={handleFormInput}
            error={invalidEmail ? "Email je zauzet" : undefined}
            mb={10}
            required
          />
          <TextInput
            name="username"
            label="Korisničko ime"
            onChange={handleFormInput}
            error={invalidUsername ? "Korisničko ime je zauzeto" : undefined}
            mb={10}
            required
          />
          <TextInput
            name="phone"
            label="Broj telefona"
            onChange={handleFormInput}
            mb={10}
          />
          <div className={styles.checkboxTwoRows}>
            <div>
              <Checkbox
                mb={10}
                name="admin"
                label="Admin"
                onChange={handleFormInput}
              />
              <Checkbox
                mb={10}
                name="worker"
                label="Radnik"
                onChange={handleFormInput}
              />
            </div>
            <div>
              <Checkbox
                mb={10}
                name="professor"
                label="Profesor"
                onChange={handleFormInput}
              />
              <Checkbox
                mb={10}
                name="student"
                label="Student"
                onChange={handleFormInput}
              />
            </div>
          </div>
          <Button type="submit" fullWidth mt={20}>
            Dodaj
            {loadingButtonQuery && 
              <Loader color="white" size={20} ml={10}/>
            }
          </Button>
          {invalidUsername && (
            <div className={styles.error}>Korisničko ime već postoji</div>
          )}
          {invalidEmail && (
            <div className={styles.error}>Email već postoji</div>
          )}
        </form>
      </Modal>
    </>
  );
}
