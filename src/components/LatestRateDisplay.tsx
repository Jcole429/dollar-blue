"use client";

import React from "react";
import { formatCurrencyARS } from "../utils/format_currency";
import { formatDate } from "@/utils/format_date";
import { useCurrentExchangeRateContext } from "@/contexts/CurrentExchangeRateContext";
import { useI18n } from "@/i18n/LocaleContext";
import { type RateType } from "@/types/rates";
import { PANEL_CLASS } from "@/utils/styles";
import RelativeTime from "./RelativeTime";

interface LatestRateDisplayProps {
  rateType: RateType;
}

/**
 * Rates carry real cents, so these are the one place the app shows them.
 *
 * The placeholder is a parameter rather than a closed-over message, which is what
 * keeps this at module scope instead of being rebuilt on every render.
 */
const cell = (value: number | undefined, noValue: string) =>
  value === undefined ? noValue : formatCurrencyARS(value, true);

const LatestRateDisplay: React.FC<LatestRateDisplayProps> = ({ rateType }) => {
  const { rates } = useCurrentExchangeRateContext();
  const { locale, m } = useI18n();
  const snapshot = rates[rateType];

  return (
    <div className={PANEL_CLASS}>
      <div className="row">
        <div className="col">
          <div className="row">
            <div className="col">
              <h2 className="pt-2">{m.rateLabel[rateType]}</h2>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="table-responsive">
                <table className="mb-0 text-center">
                  <thead>
                    <tr>
                      <th scope="col" className="border p-1">
                        {m.rates.buy}
                      </th>
                      <th scope="col" className="border p-1">
                        {m.rates.sell}
                      </th>
                      <th scope="col" className="border p-1">
                        {m.rates.average}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-1">
                        {cell(snapshot?.buy, m.rates.noValue)}
                      </td>
                      <td className="border p-1">
                        {cell(snapshot?.sell, m.rates.noValue)}
                      </td>
                      <td className="border p-1">
                        {cell(snapshot?.avg, m.rates.noValue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <p className="mb-0">
                {m.rates.lastUpdated}{" "}
                <RelativeTime date={snapshot?.lastUpdated} />
              </p>
              {/* The absolute timestamp is rendered in the *reader's* timezone,
                  which the server has no way to know — so the string it puts in
                  the HTML is hours off from the one hydration produces. Expected,
                  same as the relative label above it. */}
              <p className="mb-1" suppressHydrationWarning>
                {formatDate(snapshot?.lastUpdated, locale) ?? ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestRateDisplay;
