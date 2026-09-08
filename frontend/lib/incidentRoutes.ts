import type { UserRole } from "@/types";

export function getIncidentDetailRoute(role: UserRole, incidentId: number): string {
  const routes: Record<UserRole, string> = {
    STUDENT: `/student/incidents/${incidentId}`,
    ADMIN: `/admin/incidents/${incidentId}`,
    DEAN: `/dean/incidents/${incidentId}`,
    OFFICIAL: `/official/incidents/${incidentId}`,
  };
  return routes[role];
}

export function formatRoleLabel(role: string): string {
  return role.replaceAll("_", " ");
}
