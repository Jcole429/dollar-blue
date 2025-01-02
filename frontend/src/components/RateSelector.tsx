"use client";

import React, { useState } from "react";
import { useExchangeRateToUse } from "@/contexts/ExchangeRateToUseContext";
import { useCurrentExchangeRateContext } from "@/contexts/CurrentExchangeRateContext";
import axios from "axios";

const RateSelector: React.FC = () => {
  const { setExchangeRateToUse, exchangeRateToUse } = useExchangeRateToUse();
  const { exchangeRateBlueAvg, exchangeRateCryptoAvg } =
    useCurrentExchangeRateContext();

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

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const maxDate = yesterday.toISOString().split("T")[0]; // Format as YYYY-MM-DD

  const fetchHistoricalRate = async (rateType: string, date: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `'https://api.argentinadatos.com/v1/cotizaciones/dolares/${rateType}/${date}`
      );
      const rate = response.data.rate;
      return rate;
    } catch (err) {
      console.error("Error fetching historical rate:", err);
      setError("Failed to fetch historical rate. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRateTypeChange = (type: "blue" | "cripto" | "custom") => {
    setSelectedRateType(type);

    if (type === "custom") {
      setExchangeRateToUse(customRate || null); // Use custom rate if selected
    } else if (rateOption === "current") {
      const rate =
        type === "blue"
          ? exchangeRateBlueAvg
          : type === "cripto"
          ? exchangeRateCryptoAvg
          : null;
      setExchangeRateToUse(rate ?? null);
    } else if (rateOption === "historical") {
      const rate =
        type === "blue"
          ? exchangeRateBlueAvg
          : type === "cripto"
          ? exchangeRateCryptoAvg
          : null;
      setExchangeRateToUse(rate ?? null);
    }
  };

  const handleRateOptionChange = (option: "current" | "historical") => {
    setRateOption(option);

    if (option === "current") {
      const rate =
        selectedRateType === "blue"
          ? exchangeRateBlueAvg
          : exchangeRateCryptoAvg;
      setExchangeRateToUse(rate ?? null);
    } else {
      setExchangeRateToUse(null); // Reset the rate for historical until a date is selected
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value;
    setSelectedDate(date);

    // Fetch and set the historical rate (mock implementation here)
    if (rateOption === "historical" && date) {
      console.log(
        `Fetching historical rate for ${selectedRateType} on ${date}`
      );
      // You would fetch the rate for the specific date here
      setExchangeRateToUse(123.45); // Replace with fetched rate
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
      <div className="row">Using Rate: {exchangeRateToUse}</div>
    </div>
  );
};

export default RateSelector;
