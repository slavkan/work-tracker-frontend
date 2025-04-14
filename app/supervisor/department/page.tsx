"use client";
import { PageLoading } from "@/app/components/PageLoading";
import { Button, ScrollArea, Table, Tooltip, Text, Loader } from "@mantine/core";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import { WorkShift, Department } from "@/app/utils/types";
import { useDisclosure } from "@mantine/hooks";
import { getPlainCookie } from "@/app/auth/getPlainCookie";
import { useSearchParams } from "next/navigation";
import NavbarWorker from "@/app/components/NavbarCompanyAdmin";
import AddStudyModal from "@/app/components/CompanyAdminComponents/AddDepartmentModal";
import EditStudyModal from "@/app/components/CompanyAdminComponents/EditDepartmentModal";
import DeleteStudyModal from "@/app/components/CompanyAdminComponents/DeleteDepartmentModal";
import useCheckRoleAndDepartment from "@/app/auth/useCheckRoleAndDepartment";
import NavbarSupervisor from "@/app/components/NavbarSupervisor";
import {
  usePrintDate,
  usePrintTime,
  usePrintDateTime,
} from "@/app/utils/usePrintDateTime";
import StartWorkShiftModal from "@/app/components/professorComponents/StartWorkShiftModal";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import Link from "next/link";
import ViewWorkShiftionModal from "@/app/components/professorComponents/ViewWorkShiftModal";

function page() {
  const token = getPlainCookie();

  const searchParams = useSearchParams();
  const departmentId = searchParams?.get("departmentId") ?? "";
  const departmentIdNumber = parseInt(departmentId);
  const { authorized, departmentName } = useCheckRoleAndDepartment(
    "ROLE_SUPERVISOR",
    departmentId
  );

  const decodedToken = getDecodedToken();
  const userId = decodedToken ? decodedToken.userId : "";

  const [loadingQuery, setLoadingQuery] = useState(true);

  const [response, setResponse] = useState<WorkShift[] | null>(null);
  // const [classSessions, setClassSessions] = useState<Department[]>([]);
  const [departmentEdit, setDepartmentEdit] = useState<Department | null>(null);
  const [viewWorkShiftId, setViewWorkShiftId] = useState("0");

  const [elements, setElements] = useState<any[]>([]);

  const [refreshDepartments, setRefreshDepartments] = useState<boolean>(false);
  const [departmentsChanged, setDepartmentsChanged] = useState<boolean>(false);

  const [
    openedStartNewWorkShiftModal,
    {
      open: openStartNewWorkShiftModal,
      close: closeStartNewWorkShiftModal,
    },
  ] = useDisclosure(false);
  const [
    openedEditDepartentModal,
    { open: openEditDepartentModal, close: closeEditDepartentModal },
  ] = useDisclosure(false);
  const [
    openedViewWorkShiftModal,
    { open: openViewWorkShiftModal, close: closeViewWorkShiftModal },
  ] = useDisclosure(false);

  useEffect(() => {
    setRefreshDepartments(false);
    if (authorized === "AUTHORIZED" || refreshDepartments) {
      fetchData();
    }
  }, [authorized, refreshDepartments]);

  //Fetch work shifts for department
  const fetchData = useCallback(async () => {
    setLoadingQuery(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-shifts?departmentId=${departmentId}`,
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
  }, [setRefreshDepartments, departmentId]);

  useEffect(() => {
    if (response) {
      const transformedElements = response
        .map((workShift) => ({
          id: workShift.id,  // Fixed: Added property name 'id'
          startTime: workShift.startTime,
          endTime: workShift.endTime,
          status:
            workShift.state === "IN_PROGRESS"
              ? "U tijeku"
              : workShift.state === "PAUSED"
                ? "Pauzirano"
                : "Završeno",
        }))
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      setElements(transformedElements);
    }
  }, [response]);

  // function to trigger openEditStudyModal and set personEdit
  // const handleContinueClassSession = (study: Study) => {
  //   setStudyEdit(study);
  // };

  useEffect(() => {
    if (departmentEdit) {
      openEditDepartentModal();
    }
  }, [departmentEdit]);

  // function to trigger openDeleteCompanyModal and set personEdit
  const handleViewWorkShift = (workShiftId: string) => {
    setViewWorkShiftId(workShiftId);
  };

  useEffect(() => {
    if (viewWorkShiftId !== "0") {
      console.log("viewWorkShiftId", viewWorkShiftId);
      openViewWorkShiftModal();
    }
  }, [viewWorkShiftId]);

  const rows = elements.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td className={styles.column}>
        {usePrintDate(element.startTime)}{" "}
        <b>{usePrintTime(element.startTime)}</b>
      </Table.Td>
      <Table.Td className={styles.column}>
        {usePrintDate(element.endTime)} <b>{usePrintTime(element.endTime)}</b>
      </Table.Td>
      <Table.Td className={styles.column}>{element.status}</Table.Td>
      <Table.Td className={styles.column}>
        <div className={styles.crudButtonsContainer}>
          {element.status !== "Završeno" && (
            <Tooltip label="Nastavi smjenu">
              <Link
                href={{
                  pathname: "/supervisor/session",
                  query: { sessionId: element.id, departmentId: departmentId },
                }}
              >
                <Button color="blue">
                  <Image
                    src="/assets/svgs/play.svg"
                    alt="Edit"
                    width={24}
                    height={24}
                  ></Image>
                </Button>
              </Link>
            </Tooltip>
          )}

          <Tooltip label="Pregled smjene">
            <Button
              color="green"
              onClick={() => handleViewWorkShift(element.id)}
            >
              <Image
                src="/assets/svgs/eye.svg"
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
      <NavbarSupervisor token={token} departmentsChanged={departmentsChanged} />
      {/* <Text size="xl" ta="center" mb={20}>
        {subjectName} - Sve smjene
      </Text> */}
      <div className={styles.mainDiv}>
        <div className={styles.pageContent}>
          <div className={styles.pageHeading}>
            <Text size="lg" fw={500}>
              Sve smjene
            </Text>
            <Text style={{ lineHeight: "100%", marginTop: "7px" }}>
              {departmentName}
            </Text>
          </div>
          <div className={styles.addAndFilterBtnContainer}>
            <Tooltip label="Pokreni novu smjenu">
              <Button onClick={openStartNewWorkShiftModal}>
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
                  <Table.Th className={styles.column}>Start</Table.Th>
                  <Table.Th className={styles.column}>End</Table.Th>
                  <Table.Th className={styles.column}>Status</Table.Th>
                  <Table.Th className={styles.column}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {loadingQuery ? (
                  <Table.Tr>
                    <Table.Td colSpan={4} style={{ textAlign: 'center' }}>
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

      <StartWorkShiftModal
        token={token}
        opened={openedStartNewWorkShiftModal}
        open={openStartNewWorkShiftModal}
        close={closeStartNewWorkShiftModal}
        creatorRole="ROLE_SUPERVISOR"
        departmentId={departmentId}
        supervisorId={userId}
      />
      <ViewWorkShiftionModal
        token={token}
        opened={openedViewWorkShiftModal}
        open={openViewWorkShiftModal}
        close={closeViewWorkShiftModal}
        creatorRole="ROLE_SUPERVISOR"
        workShiftId={viewWorkShiftId}
        setWorkShiftId={setViewWorkShiftId}
      />
    </div>
  );
}

export default page;
