"use client";

import React, { useState, useEffect, useContext } from "react";
import { formatCurrencyARS, formatCurrencyUSD } from "../utils/format_currency";
import { Currency } from "../models/Currency"; // Adjust the import path as needed
import { ExchangeRateContext } from "@/contexts/ExhangeRateContext";

const PaymentSplitter: React.FC = () => {
  const context = useContext(ExchangeRateContext);

  if (!context) {
    throw new Error("PaymentSplitter must be used within a ValueAvgProvider");
  }

  const { exchangeRateBlueAvg } = context;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inputs
  const [totalPaymentARSInput, setTotalPaymentARSInput] = useState<
    number | string
  >("");
  const [maxFirstPaymentARSInput, setMaxFirstPaymentARSInput] = useState<
    number | string
  >("");

  // Variables
  const [firstPaymentExists, setFirstPaymentExists] = useState<Boolean>(false);
  const [totalPayment, setTotalPayment] = useState<Currency | null>(null);
  const [firstPayment, setFirstPayment] = useState<Currency | null>(null);
  const [remainingAfterFirstPayment, setRemainingAfterFirstPayment] =
    useState<Currency | null>(null);
  const [usdPayment, setUsdPayment] = useState<Currency | null>(null);
  const [remainingArsPayment, setRemainingArsPayment] =
    useState<Currency | null>(null);

  const handleTotalPaymentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value;
    setTotalPaymentARSInput(inputValue);

    if (exchangeRateBlueAvg !== null) {
      const totalPaymentARSInputParsed = parseFloat(inputValue);

      setTotalPayment(
        new Currency(exchangeRateBlueAvg, {
          ars: totalPaymentARSInputParsed,
        })
      );
    }
  };

  const handleMaxFirstPaymentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value;
    const maxFirstPaymentARSInputParsed = parseFloat(inputValue);

    if (totalPayment && maxFirstPaymentARSInputParsed > totalPayment.valueARS) {
      setErrorMessage("First payment cannot be greater than total payment.");
      setMaxFirstPaymentARSInput(inputValue);
      return;
    }

    setErrorMessage(null);
    setMaxFirstPaymentARSInput(inputValue);

    if (exchangeRateBlueAvg !== null) {
      setFirstPayment(
        new Currency(exchangeRateBlueAvg, {
          ars: maxFirstPaymentARSInputParsed,
        })
      );
    }
  };

  useEffect(() => {
    if (
      maxFirstPaymentARSInput !== null &&
      maxFirstPaymentARSInput !== 0 &&
      maxFirstPaymentARSInput !== ""
    ) {
      setFirstPaymentExists(true);
    } else {
      setFirstPaymentExists(false);
    }
  }, [maxFirstPaymentARSInput]);

  useEffect(() => {
    if (totalPayment !== null && exchangeRateBlueAvg !== null) {
      let remaining: number;
      if (firstPaymentExists) {
        remaining = totalPayment.valueARS - firstPayment!.valueARS;
      } else {
        remaining = totalPayment.valueARS;
      }

      setRemainingAfterFirstPayment(
        new Currency(exchangeRateBlueAvg, {
          ars: remaining,
        })
      );
    }
  }, [firstPaymentExists, firstPayment, totalPayment, exchangeRateBlueAvg]);

  useEffect(() => {
    if (remainingAfterFirstPayment !== null && exchangeRateBlueAvg !== null) {
      console.log(
        "remainingAfterFirstPayment: " + remainingAfterFirstPayment!.valueARS
      );
      setUsdPayment(
        new Currency(exchangeRateBlueAvg, {
          usd: Math.floor(remainingAfterFirstPayment.valueUSD / 100) * 100,
        })
      );
    }
  }, [remainingAfterFirstPayment]);

  useEffect(() => {
    if (
      usdPayment !== null &&
      remainingAfterFirstPayment !== null &&
      exchangeRateBlueAvg !== null
    ) {
      console.log("usdPayment: " + usdPayment!.valueUSD);

      setRemainingArsPayment(
        new Currency(exchangeRateBlueAvg, {
          ars: remainingAfterFirstPayment.valueARS - usdPayment.valueARS,
        })
      );
    }
  }, [usdPayment]);

  return (
    <div className="p-4 m-4 w-[800px] border">
      <h2 className="text-2xl">Payment Splitter</h2>
      <div className="flex">
        <div className="mb-4 mt-4 mr-1 p-4 border rounded basis-0">
          <label className="block mb-1">Total Payment (ARS)</label>
          <input
            type="number"
            value={totalPaymentARSInput}
            onChange={handleTotalPaymentChange}
            placeholder="$ARS"
            className="border border-gray-300 px-4 py-2"
          />
        </div>
        <div className="mb-4 mt-4 ml-1 p-4 border rounded basis-0">
          <label className="block mb-1">First Payment (ARS)</label>
          <input
            type="number"
            value={maxFirstPaymentARSInput}
            onChange={handleMaxFirstPaymentChange}
            placeholder="$ARS"
            className="border border-gray-300 px-4 py-2"
          />
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        </div>
      </div>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-200 px-2 py-1">Transaction</th>
            <th className="border border-gray-200 px-2 py-1">Currency</th>
            <th className="border border-gray-200 px-2 py-1">Value ARS</th>
            <th className="border border-gray-200 px-2 py-1">Value USD</th>
          </tr>
        </thead>
        <tbody>
          {firstPaymentExists && (
            <tr>
              <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                1
              </td>
              <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                ARS
              </td>
              <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                {firstPayment !== null
                  ? formatCurrencyARS(firstPayment.valueARS, true)
                  : ""}
              </td>
              <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                {firstPayment !== null
                  ? formatCurrencyUSD(firstPayment.valueUSD)
                  : ""}
              </td>
            </tr>
          )}
          <tr>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {firstPaymentExists && 2}
              {!firstPaymentExists && 1}
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              USD
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {usdPayment !== null
                ? formatCurrencyARS(usdPayment.valueARS, true)
                : ""}
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {usdPayment !== null
                ? formatCurrencyUSD(usdPayment.valueUSD)
                : ""}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {firstPaymentExists && 3}
              {!firstPaymentExists && 2}
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              ARS
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {remainingArsPayment !== null
                ? formatCurrencyARS(remainingArsPayment.valueARS, true)
                : ""}
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {remainingArsPayment !== null
                ? formatCurrencyUSD(remainingArsPayment.valueUSD)
                : ""}
            </td>
          </tr>
          <tr className="font-bold">
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              Total
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap"></td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {totalPayment !== null
                ? formatCurrencyARS(totalPayment.valueARS, true)
                : ""}
            </td>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              {totalPayment !== null
                ? formatCurrencyUSD(totalPayment.valueUSD)
                : ""}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PaymentSplitter;
