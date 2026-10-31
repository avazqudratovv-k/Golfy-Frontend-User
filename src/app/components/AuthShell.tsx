import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FieldError } from './ui';
import { Confetti } from './Motion';

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const POINTS = [
  { icon: 'i-clock', text: 'Book by the hour, no phone calls' },
  { icon: 'i-cal', text: 'See free slots live for any day' },
  { icon: 'i-star', text: 'Review venues after you play' },
];

/** the split-screen frame shared by log in and sign up */
export function AuthShell({
  mode,
  next,
  children,
}: {
  mode: 'login' | 'signup';
  next: string | null;
  children: React.ReactNode;
}) {
  const suffix = next ? `?next=${encodeURIComponent(next)}` : '';
  return (
    <main className="g-authx">
      <aside className="g-authx-art">
        <div className="g-authx-copy">
          <h2>
            {mode === 'login'
              ? 'Your tee time is one tap away.'
              : 'Create your account in a minute.'}
          </h2>
          <p className="lead">
            {mode === 'login'
              ? 'Log in to see your bookings, favourites and the best slots for this weekend.'
              : 'Courses, simulators and ranges, booked by the hour. Free to join.'}
          </p>
          <ul className="g-authx-points">
            {POINTS.map((p, i) => (
              <li key={p.text} style={{ '--n': i } as React.CSSProperties}>
                <span className="ic">
                  <i className={`i ${p.icon}`} />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="g-authx-panel">
        <div className="g-authx-card">
          <nav
            className="g-seg"
            data-active={mode === 'signup' ? 1 : 0}
            aria-label="Account"
          >
            <Link
              to={`/login${suffix}`}
              aria-current={mode === 'login' ? 'page' : undefined}
            >
              Log in
            </Link>
            <Link
              to={`/signup${suffix}`}
              aria-current={mode === 'signup' ? 'page' : undefined}
            >
              Sign up
            </Link>
          </nav>
          {children}
        </div>
      </section>
    </main>
  );
}

/** input with an icon on the left (and an optional show/hide button for passwords) */
export function IconField({
  id,
  label,
  icon,
  error,
  hint,
  invalid,
  type = 'text',
  value,
  onChange,
  ...rest
}: {
  id: string;
  label: string;
  icon: string;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  invalid?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'type' | 'id'
>) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={`g-field${invalid || error ? ' is-invalid' : ''}`}>
      <label className="g-label" htmlFor={id}>
        {label}
      </label>
      <div className={`g-iconin${isPassword ? ' has-toggle' : ''}`}>
        <i className={`i ${icon}`} />
        <input
          id={id}
          className="g-input"
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid || !!error}
          {...rest}
        />
        {isPassword && (
          <button
            className="g-iconbtn"
            type="button"
            aria-label={show ? 'Hide password' : 'Show password'}
            aria-pressed={show}
            onClick={() => setShow(!show)}
          >
            <i className="i i-eye" />
          </button>
        )}
      </div>
      {hint}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

export function strengthOf(pw: string) {
  if (!pw) return { level: 0, label: '' };
  if (pw.length < 8) return { level: 1, label: 'Too short' };
  const score =
    1 +
    (/[a-z]/.test(pw) && /[A-Z]/.test(pw) ? 1 : 0) +
    (/\d/.test(pw) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12 ? 1 : 0);
  return {
    level: Math.min(4, score),
    label: ['', 'Weak', 'Okay', 'Good', 'Strong'][Math.min(4, score)],
  };
}

export function StrengthMeter({ password }: { password: string }) {
  const { level, label } = strengthOf(password);
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div className={`g-meter lv${level}`} aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <i key={n} className={n <= level ? 'on' : ''} />
        ))}
      </div>
      <span className="g-hint" aria-live="polite">
        {password ? `Password strength: ${label}` : 'At least 8 characters.'}
      </span>
    </div>
  );
}

/** full-screen welcome: a green bloom grows from the button, a check draws itself, then we move on */
export function AuthSuccess({
  title,
  subtitle,
  onContinue,
}: {
  title: string;
  subtitle: string;
  onContinue: () => void;
}) {
  const go = useRef(onContinue);
  go.current = onContinue;
  const [sparkKey] = useState(() => `golfy-welcome-${Date.now()}`);
  useEffect(() => {
    const t = window.setTimeout(
      () => go.current(),
      prefersReduced() ? 1400 : 3000,
    );
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div
      className="g-welcome"
      role="status"
      aria-live="polite"
    >
      <Confetti storageKey={sparkKey} />
      <div className="g-welcome-body">
        <svg className="g-check" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="26" />
          <path d="M14 27l8 8 16-17" />
        </svg>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <button
          className="g-btn g-btn--accent g-btn--lg"
          type="button"
          onClick={onContinue}
        >
          Continue <i className="i i-right arrow" />
        </button>
      </div>
    </div>
  );
}
