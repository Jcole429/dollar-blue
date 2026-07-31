"use client";

import React, { useState } from "react";
import { parseAmount } from "@/utils/parse_amount";
import {
  formatAmountForInput,
  formatCurrency,
  type CurrencyCode,
} from "@/utils/format_currency";
import { useI18n } from "@/i18n/LocaleContext";
import type { Messages } from "@/i18n/messages";

interface CurrencyInputProps {
  id: string;
  label: string;
  currency: CurrencyCode;
  /** Text for the input-group addon. Defaults to the currency code. */
  prefix?: string;
  /** The canonical numeric value. Owned by the parent; `null` means "nothing entered". */
  value: number | null;
  onValueChange: (value: number | null) => void;
  min?: number;
  max?: number;
  /** A domain error from the parent (e.g. "first payment exceeds total"). */
  errorMessage?: string | null;
  helpText?: string;
  disabled?: boolean;
}

/** Why the typed text was rejected. See the `parseError` state for why this is a code. */
type ParseError = "notANumber" | "tooSmall" | "tooLarge";

const describeParseError = (
  parseError: ParseError | null,
  messages: Messages["amountInput"],
  currency: CurrencyCode,
  min: number,
  max: number | undefined
): string | null => {
  switch (parseError) {
    case null:
      return null;
    case "notANumber":
      return messages.notANumber;
    case "tooSmall":
      return messages.tooSmall(formatCurrency(min, currency, true));
    case "tooLarge":
      // `max` is always set when this code is: it is only reachable from the
      // `max !== undefined` branch. Handled anyway rather than asserted.
      return max === undefined
        ? null
        : messages.tooLarge(formatCurrency(max, currency, true));
  }
};

/**
 * An amount input that accepts either separator convention.
 *
 * The parent owns the number, this component owns the keystrokes — that split is
 * the reason it exists. Text is reformatted on blur rather than as you type, and
 * a live echo below the field shows what the parser actually read, so a
 * misread can never be silent the way `parseFloat` used to be.
 */
const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  label,
  currency,
  prefix,
  value,
  onValueChange,
  min = 0,
  max,
  errorMessage = null,
  helpText,
  disabled = false,
}) => {
  const { m } = useI18n();
  const [text, setText] = useState<string>(
    value === null ? "" : formatAmountForInput(value, currency)
  );
  // The *reason* the text would not parse, never the sentence describing it.
  // Storing the sentence would freeze it in whichever language was active when
  // the key was pressed, so switching language left a stale message under the
  // field. The code survives the switch; the wording is derived below.
  const [parseError, setParseError] = useState<ParseError | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [syncedValue, setSyncedValue] = useState<number | null>(value);

  // Let a programmatic change (a new exchange rate, a reset) reach the box —
  // but never while the user is mid-keystroke, and never while what they typed
  // failed to parse. That last guard is why this is not an effect: on blur the
  // effect saw the null this component had just reported for the bad input and
  // wiped the field, leaving "Enter a number" under an empty box with nothing
  // left to correct. Deriving during render keeps unparseable text on screen.
  if (!isFocused && parseError === null && value !== syncedValue) {
    setSyncedValue(value);
    setText(value === null ? "" : formatAmountForInput(value, currency));
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setText(raw);

    if (raw.trim() === "") {
      setParseError(null);
      onValueChange(null);
      return;
    }

    const parsed = parseAmount(raw);

    if (parsed === null) {
      setParseError("notANumber");
      onValueChange(null);
      return;
    }
    if (parsed < min) {
      setParseError("tooSmall");
      onValueChange(null);
      return;
    }
    if (max !== undefined && parsed > max) {
      setParseError("tooLarge");
      onValueChange(null);
      return;
    }

    setParseError(null);
    onValueChange(parsed);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value !== null) setText(formatAmountForInput(value, currency));
  };

  const parseErrorMessage = describeParseError(
    parseError,
    m.amountInput,
    currency,
    min,
    max
  );

  const error = parseErrorMessage ?? errorMessage;
  const echoId = `${id}-echo`;
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const showEcho = value !== null && isFocused;

  const describedBy =
    [helpText && helpId, showEcho && echoId, error && errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="input-group">
        <span className="input-group-text">{prefix ?? currency}</span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          // No `border` utility here. It resolves to exactly the border
          // `form-control` already draws, but as `!important` — which outranks
          // the red one `is-invalid` asks for, so a rejected amount kept a grey
          // box. The date input in RateSelector never carried it and has always
          // turned red properly.
          className={`form-control${error ? " is-invalid" : ""}`}
          value={text}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      </div>
      {helpText && (
        <div id={helpId} className="form-text">
          {helpText}
        </div>
      )}
      {showEcho && (
        <div id={echoId} className="form-text">
          {/* Always with cents: this exists to confirm exactly what was parsed,
              so it must not hide a fractional part behind whole-peso display. */}
          = {formatCurrency(value, currency, true)}
        </div>
      )}
      {error && (
        <div id={errorId} className="text-danger small mt-1" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default CurrencyInput;
