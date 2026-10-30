import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { SUPPORT_EMAIL } from '../lib/config';
import { useAuth } from '../context/AuthContext';
import { useIsMobile, useTheme } from '../hooks/useMedia';
import { Backdrop } from './Motion';

function Header() {
  const { user } = useAuth();
  return (
    <header className="g-top">
      <div className="g-wrap g-top-in">
        <Link className="g-word" to="/">
          <img src="/icons/golfy-logo-white.png" alt="Golfy" />
        </Link>
        <span className="g-sp" />
        <nav
          aria-label="Main"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}
        >
          <NavLink className="g-navl" to="/venues">
            Venues
          </NavLink>
          {!user && (
            <>
              <NavLink className="g-navl" to="/login">
                Log in
              </NavLink>
              <Link
                className="g-navl"
                to="/signup"
                style={{ border: '1.5px solid #fff' }}
              >
                Sign up
              </Link>
            </>
          )}
          {user && (
            <>
              <NavLink className="g-navl" to="/bookings">
                My bookings
              </NavLink>
              <NavLink className="g-navl" to="/favourites">
                <i className="i i-heart" />
                Favourites
              </NavLink>
              <NavLink className="g-navl" to="/profile">
                <i className="i i-user" />
                {user.name.split(' ')[0]}
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer({
  theme,
  onToggleTheme,
}: {
  theme: string;
  onToggleTheme: () => void;
}) {
  return (
    <footer className="g-foot">
      <div className="g-wrap g-between">
        <span>
          <strong
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17,
              color: 'var(--ink)',
            }}
          >
            Golfy
          </strong>
          &nbsp;Find a venue, pick a time, play.
        </span>
        <span className="g-row" style={{ gap: 8 }}>
          <button
            className="g-themebtn"
            type="button"
            onClick={onToggleTheme}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <span>
            Support: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </span>
        </span>
      </div>
    </footer>
  );
}

// shared page frame: header, routed page, footer
export default function Layout() {
  const isMobile = useIsMobile();
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // the sticky header gets a shadow once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`g-app${isMobile ? ' is-m' : ''}`}
      data-theme={theme}
      data-scrolled={scrolled}
    >
      <Backdrop />
      <Header />
      <div
        className="g-pagein"
        key={
          pathname === '/login' || pathname === '/signup' ? 'auth' : pathname
        }
      >
        <Outlet context={{ isMobile }} />
      </div>
      <Footer theme={theme} onToggleTheme={toggle} />
    </div>
  );
}
