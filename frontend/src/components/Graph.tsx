"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Price = {
  datetime: string;
  value: number;
};

const Graph: React.FC = () => {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(0);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get("/api/prices?sortOrder=ASC");
        const pricesData = response.data;
        setPrices(pricesData);

        // Calculate min and max values
        const values = pricesData.map((d: Price) => d.value);
        setMinValue(Math.min(...values));
        setMaxValue(Math.max(...values));

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
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        width={500}
        height={300}
        data={prices}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
        />
        <YAxis domain={[minValue, maxValue]} /> {/* Use calculated domain */}
        <Tooltip
          labelFormatter={(label) => new Date(label).toLocaleDateString()}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value_buy"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Graph;
