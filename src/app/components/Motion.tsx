import React, { useEffect, useRef, useState } from 'react';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** soft drifting light and slow contour lines behind every page */
export function Backdrop() {
  return (
    <div className="g-bg" aria-hidden="true">
      <span className="orb orb--1" />
      <span className="orb orb--2" />
      <span className="orb orb--3" />
      <span className="lines" />
    </div>
  );
}

/** two copies of a repeating hill shape side by side, so it can slide forever without a seam */
export function Hills({
  fill,
  y,
  amp,
}: {
  fill: string;
  y: number;
  amp: number;
}) {
  const half = `M0 ${y} C300 ${y - amp} 600 ${y + amp} 900 ${y} C1050 ${y - amp / 2} 1150 ${y - amp / 3} 1200 ${y} L1200 400 L0 400Z`;
  return (
    <svg viewBox="0 0 2400 400" preserveAspectRatio="none">
      <path d={half} fill={fill} />
      <path d={half} fill={fill} transform="translate(1200)" />
    </svg>
  );
}

const CLOUD =
  'M20 70 Q4 70 4 54 Q4 40 20 38 Q24 16 48 16 Q66 16 72 32 Q90 26 100 40 Q116 40 116 56 Q116 70 100 70Z';
const STARS = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 53 + 7) % 96,
  y: 4 + ((i * 29) % 34),
  d: `${(i % 7) * 0.5}s`,
}));
const SPARKS = Array.from({ length: 14 }, (_, i) => ({
  x: (i * 71 + 9) % 100,
  s: 3 + (i % 3) * 2,
  d: `${7 + (i % 5)}s`,
  t: `${(i % 9) * 0.8}s`,
  sx: `${((i % 5) - 2) * 30}px`,
}));

/** the Home hero: sunrise, clouds, three layers of hills that follow the pointer, and a long tee shot into the hole */
export function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);

  // pointer position (-1..1) is written to CSS variables; the layers move by different amounts (parallax)
  useEffect(() => {
    const hero = ref.current?.parentElement;
    if (!hero || prefersReduced()) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty(
          '--px',
          (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3),
        );
        hero.style.setProperty(
          '--py',
          (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3),
        );
      });
    };
    hero.addEventListener('pointermove', move);
    return () => {
      hero.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="g-sc" aria-hidden="true">
      <span className="g-sc-sun" />
      <div className="g-sc-stars">
        {STARS.map((st, i) => (
          <i
            key={i}
            style={
              { '--x': st.x, '--y': st.y, '--d': st.d } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="g-par g-par--cloud">
        {['c1', 'c2', 'c3'].map((c) => (
          <svg
            key={c}
            className={`g-cloud ${c}`}
            viewBox="0 0 120 80"
            style={c === 'c1' ? { top: '46%' } : undefined}
          >
            <path d={CLOUD} fill="#fff" />
          </svg>
        ))}
      </div>
      <div className="g-par g-par--far">
        <div className="g-hills g-hills--far">
          <Hills fill="#3c8a5e" y={140} amp={80} />
        </div>
      </div>
      <div className="g-par g-par--mid">
        <div className="g-hills g-hills--mid">
          <Hills fill="#245e3d" y={190} amp={70} />
        </div>
      </div>
      <div className="g-par g-par--near">
        <div className="g-hills g-hills--near">
          <Hills fill="#143d27" y={230} amp={60} />
        </div>
      </div>
      <div className="g-sc-spark">
        {SPARKS.map((sp, i) => (
          <i
            key={i}
            style={
              {
                '--x': sp.x,
                '--s': `${sp.s}px`,
                '--d': sp.d,
                '--t': sp.t,
                '--sx': sp.sx,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="g-sc-green">
        <span className="hole" />
        <span className="g-sc-ripple" />
        <span className="g-sc-ripple r2" />
        <span className="pole" />
        <span className="cloth" />
      </div>
      <div className="g-sc-tee" />
      {[7, 6, 5, 4, 3, 2, 1, 0].map((k) => (
        <span
          key={k}
          className={`g-sc-ball${k === 0 ? ' main' : ''}`}
          style={{ '--k': k } as React.CSSProperties}
        >
          <i
            style={
              {
                '--k': k,
                '--s': `${26 - k * 2.2}px`,
                '--o': (k === 0 ? 1 : 0.55 - k * 0.06).toFixed(2),
              } as React.CSSProperties
            }
          />
        </span>
      ))}
    </div>
  );
}

export type HeaderArt = 'hop' | 'clock' | 'hearts' | 'orbit';

function HeaderArtwork({ variant }: { variant: HeaderArt }) {
  if (variant === 'clock') {
    return (
      <svg viewBox="0 0 84 84" fill="none" className="g-art-clock">
        <circle
          cx="42"
          cy="42"
          r="38"
          stroke="currentColor"
          strokeOpacity=".35"
          strokeWidth="2"
        />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="42"
            y1="9"
            x2="42"
            y2={i % 3 === 0 ? 16 : 13}
            stroke="currentColor"
            strokeOpacity=".5"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${i * 30} 42 42)`}
          />
        ))}
        <line
          className="hr"
          x1="42"
          y1="42"
          x2="42"
          y2="25"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          className="min"
          x1="42"
          y1="42"
          x2="42"
          y2="16"
          stroke="#F2B705"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="42" cy="42" r="4" fill="currentColor" />
      </svg>
    );
  }
  if (variant === 'hearts') {
    return (
      <div className="g-art-hearts">
        {[8, 26, 44, 62, 80].map((l, i) => (
          <i
            key={l}
            className="i i-heartf"
            style={
              {
                '--l': l,
                '--t': `${i * 0.7}s`,
                '--sz': `${18 + (i % 3) * 6}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    );
  }
  if (variant === 'orbit') {
    return (
      <div className="g-art-orbit">
        <span className="core">
          <i className="i i-user" />
        </span>
        <span className="ring r1">
          <b />
        </span>
        <span className="ring r2">
          <b />
        </span>
        <span className="ring r3">
          <b />
        </span>
      </div>
    );
  }
  return (
    <>
      <svg viewBox="0 0 230 84" fill="none">
        <path
          d="M8 68 Q104 -22 204 66"
          stroke="currentColor"
          strokeOpacity=".35"
          strokeWidth="1.6"
          strokeDasharray="3 6"
          strokeLinecap="round"
        />
        <ellipse
          cx="206"
          cy="70"
          rx="14"
          ry="4"
          fill="currentColor"
          fillOpacity=".18"
        />
        <line
          x1="206"
          y1="68"
          x2="206"
          y2="26"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path className="flag" d="M207 27 L226 33 L207 40 Z" fill="#F2B705" />
      </svg>
      <span className="ball">
        <i />
      </span>
    </>
  );
}

/** header card used at the top of inner pages: title, a line of context and an animation that fits the page */
export function PageHeader({
  title,
  subtitle,
  actions,
  variant = 'hop',
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: HeaderArt;
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
      <div className={`g-pagehead-art g-art--${variant}`} aria-hidden="true">
        <HeaderArtwork variant={variant} />
      </div>
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
  return <span ref={ref}>{n.toLocaleString('en-US')}</span>;
}

const CONFETTI_COLORS = ['#F2B705', '#1F5B3A', '#8FD6AC', '#ffffff', '#2E7D52'];

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
