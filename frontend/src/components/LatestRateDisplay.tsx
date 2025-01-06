"use client";

import React, { useContext } from "react";
import { formatCurrencyARS } from "../utils/format_currency";
import { formatDate } from "@/utils/format_date";
import { useCurrentExchangeRateContext } from "@/contexts/CurrentExchangeRateContext";

interface LatestRateDisplayProps {
  rateType: "blue" | "crypto";
}

const LatestRateDisplay: React.FC<LatestRateDisplayProps> = ({ rateType }) => {
  const {
    exchangeRateBlueBuy,
    exchangeRateBlueSell,
    exchangeRateBlueAvg,
    exchangeRateBlueLastUpdated,
    exchangeRateBlueTimeSinceLastUpdate,
    exchangeRateCryptoBuy,
    exchangeRateCryptoSell,
    exchangeRateCryptoAvg,
    exchangeRateCryptoLastUpdated,
    exchangeRateCryptoTimeSinceLastUpdate,
  } = useCurrentExchangeRateContext();

  const data =
    rateType === "blue"
      ? {
          title: "Dollar Blue",
          averageRate: exchangeRateBlueAvg,
          buyRate: exchangeRateBlueBuy,
          sellRate: exchangeRateBlueSell,
          lastUpdated: exchangeRateBlueLastUpdated,
          timeSinceLastUpdate: exchangeRateBlueTimeSinceLastUpdate,
        }
      : {
          title: "Dollar Crypto",
          averageRate: exchangeRateCryptoAvg,
          buyRate: exchangeRateCryptoBuy,
          sellRate: exchangeRateCryptoSell,
          lastUpdated: exchangeRateCryptoLastUpdated,
          timeSinceLastUpdate: exchangeRateCryptoTimeSinceLastUpdate,
        };

  return (
    <div className="container p-4 mb-2 border rounded shadow-sm bg-light">
      <div className="row">
        <div className="col">
          <div className="row">
            <div className="col">
              <h2 className="pt-2">{data.title}</h2>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <table className="table-responsive mb-0 text-center">
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
                    <td className="border p-1">
                      {formatCurrencyARS(data.buyRate!, true)}
                    </td>
                    <td className="border p-1">
                      {formatCurrencyARS(data.sellRate!, true)}
                    </td>
                    <td className="border p-1">
                      {formatCurrencyARS(data.averageRate!, true)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <p className="mb-0">Last updated: {data.timeSinceLastUpdate}</p>
              <p className="mb-1">
                {data.lastUpdated !== null ? formatDate(data.lastUpdated) : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestRateDisplay;
