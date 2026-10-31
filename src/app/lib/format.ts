import { serverApi } from "./config";
import { VenueType } from "./enums";
import { KST_TIME_ZONE, kstSlotEnded } from "./kst";
import { Venue } from "./types";

export const money = (n: number) => `$${Number(n).toFixed(2)}`;

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

export const typeLabel = (t?: VenueType) =>
  t === "SIMULATOR" ? "Simulator" : t === "RANGE" ? "Range" : "Course";

// the booking day is a KST calendar day (stored as 00:00 KST), so days are always shown in KST
export const formatDay = (iso: string) =>
  new Date(iso)
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: KST_TIME_ZONE,
    })
    .replace(",", "");

export const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: KST_TIME_ZONE });

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
  return count > 0 ? `${(v.avgRating ?? 0).toFixed(1)}` : "New";
};

export const reviewsText = (v: Venue) => {
  const count = v.reviewCount ?? 0;
  return count === 0 ? "No reviews yet" : count === 1 ? "1 review" : `${count} reviews`;
};

// has the booked slot already ended? (end time is KST wall-clock on the booking's KST day)
export const slotEnded = (bookingDate: string, endTime: string) => kstSlotEnded(bookingDate, endTime);

export const apiError = (err: any): { status?: number; message: string } => ({
  status: err?.response?.status,
  message: err?.response?.data?.message ?? "",
});
