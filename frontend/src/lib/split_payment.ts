import { isUsableRate } from "@/utils/rate";

/** USD is handed over in $100 notes, so the USD leg is always a multiple of this. */
export const USD_INCREMENT = 100;

export interface SplitInput {
  totalArs: number;
  /** An optional ARS payment made before the USD leg. */
  prePaymentArs: number | null;
  /** An optional ceiling on the USD leg. */
  usdLimitUsd: number | null;
  rate: number;
}

export interface Payment {
  ars: number;
  usd: number;
}

export interface SplitResult {
  prePayment: Payment | null;
  usdPayment: Payment | null;
  finalPayment: Payment;
  total: Payment;
}

/**
 * Split an ARS total into an optional ARS pre-payment, the largest possible USD
 * payment in $100 notes, and an ARS remainder.
 *
 * Amounts are quantised to whole pesos and the final payment absorbs the
 * residual, so the ARS column always sums exactly to the total. Argentine cash
 * has nothing below a 50-peso note in practice, so a whole-peso plan is not just
 * tidier than a cents-exact one, it is the one you can actually hand over.
 *
 * Returns `null` when the inputs cannot produce a plan (no usable rate, or a
 * non-finite total) — callers render nothing rather than `NaN`.
 */
export function splitPayment(input: SplitInput): SplitResult | null {
  const { totalArs, prePaymentArs, usdLimitUsd, rate } = input;

  if (!isUsableRate(rate)) return null;
  if (!Number.isFinite(totalArs) || totalArs < 0) return null;

  const total = Math.round(totalArs);

  // A pre-payment larger than the total is a user error the component surfaces;
  // clamp here so the arithmetic below stays sane either way.
  const preAmount =
    prePaymentArs !== null && Number.isFinite(prePaymentArs)
      ? Math.min(Math.max(Math.round(prePaymentArs), 0), total)
      : 0;

  const remainingArs = total - preAmount;

  let usdAmount = floorToIncrement(remainingArs / rate);
  if (usdLimitUsd !== null && Number.isFinite(usdLimitUsd)) {
    usdAmount = Math.min(usdAmount, floorToIncrement(usdLimitUsd));
  }

  const usdLegArs = Math.round(usdAmount * rate);
  const finalArs = total - preAmount - usdLegArs;

  const prePayment: Payment | null =
    preAmount > 0 ? { ars: preAmount, usd: preAmount / rate } : null;

  const usdPayment: Payment | null =
    usdAmount > 0 ? { ars: usdLegArs, usd: usdAmount } : null;

  const finalPayment: Payment = { ars: finalArs, usd: finalArs / rate };

  return {
    prePayment,
    usdPayment,
    finalPayment,
    total: {
      ars: total,
      // Summed from the legs rather than derived from the total, so both
      // columns of the table add up to their own footer.
      usd:
        (prePayment?.usd ?? 0) + (usdPayment?.usd ?? 0) + finalPayment.usd,
    },
  };
}

function floorToIncrement(usd: number): number {
  if (!Number.isFinite(usd) || usd <= 0) return 0;
  return Math.floor(usd / USD_INCREMENT) * USD_INCREMENT;
}
