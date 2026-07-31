"use client";

import React, { useState } from "react";
import { formatCurrencyARS, formatCurrencyUSD } from "../utils/format_currency";
import { useExchangeRateToUse } from "@/contexts/ExchangeRateToUseContext";
import { useI18n } from "@/i18n/LocaleContext";
import { isUsableRate } from "@/utils/rate";
import CurrencyInput from "./CurrencyInput";
import { PANEL_CLASS } from "@/utils/styles";

const Converter: React.FC = () => {
  const { exchangeRateToUseValue: exchangeRateToUse } = useExchangeRateToUse();
  const { m } = useI18n();

  const [usdAmount, setUsdAmount] = useState<number | null>(null);
  const [arsAmount, setArsAmount] = useState<number | null>(null);

  const rateIsUsable = isUsableRate(exchangeRateToUse);

  const convertedArs =
    rateIsUsable && usdAmount !== null
      ? formatCurrencyARS(usdAmount * exchangeRateToUse)
      : "";

  const convertedUsd =
    rateIsUsable && arsAmount !== null
      ? formatCurrencyUSD(arsAmount / exchangeRateToUse)
      : "";

  return (
    <div className={PANEL_CLASS}>
      <div className="row">
        <div className="col">
          <div className="row">
            <div className="col">
              <h2 className="pt-2">{m.converter.title}</h2>
            </div>
          </div>
          <div className="row gap-2 p-2">
            <div className="col-md border py-2">
              <div className="row pt-2">
                <div className="col">
                  <h5>{m.converter.usdToArs}</h5>
                </div>
              </div>
              <div className="row pb-2">
                <div className="col">
                  <CurrencyInput
                    id="converter-usd-amount"
                    label={m.converter.amountInUsd}
                    currency="USD"
                    value={usdAmount}
                    onValueChange={setUsdAmount}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="converter-ars-result" className="form-label">
                    {m.converter.convertsToArs}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">ARS</span>
                    <input
                      id="converter-ars-result"
                      readOnly
                      type="text"
                      value={convertedArs}
                      className="form-control border"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md border py-2">
              <div className="row pt-2">
                <div className="col">
                  <h5>{m.converter.arsToUsd}</h5>
                </div>
              </div>
              <div className="row pb-2">
                <div className="col">
                  <CurrencyInput
                    id="converter-ars-amount"
                    label={m.converter.amountInArs}
                    currency="ARS"
                    value={arsAmount}
                    onValueChange={setArsAmount}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="converter-usd-result" className="form-label">
                    {m.converter.convertsToUsd}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">USD</span>
                    <input
                      id="converter-usd-result"
                      readOnly
                      type="text"
                      value={convertedUsd}
                      className="form-control border"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Converter;
