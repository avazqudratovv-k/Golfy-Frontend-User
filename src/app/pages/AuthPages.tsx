import React, { FormEvent, useEffect, useState } from 'react';
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
        title: `Welcome back, ${user.name.split(' ')[0]}`,
        subtitle: "You're logged in. Let's find you a tee time.",
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
        <h1 className="g-h1">Log in</h1>
        <p className="sub">Good to see you again.</p>
      </div>

      {expired && (
        <Banner info icon="i-clock" title="Your session ended">
          Please log in again to keep booking.
        </Banner>
      )}
      {(blockedFlag || problem === 'blocked') && (
        <Banner
          icon="i-slash"
          title={
            <>
              You have been blocked, contact{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'inherit' }}>
                {SUPPORT_EMAIL}
              </a>
            </>
          }
        />
      )}
      {problem === 'tooMany' && (
        <Banner title="Too many requests, please try again later!" />
      )}
      {problem === 'server' && (
        <Banner title="Something went wrong on our side">
          You were not logged in. Please try again.
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
              label="Email"
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
                  'Enter your email.'
                ) : problem === 'unknown' ? (
                  <>
                    We can't find an account with this email.{' '}
                    <Link to="/signup">Sign up</Link>
                  </>
                ) : undefined
              }
            />
          </div>
          <div style={{ '--n': 1 } as React.CSSProperties}>
            <IconField
              id="lp"
              label="Password"
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
                  ? 'Enter your password.'
                  : problem === 'wrong'
                    ? 'That password is not right. Try again.'
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
            Log in <i className="i i-right arrow" />
          </button>
          <p className="g-secure" style={{ '--n': 3 } as React.CSSProperties}>
            <i className="i i-lock" />
            Your password is stored encrypted.
          </p>
        </form>
      </div>
    </>
  );
}

function SignupForm({ onDone }: { onDone: (w: Welcome) => void }) {
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
        title: `Welcome to Golfy, ${account.name.split(' ')[0]}`,
        subtitle: 'Your account is ready. Time to book your first round.',
      });
      setUser(account);
    } catch (err) {
      const { status, message } = apiError(err);
      if (status === 429) setProblem('tooMany');
      else if (/email/i.test(message) && /already/i.test(message))
        setProblem('email');
      else if (/phone/i.test(message) && /already/i.test(message))
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
        <h1 className="g-h1">Create your account</h1>
        <p className="sub">It takes less than a minute.</p>
      </div>

      {problem === 'tooMany' && (
        <Banner title="Too many requests, please try again later!" />
      )}
      {problem === 'server' && (
        <Banner title="Something went wrong on our side">
          Your account was not created. Please try again.
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
              label="Full name"
              icon="i-user"
              autoComplete="name"
              value={form.name}
              onChange={set('name')}
              error={tried && e.name ? 'Please add your name.' : undefined}
            />
          </div>
          <div style={{ '--n': 1 } as React.CSSProperties}>
            <IconField
              id="se"
              label="Email"
              icon="i-mail"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              invalid={problem === 'email'}
              error={
                tried && e.email ? (
                  'Enter an email like you@example.com.'
                ) : problem === 'email' ? (
                  <>
                    This email is already in use.{' '}
                    <Link to="/login">Log in instead</Link>
                  </>
                ) : undefined
              }
            />
          </div>
          <div style={{ '--n': 2 } as React.CSSProperties}>
            <IconField
              id="sp"
              label="Phone"
              icon="i-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+1 415 555 0142"
              value={form.phone}
              onChange={set('phone')}
              invalid={problem === 'phone'}
              error={
                tried && e.phone
                  ? 'Enter a phone number with country code.'
                  : problem === 'phone'
                    ? 'This phone number is already in use.'
                    : undefined
              }
            />
          </div>
          <div style={{ '--n': 3 } as React.CSSProperties}>
            <IconField
              id="sw"
              label="Password"
              icon="i-lock"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
              invalid={tried && e.password}
              hint={<StrengthMeter password={form.password} />}
              error={
                tried && e.password ? 'Use at least 8 characters.' : undefined
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
            Create account <i className="i i-right arrow" />
          </button>
          <p className="g-secure" style={{ '--n': 5 } as React.CSSProperties}>
            <i className="i i-lock" />
            Your password is stored encrypted.
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
