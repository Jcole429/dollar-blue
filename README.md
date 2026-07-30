# Dollar Blue

A converter for Argentina's parallel exchange rates — *dólar blue* and *dólar
cripto*. Convert between ARS and USD at the current or a historical rate, and
split an ARS bill into the largest possible USD payment in $100 notes plus an
ARS remainder.

A single Next.js 14 app (App Router, TypeScript, Bootstrap 5). No database — rates
come from two public sources:

| Data | Source | Fetched |
|---|---|---|
| Current blue / cripto | `dolarapi.com/v1/dolares/{blue,cripto}` | Server on render, proxied on refresh |
| Historical by date | `api.argentinadatos.com/v1/cotizaciones/dolares/{blue,cripto}/YYYY/MM/DD` | Proxied, on demand |

## Caching

The two kinds of rate have opposite lifetimes, so they are cached on opposite
terms. Neither is ever fetched from the browser directly: a response this app
serves is one whose cache headers it controls.

**Current quotes** are fetched during the server render, so the first paint
already has them and the browser makes no request on load. They are cached for
five minutes — comfortably inside the interval at which the number actually
moves.

A tab left open re-checks every five minutes through `app/api/current`, which is
cached `s-maxage=300`. That request is answered by the CDN rather than by
dolarapi, so upstream traffic stays at one request per window whether one tab is
open or a thousand. The route asks for the quotes exactly as the page render
does, so both share a single data cache entry.

**Historical quotes never change once published**, so they are cached
permanently. That needs a header we control: argentinadatos serves this immutable
data as `max-age=60`, and a third party's headers cannot be overridden from the
browser. So the lookup goes through `app/api/historical/[rateType]/[ymd]`, which
marks a successful response `immutable` for a year. Four layers then hold it, and
a miss costs one upstream request for everyone, ever:

```
in-memory Map  ->  browser HTTP cache  ->  CDN  ->  Next data cache  ->  upstream
```

A day with *no* published rate is deliberately excluded from that: it is held for
five minutes only, since a very recent date may simply not be published yet.

## Running locally

```bash
npm install && npm run dev
```

Runs on <http://localhost:3000>. There is nothing to configure — no environment
variables, no services to start.

## Tests

```bash
npm test
```

Vitest covers the pure functions that decide what the app tells you:

- `src/utils/parse_amount.ts` — reads amounts typed in either separator
  convention (`1.234,56` and `1,234.56` both mean 1234.56)
- `src/lib/split_payment.ts` — the payment split, including the invariant that
  the ARS column always sums exactly to the total
- `src/utils/format_date.ts` — local-calendar-day handling for the date picker

Run under Argentine time to exercise the timezone paths:

```bash
TZ=America/Argentina/Buenos_Aires npm test
```

## Conventions worth knowing

- **Money in, money out.** Amount inputs go through `<CurrencyInput>`, which
  parses permissively, reformats on blur, and echoes the parsed value beneath
  the field. Never call `parseFloat` on user input.
- **ARS is quantised to whole pesos** in the splitter, with the final payment
  absorbing the residual so the column adds up.
- **Untrusted JSON.** Both APIs are third-party and untyped; run every numeric
  field through `toNumber` in `src/utils/rate.ts` before using it.
- **Rate spellings.** `src/types/rates.ts` holds the single internal spelling
  (`blue` / `crypto`) and `RATE_SLUG`, the `cripto` spelling both upstream APIs
  use in their paths.

## History

Through July 2026 this repo also contained a Python backend on Vercel that
scraped the same upstream APIs into a Neon Postgres table and re-served the
latest row. It was retired when that database's free-tier compute quota was
exhausted: the archive it accumulated was read by nothing, and the "latest row"
it served was only ever a cached copy of what dolarapi returns live. The code is
in the history if the archive is ever wanted back.
