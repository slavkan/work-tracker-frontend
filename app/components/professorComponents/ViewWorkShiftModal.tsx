import React, { useCallback, useEffect, useState } from "react";
import { Modal, Text, Table, ScrollArea } from "@mantine/core";
// import styles from "@/app/components/adminComponents/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { WorkAttendance, WorkShift } from "@/app/utils/types";
import { usePrintDate, usePrintTime } from "@/app/utils/usePrintDateTime";
import styles from "@/app/components/professorComponents/ViewClassSession.module.css";

interface ViewWorkShiftModalProps {
  token: string | undefined;
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  workShiftId: string;
  setWorkShiftId: (value: string) => void;
}

export default function ViewWorkShiftionModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  workShiftId,
  setWorkShiftId,
}: ViewWorkShiftModalProps) {
  const [workShift, setWorkShift] = useState<WorkShift>();
  const [workAttendance, setWorkAttendance] = useState<WorkAttendance[]>();
  const [elements, setElements] = useState<any[]>([]);

  const handleClose = () => {
    setWorkShiftId("0");
    close();
  };

  //Fetch Session info
  const fetchData = useCallback(async () => {
    if (workShiftId === "0") {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-shifts/${workShiftId}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const responseData: WorkShift = await response.json();
        setWorkShift(responseData);
        console.log(responseData);
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log("Error attempting to fetch data: ", error);
    }
  }, [workShiftId]);

  //Fetch attendance
  const fetchDataA = useCallback(async () => {
    if (workShiftId === "0") {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-attendance/${workShiftId}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const responseData: WorkAttendance[] = await response.json();
        console.log(responseData);
        setWorkAttendance(responseData);
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log("Error attempting to fetch data: ", error);
    }
  }, [workShiftId]);

  useEffect(() => {
    if (workShiftId !== "0") {
      fetchData();
      fetchDataA();
    }
  }, [workShiftId]);

  useEffect(() => {
    if (workAttendance) {
      const transformedElements = workAttendance
        .map((workAttendance) => ({
          id: workAttendance.id,
          arrivalTime: workAttendance.arrivalTime,
          departureTime: workAttendance.departureTime,
          person: {
            id: workAttendance.person.id,
            firstName: workAttendance.person.firstName,
            lastName: workAttendance.person.lastName,
            indexNumber: workAttendance.person.phone,
          },
        }))
        .sort((a, b) => {
          const dateA = new Date(a.departureTime || a.arrivalTime).getTime();
          const dateB = new Date(b.departureTime || b.arrivalTime).getTime();
          return dateB - dateA;
        });
      setElements(transformedElements);
    }
  }, [workAttendance]);

  const rows = elements.map((element) => (
    <Table.Tr key={element.id}>
      {/* <Table.Td className={styles.column}>
        {usePrintDate(element.endTIme)} <b>{usePrintTime(element.endTIme)}</b>
      </Table.Td> */}
      <Table.Td className={styles.column}>
        {element.person.firstName} {element.person.lastName}
      </Table.Td>
      <Table.Td className={styles.columnSmall}>
        {element.person.indexNumber}
      </Table.Td>
      <Table.Td className={styles.columnSmall}>
        {/* {usePrintDate(element.arrivalTime)}{" "} */}
        <b>{usePrintTime(element.arrivalTime)}</b>
      </Table.Td>
      <Table.Td className={styles.columnSmall}>
        {/* {usePrintDate(element.departureTime)}{" "} */}
        <b>{usePrintTime(element.departureTime)}</b>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="Pregled smjene" size="80%">
        <div className={styles.viewClassSessionHeader}>
          <div>
          <Text size="xl" fw={500}>{workShift?.department.name}</Text>
          <Text size="xl" fw={500}>Voditelj smjene: {workShift?.person.firstName} {workShift?.person.lastName}</Text>
          </div>
          <div>
          <Text size="xl" style={{ textAlign: "right" }}>Početak smjene: {usePrintDate(workShift?.startTime)}{" "} <span style={{ fontWeight: 500 }}> {usePrintTime(workShift?.startTime)}</span></Text>
          <Text size="xl" style={{ textAlign: "right" }}>Završetak smjene: {usePrintDate(workShift?.endTime)}{" "} <span style={{ fontWeight: 500 }}> {usePrintTime(workShift?.endTime)}</span></Text>
          </div>
        </div>
        <ScrollArea className={styles.borderColor}>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className={styles.column}>Ime</Table.Th>
                <Table.Th className={styles.columnSmall}>Email</Table.Th>
                <Table.Th className={styles.columnSmall}>
                  Vrijeme dolaska
                </Table.Th>
                <Table.Th className={styles.columnSmall}>
                  Vrijeme odlaska
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </ScrollArea>
      </Modal>
    </>
  );
}
