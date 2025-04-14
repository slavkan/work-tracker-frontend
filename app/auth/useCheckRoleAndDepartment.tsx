import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { roleRedirect } from "./roleRedirect";
import { getDecodedToken } from "./getDecodedToken";
import { Department, DepartmentPerson } from "../utils/types";
import { getPlainCookie } from "./getPlainCookie";

const useCheckRoleAndDepartment = (requiredRole: string, departmentId: string) => {
  const [authorizedDepartment, setAuthorizedDepartment] = useState("CHECKING");
  const [authorized, setAuthorized] = useState("CHECKING");
  const [departmentName, setDepartmentName] = useState("");
  const router = useRouter();

  const decodedToken = getDecodedToken();
  const token = getPlainCookie();
  const userId = decodedToken ? decodedToken.userId : "";

  const [departmentPerson, setDepartmentPerson] = useState<DepartmentPerson[]>([]);

  //Fetch worker's departmentPerson
  const fetchData = useCallback(async () => {
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

      if (response.ok) {
        const data: DepartmentPerson[] = await response.json();
        console.log(data);
        const extractedDepartmentPerson = data.map((item) => ({
          id: item.id,
          department: item.department,
          person: item.person,
        }));
        setDepartmentPerson(extractedDepartmentPerson);
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log("Error attempting to fetch data: ", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  useEffect(() => {
    if (departmentPerson.length > 0) {
      // if departmentId is inside departments array set authorizedSubject to "AUTHORIZED"
      const foundDepartmentPerson = departmentPerson.find(
        (departmentPersonItem) => departmentPersonItem.department.id === Number(departmentId)
      );
      if (foundDepartmentPerson) {
        setDepartmentName(foundDepartmentPerson.department.name);
        setAuthorizedDepartment("AUTHORIZED");
      } else {
        if (requiredRole === "ROLE_ADMIN") {
          router.push("/admin/dashboard");
        } else if (requiredRole === "ROLE_COMPANY_ADMIN") {
          router.push("/company-admin/dashboard");
        } else if (requiredRole === "ROLE_SUPERVISOR") {
          router.push("/supervisor/dashboard");
        } else if (requiredRole === "ROLE_WORKER") {
          router.push("/worker/dashboard");
        } else {
          router.push("/");
        }
      }
    }
  }, [departmentId, departmentPerson]);

  useEffect(() => {
    if (authorizedDepartment !== "CHECKING") {
      if (decodedToken && decodedToken.roles.includes(requiredRole)) {
        setAuthorized("AUTHORIZED");
      } else if (decodedToken) {
        roleRedirect(decodedToken.roles, router);
      } else {
        router.push("/");
      }
    }
  }, [requiredRole, router, authorizedDepartment]);

  return { authorized, departmentName };
};

export default useCheckRoleAndDepartment;
