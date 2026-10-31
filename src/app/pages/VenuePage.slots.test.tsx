/* eslint-disable import/first */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import VenuePage from "./VenuePage";
import { Providers, useEnglish } from "../../test/helpers";

jest.mock("../services/api", () => ({
  venueApi: {
    one: jest.fn(),
    availability: jest.fn(),
    similar: jest.fn(),
    ratingBreakdown: jest.fn(),
  },
  reviewApi: { recent: jest.fn() },
  bookingApi: { create: jest.fn() },
  favoriteApi: { ids: jest.fn().mockResolvedValue([]) },
  authApi: { profile: jest.fn() },
}));
import { authApi, bookingApi, favoriteApi, reviewApi, venueApi } from "../services/api";

// Tue 3 Nov 2026, 12:00 KST (03:00 UTC): hours up to 12:00 are already past
const NOW = Date.parse("2026-11-03T03:00:00Z");

const venue = { _id: "v1", venueName: "Test Range", venueLocation: "Seoul", venueType: "RANGE", pricePerHour: 30000, venueImages: [], bookingCount: 0, avgRating: 0, reviewCount: 0, venueDesc: "A range" };
const slots = Array.from({ length: 24 }, (_, h) => ({
  startTime: `${String(h).padStart(2, "0")}:00`,
  endTime: h === 23 ? "24:00" : `${String(h + 1).padStart(2, "0")}:00`,
  available: h !== 14, // 14:00-15:00 is taken
}));

beforeEach(async () => {
  jest.spyOn(Date, "now").mockReturnValue(NOW);
  await useEnglish();
  (authApi.profile as jest.Mock).mockResolvedValue({});
  (favoriteApi.ids as jest.Mock).mockResolvedValue([]);
  (venueApi.one as jest.Mock).mockResolvedValue(venue);
  (venueApi.availability as jest.Mock).mockResolvedValue({ venueId: "v1", date: "2026-11-03", pricePerHour: 30000, slots, booked: [{ startTime: "14:00", endTime: "15:00" }] });
  (venueApi.similar as jest.Mock).mockResolvedValue([]);
  (venueApi.ratingBreakdown as jest.Mock).mockResolvedValue({ total: 0, counts: {} });
  (reviewApi.recent as jest.Mock).mockResolvedValue([]);
  (bookingApi.create as jest.Mock).mockReset();
});
afterEach(() => jest.restoreAllMocks());

const renderPage = () =>
  render(
    <Providers route="/venues/v1">
      <Routes>
        <Route path="/venues/:id" element={<VenuePage />} />
        <Route path="/login" element={<p>LOGIN PAGE</p>} />
      </Routes>
    </Providers>
  );
const slot = (time: string) => screen.getByRole("button", { name: new RegExp(`^${time},`) });

describe("slot picker", () => {
  it("asks for the availability of today's KST date", async () => {
    renderPage();
    await screen.findByText("Check availability");
    await waitFor(() => expect(venueApi.availability).toHaveBeenCalledWith("v1", "2026-11-03"));
  });

  it("blocks hours that have already passed in KST and hours taken by someone else", async () => {
    renderPage();
    await screen.findByText("Check availability");
    await waitFor(() => expect(slot("13:00")).toBeEnabled());
    expect(slot("12:00")).toBeDisabled(); // current KST hour
    expect(slot("08:00")).toBeDisabled();
    expect(slot("14:00")).toBeDisabled(); // booked
    expect(slot("16:00")).toBeEnabled();
    expect(slot("13:00")).toHaveAttribute("aria-label", "13:00, free");
  });

  it("selects one hour, shows the estimate, then extends to a range of consecutive hours", async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(slot("16:00")).toBeEnabled());
    await user.click(slot("16:00"));
    expect(slot("16:00")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("₩30,000 x 1 hour")).toBeInTheDocument();
    await user.click(slot("18:00"));
    expect(slot("17:00")).toHaveAttribute("aria-pressed", "true");
    expect(slot("18:00")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("₩30,000 x 3 hours")).toBeInTheDocument();
    expect(screen.getByText("₩90,000")).toBeInTheDocument();
    expect(screen.getByText("16:00 - 19:00")).toBeInTheDocument();
  });

  it("refuses a range that crosses a taken slot and explains which one", async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(slot("13:00")).toBeEnabled());
    await user.click(slot("13:00"));
    await user.click(slot("16:00")); // 14:00 is taken in between
    expect(await screen.findByText("That time is taken")).toBeInTheDocument();
    expect(screen.getByText("14:00 to 15:00")).toBeInTheDocument();
    expect(slot("13:00")).toHaveAttribute("aria-pressed", "true"); // selection unchanged
    expect(slot("15:00")).toHaveAttribute("aria-pressed", "false");
  });

  it("sends a logged-out visitor to log in instead of creating a booking", async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(slot("16:00")).toBeEnabled());
    await user.click(slot("16:00"));
    await user.click(screen.getByRole("button", { name: "Book" }));
    expect(await screen.findByText("LOGIN PAGE")).toBeInTheDocument();
    expect(bookingApi.create).not.toHaveBeenCalled();
  });

  it("the Book button stays disabled until a slot is chosen", async () => {
    renderPage();
    await waitFor(() => expect(slot("16:00")).toBeEnabled());
    expect(screen.getByRole("button", { name: "Book" })).toBeDisabled();
  });
});
