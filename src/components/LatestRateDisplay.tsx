"use client";

import React from "react";
import { formatCurrencyARS } from "../utils/format_currency";
import { formatDate } from "@/utils/format_date";
import { useCurrentExchangeRateContext } from "@/contexts/CurrentExchangeRateContext";
import { RATE_LABEL, type RateType } from "@/types/rates";
import { PANEL_CLASS } from "@/utils/styles";

interface LatestRateDisplayProps {
  rateType: RateType;
}

/** Rates carry real cents, so these are the one place the app shows them. */
const cell = (value: number | undefined) =>
  value === undefined ? "—" : formatCurrencyARS(value, true);

const LatestRateDisplay: React.FC<LatestRateDisplayProps> = ({ rateType }) => {
  const { rates, timeSinceUpdate } = useCurrentExchangeRateContext();
  const snapshot = rates[rateType];

  return (
    <div className={PANEL_CLASS}>
      <div className="row">
        <div className="col">
          <div className="row">
            <div className="col">
              <h2 className="pt-2">{RATE_LABEL[rateType]}</h2>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="table-responsive">
                <table className="mb-0 text-center">
                  <thead>
                    <tr>
                      <th scope="col" className="border p-1">
                        Buy
                      </th>
                      <th scope="col" className="border p-1">
                        Sell
                      </th>
                      <th scope="col" className="border p-1">
                        Average
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-1">{cell(snapshot?.buy)}</td>
                      <td className="border p-1">{cell(snapshot?.sell)}</td>
                      <td className="border p-1">{cell(snapshot?.avg)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <p className="mb-0">Last updated: {timeSinceUpdate(rateType)}</p>
              <p className="mb-1">
                {snapshot?.lastUpdated ? formatDate(snapshot.lastUpdated) : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestRateDisplay;
