"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import axios from "axios";

// Define the context and the provider props type
interface CurrentExchangeRateContextProps {
  exchangeRateBlueAvg: number | null;
  exchangeRateBlueBuy: number | null;
  exchangeRateBlueSell: number | null;
  exchangeRateBlueLastUpdated: Date | null;
  exchangeRateBlueTimeSinceLastUpdate: string | null;
  exchangeRateCryptoAvg: number | null;
  exchangeRateCryptoBuy: number | null;
  exchangeRateCryptoSell: number | null;
  exchangeRateCryptoLastUpdated: Date | null;
  exchangeRateCryptoTimeSinceLastUpdate: string | null;
}

export const CurrentExchangeRateContext = createContext<
  CurrentExchangeRateContextProps | undefined
>(undefined);

interface CurrentExchangeRateProviderProps {
  children: ReactNode;
}

export const CurrentExchangeRateProvider: React.FC<
  CurrentExchangeRateProviderProps
> = ({ children }) => {
  const [exchangeRateBlueLastUpdated, setExchangeRateBlueLastUpdated] =
    useState<Date | null>(null);
  const [
    exchangeRateBlueTimeSinceLastUpdate,
    setExchangeRateBlueTimeSinceLastUpdate,
  ] = useState<string>("");
  const [exchangeRateBlueAvg, setExchangeRateBlueAvg] = useState<number | null>(
    null
  );
  const [exchangeRateBlueBuy, setExchangeRateBlueBuy] = useState<number | null>(
    null
  );
  const [exchangeRateBlueSell, setExchangeRateBlueSell] = useState<
    number | null
  >(null);

  const [exchangeRateCryptoLastUpdated, setExchangeRateCryptoLastUpdated] =
    useState<Date | null>(null);
  const [
    exchangeRateCryptoTimeSinceLastUpdate,
    setExchangeRateCryptoTimeSinceLastUpdate,
  ] = useState<string>("");
  const [exchangeRateCryptoAvg, setExchangeRateCryptoAvg] = useState<
    number | null
  >(null);
  const [exchangeRateCryptoBuy, setExchangeRateCryptoBuy] = useState<
    number | null
  >(null);
  const [exchangeRateCryptoSell, setExchangeRateCryptoSell] = useState<
    number | null
  >(null);

  const calculateTimeSinceUpdate = (lastUpdated: Date | null): string => {
    if (!lastUpdated) return "Never updated";
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} days ago`;
    if (diffHours > 0) return `${diffHours} hours ago`;
    if (diffMins > 0) return `${diffMins} minutes ago`;
    return "just now";
  };

  useEffect(() => {
    const fetchBlueValue = async () => {
      try {
        console.log("Fetching latest data from API.");
        const response = await axios.get(
          "https://dolarapi.com/v1/dolares/blue"
        );
        const response_data = response.data;
        // console.log("response: ", response_data);
        setExchangeRateBlueLastUpdated(
          new Date(response_data["fechaActualizacion"])
        );

        // Round buy and sell values to 2 decimal places
        const buy = Math.round(response_data["compra"] * 100) / 100;
        const sell = Math.round(response_data["venta"] * 100) / 100;
        const avg = Math.round(((buy + sell) / 2) * 100) / 100;

        setExchangeRateBlueBuy(buy);
        setExchangeRateBlueSell(sell);
        setExchangeRateBlueAvg(avg);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    };

    const fetchCryptoValue = async () => {
      try {
        console.log("Fetching latest data from API.");
        const response = await axios.get(
          "https://dolarapi.com/v1/dolares/cripto"
        );
        const response_data = response.data;
        // console.log(response_data);
        setExchangeRateCryptoLastUpdated(
          new Date(response_data["fechaActualizacion"])
        );

        // Round buy and sell values to 2 decimal places
        const buy = Math.round(response_data["compra"] * 100) / 100;
        const sell = Math.round(response_data["venta"] * 100) / 100;
        const avg = Math.round(((buy + sell) / 2) * 100) / 100;

        setExchangeRateCryptoBuy(buy);
        setExchangeRateCryptoSell(sell);
        setExchangeRateCryptoAvg(avg);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    };

    fetchBlueValue();
    fetchCryptoValue();
  }, []);

  useEffect(() => {
    setExchangeRateBlueTimeSinceLastUpdate(
      calculateTimeSinceUpdate(exchangeRateBlueLastUpdated)
    );
  }, [exchangeRateBlueLastUpdated]);

  useEffect(() => {
    setExchangeRateCryptoTimeSinceLastUpdate(
      calculateTimeSinceUpdate(exchangeRateCryptoLastUpdated)
    );
  }, [exchangeRateCryptoLastUpdated]);

  return (
    <CurrentExchangeRateContext.Provider
      value={{
        exchangeRateBlueAvg,
        exchangeRateBlueBuy,
        exchangeRateBlueSell,
        exchangeRateBlueLastUpdated: exchangeRateBlueLastUpdated,
        exchangeRateBlueTimeSinceLastUpdate:
          exchangeRateBlueTimeSinceLastUpdate,
        exchangeRateCryptoAvg,
        exchangeRateCryptoBuy,
        exchangeRateCryptoSell,
        exchangeRateCryptoLastUpdated: exchangeRateCryptoLastUpdated,
        exchangeRateCryptoTimeSinceLastUpdate:
          exchangeRateCryptoTimeSinceLastUpdate,
      }}
    >
      {children}
    </CurrentExchangeRateContext.Provider>
  );
};

// Custom hook for convenience
export const useCurrentExchangeRateContext = () => {
  const context = useContext(CurrentExchangeRateContext);
  if (!context) {
    throw new Error(
      "useExchangeRateToUse must be used within an ExchangeRateToUseProvider"
    );
  }
  return context;
};
