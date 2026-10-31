import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BrandMark } from "../components/Brand";
import { SUPPORT_EMAIL } from "../lib/config";
import { useOnline } from "../hooks/useMedia";

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main className="g-center">
      <BrandMark size={56} />
      <span className="g-big" aria-hidden="true">404</span>
      <h1 className="g-h1">{t("errors.notFoundTitle")}</h1>
      <p className="g-muted" style={{ maxWidth: "40ch" }}>{t("errors.notFoundText")}</p>
      <div className="g-row" style={{ justifyContent: "center" }}>
        <Link className="g-btn g-btn--primary" to="/">{t("errors.backHome")}</Link>
        <Link className="g-btn g-btn--secondary" to="/venues">{t("errors.browse")}</Link>
      </div>
    </main>
  );
}

export function ErrorPage({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  const online = useOnline();
  return (
    <main className="g-center">
      {online ? (
        <>
          <BrandMark size={56} />
          <h1 className="g-h1">{t("errors.wrongTitle")}</h1>
          <p className="g-muted" style={{ maxWidth: "42ch" }}>{t("errors.wrongText")}</p>
        </>
      ) : (
        <>
          <i className="i i-lg i-wifi" style={{ width: 56, height: 56, color: "var(--ink-muted)" }} />
          <h1 className="g-h1">{t("errors.offlineTitle")}</h1>
          <p className="g-muted" style={{ maxWidth: "42ch" }}>{t("errors.offlineText")}</p>
        </>
      )}
      <div className="g-row" style={{ justifyContent: "center" }}>
        <button className="g-btn g-btn--primary" type="button" onClick={onRetry}>{t("errors.tryAgain")}</button>
        <a className="g-btn g-btn--secondary" href="/">{t("errors.backHome")}</a>
      </div>
      <p className="g-hint"><Trans i18nKey="errors.stuck" values={{ email: SUPPORT_EMAIL }} components={{ mail: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> }} /></p>
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
