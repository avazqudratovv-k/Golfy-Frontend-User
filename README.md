<p align="center"><img src="public/brand/golfy-logo.svg" alt="Golfy" height="56"></p>

# Golfy player app

Book golf courses, simulator bays and driving ranges by the hour. React 18 + TypeScript + react-router 7, hand-written CSS with a small design-token system.

## Run
```bash
yarn install
yarn start            # http://localhost:3000, expects the user API on http://localhost:3011
```
Set `REACT_APP_API_URL` to point at another API. Backend and demo data (`npm run seed`): see the backend README.
Demo player login: `minjun@seed.golfy.dev` / `Password123!`.

## Screens
Home, Venues (search, filters, sort, pagination), Venue detail (gallery lightbox, rating breakdown, live hourly availability, similar venues), Log in / Sign up, Checkout (60-minute hold), Confirmation, My bookings, Review, Favourites, Profile, 404.

## Quality
Mobile-first, WCAG AA contrast, visible focus, 44px touch targets, reduced-motion support, light and dark themes, skeleton loading states.
`yarn build` type-checks and builds; design notes and tokens are in `CLAUDE.md`.
