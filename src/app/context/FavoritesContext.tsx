import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import i18n from "../../i18n";
import { favoriteApi } from "../services/api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface FavoritesState {
  isFav: (venueId: string) => boolean;
  // returns the new state (true = now a favourite)
  toggle: (venueId: string) => Promise<boolean | null>;
}

const FavoritesContext = createContext<FavoritesState | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    favoriteApi.ids().then((list) => setIds(new Set(list))).catch(() => {});
  }, [user]);

  const toggle = useCallback(
    async (venueId: string) => {
      const was = ids.has(venueId);
      // optimistic: flip now, undo if the server refuses
      setIds((prev) => {
        const next = new Set(prev);
        if (was) next.delete(venueId);
        else next.add(venueId);
        return next;
      });
      try {
        const res = await favoriteApi.toggle(venueId);
        return res.favorited;
      } catch {
        setIds((prev) => {
          const next = new Set(prev);
          if (was) next.add(venueId);
          else next.delete(venueId);
          return next;
        });
        toast(i18n.t("favourites.updateFailed"), { error: true });
        return null;
      }
    },
    [ids, toast]
  );

  const isFav = useCallback((venueId: string) => ids.has(venueId), [ids]);

  return <FavoritesContext.Provider value={{ isFav, toggle }}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
};
