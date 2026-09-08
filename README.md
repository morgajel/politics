# Politics

Static TypeScript/Vite application for inspecting congressional roll-call records.

## Development

```sh
npm install
npm run dev
```

## Netlify previews

Netlify builds this project with `npm run build` and publishes `dist`. Pull requests receive public Deploy Preview URLs, while branch builds receive branch preview URLs. Enable Netlify's `Delete deploys when a pull request is closed` setting to clean up preview deploys automatically.

To test the production artifact locally:

```sh
npm run build
npm run preview
```

The preview server is available at `http://localhost:4173`. The Netlify redirect rule preserves direct navigation to future client-side routes.

The UI discovers a member's Congress history from the public `congress-legislators` current and historical APIs, caching the combined response in browser storage for 24 hours. It fetches the selected Congress's vote and roll-call records directly from Voteview when a lookup is submitted, then maps them into the versioned `Snapshot` contract in `src/domain.ts` for normalization and display.

## Data rules

Congress periods are displayed as `81st Congress (1949–1951)`. Snapshots older than 24 hours are marked stale. Unknown or conflicting provider outcomes stay visible as row-level warnings and are excluded from downstream comparison calculations.


## Disclaimer

This is currently an experiment testing agentic development. Do not trust any output without independent verification.