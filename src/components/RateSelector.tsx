"use client";

import React, { useState } from "react";
import {
  useExchangeRateToUse,
  type RateSelection,
} from "@/contexts/ExchangeRateToUseContext";
import { useCurrentExchangeRateContext } from "@/contexts/CurrentExchangeRateContext";
import { useHistoricalRate } from "@/hooks/useHistoricalRate";
import {
  formatDate,
  getMaxHistoricalDate,
  parseYmdLocal,
} from "@/utils/format_date";
import { formatCurrencyARS } from "@/utils/format_currency";
import {
  RATE_LABEL,
  RATE_TYPES,
  type RateType,
  type SelectedRateType,
} from "@/types/rates";
import CurrencyInput from "./CurrencyInput";
import { PANEL_CLASS } from "@/utils/styles";

type RateOption = "current" | "historical";

const isHistorical = (type: SelectedRateType): type is RateType =>
  type !== "custom";

const RateSelector: React.FC = () => {
  const {
    setSelection,
    exchangeRateToUseValue,
    exchangeRateToUseType,
    exchangeRateToUseUpdatedDate,
  } = useExchangeRateToUse();
  const { rates } = useCurrentExchangeRateContext();
  const { fetchRate, loading, error } = useHistoricalRate();

  const [selectedRateType, setSelectedRateType] =
    useState<SelectedRateType>("blue");
  const [rateOption, setRateOption] = useState<RateOption>("current");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // Recomputed every render rather than pinned at mount, so a tab left open
  // across midnight cannot enforce yesterday's ceiling.
  const maxDate = getMaxHistoricalDate();

  /**
   * The single path by which a selection is applied. Every argument is passed
   * explicitly — the previous code read the rate type back out of context after
   * setting it, which returned the *previous* render's value and so fetched
   * blue while labelling it cripto.
   */
  const applySelection = async (
    type: SelectedRateType,
    option: RateOption,
    date: string,
    custom: number | null
  ) => {
    if (type === "custom") {
      setSelection({ type, value: custom, updatedDate: new Date() });
      return;
    }

    if (option === "current") {
      const snapshot = rates[type];
      setSelection({
        type,
        value: snapshot?.avg ?? null,
        updatedDate: snapshot?.lastUpdated ?? null,
      });
      return;
    }

    if (date.trim() === "") {
      setSelection({ type, value: null, updatedDate: null });
      return;
    }

    const value = await fetchRate(type, date);
    const selection: RateSelection = {
      type,
      value,
      updatedDate: parseYmdLocal(date),
    };
    setSelection(selection);
  };

  const handleRateTypeChange = (type: SelectedRateType) => {
    setSelectedRateType(type);
    const option = type === "custom" ? "current" : rateOption;
    if (type === "custom") setRateOption("current");
    applySelection(type, option, selectedDate, customRate);
  };

  const handleRateOptionChange = (option: RateOption) => {
    setRateOption(option);
    applySelection(selectedRateType, option, selectedDate, customRate);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value;
    setSelectedDate(date);

    if (date !== "" && date > maxDate) {
      // ISO YYYY-MM-DD sorts lexicographically, so a string compare is a date
      // compare here. Report it and leave the user's input alone rather than
      // blocking on alert() and overwriting what they typed.
      setDateError(`Historical rates are only published through ${maxDate}.`);
      return;
    }

    setDateError(null);
    applySelection(selectedRateType, rateOption, date, customRate);
  };

  const handleCustomRateChange = (value: number | null) => {
    setCustomRate(value);
    if (selectedRateType === "custom") {
      setSelection({ type: "custom", value, updatedDate: new Date() });
    }
  };

  const statusMessage = () => {
    if (loading) return "Loading rate…";
    if (exchangeRateToUseValue === null) return "No rate selected.";

    const label =
      exchangeRateToUseType && isHistorical(exchangeRateToUseType)
        ? RATE_LABEL[exchangeRateToUseType]
        : "custom";
    const when = exchangeRateToUseUpdatedDate
      ? ` from ${formatDate(exchangeRateToUseUpdatedDate)}`
      : "";

    return `Using ${label} rate ${formatCurrencyARS(
      exchangeRateToUseValue,
      true
    )}${when}`;
  };

  return (
    <div className={PANEL_CLASS}>
      <div className="row">
        <div className="col">
          <h2 className="mb-4">Select Exchange Rate</h2>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="mb-3">
            <h6 className="form-label">Select Rate Type:</h6>
            {RATE_TYPES.map((type) => (
              <div className="form-check" key={type}>
                <input
                  type="radio"
                  id={`rate-type-${type}`}
                  name="rateType"
                  value={type}
                  className="form-check-input"
                  checked={selectedRateType === type}
                  onChange={() => handleRateTypeChange(type)}
                />
                <label
                  htmlFor={`rate-type-${type}`}
                  className="form-check-label"
                >
                  {RATE_LABEL[type]}
                </label>
              </div>
            ))}
            <div className="form-check">
              <input
                type="radio"
                id="rate-type-custom"
                name="rateType"
                value="custom"
                className="form-check-input"
                checked={selectedRateType === "custom"}
                onChange={() => handleRateTypeChange("custom")}
              />
              <label htmlFor="rate-type-custom" className="form-check-label">
                Custom Rate
              </label>
            </div>
            {selectedRateType === "custom" && (
              <div className="mb-3 mt-2">
                <CurrencyInput
                  id="custom-rate"
                  label="Enter Custom Rate:"
                  currency="ARS"
                  prefix="ARS/USD"
                  value={customRate}
                  onValueChange={handleCustomRateChange}
                  min={0.01}
                  helpText="Argentine pesos per US dollar."
                />
              </div>
            )}
          </div>
        </div>
        <div className="col">
          <div className="mb-3">
            <p className="form-label">Select Rate Option:</p>
            {(["current", "historical"] as RateOption[]).map((option) => (
              <div className="form-check" key={option}>
                <input
                  type="radio"
                  id={`rate-option-${option}`}
                  name="rateOption"
                  value={option}
                  className="form-check-input"
                  checked={rateOption === option}
                  onChange={() => handleRateOptionChange(option)}
                  disabled={selectedRateType === "custom"}
                />
                <label
                  htmlFor={`rate-option-${option}`}
                  className="form-check-label"
                >
                  {option === "current" ? "Current Rate" : "Historical Rate"}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="col mb-3">
          <label htmlFor="rateDate" className="form-label">
            Select Date:
          </label>
          <input
            type="date"
            id="rateDate"
            className={`form-control${dateError ? " is-invalid" : ""}`}
            value={selectedDate}
            onChange={handleDateChange}
            max={maxDate}
            disabled={rateOption === "current" || selectedRateType === "custom"}
            aria-invalid={dateError ? true : undefined}
            aria-describedby={dateError ? "rateDate-error" : undefined}
          />
          {dateError && (
            <div id="rateDate-error" className="text-danger small mt-1" role="alert">
              {dateError}
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="row">
          <div className="col text-danger" role="alert">
            {error}
          </div>
        </div>
      )}
      <div className="row" aria-live="polite">
        {statusMessage()}
      </div>
    </div>
  );
};

export default RateSelector;
