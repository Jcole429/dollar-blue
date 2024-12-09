"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// Define the context and the provider props type
interface ExchangeRateContextProps {
  exchangeRateBlueAvg: number | null;
  exchangeRateBlueBuy: number | null;
  exchangeRateBlueSell: number | null;
  exchangeRateLastUpdated: Date | null;
  exchangeRateTimeSinceLastUpdate: string | null;
}

export const ExchangeRateContext = createContext<
  ExchangeRateContextProps | undefined
>(undefined);

interface ExchangeRateProviderProps {
  children: ReactNode;
}

export const ExchangeRateProvider: React.FC<ExchangeRateProviderProps> = ({
  children,
}) => {
  const [exchangeRateLastUpdated, setExchangeRateLastUpdated] =
    useState<Date | null>(null);
  const [exchangeRateTimeSinceLastUpdate, setExchangeRateTimeSinceLastUpdate] =
    useState<string>("");
  const [exchangeRateBlueAvg, setExchangeRateBlueAvg] = useState<number | null>(
    null
  );
  const [exchangeRateBlueBuy, setExchangeRateBlueBuy] = useState<number | null>(
    null
  );
  const [exchangeRateBlueSell, setExchangeRateBlueSell] = useState<
    number | null
  >(null);

  useEffect(() => {
    const fetchValueAvg = async () => {
      try {
        console.log("Fetching latest data from API.");
        const response = await axios.get(
          "https://api.bluelytics.com.ar/v2/latest"
        );
        setExchangeRateLastUpdated(new Date(response.data.last_update));
        setExchangeRateBlueAvg(response.data.blue.value_avg);
        setExchangeRateBlueBuy(response.data.blue.value_buy);
        setExchangeRateBlueSell(response.data.blue.value_sell);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    };

    fetchValueAvg();
  }, []);

  useEffect(() => {
    if (exchangeRateLastUpdated) {
      const now = new Date();
      const diffMs = now.getTime() - exchangeRateLastUpdated.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        setExchangeRateTimeSinceLastUpdate(`${diffDays} days ago`);
      } else if (diffHours > 0) {
        setExchangeRateTimeSinceLastUpdate(`${diffHours} hours ago`);
      } else if (diffMins > 0) {
        setExchangeRateTimeSinceLastUpdate(`${diffMins} minutes ago`);
      } else {
        setExchangeRateTimeSinceLastUpdate("just now");
      }
    }
  }, [exchangeRateLastUpdated]);

  return (
    <ExchangeRateContext.Provider
      value={{
        exchangeRateBlueAvg,
        exchangeRateBlueBuy,
        exchangeRateBlueSell,
        exchangeRateLastUpdated,
        exchangeRateTimeSinceLastUpdate,
      }}
    >
      {children}
    </ExchangeRateContext.Provider>
  );
};
