// Korea Standard Time (Asia/Seoul, UTC+9, no DST). The booking day is a KST calendar day stored by the API
// as the instant of 00:00 KST; slot times ("HH:MM") are KST wall-clock. Everything the UI shows or compares
// about days and hours goes through this file, so it is identical whatever the browser's time zone is.
// Keep this file identical in the player and admin apps.

export const KST_TIME_ZONE = "Asia/Seoul";
const KST_OFFSET_MS = 9 * 3600 * 1000;
const DAY_MS = 24 * 3600 * 1000;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** calendar and clock parts of an instant, in KST (month is 1-12, weekday 0 = Sunday) */
export const kstParts = (at: number | string | Date = Date.now()) => {
  const d = new Date(new Date(at).getTime() + KST_OFFSET_MS);
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth() + 1,
    d: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    weekday: d.getUTCDay(),
  };
};

/** "YYYY-MM-DD" key for a calendar day */
export const dateKeyOf = (y: number, m: number, d: number) => `${y}-${pad2(m)}-${pad2(d)}`;

/** "YYYY-MM-DD" of the KST day containing the instant (default: now) */
export const kstDateKey = (at: number | string | Date = Date.now()) => {
  const p = kstParts(at);
  return dateKeyOf(p.y, p.m, p.d);
};

/** the current hour (0-23) in KST */
export const kstHourNow = () => kstParts().hour;

/** instant (ms) of 00:00 KST of the KST day containing `at` */
export const kstDayStartMs = (at: number | string | Date) =>
  Math.floor((new Date(at).getTime() + KST_OFFSET_MS) / DAY_MS) * DAY_MS - KST_OFFSET_MS;

/** weekday (0 = Sunday) of a plain calendar date, month 1-12; pure arithmetic, no time zone involved */
export const weekdayOf = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();

export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** y/m (m 1-12) moved by `delta` months */
export const shiftMonth = (y: number, m: number, delta: number) => {
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 };
};

/** end of a booked slot: has it passed? `bookingDate` is the API instant, `endTime` is "HH:MM" or "24:00" */
export const kstSlotEnded = (bookingDate: string | Date, endTime: string, now = Date.now()) => {
  const [h, m] = endTime.split(":").map(Number);
  const minutes = h * 60 + m === 0 ? 1440 : h * 60 + m;
  return now >= kstDayStartMs(bookingDate) + minutes * 60000;
};

/** UTC stamp "YYYYMMDDTHHMMSSZ" (for calendar files) of a KST wall-clock time on a booking day */
export const kstWallClockToUtcStamp = (bookingDate: string | Date, time: string) => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(kstDayStartMs(bookingDate) + (h * 60 + m) * 60000);
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}00Z`;
};
