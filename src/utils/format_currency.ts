export type CurrencyCode = "ARS" | "USD";

/** ARS is shown Argentine-style, USD US-style. All `Intl` use in the app lives here. */
const LOCALES: Record<CurrencyCode, string> = {
  ARS: "es-AR",
  USD: "en-US",
};

export const formatCurrencyARS = (
  value: number,
  includeCents: boolean = false
) => {
  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "ARS",
  };

  if (!includeCents) {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }

  return new Intl.NumberFormat(LOCALES.ARS, options).format(value);
};

export const formatCurrencyUSD = (value: number) => {
  return new Intl.NumberFormat(LOCALES.USD, {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export const formatCurrency = (
  value: number,
  currency: CurrencyCode,
  includeCents: boolean = false
) =>
  currency === "ARS"
    ? formatCurrencyARS(value, includeCents)
    : formatCurrencyUSD(value);

/**
 * Render a value for display *inside* an amount input, in that currency's
 * convention — grouped, but with no currency symbol (the input-group addon
 * already labels the field, and a symbol is one more thing to parse back).
 *
 * `parseAmount` accepts everything this produces, so a blur-format round trip
 * is lossless: 1234 -> "1.234" -> 1234.
 */
export const formatAmountForInput = (
  value: number,
  currency: CurrencyCode
): string =>
  new Intl.NumberFormat(LOCALES[currency], {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
