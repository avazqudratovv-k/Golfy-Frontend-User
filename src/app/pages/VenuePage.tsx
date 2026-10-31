import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { bookingApi, reviewApi, venueApi } from '../services/api';
import { useLoader } from '../hooks/useMedia';
import { useAuth } from '../context/AuthContext';
import {
  Banner,
  EmptyState,
  HeartButton,
  Stars,
  VenueCard,
} from '../components/ui';
import { Reveal } from '../components/Motion';
import {
  apiError,
  formatShortDate,
  hourLabel,
  imgUrl,
  initials,
  isPopular,
  money,
  ratingText,
  reviewsText,
  toDateKey,
  typeLabel,
} from '../lib/format';
import { Venue } from '../lib/types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

function Lightbox({
  images,
  alt,
  start,
  onClose,
}: {
  images: string[];
  alt: string;
  start: number;
  onClose: () => void;
}) {
  const [i, setI] = useState(start);
  const step = (d: number) => setI((n) => (n + d + images.length) % images.length);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="g-lightbox" role="dialog" aria-modal="true" aria-label={`${alt} photos`}>
      <div className="g-lightbox-stage">
        <img src={imgUrl(images[i])} alt={`${alt}, ${i + 1} of ${images.length}`} />
        <button className="close" type="button" aria-label="Close photos" onClick={onClose} autoFocus>
          <i className="i i-x" />
        </button>
        {images.length > 1 && (
          <>
            <button className="prev" type="button" aria-label="Previous photo" onClick={() => step(-1)}>
              <i className="i i-left" />
            </button>
            <button className="next" type="button" aria-label="Next photo" onClick={() => step(1)}>
              <i className="i i-right" />
            </button>
          </>
        )}
      </div>
      <div className="g-lightbox-cap">{i + 1} / {images.length}</div>
    </div>
  );
}

