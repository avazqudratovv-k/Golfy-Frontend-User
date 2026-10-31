import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { PHOTO_CREDITS } from "../lib/photoCredits";

export default function CreditsPage() {
  const { t } = useTranslation();
  return (
    <main className="g-wrap" style={{ paddingBlock: "var(--space-7)" }}>
      <h1 className="g-h1">{t("credits.title")}</h1>
      <p className="g-muted" style={{ maxWidth: "62ch" }}>
        <Trans i18nKey="credits.intro" components={{ wiki: <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> }} />
      </p>
      <ul className="g-credits" style={{ listStyle: "none", padding: 0, margin: "var(--space-6) 0 0", display: "grid", gap: "var(--space-3)" }}>
        {PHOTO_CREDITS.map((c) => (
          <li key={c.page}>
            <a href={c.page} target="_blank" rel="noopener noreferrer"><strong>{c.title}</strong></a>
            <span className="g-muted">{t("credits.by", { author: c.author })}</span>
            <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer">{c.license}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
