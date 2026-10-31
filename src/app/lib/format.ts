import i18n, { currentLang } from "../../i18n";
import { translateApiMessage } from "../../i18n/apiMessages";
import { serverApi } from "./config";
import { VenueType } from "./enums";
import { kstParts, kstSlotEnded } from "./kst";
import { Venue } from "./types";

// All prices are Korean won, shown as ₩ with ko-KR grouping in both languages ("₩38,000").
export const money = (n: number) => `₩${Math.round(Number(n)).toLocaleString("ko-KR")}`;

/** plain grouped number ("1,234") */
export const formatNumber = (n: number) => Number(n).toLocaleString("ko-KR");

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const hourLabel = (h: number) => `${pad2(h)}:00`;

// absolute URL for an uploaded file ("uploads/venues/x.jpg")
export const imgUrl = (path?: string) =>
  path ? (/^https?:/.test(path) ? path : `${serverApi}/${path.replace(/^\//, "")}`) : undefined;

export const photoStyle = (path?: string): React.CSSProperties | undefined => {
  const url = imgUrl(path);
  return url ? { backgroundImage: `url("${url}")` } : undefined;
};

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

export const typeLabel = (t?: VenueType) => i18n.t(`venueType.${t === "SIMULATOR" || t === "RANGE" ? t : "COURSE"}`);

const EN_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const KO_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// The booking day is a KST calendar day (stored as 00:00 KST), so days are always shown in KST.
// Korean: "2026년 11월 3일 (화)"   English: "Tue 3 Nov 2026"
export const formatDay = (iso: string, lang = currentLang()) => {
  const p = kstParts(iso);
  return lang === "ko"
    ? `${p.y}년 ${p.m}월 ${p.d}일 (${KO_WEEKDAYS[p.weekday]})`
    : `${EN_WEEKDAYS[p.weekday]} ${p.d} ${EN_MONTHS[p.m - 1]} ${p.y}`;
};

/** Korean: "2026년 11월 3일"   English: "3 Nov 2026" */
export const formatShortDate = (iso: string, lang = currentLang()) => {
  const p = kstParts(iso);
  return lang === "ko" ? `${p.y}년 ${p.m}월 ${p.d}일` : `${p.d} ${EN_MONTHS[p.m - 1]} ${p.y}`;
};

/** calendar heading from a "YYYY-MM-DD" key + weekday (0 = Sunday): "11월 3일 (화)" / "Tue 3 Nov" */
export const formatCalendarDay = (m: number, d: number, weekday: number, lang = currentLang()) =>
  lang === "ko" ? `${m}월 ${d}일 (${KO_WEEKDAYS[weekday]})` : `${EN_WEEKDAYS[weekday]} ${d} ${EN_MONTHS[m - 1]}`;

export const bookingRef = (id: string) => `GLF-${id.slice(-6).toUpperCase()}`;

// "10:00", "12:00" -> number of hours
export const hoursBetween = (start: string, end: string) => {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const e = toMin(end) === 0 ? 1440 : toMin(end);
  return (e - toMin(start)) / 60;
};

export const isPopular = (v: Venue) => v.bookingCount >= 20;

export const ratingText = (v: Venue) => {
  const count = v.reviewCount ?? 0;
  return count > 0 ? `${(v.avgRating ?? 0).toFixed(1)}` : i18n.t("common.new");
};

export const reviewsText = (v: Venue) => {
  const count = v.reviewCount ?? 0;
  return count === 0 ? i18n.t("venueCard.noReviewsYet") : i18n.t("venueCard.reviews", { count, n: formatNumber(count) });
};

// has the booked slot already ended? (end time is KST wall-clock on the booking's KST day)
export const slotEnded = (bookingDate: string, endTime: string) => kstSlotEnded(bookingDate, endTime);

/** status and (translated) message of a failed API call; unknown messages stay as the backend sent them */
export const apiError = (err: any): { status?: number; message: string; raw: string } => ({
  status: err?.response?.status,
  message: translateApiMessage(err?.response?.data?.message ?? ""),
  raw: err?.response?.data?.message ?? "", // untranslated backend text, for logic only
});
