"use client";

import React, { useEffect, useState, useContext } from "react";
import { formatCurrencyARS } from "../utils/format_currency";
import { formatDate } from "@/utils/format_date";
import { ExchangeRateContext } from "@/contexts/ExchangeRateContext";

const LatestRateDisplayCrypto: React.FC = () => {
  const context = useContext(ExchangeRateContext);

  if (!context) {
    throw new Error("PaymentSplitter must be used within a ValueAvgProvider");
  }

  const {
    exchangeRateCryptoAvg,
    exchangeRateCryptoBuy,
    exchangeRateCryptoSell,
    exchangeRateCryptoLastUpdated,
    exchangeRateCryptoTimeSinceLastUpdate,
  } = context;

  return (
    <div className="section row border mb-2 mx-0">
      <div className="col">
        <div className="row">
          <div className="col">
            <h2 className="pt-2">Latest ARS to USD Crypto Rate</h2>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <table className="table mb-0 text-center">
              <thead>
                <tr>
                  <th scope="col" className="border py-1">
                    Average
                  </th>
                  <th scope="col" className="border py-1">
                    Sell
                  </th>
                  <th scope="col" className="border py-1">
                    Buy
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border py-2">
                    {formatCurrencyARS(exchangeRateCryptoAvg!, true)}
                  </td>
                  <td className="border py-2">
                    {formatCurrencyARS(exchangeRateCryptoSell!, true)}
                  </td>
                  <td className="border py-2">
                    {formatCurrencyARS(exchangeRateCryptoBuy!, true)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <p className="mb-0">
              Last updated: {exchangeRateCryptoTimeSinceLastUpdate}
            </p>
            <p className="mb-1">
              {exchangeRateCryptoLastUpdated !== null
                ? formatDate(exchangeRateCryptoLastUpdated)
                : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestRateDisplayCrypto;
