import { apiClient } from "@/lib/api";
import type { IncidentMessage, MessageChannel, PaginatedResponse } from "@/types";

export const messageService = {
  list: (incidentId: number, channel: MessageChannel) =>
    apiClient.get<PaginatedResponse<IncidentMessage>>(
      `/incidents/${incidentId}/messages/?channel=${channel}`,
    ),

  create: (incidentId: number, content: string, channel: MessageChannel) =>
    apiClient.post<IncidentMessage>(`/incidents/${incidentId}/messages/`, {
      content,
      channel,
    }),
};
