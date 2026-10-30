import React, { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { messageApi, reviewApi, venueApi } from '../services/api';
import { useLoader } from '../hooks/useMedia';
import {
  Banner,
  FieldError,
  Stars,
  VenueCard,
  VenueCardSkeleton,
} from '../components/ui';
import { CountUp, HeroScene, Reveal } from '../components/Motion';
import { formatShortDate, initials } from '../lib/format';
import { SUPPORT_EMAIL } from '../lib/config';
import { apiError } from '../lib/format';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function Stats() {
  const { data } = useLoader(() => venueApi.stats(), []);
  const fmt = (n?: number) => (n === undefined ? '–' : <CountUp value={n} />);
  return (
    <section aria-label="Golfy in numbers">
      <div className="g-wrap">
        <div className="g-stats">
          <Reveal className="g-stat">
            <b>{fmt(data?.totalBookings)}</b>
            <span className="g-muted">Total bookings</span>
          </Reveal>
          <Reveal className="g-stat">
            <b>{fmt(data?.totalVenues)}</b>
            <span className="g-muted">Active venues</span>
          </Reveal>
          <Reveal className="g-stat">
            <b>{fmt(data?.totalUsers)}</b>
            <span className="g-muted">Active players</span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [tried, setTried] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>(
    'idle',
  );
  const [tooMany, setTooMany] = useState(false);

  const errors = {
    name: !form.name.trim(),
    email: !EMAIL_RE.test(form.email),
    message: !form.message.trim(),
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (errors.name || errors.email || errors.message) return;
    setState('sending');
    setTooMany(false);
    try {
      await messageApi.create(form);
      setState('sent');
      setTried(false);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setTooMany(apiError(err).status === 429);
      setState('failed');
    }
  };

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value });

  return (
    <form
      className="g-box"
      style={{ flex: '2 1 420px' }}
      onSubmit={submit}
      noValidate
    >
      {state === 'sent' && (
        <Banner info icon="i-check" title="Message sent">
          Thanks. We'll reply by email as soon as we can.
        </Banner>
      )}
      {state === 'failed' && (
        <Banner
          title={
            tooMany
              ? 'Too many requests, please try again later!'
              : 'We could not send your message'
          }
        >
          {!tooMany && <>Please try again, or email {SUPPORT_EMAIL}.</>}
        </Banner>
      )}
      <div className="g-formgrid">
        <div className={`g-field${tried && errors.name ? ' is-invalid' : ''}`}>
          <label className="g-label" htmlFor="cn">
            Name
          </label>
          <input
            className="g-input"
            id="cn"
            autoComplete="name"
            value={form.name}
            onChange={set('name')}
            maxLength={100}
          />
          {tried && errors.name && (
            <FieldError>Please add your name.</FieldError>
          )}
        </div>
        <div className={`g-field${tried && errors.email ? ' is-invalid' : ''}`}>
          <label className="g-label" htmlFor="ce">
            Email
          </label>
          <input
            className="g-input"
            id="ce"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            maxLength={200}
          />
          {tried && errors.email && (
            <FieldError>Enter an email like you@example.com.</FieldError>
          )}
        </div>
      </div>
      <div className={`g-field${tried && errors.message ? ' is-invalid' : ''}`}>
        <label className="g-label" htmlFor="cm">
          Message
        </label>
        <textarea
          className="g-textarea"
          id="cm"
          placeholder="How can we help?"
          value={form.message}
          onChange={set('message')}
          maxLength={5000}
        />
        {tried && errors.message && (
          <FieldError>Please add a message.</FieldError>
        )}
      </div>
      <div>
        <button
          className="g-btn g-btn--primary"
          type="submit"
          disabled={state === 'sending'}
        >
          {state === 'sending' && <span className="g-spin" />}
          Send message
        </button>
      </div>
    </form>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const top = useLoader(() => venueApi.top(), []);
  const reviews = useLoader(() => reviewApi.recent({ limit: 3 }), []);

  const search = (e: FormEvent) => {
    e.preventDefault();
    navigate(
      q.trim() ? `/venues?q=${encodeURIComponent(q.trim())}` : '/venues',
    );
  };

  return (
    <>
      <section className="g-hero" aria-label="Find a venue">
        <HeroScene />
        <div className="g-wrap">
          <h1 className="g-rise d1">
            <span className="g-sr">Book your next round, session or practice.</span>
            <span aria-hidden="true">
              Book your next{" "}
              <span className="g-words">
                <span className="g-words-in">
                  <span>round</span>
                  <span>session</span>
                  <span>practice</span>
                  <span>game</span>
                  <span>round</span>
                </span>
              </span>
            </span>
          </h1>
          <p className="g-rise d2">
            Courses, simulators and practice ranges, booked by the hour.
          </p>
          <form
            className="g-searchbar g-rise d3"
            onSubmit={search}
            role="search"
          >
            <div className="g-field">
              <label className="g-label" htmlFor="hs">
                Venue name
              </label>
              <input
                className="g-input"
                id="hs"
                type="search"
                placeholder="Try Emerald Ridge"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button
              className="g-btn g-btn--primary"
              type="submit"
              style={{ alignSelf: 'flex-end' }}
            >
              <i className="i i-search" />
              Find a venue
            </button>
          </form>
        </div>
        <div className="g-hero-chips g-rise d3">
          <Link className="g-hero-chip" to="/venues?type=Course" style={{ "--d": "0s" } as React.CSSProperties}>
            <i className="i i-flag" />
            <span>Courses<small>18 holes and short courses</small></span>
          </Link>
          <Link className="g-hero-chip" to="/venues?type=Simulator" style={{ "--d": "-1.8s" } as React.CSSProperties}>
            <i className="i i-grid" />
            <span>Simulators<small>Play any weather</small></span>
          </Link>
          <Link className="g-hero-chip" to="/venues?type=Range" style={{ "--d": "-3.6s" } as React.CSSProperties}>
            <i className="i i-pin" />
            <span>Ranges<small>Practice by the hour</small></span>
          </Link>
        </div>
        <span className="g-scrollcue" aria-hidden="true" />
      </section>

      <div className="g-marquee" aria-hidden="true">
        <div className="track">
          {[0, 1].map((n) => (
            <React.Fragment key={n}>
              <span>Courses</span>
              <span>Simulators</span>
              <span>Practice ranges</span>
              <span>Tee times</span>
              <span>Book by the hour</span>
              <span>Play more golf</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <section className="g-sec">
        <div className="g-wrap">
          <div className="g-between" style={{ marginBottom: 8 }}>
            <h2 className="g-h2" style={{ margin: 0 }}>
              Top venues
            </h2>
            <Link
              to="/venues"
              style={{
                fontWeight: 600,
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              See all venues
            </Link>
          </div>
          {top.error && (
            <Banner
              title="We could not load venues"
              action={
                <button
                  className="g-btn g-btn--secondary g-btn--sm"
                  type="button"
                  onClick={top.reload}
                >
                  Try again
                </button>
              }
            >
              Something went wrong on our side. Please try again.
            </Banner>
          )}
          <div
            className="g-cards"
            style={{ marginTop: 16 }}
            aria-busy={top.loading}
          >
            {top.loading &&
              [1, 2, 3, 4].map((k) => <VenueCardSkeleton key={k} />)}
            {top.data?.map((v, i) => (
              <VenueCard key={v._id} venue={v} index={i} />
            ))}
          </div>
        </div>
      </section>

      <Stats />

      <section className="g-sec">
        <div className="g-wrap">
          <h2 className="g-h2">Recent reviews</h2>
          <div className="g-cards">
            {reviews.loading &&
              [1, 2, 3].map((k) => (
                <div className="g-card" key={k}>
                  <div className="g-card-body">
                    <div className="g-skel" style={{ height: 120 }} />
                  </div>
                </div>
              ))}
            {reviews.data?.length === 0 && (
              <p className="g-muted">
                No reviews yet. Be the first after you play.
              </p>
            )}
            {reviews.data?.map((r, i) => {
              const name = r.userData?.[0]?.name ?? 'Golfy player';
              return (
                <Reveal key={r._id} delay={i * 110} style={{ display: 'flex' }}>
                  <article className="g-card" style={{ flex: 1 }}>
                    <div className="g-card-body" style={{ gap: 12 }}>
                      <div className="g-row">
                        <span className="g-avatar" aria-hidden="true">
                          {initials(name)}
                        </span>
                        <div>
                          <strong>{name}</strong>
                          <div className="g-meta">
                            {r.venueData?.[0]?.venueName} ·{' '}
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
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 80 }}>
        <div className="g-wrap">
          <div className="g-two">
            <div style={{ flex: '1 1 300px' }}>
              <h2 className="g-h2" style={{ marginBottom: 8 }}>
                Get in touch
              </h2>
              <p className="g-muted">
                Question about a booking or a venue? Send us a note, or email{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
