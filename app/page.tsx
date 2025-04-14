"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { PasswordInput, TextInput, Fieldset, Button, Loader } from "@mantine/core";
import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { getDecodedToken } from "./auth/getDecodedToken";
import { roleRedirect } from "./auth/roleRedirect";


export default function Home() {
  const router = useRouter();
  const [invalidUsername, setInvalidUsername] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [loginCred, setLoginCred] = useState({
    username: "",
    password: "",
  });

  const [loadingButtonQuery, setLoadingButtonQuery] = useState(false);

  const handleFormInput = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "username") {
      setLoginCred({ ...loginCred, username: value });
      setInvalidUsername(false);
    } else if (name === "password") {
      setLoginCred({ ...loginCred, password: value });
      setInvalidPassword(false);
    }
  };

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    setLoadingButtonQuery(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(loginCred),
        }
      );

      setLoadingButtonQuery(false);

      if (response.ok) {
        const responseData = await response.json();
        Cookies.set("jwtTokenAttendanceApp", responseData.message, {
          expires: 7,
          sameSite: "None",
          secure: true,
        });
        const decodedToken = getDecodedToken();
        if (decodedToken) {
          roleRedirect(decodedToken.roles, router);
        } else {
          console.error("Decoded token is null");
        }
      } else {
        const errorData = await response.json();
        if (errorData) {
          if (errorData.message === "User not found") {
            setInvalidUsername(true);
            setInvalidPassword(false);
          } else if (errorData.message === "Incorrect password") {
            setInvalidUsername(false);
            setInvalidPassword(true);
          }
        }
      }
    } catch (error) {
      console.log("Error attempting to login", error);
    }
  };

  const quickCredsSet = (username: string, password: string) => {
    setLoginCred({
      username: username,
      password: password,
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.loginWidth}>
        <form onSubmit={onSubmit} className={styles.formTag}>
          <Fieldset legend="Prijava">
            <TextInput
              name="username"
              value={loginCred.username}
              label="Korisničko ime"
              onChange={handleFormInput}
              error={invalidUsername ? "Netočno korisničko ime" : undefined}
              mb={10}
            />
            <PasswordInput
              name="password"
              value={loginCred.password}
              label="Lozinka"
              onChange={handleFormInput}
              error={invalidPassword ? "Netočna lozinka" : undefined}
              mb={20}
            />
            <Button type="submit">
              Prijavi se
              {loadingButtonQuery &&
                <Loader color="white" size={20} ml={10} />
              }
            </Button>
          </Fieldset>
        </form>
      </div>
      <div className={styles.addCredsContainer1}>
        <Button variant="light" color="gray" onClick={() => quickCredsSet("sRamljak", "Sifra123")}>sRamljak</Button>
        <Button variant="light" color="gray" onClick={() => quickCredsSet("kRakic", "Sifra123")}>kRakic</Button>
        <Button variant="light" color="gray" onClick={() => quickCredsSet("jJagoda", "Sifra123")}>jJagoda</Button>
        <Button variant="light" color="gray" onClick={() => quickCredsSet("mMarkic", "Sifra123")}>mMarkic</Button>
      </div>
      <div className={styles.addCredsContainer2}>
        <Button variant="light" color="gray" onClick={() => quickCredsSet("pPeric", "Sifra123")}>pPeric</Button>
        <Button variant="light" color="gray" onClick={() => quickCredsSet("fTomas", "Sifra123")}>fTomas</Button>
        <Button variant="light" color="gray" onClick={() => quickCredsSet("dDrljepan", "Sifra123")}>dDrljepan</Button>
        <Button variant="light" color="gray" onClick={() => quickCredsSet("", "")}></Button>
      </div>
    </div>
  );
}
