import { describe, expect, it } from "vitest";
import { parseAmount } from "./parse_amount";
import { formatAmountForInput, type CurrencyCode } from "./format_currency";

describe("parseAmount", () => {
  it.each([
    // Both conventions, fully qualified
    ["1.234,56", 1234.56],
    ["1,234.56", 1234.56],
    ["1234,56", 1234.56],
    ["1234.56", 1234.56],

    // Bare integers
    ["1234", 1234],
    ["0", 0],

    // Grouping exception: 3 trailing digits, only one separator kind in play
    ["1.234", 1234],
    ["1,234", 1234],
    ["1.234.567", 1234567],
    ["1,234,567", 1234567],
    ["10.500", 10500],

    // ...but not when a leading zero shows it is really a decimal (rule d)
    ["0,999", 1],
    ["0.999", 1],
    [",999", 1],
    [".999", 1],

    // ...nor when the other separator is present (rule c)
    ["1,234.567", 1234.57],
    ["1.234,567", 1234.57],

    // Fraction lengths other than 3 are always decimals
    ["1,5", 1.5],
    ["1.5", 1.5],
    ["1.234.56", 1234.56],
    ["12,34,56", 1234.56],

    // Mid-typing
    ["1.", 1],
    ["1,", 1],

    // Sign
    ["-1.234,56", -1234.56],
    ["+1234", 1234],

    // Noise: currency symbols and the space characters Intl emits
    ["$ 1.234,56", 1234.56],
    ["$ 1.234,56", 1234.56],
    ["$ 1.234,56", 1234.56],
    ["US$ 1,234.56", 1234.56],
    ["  1234  ", 1234],

    // Rounding to the domain's 2dp
    ["1,005", 1005],
    ["1.2345", 1.23],
    ["1.2355", 1.24],
  ])("parses %j as %s", (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });

  it.each([
    ["", "empty"],
    ["   ", "whitespace only"],
    ["abc", "letters"],
    ["1..2", "adjacent separators"],
    ["1,,2", "adjacent separators"],
    ["1.,2", "adjacent separators"],
    ["1.2.3,4,5", "incoherent mixed grouping"],
    ["$", "symbol only"],
    ["-", "sign only"],
    ["1a2", "embedded letter"],
    [".", "separator only"],
  ])("rejects %j (%s)", (input) => {
    expect(parseAmount(input)).toBeNull();
  });

  it("treats a legitimate zero as zero, not as absent", () => {
    // Regression pin: the old `parseFloat(...) || null` turned 0 into null.
    expect(parseAmount("0")).toBe(0);
    expect(parseAmount("0,00")).toBe(0);
  });

  it("does not accept a non-string", () => {
    expect(parseAmount(null as unknown as string)).toBeNull();
    expect(parseAmount(undefined as unknown as string)).toBeNull();
  });
});

describe("formatAmountForInput -> parseAmount round trip", () => {
  const values = [0, 1, 0.5, 100, 1234, 1234.56, 999999, 1234567.89];
  const currencies: CurrencyCode[] = ["ARS", "USD"];

  it.each(
    currencies.flatMap((currency) =>
      values.map((value) => [currency, value] as const)
    )
  )("%s %s survives a format/parse cycle", (currency, value) => {
    expect(parseAmount(formatAmountForInput(value, currency))).toBe(value);
  });
});
