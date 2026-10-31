import React from "react";
import { PHOTO_CREDITS } from "../lib/photoCredits";

export default function CreditsPage() {
  return (
    <main className="g-wrap" style={{ paddingBlock: "var(--space-7)" }}>
      <h1 className="g-h1">Photo credits</h1>
      <p className="g-muted" style={{ maxWidth: "62ch" }}>
        Golfy is a portfolio project and its venues are fictional demo data. The photographs are real pictures from{" "}
        <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>, shown under the
        licences below. They were cropped and resized (and re-compressed) for this site; nothing else was changed. No real business is implied.
      </p>
      <ul className="g-credits" style={{ listStyle: "none", padding: 0, margin: "var(--space-6) 0 0", display: "grid", gap: "var(--space-3)" }}>
        {PHOTO_CREDITS.map((c) => (
          <li key={c.page}>
            <a href={c.page} target="_blank" rel="noopener noreferrer"><strong>{c.title}</strong></a>
            <span className="g-muted"> by {c.author}, </span>
            <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer">{c.license}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
