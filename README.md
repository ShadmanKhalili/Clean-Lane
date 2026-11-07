# Clean Lane

Clean Lane is a multi-sided recyclables collection, rewards and chain-of-custody traceability pilot for Dhaka. Households, apartments and businesses book collections; field collectors weigh and hand over material; an aggregation hub verifies weights on a certified scale; processors turn sorted material into recycled feedstock; and brand/EPR partners buy audited evidence packages for their packaging obligations.

The repository is a front-end demo: a React 19 + Vite 8 + Tailwind v4 + TypeScript application that runs entirely in the browser with seeded data.

## Roles

Each role is a separate workspace, selected with `?as=<role>`.

| Role (`as`) | Who | Workspace |
| --- | --- | --- |
| `customer_household` | Household customer (default) | Customer app |
| `customer_apartment` | Apartment / building customer | Customer app |
| `customer_business` | Business customer | Customer app |
| `collector` | Field collector | Collector field app |
| `aggregator` | Aggregation hub operator | Aggregation hub |
| `processor` | Processing facility | Processor facility |
| `operator` | Operations admin | Operator dashboard |
| `brand_partner` | Brand / EPR partner | Brand EPR portal |

## Evidence ladder

Every kilogram moves up an evidence ladder. Each level is a claim the platform is allowed to make, and no level is skipped.

| Level | Meaning |
| --- | --- |
| E0 | Requested: the collection is booked in the clean lane. |
| E1 | Collected: the collector recorded a field weight at doorstep handover. |
| E2 | Hub-scale verified: the weight was confirmed on a certified hub scale. |
| E3 | Dispatched: the sorted batch left the hub for a processor. |
| E4 | Processing outcome certified: the processor's yield is recorded. |
| E5 | Sealed: the lot is part of an audited brand evidence package. |

## Quick start

Requires Node 22 (see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000, bound to all interfaces. |
| `npm test` | Runs the Vitest suite once (`src/__tests__`). |
| `npm run lint` | Type-checks the project with `tsc --noEmit`. |
| `npm run build` | Production build into `dist/`. |
| `npm run check` | Lint, test and build in sequence. |

## Deep links

The URL is the source of truth for navigation: `?as=<role>&view=<view>`.

- `as` sets the role. A valid `as` on page load overrides the last-used role; an invalid value is ignored.
- `view` selects a screen. A view that the role does not have falls back to `overview`.

Views by role:

- Customer roles: `overview`, `rewards`, `activity`.
- Staff roles (collector, aggregator, processor, operator, brand partner): `overview`, `traceability`.
- Any role: `evidence_model` (the E0–E5 protocol page, also linked from the footer).

Examples:

- `http://localhost:3000/?as=customer_household&view=rewards`
- `http://localhost:3000/?as=operator&view=traceability`
- `http://localhost:3000/?as=brand_partner&view=evidence_model`

## Demo data

- All state is seeded from mock data in `src/data/mockData.ts` and persisted in the browser's `localStorage`, under keys prefixed `cleanlane:v1:` (see `src/hooks/usePersistentState.ts`). Storage errors degrade to in-memory state.
- Use **Reset demo data** in the Account drawer (customer app) to clear every `cleanlane:` key and reload. The error screen also offers the same reset.
- Seed dates were authored against `SEED_ANCHOR_DATE` (`2026-10-06`). `rebaseSeed` in `src/utils/seedTime.ts` shifts every date in the seed by the number of days between that anchor and the current date, so the demo's "today" is the real today. Identifiers are not changed.

## Project structure

```
src/
  App.tsx                 App shell: routed workspace selection, header, footer
  main.tsx                React entry point
  routing.ts              ?as / ?view parsing, role and view validation
  index.css               Tailwind entry and global tokens
  context/AppContext.tsx  Global state: role, language, bookings, lots, ledger, actions
  components/
    aggregator/           Aggregation hub workspace
    brand/                Brand / EPR partner portal
    collector/            Collector field app and lot handover modals
    common/               Shared UI: Modal, header, error boundary, status and evidence components
    customer/             Customer app: booking, rewards, activity, account drawer
    notifications/        Notification centre, reminders and preparation guidance
    operator/             Operations dashboard
    processor/            Processor facility workspace
    traceability/         Chain-of-custody and evidence-model views
  data/mockData.ts        Seed data (bookings, lots, ledger, campaigns, catalogues)
  domain/
    rules.ts              Scale tolerance, reward rates, points balance and ledger rules
    lots.ts               Lot lifecycle guards (split, hand-over, sorting, processing)
    customers.ts          Customer profiles and role mapping
  hooks/usePersistentState.ts  useState backed by localStorage, plus clearPersistedState
  services/notificationService.ts  Reminder scheduling and simulated SMS / push / in-app channels
  theme/tokens.ts         Design tokens
  types/index.ts          Domain types, including EVIDENCE_LEVELS
  utils/                  Short IDs, seed date rebasing, status and translation dictionaries
  assets/images/          Photographs used in the UI (pickup, aggregation hub, brand campaign)
  __tests__/              Vitest suites: routing, business rules, seed date rebasing
public/_redirects         SPA fallback for static hosts
```

## Business rules

Rules live in `src/domain/rules.ts` and are covered by `src/__tests__/rules.test.ts`.

- **Scale tolerance:** a lot is flagged when the hub weight differs from the field weight by more than **±5%** (`SCALE_TOLERANCE_PERCENT = 5`). A zero or unknown field weight with a non-zero hub reading counts as a 100% variance.
- **Points rates** (rule set `RULES_V1.2_GULSHAN_CLEANLANE`):
  - Doorstep collection: **45 points/kg**.
  - Walk-in drop-off: **50 points/kg**.
  - Points are rounded to whole numbers and never negative.
- **Material payout:** **30 BDT/kg**.
- **Ledger semantics** (`computePointBalances`):
  - A `CREDIT` with status `AVAILABLE` adds to the spendable balance.
  - `DEBIT` and `REVERSAL` entries always reduce the spendable balance, whatever their status, so a reservation locks points immediately.
  - A `PENDING_HOLD` with status `PENDING` is shown as pending and is not spendable.
  - When the hub confirms a booking, `releasePendingHolds` marks that booking's pending hold as settled.
- **Lot lifecycle** (`src/domain/lots.ts`):
  - A lot that has been split into child lots is never counted, sorted or processed again alongside its children.
  - A collector can hand a lot to the hub only while the lot is in their custody and has no hub weight yet.
  - Only hub-verified (E2) original lots are ready to sort.
  - Hub-held or dispatched (E2/E3) lots without a processing outcome are ready for processing.

## Deployment

Deployment is configured for Netlify in `netlify.toml`:

- Build command `npm run build`, publish directory `dist`.
- A rewrite from `/*` to `/index.html` (status 200) so deep links work. `public/_redirects` carries the same SPA fallback for other static hosts.

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request. It uses Node 22 from `.nvmrc`, installs dependencies with `npm ci` when `package-lock.json` exists, and then runs `npm run lint`, `npm test` and `npm run build`.

## Current limitations

- Front-end only. There is no backend, database or authentication; anyone who opens the app can act as any role.
- All data is mock or seeded and lives in the browser. Nothing is shared between browsers or devices.
- Notifications, SMS, push and WhatsApp messages are simulated in the UI. Nothing is sent to a real phone or inbox.
