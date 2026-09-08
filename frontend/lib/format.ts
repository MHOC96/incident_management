import type {
  AccountStatus,
  IncidentPriority,
  IncidentStatus,
  IncidentVisibility,
  OfficialPosition,
  UserRole,
} from "@/types";

const statusLabels: Record<IncidentStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  FORWARDED_TO_DEAN: "Forwarded to Dean",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const statusStyles: Record<IncidentStatus, string> = {
  SUBMITTED: "text-text-secondary border-border",
  UNDER_REVIEW: "text-warning border-warning/30",
  VERIFIED: "text-success border-success/30",
  REJECTED: "text-danger border-danger/30",
  FORWARDED_TO_DEAN: "text-info border-info/30",
  ASSIGNED: "text-info border-info/30",
  IN_PROGRESS: "text-info border-info/30",
  RESOLVED: "text-success border-success/30",
  CLOSED: "text-success border-success/30",
};

export function getStatusLabel(status: IncidentStatus): string {
  return statusLabels[status];
}

export function getStatusClassName(status: IncidentStatus): string {
  return statusStyles[status];
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatLocationLabel(location: {
  faculty: string;
  name: string;
  building: string;
}): string {
  const faculty = location.faculty || "Management Faculty";
  const place = location.name || location.building;
  return `${faculty} · ${place}`;
}

const priorityLabels: Record<IncidentPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const priorityStyles: Record<IncidentPriority, string> = {
  LOW: "text-text-secondary border-border",
  MEDIUM: "text-warning border-warning/30",
  HIGH: "text-info border-info/30",
  CRITICAL: "text-danger border-danger/30",
};

export function getPriorityLabel(priority: IncidentPriority): string {
  return priorityLabels[priority];
}

export function getPriorityClassName(priority: IncidentPriority): string {
  return priorityStyles[priority];
}

const visibilityLabels: Record<IncidentVisibility, string> = {
  PUBLIC: "Public",
  PRIVATE: "Private",
  RESTRICTED: "Restricted",
};

export function getVisibilityLabel(visibility: IncidentVisibility): string {
  return visibilityLabels[visibility];
}

const positionLabels: Record<OfficialPosition, string> = {
  VICE_CHANCELLOR: "Vice Chancellor",
  HOD: "Head of Department",
  MAINTENANCE_OFFICER: "Maintenance Officer",
  SECURITY_OFFICER: "Security Officer",
  OTHER: "Other",
};

export function getPositionLabel(position: OfficialPosition): string {
  return positionLabels[position];
}

const accountStatusLabels: Record<AccountStatus, string> = {
  INVITED: "Invited",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
};

const accountStatusStyles: Record<AccountStatus, string> = {
  INVITED: "text-warning border-warning/30",
  ACTIVE: "text-success border-success/30",
  INACTIVE: "text-text-secondary border-border",
  SUSPENDED: "text-danger border-danger/30",
};

export function getAccountStatusLabel(status: AccountStatus): string {
  return accountStatusLabels[status];
}

export function getAccountStatusClassName(status: AccountStatus): string {
  return accountStatusStyles[status];
}

const dashboardLabels: Record<UserRole, string> = {
  STUDENT: "My reports",
  ADMIN: "Review queue",
  DEAN: "Faculty management",
  OFFICIAL: "Assigned work",
};

export function getDashboardLabel(role: UserRole): string {
  return dashboardLabels[role];
}
