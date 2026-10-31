import React from "react";

// Logo files live in public/brand (the one source of truth). Both colour variants are
// rendered and CSS shows the one that fits the theme, so there is no flash on load.
type Props = { className?: string; height?: number };

export function BrandLogo({ className = "", height = 32 }: Props) {
  const width = Math.round((height * 171) / 64);
  return (
    <span className={`g-brand ${className}`}>
      <img className="g-brand-onlight" src="/brand/golfy-logo.svg" alt="Golfy" width={width} height={height} />
      <img className="g-brand-ondark" src="/brand/golfy-logo-light.svg" alt="Golfy" width={width} height={height} />
    </span>
  );
}

/** the G + flag mark on its own; decorative unless a label is given */
export function BrandMark({ className = "", size = 24, label }: Props & { size?: number; label?: string }) {
  const alt = label ?? "";
  const aria = label ? undefined : true;
  return (
    <span className={`g-brand g-brand--mark ${className}`} aria-hidden={aria}>
      <img className="g-brand-onlight" src="/brand/golfy-mark.svg" alt={alt} width={size} height={size} />
      <img className="g-brand-ondark" src="/brand/golfy-mark-light.svg" alt={alt} width={size} height={size} />
    </span>
  );
}
