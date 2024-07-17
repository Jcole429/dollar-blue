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
import moment from "moment";
import { Value } from "../models/value";
import { formatCurrencyARS } from "../utils/format_currency";

const buttonClassLeft =
  "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l";

const buttonClassMiddle =
  "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4";

const buttonClassRight =
  "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r";

const Graph: React.FC = () => {
  const [value, setValues] = useState<Value[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<Value[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(0);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get("/api/prices?sortOrder=ASC");

        const pricesData: Value[] = response.data.map((item: Value) => ({
          ...item,
          value: item.value_average,
        }));

        setValues(pricesData);

        // Calculate min and max values
        const values = pricesData.map((d: Value) => d.value_average);
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

  const handleRangeChange = (range: string) => {
    let startDate = null;
    switch (range) {
      case "max":
        setFilteredPrices(value);
        return;
      case "10y":
        startDate = moment().subtract(10, "years");
        break;
      case "5y":
        startDate = moment().subtract(5, "years");
        break;
      case "1y":
        startDate = moment().subtract(1, "year");
        break;
      case "6m":
        startDate = moment().subtract(6, "months");
        break;
      case "1m":
        startDate = moment().subtract(1, "month");
        break;
      case "1w":
        startDate = moment().subtract(1, "week");
        break;
      default:
        setFilteredPrices(value);
        return;
    }
    const filtered = value.filter((price) =>
      moment(price.date).isAfter(startDate)
    );
    setFilteredPrices(filtered);
  };

  useEffect(() => {
    setFilteredPrices(value);
  }, [value]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="pt-5">
      <h2 className="text-2xl">Historical Data</h2>
      <div className="inline-flex" style={{ marginBottom: "20px" }}>
        <button
          className={buttonClassLeft}
          onClick={() => handleRangeChange("max")}
        >
          Max
        </button>
        <button
          className={buttonClassMiddle}
          onClick={() => handleRangeChange("10y")}
        >
          10 Years
        </button>
        <button
          className={buttonClassMiddle}
          onClick={() => handleRangeChange("5y")}
        >
          5 Years
        </button>
        <button
          className={buttonClassMiddle}
          onClick={() => handleRangeChange("1y")}
        >
          1 Year
        </button>
        <button
          className={buttonClassMiddle}
          onClick={() => handleRangeChange("6m")}
        >
          6 Months
        </button>
        <button
          className={buttonClassMiddle}
          onClick={() => handleRangeChange("1m")}
        >
          1 Month
        </button>
        <button
          className={buttonClassRight}
          onClick={() => handleRangeChange("1w")}
        >
          1 Week
        </button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          width={500}
          height={300}
          data={filteredPrices}
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
            tickFormatter={(tick) => moment(tick).format("YYYY-MM-DD")}
          />
          <YAxis domain={[minValue, maxValue]} /> {/* Use calculated domain */}
          <Tooltip
            labelFormatter={(label) => moment(label).format("YYYY-MM-DD")}
            formatter={(value: number) => formatCurrencyARS(value)}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Graph;
