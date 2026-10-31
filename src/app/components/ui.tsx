import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { BookingStatus } from "../lib/enums";
import { Venue } from "../lib/types";
import { imgUrl, isPopular, money, ratingText, reviewsText, typeLabel } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "../context/ToastContext";
import { useReveal } from "./Motion";

/** star row (read only) */
export function Stars({ value, label }: { value: number; label?: string }) {
  const { t } = useTranslation();
  return (
    <span className="g-stars" role="img" aria-label={label ?? t("stars.label", { value })}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= Math.round(value) ? "i i-star" : "i i-staro"} />
      ))}
    </span>
  );
}

const STATUS: Record<BookingStatus, { icon: string; cls: string }> = {
  [BookingStatus.PENDING]: { icon: "i-clock", cls: "pending" },
  [BookingStatus.CONFIRMED]: { icon: "i-check", cls: "confirmed" },
  [BookingStatus.FINISHED]: { icon: "i-flag", cls: "finished" },
  [BookingStatus.CANCELLED]: { icon: "i-slash", cls: "cancelled" },
};

export const statusLabel = (s: BookingStatus) => i18n.t(`status.${s}`);
export const statusIcon = (s: BookingStatus) => STATUS[s].icon;

export function StatusBadge({ status, style }: { status: BookingStatus; style?: React.CSSProperties }) {
  const { t } = useTranslation();
  const s = STATUS[status];
  return (
    <span className={`g-badge g-badge--${s.cls}`} style={style}>
      <i className={`i ${s.icon}`} />
      {t(`status.${status}`)}
    </span>
  );
}

export function Banner({
  children,
  title,
  icon = "i-alert",
  info,
  action,
}: {
  children?: React.ReactNode;
  title: React.ReactNode;
  icon?: string;
  info?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className={`g-banner${info ? " g-banner--info" : ""}`} role={info ? "status" : "alert"}>
      <i className={`i ${icon}`} />
      <div>
        <strong>{title}</strong>
        {children}
      </div>
      {action}
    </div>
  );
}

export function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <span className="g-msg">
      <i className="i i-alert" />
      <span>{children}</span>
    </span>
  );
}

export function Pagination({
  page,
  pageCount,
  onPage,
  label,
  summary,
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  label: string;
  summary?: string;
}) {
  const { t } = useTranslation();
  if (pageCount <= 1) return null;
  return (
    <nav aria-label={label}>
      <ul className="g-pages">
        <li>
          <button className="g-page" type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <i className="i i-left" />{t("pagination.previous")}
          </button>
        </li>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            <button
              className="g-page"
              type="button"
              aria-current={n === page ? "page" : undefined}
              aria-label={t("pagination.page", { n })}
              onClick={() => onPage(n)}
            >
              {n}
            </button>
          </li>
        ))}
        <li>
          <button className="g-page" type="button" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
            {t("pagination.next")}<i className="i i-right" />
          </button>
        </li>
      </ul>
      {summary && <p className="g-hint g-num" style={{ marginTop: 8 }}>{summary}</p>}
    </nav>
  );
}

/** modal that closes on Escape and keeps focus inside */
export function ConfirmDialog({
  title,
  text,
  confirmLabel,
  cancelLabel,
  busy,
  onConfirm,
  onClose,
}: {
  title: string;
  text: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="g-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="g-modal" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" aria-describedby="dlg-d">
        <h3 id="dlg-t">{title}</h3>
        <p id="dlg-d" className="g-muted">{text}</p>
        <div className="g-modal-actions">
          <button ref={cancelRef} className="g-btn g-btn--secondary" type="button" onClick={onClose}>
            {cancelLabel ?? t("common.keep")}
          </button>
          <button className="g-btn g-btn--danger" type="button" onClick={onConfirm} disabled={busy}>
            {busy && <span className="g-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="g-empty">
      <i className={`i i-lg ${icon}`} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function VenueCardSkeleton() {
  return (
    <div className="g-card">
      <div className="g-skel" style={{ aspectRatio: "4/3", borderRadius: 0 }} />
      <div className="g-card-body">
        <div className="g-skel" style={{ height: 24, width: "30%" }} />
        <div className="g-skel" style={{ height: 20, width: "70%" }} />
        <div className="g-skel" style={{ height: 14, width: "45%" }} />
        <div className="g-between" style={{ marginTop: 4 }}>
          <div className="g-skel" style={{ height: 20, width: 80 }} />
          <div className="g-skel" style={{ height: 44, width: 76, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}

/** heart button; logged-out visitors are sent to log in */
export function HeartButton({ venue, inline }: { venue: Venue; inline?: boolean }) {
  const { user } = useAuth();
  const { isFav, toggle } = useFavorites();
  const toast = useToast();
  const { t } = useTranslation();
  const on = isFav(venue._id);

  if (!user) {
    return (
      <Link
        className={`g-heart${inline ? " g-heart--inline" : ""}`}
        to={`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`}
        aria-label={t("heart.loginToSave", { name: venue.venueName })}
      >
        <i className="i i-heart" />
      </Link>
    );
  }

  return (
    <button
      className={`g-heart${inline ? " g-heart--inline" : ""}${on ? " on" : ""}`}
      type="button"
      aria-pressed={on}
      aria-label={on ? t("heart.remove", { name: venue.venueName }) : t("heart.save", { name: venue.venueName })}
      onClick={async () => {
        const result = await toggle(venue._id);
        if (result === true) toast(t("heart.saved", { name: venue.venueName }));
      }}
    >
      <i className={on ? "i i-heartf" : "i i-heart"} />
    </button>
  );
}

export function VenueCard({ venue, heart, index = 0 }: { venue: Venue; heart?: React.ReactNode; index?: number }) {
  const { t } = useTranslation();
  const cover = venue.venueImages?.[0];
  const reveal = useReveal<HTMLElement>((index % 4) * 90);
  const to = `/venues/${venue._id}`;
  return (
    <article ref={reveal.ref} style={reveal.style} className={`g-card g-card--hover ${reveal.className}`}>
      <div
        className={`g-photo${cover ? " has-img" : ""}`}
        role="img"
        aria-label={t("venueCard.photoOf", { name: venue.venueName })}
      >
        {cover && <img className="g-photo-img" src={imgUrl(cover)} alt="" width={1600} height={1067} loading="lazy" decoding="async" />}
        {isPopular(venue) && (
          <span className="g-chip">
            <i className="i i-flame" />{t("venueCard.popular")}
          </span>
        )}
      </div>
      {heart ?? <HeartButton venue={venue} />}
      <div className="g-card-body">
        <span className="g-tag">{typeLabel(venue.venueType)}</span>
        <h3>
          <Link to={to} style={{ color: "inherit", textDecoration: "none" }}>{venue.venueName}</Link>
        </h3>
        <div className="g-meta"><i className="i i-pin" />{venue.venueLocation}</div>
        <div
          className="g-rating"
          role="img"
          aria-label={
            (venue.reviewCount ?? 0) > 0
              ? t("venueCard.rated", { rating: ratingText(venue), reviews: reviewsText(venue) })
              : t("venueCard.noReviewsYet")
          }
        >
          <i className="i i-star" />
          <strong>{ratingText(venue)}</strong>
          <span>· {reviewsText(venue)}</span>
        </div>
        <div className="g-between g-card-foot">
          <span className="g-price">{money(venue.pricePerHour)} <small>{t("common.perHour")}</small></span>
          <Link className="g-btn g-btn--accent g-btn--sm" to={to}>{t("venueCard.book")}</Link>
        </div>
      </div>
    </article>
  );
}
