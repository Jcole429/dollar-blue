"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

type Price = {
  id: number;
  date: string;
  value_sell: number;
  value_buy: number;
};

const ExchangeRatesTable: React.FC = () => {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get("/api/prices?limit=5");
        setPrices(response.data);
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
    <table className="min-w-full border-collapse border border-gray-200">
      <thead>
        <tr>
          <th className="border border-gray-200 px-4 py-2">ID</th>
          <th className="border border-gray-200 px-4 py-2">Date</th>
          <th className="border border-gray-200 px-4 py-2">Value Sell</th>
          <th className="border border-gray-200 px-4 py-2">Value Buy</th>
          <th className="border border-gray-200 px-4 py-2">Value Avg</th>
        </tr>
      </thead>
      <tbody>
        {prices.map((price) => (
          <tr key={price.date}>
            <td className="border border-gray-200 px-4 py-2">{price.id}</td>
            <td className="border border-gray-200 px-4 py-2">
              {new Date(price.date).toLocaleDateString()}
            </td>
            <td className="border border-gray-200 px-4 py-2">
              {price.value_sell}
            </td>
            <td className="border border-gray-200 px-4 py-2">
              {price.value_buy}
            </td>
            <td className="border border-gray-200 px-4 py-2">
              {(price.value_sell + price.value_buy) / 2}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ExchangeRatesTable;
