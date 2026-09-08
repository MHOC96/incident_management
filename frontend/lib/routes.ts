import type { UserRole } from "@/types";

export const dashboardRoutes: Record<UserRole, string> = {
  STUDENT: "/student/dashboard",
  ADMIN: "/admin/dashboard",
  DEAN: "/dean/dashboard",
  OFFICIAL: "/official/dashboard",
};

export function getDashboardRoute(role: UserRole): string {
  return dashboardRoutes[role];
}

export const publicRoutes = ["/", "/incidents", "/about", "/login", "/register"];

export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
