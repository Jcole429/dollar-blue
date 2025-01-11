"use client";

import React, { createContext, useState, ReactNode, useContext } from "react";
import { useCurrentExchangeRateContext } from "@/contexts/CurrentExchangeRateContext";

// Define types for the context
interface ExchangeRateToUseContextProps {
  exchangeRateToUseValue: number | null;
  exchangeRateToUseType: string | null;
  exchangeRateToUseUpdatedDate: Date | null;
  setExchangeRateToUseValue: (rate: number | null) => void;
  setExchangeRateToUseType: (type: string | null) => void;
  setExchangeRateToUseUpdatedDate: (date: Date | null) => void;
}

export const ExchangeRateToUseContext = createContext<
  ExchangeRateToUseContextProps | undefined
>(undefined);

interface ExchangeRateToUseProviderProps {
  children: ReactNode;
}

export const ExchangeRateToUseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { exchangeRateBlueAvg, exchangeRateBlueLastUpdated } =
    useCurrentExchangeRateContext(); // Access ExchangeRateBlueAvg from CurrentExchangeRateContext

  // Initialize exchangeRateToUse with the value of exchangeRateBlueAvg
  const [exchangeRateToUseValue, setExchangeRateToUseValue] = useState<
    number | null
  >(exchangeRateBlueAvg);

  const [exchangeRateToUseUpdatedDate, setExchangeRateToUseUpdatedDate] =
    useState<Date | null>(exchangeRateBlueLastUpdated);

  const [exchangeRateToUseType, setExchangeRateToUseType] = useState<
    string | null
  >("blue");

  React.useEffect(() => {
    // Update exchangeRateToUse if exchangeRateBlueAvg changes and exchangeRateToUse is still null
    if (exchangeRateToUseValue === null && exchangeRateBlueAvg !== null) {
      setExchangeRateToUseValue(exchangeRateBlueAvg);
      setExchangeRateToUseUpdatedDate(exchangeRateBlueLastUpdated);
      setExchangeRateToUseType("blue");
    }
  }, [
    exchangeRateBlueAvg,
    exchangeRateBlueLastUpdated,
    exchangeRateToUseValue,
  ]);

  return (
    <ExchangeRateToUseContext.Provider
      value={{
        exchangeRateToUseValue: exchangeRateToUseValue,
        exchangeRateToUseType: exchangeRateToUseType,
        exchangeRateToUseUpdatedDate: exchangeRateToUseUpdatedDate,
        setExchangeRateToUseValue: setExchangeRateToUseValue,
        setExchangeRateToUseType: setExchangeRateToUseType,
        setExchangeRateToUseUpdatedDate: setExchangeRateToUseUpdatedDate,
      }}
    >
      {children}
    </ExchangeRateToUseContext.Provider>
  );
};

// Custom hook for convenience
export const useExchangeRateToUse = () => {
  const context = useContext(ExchangeRateToUseContext);
  if (!context) {
    throw new Error(
      "useExchangeRateToUse must be used within an ExchangeRateToUseProvider"
    );
  }
  return context;
};
