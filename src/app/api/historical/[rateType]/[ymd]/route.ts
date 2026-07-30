import { NextResponse } from "next/server";
import { RATE_SLUG, RATE_TYPES, type RateType } from "@/types/rates";
import { ARGENTINADATOS_ORIGIN } from "@/lib/rates_api";
import { averageRate, toNumber } from "@/utils/rate";
import { parseYmdLocal } from "@/utils/format_date";

/**
 * A published historical rate, proxied so we can say how long it may be cached.
 *
 * A rate for a past day never changes, but argentinadatos advertises it as
 * `max-age=60` — and a third party's headers are not ours to override from the
 * browser. Owning the response is the only way to mark this data what it actually
 * is: immutable. Three layers then hold it, none of which expire:
 *
 *   browser HTTP cache -> Vercel CDN -> Next data cache -> argentinadatos
 *
 * A miss costs one upstream request for everyone, ever, rather than one per user
 * per minute.
 */

/** A year in seconds — the maximum `max-age` worth expressing. */
const ONE_YEAR = 31_536_000;

/** How long to hold "no rate for that day", which *can* turn into a rate later. */
const MISSING_TTL = 300;

const isRateType = (value: string): value is RateType =>
  (RATE_TYPES as string[]).includes(value);

export async function GET(
  _request: Request,
  { params }: { params: { rateType: string; ymd: string } }
) {
  // Both segments are interpolated into an upstream URL, so neither is trusted:
  // only a known rate type and a real calendar day get through.
  if (!isRateType(params.rateType) || parseYmdLocal(params.ymd) === null) {
    return NextResponse.json(
      { error: "Unknown rate type or malformed date." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const [year, month, day] = params.ymd.split("-");
  const url = `${ARGENTINADATOS_ORIGIN}/v1/cotizaciones/dolares/${
    RATE_SLUG[params.rateType]
  }/${year}/${month}/${day}`;

  try {
    // `force-cache` keeps this in the Next data cache with no expiry, so the
    // upstream sees one request per (rate, day) across every visitor.
    const response = await fetch(url, { cache: "force-cache" });

    if (!response.ok) {
      return response.status === 404
        ? missing()
        : failed(`Upstream responded ${response.status}.`);
    }

    const data = await response.json();
    const buy = toNumber(data?.compra);
    const sell = toNumber(data?.venta);
    if (buy === null || sell === null) return missing();

    return NextResponse.json(
      { value: averageRate(buy, sell) },
      {
        headers: {
          // The one response we are willing to call permanent.
          "Cache-Control": `public, max-age=${ONE_YEAR}, s-maxage=${ONE_YEAR}, immutable`,
        },
      }
    );
  } catch (err) {
    console.error("Historical rate proxy failed:", err);
    return failed("Could not reach the rate source.");
  }
}

/**
 * Deliberately *not* immutable: a very recent day may simply not be published
 * yet, and pinning that answer for a year would outlive the gap by months.
 */
const missing = () =>
  NextResponse.json(
    { error: "No rate published for that day." },
    {
      status: 404,
      headers: {
        "Cache-Control": `public, max-age=${MISSING_TTL}, s-maxage=${MISSING_TTL}`,
      },
    }
  );

const failed = (error: string) =>
  NextResponse.json(
    { error },
    { status: 502, headers: { "Cache-Control": "no-store" } }
  );
