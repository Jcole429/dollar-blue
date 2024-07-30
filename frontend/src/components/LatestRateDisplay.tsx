"use client";

import React, { useEffect, useState, useContext } from "react";
import { formatCurrencyARS } from "../utils/format_currency";
import { formatDate } from "@/utils/format_date";
import { ExchangeRateContext } from "@/contexts/ExhangeRateContext";

const LatestRateDisplay: React.FC = () => {
  const context = useContext(ExchangeRateContext);

  if (!context) {
    throw new Error("PaymentSplitter must be used within a ValueAvgProvider");
  }

  const {
    exchangeRateBlueAvg,
    exchangeRateBlueBuy,
    exchangeRateBlueSell,
    exchangeRateLastUpdated,
    exchangeRateTimeSinceLastUpdate,
  } = context;

  return (
    <div className="section row border mb-2 mx-0">
      <div className="col">
        <div className="row">
          <div className="col">
            <h2 className="pt-2">Latest ARS to USD Exchange Rate</h2>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <table className="table mb-0 text-center">
              <thead>
                <tr>
                  <th scope="col" className="border px-2 py-1">
                    Average
                  </th>
                  <th scope="col" className="border px-2 py-1">
                    Sell
                  </th>
                  <th scope="col" className="border px-2 py-1">
                    Buy
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-2">
                    {formatCurrencyARS(exchangeRateBlueAvg!, true)}
                  </td>
                  <td className="border px-2 py-2">
                    {formatCurrencyARS(exchangeRateBlueSell!, true)}
                  </td>
                  <td className="border px-2 py-2">
                    {formatCurrencyARS(exchangeRateBlueBuy!, true)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <p className="mb-0">
              Last updated: {exchangeRateTimeSinceLastUpdate}
            </p>
            <p className="mb-2">
              {exchangeRateLastUpdated !== null
                ? formatDate(exchangeRateLastUpdated)
                : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestRateDisplay;
