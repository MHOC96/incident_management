import { apiClient } from "@/lib/api";
import type { OfficialAccount, OfficialCreatePayload } from "@/types";

export const officialService = {
  list: () => apiClient.get<OfficialAccount[]>("/officials/"),

  listActive: async () => {
    const officials = await apiClient.get<OfficialAccount[]>("/officials/");
    return officials.filter((official) => official.status === "ACTIVE");
  },

  create: (payload: OfficialCreatePayload) =>
    apiClient.post<OfficialAccount>("/officials/", payload),

  updateStatus: (id: number, status: "ACTIVE" | "INACTIVE") =>
    apiClient.patch<OfficialAccount>(`/officials/${id}/`, { status }),

  activate: (token: string, password: string, password_confirm: string) =>
    apiClient.post<OfficialAccount>(
      "/auth/activate/",
      { token, password, password_confirm },
      { auth: false },
    ),
};
