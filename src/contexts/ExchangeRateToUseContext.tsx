"use client";

import React, {
  createContext,
  useState,
  useMemo,
  ReactNode,
  useContext,
} from "react";
import { useCurrentExchangeRateContext } from "@/contexts/CurrentExchangeRateContext";
import { resolveRate, type RateSelection } from "@/lib/resolve_rate";
import type { SelectedRateType } from "@/types/rates";

export type { RateSelection };

interface ExchangeRateToUseContextProps {
  /** The rate every calculator uses. Falls back to the live blue average. */
  exchangeRateToUseValue: number | null;
  exchangeRateToUseType: SelectedRateType | null;
  exchangeRateToUseUpdatedDate: Date | null;
  /** `null` means "no explicit choice yet", which is not the same as a choice that resolved to null. */
  setSelection: (selection: RateSelection | null) => void;
}

export const ExchangeRateToUseContext = createContext<
  ExchangeRateToUseContextProps | undefined
>(undefined);

export const ExchangeRateToUseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { rates } = useCurrentExchangeRateContext();

  // Storing the whole selection as one nullable object keeps "nothing chosen
  // yet" distinguishable from "chose a date the API has no rate for". The old
  // shape seeded state from a prop and then back-filled it, so any later null
  // silently snapped the user back to blue.
  const [selection, setSelection] = useState<RateSelection | null>(null);

  const effective = resolveRate(selection, rates);

  // Memoised on the three primitives rather than on `effective`, which is rebuilt
  // every render. Without this a re-render of the provider — for any reason at
  // all — re-rendered the converter, the splitter and the selector with it.
  const value = useMemo(
    () => ({
      exchangeRateToUseValue: effective.value,
      exchangeRateToUseType: effective.type,
      exchangeRateToUseUpdatedDate: effective.updatedDate,
      setSelection,
    }),
    [effective.value, effective.type, effective.updatedDate]
  );

  return (
    <ExchangeRateToUseContext.Provider value={value}>
      {children}
    </ExchangeRateToUseContext.Provider>
  );
};

export const useExchangeRateToUse = () => {
  const context = useContext(ExchangeRateToUseContext);
  if (!context) {
    throw new Error(
      "useExchangeRateToUse must be used within an ExchangeRateToUseProvider"
    );
  }
  return context;
};
