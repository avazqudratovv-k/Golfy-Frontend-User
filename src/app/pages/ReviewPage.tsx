import React, { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { bookingApi, reviewApi } from "../services/api";
import { useLoader } from "../hooks/useMedia";
import { BookingStatus } from "../lib/enums";
import { apiError, formatDay, slotEnded } from "../lib/format";
import { Banner, EmptyState, FieldError } from "../components/ui";

const RATING_TEXT = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export default function ReviewPage() {
  const { bookingId = "" } = useParams();
  const { data: booking, loading, error, reload } = useLoader(() => bookingApi.one(bookingId), [bookingId]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [problem, setProblem] = useState<"notPlayed" | "already" | "other" | null>(null);

  if (loading) {
    return <main className="g-mainpage"><div className="g-wrap" style={{ maxWidth: 560 }} aria-busy="true"><div className="g-skel" style={{ height: 380 }} /></div></main>;
  }
  if (error || !booking) {
    const missing = apiError(error).status === 404;
    return (
      <main className="g-mainpage"><div className="g-wrap" style={{ maxWidth: 560 }}>
        <EmptyState icon="i-ticket" title={missing ? "Booking not found" : "We could not load this booking"}
          text={missing ? "It may belong to another account, or the link is wrong." : "Something went wrong on our side. Please try again."}
          action={<div className="g-row"><Link className="g-btn g-btn--primary" to="/bookings">My bookings</Link>{!missing && <button className="g-btn g-btn--secondary" type="button" onClick={reload}>Try again</button>}</div>} />
      </div></main>
    );
  }

  const venue = booking.venueData?.[0];
  const played =
    booking.status === BookingStatus.FINISHED ||
    (booking.status === BookingStatus.CONFIRMED && slotEnded(booking.bookingDate, booking.endTime));
  const notPlayed = !played || problem === "notPlayed";
  const already = !!booking.reviewed || problem === "already";
  const blocked = notPlayed || already;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (blocked || !rating || !comment.trim()) return;
    setSaving(true);
    setProblem(null);
    try {
      await reviewApi.create({ bookingId: booking._id, rating, comment: comment.trim() });
      setDone(true);
    } catch (err) {
      const { status, message } = apiError(err);
      setProblem(status === 403 ? "notPlayed" : /already reviewed/i.test(message) ? "already" : "other");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="g-auth" style={{ maxWidth: 560 }}>
      <Link to="/bookings" style={{ display: "inline-flex", alignItems: "center", gap: 4, minHeight: 44, fontWeight: 600, justifySelf: "start" }}>
        <i className="i i-left" />My bookings
      </Link>

      {!done ? (
        <form className="g-box" onSubmit={submit} noValidate aria-labelledby="rt">
          <h1 id="rt" style={{ fontSize: 26 }}>Review {venue?.venueName}</h1>
          <p className="g-meta g-num"><i className="i i-cal" />Booked {formatDay(booking.bookingDate)}, {booking.startTime} - {booking.endTime}</p>

          {notPlayed && (
            <Banner title="You can only review venues you have booked and played!">Finish a booking here first, then come back.</Banner>
          )}
          {already && <Banner title="You have already reviewed this booking!">Each booking can be reviewed once.</Banner>}
          {problem === "other" && <Banner title="We could not post your review">Something went wrong on our side. Please try again.</Banner>}

          <div className="g-field">
            <span className="g-label" id="rl">Your rating</span>
            <div className="g-rate" role="radiogroup" aria-labelledby="rl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={rating >= n ? "on" : ""} type="button" role="radio" aria-checked={rating === n}
                  aria-label={`${n} ${n === 1 ? "star" : "stars"}: ${RATING_TEXT[n]}`} onClick={() => setRating(n)}>
                  <i className={rating >= n ? "i i-star" : "i i-staro"} />
                </button>
              ))}
            </div>
            <span className="g-hint" aria-live="polite">{rating ? `${rating} of 5: ${RATING_TEXT[rating]}` : "Tap a star to rate."}</span>
            {tried && !rating && <FieldError>Please choose a rating.</FieldError>}
          </div>

          <div className={`g-field${tried && !comment.trim() ? " is-invalid" : ""}`}>
            <label className="g-label" htmlFor="rc">Comment</label>
            <textarea className="g-textarea" id="rc" placeholder="How was the venue?" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} />
            {tried && !comment.trim() && <FieldError>Please add a comment.</FieldError>}
          </div>

          <div className="g-row" style={{ justifyContent: "flex-end" }}>
            <Link className="g-btn g-btn--secondary" to="/bookings">Not now</Link>
            <button className="g-btn g-btn--primary" type="submit" disabled={blocked || saving}>
              {saving && <span className="g-spin" />}
              Post review
            </button>
          </div>
        </form>
      ) : (
        <div className="g-box" style={{ justifyItems: "center", textAlign: "center", padding: "48px 24px" }} role="status">
          <span className="g-okmark"><i className="i i-lg i-check" /></span>
          <h1 style={{ fontSize: 26 }}>Thanks for your review</h1>
          <p className="g-muted">It now shows on the {venue?.venueName} page.</p>
          <div className="g-row" style={{ justifyContent: "center" }}>
            <Link className="g-btn g-btn--primary" to="/bookings">Back to my bookings</Link>
            <Link className="g-btn g-btn--ghost" to={`/venues/${booking.venueId}`}>See the venue</Link>
          </div>
        </div>
      )}
    </main>
  );
}
