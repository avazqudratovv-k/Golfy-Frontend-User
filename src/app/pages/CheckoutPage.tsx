import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        <EmptyState icon="i-ticket" title={missing ? t("bk.notFound") : t("checkout.loadFailed")}
          text={missing ? t("bk.notFoundText") : t("bk.loadFailedText")}
          action={<div className="g-row"><Link className="g-btn g-btn--primary" to="/bookings">{t("bk.myBookings")}</Link>{!missing && <button className="g-btn g-btn--secondary" type="button" onClick={reload}>{t("common.retry")}</button>}</div>} />
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
      // there is no card step yet: "paying" confirms the booking
      await new Promise((r) => setTimeout(r, 800));
      const updated = await bookingApi.setStatus(booking._id, BookingStatus.CONFIRMED);
      setData({ ...booking, ...updated });
      navigate(`/confirmation/${booking._id}`, { replace: true });
    } catch (err) {
      const { status: code, message } = apiError(err);
      setProblem(
        code === 409
          ? { title: t("checkout.taken"), text: message }
          : { title: t("checkout.payFailed"), text: message || t("bk.loadFailedText") }
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
      setProblem({ title: t("checkout.cancelFailed"), text: apiError(err).message || t("checkout.cancelFailedText") });
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
              <h1 className="g-h1">{t("checkout.title")}</h1>
              <span className={`g-badge g-badge--pending g-num${left < 5 * 60000 ? " g-urgent" : ""}`} style={{ height: 32, fontSize: 14 }} role="timer" aria-label={t("checkout.timerAria", { time: timeLeft(left) })}>
                <i className="i i-clock" />{t("checkout.held", { time: timeLeft(left) })}
              </span>
            </div>
            <Banner info icon="i-clock" title={t("checkout.holdTitle", { count: HOLD_MINUTES })}>
              {t("checkout.holdText")}
            </Banner>
            {problem && <Banner title={problem.title}>{problem.text}</Banner>}
            <div className="g-card g-booking">
              <div className={`g-photo${venue?.venueImages?.[0] ? " has-img" : ""}`} style={photoStyle(venue?.venueImages?.[0])} role="img" aria-label={t("venueCard.photoOf", { name: venue?.venueName })} />
              <div className="g-card-body">
                <div className="g-between"><h3>{venue?.venueName}</h3><StatusBadge status={booking.status} /></div>
                <div className="g-meta"><i className="i i-pin" />{venue?.venueLocation}</div>
              </div>
            </div>
            <div className="g-box">
              <h2 style={{ fontSize: 19 }}>{t("checkout.summary")}</h2>
              <div>
                <div className="g-kv"><span>{t("bk.venue")}</span><span>{venue?.venueName}</span></div>
                <div className="g-kv"><span>{t("bk.date")}</span><span>{day}</span></div>
                <div className="g-kv"><span>{t("bk.time")}</span><span>{range} ({t("bk.hours", { count: hours })})</span></div>
                <div className="g-kv"><span>{t("bk.pricePerHour")}</span><span>{money(venue?.pricePerHour ?? 0)}</span></div>
              </div>
              <div className="g-total"><span style={{ fontWeight: 600 }}>{t("bk.total")}</span><b>{money(booking.price)}</b></div>
              <span className="g-hint">{t("checkout.finalPrice")}</span>
              <span className="g-hint">{t("checkout.simulatedNote")}</span>
              <div className="g-row" style={{ justifyContent: "flex-end" }}>
                <button className="g-btn g-btn--secondary" type="button" onClick={() => setAsking(true)}>{t("checkout.cancel")}</button>
                <button className="g-btn g-btn--accent" type="button" onClick={pay} disabled={paying} aria-busy={paying}>
                  {paying && <span className="g-spin" />}
                  {paying ? t("checkout.processing") : t("checkout.pay", { price: money(booking.price) })}
                </button>
              </div>
            </div>
          </>
        )}

        {done && (
          <div className="g-box" style={{ justifyItems: "center", textAlign: "center", padding: "48px 24px" }} role="status">
            <span className="g-okmark"><i className="i i-lg i-check" /></span>
            <h1 className="g-h1">{t("checkout.received")}</h1>
            <StatusBadge status={BookingStatus.CONFIRMED} />
            <p className="g-muted" style={{ maxWidth: "44ch" }}>{t("checkout.confirmedText", { name: venue?.venueName })}</p>
            <Link className="g-btn g-btn--primary" to={`/confirmation/${booking._id}`}>{t("checkout.viewConfirmation")}</Link>
          </div>
        )}

        {expired && (
          <div className="g-box" style={{ justifyItems: "center", textAlign: "center", padding: "48px 24px" }} role="alert">
            <i className="i i-lg i-clock" style={{ color: "var(--ink-muted)" }} />
            <h1 className="g-h1">{t("checkout.holdEnded")}</h1>
            <p className="g-muted" style={{ maxWidth: "44ch" }}>
              <Trans i18nKey="checkout.holdEndedText" values={{ count: HOLD_MINUTES, when: `${day}, ${range}`, name: venue?.venueName }} components={{ time: <span className="g-num" /> }} />
            </p>
            <Link className="g-btn g-btn--primary" to={`/venues/${booking.venueId}`}>{t("checkout.chooseNew")}</Link>
          </div>
        )}

        {booking.status === BookingStatus.CANCELLED && (
          <div className="g-box" style={{ justifyItems: "center", textAlign: "center", padding: "48px 24px" }} role="status">
            <StatusBadge status={BookingStatus.CANCELLED} />
            <h1 className="g-h1">{t("bk.cancelled")}</h1>
            <p className="g-muted" style={{ maxWidth: "44ch" }}>{t("checkout.cancelledText")}</p>
            <Link className="g-btn g-btn--primary" to="/venues">{t("bk.findVenue")}</Link>
          </div>
        )}
      </div>

      {asking && (
        <ConfirmDialog title={t("checkout.askTitle")} confirmLabel={t("checkout.cancel")} cancelLabel={t("checkout.keep")} busy={cancelling}
          text={t("checkout.askText", { name: venue?.venueName, day, range })}
          onConfirm={cancel} onClose={() => setAsking(false)} />
      )}
    </main>
  );
}

