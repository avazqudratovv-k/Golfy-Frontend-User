import { useContext } from "react";
import { GlobalContext } from "../context/contextProvider";

export const useGlobals = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobals must be used within ContextProvider");
  return context;
};