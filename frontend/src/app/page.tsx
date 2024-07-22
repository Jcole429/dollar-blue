import ExchangeRatesTable from "../components/ExchangeRatesTable";
import Graph from "../components/Graph";
import LatestRateDisplay from "@/components/LatestRateDisplay";
import Converter from "@/components/Converter";
import PaymentSplitter from "@/components/PaymentSplitter";
import { ExchangeRateProvider } from "@/contexts/ExhangeRateContext";

export default function Home() {
  return (
    <div className="max-w-[600px] mx-auto border">
      <h1 className="p-4 mb-4 text-4xl font-extrabold leading-none tracking-tight">
        Dollar Blue
      </h1>
      <ExchangeRateProvider>
        <LatestRateDisplay />
        <Converter />
        <PaymentSplitter />
        {/* <ExchangeRatesTable /> */}
        {/* <Graph /> */}
      </ExchangeRateProvider>
    </div>
  );
}
