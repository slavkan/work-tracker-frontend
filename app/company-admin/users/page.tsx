"use client";
import useCheckRole from "@/app/auth/useCheckRole";
import { PageLoading } from "@/app/components/PageLoading";
import { Button, Pagination, ScrollArea, Table, Tooltip, Text, Loader } from "@mantine/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import { ApiResponsePerson, Person, Company, Department } from "@/app/utils/types";
import AddUserModal from "@/app/components/adminComponents/AddUserModal";
import { useDisclosure } from "@mantine/hooks";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import DecodeCookie from "@/app/auth/DecodeCookie";
import { getPlainCookie } from "@/app/auth/getPlainCookie";
import { notifications } from "@mantine/notifications";
import FilterUsersDrawer from "@/app/components/adminComponents/FilterUsersDrawer";
import EditUserModal from "@/app/components/adminComponents/EditUserModal";
import DeleteUserModal from "@/app/components/adminComponents/DeleteUserModal";
import NavbarWorker from "@/app/components/NavbarCompanyAdmin";
import useCheckRoleAndFaculty from "@/app/auth/useCheckRoleAndFaculty";
import { useSearchParams } from "next/navigation";
import AddUserModalForCompanyAdmin from "@/app/components/CompanyAdminComponents/AddUserModalForCompanyAdmin";
import EditUserModalForCompanyAdmin from "@/app/components/CompanyAdminComponents/EditUserModalForCompanyAdmin";

