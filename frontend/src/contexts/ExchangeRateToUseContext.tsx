"use client";

import React, { createContext, useState, ReactNode, useContext } from "react";
import { useCurrentExchangeRateContext } from "@/contexts/CurrentExchangeRateContext";

// Define types for the context
interface ExchangeRateToUseContextProps {
  exchangeRateToUse: number | null;
  setExchangeRateToUse: (rate: number | null) => void;
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
  const { exchangeRateBlueAvg } = useCurrentExchangeRateContext(); // Access ExchangeRateBlueAvg from CurrentExchangeRateContext

  // Initialize exchangeRateToUse with the value of exchangeRateBlueAvg
  const [exchangeRateToUse, setExchangeRateToUse] = useState<number | null>(
    exchangeRateBlueAvg
  );

  React.useEffect(() => {
    // Update exchangeRateToUse if exchangeRateBlueAvg changes and exchangeRateToUse is still null
    if (exchangeRateToUse === null && exchangeRateBlueAvg !== null) {
      setExchangeRateToUse(exchangeRateBlueAvg);
    }
  }, [exchangeRateBlueAvg, exchangeRateToUse]);

  return (
    <ExchangeRateToUseContext.Provider
      value={{ exchangeRateToUse, setExchangeRateToUse }}
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
