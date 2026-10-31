/* eslint-disable import/first */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import CheckoutPage from "./CheckoutPage";
import { Providers, signedInUser, useEnglish } from "../../test/helpers";

jest.mock("../services/api", () => ({
  bookingApi: { one: jest.fn(), setStatus: jest.fn() },
  favoriteApi: { ids: jest.fn().mockResolvedValue([]) },
  authApi: { profile: jest.fn().mockResolvedValue({}) },
}));
import { authApi, bookingApi, favoriteApi } from "../services/api";

const NOW = Date.parse("2026-11-03T03:00:00Z");
const booking = (over: Record<string, unknown> = {}) => ({
  _id: "b1",
  venueId: "v1",
  status: "PENDING",
  bookingDate: "2026-11-03T15:00:00.000Z", // 4 Nov KST
  startTime: "19:00",
  endTime: "21:00",
  price: 60000,
  createdAt: new Date(NOW - 50 * 60000).toISOString(),
  venueData: [{ venueName: "Test Range", venueLocation: "Seoul", pricePerHour: 30000, venueImages: [] }],
  ...over,
});

beforeEach(async () => {
  jest.spyOn(Date, "now").mockReturnValue(NOW);
  localStorage.setItem("userData", JSON.stringify(signedInUser));
  (authApi.profile as jest.Mock).mockResolvedValue(signedInUser); // CRA resets mocks before each test
  (favoriteApi.ids as jest.Mock).mockResolvedValue([]);
  await useEnglish();
});
afterEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
});

const renderPage = () =>
  render(
    <Providers route="/checkout/b1">
      <Routes>
        <Route path="/checkout/:id" element={<CheckoutPage />} />
        <Route path="/confirmation/:id" element={<p>CONFIRMATION PAGE</p>} />
      </Routes>
    </Providers>
  );

describe("checkout", () => {
  it("shows the hold countdown, KST booking date and price", async () => {
    (bookingApi.one as jest.Mock).mockResolvedValue(booking());
    renderPage();
    const timer = await screen.findByRole("timer");
    expect(timer).toHaveTextContent("Held for 10:00"); // 60 min hold, created 50 min ago
    expect(screen.getByText("Wed 4 Nov 2026")).toBeInTheDocument();
    expect(screen.getByText("19:00 - 21:00 (2 hours)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pay and confirm ₩60,000" })).toBeEnabled();
  });

  it("marks the timer urgent in the last five minutes", async () => {
    (bookingApi.one as jest.Mock).mockResolvedValue(booking({ createdAt: new Date(NOW - 57 * 60000).toISOString() }));
    renderPage();
    const timer = await screen.findByRole("timer");
    expect(timer).toHaveTextContent("Held for 03:00");
    expect(timer).toHaveClass("g-urgent");
  });

  it("paying confirms the booking and moves to the confirmation page", async () => {
    const user = userEvent.setup();
    (bookingApi.one as jest.Mock).mockResolvedValue(booking());
    (bookingApi.setStatus as jest.Mock).mockResolvedValue({ status: "CONFIRMED" });
    renderPage();
    await user.click(await screen.findByRole("button", { name: /Pay and confirm/ }));
    expect(screen.getByRole("button", { name: /Processing/ })).toBeDisabled();
    expect(await screen.findByText("CONFIRMATION PAGE", undefined, { timeout: 4000 })).toBeInTheDocument();
    expect(bookingApi.setStatus).toHaveBeenCalledWith("b1", "CONFIRMED");
  });

  it("shows the backend's conflict message in Korean-or-English when the slot was taken", async () => {
    const user = userEvent.setup();
    (bookingApi.one as jest.Mock).mockResolvedValue(booking());
    (bookingApi.setStatus as jest.Mock).mockRejectedValue({
      response: { status: 409, data: { message: "This slot conflicts with an existing booking from 19:00 to 20:00. Please choose a different time." } },
    });
    renderPage();
    await user.click(await screen.findByRole("button", { name: /Pay and confirm/ }));
    expect(await screen.findByText("That time is taken", undefined, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText(/overlaps an existing booking from 19:00 to 20:00/)).toBeInTheDocument();
  });

  it("an unpaid booking older than the hold is shown as released, with no pay button", async () => {
    (bookingApi.one as jest.Mock).mockResolvedValue(booking({ createdAt: new Date(NOW - 61 * 60000).toISOString() }));
    renderPage();
    expect(await screen.findByText("Your hold ended")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Pay and confirm/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Choose a new time" })).toHaveAttribute("href", "/venues/v1");
  });

  it("a cancelled booking says so", async () => {
    (bookingApi.one as jest.Mock).mockResolvedValue(booking({ status: "CANCELLED" }));
    renderPage();
    expect(await screen.findByText("Booking cancelled")).toBeInTheDocument();
  });
});

it("renders in Korean too", async () => {
  const { useKorean } = require("../../test/helpers");
  await useKorean();
  (bookingApi.one as jest.Mock).mockResolvedValue(booking());
  renderPage();
  expect(await screen.findByRole("timer")).toHaveTextContent("10:00 동안 확보됨");
  expect(screen.getByText("2026년 11월 4일 (수)")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "₩60,000 결제하고 예약 확정" })).toBeInTheDocument();
});
