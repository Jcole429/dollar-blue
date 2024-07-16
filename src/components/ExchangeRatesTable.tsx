"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

type Price = {
  id: number;
  datetime: string;
  value: number;
};

const ExchangeRatesTable: React.FC = () => {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get("/api/prices");
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
          <th className="border border-gray-200 px-4 py-2">Exchange Rate</th>
        </tr>
      </thead>
      <tbody>
        {prices.map((price) => (
          <tr key={price.datetime}>
            <td className="border border-gray-200 px-4 py-2">{price.id}</td>
            <td className="border border-gray-200 px-4 py-2">
              {new Date(price.datetime).toLocaleDateString()}
            </td>
            <td className="border border-gray-200 px-4 py-2">{price.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ExchangeRatesTable;
