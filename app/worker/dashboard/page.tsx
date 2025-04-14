"use client";
import useCheckRole from "@/app/auth/useCheckRole";
import { PageLoading } from "@/app/components/PageLoading";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import { getPlainCookie } from "@/app/auth/getPlainCookie";
import NavbarStudent from "@/app/components/NavbarWorker";

export default function Page() {
  const authorized = useCheckRole("ROLE_WORKER");
  if (authorized === "CHECKING") {
    return <PageLoading visible={true} />;
  }

  const token = getPlainCookie();

  return (
    <div>
      <NavbarStudent 
        token={token}
        studiesChanged={false}
      />
      <div></div>
    </div>
  );
}
