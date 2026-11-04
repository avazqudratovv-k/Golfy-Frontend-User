import { expect, test } from "@playwright/test";

// Login from the seed (npm run seed in the backend). The booking is cancelled again at the end.
test("player: log in, pick a free slot, start a booking, cancel it", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("golfy-lang", "en"));
  await page.goto("/login");
  await page.locator("#le").fill("minjun@seed.golfy.dev");
  await page.locator("#lp").fill("Password123!");
  await page.getByRole("button", { name: /^Log in/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.goto("/venues");
  await expect(page.getByRole("heading", { name: "Venues" })).toBeVisible();
  await page.locator("article.g-card h3 a").first().click();
  await expect(page.getByText("Check availability")).toBeVisible();

  // first day of next month: always selectable and free in the seed data
  await page.getByRole("button", { name: "Next month" }).click();
  await page.locator(".g-day:not([disabled])").first().click();
  const freeSlot = page.locator(".g-slot:not([disabled])").first();
  await expect(freeSlot).toBeVisible();
  await freeSlot.click();
  await page.getByRole("button", { name: "Book" }).click();

  await expect(page).toHaveURL(/\/checkout\//);
  await expect(page.getByRole("timer")).toContainText("Held for");
  await page.getByRole("button", { name: "Cancel booking" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Cancel booking" }).click();
  await expect(page.getByText("Booking cancelled")).toBeVisible();
});
