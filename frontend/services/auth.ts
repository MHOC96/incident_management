import { apiClient } from "@/lib/api";
import type { AuthTokens, StudentRegistrationPayload, User } from "@/types";

export const authService = {
  async login(email: string, password: string): Promise<AuthTokens> {
    const tokens = await apiClient.post<AuthTokens>(
      "/auth/login/",
      { email, password },
      { auth: false },
    );
    apiClient.setTokens(tokens);
    return tokens;
  },

  async register(payload: StudentRegistrationPayload): Promise<User> {
    return apiClient.post<User>("/auth/register/", payload, { auth: false });
  },

  async fetchProfile(): Promise<User> {
    return apiClient.get<User>("/auth/profile/");
  },

  getAccessToken: () => apiClient.getAccessToken(),
  clearTokens: () => apiClient.clearTokens(),
};

export const healthService = {
  check: () =>
    apiClient.get<{ status: string; service: string }>("/health/", {
      auth: false,
    }),
};
