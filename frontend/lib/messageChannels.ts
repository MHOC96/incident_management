import type { IncidentStatus, MessageChannel, UserRole } from "@/types";

export const MESSAGE_CHANNEL_LABELS: Record<MessageChannel, string> = {
  STUDENT_ADMIN: "Student & Admin",
  STUDENT_DEAN: "Student & Dean",
  STUDENT_OFFICIAL: "Student & Officer",
  STAFF_INTERNAL: "Staff notes",
};

const POST_VERIFICATION_STATUSES: IncidentStatus[] = [
  "VERIFIED",
  "FORWARDED_TO_DEAN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const ASSIGNED_STATUSES: IncidentStatus[] = [
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

export function unlockedChannelsForIncident(
  incidentStatus: IncidentStatus,
  hasAssignedOfficial: boolean,
): MessageChannel[] {
  const channels: MessageChannel[] = ["STUDENT_ADMIN"];

  if (POST_VERIFICATION_STATUSES.includes(incidentStatus)) {
    channels.push("STUDENT_DEAN");
  }

  if (ASSIGNED_STATUSES.includes(incidentStatus) && hasAssignedOfficial) {
    channels.push("STUDENT_OFFICIAL");
  }

  return channels;
}

export function getVisibleChannels(
  role: UserRole,
  incidentStatus: IncidentStatus,
  hasAssignedOfficial: boolean,
): MessageChannel[] {
  const unlocked = unlockedChannelsForIncident(incidentStatus, hasAssignedOfficial);

  if (role === "STUDENT") {
    return unlocked;
  }

  if (role === "ADMIN") {
    return unlocked.includes("STUDENT_ADMIN") ? ["STUDENT_ADMIN"] : [];
  }

  if (role === "DEAN") {
    return unlocked;
  }

  if (role === "OFFICIAL") {
    return unlocked.filter(
      (channel) => channel === "STUDENT_DEAN" || channel === "STUDENT_OFFICIAL",
    );
  }

  return [];
}

export function getDefaultChannel(
  role: UserRole,
  incidentStatus: IncidentStatus,
  hasAssignedOfficial: boolean,
): MessageChannel {
  const channels = getVisibleChannels(role, incidentStatus, hasAssignedOfficial);
  if (channels.length === 0) {
    return "STUDENT_ADMIN";
  }

  if (role === "STUDENT") {
    if (channels.includes("STUDENT_OFFICIAL")) {
      return "STUDENT_OFFICIAL";
    }
    if (channels.includes("STUDENT_DEAN")) {
      return "STUDENT_DEAN";
    }
  }

  if (role === "DEAN") {
    if (channels.includes("STUDENT_ADMIN")) {
      return "STUDENT_ADMIN";
    }
    if (channels.includes("STUDENT_DEAN")) {
      return "STUDENT_DEAN";
    }
  }

  if (role === "OFFICIAL") {
    if (channels.includes("STUDENT_OFFICIAL")) {
      return "STUDENT_OFFICIAL";
    }
  }

  return channels[0];
}

export function canWriteChannel(
  role: UserRole,
  channel: MessageChannel,
  incidentStatus: IncidentStatus,
  hasAssignedOfficial: boolean,
): boolean {
  const visible = getVisibleChannels(role, incidentStatus, hasAssignedOfficial);
  return visible.includes(channel);
}

export function getChannelHelperText(
  channel: MessageChannel,
  role: UserRole,
  incidentStatus: IncidentStatus,
): string {
  if (channel === "STUDENT_ADMIN") {
    if (role === "ADMIN") {
      return "Communicate with the reporting student. The dean can also follow this channel.";
    }
    if (role === "DEAN") {
      return "Follow up with the student and admin office on this report.";
    }
    return "Communicate with the admin office while your report is reviewed.";
  }

  if (channel === "STUDENT_DEAN") {
    if (role === "OFFICIAL") {
      return "Coordinate with the student and dean on this incident.";
    }
    return "Communicate with the dean after admin verification.";
  }

  if (channel === "STUDENT_OFFICIAL") {
    if (role === "DEAN") {
      return "Follow progress between the student and assigned officer.";
    }
    if (!ASSIGNED_STATUSES.includes(incidentStatus)) {
      return "This channel opens once a responsible officer is assigned.";
    }
    return "Communicate with the assigned officer handling your report.";
  }

  return "";
}