function Gallery({ venue }: { venue: Venue }) {
  const [open, setOpen] = useState<number | null>(null);
  const images = (venue.venueImages ?? []).slice(0, 5);
  const count = Math.max(images.length, 1);
  // a 4-photo layout leaves one empty cell, so it gets a quiet filler tile
  const tiles: (string | undefined)[] = images.length
    ? [...images]
    : [undefined];
  if (images.length === 4) tiles.push(undefined);
  return (
    <>
      <div
        className={`g-gallery${count <= 3 ? ` g-gallery--${count}` : ''}`}
        role="group"
        aria-label={`Venue photos, ${images.length} images`}
      >
        {tiles.map((img, i) =>
          img ? (
            <button
              key={i}
              type="button"
              className="g-photo has-img"
              aria-label={`Open photo ${i + 1} of ${images.length} of ${venue.venueName}`}
              onClick={() => setOpen(i)}
            >
              <img className="g-photo-img" src={imgUrl(img)} alt="" width={1600} height={1067} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
            </button>
          ) : (
            <div key={i} className="g-photo g-photo--empty" role="img" aria-label="Photo coming soon" />
          ),
        )}
      </div>
      {open !== null && (
        <Lightbox images={images} alt={venue.venueName} start={open} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

function Calendar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (key: string) => void;
}) {
  const today = new Date();
  const todayKey = toDateKey(today);
  const [view, setView] = useState(() => {
    const [y, m] = selected.split('-').map(Number);
    return { y, m: m - 1 };
  });
  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7; // week starts on Monday
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const isCurrentMonth =
    view.y === today.getFullYear() && view.m === today.getMonth();
  const shift = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div
      className="g-cal"
      role="group"
      aria-labelledby="dl"
      style={{ maxWidth: 'none', padding: 12 }}
    >
      <div className="g-cal-head">
        <button
          className="g-iconbtn"
          type="button"
          aria-label="Previous month"
          disabled={isCurrentMonth}
          onClick={() => shift(-1)}
          style={{ opacity: isCurrentMonth ? 0.4 : 1 }}
        >
          <i className="i i-left" />
        </button>
        <strong>
          {MONTHS[view.m]} {view.y}
        </strong>
        <button
          className="g-iconbtn"
          type="button"
          aria-label="Next month"
          onClick={() => shift(1)}
        >
          <i className="i i-right" />
        </button>
      </div>
      <div className="g-cal-grid">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <span className="g-cal-dow" key={d}>
            {d}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`b${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const d = new Date(view.y, view.m, day);
          const key = toDateKey(d);
          const past = key < todayKey;
          return (
            <button
              key={key}
              type="button"
              className={`g-day${key === todayKey ? ' is-today' : ''}`}
              aria-label={`${WEEKDAYS[(d.getDay() + 6) % 7]} ${day} ${MONTHS[view.m]} ${view.y}${key === todayKey ? ', today' : ''}`}
              aria-pressed={key === selected}
              disabled={past}
              onClick={() => onSelect(key)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function VenuePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const venueQ = useLoader(() => venueApi.one(id), [id]);
  const reviewsQ = useLoader(
    () => reviewApi.recent({ venueId: id, limit: 100 }),
    [id],
  );
  const similarQ = useLoader(() => venueApi.similar(id), [id]);
  const breakdownQ = useLoader(() => venueApi.ratingBreakdown(id), [id]);

  const [dateKey, setDateKey] = useState(() => toDateKey(new Date()));
  const availQ = useLoader(
    () => venueApi.availability(id, dateKey),
    [id, dateKey],
  );

  const [sel, setSel] = useState<{ a: number; b: number } | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState<{
    title: string;
    text: string;
  } | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setSel(null);
    setConflict(null);
    setBookError(null);
    setShowAll(false);
  }, [id]);

  const venue = venueQ.data;
  const avail = availQ.data;

  const nowHour = new Date().getHours();
  const isToday = dateKey === toDateKey(new Date());
  // taken by someone else, or already in the past today
  const unavailable = (h: number) =>
    (avail ? !avail.slots[h]?.available : true) || (isToday && h <= nowHour);

  const pick = (h: number) => {
    setBookError(null);
    if (!sel || sel.a !== sel.b || h < sel.a) {
      setSel({ a: h, b: h });
      setConflict(null);
      return;
    }
    if (h === sel.a) {
      setSel(null);
      setConflict(null);
      return;
    }
    for (let x = sel.a; x <= h; x++) {
      if (unavailable(x)) {
        const busy = avail?.booked.find(
          (b) =>
            b.startTime <= hourLabel(x) &&
            (b.endTime > hourLabel(x) || b.endTime === '00:00'),
        );
        setConflict(
          busy
            ? `${busy.startTime} to ${busy.endTime}`
            : `${hourLabel(x)} to ${hourLabel(x + 1)}`,
        );
        return;
      }
    }
    setSel({ a: sel.a, b: h });
    setConflict(null);
  };

  const changeDate = (key: string) => {
    setDateKey(key);
    setSel(null);
    setConflict(null);
    setBookError(null);
  };

  const hours = sel ? sel.b - sel.a + 1 : 0;
  const slotsTitle = useMemo(() => {
    const [y, m, d] = dateKey.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return `Availability, ${WEEKDAYS[(date.getDay() + 6) % 7].slice(0, 3)} ${d} ${MONTHS[m - 1]}`;
  }, [dateKey]);

  const book = async () => {
    if (!venue || !sel) return;
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/venues/${id}`)}`);
      return;
    }
    setBooking(true);
    setBookError(null);
    try {
      const created = await bookingApi.create({
        venueId: venue._id,
        bookingDate: dateKey,
        startTime: hourLabel(sel.a),
        endTime: sel.b + 1 === 24 ? '24:00' : hourLabel(sel.b + 1),
      });
      navigate(`/checkout/${created._id}`);
    } catch (err) {
      const { status, message } = apiError(err);
      if (status === 409) {
        setBookError({ title: 'That time is taken', text: message });
        availQ.reload();
        setSel(null);
      } else if (status === 429) {
        setBookError({
          title: 'Too many requests, please try again later!',
          text: '',
        });
      } else {
        setBookError({
          title: 'We could not start your booking',
          text:
            message || 'Something went wrong on our side. Please try again.',
        });
      }
    } finally {
      setBooking(false);
    }
  };

  const reviews = reviewsQ.data ?? [];
  const counts = [5, 4, 3, 2, 1].map(
    (s) => breakdownQ.data?.counts[String(s) as '1'] ?? 0,
  );
  const ratingTotal = breakdownQ.data?.total ?? 0;
  const shownReviews = showAll ? reviews : reviews.slice(0, 3);

  if (venueQ.loading) {
    return (
      <main className="g-mainpage">
        <div
          className="g-wrap"
          style={{ display: 'grid', gap: 16 }}
          aria-busy="true"
          aria-label="Loading venue"
        >
          <div className="g-skel" style={{ height: 348, borderRadius: 16 }} />
          <div className="g-skel" style={{ height: 36, width: '50%' }} />
          <div className="g-skel" style={{ height: 16, width: '30%' }} />
          <div className="g-skel" style={{ height: 120 }} />
        </div>
      </main>
    );
  }
  if (venueQ.error || !venue) {
    const notFound = apiError(venueQ.error).status === 404;
    return (
      <main className="g-mainpage">
        <div className="g-wrap">
          <EmptyState
            icon="i-search"
            title={
              notFound ? 'Venue not found' : 'We could not load this venue'
            }
            text={
              notFound
                ? 'It may have been removed, or the link is wrong.'
                : 'Something went wrong on our side. Please try again.'
            }
            action={
              <div className="g-row">
                <Link className="g-btn g-btn--primary" to="/venues">
                  Browse venues
                </Link>
                {!notFound && (
                  <button
                    className="g-btn g-btn--secondary"
                    type="button"
                    onClick={venueQ.reload}
                  >
                    Try again
                  </button>
                )}
              </div>
            }
          />
        </div>
      </main>
    );
  }

  const reviewCount = venue.reviewCount ?? 0;
  const ratingLabel =
    reviewCount > 0
      ? `Rated ${ratingText(venue)} out of 5 from ${reviewsText(venue)}`
      : 'No reviews yet';

  return (
    <main className="g-mainpage">
      <div className="g-wrap" style={{ display: 'grid', gap: 24 }}>
        <Link
          to="/venues"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            minHeight: 44,
            fontWeight: 600,
            justifySelf: 'start',
          }}
        >
          <i className="i i-left" />
          All venues
        </Link>

        <Gallery venue={venue} />

        <div className="g-two">
          <div className="g-main">
            <div style={{ display: 'grid', gap: 8 }}>
              <div className="g-row">
                <span className="g-tag">{typeLabel(venue.venueType)}</span>
                {isPopular(venue) && (
                  <span
                    className="g-chip"
                    style={{ background: 'var(--primary-tint)' }}
                  >
                    <i className="i i-flame" />
                    Popular
                  </span>
                )}
              </div>
              <div
                className="g-between"
                style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}
              >
                <h1 className="g-h1">{venue.venueName}</h1>
                <HeartButton venue={venue} inline />
              </div>
              <div className="g-meta" style={{ fontSize: 15 }}>
                <i className="i i-pin" />
                {venue.venueLocation}
              </div>
              <div
                className="g-rating"
                style={{ fontSize: 15 }}
                role="img"
                aria-label={ratingLabel}
              >
                <i className="i i-star" />
                <strong>{ratingText(venue)}</strong>
                <span>· {reviewsText(venue)}</span>
              </div>
              <div className="g-price" style={{ fontSize: 22 }}>
                {money(venue.pricePerHour)} <small>/ hour</small>
              </div>
            </div>
            {venue.venueDesc && (
              <p style={{ fontSize: 17, lineHeight: '28px', maxWidth: '62ch' }}>
                {venue.venueDesc}
              </p>
            )}

            <section
              aria-label="Reviews"
              style={{ display: 'grid', gap: 16, marginTop: 24 }}
            >
              <h2 className="g-h2" style={{ margin: 0 }}>
                Reviews
              </h2>
              {reviewCount > 0 ? (
                <div
                  className="g-box"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 24,
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gap: 4,
                      justifyItems: 'start',
                      flex: '0 0 auto',
                    }}
                  >
                    <span
                      style={{ font: '800 48px/1 var(--font-display)' }}
                      className="g-num"
                    >
                      {ratingText(venue)}
                    </span>
                    <Stars value={venue.avgRating ?? 0} label={ratingLabel} />
                    <span className="g-hint g-num">{reviewsText(venue)}</span>
                  </div>
                  <div
                    className="g-bars"
                    style={{ flex: '1 1 240px' }}
                    aria-label="Rating breakdown"
                  >
                    {[5, 4, 3, 2, 1].map((s, i) => (
                      <div className="g-barrow" key={s}>
                        <span>
                          {s} {s > 1 ? 'stars' : 'star'}
                        </span>
                        <div className="g-track">
                          <div
                            className="g-fill"
                            style={{
                              width: `${ratingTotal ? Math.round((counts[i] / ratingTotal) * 100) : 0}%`,
                            }}
                          />
                        </div>
                        <span style={{ textAlign: 'right' }}>{counts[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                !reviewsQ.loading && (
                  <p className="g-muted">
                    No reviews yet. Book a slot and be the first to review after
                    you play.
                  </p>
                )
              )}
              {shownReviews.map((r, i) => {
                const name = r.userData?.[0]?.name ?? 'Golfy player';
                return (
                  <Reveal key={r._id} delay={(i % 3) * 90}>
                    <article className="g-card">
                      <div className="g-card-body" style={{ gap: 12 }}>
                        <div className="g-row">
                          <span className="g-avatar" aria-hidden="true">
                            {initials(name)}
                          </span>
                          <div>
                            <strong>{name}</strong>
                            <div className="g-meta">
                              {formatShortDate(r.createdAt)}
                            </div>
                          </div>
                        </div>
                        <Stars
                          value={r.rating}
                          label={`${r.rating} out of 5 stars`}
                        />
                        <p>{r.comment}</p>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
              {reviews.length > 3 && (
                <button
                  className="g-btn g-btn--secondary"
                  type="button"
                  style={{ justifySelf: 'start' }}
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll
                    ? 'Show fewer reviews'
                    : `Show all ${reviews.length} reviews`}
                </button>
              )}
            </section>
          </div>

          <aside className="g-side" aria-label="Book this venue">
            <div className="g-panel">
              <span className="g-grab" aria-hidden="true" />
              <h2 style={{ fontSize: 19 }}>Check availability</h2>

              {(conflict || bookError) && (
                <Banner
                  title={conflict ? 'That time is taken' : bookError!.title}
                >
                  {conflict ? (
                    <>
                      This slot conflicts with an existing booking from{' '}
                      <span className="g-num">{conflict}</span>. Please choose a
                      different time.
                    </>
                  ) : (
                    bookError!.text
                  )}
                </Banner>
              )}

              <div className="g-field">
                <span className="g-label" id="dl">
                  Date
                </span>
                <Calendar selected={dateKey} onSelect={changeDate} />
              </div>

              <div className="g-field">
                <span className="g-label" id="sl">
                  {slotsTitle}
                </span>
                <span className="g-hint">
                  Tap a start hour. Tap a later hour to book several hours in a
                  row.
                </span>
                {availQ.error && (
                  <Banner
                    title="We could not load availability"
                    action={
                      <button
                        className="g-btn g-btn--secondary g-btn--sm"
                        type="button"
                        onClick={availQ.reload}
                      >
                        Try again
                      </button>
                    }
                  >
                    Please try again.
                  </Banner>
                )}
                <div
                  className="g-slots"
                  role="group"
                  aria-labelledby="sl"
                  aria-busy={availQ.loading}
                  style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))',
                  }}
                >
                  {Array.from({ length: 24 }, (_, h) => {
                    const off = availQ.loading || unavailable(h);
                    const on = !!sel && h >= sel.a && h <= sel.b;
                    return (
                      <button
                        key={h}
                        className="g-slot"
                        type="button"
                        aria-pressed={on}
                        disabled={off && !on}
                        aria-label={`${hourLabel(h)}${off ? ', taken' : on ? ', selected' : ', free'}`}
                        onClick={() => pick(h)}
                      >
                        {hourLabel(h)}
                      </button>
                    );
                  })}
                </div>
                <div className="g-row g-hint" style={{ gap: 16 }}>
                  <span>Outlined: free</span>
                  <span>Green with a tick: selected</span>
                  <span style={{ textDecoration: 'line-through' }}>
                    Struck through
                  </span>
                  <span>: taken</span>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--line)',
                  paddingTop: 12,
                  display: 'grid',
                  gap: 4,
                }}
                aria-live="polite"
              >
                {sel ? (
                  <>
                    <div className="g-kv" style={{ border: 0, padding: 0 }}>
                      <span>
                        {hourLabel(sel.a)} -{' '}
                        {sel.b + 1 === 24 ? '24:00' : hourLabel(sel.b + 1)}
                      </span>
                      <span>
                        {money(venue.pricePerHour)} x {hours}{' '}
                        {hours === 1 ? 'hour' : 'hours'}
                      </span>
                    </div>
                    <div className="g-total">
                      <span style={{ fontWeight: 600 }}>Estimate</span>
                      <b>{money(venue.pricePerHour * hours)}</b>
                    </div>
                    <span className="g-hint">
                      Estimated, final price confirmed at checkout
                    </span>
                  </>
                ) : (
                  <span className="g-muted">
                    Pick a start hour to see the price.
                  </span>
                )}
              </div>

              <button
                className="g-btn g-btn--accent g-btn--block"
                type="button"
                disabled={!sel || booking}
                onClick={book}
                aria-busy={booking}
              >
                {booking && <span className="g-spin" />}
                Book
              </button>
              {!user && sel && (
                <span className="g-hint">
                  You'll be asked to log in before you pay.
                </span>
              )}
            </div>
          </aside>
        </div>

        {(similarQ.data?.length ?? 0) > 0 && (
          <section aria-label="Similar venues" style={{ marginTop: 24 }}>
            <h2 className="g-h2">Similar venues</h2>
            <div className="g-cards">
              {similarQ.data!.map((v, i) => (
                <VenueCard key={v._id} venue={v} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
