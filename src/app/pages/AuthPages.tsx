import React, { FormEvent, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/ui';
import {
  AuthShell,
  AuthSuccess,
  IconField,
  StrengthMeter,
} from '../components/AuthShell';
import { apiError } from '../lib/format';
import { SUPPORT_EMAIL } from '../lib/config';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

// only same-site paths are allowed as a post-login destination
const safeNext = (value: string | null) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : null;

type Welcome = { title: string; subtitle: string };

function useShake() {
  const [shake, setShake] = useState(false);
  return { shake, trigger: () => setShake(true), onEnd: () => setShake(false) };
}

function LoginForm({
  onDone,
  expired,
  blockedFlag,
}: {
  onDone: (w: Welcome) => void;
  expired: boolean;
  blockedFlag: boolean;
}) {
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const { shake, trigger, onEnd } = useShake();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<
    'unknown' | 'wrong' | 'blocked' | 'tooMany' | 'server' | null
  >(null);

  const eEmail = tried && !email.trim();
  const ePass = tried && !password;

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setTried(true);
    setProblem(null);
    if (!email.trim() || !password) return trigger();
    setBusy(true);
    try {
      const user = await authApi.login({ email: email.trim(), password });
      onDone({
        title: t('auth.welcomeBack', { name: user.name.split(' ')[0] }),
        subtitle: t('auth.welcomeBackText'),
      });
      setUser(user);
    } catch (err) {
      const { status } = apiError(err);
      setProblem(
        status === 404
          ? 'unknown'
          : status === 401
            ? 'wrong'
            : status === 403
              ? 'blocked'
              : status === 429
                ? 'tooMany'
                : 'server',
      );
      trigger();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div>
        <h1 className="g-h1">{t('auth.loginHeading')}</h1>
        <p className="sub">{t('auth.loginSub')}</p>
      </div>

      {expired && (
        <Banner info icon="i-clock" title={t('auth.sessionEnded')}>
          {t('auth.sessionEndedText')}
        </Banner>
      )}
      {(blockedFlag || problem === 'blocked') && (
        <Banner
          icon="i-slash"
          title={
            <Trans
              i18nKey="auth.blocked"
              values={{ email: SUPPORT_EMAIL }}
              components={{ mail: <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'inherit' }}>{SUPPORT_EMAIL}</a> }}
            />
          }
        />
      )}
      {problem === 'tooMany' && (
        <Banner title={t('apiError.tooManyRequests')} />
      )}
      {problem === 'server' && (
        <Banner title={t('auth.serverTitle')}>
          {t('auth.loginServerText')}
        </Banner>
      )}

      <div
        className={shake ? 'g-shake' : undefined}
        onAnimationEnd={(e) => e.animationName === 'g-shake' && onEnd()}
      >
        <form className="g-form-in" onSubmit={submit} noValidate>
          <div style={{ '--n': 0 } as React.CSSProperties}>
            <IconField
              id="le"
              label={t('auth.email')}
              icon="i-mail"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              invalid={eEmail || problem === 'unknown'}
              onChange={(v) => {
                setEmail(v);
                setProblem(null);
              }}
              error={
                eEmail ? (
                  t('auth.enterEmail')
                ) : problem === 'unknown' ? (
                  <Trans i18nKey="auth.unknownEmail" components={{ link: <Link to="/signup" /> }} />
                ) : undefined
              }
            />
          </div>
          <div style={{ '--n': 1 } as React.CSSProperties}>
            <IconField
              id="lp"
              label={t('auth.password')}
              icon="i-lock"
              type="password"
              autoComplete="current-password"
              value={password}
              invalid={ePass || problem === 'wrong'}
              onChange={(v) => {
                setPassword(v);
                setProblem(null);
              }}
              error={
                ePass
                  ? t('auth.enterPassword')
                  : problem === 'wrong'
                    ? t('auth.wrongPassword')
                    : undefined
              }
            />
          </div>
          <button
            className="g-btn g-btn--primary g-btn--lg g-btn--block"
            style={{ '--n': 2 } as React.CSSProperties}
            type="submit"
            disabled={busy || problem === 'tooMany'}
          >
            {busy ? <span className="g-spin" /> : null}
            {t('auth.submitLogin')} <i className="i i-right arrow" />
          </button>
          <p className="g-secure" style={{ '--n': 3 } as React.CSSProperties}>
            <i className="i i-lock" />
            {t('auth.secure')}
          </p>
        </form>
      </div>
    </>
  );
}

