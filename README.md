# Jupiter Friction Radar

A small Jupiter Developer Platform experiment built for the Superteam Earn / Jupiter "Not Your Regular Bounty" track.

The goal is not to be a flashy trading app. The goal is to generate high-signal developer-experience evidence: onboarding friction, docs gaps, API behavior, CLI/AI-stack feedback, and concrete recommendations Jupiter can act on.

## What it does

`jupiter-friction-radar` shells out to the Jupiter CLI, collects live token-search data plus a SOL→USDC quote, and generates a markdown snapshot that highlights rough token risk/friction signals such as verification, organic score, liquidity, and holder count.

## Setup

```bash
npm install
npm i -g @jup-ag/cli
export JUPITER_API_KEY="your_key_here"
jup config set --api-key "$JUPITER_API_KEY" --output json
```

## Run

```bash
node src/cli.js SOL artifacts/friction-radar.md
```

## Test

```bash
npm test
```

## Files

- `src/cli.js` — CLI entrypoint that calls Jupiter CLI and writes the report.
- `src/radar.js` — token scoring and markdown generation.
- `src/report.js` — DX finding helpers.
- `DX-REPORT.md` — developer-experience report for the bounty.
- `artifacts/friction-radar.md` — generated sample output from live Jupiter data.

## Revenue target

Primary target: one of the bounty's Best DX Report prizes.
