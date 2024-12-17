"use client";

import React, { useState, useEffect, useContext } from "react";
import { formatCurrencyARS, formatCurrencyUSD } from "../utils/format_currency";
import { Currency } from "../models/Currency"; // Adjust the import path as needed
import { ExchangeRateContext } from "@/contexts/ExchangeRateContext";

const PaymentSplitter: React.FC = () => {
  const context = useContext(ExchangeRateContext);

  if (!context) {
    throw new Error("PaymentSplitter must be used within a ValueAvgProvider");
  }

  const { exchangeRateBlueAvg } = context;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inputs
  const [rateOverrideInput, setRateOverrideInput] = useState<string>("");
  const [totalPaymentARSInput, setTotalPaymentARSInput] = useState<
    number | string
  >("");
  const [maxFirstPaymentARSInput, setMaxFirstPaymentARSInput] = useState<
    number | string
  >("");
  const [usdLimitInput, setUsdLimitInput] = useState<number | string>("");
  const [usdLimitValue, setUsdLimitValue] = useState<Currency | null>(null);

  // Variables
  const [activeExchangeRateValue, setActiveExchangeRateValue] =
    useState<number>(0);
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

    if (activeExchangeRateValue !== null) {
      const totalPaymentARSInputParsed = parseFloat(inputValue);

      setTotalPaymentValue(
        new Currency(activeExchangeRateValue, {
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

    if (activeExchangeRateValue !== null) {
      setPrePaymentValue(
        new Currency(activeExchangeRateValue, {
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

    if (activeExchangeRateValue !== null) {
      setUsdLimitValue(
        new Currency(activeExchangeRateValue, {
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
      setPrePaymentExists(true);
    } else {
      setPrePaymentExists(false);
    }
  }, [maxFirstPaymentARSInput]);

  useEffect(() => {
    if (totalPaymentValue !== null && activeExchangeRateValue !== null) {
      let remaining: number;
      if (prePaymentExists) {
        remaining = totalPaymentValue.valueARS - prePaymentValue!.valueARS;
      } else {
        remaining = totalPaymentValue.valueARS;
      }

      setRemainingAfterPrePayment(
        new Currency(activeExchangeRateValue, {
          ars: remaining,
        })
      );
    }
  }, [
    prePaymentExists,
    prePaymentValue,
    totalPaymentValue,
    activeExchangeRateValue,
    usdLimitValue,
  ]);

  useEffect(() => {
    if (remainingAfterPrePayment !== null && activeExchangeRateValue !== null) {
      let usdPayment = 0;
      let maxUsdPossible =
        Math.floor(remainingAfterPrePayment.valueUSD / 100) * 100;

      if (usdLimitValue && maxUsdPossible > usdLimitValue.valueUSD) {
        usdPayment = Math.floor(usdLimitValue.valueUSD / 100) * 100;
      } else {
        usdPayment = maxUsdPossible;
      }
      setUsdPayment(
        new Currency(activeExchangeRateValue, {
          usd: usdPayment,
        })
      );
    }
  }, [remainingAfterPrePayment]);

  useEffect(() => {
    if (
      usdPayment !== null &&
      remainingAfterPrePayment !== null &&
      activeExchangeRateValue !== null
    ) {
      setRemainingAfterUsdPayment(
        new Currency(activeExchangeRateValue, {
          ars: remainingAfterPrePayment.valueARS - usdPayment.valueARS,
        })
      );
    }
  }, [usdPayment]);

  useEffect(() => {
    if (exchangeRateBlueAvg !== null) {
      setActiveExchangeRateValue(exchangeRateBlueAvg);
      if (totalPaymentARSInput !== null) {
        setTotalPaymentValue(
          new Currency(activeExchangeRateValue, {
            ars: parseFloat(totalPaymentARSInput.toString()),
          })
        );
      }
    }
  }, [exchangeRateBlueAvg]);

  useEffect(() => {
    if (rateOverrideInput !== "" && rateOverrideInput !== null) {
      setActiveExchangeRateValue(parseFloat(rateOverrideInput));
      if (totalPaymentARSInput !== null) {
        setTotalPaymentValue(
          new Currency(parseFloat(rateOverrideInput), {
            ars: parseFloat(totalPaymentARSInput.toString()),
          })
        );
      }
    } else if (exchangeRateBlueAvg !== null) {
      setActiveExchangeRateValue(exchangeRateBlueAvg);
      if (totalPaymentARSInput !== null) {
        setTotalPaymentValue(
          new Currency(exchangeRateBlueAvg, {
            ars: parseFloat(totalPaymentARSInput.toString()),
          })
        );
      }
    }
  }, [rateOverrideInput]);

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
                {prePaymentExists && (
                  <tr>
                    <td className="">1</td>
                    <td className="table-active">{payment1ArsLabel}</td>
                    <td className="">{payment1UsdLabel}</td>
                  </tr>
                )}
                <tr>
                  <td className="">
                    {prePaymentExists && 2}
                    {!prePaymentExists && 1}
                  </td>
                  <td className="">{payment2ArsLabel}</td>
                  <td className="table-active">{payment2UsdLabel}</td>
                </tr>
                <tr>
                  <td className="">
                    {prePaymentExists && 3}
                    {!prePaymentExists && 2}
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
  );
};

export default PaymentSplitter;
