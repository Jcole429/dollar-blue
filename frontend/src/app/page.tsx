"use client";

import LatestRateDisplay from "@/components/LatestRateDisplay";
import Converter from "@/components/Converter";
import PaymentSplitter from "@/components/PaymentSplitter";
import { ExchangeRateProvider } from "@/contexts/ExhangeRateContext";
import "bootstrap/dist/js/bootstrap.bundle";

export default function Home() {
  return (
    <div className="container mx-auto" style={{ maxWidth: "800px" }}>
      <div className="row">
        <div className="col border m-2 p-0">
          <h1 className="p-2 mb-2">Dollar Blue</h1>
          <ExchangeRateProvider>
            <div className="row m-0">
              <div className="col">
                <LatestRateDisplay />
              </div>
            </div>
            <hr></hr>
            <div className="row pt-2">
              <div className="col">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="converter-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#converter"
                      type="button"
                      role="tab"
                      aria-controls="converter"
                      aria-selected="false"
                      style={{
                        color: "black", // Text color
                      }}
                    >
                      Converter
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="payment-splitter-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#payment-splitter"
                      type="button"
                      role="tab"
                      aria-controls="payment-splitter"
                      aria-selected="false"
                      style={{
                        color: "black", // Text color
                      }}
                    >
                      Payment Splitter
                    </button>
                  </li>
                </ul>
                <div className="tab-content" id="myTabContent">
                  <div
                    className="tab-pane fade show active"
                    id="converter"
                    role="tabpanel"
                    aria-labelledby="converter-tab"
                  >
                    <div className="">
                      <Converter />
                    </div>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="payment-splitter"
                    role="tabpanel"
                    aria-labelledby="payment-splitter-tab"
                  >
                    <div className="">
                      <PaymentSplitter />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ExchangeRateProvider>
        </div>
      </div>
    </div>
  );
}
