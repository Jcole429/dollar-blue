"use client";

import React, { useState, useEffect, useContext } from "react";
import { formatCurrencyARS, formatCurrencyUSD } from "../utils/format_currency";
import { ExchangeRateContext } from "@/contexts/ExhangeRateContext";

const Converter: React.FC = () => {
  const context = useContext(ExchangeRateContext);

  if (!context) {
    throw new Error("PaymentSplitter must be used within a ValueAvgProvider");
  }

  const { exchangeRateBlueAvg } = context;

  const [dollarAmount, setDollarAmount] = useState<number | string>("");
  const [arsAmount, setArsAmount] = useState<number | null>(null);
  const [arsToUsdAmount, setArsToUsdAmount] = useState<number | string>("");
  const [usdAmount, setUsdAmount] = useState<number | null>(null);
  const [rateOverrideInput, setRateOverrideInput] = useState<string>("");

  useEffect(() => {
    if (exchangeRateBlueAvg !== null && dollarAmount !== "") {
      const amount =
        typeof dollarAmount === "number"
          ? dollarAmount
          : parseFloat(dollarAmount);
      if (rateOverrideInput !== "") {
        setArsAmount(amount * parseFloat(rateOverrideInput));
      } else {
        setArsAmount(amount * exchangeRateBlueAvg);
      }
    } else {
      setArsAmount(null);
    }
  }, [dollarAmount, exchangeRateBlueAvg, rateOverrideInput]);

  useEffect(() => {
    if (exchangeRateBlueAvg !== null && arsToUsdAmount !== "") {
      const amount =
        typeof arsToUsdAmount === "number"
          ? arsToUsdAmount
          : parseFloat(arsToUsdAmount);
      if (rateOverrideInput !== "") {
        setUsdAmount(amount / parseFloat(rateOverrideInput));
      } else {
        setUsdAmount(amount / exchangeRateBlueAvg);
      }
    } else {
      setUsdAmount(null);
    }
  }, [arsToUsdAmount, exchangeRateBlueAvg, rateOverrideInput]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDollarAmount(event.target.value);
  };

  const handleArsInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArsToUsdAmount(event.target.value);
  };

  const handleRateOverrideChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value);
    console.log(value);
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
                  value={dollarAmount}
                  onChange={handleInputChange}
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
                  value={arsAmount !== null ? formatCurrencyARS(arsAmount) : ""}
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
                  value={arsToUsdAmount}
                  onChange={handleArsInputChange}
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
                  value={usdAmount !== null ? formatCurrencyUSD(usdAmount) : ""}
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
