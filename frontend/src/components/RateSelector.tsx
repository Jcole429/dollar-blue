"use client";

import React, { useState, useEffect } from "react";
import { useExchangeRateToUse } from "@/contexts/ExchangeRateToUseContext";
import { useCurrentExchangeRateContext } from "@/contexts/CurrentExchangeRateContext";
import axios from "axios";
import { formatDate } from "@/utils/format_date";

const RateSelector: React.FC = () => {
  const {
    setExchangeRateToUseValue: setExchangeRateToUse,
    setExchangeRateToUseType: setExchangeRateToUseType,
    setExchangeRateToUseUpdatedDate: setExchangeRateToUseUpdatedDate,
    exchangeRateToUseValue: exchangeRateToUseValue,
    exchangeRateToUseUpdatedDate: exchangeRateToUseUpdatedDate,
    exchangeRateToUseType: exchangeRateToUseType,
  } = useExchangeRateToUse();
  const {
    exchangeRateBlueAvg,
    exchangeRateBlueLastUpdated,
    exchangeRateCryptoAvg,
    exchangeRateCryptoLastUpdated,
  } = useCurrentExchangeRateContext();

  const [selectedRateType, setSelectedRateType] = useState<
    "blue" | "cripto" | "custom"
  >("blue");
  const [rateOption, setRateOption] = useState<"current" | "historical">(
    "current"
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [customRate, setCustomRate] = useState<number | "">("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");

  const getMaxDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  const fetchHistoricalRate = async (rateType: string, date: string) => {
    setLoading(true);
    setError("");

    try {
      const date_parts = date.split("-");
      const year = date_parts[0];
      const month = date_parts[1];
      const day = date_parts[2];
      const response = await axios.get(
        `https://api.argentinadatos.com/v1/cotizaciones/dolares/${rateType}/${year}/${month}/${day}`
      );

      const buy = Math.round(response.data["compra"] * 100) / 100;
      const sell = Math.round(response.data["venta"] * 100) / 100;
      const avg = Math.round(((buy + sell) / 2) * 100) / 100;

      return avg;
    } catch (err) {
      console.error("Error fetching historical rate:", err);
      setError("Failed to fetch historical rate. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRateTypeChange = async (type: "blue" | "cripto" | "custom") => {
    setSelectedRateType(type);

    if (type === "custom") {
      setRateOption("current");
      setExchangeRateToUse(customRate || null); // Use custom rate if selected
      setExchangeRateToUseType(type);
      setExchangeRateToUseUpdatedDate(new Date());
    } else if (rateOption === "current") {
      const rate =
        type === "blue"
          ? exchangeRateBlueAvg
          : type === "cripto"
          ? exchangeRateCryptoAvg
          : null;
      const date =
        type === "blue"
          ? exchangeRateBlueLastUpdated
          : type === "cripto"
          ? exchangeRateCryptoLastUpdated
          : null;
      setExchangeRateToUse(rate ?? null);
      setExchangeRateToUseType(type);
      setExchangeRateToUseUpdatedDate(date);
    } else if (rateOption === "historical") {
      if (selectedDate === undefined || selectedDate.trim() === "") return;
      try {
        setExchangeRateToUseType(type);
        const rate = await fetchHistoricalRate(
          exchangeRateToUseType!,
          selectedDate
        );

        setExchangeRateToUse(rate ?? null);

        const [year, month, day] = selectedDate.split("-");
        const date_object = new Date(selectedDate);
        date_object.setHours(12);
        date_object.setDate(Number(day));
        setExchangeRateToUseUpdatedDate(date_object);
      } catch (error) {
        console.error(`Error fetching historical rate:`, error);
      }
    }
  };

  const handleRateOptionChange = async (option: "current" | "historical") => {
    setRateOption(option);

    if (option === "current") {
      const rate =
        selectedRateType === "blue"
          ? exchangeRateBlueAvg
          : exchangeRateCryptoAvg;
      const date =
        selectedRateType === "blue"
          ? exchangeRateBlueLastUpdated
          : selectedRateType === "cripto"
          ? exchangeRateCryptoLastUpdated
          : null;
      setExchangeRateToUse(rate ?? null);
      setExchangeRateToUseType(selectedRateType);
      setExchangeRateToUseUpdatedDate(date);
    } else {
      if (selectedDate === undefined || selectedDate.trim() === "") {
        setExchangeRateToUse(null); // Reset the rate for historical until a date is selected
        return;
      }
      try {
        const rate = await fetchHistoricalRate(selectedRateType, selectedDate);
        setExchangeRateToUse(rate ?? null);
        setExchangeRateToUseType(selectedRateType);

        const [year, month, day] = selectedDate.split("-");
        const date_object = new Date(selectedDate);
        date_object.setHours(12);
        date_object.setDate(Number(day));
        setExchangeRateToUseUpdatedDate(date_object);
      } catch (error) {
        console.error(`Error fetching historical rate:`, error);
      }
    }
  };

  const handleDateChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const date = event.target.value;
    const maxDate = getMaxDate();

    if (date > maxDate) {
      alert(`Please select a date on or before ${maxDate}`);
      setSelectedDate(maxDate);
    } else {
      setSelectedDate(date);

      if (rateOption === "historical" && date) {
        try {
          const historical_rate = await fetchHistoricalRate(
            selectedRateType,
            date
          );

          setExchangeRateToUse(historical_rate);
          setExchangeRateToUseType(selectedRateType);

          const [year, month, day] = date.split("-");
          const date_object = new Date(date);
          date_object.setHours(12);
          date_object.setDate(Number(day));
          setExchangeRateToUseUpdatedDate(date_object);
        } catch (error) {
          console.error(`Error fetching historical rate:`, error);
        }
      }
    }
  };

  const handleCustomRateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value);
    setCustomRate(isNaN(value) ? "" : value);

    if (selectedRateType === "custom" && rateOption === "current") {
      setExchangeRateToUse(isNaN(value) ? null : value); // Use custom rate if selected
    }
  };

  useEffect(() => {
    // Update max date whenever the component mounts
    const newMaxDate = getMaxDate();
    setMaxDate(newMaxDate);
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="container p-4 mb-2 border rounded shadow-sm bg-light">
      <div className="row">
        <div className="col">
          <h2 className="mb-4">Select Exchange Rate</h2>
        </div>
      </div>
      <div className="row">
        <div className="col">
          {" "}
          {/* Rate Type Selection */}
          <div className="mb-3">
            <h6 className="form-label">Select Rate Type:</h6>
            <div className="form-check">
              <input
                type="radio"
                id="blueRate"
                name="rateType"
                value="blue"
                className="form-check-input"
                checked={selectedRateType === "blue"}
                onChange={() => handleRateTypeChange("blue")}
              />
              <label htmlFor="blueRate" className="form-check-label">
                Dólar Blue
              </label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                id="cryptoRate"
                name="rateType"
                value="cripto"
                className="form-check-input"
                checked={selectedRateType === "cripto"}
                onChange={() => handleRateTypeChange("cripto")}
              />
              <label htmlFor="cryptoRate" className="form-check-label">
                Dólar Cripto
              </label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                id="customRate"
                name="rateType"
                value="custom"
                className="form-check-input"
                checked={selectedRateType === "custom"}
                onChange={() => handleRateTypeChange("custom")}
              />
              <label htmlFor="customRate" className="form-check-label">
                Custom Rate
              </label>
            </div>
            {/* Custom Rate Input */}
            {selectedRateType === "custom" && (
              <div className="mb-3">
                <label htmlFor="customRateInput" className="form-label">
                  Enter Custom Rate:
                </label>
                <input
                  type="number"
                  id="customRateInput"
                  className="form-control"
                  value={customRate || ""}
                  onChange={handleCustomRateChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter rate"
                />
              </div>
            )}
          </div>
        </div>
        <div className="col">
          {" "}
          {/* Rate Option Selection */}
          <div className="mb-3">
            <p className="form-label">Select Rate Option:</p>
            <div className="form-check">
              <input
                type="radio"
                id="currentRate"
                name="rateOption"
                value="current"
                className="form-check-input"
                checked={rateOption === "current"}
                onChange={() => handleRateOptionChange("current")}
                disabled={selectedRateType === "custom"}
              />
              <label htmlFor="currentRate" className="form-check-label">
                Current Rate
              </label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                id="historicalRate"
                name="rateOption"
                value="historical"
                className="form-check-input"
                checked={rateOption === "historical"}
                onChange={() => handleRateOptionChange("historical")}
                disabled={selectedRateType === "custom"}
              />
              <label htmlFor="historicalRate" className="form-check-label">
                Historical Rate
              </label>
            </div>
          </div>
        </div>
        {/* Historical Date Picker */}

        <div className="col mb-3">
          <label htmlFor="rateDate" className="form-label">
            Select Date:
          </label>
          <input
            type="date"
            id="rateDate"
            className="form-control"
            value={selectedDate}
            onChange={handleDateChange}
            max={maxDate} // Restricts the date to today or earlier
            disabled={rateOption === "current" || selectedRateType === "custom"}
          />
        </div>
      </div>
      <div className="row">{`Using ${exchangeRateToUseType} rate ${exchangeRateToUseValue} from ${formatDate(
        exchangeRateToUseUpdatedDate!
      )}`}</div>
    </div>
  );
};

export default RateSelector;
