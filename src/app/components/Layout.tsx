import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { SUPPORT_EMAIL } from '../lib/config';
import { useAuth } from '../context/AuthContext';
import { useIsMobile, useTheme } from '../hooks/useMedia';

function Header({ theme }: { theme: string }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // the mobile menu closes when you navigate
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="g-top">
      <div className="g-wrap g-top-in">
        <Link className="g-word" to="/" aria-label="Golfy, home">
          <img
            src={
              theme === 'dark'
                ? '/icons/golfy-logo-white.png'
                : '/icons/golfy-logo.png'
            }
            alt="Golfy"
          />
        </Link>
        <span className="g-sp" />
        <button
          className="g-iconbtn g-menubtn"
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(!open)}
        >
          <i className={`i ${open ? 'i-x' : 'i-menu'}`} />
        </button>
        <nav id="main-nav" className="g-nav" aria-label="Main" data-open={open}>
          <NavLink className="g-navl" to="/venues">
            Venues
          </NavLink>
          {!user && (
            <>
              <NavLink className="g-navl" to="/login">
                Log in
              </NavLink>
              <Link className="g-navl g-navl--cta" to="/signup">
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
      <div className="g-wrap">
        <div className="g-foot-grid">
          <div className="g-foot-brand">
            <img src="/icons/golfy-logo-white.png" alt="Golfy" />
            <p>
              Find a venue, pick a time, play. Courses, simulators and ranges,
              booked by the hour.
            </p>
          </div>
          <nav aria-label="Explore">
            <h2>Explore</h2>
            <ul>
              <li>
                <Link to="/venues">All venues</Link>
              </li>
              <li>
                <Link to="/venues?type=Course">Courses</Link>
              </li>
              <li>
                <Link to="/venues?type=Simulator">Simulators</Link>
              </li>
              <li>
                <Link to="/venues?type=Range">Ranges</Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Support">
            <h2>Support</h2>
            <ul>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </li>
              <li>
                <Link to="/bookings">My bookings</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="g-foot-base">
          <span>Golfy. A portfolio project with fictional venues. <Link to="/credits">Photo credits</Link></span>
          <button
            className="g-themebtn"
            type="button"
            onClick={onToggleTheme}
            aria-pressed={theme === 'dark'}
          >
            <i className={`i ${theme === 'dark' ? 'i-sun' : 'i-moon'}`} />
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
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

  // the sticky header gets a hairline and shadow once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="g-app" data-theme={theme} data-scrolled={scrolled}>
      <Header theme={theme} />
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
