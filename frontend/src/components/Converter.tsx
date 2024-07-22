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

  useEffect(() => {
    if (exchangeRateBlueAvg !== null && dollarAmount !== "") {
      const amount =
        typeof dollarAmount === "number"
          ? dollarAmount
          : parseFloat(dollarAmount);
      setArsAmount(amount * exchangeRateBlueAvg);
    } else {
      setArsAmount(null);
    }
  }, [dollarAmount, exchangeRateBlueAvg]);

  useEffect(() => {
    if (exchangeRateBlueAvg !== null && arsToUsdAmount !== "") {
      const amount =
        typeof arsToUsdAmount === "number"
          ? arsToUsdAmount
          : parseFloat(arsToUsdAmount);
      setUsdAmount(amount / exchangeRateBlueAvg);
    } else {
      setUsdAmount(null);
    }
  }, [arsToUsdAmount, exchangeRateBlueAvg]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDollarAmount(event.target.value);
  };

  const handleArsInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArsToUsdAmount(event.target.value);
  };

  return (
    <div className="p-4 m-4 w-[800px] border">
      <h2 className="text-2xl">Currency Converter</h2>
      <div className="flex">
        <div className="mt-4 mr-1 p-4 border rounded basis-0">
          <h3>{"USD -> ARS"}</h3>
          <input
            type="number"
            value={dollarAmount}
            onChange={handleInputChange}
            placeholder="$USD"
            className="border border-gray-300 px-4 py-2"
          />
          <p>ARS: {arsAmount !== null ? formatCurrencyARS(arsAmount) : ""}</p>
        </div>
        <div className="mt-4 ml-1 p-4 border rounded basis-0">
          <h3>{"ARS -> USD"}</h3>
          <input
            type="number"
            value={arsToUsdAmount}
            onChange={handleArsInputChange}
            placeholder="$ARS"
            className="border border-gray-300 px-4 py-2"
          />
          <p>USD: {usdAmount !== null ? formatCurrencyUSD(usdAmount) : ""}</p>
        </div>
      </div>
    </div>
  );
};

export default Converter;
