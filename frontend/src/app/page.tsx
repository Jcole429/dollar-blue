import ExchangeRatesTable from "../components/ExchangeRatesTable";
import Graph from "../components/Graph";

export default function Home() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl">
        Latest Argentinian Pesos to USD Exchange Rates
      </h1>
      <ExchangeRatesTable />
      <Graph />
    </div>
  );
}
