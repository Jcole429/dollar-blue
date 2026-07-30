import { describe, expect, it } from "vitest";
import { splitPayment, USD_INCREMENT, type SplitInput } from "./split_payment";

const RATE = 1310.5;

const input = (overrides: Partial<SplitInput> = {}): SplitInput => ({
  totalArs: 1_000_000,
  prePaymentArs: null,
  usdLimitUsd: null,
  rate: RATE,
  ...overrides,
});

describe("splitPayment", () => {
  it("pays the largest whole-$100 amount when there is no pre-payment", () => {
    const result = splitPayment(input())!;

    expect(result.prePayment).toBeNull();
    // 1,000,000 / 1310.5 = 763.06 USD -> 700
    expect(result.usdPayment?.usd).toBe(700);
    expect(result.total.ars).toBe(1_000_000);
  });

  it("subtracts a pre-payment before sizing the USD leg", () => {
    const result = splitPayment(
      input({ totalArs: 1_000_000, prePaymentArs: 400_000 })
    )!;

    expect(result.prePayment?.ars).toBe(400_000);
    // 600,000 / 1310.5 = 457.8 USD -> 400
    expect(result.usdPayment?.usd).toBe(400);
  });

  it("clamps the USD leg to the limit when the limit binds", () => {
    const result = splitPayment(input({ usdLimitUsd: 250 }))!;
    expect(result.usdPayment?.usd).toBe(200);
  });

  it("ignores the limit when it does not bind", () => {
    const unlimited = splitPayment(input())!;
    const generous = splitPayment(input({ usdLimitUsd: 10_000 }))!;
    expect(generous.usdPayment?.usd).toBe(unlimited.usdPayment?.usd);
  });

  it("rounds a non-multiple limit down to a whole $100", () => {
    const result = splitPayment(input({ usdLimitUsd: 349 }))!;
    expect(result.usdPayment?.usd).toBe(300);
  });

  it("omits the USD leg when the total is worth less than $100", () => {
    const result = splitPayment(input({ totalArs: 50_000 }))!;
    expect(result.usdPayment).toBeNull();
    expect(result.finalPayment.ars).toBe(50_000);
  });

  it("omits the USD leg when the limit is below one increment", () => {
    const result = splitPayment(input({ usdLimitUsd: 99 }))!;
    expect(result.usdPayment).toBeNull();
  });

  it("omits the pre-payment row when it is zero", () => {
    expect(splitPayment(input({ prePaymentArs: 0 }))!.prePayment).toBeNull();
  });

  it("clamps a pre-payment larger than the total", () => {
    const result = splitPayment(
      input({ totalArs: 100_000, prePaymentArs: 500_000 })
    )!;
    expect(result.prePayment?.ars).toBe(100_000);
    expect(result.finalPayment.ars).toBe(0);
    expect(result.usdPayment).toBeNull();
  });

  it("leaves nothing over when the total is an exact multiple of the rate", () => {
    const result = splitPayment(input({ totalArs: 500 * RATE, rate: RATE }))!;
    expect(result.usdPayment?.usd).toBe(500);
    expect(result.finalPayment.ars).toBe(0);
  });

  it("returns null rather than NaN for an unusable rate", () => {
    expect(splitPayment(input({ rate: 0 }))).toBeNull();
    expect(splitPayment(input({ rate: -5 }))).toBeNull();
    expect(splitPayment(input({ rate: NaN }))).toBeNull();
  });

  it("returns null for a non-finite or negative total", () => {
    expect(splitPayment(input({ totalArs: NaN }))).toBeNull();
    expect(splitPayment(input({ totalArs: -1 }))).toBeNull();
  });
});

describe("splitPayment invariants", () => {
  const totals = [0, 1, 999, 50_000, 1_000_000, 1_234_567, 987_654.32];
  const prePayments = [null, 0, 12_345, 400_000];
  const limits = [null, 99, 250, 1_000, 10_000];
  const rates = [900, 1310.5, 1_487.33];

  const cases = totals.flatMap((totalArs) =>
    prePayments.flatMap((prePaymentArs) =>
      limits.flatMap((usdLimitUsd) =>
        rates.map((rate) => ({ totalArs, prePaymentArs, usdLimitUsd, rate }))
      )
    )
  );

  it("makes the ARS column sum exactly to the total in every case", () => {
    for (const args of cases) {
      const result = splitPayment(args)!;
      const sum =
        (result.prePayment?.ars ?? 0) +
        (result.usdPayment?.ars ?? 0) +
        result.finalPayment.ars;

      expect(sum, JSON.stringify(args)).toBe(result.total.ars);
    }
  });

  it("makes the USD column sum exactly to the total in every case", () => {
    for (const args of cases) {
      const result = splitPayment(args)!;
      const sum =
        (result.prePayment?.usd ?? 0) +
        (result.usdPayment?.usd ?? 0) +
        result.finalPayment.usd;

      expect(sum, JSON.stringify(args)).toBeCloseTo(result.total.usd, 10);
    }
  });

  it("keeps every leg non-negative and the USD leg a whole increment", () => {
    for (const args of cases) {
      const result = splitPayment(args)!;
      const label = JSON.stringify(args);

      expect(result.finalPayment.ars, label).toBeGreaterThanOrEqual(0);
      expect(result.prePayment?.ars ?? 0, label).toBeGreaterThanOrEqual(0);
      expect((result.usdPayment?.usd ?? 0) % USD_INCREMENT, label).toBe(0);
    }
  });
});
