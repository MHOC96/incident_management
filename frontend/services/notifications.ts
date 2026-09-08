import { apiClient } from "@/lib/api";
import type { Notification, PaginatedResponse } from "@/types";

export const notificationService = {
  list: (unreadOnly = false) =>
    apiClient.get<PaginatedResponse<Notification>>(
      unreadOnly ? "/notifications/?unread=true" : "/notifications/",
    ),

  unreadCount: () => apiClient.get<{ count: number }>("/notifications/unread-count/"),

  markRead: (id: number) =>
    apiClient.patch<Notification>(`/notifications/${id}/`, { is_read: true }),

  markAllRead: () => apiClient.post<{ updated: number }>("/notifications/mark-all-read/"),
};
