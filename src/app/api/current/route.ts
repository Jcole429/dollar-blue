import { NextResponse } from "next/server";
import {
  CURRENT_RATE_REVALIDATE_SECONDS,
  fetchCurrentRates,
} from "@/lib/rates_api";
import { RATE_TYPES } from "@/types/rates";

/**
 * Current quotes for the periodic refresh an open tab performs.
 *
 * The tab used to poll dolarapi directly, which meant the careful five-minute
 * cache on the server render bought nothing once more than one tab was open:
 * upstream traffic scaled with viewers. Routed through here, every tab shares one
 * cached response, so upstream sees one request per window no matter how many
 * people are watching.
 *
 * This calls `fetchCurrentRates` with exactly the options the page render uses,
 * so the two share a Next data cache entry rather than each keeping their own.
 */

/** Serve a slightly stale quote while refreshing, rather than stall at the boundary. */
const STALE_WHILE_REVALIDATE = 60;

export async function GET() {
  const rates = await fetchCurrentRates({
    next: { revalidate: CURRENT_RATE_REVALIDATE_SECONDS },
  });

  // Nothing usable upstream: say so rather than caching an empty answer.
  if (RATE_TYPES.every((rateType) => rates[rateType] === null)) {
    return NextResponse.json(
      { error: "Could not reach the rate source." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(rates, {
    headers: {
      // `max-age=0` keeps each tab honest — it always asks — while `s-maxage`
      // means that ask is answered by the CDN, not by dolarapi.
      "Cache-Control": `public, max-age=0, s-maxage=${CURRENT_RATE_REVALIDATE_SECONDS}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
    },
  });
}
