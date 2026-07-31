"use client";

import React, { useMemo, useState } from "react";
import { formatCurrencyARS, formatCurrencyUSD } from "../utils/format_currency";
import { useExchangeRateToUse } from "@/contexts/ExchangeRateToUseContext";
import { useI18n } from "@/i18n/LocaleContext";
import { isUsableRate } from "@/utils/rate";
import { splitPayment, USD_INCREMENT, type Payment } from "@/lib/split_payment";
import CurrencyInput from "./CurrencyInput";
import { PANEL_CLASS } from "@/utils/styles";

interface Row {
  /** Which leg of the split this is — stable as rows appear and disappear. */
  id: "pre" | "usd" | "final";
  payment: Payment;
  /** Which column carries the amount actually handed over in that currency. */
  highlight: "ars" | "usd";
}

const PaymentSplitter: React.FC = () => {
  const { exchangeRateToUseValue: exchangeRateToUse } = useExchangeRateToUse();
  const { m } = useI18n();

  const [totalArs, setTotalArs] = useState<number | null>(null);
  const [prePaymentArs, setPrePaymentArs] = useState<number | null>(null);
  const [usdLimitUsd, setUsdLimitUsd] = useState<number | null>(null);

  const prePaymentTooLarge =
    totalArs !== null && prePaymentArs !== null && prePaymentArs > totalArs;

  const split = useMemo(() => {
    if (totalArs === null || !isUsableRate(exchangeRateToUse)) return null;
    return splitPayment({
      totalArs,
      prePaymentArs,
      usdLimitUsd,
      rate: exchangeRateToUse,
    });
  }, [totalArs, prePaymentArs, usdLimitUsd, exchangeRateToUse]);

  const rows: Row[] = useMemo(() => {
    if (!split) return [];
    const result: Row[] = [];
    if (split.prePayment)
      result.push({ id: "pre", payment: split.prePayment, highlight: "ars" });
    if (split.usdPayment)
      result.push({ id: "usd", payment: split.usdPayment, highlight: "usd" });
    result.push({ id: "final", payment: split.finalPayment, highlight: "ars" });
    return result;
  }, [split]);

  return (
    <div className={PANEL_CLASS}>
      <div className="row">
        <div className="col">
          <div className="row">
            <div className="col">
              <h2 className="pt-2">{m.splitter.title}</h2>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <p>{m.splitter.description(USD_INCREMENT)}</p>
            </div>
          </div>
          <div className="row pt-2">
            <div className="col">
              <h5>{m.splitter.instructions}</h5>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <ol>
                <li>{m.splitter.step1}</li>
                <li>{m.splitter.step2}</li>
                <li>{m.splitter.step3}</li>
              </ol>
            </div>
          </div>
          <div className="row gap-2 px-2">
            <div className="col-md border py-2">
              <CurrencyInput
                id="splitter-total"
                label={m.splitter.totalPayment}
                currency="ARS"
                value={totalArs}
                onValueChange={setTotalArs}
              />
            </div>
            <div className="col-md border py-2">
              <CurrencyInput
                id="splitter-first-payment"
                label={m.splitter.firstPayment}
                currency="ARS"
                value={prePaymentArs}
                onValueChange={setPrePaymentArs}
                errorMessage={
                  prePaymentTooLarge
                    ? m.splitter.firstPaymentTooLarge
                    : null
                }
              />
            </div>
            <div className="col-md border py-2">
              <CurrencyInput
                id="splitter-usd-limit"
                label={m.splitter.usdLimit}
                currency="USD"
                value={usdLimitUsd}
                onValueChange={setUsdLimitUsd}
              />
            </div>
          </div>
          <div className="row pt-2">
            <div className="col px-2">
              <table className="table table-bordered text-center mb-0">
                <thead>
                  <tr>
                    <th scope="col" className="col-1">
                      {m.splitter.columnPayment}
                    </th>
                    <th scope="col" className="col">
                      {m.splitter.columnValueArs}
                    </th>
                    <th scope="col" className="col">
                      {m.splitter.columnValueUsd}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td
                        className={
                          row.highlight === "ars" ? "table-active" : undefined
                        }
                      >
                        {formatCurrencyARS(row.payment.ars)}
                      </td>
                      <td
                        className={
                          row.highlight === "usd" ? "table-active" : undefined
                        }
                      >
                        {formatCurrencyUSD(row.payment.usd)}
                      </td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td>{m.splitter.total}</td>
                    <td>{split ? formatCurrencyARS(split.total.ars) : ""}</td>
                    <td>{split ? formatCurrencyUSD(split.total.usd) : ""}</td>
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
