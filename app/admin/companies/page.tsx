"use client";
import useCheckRole from "@/app/auth/useCheckRole";
import Navbar2 from "@/app/components/Navbar2";
import { PageLoading } from "@/app/components/PageLoading";
import {
  Button,
  Pagination,
  ScrollArea,
  Table,
  Tooltip,
  Text,
  Loader,
} from "@mantine/core";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import { Company } from "@/app/utils/types";
import { useDisclosure } from "@mantine/hooks";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import DecodeCookie from "@/app/auth/DecodeCookie";
import { getPlainCookie } from "@/app/auth/getPlainCookie";
import { notifications } from "@mantine/notifications";
import FilterUsersDrawer from "@/app/components/adminComponents/FilterUsersDrawer";
import EditUserModal from "@/app/components/adminComponents/EditUserModal";
import DeleteUserModal from "@/app/components/adminComponents/DeleteUserModal";
import AddCompanyModal from "@/app/components/adminComponents/AddCompanyModal";
import EditCompanyModal from "@/app/components/adminComponents/EditCompanyModal";
import DeleteFacultyModal from "@/app/components/adminComponents/DeleteCompanyModal";

function page() {
  const authorized = useCheckRole("ROLE_ADMIN");
  const token = getPlainCookie();

  const [response, setResponse] = useState<Company[] | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyEdit, setCompanyEdit] = useState<Company | null>(null);
  const [companyDelete, setCompanyDelete] = useState<Company | null>(null);

  const [loadingQuery, setLoadingQuery] = useState(true);

  const [elements, setElements] = useState<any[]>([]);

  const [refreshCompanies, setRefreshCompanies] = useState<boolean>(false);

  const [
    openedAddCompanyModal,
    { open: openAddCompanyModal, close: closeAddCompanyModal },
  ] = useDisclosure(false);
  const [
    openedEditCompanyModal,
    { open: openEditCompanyModal, close: closeEditCompanyModal },
  ] = useDisclosure(false);
  const [
    openedDeleteCompanyModal,
    { open: openDeleteCompanyModal, close: closeDeleteCompanyModal },
  ] = useDisclosure(false);

  useEffect(() => {
    setRefreshCompanies(false);
    if (authorized === "AUTHORIZED" || refreshCompanies) {
      fetchData();
    }
  }, [authorized, refreshCompanies]);

  //Fetch companies
  const fetchData = useCallback(async () => {
    setLoadingQuery(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoadingQuery(false);

      if (response.ok) {
        const responseData = await response.json();
        setResponse(responseData);
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log("Error attempting to fetch data: ", error);
    }
  }, []);

  useEffect(() => {
    if (response) {
      const transformedElements = response.map((company) => ({
        id: company.id,
        name: company.name,
        abbreviation: company.abbreviation,
      }));
      setElements(transformedElements);
    }
  }, [response]);

  // function to trigger openEditCompanyModal and set personEdit
  const handleEditCompany = (company: Company) => {
    setCompanyEdit(company);
  };

  useEffect(() => {
    if (companyEdit) {
      openEditCompanyModal();
    }
  }, [companyEdit]);

  // function to trigger openDeleteCompanyModal and set personEdit
  const handleDeleteCompany = (company: Company) => {
    setCompanyDelete(company);
  };

  useEffect(() => {
    if (companyDelete) {
      openDeleteCompanyModal();
    }
  }, [companyDelete]);

  const rows = elements.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td className={styles.column}>{element.name}</Table.Td>
      <Table.Td className={styles.column}>{element.abbreviation}</Table.Td>
      <Table.Td className={styles.column}>
        <div className={styles.crudButtonsContainer}>
          <Tooltip label="Uredi kompaniju">
            <Button color="green" onClick={() => handleEditCompany(element)}>
              <Image
                src="/assets/svgs/edit.svg"
                alt="Edit"
                width={24}
                height={24}
              ></Image>
            </Button>
          </Tooltip>
          <Tooltip label="Obriši kompaniju">
            <Button color="red" onClick={() => handleDeleteCompany(element)}>
              <Image
                src="/assets/svgs/trash.svg"
                alt="Delete"
                width={24}
                height={24}
              ></Image>
            </Button>
          </Tooltip>
        </div>
      </Table.Td>
    </Table.Tr>
  ));

  if (authorized === "CHECKING") {
    return <PageLoading visible={true} />;
  }

  return (
    <div>
      <Navbar2 />
      <div className={styles.mainDiv}>
        <div className={styles.pageContent}>
          <div className={styles.pageHeading}>
            <Text size="lg" fw={500}>
              Kompanije
            </Text>
          </div>
          <div className={styles.addAndFilterBtnContainer}>
            <Tooltip label="Dodaj kompaniju">
              <Button onClick={openAddCompanyModal}>
                <Image
                  src="/assets/svgs/plus.svg"
                  alt="Plus Icon"
                  width={24}
                  height={24}
                />
              </Button>
            </Tooltip>
          </div>

          <ScrollArea className={styles.borderColor}>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className={styles.column}>Ime</Table.Th>
                  <Table.Th className={styles.column}>Kratica</Table.Th>
                  <Table.Th className={styles.column}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {loadingQuery ? (
                  <Table.Tr>
                    <Table.Td colSpan={3} style={{ textAlign: 'center' }}>
                      <div className={styles.loadingColumn}>
                        <Loader />
                      </div>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  rows
                )}

              </Table.Tbody>
            </Table>
          </ScrollArea>
        </div>
        <div className={styles.bottomSpace}></div>
      </div>

      <AddCompanyModal
        token={token}
        opened={openedAddCompanyModal}
        open={openAddCompanyModal}
        close={closeAddCompanyModal}
        creatorRole="ROLE_ADMIN"
        setRefreshCompanies={setRefreshCompanies}
      />
      <EditCompanyModal
        token={token}
        opened={openedEditCompanyModal}
        open={openEditCompanyModal}
        close={closeEditCompanyModal}
        creatorRole="ROLE_ADMIN"
        setRefreshCompanies={setRefreshCompanies}
        companyEdit={companyEdit}
        setCompanyEdit={setCompanyEdit}
      />
      <DeleteFacultyModal
        token={token}
        opened={openedDeleteCompanyModal}
        open={openDeleteCompanyModal}
        close={closeDeleteCompanyModal}
        setRefreshCompanies={setRefreshCompanies}
        companyDelete={companyDelete}
        setCompanyDelete={setCompanyDelete}
      />
      {/* <FilterUsersDrawer
        opened={openedFilterDrawer}
        open={openFilterDrawer}
        close={closeFilterDrawer}
        creatorRole="ROLE_ADMIN"
        setFilterQuery={setFilterQuery}
      /> */}
    </div>
  );
}

export default page;
