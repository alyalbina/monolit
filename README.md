# Ask.Monolit — Tier 1 + Tier 2 web application

Next.js 15 (App Router) + TypeScript. Design source of truth: the approved High-Fidelity boards in
`../` (this project's design bundle), the Screen Architecture, the Product Blueprint and DS v1.0.

## Status

Verified in this environment against Node 22 / npm 10:

| Check | Command | Result |
| --- | --- | --- |
| Types | `npm run typecheck` | pass |
| Lint | `npm run lint` | pass, 0 warnings |
| Unit | `npm test` | 4/4 pass |
| Production build | `npm run build` | pass, 15 routes |
| E2E + axe | `npm run test:e2e` | 75/75 across 5 viewports |

`npm run test:e2e` covers 1440×900, 1120×800, 834×1112, 390×844 and a 320 px reflow pass, and runs
axe on Home, a completed session and a partial session at every one of them.

### Running the tests where Chromium is pre-installed

If the environment ships its own Chromium and blocks `playwright install`, point the config at it:

```bash
PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e
```

Otherwise `npx playwright install chromium` once, and the variable is unnecessary.

Note: `next dev` and `next build` share `.next/`. Stop the dev server before building, or the running
dev server will start throwing `Cannot find module` until it is restarted.

## What is implemented

- **Foundations** — DS semantic tokens (`src/styles/tokens.css`, 55 roles × light/dark), density modes,
  self-hosted Noto Sans + Source Code Pro (`public/fonts`, variable woff2, no third-party request).
- **Shell** — canonical GL-01…GL-07 navigation, Decision 02 width formula, rail below 1280, inspector
  as split or modal depending on the remaining main width, OVR-01 search overlay (⌘/Ctrl+K).
- **Domain** — the full entity set and the run lifecycle `draft → preflight → accepted → queued →
  running → completed | partial | failed | cancel_requested | cancelled`, with `status_unknown` kept
  as a client knowledge state. Unit-tested.
- **Adapters** — typed boundary with a deterministic **Demo** adapter (`?demo=<scenario>` selects
  completed / partial / terminal_error / status_unknown / invalid_context / no_results / stale /
  insufficient_balance / payment_pending / save_failure) and a **Real** adapter that throws
  `NotContracted` until Q-01/Q-02/A-01/A-03 exist. No plausible-looking stubs.
- **RES-01** `/research/new` — composer, TMP-01…03 templates, Prepare (fills, never runs), scope/cost
  review dialog before an explicit Run.
- **RES-02** `/research/:researchId` — run selector, read-only Used snapshot, result blocks
  RB-01/02/05/06/07/09/11/12, citation → source inspector with focus return, editable Next draft,
  running / partial / failed / status-unknown states, mobile collapsing dock.

Reserved thin routes (render a boundary note, no invented data): `/research`, `/research/templates`,
`/wallet/…`, `/entity/…`, `/market`, `/saved`, `/chart/…`, `/settings/account|memory|billing`.
`/access` is a standalone shell. Implement these next from HF boards 05b/06b/06/08b/09b/10b.

## Product contracts enforced

No auto-Run after Prepare, payment or auth · idempotent submit · one active Run per research ·
`status_unknown` ≠ failed and never triggers a re-submit · `cancel_requested` ≠ cancelled, and cancel
is withheld while status is unknown · Used snapshot immutable, Next draft editable · save failure keeps
edits · return URL is never payment proof · missing data reads as unavailable, never as zero · no
hardcoded theme colours · Watch/Tier 3 stays hidden (`W_READY=false`).

## Known limitations

- Tokens in `src/styles/tokens.css` are **provisional** (MI-01): reconstructed from the DS
  specification tables. Diff against the official token package before release.
- Icons are text placeholders (MI-03) — the rail shows initials, not the official icon set.
- Capability flags in `.env.example` are all `false`: compare, files, payments and identity are
  hidden rather than faked (MI-04 / UX-02).
- Fixtures are synthetic and labelled "Demo mode · synthetic data" in the shell.
- Only Chromium was exercised here; no Firefox or WebKit run is claimed.
