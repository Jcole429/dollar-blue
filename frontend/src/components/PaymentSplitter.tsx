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
  const [usdLimitInput, setUsdLimitInput] = useState<number | string>("");

  // Variables
  const [totalPayment, setTotalPayment] = useState<Currency | null>(null);
  const [firstPayment, setFirstPayment] = useState<Currency | null>(null);
  const [firstPaymentExists, setFirstPaymentExists] = useState<Boolean>(false);
  const [remainingAfterFirstPayment, setRemainingAfterFirstPayment] =
    useState<Currency | null>(null);
  const [usdLimit, setUsdLimit] = useState<Currency | null>(null);
  const [usdPayment, setUsdPayment] = useState<Currency | null>(null);
  const [remainingArsPayment, setRemainingArsPayment] =
    useState<Currency | null>(null);

  const [rateOverrideInput, setRateOverrideInput] = useState<string>("");

  const [activeExchangeRate, setActiveExchangeRate] = useState<number>(0);

  const handleTotalPaymentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value;
    setTotalPaymentARSInput(inputValue);

    if (activeExchangeRate !== null) {
      const totalPaymentARSInputParsed = parseFloat(inputValue);

      setTotalPayment(
        new Currency(activeExchangeRate, {
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

    if (activeExchangeRate !== null) {
      setFirstPayment(
        new Currency(activeExchangeRate, {
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
      setUsdLimit(null);
      return;
    }

    if (activeExchangeRate !== null) {
      setUsdLimit(
        new Currency(activeExchangeRate, {
          usd: inputValueParsed,
        })
      );
    }
  };

  const handleRateOverrideChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value);
    setRateOverrideInput(event.target.value);
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
    if (totalPayment !== null && activeExchangeRate !== null) {
      let remaining: number;
      if (firstPaymentExists) {
        remaining = totalPayment.valueARS - firstPayment!.valueARS;
      } else {
        remaining = totalPayment.valueARS;
      }

      setRemainingAfterFirstPayment(
        new Currency(activeExchangeRate, {
          ars: remaining,
        })
      );
    }
  }, [
    firstPaymentExists,
    firstPayment,
    totalPayment,
    activeExchangeRate,
    usdLimit,
  ]);

  useEffect(() => {
    if (remainingAfterFirstPayment !== null && activeExchangeRate !== null) {
      let usdPayment = 0;
      let maxUsdPossible =
        Math.floor(remainingAfterFirstPayment.valueUSD / 100) * 100;

      if (usdLimit && maxUsdPossible > usdLimit.valueUSD) {
        usdPayment = Math.floor(usdLimit.valueUSD / 100) * 100;
      } else {
        usdPayment = maxUsdPossible;
      }
      setUsdPayment(
        new Currency(activeExchangeRate, {
          usd: usdPayment,
        })
      );
    }
  }, [remainingAfterFirstPayment]);

  useEffect(() => {
    if (
      usdPayment !== null &&
      remainingAfterFirstPayment !== null &&
      activeExchangeRate !== null
    ) {
      setRemainingArsPayment(
        new Currency(activeExchangeRate, {
          ars: remainingAfterFirstPayment.valueARS - usdPayment.valueARS,
        })
      );
    }
  }, [usdPayment]);

  useEffect(() => {
    if (exchangeRateBlueAvg !== null) {
      setActiveExchangeRate(exchangeRateBlueAvg);
      if (totalPaymentARSInput !== null) {
        setTotalPayment(
          new Currency(activeExchangeRate, {
            ars: parseFloat(totalPaymentARSInput.toString()),
          })
        );
      }
    }
  }, [exchangeRateBlueAvg]);

  useEffect(() => {
    if (rateOverrideInput !== "" && rateOverrideInput !== null) {
      setActiveExchangeRate(parseFloat(rateOverrideInput));
      if (totalPaymentARSInput !== null) {
        setTotalPayment(
          new Currency(parseFloat(rateOverrideInput), {
            ars: parseFloat(totalPaymentARSInput.toString()),
          })
        );
      }
    } else if (exchangeRateBlueAvg !== null) {
      setActiveExchangeRate(exchangeRateBlueAvg);
      if (totalPaymentARSInput !== null) {
        setTotalPayment(
          new Currency(exchangeRateBlueAvg, {
            ars: parseFloat(totalPaymentARSInput.toString()),
          })
        );
      }
    }
  }, [rateOverrideInput]);

  return (
    <div className="section row border pb-2 mx-0">
      <div className="col">
        <div className="row">
          <div className="col">
            <h2 className="pt-2">Payment Splitter</h2>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <p>
              Calculates the maximum amount of USD you can pay in increments of
              $100 and displays the remaining amount owed in ARS.
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
        <div className="row pb-2">
          <div>Rate override</div>
          <div className="col input-group">
            <span className="input-group-text">ARS</span>
            <input
              type="text"
              value={rateOverrideInput}
              onChange={handleRateOverrideChange}
              placeholder=""
              className="form-control border"
            />
          </div>
          <div className="col"></div>
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
                {firstPaymentExists && (
                  <tr>
                    <td className="">1</td>
                    <td className="table-active">
                      {firstPayment !== null
                        ? formatCurrencyARS(firstPayment.valueARS, true)
                        : ""}
                    </td>
                    <td className="">
                      {firstPayment !== null
                        ? formatCurrencyUSD(firstPayment.valueUSD)
                        : ""}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="">
                    {firstPaymentExists && 2}
                    {!firstPaymentExists && 1}
                  </td>
                  <td className="">
                    {usdPayment !== null
                      ? formatCurrencyARS(usdPayment.valueARS, true)
                      : ""}
                  </td>
                  <td className="table-active">
                    {usdPayment !== null
                      ? formatCurrencyUSD(usdPayment.valueUSD)
                      : ""}
                  </td>
                </tr>
                <tr>
                  <td className="">
                    {firstPaymentExists && 3}
                    {!firstPaymentExists && 2}
                  </td>
                  <td className="table-active">
                    {remainingArsPayment !== null
                      ? formatCurrencyARS(remainingArsPayment.valueARS, true)
                      : ""}
                  </td>
                  <td className="">
                    {remainingArsPayment !== null
                      ? formatCurrencyUSD(remainingArsPayment.valueUSD)
                      : ""}
                  </td>
                </tr>
                <tr className="fw-bold">
                  <td className="">Total</td>
                  <td className="">
                    {totalPayment !== null
                      ? formatCurrencyARS(totalPayment.valueARS, true)
                      : ""}
                  </td>
                  <td className="">
                    {totalPayment !== null
                      ? formatCurrencyUSD(totalPayment.valueUSD)
                      : ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSplitter;
