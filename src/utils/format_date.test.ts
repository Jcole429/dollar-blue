import { describe, expect, it } from "vitest";
import {
  describeAge,
  formatDate,
  formatYmd,
  parseYmdLocal,
  toYmdLocal,
} from "./format_date";
import { MESSAGES } from "@/i18n/messages";

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

describe("describeAge", () => {
  const now = new Date(2025, 6, 5, 12, 0, 0).getTime();
  const ago = (minutes: number) => new Date(now - minutes * 60_000);
  const en = MESSAGES["en-US"].age;
  const es = MESSAGES["es-AR"].age;

  it.each([
    [0, "just now"],
    [1, "1 minute ago"],
    [5, "5 minutes ago"],
    [60, "1 hour ago"],
    [125, "2 hours ago"],
    [60 * 24, "1 day ago"],
    [60 * 24 * 3, "3 days ago"],
  ])("describes %i minutes as %j", (minutes, expected) => {
    expect(describeAge(ago(minutes), now, en)).toBe(expected);
  });

  it.each([
    [0, "recién"],
    [1, "hace 1 minuto"],
    [5, "hace 5 minutos"],
    [60, "hace 1 hora"],
    [125, "hace 2 horas"],
    [60 * 24, "hace 1 día"],
    [60 * 24 * 3, "hace 3 días"],
  ])("describes %i minutes in Spanish as %j", (minutes, expected) => {
    expect(describeAge(ago(minutes), now, es)).toBe(expected);
  });

  it.each([null, undefined])("reports %j as never updated", (value) => {
    expect(describeAge(value, now, en)).toBe("Never updated");
    expect(describeAge(value, now, es)).toBe("Sin actualizar");
  });

  it("picks the same bucket regardless of language", () => {
    // The buckets are logic and the wording is data; a translation must not be
    // able to move a boundary. Every minute across four days, both catalogs.
    for (let minutes = 0; minutes < 60 * 24 * 4; minutes += 7) {
      const sameBucket =
        (describeAge(ago(minutes), now, en) === en.justNow) ===
        (describeAge(ago(minutes), now, es) === es.justNow);
      expect(sameBucket).toBe(true);
    }
  });
});

describe("formatDate", () => {
  const instant = new Date(2026, 6, 30, 15, 24);

  it("uses the day/month order of the given locale", () => {
    const es = formatDate(instant, "es-AR")!;
    const en = formatDate(instant, "en-US")!;

    expect(es).toContain("30/07/2026");
    expect(en).toContain("07/30/2026");
    expect(es).not.toBe(en);
  });

  it.each([null, undefined, new Date("nonsense")])(
    "returns null for %j rather than a placeholder string",
    (value) => {
      expect(formatDate(value, "es-AR")).toBeNull();
    }
  );
});

describe("formatYmd", () => {
  it("renders a calendar day in each locale's order", () => {
    expect(formatYmd("2026-07-30", "es-AR")).toBe("30/07/2026");
    expect(formatYmd("2026-07-30", "en-US")).toBe("07/30/2026");
  });

  it("keeps the day the string names, with no timezone round trip", () => {
    // Regression pin for the same UTC-midnight trap parseYmdLocal guards: an
    // Argentine reader must not be told 31 July is 30 July.
    expect(formatYmd("2026-08-01", "es-AR")).toBe("01/08/2026");
  });

  it.each(["", "not-a-date", "2026-13-01"])(
    "falls back to the raw value for %j",
    (ymd) => {
      expect(formatYmd(ymd, "es-AR")).toBe(ymd);
    }
  );
});
