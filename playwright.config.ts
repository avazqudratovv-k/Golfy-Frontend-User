import { defineConfig } from "@playwright/test";

// Optional smoke test against a LOCAL stack: backend on 3011 with seeded data and this app on 3000.
// Uses the Chrome installed on your machine, so nothing is downloaded. Run: yarn e2e
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000", channel: "chrome", headless: true },
});
