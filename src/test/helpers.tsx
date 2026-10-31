import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../app/context/AuthContext";
import { FavoritesProvider } from "../app/context/FavoritesContext";
import { ToastProvider } from "../app/context/ToastContext";
import { setLanguage } from "../i18n";

/** every provider the pages expect, with a router starting at `route` */
export function Providers({ route = "/", children }: { route?: string; children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>{children}</FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

export const useEnglish = () => setLanguage("en");
export const useKorean = () => setLanguage("ko");

export const signedInUser = { _id: "u1", name: "Kim Minjun", email: "m@seed.golfy.dev", phone: "010", role: "USER", status: "ACTIVE" };
