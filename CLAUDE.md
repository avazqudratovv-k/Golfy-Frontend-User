# Golfy player app

Portfolio project: the player-facing app of an hourly golf-venue booking platform (CRA, React 18, TypeScript, react-router 7, axios, hand-written CSS).
Backend: `/Users/kenneth/Desktop/GOLFY Backend` (user API on port 3011). Admin app: `/Users/kenneth/golfy-admin`.

## Commands
- `yarn start` dev server on http://localhost:3000 (API base from `REACT_APP_API_URL`, default `http://localhost:3011`)
- `npx tsc --noEmit` type-check · `yarn build` production build (no tests exist)

## Folder map
`src/app/pages` routed pages · `src/app/components` Layout, ui.tsx (cards, badges, dialogs), Motion.tsx (reveal/count-up/confetti), AuthShell.tsx
`src/app/lib` format.ts (money = USD `$12.00`, dates in UTC), types.ts, enums.ts, config.ts, axiosInstance.ts · `src/app/services/api.ts` all API calls
`src/app/context` Auth, Favorites, Toast · `src/css` see below

## CSS architecture (plain CSS, no UI framework)
`tokens.css` (identical in both apps) → `base.css` → `icons.css` (mask icons `<i class="i i-name">`) → `components.css` (buttons, forms, badges, tables...) → `site.css` (layout and pages) → `motion.css`.
All classes use the `g-` prefix. Picture URLs for the hero/auth panel live in `public/index.html` (`--img-hero`, `--img-auth`) because the CSS bundler cannot resolve absolute URLs.

## Design tokens ("clubhouse at golden hour")
- Colour: `--bg #F6F2E9` warm off-white · `--primary #0F3D2E` fairway green · `--accent #E8743B` sunset amber (CTAs only, text use `--accent-text #A8481A`) · `--ink #14231B` · `--ink-muted #55625A` · dark theme via `[data-theme="dark"]`
- Type: Pretendard Variable (CDN in index.html), scale `--text-xs..--text-hero`, tabular numerals via `.g-num` for prices/times
- Space 4px base (`--space-1..8`) · radius `--radius-sm 10 / md 14 / lg 20 / xl 28 / pill` · shadows `--shadow-1..3` · touch target `--touch-min 44px`
- Rules: WCAG AA contrast, visible focus ring, 44px targets, `prefers-reduced-motion` respected, motion = transform/opacity only.

## Logo
Single source of truth: `public/brand/` (`golfy-mark[-light].svg`, `golfy-logo[-light].svg`, `favicon.svg`, `favicon-32/48.png`, `apple-touch-icon.png`, `icon-192/512.png`, `og-image.png`). `-light` = for dark backgrounds. Use `BrandLogo` / `BrandMark` from `components/Brand.tsx` (they pick the variant by theme); plain `<img>` only on always-dark surfaces (footer, auth art). Never add another logo copy.

## Hard rules
1. Do NOT change architecture or business logic (booking rules, pricing, statuses, auth flow, review rules). Redesign work changes look, layout and UX polish, not behaviour.
2. Keep every existing route, feature and user flow working.
3. Never print or commit secrets or `.env` values.
4. Don't delete user data.

## Out of scope for now
KST day boundaries, Toss Payments, AI features, Korean UI language, tests/CI/Docker, deployment.
