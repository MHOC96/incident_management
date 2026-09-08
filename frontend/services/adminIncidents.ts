import { apiClient } from "@/lib/api";
import type {
  AdminIncidentReview,
  AdminReviewStats,
  IncidentDetail,
  PaginatedResponse,
} from "@/types";

export const adminIncidentService = {
  getReviewStats: () =>
    apiClient.get<AdminReviewStats>("/incidents/review-stats/"),

  listPendingReview: () =>
    apiClient.get<PaginatedResponse<AdminIncidentReview>>("/incidents/pending-review/"),

  getForReview: (id: number) =>
    apiClient.get<AdminIncidentReview>(`/incidents/${id}/`),

  verify: (id: number, comment?: string) =>
    apiClient.post<AdminIncidentReview>(`/incidents/${id}/verify/`, {
      comment: comment ?? "",
    }),

  reject: (id: number, comment: string) =>
    apiClient.post<AdminIncidentReview>(`/incidents/${id}/reject/`, { comment }),

  requestInfo: (id: number, comment: string) =>
    apiClient.post<AdminIncidentReview>(`/incidents/${id}/request-info/`, {
      comment,
    }),
};

export type { IncidentDetail };
