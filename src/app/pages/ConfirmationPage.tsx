import React from "react";
import { kstWallClockToUtcStamp } from "../lib/kst";
import { Link, Navigate, useParams } from "react-router-dom";
import { bookingApi } from "../services/api";
import { useLoader } from "../hooks/useMedia";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { BookingStatus } from "../lib/enums";
import { SUPPORT_EMAIL } from "../lib/config";
import { apiError, bookingRef, formatDay, hoursBetween, money, pad2, photoStyle } from "../lib/format";
import { EmptyState, StatusBadge } from "../components/ui";
import { Confetti } from "../components/Motion";
import { Booking } from "../lib/types";

// builds a calendar file; start/end are KST wall-clock times, written as UTC instants so every calendar app agrees
function calendarFile(b: Booking) {
  const venue = b.venueData?.[0];
  const stamp = (time: string) => kstWallClockToUtcStamp(b.bookingDate, time);
  const now = new Date();
  const created = `${now.getUTCFullYear()}${pad2(now.getUTCMonth() + 1)}${pad2(now.getUTCDate())}T${pad2(now.getUTCHours())}${pad2(now.getUTCMinutes())}00Z`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Golfy//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${b._id}@golfy`,
    `DTSTAMP:${created}`,
    `DTSTART:${stamp(b.startTime)}`,
    `DTEND:${stamp(b.endTime)}`,
    `SUMMARY:Golfy: ${venue?.venueName ?? "Booking"}`,
    `LOCATION:${venue?.venueName ?? ""}, ${venue?.venueLocation ?? ""}`,
    `DESCRIPTION:Booking ${bookingRef(b._id)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default function ConfirmationPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const { data: booking, loading, error, reload } = useLoader(() => bookingApi.one(id), [id]);

  if (loading) {
    return (
      <main className="g-mainpage"><div className="g-wrap" style={{ maxWidth: 600, display: "grid", gap: 16 }} aria-busy="true">
        <div className="g-skel" style={{ height: 64, width: 64, borderRadius: 32, justifySelf: "center" }} />
        <div className="g-skel" style={{ height: 380 }} />
      </div></main>
    );
  }
  if (error || !booking) {
    const missing = apiError(error).status === 404;
    return (
      <main className="g-mainpage"><div className="g-wrap" style={{ maxWidth: 600 }}>
        <EmptyState icon="i-ticket" title={missing ? "Booking not found" : "We could not load your receipt"}
          text={missing ? "It may belong to another account, or the link is wrong." : "Something went wrong on our side. Please try again."}
          action={<div className="g-row"><Link className="g-btn g-btn--primary" to="/bookings">My bookings</Link>{!missing && <button className="g-btn g-btn--secondary" type="button" onClick={reload}>Try again</button>}</div>} />
      </div></main>
    );
  }
  // only a paid booking has a receipt
  if (booking.status === BookingStatus.PENDING) return <Navigate to={`/checkout/${booking._id}`} replace />;

  const venue = booking.venueData?.[0];
  const hours = hoursBetween(booking.startTime, booking.endTime);
  const cancelled = booking.status === BookingStatus.CANCELLED;

  const addToCalendar = () => {
    const blob = new Blob([calendarFile(booking)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "golfy-booking.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Calendar file ready: golfy-booking.ics");
  };

  return (
    <main className="g-mainpage">
      <div className="g-wrap" style={{ maxWidth: 600, display: "grid", gap: 24 }}>
        <div style={{ display: "grid", gap: 8, justifyItems: "center", textAlign: "center" }} role="status">
          {!cancelled && <Confetti storageKey={`golfy-confetti-${booking._id}`} />}
          <span className="g-okmark"><i className={`i i-lg ${cancelled ? "i-slash" : "i-check"}`} /></span>
          <h1 className="g-h1">{cancelled ? "Booking cancelled" : "You're booked"}</h1>
          <p className="g-muted">{cancelled ? "This booking was cancelled, so this receipt is no longer valid." : "Keep this receipt for your records."}</p>
        </div>

        <article className="g-receipt" aria-label="Booking receipt">
          <div className={`g-photo${venue?.venueImages?.[0] ? " has-img" : ""}`} style={photoStyle(venue?.venueImages?.[0])} role="img" aria-label={`Photo of ${venue?.venueName}`}>
            <div className="g-photo-cap">
              <h3>{venue?.venueName}</h3>
              <div className="g-meta" style={{ color: "#fff" }}><i className="i i-pin" />{venue?.venueLocation}</div>
            </div>
          </div>
          <div className="g-receipt-body">
            <div className="g-between">
              <div><span className="g-cap">Booking reference</span><div className="g-ref">{bookingRef(booking._id)}</div></div>
              <StatusBadge status={booking.status} />
            </div>
            <div className="g-tear" aria-hidden="true" />
            <div>
              <div className="g-kv"><span>Date</span><span>{formatDay(booking.bookingDate)}</span></div>
              <div className="g-kv"><span>Time</span><span>{booking.startTime} - {booking.endTime} ({hours} {hours === 1 ? "hour" : "hours"})</span></div>
              <div className="g-kv"><span>Price per hour</span><span>{money(venue?.pricePerHour ?? 0)}</span></div>
              <div className="g-kv"><span>Booked by</span><span>{user?.name}</span></div>
            </div>
            <div className="g-total"><span style={{ fontWeight: 600 }}>Total paid</span><b>{money(booking.price)}</b></div>
          </div>
        </article>

        <div className="g-row" style={{ justifyContent: "center" }}>
          {!cancelled && (
            <button className="g-btn g-btn--secondary" type="button" onClick={addToCalendar}><i className="i i-calplus" />Add to calendar</button>
          )}
          <Link className="g-btn g-btn--primary" to="/bookings">View my bookings</Link>
          <Link className="g-btn g-btn--ghost" to={`/venues/${booking.venueId}`}>Book another time</Link>
        </div>
        <p className="g-hint" style={{ textAlign: "center" }}>
          Need to change something? You can cancel from My bookings, or email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </div>
    </main>
  );
}
