import React, { useEffect, useRef, useState } from 'react';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** title block used at the top of inner pages: heading, a line of context and optional actions */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const reveal = useReveal<HTMLElement>();
  return (
    <header ref={reveal.ref} className={`g-pagehead ${reveal.className}`}>
      <div>
        <h1 className="g-h1">{title}</h1>
        {subtitle && (
          <p className="g-muted" style={{ marginTop: 4 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="g-actions">{actions}</div>}
    </header>
  );
}

/** fades and lifts an element in the first time it scrolls into view */
export function useReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced() || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return {
    ref,
    className: `g-reveal${shown ? ' is-in' : ''}`,
    style: delay
      ? ({ transitionDelay: `${delay}ms` } as React.CSSProperties)
      : undefined,
  };
}

export function Reveal({
  children,
  delay = 0,
  className = '',
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const r = useReveal<HTMLDivElement>(delay);
  return (
    <div
      ref={r.ref}
      className={`${r.className} ${className}`.trim()}
      style={{ ...r.style, ...style }}
    >
      {children}
    </div>
  );
}

/** number that counts up when it scrolls into view */
export function CountUp({
  value,
  duration = 1400,
}: {
  value: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced() || typeof IntersectionObserver === 'undefined') {
      setN(value);
      return;
    }
    let raf = 0;
    let started = false;
    const run = () => {
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);
  return <span ref={ref}>{n.toLocaleString('ko-KR')}</span>;
}

const CONFETTI_COLORS = ['#C7F23A', '#E4F9A0', '#2B2FA8', '#8E96FF', '#ffffff'];

/** a short burst of confetti, once per booking per browser session */
export function Confetti({ storageKey }: { storageKey: string }) {
  const [show, setShow] = useState(() => {
    if (prefersReduced()) return false;
    try {
      return !sessionStorage.getItem(storageKey);
    } catch {
      return true;
    }
  });
  useEffect(() => {
    if (!show) return;
    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {}
    const t = window.setTimeout(() => setShow(false), 5200);
    return () => window.clearTimeout(t);
  }, [show, storageKey]);
  if (!show) return null;
  return (
    <div className="g-confetti" aria-hidden="true">
      {Array.from({ length: 44 }, (_, i) => (
        <i
          key={i}
          style={
            {
              left: `${(i * 37 + 11) % 100}%`,
              '--s': `${7 + (i % 4) * 2}px`,
              '--c': CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              '--d': `${2.8 + (i % 6) * 0.28}s`,
              '--t': `${(i % 11) * 0.09}s`,
              '--x': `${((i % 7) - 3) * 38}px`,
              '--r': `${(i % 2 ? 1 : -1) * (360 + i * 9)}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
