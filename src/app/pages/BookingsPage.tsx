import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bookingApi } from "../services/api";
import { useLoader, useOnline } from "../hooks/useMedia";
import { useToast } from "../context/ToastContext";
import { BookingStatus } from "../lib/enums";
import { apiError, formatDay, money, photoStyle, slotEnded } from "../lib/format";
import { PageHeader } from "../components/Motion";
import { Banner, ConfirmDialog, EmptyState, Pagination, StatusBadge, statusLabel } from "../components/ui";
import { Booking } from "../lib/types";

const TABS = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.FINISHED, BookingStatus.CANCELLED];
const PER_PAGE = 10;

const EMPTY: Record<BookingStatus, { icon: string; title: string; text: string; cta: boolean }> = {
  [BookingStatus.PENDING]: { icon: "i-clock", title: "No pending bookings", text: "Bookings you have not paid for yet show here.", cta: true },
  [BookingStatus.CONFIRMED]: { icon: "i-cal", title: "No confirmed bookings", text: "Once you pay for a booking, it shows here.", cta: true },
  [BookingStatus.FINISHED]: { icon: "i-flag", title: "No finished rounds yet", text: "After you play, your bookings move here and you can review them.", cta: true },
  [BookingStatus.CANCELLED]: { icon: "i-slash", title: "No cancelled bookings", text: "Nothing cancelled. Nice.", cta: false },
};

