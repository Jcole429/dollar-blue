# Dollar Blue

A converter for Argentina's parallel exchange rates — *dólar blue* and *dólar
cripto*. Convert between ARS and USD at the current or a historical rate, and
split an ARS bill into the largest possible USD payment in $100 notes plus an
ARS remainder.

A single Next.js 14 app (App Router, TypeScript, Bootstrap 5). No server of its
own and no database — rates are read in the browser directly from two public
APIs, both of which send `Access-Control-Allow-Origin: *`:

| Data | Source |
|---|---|
| Current blue / cripto | `dolarapi.com/v1/dolares/{blue,cripto}` |
| Historical by date | `api.argentinadatos.com/v1/cotizaciones/dolares/{blue,cripto}/YYYY/MM/DD` |

## Running locally

```bash
cd frontend && npm install && npm run dev
```

Runs on <http://localhost:3000>. There is nothing to configure — no environment
variables, no services to start.

## Tests

```bash
cd frontend && npm test
```

Vitest covers the pure functions that decide what the app tells you:

- `src/utils/parse_amount.ts` — reads amounts typed in either separator
  convention (`1.234,56` and `1,234.56` both mean 1234.56)
- `src/lib/split_payment.ts` — the payment split, including the invariant that
  the ARS column always sums exactly to the total
- `src/utils/format_date.ts` — local-calendar-day handling for the date picker

Run under Argentine time to exercise the timezone paths:

```bash
cd frontend && TZ=America/Argentina/Buenos_Aires npm test
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
