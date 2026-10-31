import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { LangToggle } from "../components/LangToggle";
import { RequireAuth } from "../components/RouteGuards";
import { apiError, bookingRef, formatDay, formatShortDate, hoursBetween, money, reviewsText, typeLabel } from "./format";
import { LANG_KEY, detectLanguage, setLanguage } from "../../i18n";
import { translateApiMessage } from "../../i18n/apiMessages";
import { Providers, signedInUser } from "../../test/helpers";

afterEach(() => localStorage.clear());

describe("formatters", () => {
  const day = "2026-11-02T15:00:00.000Z"; // 3 Nov 2026 in KST
  it("money is won with ko-KR grouping in both languages", async () => {
    expect(money(38000)).toBe("₩38,000");
    expect(money(1234567)).toBe("₩1,234,567");
    expect(money(0)).toBe("₩0");
    expect(money(61500.4)).toBe("₩61,500");
  });

  it("dates are KST and follow the language", async () => {
    expect(formatDay(day, "ko")).toBe("2026년 11월 3일 (화)");
    expect(formatDay(day, "en")).toBe("Tue 3 Nov 2026");
    expect(formatShortDate(day, "ko")).toBe("2026년 11월 3일");
    expect(formatShortDate("2026-11-03T14:59:59Z", "en")).toBe("3 Nov 2026");
    expect(formatShortDate("2026-11-03T15:00:00Z", "en")).toBe("4 Nov 2026"); // next KST day
  });

  it("labels follow the language", async () => {
    await setLanguage("ko");
    expect(typeLabel("SIMULATOR")).toBe("스크린골프");
    expect(reviewsText({ reviewCount: 2 } as any)).toBe("리뷰 2개");
    await setLanguage("en");
    expect(typeLabel("RANGE")).toBe("Range");
    expect(reviewsText({ reviewCount: 1 } as any)).toBe("1 review");
    expect(reviewsText({ reviewCount: 3 } as any)).toBe("3 reviews");
  });

  it("small helpers", () => {
    expect(hoursBetween("10:00", "12:30")).toBe(2.5);
    expect(hoursBetween("23:00", "00:00")).toBe(1);
    expect(bookingRef("64f0a8f9d34f9d4f6abc123")).toBe("GLF-ABC123");
  });
});

describe("backend messages", () => {
  it("known messages are translated, unknown ones stay as the backend wrote them", async () => {
    await setLanguage("ko");
    expect(translateApiMessage("Wrong password, please try again!")).toBe("비밀번호가 맞지 않아요. 다시 확인해 주세요.");
    expect(translateApiMessage("This slot conflicts with an existing booking from 10:00 to 11:00. Please choose a different time.")).toContain("10:00~11:00");
    expect(translateApiMessage("Some brand new backend message")).toBe("Some brand new backend message");
    await setLanguage("en");
    expect(translateApiMessage("Wrong password, please try again!")).toBe("Wrong password. Please try again.");
  });

  it("apiError keeps the raw text for logic and translates the shown one", async () => {
    await setLanguage("en");
    const err = { response: { status: 400, data: { message: "This email is already in use!" } } };
    expect(apiError(err)).toEqual({ status: 400, message: "This email is already in use.", raw: "This email is already in use!" });
  });
});

describe("language", () => {
  const browser = (lang: string) => Object.defineProperty(window.navigator, "language", { value: lang, configurable: true });

  it("saved choice beats the browser; browser en gives English; anything else gives Korean", () => {
    browser("en-US");
    expect(detectLanguage()).toBe("en");
    browser("ko-KR");
    expect(detectLanguage()).toBe("ko");
    browser("fr-FR");
    expect(detectLanguage()).toBe("ko");
    localStorage.setItem(LANG_KEY, "en");
    expect(detectLanguage()).toBe("en");
    localStorage.setItem(LANG_KEY, "garbage");
    expect(detectLanguage()).toBe("ko");
  });

  it("the toggle switches language, remembers it and updates <html lang>", async () => {
    await setLanguage("ko");
    const user = userEvent.setup();
    render(<LangToggle />);
    expect(screen.getByRole("group", { name: "언어" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "한국어" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "English" }));
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem(LANG_KEY)).toBe("en");
    expect(screen.getByRole("group", { name: "Language" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "한국어" }));
    expect(document.documentElement.lang).toBe("ko");
  });
});

describe("route guard", () => {
  const app = (route: string) =>
    render(
      <Providers route={route}>
        <Routes>
          <Route path="/login" element={<p>LOGIN PAGE</p>} />
          <Route path="/bookings" element={<RequireAuth><p>MY BOOKINGS</p></RequireAuth>} />
        </Routes>
      </Providers>
    );

  it("sends visitors to log in", () => {
    app("/bookings");
    expect(screen.getByText("LOGIN PAGE")).toBeInTheDocument();
  });

  it("lets a signed-in player through", () => {
    localStorage.setItem("userData", JSON.stringify(signedInUser));
    app("/bookings");
    expect(screen.getByText("MY BOOKINGS")).toBeInTheDocument();
  });
});
