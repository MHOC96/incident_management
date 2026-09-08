import { apiClient } from "@/lib/api";
import type {
  IncidentDetail,
  OfficialIncident,
  OfficialStats,
  PaginatedResponse,
} from "@/types";

export const officialIncidentService = {
  getStats: () => apiClient.get<OfficialStats>("/incidents/official-stats/"),

  listAssigned: () =>
    apiClient.get<PaginatedResponse<OfficialIncident>>("/incidents/assigned/"),

  getById: (id: number) => apiClient.get<OfficialIncident>(`/incidents/${id}/`),

  startProgress: (id: number, comment?: string) =>
    apiClient.post<OfficialIncident>(`/incidents/${id}/start-progress/`, {
      comment: comment ?? "",
    }),

  resolve: (id: number, comment: string) =>
    apiClient.post<OfficialIncident>(`/incidents/${id}/resolve/`, { comment }),
};

export type { IncidentDetail };
