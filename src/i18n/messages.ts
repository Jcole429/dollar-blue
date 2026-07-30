import type { SelectedRateType } from "@/types/rates";
import type { Locale } from "./locales";

/**
 * Typed as a full record so `Messages["rateLabel"]` inherits that constraint:
 * adding a rate type to `RateType` then fails to compile in *both* catalogs
 * until it has been named in each.
 */
const RATE_LABELS_ES: Record<SelectedRateType, string> = {
  blue: "Dólar Blue",
  crypto: "Dólar Cripto",
  custom: "personalizada",
};

/**
 * Every string the UI can show, in both languages.
 *
 * Messages that take a value are **functions**, not templates with `{placeholder}`
 * holes. That is the whole reason there is no `t("some.key", { n })` here: a
 * function signature is checked by the compiler, so a translation cannot silently
 * drop an argument, get its type wrong, or interpolate a key that was never
 * passed. `Messages` is derived from the Spanish catalog, which makes English
 * structurally required to match it — a missing or misspelled key is a build
 * error rather than a blank spot on the page.
 *
 * Word order differs enough between the two that the interpolated strings are
 * written out per language rather than assembled from fragments.
 */
const es = {
  app: {
    /** The product name. A proper noun in both languages, so it is not translated. */
    title: "Dollar Blue",
    loadingRates: "Cargando cotizaciones…",
  },

  language: {
    label: "Idioma",
    /** Announced on the trigger, which shows a flag and the current language. */
    change: "Cambiar idioma",
  },

  rateLabel: RATE_LABELS_ES,

  rates: {
    buy: "Compra",
    sell: "Venta",
    average: "Promedio",
    lastUpdated: "Última actualización:",
    /** Shown in a cell that has no number yet. */
    noValue: "—",
    loadError: "No se pudieron cargar las cotizaciones. Intentá más tarde.",
  },

  age: {
    never: "Sin actualizar",
    justNow: "recién",
    oneMinute: "hace 1 minuto",
    minutes: (n: number) => `hace ${n} minutos`,
    oneHour: "hace 1 hora",
    hours: (n: number) => `hace ${n} horas`,
    oneDay: "hace 1 día",
    days: (n: number) => `hace ${n} días`,
  },

  selector: {
    title: "Elegir Cotización",
    rateTypeLegend: "Tipo de cotización:",
    customRate: "Cotización personalizada",
    customRateLabel: "Ingresá la cotización:",
    customRateHelp: "Pesos argentinos por dólar estadounidense.",
    rateOptionLegend: "Momento de la cotización:",
    current: "Cotización actual",
    historical: "Cotización histórica",
    dateLabel: "Elegí la fecha:",
    dateTooLate: (maxDate: string) =>
      `Solo hay cotizaciones históricas publicadas hasta el ${maxDate}.`,
    loadingRate: "Cargando cotización…",
    noRateSelected: "No hay cotización seleccionada.",
    using: (label: string, amount: string) =>
      `Usando cotización ${label} ${amount}`,
    usingFrom: (label: string, amount: string, when: string) =>
      `Usando cotización ${label} ${amount} del ${when}`,
    noRateForDate: (date: string) =>
      `No hay cotización publicada para el ${date}.`,
    fetchFailed: "No se pudo obtener la cotización histórica. Intentá de nuevo.",
  },

  converter: {
    title: "Conversor de Moneda",
    usdToArs: "USD → ARS",
    arsToUsd: "ARS → USD",
    amountInUsd: "Monto en USD",
    amountInArs: "Monto en ARS",
    convertsToArs: "Equivale a ARS",
    convertsToUsd: "Equivale a USD",
  },

  splitter: {
    title: "Divisor de Pagos",
    description: (increment: number) =>
      `Calcula el monto máximo en USD que podés pagar en múltiplos de $${increment} y muestra el saldo restante en ARS.`,
    instructions: "Instrucciones:",
    step1: "Ingresá el monto total del pago en ARS.",
    step2:
      "Opcionalmente, ingresá un pago inicial en ARS antes de calcular el pago en USD.",
    step3: "Opcionalmente, ingresá el monto máximo de USD a utilizar.",
    totalPayment: "Pago Total",
    firstPayment: "Primer Pago",
    usdLimit: "Límite en USD",
    firstPaymentTooLarge: "El primer pago no puede ser mayor que el pago total.",
    columnPayment: "Pago",
    columnValueArs: "Valor ARS",
    columnValueUsd: "Valor USD",
    total: "Total",
  },

  amountInput: {
    /** The example uses the separator convention of the language it is written in. */
    notANumber: "Ingresá un número, por ej. 1.234,56",
    tooSmall: (minimum: string) => `Debe ser al menos ${minimum}.`,
    tooLarge: (maximum: string) => `Debe ser como máximo ${maximum}.`,
  },

  error: {
    title: "Algo salió mal",
    body: "La página tuvo un error inesperado. Los datos ingresados no se guardaron.",
    retry: "Reintentar",
  },
};

