"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatCurrencyARS, formatCurrencyUSD } from "../utils/format_currency";

const Converter: React.FC = () => {
  const [dollarAmount, setDollarAmount] = useState<number | string>("");
  const [valueAvg, setValueAvg] = useState<number | null>(null);
  const [arsAmount, setArsAmount] = useState<number | null>(null);
  const [arsToUsdAmount, setArsToUsdAmount] = useState<number | string>("");
  const [usdAmount, setUsdAmount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch the latest value_avg from an API
    const fetchValueAvg = async () => {
      try {
        const response = await axios.get(
          "https://api.bluelytics.com.ar/v2/latest"
        ); // Replace with your API endpoint
        console.log("Ran API");
        setValueAvg(response.data.blue.value_avg); // Ensure this path matches your API response structure
      } catch (error) {
        console.error("Error fetching value_avg:", error);
      }
    };

    fetchValueAvg();
  }, []);

  useEffect(() => {
    if (valueAvg !== null && dollarAmount !== "") {
      const amount =
        typeof dollarAmount === "number"
          ? dollarAmount
          : parseFloat(dollarAmount);
      setArsAmount(amount * valueAvg);
    } else {
      setArsAmount(null);
    }
  }, [dollarAmount, valueAvg]);

  useEffect(() => {
    if (valueAvg !== null && arsToUsdAmount !== "") {
      const amount =
        typeof arsToUsdAmount === "number"
          ? arsToUsdAmount
          : parseFloat(arsToUsdAmount);
      setUsdAmount(amount / valueAvg);
    } else {
      setUsdAmount(null);
    }
  }, [arsToUsdAmount, valueAvg]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDollarAmount(event.target.value);
  };

  const handleArsInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArsToUsdAmount(event.target.value);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl">Currency Converter</h2>
      <div className="flex">
        <div className="m-4 p-4 border rounded basis-0">
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
        <div className="m-4 p-4 border rounded">
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
