import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { favoriteApi } from "../services/api";
import { useLoader } from "../hooks/useMedia";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "../context/ToastContext";
import { Banner, EmptyState, VenueCard, VenueCardSkeleton } from "../components/ui";
import { PageHeader } from "../components/Motion";
import { Venue } from "../lib/types";

export default function FavouritesPage() {
  const { t } = useTranslation();
  const { toggle } = useFavorites();
  const toast = useToast();
  const { data, loading, error, reload } = useLoader(() => favoriteApi.mine(), []);
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    if (data) setVenues(data);
  }, [data]);

  const remove = async (venue: Venue, index: number) => {
    setVenues((list) => list.filter((v) => v._id !== venue._id));
    const result = await toggle(venue._id);
    if (result === null) {
      // the server refused: put it back
      setVenues((list) => [...list.slice(0, index), venue, ...list.slice(index)]);
      return;
    }
    toast(t("favourites.removed", { name: venue.venueName }), {
      action: {
        label: t("favourites.undo"),
        onClick: async () => {
          const back = await toggle(venue._id);
          if (back) setVenues((list) => [...list.slice(0, index), venue, ...list.slice(index)]);
        },
      },
    });
  };

  return (
    <main className="g-mainpage">
      <div className="g-wrap" style={{ display: "grid", gap: 24 }}>
        <PageHeader
          title={t("favourites.title")}
          subtitle={t("favourites.subtitle")}
          actions={
            <span className="g-num" style={{ fontWeight: 700 }} aria-live="polite">
              {loading || error ? "" : t("venues.count", { count: venues.length })}
            </span>
          }
        />

        {error && (
          <Banner title={t("favourites.loadFailed")} action={<button className="g-btn g-btn--secondary g-btn--sm" type="button" onClick={reload}>{t("common.retry")}</button>}>
            {t("bk.loadFailedText")}
          </Banner>
        )}

        {loading && (
          <div className="g-cards" aria-busy="true" aria-label={t("favourites.loadingAria")}>
            {[1, 2, 3].map((k) => <VenueCardSkeleton key={k} />)}
          </div>
        )}

        {!loading && !error && venues.length === 0 && (
          <EmptyState icon="i-heart" title={t("favourites.emptyTitle")} text={t("favourites.emptyText")}
            action={<Link className="g-btn g-btn--primary" to="/venues">{t("venue.browse")}</Link>} />
        )}

        {venues.length > 0 && (
          <div className="g-cards">
            {venues.map((v, i) => (
              <VenueCard key={v._id} venue={v} index={i} heart={
                <button className="g-heart on" type="button" aria-pressed="true" aria-label={t("heart.remove", { name: v.venueName })} onClick={() => remove(v, i)}>
                  <i className="i i-heartf" />
                </button>
              } />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
