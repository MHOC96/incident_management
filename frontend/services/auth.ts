import { apiClient } from "@/lib/api";
import type { AuthTokens, LoginPayload, PasswordChangePayload, User } from "@/types";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const tokens = await apiClient.post<AuthTokens>("/auth/login/", payload, { auth: false });
    apiClient.setTokens(tokens);
    return tokens;
  },

  async fetchProfile(): Promise<User> {
    return apiClient.get<User>("/auth/profile/");
  },

  changePassword: (payload: PasswordChangePayload) =>
    apiClient.post<{ detail: string }>("/auth/change-password/", payload),

  getAccessToken: () => apiClient.getAccessToken(),
  clearTokens: () => apiClient.clearTokens(),
};

export const healthService = {
  check: () =>
    apiClient.get<{ status: string; service: string }>("/health/", {
      auth: false,
    }),
};
