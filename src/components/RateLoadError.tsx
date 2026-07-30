"use client";

import React from "react";
import { useCurrentExchangeRateContext } from "@/contexts/CurrentExchangeRateContext";

/**
 * The "could not load exchange rates" notice, rendered once for the page.
 *
 * It lived in LatestRateDisplay, which is mounted per rate — so a failure that
 * is neither rate's in particular was printed twice, and announced twice as two
 * separate live regions.
 */
const RateLoadError: React.FC = () => {
  const { error } = useCurrentExchangeRateContext();
  if (!error) return null;

  return (
    <p className="text-danger small px-2 mb-2" role="alert">
      {error}
    </p>
  );
};

export default RateLoadError;
