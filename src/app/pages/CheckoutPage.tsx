import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { bookingApi } from "../services/api";
import { useLoader } from "../hooks/useMedia";
import { BookingStatus } from "../lib/enums";
import { HOLD_MINUTES } from "../lib/config";
import { apiError, formatDay, hoursBetween, money, photoStyle } from "../lib/format";
import { Banner, ConfirmDialog, EmptyState, StatusBadge } from "../components/ui";

const timeLeft = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export default function CheckoutPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: booking, setData, loading, error, reload } = useLoader(() => bookingApi.one(id), [id]);

  const [now, setNow] = useState(Date.now());
  const [paying, setPaying] = useState(false);
  const [asking, setAsking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [problem, setProblem] = useState<{ title: string; text: string } | null>(null);

  const status = booking?.status;
  useEffect(() => {
    if (status !== BookingStatus.PENDING) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [status]);

  if (loading) {
    return (
      <main className="g-mainpage"><div className="g-wrap" style={{ maxWidth: 760, display: "grid", gap: 16 }} aria-busy="true">
        <div className="g-skel" style={{ height: 40, width: "40%" }} />
        <div className="g-skel" style={{ height: 120 }} />
        <div className="g-skel" style={{ height: 260 }} />
      </div></main>
    );
  }
  if (error || !booking) {
    const missing = apiError(error).status === 404;
    return (
      <main className="g-mainpage"><div className="g-wrap" style={{ maxWidth: 760 }}>
        <EmptyState icon="i-ticket" title={missing ? "Booking not found" : "We could not load your booking"}
          text={missing ? "It may belong to another account, or the link is wrong." : "Something went wrong on our side. Please try again."}
          action={<div className="g-row"><Link className="g-btn g-btn--primary" to="/bookings">My bookings</Link>{!missing && <button className="g-btn g-btn--secondary" type="button" onClick={reload}>Try again</button>}</div>} />
      </div></main>
    );
  }

  const venue = booking.venueData?.[0];
  const hours = hoursBetween(booking.startTime, booking.endTime);
  const range = `${booking.startTime} - ${booking.endTime}`;
  const day = formatDay(booking.bookingDate);
  const endsAt = new Date(booking.createdAt).getTime() + HOLD_MINUTES * 60000;
  const left = endsAt - now;
  const expired = booking.status === BookingStatus.PENDING && left <= 0;
  const isPending = booking.status === BookingStatus.PENDING && !expired;
  const done = booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.FINISHED;

  const pay = async () => {
    setPaying(true);
    setProblem(null);
    try {
      // there is no card step in this demo: "paying" confirms the booking
      await new Promise((r) => setTimeout(r, 800));
      const updated = await bookingApi.setStatus(booking._id, BookingStatus.CONFIRMED);
      setData({ ...booking, ...updated });
      navigate(`/confirmation/${booking._id}`, { replace: true });
    } catch (err) {
      const { status: code, message } = apiError(err);
      setProblem(
        code === 409
          ? { title: "That time is taken", text: message }
          : { title: "We could not complete your booking", text: message || "Something went wrong on our side. Please try again." }
      );
    } finally {
      setPaying(false);
    }
  };

  const cancel = async () => {
    setCancelling(true);
    try {
      const updated = await bookingApi.setStatus(booking._id, BookingStatus.CANCELLED);
      setData({ ...booking, ...updated });
      setAsking(false);
    } catch (err) {
      setAsking(false);
      setProblem({ title: "We could not cancel this booking", text: apiError(err).message || "Please try again." });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <main className="g-mainpage">
      <div className="g-wrap" style={{ maxWidth: 760, display: "grid", gap: 24 }}>
        {isPending && (
          <>
            <div className="g-between">
              <h1 className="g-h1">Checkout</h1>
              <span className={`g-badge g-badge--pending g-num${left < 5 * 60000 ? " g-urgent" : ""}`} style={{ height: 32, fontSize: 14 }} role="timer" aria-label={`Time left to pay: ${timeLeft(left)}`}>
                <i className="i i-clock" />Held for {timeLeft(left)}
              </span>
            </div>
            <Banner info icon="i-clock" title={`Your slot is held for ${HOLD_MINUTES} minutes`}>
              Your booking is pending. Pay before the timer ends, or the slot is released for other players.
            </Banner>
            {problem && <Banner title={problem.title}>{problem.text}</Banner>}
            <div className="g-card g-booking">
              <div className={`g-photo${venue?.venueImages?.[0] ? " has-img" : ""}`} style={photoStyle(venue?.venueImages?.[0])} role="img" aria-label={`Photo of ${venue?.venueName}`} />
              <div className="g-card-body">
                <div className="g-between"><h3>{venue?.venueName}</h3><StatusBadge status={booking.status} /></div>
                <div className="g-meta"><i className="i i-pin" />{venue?.venueLocation}</div>
              </div>
            </div>
            <div className="g-box">
              <h2 style={{ fontSize: 19 }}>Booking summary</h2>
              <div>
                <div className="g-kv"><span>Venue</span><span>{venue?.venueName}</span></div>
                <div className="g-kv"><span>Date</span><span>{day}</span></div>
                <div className="g-kv"><span>Time</span><span>{range} ({hours} {hours === 1 ? "hour" : "hours"})</span></div>
                <div className="g-kv"><span>Price per hour</span><span>{money(venue?.pricePerHour ?? 0)}</span></div>
              </div>
              <div className="g-total"><span style={{ fontWeight: 600 }}>Total</span><b>{money(booking.price)}</b></div>
              <span className="g-hint">Final price, confirmed by Golfy.</span>
              <div className="g-row" style={{ justifyContent: "flex-end" }}>
                <button className="g-btn g-btn--secondary" type="button" onClick={() => setAsking(true)}>Cancel booking</button>
                <button className="g-btn g-btn--accent" type="button" onClick={pay} disabled={paying} aria-busy={paying}>
                  {paying && <span className="g-spin" />}
                  {paying ? "Processing" : `Pay and confirm ${money(booking.price)}`}
                </button>
              </div>
            </div>
          </>
        )}

        {done && (
          <div className="g-box" style={{ justifyItems: "center", textAlign: "center", padding: "48px 24px" }} role="status">
            <span className="g-okmark"><i className="i i-lg i-check" /></span>
            <h1 className="g-h1">Payment received</h1>
            <StatusBadge status={BookingStatus.CONFIRMED} />
            <p className="g-muted" style={{ maxWidth: "44ch" }}>Your booking at {venue?.venueName} is confirmed.</p>
            <Link className="g-btn g-btn--primary" to={`/confirmation/${booking._id}`}>View confirmation</Link>
          </div>
        )}

        {expired && (
          <div className="g-box" style={{ justifyItems: "center", textAlign: "center", padding: "48px 24px" }} role="alert">
            <i className="i i-lg i-clock" style={{ color: "var(--ink-muted)" }} />
            <h1 className="g-h1">Your hold ended</h1>
            <p className="g-muted" style={{ maxWidth: "44ch" }}>
              The {HOLD_MINUTES} minutes ran out, so we released <span className="g-num">{day}, {range}</span> at {venue?.venueName}. You have not been charged.
            </p>
            <Link className="g-btn g-btn--primary" to={`/venues/${booking.venueId}`}>Choose a new time</Link>
          </div>
        )}

        {booking.status === BookingStatus.CANCELLED && (
          <div className="g-box" style={{ justifyItems: "center", textAlign: "center", padding: "48px 24px" }} role="status">
            <StatusBadge status={BookingStatus.CANCELLED} />
            <h1 className="g-h1">Booking cancelled</h1>
            <p className="g-muted" style={{ maxWidth: "44ch" }}>The slot is free again and you have not been charged.</p>
            <Link className="g-btn g-btn--primary" to="/venues">Find a venue</Link>
          </div>
        )}
      </div>

      {asking && (
        <ConfirmDialog title="Cancel this booking?" confirmLabel="Cancel booking" cancelLabel="Keep booking" busy={cancelling}
          text={`${venue?.venueName}, ${day}, ${range}. The slot will be released for other players.`}
          onConfirm={cancel} onClose={() => setAsking(false)} />
      )}
    </main>
  );
}

