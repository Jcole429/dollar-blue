"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatCurrencyARS } from "../utils/format_currency";
import { formatDate } from "@/utils/format_date";

const LatestRate: React.FC = () => {
  const [latestRateAvg, setLatestRateAvg] = useState<number | null>(null);
  const [latestRateSell, setLatestRateSell] = useState<number | null>(null);
  const [latestRateBuy, setLatestRateBuy] = useState<number | null>(null);
  const [latestUpdatedAt, setLatestUpdatedAt] = useState<Date | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get(
          "https://api.bluelytics.com.ar/v2/latest"
        );
        setLatestRateAvg(response.data.blue.value_avg);
        setLatestRateSell(response.data.blue.value_sell);
        setLatestRateBuy(response.data.blue.value_buy);
        setLatestUpdatedAt(new Date(response.data.last_update));

        setLoading(false);
      } catch (error) {
        setError("Error fetching latest rate");
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="w-80 p-4">
      <h2 className="text-2xl">Latest Exchange Rate</h2>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-200 px-2 py-1">Updated At</th>
            <th className="border border-gray-200 px-2 py-1">Average</th>
            <th className="border border-gray-200 px-2 py-1">Sell</th>
            <th className="border border-gray-200 px-2 py-1">Buy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {latestUpdatedAt ? formatDate(latestUpdatedAt) : "N/A"}
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {formatCurrencyARS(latestRateAvg!, true)}
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {formatCurrencyARS(latestRateSell!, true)}
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {formatCurrencyARS(latestRateBuy!, true)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default LatestRate;