export default function BookingsPage() {
  const toast = useToast();
  const online = useOnline();
  const { data, setData, loading, error, reload } = useLoader(() => bookingApi.mine(), []);
  const [tab, setTab] = useState<BookingStatus>(BookingStatus.PENDING);
  const [page, setPage] = useState(1);
  const [asking, setAsking] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);

  const all = data ?? [];
  // land on the first tab that has something in it (once, when the list first arrives)
  const [picked, setPicked] = useState(false);
  useEffect(() => {
    if (!data || picked) return;
    setPicked(true);
    const first = TABS.find((s) => data.some((b) => b.status === s));
    if (first) setTab(first);
  }, [data, picked]);

  const change = async (b: Booking, status: BookingStatus, message: string) => {
    setBusy(true);
    try {
      const updated = await bookingApi.setStatus(b._id, status);
      setData(all.map((x) => (x._id === b._id ? { ...x, ...updated, venueData: x.venueData, reviewed: x.reviewed } : x)));
      toast(message);
    } catch (err) {
      const { status: code, message: text } = apiError(err);
      toast(code === 409 ? text : text || "We could not update this booking. Please try again.", { error: true });
    } finally {
      setBusy(false);
      setAsking(null);
    }
  };

  const mine = all.filter((b) => b.status === tab);
  const pageCount = Math.max(1, Math.ceil(mine.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const from = (current - 1) * PER_PAGE;
  const shown = mine.slice(from, from + PER_PAGE);
  const empty = EMPTY[tab];

  return (
    <main className="g-mainpage">
      <div className="g-wrap" style={{ maxWidth: 860, display: "grid", gap: 24 }}>
        <PageHeader title="My bookings" subtitle="Upcoming rounds, past games and anything waiting for payment." />

        {!online && (
          <Banner info icon="i-wifi" title="You're offline">You can look at your bookings, but changes will not save until you're back.</Banner>
        )}

        <div className="g-tabs" role="tablist" aria-label="Bookings by status">
          {TABS.map((s) => (
            <button key={s} className="g-tab" type="button" role="tab" aria-selected={tab === s} onClick={() => { setTab(s); setPage(1); }}>
              {statusLabel(s)}<span className="g-count">{all.filter((b) => b.status === s).length}</span>
            </button>
          ))}
        </div>

        {error && (
          <Banner title="We could not load your bookings" action={<button className="g-btn g-btn--secondary g-btn--sm" type="button" onClick={reload}>Try again</button>}>
            Something went wrong on our side. Please try again.
          </Banner>
        )}

        {loading && (
          <div aria-busy="true" aria-label="Loading bookings" style={{ display: "grid", gap: 16 }}>
            {[1, 2, 3].map((k) => (
              <div className="g-card g-booking" key={k}>
                <div className="g-skel" style={{ flex: "0 0 132px", minHeight: 132, borderRadius: 0 }} />
                <div className="g-card-body">
                  <div className="g-skel" style={{ height: 20, width: "55%" }} />
                  <div className="g-skel" style={{ height: 14, width: "40%" }} />
                  <div className="g-skel" style={{ height: 20, width: 90 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && mine.length === 0 && (
          <EmptyState icon={empty.icon} title={empty.title} text={empty.text}
            action={empty.cta ? <Link className="g-btn g-btn--primary" to="/venues">Find a venue</Link> : undefined} />
        )}

        {!loading && !error && mine.length > 0 && (
          <>
            <div style={{ display: "grid", gap: 16 }} role="tabpanel">
              {shown.map((b) => {
                const venue = b.venueData?.[0];
                const ended = slotEnded(b.bookingDate, b.endTime);
                const confirmedAndPlayed = b.status === BookingStatus.CONFIRMED && ended;
                const canReview = !b.reviewed && (confirmedAndPlayed || b.status === BookingStatus.FINISHED);
                return (
                  <article className="g-card g-booking" key={b._id}>
                    <div className={`g-photo${venue?.venueImages?.[0] ? " has-img" : ""}`} style={photoStyle(venue?.venueImages?.[0])} role="img" aria-label={`Photo of ${venue?.venueName ?? "venue"}`} />
                    <div className="g-card-body">
                      <div className="g-between">
                        <h3><Link to={`/venues/${b.venueId}`} style={{ color: "inherit", textDecoration: "none" }}>{venue?.venueName ?? "Venue"}</Link></h3>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="g-row g-num" style={{ gap: 16 }}>
                        <span className="g-meta"><i className="i i-cal" />{formatDay(b.bookingDate)}</span>
                        <span className="g-meta"><i className="i i-clock" />{b.startTime} - {b.endTime}</span>
                      </div>
                      <div className="g-between">
                        <span className="g-price">{money(b.price)}</span>
                        <div className="g-row" style={{ gap: 8 }}>
                          {(b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED) && (
                            <button className="g-btn g-btn--ghost g-btn--sm" type="button" onClick={() => setAsking(b)}>Cancel</button>
                          )}
                          {b.status === BookingStatus.PENDING && (
                            <Link className="g-btn g-btn--accent g-btn--sm" to={`/checkout/${b._id}`}>Pay now</Link>
                          )}
                          {confirmedAndPlayed && (
                            <button className="g-btn g-btn--secondary g-btn--sm" type="button" disabled={busy}
                              onClick={() => change(b, BookingStatus.FINISHED, "Marked as finished.")}>Mark finished</button>
                          )}
                          {canReview && <Link className="g-btn g-btn--primary g-btn--sm" to={`/review/${b._id}`}>Leave a review</Link>}
                          {b.reviewed && <span className="g-meta"><i className="i i-check" />Reviewed</span>}
                          {b.status === BookingStatus.CONFIRMED && !ended && <span className="g-hint">Review opens after you play</span>}
                          {b.status === BookingStatus.CONFIRMED && (
                            <Link className="g-btn g-btn--ghost g-btn--sm" to={`/confirmation/${b._id}`}>Receipt</Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <Pagination page={current} pageCount={pageCount} label="Booking pages" onPage={setPage}
              summary={`Showing ${from + 1}-${from + shown.length} of ${mine.length} bookings`} />
          </>
        )}
      </div>

      {asking && (
        <ConfirmDialog title="Cancel this booking?" confirmLabel="Cancel booking" cancelLabel="Keep booking" busy={busy}
          text={`${asking.venueData?.[0]?.venueName}, ${formatDay(asking.bookingDate)}, ${asking.startTime} - ${asking.endTime}. The slot will be released for other players.`}
          onConfirm={() => change(asking, BookingStatus.CANCELLED, "Booking cancelled.")} onClose={() => setAsking(null)} />
      )}
    </main>
  );
}

