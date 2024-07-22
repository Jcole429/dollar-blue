"use client";

import React, { useEffect, useState, useContext } from "react";
import { formatCurrencyARS } from "../utils/format_currency";
import { formatDate } from "@/utils/format_date";
import { ExchangeRateContext } from "@/contexts/ExhangeRateContext";

const LatestRateDisplay: React.FC = () => {
  const context = useContext(ExchangeRateContext);

  if (!context) {
    throw new Error("PaymentSplitter must be used within a ValueAvgProvider");
  }

  const {
    exchangeRateBlueAvg,
    exchangeRateBlueBuy,
    exchangeRateBlueSell,
    exchangeRateLastUpdated,
    exchangeRateTimeSinceLastUpdate,
  } = context;

  return (
    <div className="p-2 m-2 border">
      <h2 className="text-2xl">Latest ARS to USD Exchange Rate</h2>
      <table className="w-full border-collapse border border-gray-200 mt-4">
        <thead>
          <tr>
            <th className="border border-gray-200 px-2 py-1">Average</th>
            <th className="border border-gray-200 px-2 py-1">Sell</th>
            <th className="border border-gray-200 px-2 py-1">Buy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-200 px-2 py-2 whitespace-nowrap">
              {formatCurrencyARS(exchangeRateBlueAvg!, true)}
            </td>
            <td className="border border-gray-200 px-2 py-2 whitespace-nowrap">
              {formatCurrencyARS(exchangeRateBlueSell!, true)}
            </td>
            <td className="border border-gray-200 px-2 py-2 whitespace-nowrap">
              {formatCurrencyARS(exchangeRateBlueBuy!, true)}
            </td>
          </tr>
        </tbody>
      </table>
      <p>Last updated: {exchangeRateTimeSinceLastUpdate}</p>
      <p>
        {exchangeRateLastUpdated !== null
          ? formatDate(exchangeRateLastUpdated)
          : ""}
      </p>
    </div>
  );
};

export default LatestRateDisplay;
