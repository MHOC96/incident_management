import { apiClient } from "@/lib/api";
import type { IncidentMessage, PaginatedResponse } from "@/types";

export const messageService = {
  list: (incidentId: number) =>
    apiClient.get<PaginatedResponse<IncidentMessage>>(
      `/incidents/${incidentId}/messages/`,
    ),

  create: (incidentId: number, content: string, isInternal = false) =>
    apiClient.post<IncidentMessage>(`/incidents/${incidentId}/messages/`, {
      content,
      is_internal: isInternal,
    }),
};
