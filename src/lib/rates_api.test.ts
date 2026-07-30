import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCurrentRatesViaProxy, fetchHistoricalRate } from "./rates_api";

/** The exact shape `/api/current` puts on the wire, dates already stringified. */
const PAYLOAD = {
  blue: {
    buy: 1545,
    sell: 1565,
    avg: 1555,
    lastUpdated: "2026-07-30T17:00:00.000Z",
  },
  crypto: {
    buy: 1571.56,
    sell: 1576.67,
    avg: 1574.12,
    lastUpdated: "2026-07-30T17:00:00.000Z",
  },
};

const respondWith = (body: unknown, ok = true, status = 200) =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok, status, json: async () => body })
  );

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchCurrentRatesViaProxy", () => {
  it("revives lastUpdated into a real Date", async () => {
    respondWith(PAYLOAD);
    const rates = await fetchCurrentRatesViaProxy();

    // The whole point: a string here would break every age label downstream.
    expect(rates.blue?.lastUpdated).toBeInstanceOf(Date);
    expect(rates.blue?.lastUpdated?.toISOString()).toBe(
      "2026-07-30T17:00:00.000Z"
    );
    expect(rates.crypto?.lastUpdated).toBeInstanceOf(Date);
  });

  it("asks this app, not dolarapi", async () => {
    respondWith(PAYLOAD);
    await fetchCurrentRatesViaProxy();

    // The refresh going upstream directly is what made cache headers useless and
    // upstream traffic scale with open tabs.
    expect(fetch).toHaveBeenCalledWith("/api/current", undefined);
  });

  it("carries the numbers through unchanged", async () => {
    respondWith(PAYLOAD);
    const rates = await fetchCurrentRatesViaProxy();

    expect(rates.blue).toMatchObject({ buy: 1545, sell: 1565, avg: 1555 });
    expect(rates.crypto).toMatchObject({ buy: 1571.56, avg: 1574.12 });
  });

  it("keeps a good quote when the other one is malformed", async () => {
    respondWith({ ...PAYLOAD, crypto: { buy: "oops" } });
    const rates = await fetchCurrentRatesViaProxy();

    expect(rates.blue?.avg).toBe(1555);
    expect(rates.crypto).toBeNull();
  });

  it("tolerates a missing timestamp", async () => {
    respondWith({ ...PAYLOAD, blue: { ...PAYLOAD.blue, lastUpdated: null } });
    const rates = await fetchCurrentRatesViaProxy();

    expect(rates.blue?.avg).toBe(1555);
    expect(rates.blue?.lastUpdated).toBeNull();
  });

  it.each([
    ["a non-ok response", { ok: false, status: 502 }],
    ["a nonsense body", { ok: true, status: 200 }],
  ])("yields an empty map for %s", async (_label, { ok, status }) => {
    respondWith(ok ? "not an object" : { error: "upstream" }, ok, status);
    const rates = await fetchCurrentRatesViaProxy();

    expect(rates).toEqual({ blue: null, crypto: null });
  });

  it("stays quiet when the request is aborted", async () => {
    const abort = new Error("The operation was aborted.");
    abort.name = "AbortError";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abort));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const rates = await fetchCurrentRatesViaProxy();

    expect(rates).toEqual({ blue: null, crypto: null });
    // Superseding ourselves is not a failure worth reporting.
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe("fetchHistoricalRate", () => {
  /** A rejection that carries no abort marker of its own, as Chrome produces. */
  const failedToFetch = () => {
    const err = new TypeError("Failed to fetch");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(err));
  };

  it("reads an aborted signal even when the error is a plain TypeError", async () => {
    // Regression pin. Chrome reports an abort that lands before the connection
    // is established as `TypeError: Failed to fetch`, so classifying on the
    // error name alone made the date picker report its own cancellations as
    // failures — a red error under a rate that had loaded perfectly well.
    failedToFetch();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const controller = new AbortController();
    controller.abort();
    const result = await fetchHistoricalRate("blue", "2020-01-02", {
      signal: controller.signal,
    });

    expect(result).toEqual({ status: "aborted" });
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("still reports a genuine network failure", async () => {
    failedToFetch();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Same error, but nothing asked for this request to stop.
    const result = await fetchHistoricalRate("blue", "2020-01-03", {
      signal: new AbortController().signal,
    });

    expect(result).toEqual({ status: "failed" });
    expect(consoleError).toHaveBeenCalled();
  });

  it("maps a 404 to missing rather than failed", async () => {
    respondWith({ error: "nope" }, false, 404);
    expect(await fetchHistoricalRate("blue", "2020-01-04")).toEqual({
      status: "missing",
    });
  });

  it("returns the value and serves the repeat from memory", async () => {
    respondWith({ value: 1234.5 });
    expect(await fetchHistoricalRate("blue", "2020-01-05")).toEqual({
      status: "ok",
      value: 1234.5,
    });
    expect(fetch).toHaveBeenCalledTimes(1);

    // Second lookup for the same day must not reach the network at all.
    expect(await fetchHistoricalRate("blue", "2020-01-05")).toEqual({
      status: "ok",
      value: 1234.5,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
