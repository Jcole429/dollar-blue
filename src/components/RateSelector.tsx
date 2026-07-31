"use client";

import React, { useEffect, useState } from "react";
import { useExchangeRateToUse } from "@/contexts/ExchangeRateToUseContext";
import { useHistoricalRate } from "@/hooks/useHistoricalRate";
import {
  formatDate,
  formatYmd,
  getMaxHistoricalDate,
  parseYmdLocal,
} from "@/utils/format_date";
import { formatCurrencyARS } from "@/utils/format_currency";
import { useI18n } from "@/i18n/LocaleContext";
import { RATE_TYPES, type SelectedRateType } from "@/types/rates";
import CurrencyInput from "./CurrencyInput";
import { PANEL_CLASS } from "@/utils/styles";

type RateOption = "current" | "historical";

const RateSelector: React.FC = () => {
  const {
    setSelection,
    exchangeRateToUseValue,
    exchangeRateToUseType,
    exchangeRateToUseUpdatedDate,
  } = useExchangeRateToUse();
  const { fetchRate, cancelLookup, loading, error } = useHistoricalRate();
  const { locale, m } = useI18n();

  const [selectedRateType, setSelectedRateType] =
    useState<SelectedRateType>("blue");
  const [rateOption, setRateOption] = useState<RateOption>("current");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [customRate, setCustomRate] = useState<number | null>(null);
  // The offending date rather than the sentence, so the message follows the
  // language rather than being frozen at the moment the date was typed.
  const [dateTooLate, setDateTooLate] = useState<boolean>(false);

  // Recomputed every render rather than pinned at mount, so a tab left open
  // across midnight cannot enforce yesterday's ceiling.
  const maxDate = getMaxHistoricalDate();

  // Reading the clock during render makes this value the server's answer during
  // the prerender and the reader's on the client — a whole day apart for anyone
  // west of UTC in the evening, which is everyone this app is for. React 18 does
  // not repair a mismatched attribute, so the server's ceiling would sit on the
  // input until something happened to re-render, and opening the date picker is
  // not something. The ceiling is therefore withheld until the client owns the
  // DOM. Every check below runs only in response to a user event, so validation
  // is always against the local value regardless.
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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
    // Every route out of here either wants no lookup at all — custom, current,
    // or an emptied date — or is about to start a fresh one that would supersede
    // the old anyway. So the outstanding request is dropped up front, once, and
    // its error with it. Doing this only in the handlers left the *in-flight*
    // case alive: the request landed after the switch, set its error again and
    // wrote its empty result over the rate the user had just picked.
    cancelLookup();

    if (type === "custom") {
      setSelection({ source: "fixed", type, value: custom, updatedDate: new Date() });
      return;
    }

    if (option === "current") {
      // The intent, not a number: the provider reads the quote as it stands on
      // every render, so this keeps meaning "current" past the next refresh.
      setSelection({ source: "current", type });
      return;
    }

    if (date.trim() === "") {
      setSelection({ source: "fixed", type, value: null, updatedDate: null });
      return;
    }

    // The same bail-out `handleDateChange` performs, repeated here because this
    // is the other way in: changing rate type keeps the date, and the date can
    // already be past the ceiling. Fetching it anyway earned a 404, and that 404
    // is reported as an absent rate rather than as a superseded one — so it wrote
    // an empty selection over whatever the user was working with, blanking the
    // converter and the splitter behind a message that contradicted the warning
    // beside the field. Returning leaves the last good selection standing.
    if (date > maxDate) return;

    const value = await fetchRate(type, date);

    // `undefined` means a newer lookup replaced this one while it was in flight.
    // It is answering about a date the user has already left, so it has nothing
    // to say — applying its empty result would undo the newer selection.
    if (value === undefined) return;

    setSelection({
      source: "fixed",
      type,
      value,
      updatedDate: parseYmdLocal(date),
    });
  };

  // The date message is the one thing `applySelection` must not clear: a rate-type
  // change that *stays* on historical goes through it, and an out-of-range date has
  // to keep its warning across that. So it is dropped only on the way out of
  // historical mode, where the date input is disabled and the warning unactionable.
  const leftHistoricalMode = (option: RateOption) => {
    if (option === "current") setDateTooLate(false);
  };

  const handleRateTypeChange = (type: SelectedRateType) => {
    setSelectedRateType(type);
    const option = type === "custom" ? "current" : rateOption;
    if (type === "custom") setRateOption("current");
    leftHistoricalMode(option);
    applySelection(type, option, selectedDate, customRate);
  };

  const handleRateOptionChange = (option: RateOption) => {
    setRateOption(option);
    leftHistoricalMode(option);
    applySelection(selectedRateType, option, selectedDate, customRate);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value;
    setSelectedDate(date);

    if (date !== "" && date > maxDate) {
      // ISO YYYY-MM-DD sorts lexicographically, so a string compare is a date
      // compare here. Report it and leave the user's input alone rather than
      // blocking on alert() and overwriting what they typed.
      setDateTooLate(true);
      return;
    }

    setDateTooLate(false);
    applySelection(selectedRateType, rateOption, date, customRate);
  };

  const handleCustomRateChange = (value: number | null) => {
    setCustomRate(value);
    if (selectedRateType === "custom") {
      setSelection({
        source: "fixed",
        type: "custom",
        value,
        updatedDate: new Date(),
      });
    }
  };

  const statusMessage = () => {
    if (loading) return m.selector.loadingRate;
    if (exchangeRateToUseValue === null) return m.selector.noRateSelected;

    const label = m.rateLabel[exchangeRateToUseType ?? "custom"];
    const amount = formatCurrencyARS(exchangeRateToUseValue, true);
    const when = formatDate(exchangeRateToUseUpdatedDate, locale);

    // Two whole sentences rather than one with an optional tail: Spanish needs
    // "del" before the date, and gluing a translated fragment onto a translated
    // stem is how word order gets locked to whichever language was written first.
    return when === null
      ? m.selector.using(label, amount)
      : m.selector.usingFrom(label, amount, when);
  };

  return (
    <div className={PANEL_CLASS}>
      <div className="row">
        <div className="col">
          <h2 className="mb-4">{m.selector.title}</h2>
        </div>
      </div>
      <div className="row">
        <div className="col">
          {/* A real fieldset, so the group name is announced with each radio
              rather than merely sitting above them. It was an <h6> here and a
              <p> on the sibling group: two spellings of the same thing, one of
              which also put a level-6 heading directly under a level-2. */}
          <fieldset className="mb-3">
            <legend className="form-label fs-6">
              {m.selector.rateTypeLegend}
            </legend>
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
                  {m.rateLabel[type]}
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
                {m.selector.customRate}
              </label>
            </div>
            {selectedRateType === "custom" && (
              <div className="mb-3 mt-2">
                <CurrencyInput
                  id="custom-rate"
                  label={m.selector.customRateLabel}
                  currency="ARS"
                  prefix="ARS/USD"
                  value={customRate}
                  onValueChange={handleCustomRateChange}
                  min={0.01}
                  helpText={m.selector.customRateHelp}
                />
              </div>
            )}
          </fieldset>
        </div>
        <div className="col">
          <fieldset className="mb-3">
            <legend className="form-label fs-6">
              {m.selector.rateOptionLegend}
            </legend>
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
                  {option === "current"
                    ? m.selector.current
                    : m.selector.historical}
                </label>
              </div>
            ))}
          </fieldset>
        </div>
        <div className="col mb-3">
          <label htmlFor="rateDate" className="form-label">
            {m.selector.dateLabel}
          </label>
          <input
            type="date"
            id="rateDate"
            className={`form-control${dateTooLate ? " is-invalid" : ""}`}
            value={selectedDate}
            onChange={handleDateChange}
            max={mounted ? maxDate : undefined}
            disabled={rateOption === "current" || selectedRateType === "custom"}
            aria-invalid={dateTooLate ? true : undefined}
            aria-describedby={dateTooLate ? "rateDate-error" : undefined}
          />
          {dateTooLate && (
            <div
              id="rateDate-error"
              className="text-danger small mt-1"
              role="alert"
            >
              {m.selector.dateTooLate(formatYmd(maxDate, locale))}
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="row">
          <div className="col text-danger" role="alert">
            {error.kind === "missing"
              ? m.selector.noRateForDate(formatYmd(error.ymd, locale))
              : m.selector.fetchFailed}
          </div>
        </div>
      )}
      {/* Carries a formatted timestamp, so it mismatches on hydration for the
          same two reasons the labels in LatestRateDisplay do: the reader's
          timezone is unknown to the server, and Node and the browser ship
          different ICU builds that disagree on the space inside "p. m.". */}
      <div className="row" aria-live="polite" suppressHydrationWarning>
        {statusMessage()}
      </div>
    </div>
  );
};

export default RateSelector;
