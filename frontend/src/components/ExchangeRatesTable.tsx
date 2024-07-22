"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Value } from "../models/value";
import { formatCurrencyARS } from "../utils/format_currency";

const ExchangeRatesTable: React.FC = () => {
  const [values, setValues] = useState<Value[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get("/api/prices?limit=5");
        setValues(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching prices");
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
    <div className="w-60 p-4">
      <h2 className="text-2xl">Last 5 Days</h2>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-200 px-2 py-1">Date</th>
            <th className="border border-gray-200 px-2 py-1">Value</th>
          </tr>
        </thead>
        <tbody>
          {values.map((price) => (
            <tr key={price.date}>
              <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                {new Date(price.date).toLocaleDateString()}
              </td>
              <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                {formatCurrencyARS(price.value_average)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExchangeRatesTable;
