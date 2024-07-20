import ExchangeRatesTable from "../components/ExchangeRatesTable";
import Graph from "../components/Graph";

export default function Home() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight">
        Latest Argentinian Pesos to USD Exchange Rates
      </h1>
      <LatestRate />
      <ExchangeRatesTable />
      <Graph />
    </div>
  );
}
