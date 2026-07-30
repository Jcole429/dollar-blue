export type CurrencyCode = "ARS" | "USD";

/** ARS is shown Argentine-style, USD US-style. All `Intl` use in the app lives here. */
const LOCALES: Record<CurrencyCode, string> = {
  ARS: "es-AR",
  USD: "en-US",
};

/**
 * Constructing an `Intl.NumberFormat` is far more expensive than calling `.format`
 * on one — it resolves the locale and compiles a pattern each time. The splitter
 * table formats two cells per row on every render and the amount inputs format on
 * every keystroke, so the handful of distinct formatters are built once and kept.
 */
const formatterCache = new Map<string, Intl.NumberFormat>();

const getFormatter = (
  locale: string,
  options: Intl.NumberFormatOptions
): Intl.NumberFormat => {
  const key = `${locale}|${options.style ?? ""}|${options.currency ?? ""}|${
    options.minimumFractionDigits ?? ""
  }|${options.maximumFractionDigits ?? ""}`;

  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
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

  return getFormatter(LOCALES.ARS, options).format(value);
};

export const formatCurrencyUSD = (value: number) =>
  getFormatter(LOCALES.USD, {
    style: "currency",
    currency: "USD",
  }).format(value);

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
  getFormatter(LOCALES[currency], {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
