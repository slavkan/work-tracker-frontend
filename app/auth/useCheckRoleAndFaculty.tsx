import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { roleRedirect } from "./roleRedirect";
import { getDecodedToken } from "./getDecodedToken";
import { Company, CompanyPerson } from "../utils/types";
import { getPlainCookie } from "./getPlainCookie";

const useCheckRoleAndFaculty = (requiredRole: string, facultyId: string) => {
  const [authorizedFaculty, setAuthorizedFaculty] = useState("CHECKING");
  const [authorized, setAuthorized] = useState("CHECKING");
  const router = useRouter();

  const decodedToken = getDecodedToken();
  const token = getPlainCookie();
  const userId = decodedToken ? decodedToken.userId : "";

  const [faculties, setFaculties] = useState<Company[]>([]);

  //Fetch worker's faculties
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company-person?personId=${userId}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: CompanyPerson[] = await response.json();
        const extractedFaculties = data.map((item) => ({
          id: item.company.id,
          name: item.company.name,
          abbreviation: item.company.abbreviation,
        }));
        setFaculties(extractedFaculties);
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
    if (faculties.length > 0) {
      // if facultyId is inside faculties array set authorizedFaculty to "AUTHORIZED"
      if (faculties.some((faculty) => faculty.id === Number(facultyId))) {
        setAuthorizedFaculty("AUTHORIZED");
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
  }, [facultyId, faculties]);

  useEffect(() => {
    if (authorizedFaculty !== "CHECKING") {
      if (decodedToken && decodedToken.roles.includes(requiredRole)) {
        setAuthorized("AUTHORIZED");
      } else if (decodedToken) {
        roleRedirect(decodedToken.roles, router);
      } else {
        router.push("/");
      }
    }
  }, [requiredRole, router, authorizedFaculty]);

  return authorized;
};

export default useCheckRoleAndFaculty;
