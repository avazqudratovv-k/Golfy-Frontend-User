import { formatDay } from "./format";
import {
  dateKeyOf,
  daysInMonth,
  kstDateKey,
  kstDayStartMs,
  kstParts,
  kstSlotEnded,
  kstWallClockToUtcStamp,
  shiftMonth,
  weekdayOf,
} from "./kst";

describe("KST helpers (same result in any browser time zone)", () => {
  it("23:30 KST (14:30 UTC) is still the same KST day; 15:00 UTC is the next", () => {
    expect(kstDateKey("2026-11-03T14:30:00Z")).toBe("2026-11-03");
    expect(kstDateKey("2026-11-03T14:59:59.999Z")).toBe("2026-11-03");
    expect(kstDateKey("2026-11-03T15:00:00Z")).toBe("2026-11-04");
    expect(kstParts("2026-11-03T14:30:00Z")).toMatchObject({ y: 2026, m: 11, d: 3, hour: 23, minute: 30, weekday: 2 });
  });

  it("rolls over month and year boundaries", () => {
    expect(kstDateKey("2026-10-31T15:00:00Z")).toBe("2026-11-01");
    expect(kstDateKey("2026-12-31T15:00:00Z")).toBe("2027-01-01");
    expect(shiftMonth(2026, 12, 1)).toEqual({ y: 2027, m: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ y: 2025, m: 12 });
    expect(daysInMonth(2028, 2)).toBe(29);
  });

  it("calendar math does not depend on the time zone", () => {
    expect(weekdayOf(2026, 11, 3)).toBe(2); // Tuesday
    expect(weekdayOf(2026, 11, 1)).toBe(0); // Sunday
    expect(dateKeyOf(2026, 3, 5)).toBe("2026-03-05");
  });

  it("day start is 00:00 KST", () => {
    expect(new Date(kstDayStartMs("2026-11-03T14:30:00Z")).toISOString()).toBe("2026-11-02T15:00:00.000Z");
    // a booking stored at 00:00 KST maps to itself
    expect(kstDayStartMs("2026-11-02T15:00:00.000Z")).toBe(Date.parse("2026-11-02T15:00:00Z"));
  });

  it("a slot has ended exactly at its KST end time", () => {
    const day = "2026-11-02T15:00:00.000Z"; // 3 Nov KST
    expect(kstSlotEnded(day, "18:00", Date.parse("2026-11-03T08:59:59Z"))).toBe(false);
    expect(kstSlotEnded(day, "18:00", Date.parse("2026-11-03T09:00:00Z"))).toBe(true);
    expect(kstSlotEnded(day, "24:00", Date.parse("2026-11-03T14:59:59Z"))).toBe(false);
    expect(kstSlotEnded(day, "00:00", Date.parse("2026-11-03T15:00:00Z"))).toBe(true); // 00:00 means end of day
  });

  it("calendar file times are UTC instants of the KST wall clock", () => {
    expect(kstWallClockToUtcStamp("2026-11-02T15:00:00.000Z", "19:00")).toBe("20261103T100000Z");
    expect(kstWallClockToUtcStamp("2026-11-02T15:00:00.000Z", "08:30")).toBe("20261102T233000Z");
  });

  it("formats a booking day in KST", () => {
    expect(formatDay("2026-11-02T15:00:00.000Z")).toBe("Tue 3 Nov 2026");
  });
});
