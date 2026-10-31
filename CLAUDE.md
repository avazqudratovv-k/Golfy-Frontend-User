# Golfy player app

Portfolio project: the player-facing app of an hourly golf-venue booking platform (CRA, React 18, TypeScript, react-router 7, axios, hand-written CSS).
Backend: `/Users/kenneth/Desktop/GOLFY Backend` (user API on port 3011). Admin app: `/Users/kenneth/golfy-admin`.

## Commands
- `yarn start` dev server on http://localhost:3000 (API base from `REACT_APP_API_URL`, default `http://localhost:3011`)
- `yarn typecheck` · `yarn lint` (max 0 warnings) · `yarn test --watchAll=false` (RTL + unit; CRA resets mocks before each test, re-prime them in beforeEach) · `yarn build` · `yarn e2e` optional Playwright smoke test against the local stack (installed Chrome)
- `REACT_APP_SITE_URL` (see `.env.example`) makes og:image/og:url absolute in `build/index.html` via `scripts/inject-site-url.js`

## Folder map
`src/app/pages` routed pages · `src/app/components` Layout, ui.tsx (cards, badges, dialogs), Motion.tsx (reveal/count-up/confetti), AuthShell.tsx
`src/app/lib` format.ts (money ₩, KST dates), kst.ts, types.ts, enums.ts, config.ts, axiosInstance.ts · `src/i18n` ko.ts, en.ts, apiMessages.ts · `src/app/services/api.ts` all API calls
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

## i18n and glossary
- react-i18next, `ko` default (saved choice in localStorage `golfy-lang`, else browser language, else ko). `<html lang>` follows. Components use `t("section.key")` only; every key goes in BOTH `src/i18n/en.ts` and `ko.ts` (`i18n.test.ts` fails otherwise). English plurals use `_one/_other`, Korean only `_other`.
- Backend messages stay English; `src/i18n/apiMessages.ts` maps known ones to `apiError.*` keys (fallback: raw text). Logic that needs the English text uses `apiError(err).raw`, never the translated `message`.
- Money is won (`money()` -> `₩38,000`, ko-KR grouping in both languages). Dates: ko `2026년 11월 3일 (화)`, en `Tue 3 Nov 2026`. Times are 24h KST.
- Tone: player app 해요체; admin concise 합쇼체 / noun endings. Add `html[lang="ko"]` word-break: keep-all for new layouts.
- Glossary: venue 시설 · course 골프장 · simulator 스크린골프 · range 연습장 · booking 예약 · book 예약하기 · pay 결제 · Pending 결제 대기 · Confirmed 예약 확정 · Finished 이용 완료 · Cancelled 취소됨 · review 리뷰 · favourites 즐겨찾기 · profile 내 정보 · log in 로그인 · sign up 회원가입 · log out 로그아웃 · user/player 회원 · hold 확보/보류 · slot 시간 · inactive 운영 중지.

## KST
Everything about days and hours goes through `src/app/lib/kst.ts` (same file in both apps, tested under two time zones). Booking day = KST calendar day (API stores 00:00 KST); slot times are KST wall-clock. Never use `new Date().getHours()`, `toLocale*` without `timeZone`, or local-time Date constructors for booking logic.

## Out of scope
Deployment/hosting config, AI features, Toss Payments (payment stays simulated).
