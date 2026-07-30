"use client";

import React, { useState } from "react";
import { parseAmount } from "@/utils/parse_amount";
import {
  formatAmountForInput,
  formatCurrency,
  type CurrencyCode,
} from "@/utils/format_currency";

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
  const [text, setText] = useState<string>(
    value === null ? "" : formatAmountForInput(value, currency)
  );
  const [parseError, setParseError] = useState<string | null>(null);
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
      setParseError("Enter a number, e.g. 1.234,56");
      onValueChange(null);
      return;
    }
    if (parsed < min) {
      setParseError(`Must be at least ${formatCurrency(min, currency, true)}.`);
      onValueChange(null);
      return;
    }
    if (max !== undefined && parsed > max) {
      setParseError(`Must be at most ${formatCurrency(max, currency, true)}.`);
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

  const error = parseError ?? errorMessage;
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
          className={`form-control border${error ? " is-invalid" : ""}`}
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
