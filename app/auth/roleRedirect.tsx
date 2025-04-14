import { useRouter } from "next/navigation";

const roleToRouteMap = {
  ROLE_ADMIN: "/admin/dashboard",
  ROLE_COMPANY_ADMIN: "/company-admin/dashboard",
  ROLE_SUPERVISOR: "/supervisor/dashboard",
  ROLE_WORKER: "/worker/dashboard",
} as const;

type Role = keyof typeof roleToRouteMap;

export const roleRedirect = (roles: Role[], router: ReturnType<typeof useRouter>) => {
  roles.some((role) => {
    const route = roleToRouteMap[role];
    if (route) {
      router.push(route);
      return true; // Stop iterating once a route is found
    }
    return false;
  });
};