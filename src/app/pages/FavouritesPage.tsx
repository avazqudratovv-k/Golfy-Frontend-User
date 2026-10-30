import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { favoriteApi } from "../services/api";
import { useLoader } from "../hooks/useMedia";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "../context/ToastContext";
import { Banner, EmptyState, VenueCard, VenueCardSkeleton } from "../components/ui";
import { PageHeader } from "../components/Motion";
import { Venue } from "../lib/types";

export default function FavouritesPage() {
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
    toast(`${venue.venueName} removed from favourites.`, {
      action: {
        label: "Undo",
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
          variant="hearts"
          title="Favourites"
          subtitle="Venues you saved for next time."
          actions={
            <span className="g-num" style={{ fontWeight: 700 }} aria-live="polite">
              {loading || error ? "" : venues.length === 1 ? "1 venue" : `${venues.length} venues`}
            </span>
          }
        />

        {error && (
          <Banner title="We could not load your favourites" action={<button className="g-btn g-btn--secondary g-btn--sm" type="button" onClick={reload}>Try again</button>}>
            Something went wrong on our side. Please try again.
          </Banner>
        )}

        {loading && (
          <div className="g-cards" aria-busy="true" aria-label="Loading favourites">
            {[1, 2, 3].map((k) => <VenueCardSkeleton key={k} />)}
          </div>
        )}

        {!loading && !error && venues.length === 0 && (
          <EmptyState icon="i-heart" title="No favourites yet" text="Tap the heart on a venue to save it here for next time."
            action={<Link className="g-btn g-btn--primary" to="/venues">Browse venues</Link>} />
        )}

        {venues.length > 0 && (
          <div className="g-cards">
            {venues.map((v, i) => (
              <VenueCard key={v._id} venue={v} index={i} heart={
                <button className="g-heart on" type="button" aria-pressed="true" aria-label={`Remove ${v.venueName} from favourites`} onClick={() => remove(v, i)}>
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
