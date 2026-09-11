"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/auth";
import type { LoginPayload, User } from "@/types";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = authService.getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const profile = await authService.fetchProfile();
      setUser(profile);
    } catch {
      authService.clearTokens();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshProfile();
      setIsLoading(false);
    })();
  }, [refreshProfile]);

  const login = useCallback(async (payload: LoginPayload) => {
    await authService.login(payload);
    const profile = await authService.fetchProfile();
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(() => {
    authService.clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      refreshProfile,
    }),
    [user, isLoading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
