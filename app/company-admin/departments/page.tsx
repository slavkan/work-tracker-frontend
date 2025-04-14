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
} from "@mantine/core";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import { Company, Department } from "@/app/utils/types";
import { useDisclosure } from "@mantine/hooks";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import DecodeCookie from "@/app/auth/DecodeCookie";
import { getPlainCookie } from "@/app/auth/getPlainCookie";
import { notifications } from "@mantine/notifications";
import FilterUsersDrawer from "@/app/components/adminComponents/FilterUsersDrawer";
import EditUserModal from "@/app/components/adminComponents/EditUserModal";
import DeleteUserModal from "@/app/components/adminComponents/DeleteUserModal";
import AddFacultyModal from "@/app/components/adminComponents/AddCompanyModal";
import EditFacultyModal from "@/app/components/adminComponents/EditCompanyModal";
import DeleteFacultyModal from "@/app/components/adminComponents/DeleteCompanyModal";
import { useSearchParams } from "next/navigation";
import useCheckRoleAndFaculty from "@/app/auth/useCheckRoleAndFaculty";
import NavbarCompanyAdmin from "@/app/components/NavbarCompanyAdmin";
import AddDepartmentModal from "@/app/components/CompanyAdminComponents/AddDepartmentModal";
import EditDepartmentModal from "@/app/components/CompanyAdminComponents/EditDepartmentModal";
import DeleteDepartmentModal from "@/app/components/CompanyAdminComponents/DeleteDepartmentModal";

function page() {
  const token = getPlainCookie();

  const searchParams = useSearchParams();
  const companyId = searchParams?.get("companyId") ?? "";
  const companyIdNumber = parseInt(companyId);
  const authorized = useCheckRoleAndFaculty("ROLE_COMPANY_ADMIN", companyId);

  const [response, setResponse] = useState<Department[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentEdit, setDepartmentEdit] = useState<Department | null>(null);
  const [departmentDelete, setDepartmentDelete] = useState<Department | null>(null);
  const [companyName, setCompanyName] = useState<string>("");

  const [elements, setElements] = useState<any[]>([]);

  const [refreshDepartments, setRefreshDepartments] = useState<boolean>(false);
  const [departmentsChanged, setDepartmentsChanged] = useState<boolean>(false);

  const [
    openedAddDepartmentModal,
    { open: openAddDepartmentModal, close: closeAddDepartmentModal },
  ] = useDisclosure(false);
  const [
    openedEditDepartmentModal,
    { open: openEditDepartmentModal, close: closeEditDepartmentModal },
  ] = useDisclosure(false);
  const [
    openedDeleteDepartmentModal,
    { open: openDeleteDepartmentModal, close: closeDeleteDepartmentModal },
  ] = useDisclosure(false);

  useEffect(() => {
    setRefreshDepartments(false);
    if (authorized === "AUTHORIZED" || refreshDepartments) {
      fetchData();
    }
  }, [authorized, refreshDepartments]);

  //Fetch departments
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/department?companyId=${companyId}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
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
  }, [setRefreshDepartments]);

  // Fetch company details
  const fetchCompanyDetails = useCallback(async () => {
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
      fetchCompanyDetails();
    }
  }, [authorized, fetchCompanyDetails]);

  useEffect(() => {
    if (response) {
      const transformedElements = response.map((company) => ({
        id: company.id,
        name: company.name,
      }));
      setElements(transformedElements);
    }
  }, [response]);

  // function to trigger openEditDepartmentModal and set personEdit
  const handleEditDepartment = (department: Department) => {
    setDepartmentEdit(department);
  };

  useEffect(() => {
    if (departmentEdit) {
      openEditDepartmentModal();
    }
  }, [departmentEdit]);

  // function to trigger openDeleteDepartmentModal and set personEdit
  const handleDeleteDepartment = (department: Department) => {
    setDepartmentDelete(department);
  };

  useEffect(() => {
    if (departmentDelete) {
      openDeleteDepartmentModal();
    }
  }, [departmentDelete]);

  const rows = elements.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td className={styles.column}>{element.name}</Table.Td>
      <Table.Td className={styles.column}>
        <div className={styles.crudButtonsContainer}>
          <Tooltip label="Uredi odjel">
            <Button color="green" onClick={() => handleEditDepartment(element)}>
              <Image
                src="/assets/svgs/edit.svg"
                alt="Edit"
                width={24}
                height={24}
              ></Image>
            </Button>
          </Tooltip>
          <Tooltip label="Obriši odjel">
            <Button color="red" onClick={() => handleDeleteDepartment(element)}>
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
      <NavbarCompanyAdmin token={token} departmentsChanged={departmentsChanged} />
      <div className={styles.mainDiv}>
        <div className={styles.pageContent}>
          <div className={styles.pageHeading}>
            <Text size="lg" fw={500}>
              Odjeli
            </Text>
            <Text style={{ lineHeight: "100%", marginTop: "7px" }}>
              {companyName}
            </Text>
          </div>
          <div className={styles.addAndFilterBtnContainer}>
            <Tooltip label="Dodaj odjel">
              <Button onClick={openAddDepartmentModal}>
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
                  <Table.Th className={styles.column}>Naziv odjela</Table.Th>
                  <Table.Th className={styles.column}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        </div>
        <div className={styles.bottomSpace}></div>
      </div>

      <AddDepartmentModal
        token={token}
        opened={openedAddDepartmentModal}
        open={openAddDepartmentModal}
        close={closeAddDepartmentModal}
        creatorRole="ROLE_COMPANY_ADMIN"
        setRefreshDepartments={setRefreshDepartments}
        setDepartmentsChanged={setDepartmentsChanged}
        companyId={companyIdNumber}
      />
      <EditDepartmentModal
        token={token}
        opened={openedEditDepartmentModal}
        open={openEditDepartmentModal}
        close={closeEditDepartmentModal}
        creatorRole="ROLE_COMPANY_ADMIN"
        setRefreshDepartments={setRefreshDepartments}
        setDepartmentsChanged={setDepartmentsChanged}
        departmentEdit={departmentEdit}
        setDepartmentEdit={setDepartmentEdit}
        companyId={companyIdNumber}
      />
      <DeleteDepartmentModal
        token={token}
        opened={openedDeleteDepartmentModal}
        open={openDeleteDepartmentModal}
        close={closeDeleteDepartmentModal}
        setRefreshDepartments={setRefreshDepartments}
        setDepartmentsChanged={setDepartmentsChanged}
        departmentDelete={departmentDelete}
        setDepartmentDelete={setDepartmentDelete}
      />
    </div>
  );
}

export default page;
