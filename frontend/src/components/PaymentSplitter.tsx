"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatCurrencyARS, formatCurrencyUSD } from "../utils/format_currency";
import { Currency } from "../models/Currency"; // Adjust the import path as needed

const PaymentSplitter: React.FC = () => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  // Inputs
  const [totalPaymentARSInput, setTotalPaymentARSInput] = useState<
    number | string
  >("");
  const [maxFirstPaymentARSInput, setMaxFirstPaymentARSInput] = useState<
    number | string
  >("");

  // Variables
  const [totalPayment, setTotalPayment] = useState<Currency | null>(null);
  const [firstPayment, setFirstPayment] = useState<Currency | null>(null);
  const [remainingAfterFirstPayment, setRemainingAfterFirstPayment] =
    useState<Currency | null>(null);
  const [usdPayment, setUsdPayment] = useState<Currency | null>(null);
  const [remainingArsPayment, setRemainingArsPayment] =
    useState<Currency | null>(null);

  // Fetch current ARS exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await axios.get(
          "https://api.bluelytics.com.ar/v2/latest"
        );
        console.log("Ran fetchExchangeRate()");
        setExchangeRate(response.data.blue.value_avg);
      } catch (error) {
        console.error("Error fetching value_avg:", error);
      }
    };

    fetchExchangeRate();
  }, []);

  const handleTotalPaymentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value;
    setTotalPaymentARSInput(inputValue);

    if (exchangeRate !== null) {
      const totalPaymentARSInputParsed =
        typeof inputValue === "number" ? inputValue : parseFloat(inputValue);

      setTotalPayment(
        new Currency(exchangeRate, {
          ars: totalPaymentARSInputParsed,
        })
      );
    }
  };

  const handleMaxFirstPaymentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value;
    setMaxFirstPaymentARSInput(inputValue);
    if (exchangeRate !== null) {
      const maxFirstPaymentARSInputParsed =
        typeof inputValue === "number" ? inputValue : parseFloat(inputValue);

      setFirstPayment(
        new Currency(exchangeRate, {
          ars: maxFirstPaymentARSInputParsed,
        })
      );
    }
  };

  useEffect(() => {
    if (
      firstPayment !== null &&
      totalPayment !== null &&
      exchangeRate !== null
    ) {
      console.log("totalPayment: " + totalPayment!.valueARS);
      console.log("firstPayment: " + firstPayment!.valueARS);
      setRemainingAfterFirstPayment(
        new Currency(exchangeRate, {
          ars: totalPayment.valueARS - firstPayment!.valueARS,
        })
      );
    }
  }, [firstPayment, totalPayment, exchangeRate]);

  useEffect(() => {
    if (remainingAfterFirstPayment !== null && exchangeRate !== null) {
      console.log(
        "remainingAfterFirstPayment: " + remainingAfterFirstPayment!.valueARS
      );
      setUsdPayment(
        new Currency(exchangeRate, {
          usd: Math.floor(remainingAfterFirstPayment.valueUSD / 100) * 100,
        })
      );
    }
  }, [remainingAfterFirstPayment]);

  useEffect(() => {
    if (
      usdPayment !== null &&
      remainingAfterFirstPayment !== null &&
      exchangeRate !== null
    ) {
      console.log("usdPayment: " + usdPayment!.valueUSD);

      setRemainingArsPayment(
        new Currency(exchangeRate, {
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
          <tr>
            <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
              2
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
              3
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
