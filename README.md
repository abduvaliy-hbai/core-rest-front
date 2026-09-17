# Attendance Dashboard — V2 (review copy)

A redesign of `int-attendance-dashboard`, built from the Figma Make export of the
Humblebee-branded attendance screen and wired to the same live bRide API.

This is a **side-by-side review copy**. It does not replace V1: it runs on its own
port, as its own compose service, against the same database.

## What it talks to

The browser only ever calls this app's own origin. `server.mjs` proxies three
routes to `bride-rest-api-orm`:

| Browser | Upstream |
| --- | --- |
| `GET /api/daily-status/offices` | `GET {BRIDE_API_INTERNAL_URL}/daily-status/offices` |
| `GET /api/daily-status?date=&office_id=` | `GET {BRIDE_API_INTERNAL_URL}/daily-status` |
| `GET /api/daily-status/user?user_id=&start_date=&end_date=` | `GET {BRIDE_API_INTERNAL_URL}/daily-status/user` |

`BRIDE_API_INTERNAL_URL` **must include the API's route prefix**. Production runs
`BRIDE_API_PREFIX=/api/v1`, so the value there is `http://api:38000/api/v1`.
Leaving the prefix off is what produced the original 502s on V1.

## Run it

### Local review (a laptop, no API container)

```bash
docker compose -f compose.local.yml up --build     # http://localhost:5176
```

Standalone: no shared network, no local database, no `.env` needed. The upstream
is pinned to the deployed API's public origin, so the roster on screen is the one
production is serving.

Without Docker:

```bash
pnpm install
pnpm build
BRIDE_API_INTERNAL_URL=https://attendance.humblebee.ai/api PORT=5176 node server.mjs
```

### On the server

```bash
cp .env.example .env      # set BRIDE_API_INTERNAL_URL to http://api:38000/api/v1
docker compose up -d --build
```

`compose.yml` joins the external `bride-rest-api-orm_default` network, so the
`api` hostname resolves without publishing the API port. That network only exists
where the API stack is running -- on a laptop it fails with *"network ... declared
as external, but could not be found"*, which is what `compose.local.yml` is for.

## Differences from V1

Same data, same endpoints, same three-pane information architecture. The
redesign changes brand (Humblebee yellow/orange over violet), adds avatars and
status dots to the roster, promotes the daily counts to real KPI figures in the
top bar, and replaces the CSS conic-gradient donut with an SVG one.

Behavioural fixes carried in on top of the Figma export are listed in the
handover notes for this branch; the notable ones are a donut that no longer
renders blank at 100% of a single status, a working date-range picker in place
of the export's decorative button, real loading/error/empty states, and a
responsive layout below 1040px.
