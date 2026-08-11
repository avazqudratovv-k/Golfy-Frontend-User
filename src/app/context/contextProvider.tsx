import React, { createContext, useState } from "react";
import { User } from "../lib/types/user";

interface GlobalState {
  authMember: User | null;
  setAuthMember: (member: User | null) => void;
}

export const GlobalContext = createContext<GlobalState | undefined>(undefined);

export default function ContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authMember, setAuthMemberState] = useState<User | null>(() => {
    const stored = localStorage.getItem("userData");
    return stored ? JSON.parse(stored) : null;
  });

  const setAuthMember = (member: User | null) => {
    setAuthMemberState(member);
    if (member) localStorage.setItem("userData", JSON.stringify(member));
    else localStorage.removeItem("userData");
  };

  return (
    <GlobalContext.Provider value={{ authMember, setAuthMember }}>
      {children}
    </GlobalContext.Provider>
  );
}
