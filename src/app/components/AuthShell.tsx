import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { Link } from 'react-router-dom';
import { FieldError } from './ui';
import { Confetti } from './Motion';

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const POINT_ICONS = ['i-clock', 'i-cal', 'i-star'];

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
  const { t } = useTranslation();
  const points = t('auth.points', { returnObjects: true }) as unknown as string[];
  const suffix = next ? `?next=${encodeURIComponent(next)}` : '';
  return (
    <main className="g-authx">
      <aside className="g-authx-art">
        <img className="g-authx-logo" src="/brand/golfy-logo-light.svg" alt="" aria-hidden="true" width="128" height="48" />
        <div className="g-authx-copy">
          <h2>
            {mode === 'login' ? t('auth.loginTitle') : t('auth.signupTitle')}
          </h2>
          <p className="lead">
            {mode === 'login' ? t('auth.loginLead') : t('auth.signupLead')}
          </p>
          <ul className="g-authx-points">
            {points.map((text, i) => (
              <li key={text} style={{ '--n': i } as React.CSSProperties}>
                <span className="ic">
                  <i className={`i ${POINT_ICONS[i]}`} />
                </span>
                {text}
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
            aria-label={t('auth.account')}
          >
            <Link
              to={`/login${suffix}`}
              aria-current={mode === 'login' ? 'page' : undefined}
            >
              {t('auth.login')}
            </Link>
            <Link
              to={`/signup${suffix}`}
              aria-current={mode === 'signup' ? 'page' : undefined}
            >
              {t('auth.signup')}
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
  const { t } = useTranslation();
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
            aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')}
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
  if (pw.length < 8) return { level: 1, label: i18n.t('auth.strength.tooShort') };
  const score =
    1 +
    (/[a-z]/.test(pw) && /[A-Z]/.test(pw) ? 1 : 0) +
    (/\d/.test(pw) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12 ? 1 : 0);
  return {
    level: Math.min(4, score),
    label: ['', i18n.t('auth.strength.weak'), i18n.t('auth.strength.okay'), i18n.t('auth.strength.good'), i18n.t('auth.strength.strong')][Math.min(4, score)],
  };
}

export function StrengthMeter({ password }: { password: string }) {
  const { t } = useTranslation();
  const { level, label } = strengthOf(password);
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div className={`g-meter lv${level}`} aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <i key={n} className={n <= level ? 'on' : ''} />
        ))}
      </div>
      <span className="g-hint" aria-live="polite">
        {password ? t('auth.strengthLine', { label }) : t('auth.minChars')}
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
  const { t } = useTranslation();
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
          {t('auth.continue')} <i className="i i-right arrow" />
        </button>
      </div>
    </div>
  );
}
