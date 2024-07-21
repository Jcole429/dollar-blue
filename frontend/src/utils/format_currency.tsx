export const formatCurrencyARS = (
  value: number,
  includeCents: boolean = false
) => {
  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "ARS",
  };

  if (!includeCents) {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }

  return new Intl.NumberFormat("es-AR", options).format(value);
};

export const formatCurrencyUSD = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};
