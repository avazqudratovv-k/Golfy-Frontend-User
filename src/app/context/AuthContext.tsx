import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User } from "../lib/types";
import { authApi } from "../services/api";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const readStored = (): User | null => {
  try {
    const raw = localStorage.getItem("userData");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(readStored);

  const setUser = useCallback((next: User | null) => {
    setUserState(next);
    if (next) localStorage.setItem("userData", JSON.stringify(next));
    else localStorage.removeItem("userData");
  }, []);

  // a stored user may outlive the cookie: check the session quietly once on load
  useEffect(() => {
    if (!readStored()) return;
    authApi.profile({ silent: true }).then(setUser).catch((err) => {
      if (err?.response?.status === 401 || err?.response?.status === 403 || err?.response?.status === 404) setUser(null);
    });
  }, [setUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, [setUser]);

  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