function page() {
  const token = getPlainCookie();

  const decodedToken = getDecodedToken();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (decodedToken) {
      setUserId(decodedToken.userId);
    }
  }, [decodedToken]);

  const searchParams = useSearchParams();
  const companyId = searchParams?.get("companyId") ?? "";
  const companyIdNumber = parseInt(companyId);
  const authorized = useCheckRoleAndFaculty("ROLE_COMPANY_ADMIN", companyId);

  const [response, setResponse] = useState<ApiResponsePerson | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  // const [subjects, setsubjects] = useState<Subject[]>([]);
  const [personEdit, setPersonEdit] = useState<Person | null>(null);
  const [personDelete, setPersonDelete] = useState<Person | null>(null);

  const [elements, setElements] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");

  const [refreshUsers, setRefreshUsers] = useState<boolean>(false);
  const [companiesToBeFetched, setCompaniesToBeFetched] = useState<boolean>(true);
  const [departmentsToBeFetched, setDepartmentsToBeFetched] = useState<boolean>(true);
  const hasFetchedDepartments = useRef(false);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [companyName, setCompanyName] = useState<string>("");

  const [loadingQuery, setLoadingQuery] = useState(true);

  const [
    openedAddUserModal,
    { open: openAddUserModal, close: closeAddUserModal },
  ] = useDisclosure(false);
  const [
    openedEditUserModal,
    { open: openEditUserModal, close: closeEditUserModal },
  ] = useDisclosure(false);
  const [
    openedDeleteUserModal,
    { open: openDeleteUserModal, close: closeDeleteUserModal },
  ] = useDisclosure(false);
  const [
    openedFilterDrawer,
    { open: openFilterDrawer, close: closeFilterDrawer },
  ] = useDisclosure(false);

  useEffect(() => {
    setRefreshUsers(false);
    if (authorized === "AUTHORIZED" || refreshUsers) {
      fetchData();
    }
  }, [authorized, filterQuery, refreshUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterQuery]);

  //Fetch users
  const fetchData = useCallback(async () => {
    setLoadingQuery(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/persons/filter?page=${currentPage - 1
        }&size=${pageSize}&companyId=${companyId}${filterQuery}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      setLoadingQuery(false);

      if (response.ok) {
        const responseData = await response.json();
        setTotalPages(responseData.totalPages);
        if (currentPage > responseData.totalPages) {
          setCurrentPage(responseData.totalPages);
        }
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
  }, [filterQuery, currentPage]);

  //Fetch company
  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/department?companyId=${companyIdNumber}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        setDepartments(responseData);
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
    if (companiesToBeFetched) {
      setCompaniesToBeFetched(false);
      fetchCompanies();
    }
  }, [companiesToBeFetched]);


  // Fetch company details
  const fetchFacultyDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const companyData = await response.json();
        setCompanyName(companyData.name);
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log("Error attempting to fetch company details: ", error);
    }
  }, [companyId, token]);

  useEffect(() => {
    if (authorized === "AUTHORIZED") {
      fetchFacultyDetails();
    }
  }, [authorized, fetchFacultyDetails]);


  //Fetch worker's departments
  const fetchDataDepartment = useCallback(
    async (departmentId: number) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/study?departmentId=${departmentId}`,
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data: Department[] = await response.json();
          // console.log(`Studies for faculty ${facultyId}:`, data);
          setDepartments((prevDepartments) => {
            const newDepartments = data.filter(
              (newDepartment) => !prevDepartments.some((department) => department.id === newDepartment.id)
            );
            return [...prevDepartments, ...newDepartments];
          });
        } else {
          const errorData = await response.json();
          if (errorData) {
            console.log(errorData);
          }
        }
      } catch (error) {
        console.log("Error attempting to fetch data: ", error);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (companies.length > 0 && !hasFetchedDepartments.current) {
      fetchDataDepartment(companies[0].id);
      hasFetchedDepartments.current = true;
    }
  }, [companies, fetchDataDepartment]);


  useEffect(() => {
    if (response) {
      const transformedElements = response.content.map((person) => ({
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        username: person.username,
        email: person.email,
        phone: person.phone,
        admin: person.admin,
        companyAdmin: person.companyAdmin,
        supervisor: person.supervisor,
        worker: person.worker,
        rolesDisplay: `${person.admin ? "(Admin) " : ""}${person.companyAdmin ? "(Admin kompanije) " : ""
          }${person.supervisor ? "(Voditelj smjene) " : ""}${person.worker ? "(Radnik) " : ""
          }`,
      }));
      setElements(transformedElements);
    }
  }, [response]);

  // function to trigger openEditUserModal and set personEdit
  const handleEditUser = (person: Person) => {
    setPersonEdit(person);
  };

  useEffect(() => {
    if (personEdit) {
      openEditUserModal();
    }
  }, [personEdit]);

  // function to trigger openDeleteUserModal and set personEdit
  const handleDeleteUser = (person: Person) => {
    setPersonDelete(person);
  };

  useEffect(() => {
    if (personDelete) {
      openDeleteUserModal();
    }
  }, [personDelete]);

  const rows = elements.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td className={styles.column}>{element.firstName}</Table.Td>
      <Table.Td className={styles.column}>{element.lastName}</Table.Td>
      <Table.Td className={styles.column}>{element.email}</Table.Td>
      <Table.Td className={styles.column}>{element.phone}</Table.Td>
      <Table.Td className={styles.column}>{element.rolesDisplay}</Table.Td>
      <Table.Td className={styles.column}>
        <div className={styles.crudButtonsContainer}>
          <Tooltip label="Uredi korisnika">
            <Button color="green" onClick={() => handleEditUser(element)}>
              <Image
                src="/assets/svgs/edit.svg"
                alt="Edit"
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
      <NavbarWorker token={token} departmentsChanged={false} />
      <div className={styles.mainDiv}>
        <div className={styles.pageContent}>
          <div className={styles.pageHeading}>
            <Text size="lg" fw={500}>
              Korisnici
            </Text>
            <Text style={{ lineHeight: "100%", marginTop: "7px" }}>
              {companyName}
            </Text>
          </div>
          <div className={styles.addAndFilterBtnContainer}>
            <Tooltip label="Dodaj korisnika">
              <Button onClick={openAddUserModal}>
                <Image
                  src="/assets/svgs/plus.svg"
                  alt="Plus Icon"
                  width={24}
                  height={24}
                />
              </Button>
            </Tooltip>
            <Tooltip label="Filtriraj">
              <Button variant="filled" color="gray" onClick={openFilterDrawer}>
                <Image
                  src="/assets/svgs/filtering.svg"
                  alt="Filter"
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
                  <Table.Th className={styles.column}>Prezime</Table.Th>
                  <Table.Th className={styles.column}>Email</Table.Th>
                  <Table.Th className={styles.column}>Telefon</Table.Th>
                  <Table.Th className={styles.column}>Prava</Table.Th>
                  <Table.Th className={styles.column}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {loadingQuery ? (
                  <Table.Tr>
                    <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
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
        <Pagination
          value={currentPage}
          onChange={setCurrentPage}
          total={totalPages}
          mt={50}
        />
        <div className={styles.bottomSpace}></div>
      </div>

      <AddUserModalForCompanyAdmin
        token={token}
        opened={openedAddUserModal}
        open={openAddUserModal}
        close={closeAddUserModal}
        creatorRole="ROLE_COMPANY_ADMIN"
        setRefreshUsers={setRefreshUsers}
        companyId={companyIdNumber}
      />
      <EditUserModalForCompanyAdmin
        token={token}
        opened={openedEditUserModal}
        open={openEditUserModal}
        close={closeEditUserModal}
        creatorRole="ROLE_COMPANY_ADMIN"
        setRefreshUsers={setRefreshUsers}
        personEdit={personEdit}
        setPersonEdit={setPersonEdit}
        departments={departments}
      // studies={studies}
      />
      <FilterUsersDrawer
        opened={openedFilterDrawer}
        open={openFilterDrawer}
        close={closeFilterDrawer}
        creatorRole="ROLE_COMPANY_ADMIN"
        setFilterQuery={setFilterQuery}
      />
    </div>
  );
}

export default page;
