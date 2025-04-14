"use client";
import useCheckRole from "@/app/auth/useCheckRole";
import { PageLoading } from "@/app/components/PageLoading";
import NavbarCompanyAdmin from "@/app/components/NavbarCompanyAdmin";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import { getPlainCookie } from "@/app/auth/getPlainCookie";

export default function Page() {
  const authorized = useCheckRole("ROLE_COMPANY_ADMIN");
  if (authorized === "CHECKING") {
    return <PageLoading visible={true} />;
  }

  const token = getPlainCookie();

  return (
    <div>
      <NavbarCompanyAdmin 
        token={token}
        studiesChanged={false}
      />
      <div></div>
    </div>
  );
}
