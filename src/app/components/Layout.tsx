import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from './Brand';
import { LangToggle } from './LangToggle';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { SUPPORT_EMAIL } from '../lib/config';
import { useAuth } from '../context/AuthContext';
import { useIsMobile, useTheme } from '../hooks/useMedia';

function Header({ theme }: { theme: string }) {
  const { t } = useTranslation();
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

  const first = user ? user.name.split(' ')[0] : '';

  return (
    <>
      <header className="g-top">
        <div className="g-wrap g-top-in">
          <Link className="g-word" to="/" aria-label={t('nav.home')}>
            <BrandLogo />
          </Link>
          <span className="g-sp" />
          <LangToggle className="g-lang--top" />
          <button
            className="g-iconbtn g-menubtn"
            type="button"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen(!open)}
          >
            <i className={`i ${open ? 'i-x' : 'i-menu'}`} />
          </button>
          <nav
            id="main-nav"
            className="g-nav"
            aria-label={t('nav.main')}
            data-open={open}
          >
            <NavLink className="g-navl" to="/venues">
              {t('nav.venues')}
            </NavLink>
            {!user && (
              <>
                <NavLink className="g-navl" to="/login">
                  {t('nav.login')}
                </NavLink>
                <Link className="g-navl g-navl--cta" to="/signup">
                  {t('nav.signup')}
                </Link>
              </>
            )}
            {user && (
              <>
                <NavLink className="g-navl" to="/bookings">
                  {t('nav.myBookings')}
                </NavLink>
                <NavLink className="g-navl" to="/favourites">
                  <i className="i i-heart" />
                  {t('nav.favourites')}
                </NavLink>
                <NavLink className="g-navl" to="/profile">
                  <i className="i i-user" />
                  {user.name.split(' ')[0]}
                </NavLink>
              </>
            )}
            <LangToggle className="g-lang--nav" />
          </nav>
        </div>
      </header>
      <nav className="g-tabs" aria-label={t('nav.main')}>
        <NavLink className="g-tab" to="/venues">
          <i className="i i-search" />
          <span>{t('nav.venues')}</span>
        </NavLink>
        {!user && (
          <>
            <NavLink className="g-tab" to="/login">
              <i className="i i-user" />
              <span>{t('nav.login')}</span>
            </NavLink>
            <NavLink className="g-tab" to="/signup">
              <i className="i i-plus" />
              <span>{t('nav.signup')}</span>
            </NavLink>
          </>
        )}
        {user && (
          <>
            <NavLink className="g-tab" to="/favourites">
              <i className="i i-heart" />
              <span>{t('nav.favourites')}</span>
            </NavLink>
            <NavLink className="g-tab" to="/bookings">
              <i className="i i-ticket" />
              <span>{t('nav.myBookings')}</span>
            </NavLink>
            <NavLink className="g-tab" to="/profile">
              <i className="i i-user" />
              <span>{first}</span>
            </NavLink>
          </>
        )}
      </nav>
    </>
  );
}

function Footer({
  theme,
  onToggleTheme,
}: {
  theme: string;
  onToggleTheme: () => void;
}) {
  const { t } = useTranslation();
  return (
    <footer className="g-foot">
      <div className="g-wrap">
        <div className="g-foot-grid">
          <div className="g-foot-brand">
            <img
              src="/brand/golfy-logo-light.svg"
              alt="Golfy"
              width="102"
              height="38"
            />
            <p>{t('footer.tagline')}</p>
          </div>
          <nav aria-label={t('footer.explore')}>
            <h2>{t('footer.explore')}</h2>
            <ul>
              <li>
                <Link to="/venues">{t('footer.allVenues')}</Link>
              </li>
              <li>
                <Link to="/venues?type=Course">{t('footer.courses')}</Link>
              </li>
              <li>
                <Link to="/venues?type=Simulator">
                  {t('footer.simulators')}
                </Link>
              </li>
              <li>
                <Link to="/venues?type=Range">{t('footer.ranges')}</Link>
              </li>
            </ul>
          </nav>
          <nav aria-label={t('footer.support')}>
            <h2>{t('footer.support')}</h2>
            <ul>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </li>
              <li>
                <Link to="/bookings">{t('nav.myBookings')}</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="g-foot-base">
          <span>
            {t('footer.note')}{' '}
            <Link to="/credits">{t('footer.photoCredits')}</Link>
          </span>
          <span className="g-foot-tools">
            <LangToggle />
            <button
              className="g-themebtn"
              type="button"
              onClick={onToggleTheme}
              aria-pressed={theme === 'dark'}
            >
              <i className={`i ${theme === 'dark' ? 'i-sun' : 'i-moon'}`} />
              {theme === 'dark' ? t('footer.lightMode') : t('footer.darkMode')}
            </button>
          </span>
        </div>
      </div>
    </footer>
  );
}

// which backdrop art a route gets (presentation only)
function pageKind(path: string): string {
  if (path === '/') return 'home';
  if (path === '/venues') return 'venues';
  if (path.startsWith('/venues/')) return 'venue';
  if (/^\/(bookings|favourites|profile)/.test(path)) return 'account';
  return 'other';
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
    <div
      className="g-app"
      data-theme={theme}
      data-scrolled={scrolled}
      data-page={pageKind(pathname)}
    >
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
