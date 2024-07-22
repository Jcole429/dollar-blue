"use client";

import React, { useEffect, useState, useContext } from "react";
import { formatCurrencyARS } from "../utils/format_currency";
import { formatDate } from "@/utils/format_date";
import { ExchangeRateContext } from "@/contexts/ExhangeRateContext";

const LatestRate: React.FC = () => {
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

  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // if (error) {
  //   return <div>{error}</div>;
  // }
  return (
    <div className="p-4 m-4 w-[800px] border">
      <h2 className="text-2xl">Latest Exchange Rate</h2>
      <table className="mt-4 border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-200 px-2 py-1">Updated At</th>
            <th className="border border-gray-200 px-2 py-1">Time Since</th>
            <th className="border border-gray-200 px-2 py-1">Average</th>
            <th className="border border-gray-200 px-2 py-1">Sell</th>
            <th className="border border-gray-200 px-2 py-1">Buy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {exchangeRateLastUpdated
                ? formatDate(exchangeRateLastUpdated)
                : "N/A"}
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {exchangeRateTimeSinceLastUpdate}
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {formatCurrencyARS(exchangeRateBlueAvg!, true)}
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {formatCurrencyARS(exchangeRateBlueSell!, true)}
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {formatCurrencyARS(exchangeRateBlueBuy!, true)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default LatestRate;
