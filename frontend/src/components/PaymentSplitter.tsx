"use client";

import React, { useState, useEffect, useContext } from "react";
import { formatCurrencyARS, formatCurrencyUSD } from "../utils/format_currency";
import { Currency } from "../models/Currency"; // Adjust the import path as needed
import { useExchangeRateToUse } from "@/contexts/ExchangeRateToUseContext";

const PaymentSplitter: React.FC = () => {
  const { exchangeRateToUseValue: exchangeRateToUse } = useExchangeRateToUse();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inputs
  const [totalPaymentARSInput, setTotalPaymentARSInput] = useState<
    number | string
  >("");
  const [maxFirstPaymentARSInput, setMaxFirstPaymentARSInput] = useState<
    number | string
  >("");
  const [usdLimitInput, setUsdLimitInput] = useState<number | string>("");
  const [usdLimitValue, setUsdLimitValue] = useState<Currency | null>(null);

  // Variables
  const [totalPaymentValue, setTotalPaymentValue] = useState<Currency | null>(
    null
  );
  const [prePaymentValue, setPrePaymentValue] = useState<Currency | null>(null);
  const [prePaymentExists, setPrePaymentExists] = useState<Boolean>(false);

  const [remainingAfterPrePayment, setRemainingAfterPrePayment] =
    useState<Currency | null>(null);

  const [usdPayment, setUsdPayment] = useState<Currency | null>(null);
  const [remainingAfterUsdPayment, setRemainingAfterUsdPayment] =
    useState<Currency | null>(null);

  const [displayUsdPayment, setDisplayUsdPayment] = useState<boolean>(false);

  // Labels
  const [payment1ArsLabel, setPayment1ArsLabel] = useState<string>("");
  const [payment1UsdLabel, setPayment1UsdLabel] = useState<string>("");

  const [payment2ArsLabel, setPayment2ArsLabel] = useState<string>("");
  const [payment2UsdLabel, setPayment2UsdLabel] = useState<string>("");

  const [payment3ArsLabel, setPayment3ArsLabel] = useState<string>("");
  const [payment3UsdLabel, setPayment3UsdLabel] = useState<string>("");

  const [paymentTotalArsLabel, setPaymentTotalArsLabel] = useState<string>("");
  const [paymentTotalUsdLabel, setPaymentTotalUsdLabel] = useState<string>("");

  const handleTotalPaymentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value;
    setTotalPaymentARSInput(inputValue);

    if (exchangeRateToUse !== null) {
      const totalPaymentARSInputParsed = parseFloat(inputValue);

      setTotalPaymentValue(
        new Currency(exchangeRateToUse, {
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

    if (
      totalPaymentValue &&
      maxFirstPaymentARSInputParsed > totalPaymentValue.valueARS
    ) {
      setErrorMessage("First payment cannot be greater than total payment.");
      setMaxFirstPaymentARSInput(inputValue);
      return;
    }

    setErrorMessage(null);
    setMaxFirstPaymentARSInput(inputValue);

    if (exchangeRateToUse !== null) {
      setPrePaymentValue(
        new Currency(exchangeRateToUse, {
          ars: maxFirstPaymentARSInputParsed,
        })
      );
    }
  };

  const handleUsdLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const inputValueParsed = parseFloat(inputValue);

    setUsdLimitInput(inputValue);

    if (inputValue === "") {
      setUsdLimitValue(null);
      return;
    }

    if (exchangeRateToUse !== null) {
      setUsdLimitValue(
        new Currency(exchangeRateToUse, {
          usd: inputValueParsed,
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
      setPrePaymentExists(true);
    } else {
      setPrePaymentExists(false);
    }
  }, [maxFirstPaymentARSInput]);

  useEffect(() => {
    if (totalPaymentValue !== null && exchangeRateToUse !== null) {
      let remaining: number;
      if (prePaymentExists) {
        remaining = totalPaymentValue.valueARS - prePaymentValue!.valueARS;
      } else {
        remaining = totalPaymentValue.valueARS;
      }

      setRemainingAfterPrePayment(
        new Currency(exchangeRateToUse, {
          ars: remaining,
        })
      );
    }
  }, [
    prePaymentExists,
    prePaymentValue,
    totalPaymentValue,
    exchangeRateToUse,
    usdLimitValue,
  ]);

  useEffect(() => {
    if (remainingAfterPrePayment !== null && exchangeRateToUse !== null) {
      let usdPayment = 0;
      let maxUsdPossible =
        Math.floor(remainingAfterPrePayment.valueUSD / 100) * 100;

      if (usdLimitValue && maxUsdPossible > usdLimitValue.valueUSD) {
        usdPayment = Math.floor(usdLimitValue.valueUSD / 100) * 100;
      } else {
        usdPayment = maxUsdPossible;
      }
      setUsdPayment(
        new Currency(exchangeRateToUse, {
          usd: usdPayment,
        })
      );
    }
  }, [remainingAfterPrePayment]);

  useEffect(() => {
    if (
      usdPayment !== null &&
      remainingAfterPrePayment !== null &&
      exchangeRateToUse !== null
    ) {
      setRemainingAfterUsdPayment(
        new Currency(exchangeRateToUse, {
          ars: remainingAfterPrePayment.valueARS - usdPayment.valueARS,
        })
      );
      if (usdPayment.valueUSD > 0) {
        setDisplayUsdPayment(true);
      } else {
        setDisplayUsdPayment(false);
      }
    }
  }, [usdPayment]);

  useEffect(() => {
    if (exchangeRateToUse !== null) {
      if (totalPaymentARSInput !== null) {
        const new_total_payment_value = parseFloat(
          totalPaymentARSInput.toString()
        );
        setTotalPaymentValue(
          new Currency(exchangeRateToUse, {
            ars: new_total_payment_value,
          })
        );
      }
    }
  }, [exchangeRateToUse]);

  useEffect(() => {
    if (
      prePaymentValue &&
      !Number.isNaN(prePaymentValue.valueARS) &&
      !Number.isNaN(prePaymentValue.valueUSD)
    ) {
      setPayment1ArsLabel(formatCurrencyARS(prePaymentValue.valueARS));
      setPayment1UsdLabel(formatCurrencyUSD(prePaymentValue.valueUSD));
    } else {
      setPayment1ArsLabel("");
      setPayment1UsdLabel("");
    }
  }, [prePaymentValue]);

  useEffect(() => {
    if (
      usdPayment &&
      !Number.isNaN(usdPayment.valueARS) &&
      !Number.isNaN(usdPayment.valueUSD)
    ) {
      setPayment2ArsLabel(formatCurrencyARS(usdPayment.valueARS));
      setPayment2UsdLabel(formatCurrencyUSD(usdPayment.valueUSD));
    } else {
      setPayment2ArsLabel("");
      setPayment2UsdLabel("");
    }
  }, [usdPayment]);

  useEffect(() => {
    if (
      remainingAfterUsdPayment &&
      !Number.isNaN(remainingAfterUsdPayment.valueARS) &&
      !Number.isNaN(remainingAfterUsdPayment.valueUSD)
    ) {
      setPayment3ArsLabel(formatCurrencyARS(remainingAfterUsdPayment.valueARS));
      setPayment3UsdLabel(formatCurrencyUSD(remainingAfterUsdPayment.valueUSD));
    } else {
      setPayment3ArsLabel("");
      setPayment3UsdLabel("");
    }
  }, [remainingAfterUsdPayment]);

  useEffect(() => {
    if (
      totalPaymentValue &&
      !Number.isNaN(totalPaymentValue.valueARS) &&
      !Number.isNaN(totalPaymentValue.valueUSD)
    ) {
      setPaymentTotalArsLabel(formatCurrencyARS(totalPaymentValue.valueARS));
      setPaymentTotalUsdLabel(formatCurrencyUSD(totalPaymentValue.valueUSD));
    } else {
      setPaymentTotalArsLabel("");
      setPaymentTotalUsdLabel("");
    }
  }, [totalPaymentValue]);

  return (
    <div className="container p-4 mb-2 border rounded shadow-sm bg-light">
      <div className="row">
        <div className="col">
          <div className="row">
            <div className="col">
              <h2 className="pt-2">Payment Splitter</h2>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <p>
                Calculates the maximum amount of USD you can pay in increments
                of $100 and displays the remaining amount owed in ARS.
              </p>
            </div>
          </div>
          <div className="row pt-2">
            <div className="col">
              <h5 className="">Instructions:</h5>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <ol className="list-decimal list-inside">
                <li>Enter the total payment amount in ARS.</li>
                <li>
                  Optionally, enter an initial payment in ARS before calculating
                  the USD payment.
                </li>
                <li>Optionally, enter the max amount of USD to use.</li>
              </ol>
            </div>
          </div>
          <div className="row grid gap-2 px-2">
            <div className="col-md border py-2">
              <div className="row pb-2">
                <div className="col">
                  <label className="">Total Payment</label>
                </div>
              </div>
              <div className="row">
                <div className="col input-group">
                  <span className="input-group-text">ARS</span>

                  <input
                    type="text"
                    value={totalPaymentARSInput}
                    onChange={handleTotalPaymentChange}
                    placeholder=""
                    className="form-control border"
                  />
                </div>
              </div>
            </div>
            <div className="col-md border py-2">
              <div className="row pb-2">
                <div className="col">
                  <label className="">First Payment</label>
                </div>
              </div>
              <div className="row">
                <div className="col input-group">
                  <span className="input-group-text">ARS</span>
                  <input
                    type="text"
                    value={maxFirstPaymentARSInput}
                    onChange={handleMaxFirstPaymentChange}
                    placeholder=""
                    className="form-control border"
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  {errorMessage && (
                    <p className="text-red-500 mt-2">{errorMessage}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md border py-2">
              <div className="row pb-2">
                <div className="col">
                  <label className="">USD Limit</label>
                </div>
              </div>
              <div className="row">
                <div className="col input-group">
                  <span className="input-group-text">USD</span>
                  <input
                    type="text"
                    value={usdLimitInput}
                    onChange={handleUsdLimitChange}
                    placeholder=""
                    className="form-control border"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="row pt-2">
            <div className="col px-2">
              <table className="table table-bordered text-center mb-0">
                <thead>
                  <tr>
                    <th scope="col" className="col-1">
                      Payment
                    </th>
                    <th scope="col" className="col">
                      Value ARS
                    </th>
                    <th scope="col" className="col">
                      Value USD
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prePaymentExists && (
                    <tr>
                      <td className="">1</td>
                      <td className="table-active">{payment1ArsLabel}</td>
                      <td className="">{payment1UsdLabel}</td>
                    </tr>
                  )}
                  {displayUsdPayment && (
                    <tr>
                      <td className="">
                        {prePaymentExists && 2}
                        {!prePaymentExists && 1}
                      </td>
                      <td className="">{payment2ArsLabel}</td>
                      <td className="table-active">{payment2UsdLabel}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="">
                      {prePaymentExists && displayUsdPayment && 3}
                      {prePaymentExists && !displayUsdPayment && 2}
                      {!prePaymentExists && displayUsdPayment && 2}
                      {!prePaymentExists && !displayUsdPayment && 1}
                    </td>
                    <td className="table-active">{payment3ArsLabel}</td>
                    <td className="">{payment3UsdLabel}</td>
                  </tr>
                  <tr className="fw-bold">
                    <td className="">Total</td>
                    <td className="">{paymentTotalArsLabel}</td>
                    <td className="">{paymentTotalUsdLabel}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSplitter;
