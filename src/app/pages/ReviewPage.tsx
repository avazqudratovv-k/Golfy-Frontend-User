import React, { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { bookingApi, reviewApi } from "../services/api";
import { useLoader } from "../hooks/useMedia";
import { BookingStatus } from "../lib/enums";
import { apiError, formatDay, slotEnded } from "../lib/format";
import { Banner, EmptyState, FieldError } from "../components/ui";

export default function ReviewPage() {
  const { t } = useTranslation();
  const RATING_TEXT = t("review.ratingText", { returnObjects: true }) as unknown as string[];
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
        <EmptyState icon="i-ticket" title={missing ? t("bk.notFound") : t("review.loadFailed")}
          text={missing ? t("bk.notFoundText") : t("bk.loadFailedText")}
          action={<div className="g-row"><Link className="g-btn g-btn--primary" to="/bookings">{t("bk.myBookings")}</Link>{!missing && <button className="g-btn g-btn--secondary" type="button" onClick={reload}>{t("common.retry")}</button>}</div>} />
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
      const { status, raw } = apiError(err);
      setProblem(status === 403 ? "notPlayed" : /already reviewed/i.test(raw) ? "already" : "other");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="g-auth" style={{ maxWidth: 560 }}>
      <Link to="/bookings" style={{ display: "inline-flex", alignItems: "center", gap: 4, minHeight: 44, fontWeight: 600, justifySelf: "start" }}>
        <i className="i i-left" />{t("bk.myBookings")}
      </Link>

      {!done ? (
        <form className="g-box" onSubmit={submit} noValidate aria-labelledby="rt">
          <h1 id="rt" style={{ fontSize: 26 }}>{t("review.title", { name: venue?.venueName })}</h1>
          <p className="g-meta g-num"><i className="i i-cal" />{t("review.booked", { day: formatDay(booking.bookingDate), range: `${booking.startTime} - ${booking.endTime}` })}</p>

          {notPlayed && (
            <Banner title={t("review.notPlayed")}>{t("review.notPlayedText")}</Banner>
          )}
          {already && <Banner title={t("review.already")}>{t("review.alreadyText")}</Banner>}
          {problem === "other" && <Banner title={t("review.postFailed")}>{t("bk.loadFailedText")}</Banner>}

          <div className="g-field">
            <span className="g-label" id="rl">{t("review.yourRating")}</span>
            <div className="g-rate" role="radiogroup" aria-labelledby="rl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={rating >= n ? "on" : ""} type="button" role="radio" aria-checked={rating === n}
                  aria-label={t("review.starAria", { count: n, text: RATING_TEXT[n] })} onClick={() => setRating(n)}>
                  <i className={rating >= n ? "i i-star" : "i i-staro"} />
                </button>
              ))}
            </div>
            <span className="g-hint" aria-live="polite">{rating ? t("review.ratingSummary", { rating, text: RATING_TEXT[rating] }) : t("review.tapStar")}</span>
            {tried && !rating && <FieldError>{t("review.chooseRating")}</FieldError>}
          </div>

          <div className={`g-field${tried && !comment.trim() ? " is-invalid" : ""}`}>
            <label className="g-label" htmlFor="rc">{t("review.comment")}</label>
            <textarea className="g-textarea" id="rc" placeholder={t("review.commentPlaceholder")} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} />
            {tried && !comment.trim() && <FieldError>{t("review.commentError")}</FieldError>}
          </div>

          <div className="g-row" style={{ justifyContent: "flex-end" }}>
            <Link className="g-btn g-btn--secondary" to="/bookings">{t("review.notNow")}</Link>
            <button className="g-btn g-btn--primary" type="submit" disabled={blocked || saving}>
              {saving && <span className="g-spin" />}
              {t("review.post")}
            </button>
          </div>
        </form>
      ) : (
        <div className="g-box" style={{ justifyItems: "center", textAlign: "center", padding: "48px 24px" }} role="status">
          <span className="g-okmark"><i className="i i-lg i-check" /></span>
          <h1 style={{ fontSize: 26 }}>{t("review.thanks")}</h1>
          <p className="g-muted">{t("review.thanksText", { name: venue?.venueName })}</p>
          <div className="g-row" style={{ justifyContent: "center" }}>
            <Link className="g-btn g-btn--primary" to="/bookings">{t("review.backToBookings")}</Link>
            <Link className="g-btn g-btn--ghost" to={`/venues/${booking.venueId}`}>{t("review.seeVenue")}</Link>
          </div>
        </div>
      )}
    </main>
  );
}
