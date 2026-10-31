import React from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "../components/Brand";
import { SUPPORT_EMAIL } from "../lib/config";
import { useOnline } from "../hooks/useMedia";

export function NotFoundPage() {
  return (
    <main className="g-center">
      <BrandMark size={56} />
      <span className="g-big" aria-hidden="true">404</span>
      <h1 className="g-h1">This page is out of bounds</h1>
      <p className="g-muted" style={{ maxWidth: "40ch" }}>We can't find the page you were looking for. It may have moved, or the link may be wrong.</p>
      <div className="g-row" style={{ justifyContent: "center" }}>
        <Link className="g-btn g-btn--primary" to="/">Back to home</Link>
        <Link className="g-btn g-btn--secondary" to="/venues">Browse venues</Link>
      </div>
    </main>
  );
}

export function ErrorPage({ onRetry }: { onRetry: () => void }) {
  const online = useOnline();
  return (
    <main className="g-center">
      {online ? (
        <>
          <BrandMark size={56} />
          <h1 className="g-h1">Something went wrong</h1>
          <p className="g-muted" style={{ maxWidth: "42ch" }}>It's us, not you. Your bookings are safe. Please try again in a moment.</p>
        </>
      ) : (
        <>
          <i className="i i-lg i-wifi" style={{ width: 56, height: 56, color: "var(--ink-muted)" }} />
          <h1 className="g-h1">You're offline</h1>
          <p className="g-muted" style={{ maxWidth: "42ch" }}>Check your connection. We'll pick up where you left off when you're back.</p>
        </>
      )}
      <div className="g-row" style={{ justifyContent: "center" }}>
        <button className="g-btn g-btn--primary" type="button" onClick={onRetry}>Try again</button>
        <a className="g-btn g-btn--secondary" href="/">Back to home</a>
      </div>
      <p className="g-hint">Still stuck? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
    </main>
  );
}

// catches render crashes so the page never goes blank
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Unhandled UI error:", error);
  }
  render() {
    return this.state.failed ? <ErrorPage onRetry={() => window.location.reload()} /> : this.props.children;
  }
}