function SignupForm({ onDone }: { onDone: (w: Welcome) => void }) {
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const { shake, trigger, onEnd } = useShake();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<
    'email' | 'phone' | 'tooMany' | 'server' | null
  >(null);

  const e = {
    name: !form.name.trim(),
    email: !EMAIL_RE.test(form.email.trim()),
    phone: !PHONE_RE.test(form.phone.trim()),
    password: form.password.length < 8,
  };
  const set = (key: keyof typeof form) => (v: string) => {
    setForm({ ...form, [key]: v });
    setProblem(null);
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setTried(true);
    setProblem(null);
    if (e.name || e.email || e.phone || e.password) return trigger();
    setBusy(true);
    try {
      const account = await authApi.signup({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      onDone({
        title: t('auth.welcomeNew', { name: account.name.split(' ')[0] }),
        subtitle: t('auth.welcomeNewText'),
      });
      setUser(account);
    } catch (err) {
      const { status, raw } = apiError(err);
      if (status === 429) setProblem('tooMany');
      else if (/email/i.test(raw) && /already/i.test(raw))
        setProblem('email');
      else if (/phone/i.test(raw) && /already/i.test(raw))
        setProblem('phone');
      else setProblem('server');
      trigger();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div>
        <h1 className="g-h1">{t('auth.signupHeading')}</h1>
        <p className="sub">{t('auth.signupSub')}</p>
      </div>

      {problem === 'tooMany' && (
        <Banner title={t('apiError.tooManyRequests')} />
      )}
      {problem === 'server' && (
        <Banner title={t('auth.serverTitle')}>
          {t('auth.signupServerText')}
        </Banner>
      )}

      <div
        className={shake ? 'g-shake' : undefined}
        onAnimationEnd={(ev) => ev.animationName === 'g-shake' && onEnd()}
      >
        <form className="g-form-in" onSubmit={submit} noValidate>
          <div style={{ '--n': 0 } as React.CSSProperties}>
            <IconField
              id="sn"
              label={t('auth.fullName')}
              icon="i-user"
              autoComplete="name"
              value={form.name}
              onChange={set('name')}
              error={tried && e.name ? t('auth.nameError') : undefined}
            />
          </div>
          <div style={{ '--n': 1 } as React.CSSProperties}>
            <IconField
              id="se"
              label={t('auth.email')}
              icon="i-mail"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              invalid={problem === 'email'}
              error={
                tried && e.email ? (
                  t('auth.emailError')
                ) : problem === 'email' ? (
                  <Trans i18nKey="auth.emailUsed" components={{ link: <Link to="/login" /> }} />
                ) : undefined
              }
            />
          </div>
          <div style={{ '--n': 2 } as React.CSSProperties}>
            <IconField
              id="sp"
              label={t('auth.phone')}
              icon="i-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t('auth.phonePlaceholder')}
              value={form.phone}
              onChange={set('phone')}
              invalid={problem === 'phone'}
              error={
                tried && e.phone
                  ? t('auth.phoneError')
                  : problem === 'phone'
                    ? t('auth.phoneUsed')
                    : undefined
              }
            />
          </div>
          <div style={{ '--n': 3 } as React.CSSProperties}>
            <IconField
              id="sw"
              label={t('auth.password')}
              icon="i-lock"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
              invalid={tried && e.password}
              hint={<StrengthMeter password={form.password} />}
              error={
                tried && e.password ? t('auth.passwordError') : undefined
              }
            />
          </div>
          <button
            className="g-btn g-btn--primary g-btn--lg g-btn--block"
            style={{ '--n': 4 } as React.CSSProperties}
            type="submit"
            disabled={busy || problem === 'tooMany'}
          >
            {busy ? <span className="g-spin" /> : null}
            {t('auth.submitSignup')} <i className="i i-right arrow" />
          </button>
          <p className="g-secure" style={{ '--n': 5 } as React.CSSProperties}>
            <i className="i i-lock" />
            {t('auth.secure')}
          </p>
        </form>
      </div>
    </>
  );
}

/** log in and sign up share one screen, so the tab switch and the scene stay put */
export default function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const mode: 'login' | 'signup' = pathname === '/signup' ? 'signup' : 'login';
  const [welcome, setWelcome] = useState<Welcome | null>(null);

  // already logged in? nothing to do here
  useEffect(() => {
    if (user && !welcome) navigate(next ?? '/', { replace: true });
  }, [user, welcome, next, navigate]);

  const goOn = () => navigate(next ?? '/venues', { replace: true });

  return (
    <>
      <AuthShell mode={mode} next={next}>
        {mode === 'login' ? (
          <LoginForm
            key="login"
            onDone={setWelcome}
            expired={!!params.get('expired')}
            blockedFlag={!!params.get('blocked')}
          />
        ) : (
          <SignupForm key="signup" onDone={setWelcome} />
        )}
      </AuthShell>
      {welcome && (
        <AuthSuccess
          title={welcome.title}
          subtitle={welcome.subtitle}
          onContinue={goOn}
        />
      )}
    </>
  );
}
