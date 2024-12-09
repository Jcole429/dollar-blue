"use client";

import React, { useState, useEffect, useContext } from "react";
import { formatCurrencyARS, formatCurrencyUSD } from "../utils/format_currency";
import { ExchangeRateContext } from "@/contexts/ExchangeRateContext";

const Converter: React.FC = () => {
  const context = useContext(ExchangeRateContext);

  if (!context) {
    throw new Error("PaymentSplitter must be used within a ValueAvgProvider");
  }

  const { exchangeRateBlueAvg } = context;

  const [usdToArsInput, setUsdToArsInput] = useState<string>("");
  const [usdToArsValue, setUsdToArsValue] = useState<number | null>(null);

  const [arsToUsdInput, setArsToUsdInput] = useState<number | string>("");
  const [arsToUsdValue, setArsToUsdValue] = useState<number | null>(null);

  const [rateOverrideInput, setRateOverrideInput] = useState<string>("");
  const [rateOverrideValue, setRateOverrideValue] = useState<number | null>(
    null
  );

  const [arsAmountDisplay, setArsAmountDisplay] = useState<string>("");
  const [usdAmountDisplay, setUsdAmountDisplay] = useState<string>("");

  useEffect(() => {
    if (exchangeRateBlueAvg !== null && usdToArsValue !== null) {
      if (rateOverrideValue !== null) {
        setArsAmountDisplay(
          formatCurrencyARS(usdToArsValue * rateOverrideValue)
        );
      } else {
        setArsAmountDisplay(
          formatCurrencyARS(usdToArsValue * exchangeRateBlueAvg)
        );
      }
    } else {
      setArsAmountDisplay("");
    }
  }, [usdToArsValue, exchangeRateBlueAvg, rateOverrideValue]);

  useEffect(() => {
    if (exchangeRateBlueAvg !== null && arsToUsdValue !== null) {
      if (rateOverrideValue !== null) {
        setUsdAmountDisplay(
          formatCurrencyUSD(arsToUsdValue / rateOverrideValue)
        );
      } else {
        setUsdAmountDisplay(
          formatCurrencyUSD(arsToUsdValue / exchangeRateBlueAvg)
        );
      }
    } else {
      setUsdAmountDisplay("");
    }
  }, [arsToUsdValue, exchangeRateBlueAvg, rateOverrideValue]);

  const handleUsdToArsInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value.replace(/\D/g, "")) || null;
    setUsdToArsValue(value);
    setUsdToArsInput(event.target.value);
  };

  const handleArsToUsdInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value.replace(/\D/g, "")) || null;
    setArsToUsdValue(value);
    setArsToUsdInput(event.target.value);
  };

  const handleRateOverrideChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value.replace(/\D/g, "")) || null;
    setRateOverrideValue(value);
    setRateOverrideInput(event.target.value);
  };

  return (
    <div className="section row border mb-2 mx-0">
      <div className="col">
        <div className="row">
          <div className="col">
            <h2 className="pt-2">Currency Converter</h2>
          </div>
        </div>
        <div className="row">
          <div>Rate override</div>
          <div className="col input-group">
            <span className="input-group-text">ARS</span>
            <input
              type="text"
              value={rateOverrideInput}
              onChange={handleRateOverrideChange}
              placeholder=""
              className="form-control border"
            />
          </div>
          <div className="col"></div>
        </div>
        <div className="row grid gap-2 p-2">
          <div className="col-md border py-2">
            <div className="row pt-2">
              <div className="col">
                <h5>{"USD -> ARS"}</h5>
              </div>
            </div>
            <div className="row pb-2">
              <div className="col input-group">
                <span className="input-group-text">USD</span>
                <input
                  type="text"
                  value={usdToArsInput}
                  onChange={handleUsdToArsInputChange}
                  placeholder=""
                  className="form-control border"
                />
              </div>
            </div>
            <div className="row">
              <div className="col input-group">
                <span className="input-group-text">ARS</span>
                <input
                  disabled
                  type="text"
                  value={arsAmountDisplay}
                  className="form-control border"
                />
              </div>
            </div>
          </div>
          <div className="col-md border py-2">
            <div className="row pt-2">
              <div className="col">
                <h5>{"ARS -> USD"}</h5>
              </div>
            </div>
            <div className="row pb-2">
              <div className="col input-group">
                <span className="input-group-text">ARS</span>
                <input
                  type="text"
                  value={arsToUsdInput}
                  onChange={handleArsToUsdInputChange}
                  placeholder=""
                  className="form-control border"
                />
              </div>
            </div>
            <div className="row">
              <div className="col input-group">
                <span className="input-group-text">USD</span>
                <input
                  disabled
                  type="text"
                  value={usdAmountDisplay}
                  placeholder=""
                  className="form-control border"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Converter;
