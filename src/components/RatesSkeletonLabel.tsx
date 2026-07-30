"use client";

import React from "react";
import { useI18n } from "@/i18n/LocaleContext";

/**
 * The screen-reader announcement for the loading skeleton.
 *
 * A component of its own only because the page is a server component and the
 * catalog lives in client state — everything visible in the skeleton is empty
 * boxes, so this one string is all that needs the boundary.
 */
const RatesSkeletonLabel: React.FC = () => {
  const { m } = useI18n();

  return (
    <span className="visually-hidden" role="status">
      {m.app.loadingRates}
    </span>
  );
};

export default RatesSkeletonLabel;
