"use client";
import styles from "@/app/supervisor/dashboard/styles.module.css";
import useCheckRole from "@/app/auth/useCheckRole";
import { PageLoading } from "@/app/components/PageLoading";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import { getPlainCookie } from "@/app/auth/getPlainCookie";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Company,
  Department,
  CompanyPerson,
  // Study,
  DepartmentPerson,
} from "@/app/utils/types";
import { Accordion, Button, Loader, Text } from "@mantine/core";
import Link from "next/link";
import NavbarSupervisor from "@/app/components/NavbarSupervisor";

export default function Page() {
  const token = getPlainCookie();

  const decodedToken = getDecodedToken();
  const [userId, setUserId] = useState<string | null>(null);

  const [loadingQuery, setLoadingQuery] = useState(true);

  useEffect(() => {
    if (decodedToken) {
      setUserId(decodedToken.userId);
    }
  }, [decodedToken]);

  const [departments, setDepartments] = useState<DepartmentPerson[] | null>(null);
  const [departmentsExtracted, setDepartmentsExtracted] = useState<Department[] | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  //Fetch user's departments
  const fetchSubjects = useCallback(async () => {
    setLoadingQuery(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/department-person?personId=${userId}`,
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
        const responseData: DepartmentPerson[] = await response.json();
        console.log(responseData)
        setDepartments(responseData)
        // setSubjects(responseData);

        // Extract unique companies and departments
        const uniqueCompanies: { [key: number]: Company } = {};
        const uniqueDepartments: { [key: number]: Department } = {};

        responseData.forEach((departmentPerson) => {
          const company = departmentPerson.department.company;
          const department = departmentPerson.department;

          if (!uniqueCompanies[company.id]) {
            uniqueCompanies[company.id] = company;
          }

          if (!uniqueDepartments[department.id]) {
            uniqueDepartments[department.id] = department;
          }
        });

        setCompanies(Object.values(uniqueCompanies));
        setDepartmentsExtracted(Object.values(uniqueDepartments));
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log("Error attempting to fetch data: ", error);
    }
  }, [userId, token]);

  useEffect(() => {
    if (userId) {
      fetchSubjects();
    }
  }, [userId]);

  const departmentItems = (companyId: number) => {
    return departmentsExtracted?.filter((department) => department.company.id === companyId).map((department) => (
      // <Accordion.Item key={department.id} value={department.name}>
      //   <Accordion.Control>{department.name}</Accordion.Control>
      //   alo
      // </Accordion.Item>
      <div key={department.id}>
        <Link href={{

          pathname: "/supervisor/department",
          query: { departmentId: department.id },
        }}>
          <Button key={department.id} fullWidth className={styles.departmentLinkButtons}>


            {department.name}
          </Button>
        </Link>
      </div>
    ));
  };

  // Create faculty accordion
  const items =
  companies.length > 0 ? (
    companies.map((company) => (
      <Accordion.Item key={company.id} value={company.name}>
        <Accordion.Control>{company.name}</Accordion.Control>
        <Accordion.Panel>
          <Accordion variant="contained">{departmentItems(company.id)}</Accordion>
        </Accordion.Panel>
      </Accordion.Item>
    ))
  ) : loadingQuery ? (
    <Loader />
  ) : (
    <div>Nemate odjela</div>
  );

  const authorized = useCheckRole("ROLE_SUPERVISOR");
  if (authorized === "CHECKING") {
    return <PageLoading visible={true} />;
  }

  return (
    <div>
      <NavbarSupervisor token={token} departmentsChanged={false} />
      <div className={styles.accordionWrapper}>
        <div className={styles.accordionWidth}>
          <div className={styles.pageHeading}>
            <Text size="lg" fw={500}>
              Moji odjeli
            </Text>
          </div>
          <Accordion variant="separated" className={styles.mainAccordion}>{items}</Accordion>
        </div>
      </div>
    </div>
  );
}
