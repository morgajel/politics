# Politics

Static TypeScript/Vite application for inspecting congressional roll-call records.

## Development

```sh
npm install
npm run dev
```

The current UI uses a small fixture in `src/sample-data.ts`. The production data boundary is the versioned `Snapshot` contract in `src/domain.ts`; the daily ingestion workflow should replace the fixture with normalized public JSON before deployment.

## Data rules

Congress periods are displayed as `81st Congress (1949–1951)`. Snapshots older than 24 hours are marked stale. Unknown or conflicting provider outcomes stay visible as row-level warnings and are excluded from downstream comparison calculations.


## Disclaimer

This is currently an experiment testing agentic development. Do not trust any output without independent verification.