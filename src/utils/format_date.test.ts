import { describe, expect, it } from "vitest";
import { parseYmdLocal, toYmdLocal } from "./format_date";

describe("parseYmdLocal", () => {
  it("keeps the calendar day the user picked", () => {
    // Regression pin: `new Date("2025-08-01")` is UTC midnight, which is
    // 31 July in Argentina; the old `.setDate(Number(day))` patch then landed
    // on 1 *July* — off by a whole month.
    const date = parseYmdLocal("2025-08-01")!;
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(7); // August
    expect(date.getDate()).toBe(1);
  });

  it.each([
    "2025-01-01",
    "2025-02-28",
    "2024-02-29",
    "2025-06-15",
    "2025-12-31",
  ])("round trips %s through toYmdLocal", (ymd) => {
    expect(toYmdLocal(parseYmdLocal(ymd)!)).toBe(ymd);
  });

  it("sits at midday so DST shifts cannot move the day", () => {
    expect(parseYmdLocal("2025-08-01")!.getHours()).toBe(12);
  });

  it.each(["", "not-a-date", "2025-8-1", "2025-02-30", "2025-13-01"])(
    "rejects %j",
    (ymd) => {
      expect(parseYmdLocal(ymd)).toBeNull();
    }
  );
});

describe("toYmdLocal", () => {
  it("zero-pads month and day", () => {
    expect(toYmdLocal(new Date(2025, 0, 5, 12))).toBe("2025-01-05");
  });

  it("uses local parts, not UTC ones", () => {
    // 23:30 local on the 5th is the 6th in UTC for any negative offset.
    const lateEvening = new Date(2025, 6, 5, 23, 30);
    expect(toYmdLocal(lateEvening)).toBe("2025-07-05");
  });
});
