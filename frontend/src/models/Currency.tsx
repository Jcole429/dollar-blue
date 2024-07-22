export class Currency {
  private _valueUSD: number;
  private _valueARS: number;
  private _exchangeRate: number; // ARS per 1 USD

  constructor(
    exchangeRate: number,
    initialValue?: { usd?: number; ars?: number }
  ) {
    this._exchangeRate = exchangeRate;

    if (initialValue?.usd !== undefined) {
      this._valueUSD = initialValue.usd;
      this._valueARS = initialValue.usd * exchangeRate;
    } else if (initialValue?.ars !== undefined) {
      this._valueARS = initialValue.ars;
      this._valueUSD = initialValue.ars / exchangeRate;
    } else {
      this._valueUSD = 0;
      this._valueARS = 0;
    }
  }

  // Getter for value in USD
  get valueUSD(): number {
    return this._valueUSD;
  }

  // Setter for value in USD
  set valueUSD(value: number) {
    this._valueUSD = value;
    this._valueARS = value * this._exchangeRate;
  }

  // Getter for value in ARS
  get valueARS(): number {
    return this._valueARS;
  }

  // Setter for value in ARS
  set valueARS(value: number) {
    this._valueARS = value;
    this._valueUSD = value / this._exchangeRate;
  }

  // Method to update the exchange rate
  updateExchangeRate(newRate: number) {
    this._exchangeRate = newRate;
    this._valueARS = this._valueUSD * this._exchangeRate;
  }
}