export type Messages = typeof es;

const en: Messages = {
  app: {
    title: "Dollar Blue",
    loadingRates: "Loading exchange rates…",
  },

  language: {
    label: "Language",
    change: "Change language",
  },

  rateLabel: {
    blue: "Blue Dollar",
    crypto: "Crypto Dollar",
    custom: "custom",
  },

  rates: {
    buy: "Buy",
    sell: "Sell",
    average: "Average",
    lastUpdated: "Last updated:",
    noValue: "—",
    loadError: "Could not load exchange rates. Please try again later.",
  },

  age: {
    never: "Never updated",
    justNow: "just now",
    oneMinute: "1 minute ago",
    minutes: (n: number) => `${n} minutes ago`,
    oneHour: "1 hour ago",
    hours: (n: number) => `${n} hours ago`,
    oneDay: "1 day ago",
    days: (n: number) => `${n} days ago`,
  },

  selector: {
    title: "Select Exchange Rate",
    rateTypeLegend: "Rate type:",
    customRate: "Custom rate",
    customRateLabel: "Enter custom rate:",
    customRateHelp: "Argentine pesos per US dollar.",
    rateOptionLegend: "Rate date:",
    current: "Current rate",
    historical: "Historical rate",
    dateLabel: "Select date:",
    dateTooLate: (maxDate: string) =>
      `Historical rates are only published through ${maxDate}.`,
    loadingRate: "Loading rate…",
    noRateSelected: "No rate selected.",
    using: (label: string, amount: string) => `Using ${label} rate ${amount}`,
    usingFrom: (label: string, amount: string, when: string) =>
      `Using ${label} rate ${amount} from ${when}`,
    noRateForDate: (date: string) => `No rate published for ${date}.`,
    fetchFailed: "Failed to fetch historical rate. Please try again.",
  },

  converter: {
    title: "Currency Converter",
    usdToArs: "USD → ARS",
    arsToUsd: "ARS → USD",
    amountInUsd: "Amount in USD",
    amountInArs: "Amount in ARS",
    convertsToArs: "Converts to ARS",
    convertsToUsd: "Converts to USD",
  },

  splitter: {
    title: "Payment Splitter",
    description: (increment: number) =>
      `Calculates the maximum amount of USD you can pay in increments of $${increment} and displays the remaining amount owed in ARS.`,
    instructions: "Instructions:",
    step1: "Enter the total payment amount in ARS.",
    step2:
      "Optionally, enter an initial payment in ARS before calculating the USD payment.",
    step3: "Optionally, enter the max amount of USD to use.",
    totalPayment: "Total Payment",
    firstPayment: "First Payment",
    usdLimit: "USD Limit",
    firstPaymentTooLarge: "First payment cannot be greater than total payment.",
    columnPayment: "Payment",
    columnValueArs: "Value ARS",
    columnValueUsd: "Value USD",
    total: "Total",
  },

  amountInput: {
    notANumber: "Enter a number, e.g. 1,234.56",
    tooSmall: (minimum: string) => `Must be at least ${minimum}.`,
    tooLarge: (maximum: string) => `Must be at most ${maximum}.`,
  },

  error: {
    title: "Something went wrong",
    body: "The page hit an unexpected error. Your inputs were not saved.",
    retry: "Try again",
  },
};

export const MESSAGES: Record<Locale, Messages> = {
  "es-AR": es,
  "en-US": en,
};
