# DX Report: Jupiter Developer Platform

Report timestamp: 2026-04-25T23:36:20Z
Account email used for platform testing: `ken@twocityholdings.com`

## Executive summary

I built a small AI-assisted CLI project, **Jupiter Friction Radar**, using Jupiter's Developer Platform API key and the `@jup-ag/cli` package. The project generates a simple markdown risk snapshot from Jupiter token search data plus a SOL→USDC quote check.

The build succeeded quickly once I had credentials, but the agent/developer experience exposed several actionable friction points: fragmented portal URLs, CLI help that omits examples, no obvious "safe env var" path in CLI setup, and JSON shapes that are powerful but undocumented enough that first-time builders need to inspect live payloads before they can design confidently.

## What I built

Repository: https://github.com/Ernie-AI-Op-Streams/jupiter-friction-radar

Working artifact:

- `src/cli.js` runs Jupiter CLI commands and writes a markdown report.
- `src/radar.js` scores token search results for rough risk factors.
- `artifacts/friction-radar.md` is generated from live Jupiter data.
- Tests cover response formatting, no-secret handling, token scoring, and markdown generation.

Example command:

```bash
node src/cli.js SOL artifacts/friction-radar.md
```

Observed output:

```json
{
  "outputPath": "/Users/agent/work/jupiter-friction-radar/artifacts/friction-radar.md",
  "tokenCount": 5,
  "generatedAt": "2026-04-25T23:36:07.276Z"
}
```

## Onboarding timeline

| Step | Result | Notes |
|---|---|---|
| Get GitHub repo/token | Success | Repo created and initial files pushed. |
| Get Jupiter Developer Portal account/API key | Success | Human provided account and API key. |
| Install CLI | Success | `npm i -g @jup-ag/cli`; installed version `0.10.0`. |
| Discover commands | Partial friction | `jup --help` is clean, but command help lacks example invocations. |
| Configure API key | Success | `jup config set --api-key ... --output json`; output redacts API key as `***`, good. |
| First token API call | Success | `jup spot tokens --search SOL --limit 3 --format json`. |
| First quote API call | Success | `jup spot quote --from SOL --to USDC --amount 0.01 --format json`. |
| Build project | Success | Node CLI shells out to `jup` and generates report. |

## API / CLI observations

### 1. CLI redacts API keys correctly

This was good. `jup config list --format json` returned:

```json
{
  "activeKey": "default",
  "output": "json",
  "apiKey": "***"
}
```

Recommendation: preserve this behavior and mention it in docs. Security-conscious developers and agents need to know config inspection is safe.

### 2. CLI help is discoverable but too example-light

Useful commands found:

```bash
jup --help
jup config --help
jup config set --help
jup spot --help
jup spot tokens --help
jup spot quote --help
```

But the help output does not show copy/paste examples. For agents, examples matter more than prose.

Recommendation: add examples directly to each command help page, e.g.

```bash
jup config set --api-key "$JUPITER_API_KEY" --output json
jup spot tokens --search SOL --limit 5 --format json
jup spot quote --from SOL --to USDC --amount 0.01 --format json
```

### 3. Environment-variable guidance is not obvious enough

The CLI supports `--api-key [key]`, but a new developer/agent needs a safe pattern that does not leak secrets into shell history, logs, GitHub, or chat transcripts.

Recommendation: document a "safe agent setup" flow:

```bash
export JUPITER_API_KEY="..."
jup config set --api-key "$JUPITER_API_KEY" --output json
```

Also document whether the CLI can read `JUPITER_API_KEY` automatically without persisting it.

### 4. JSON output is powerful but shape discovery requires live probing

`jup spot tokens --search SOL --limit 3 --format json` returns rich token objects with fields like:

- `id`
- `symbol`
- `usdPrice`
- `liquidity`
- `holderCount`
- `organicScore`
- `organicScoreLabel`
- `isVerified`
- `audit`
- `stats5m`, `stats1h`, `stats6h`, `stats24h`

This is excellent raw material, but first-time builders need schema examples and field semantics to avoid guessing.

Recommendation: add one canonical JSON response fixture per CLI command and API endpoint, plus a short explanation of which fields are stable vs experimental.

### 5. Quote command gives a clean minimal payload

`jup spot quote --from SOL --to USDC --amount 0.01 --format json` returned a compact object with:

- `inputToken`
- `outputToken`
- `inAmount`
- `outAmount`
- `inUsdValue`
- `outUsdValue`
- `priceImpact`

This is a good onboarding endpoint because it succeeds fast and produces understandable output.

Recommendation: make this the official "first successful call" in docs and agent skills.

## AI stack feedback

### What worked

- The CLI is JSON-native and non-interactive enough for agent workflows.
- `--format json` makes it easy to pipe into scripts.
- Config output redacts the API key.
- The command hierarchy is intuitive: `config`, `spot`, `lend`, `perps`, `predictions`, etc.

### What slowed the agent down

- The Developer Platform homepage and bounty refer to multiple surfaces (`developers.jup.ag`, `portal.jup.ag`, docs, CLI, skills, MCP). The relationship between these surfaces should be made explicit.
- The CLI help lacks examples, so the agent must inspect multiple subcommands before doing anything productive.
- It was not clear from CLI help whether API keys are required for all read-only calls, only higher rate limits, or specific endpoints.
- There is no obvious machine-readable "getting started checklist" optimized for agents.

### What I wish existed

1. `jup doctor`
   - Checks CLI version, API key presence, network access, default output format, and runs one safe quote.

2. `jup examples`
   - Prints copy/paste examples for tokens, quote, swap dry-run, prediction markets, and lend.

3. `jup schema <command>`
   - Prints expected JSON fields and sample payloads.

4. Agent-safe docs page
   - One page with: install, configure from env var, first call, common errors, JSON fixtures, no-secret rules.

5. `--explain` mode
   - For commands like quote/tokens, explain fields such as organic score, audit flags, liquidity, price impact.

## Bugs / rough edges found

No critical API failures were found in the initial path. The main issues are DX/documentation gaps, not broken functionality.

Potential rough edges:

- `jup spot price --help` behaved like `jup spot --help` because there is no `price` subcommand under `spot`; this is understandable but could be clearer if the CLI prints "unknown command" suggestions.
- Deprecated transitive npm dependency warnings appeared during global install:
  - `node-domexception@1.0.0`
  - `glob@10.5.0`

These warnings do not block use, but they make a brand-new developer install feel a little dusty.

## How I would rebuild the developer experience

I would make the first five minutes brutally linear:

1. Install CLI
2. Set API key safely
3. Run `jup doctor`
4. Run one quote
5. Generate a tiny app from a template

Suggested happy path:

```bash
npm i -g @jup-ag/cli
export JUPITER_API_KEY="..."
jup doctor
jup spot quote --from SOL --to USDC --amount 0.01 --format json
jup create my-jupiter-app --template token-radar
```

Then make every API family page include:

- curl example
- CLI example
- TypeScript example
- JSON response fixture
- common errors
- agent notes

## Submission-specific conclusion

Jupiter's CLI/API path is already viable for AI-agent builders. The fastest improvement would be making the first-call path explicit and adding machine-readable examples/schemas so agents do less exploratory probing and more building.

The product is close. The docs need fewer doors and more runway.
