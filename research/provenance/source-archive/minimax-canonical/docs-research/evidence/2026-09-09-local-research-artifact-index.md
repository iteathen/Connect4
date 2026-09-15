# Local research artifact index

**Date:** 2026-09-09  
**Purpose:** preserve exact artifact identities and headline evidence from the owner-authorized local research runs that produced the current consolidation. Large ZIP/base64 transport is intentionally not committed; repository preservation uses UTF-8 notes and compact evidence.

## Historical rethink

- `C4-all-ideas-integration-rethink.md`
  - SHA-256: `73ecd5fa2bdd6c7eee8c4739563d27ca54d5da4c976faac978adacdbaf5384d0`
- `C4-rethink-research.zip`
  - SHA-256: `390d494477fc5fa5041deb6c5893d8fe702107985400bd3654e71765a6b83b8e`

The complete conceptual disposition is consolidated in `docs/research/2026-09-09-organic-optimization-consolidation.md`.

## Exact-key compression

- report SHA-256: `c9445c1c667c6af98f58a47c7abf237ac3599ab73f63b3e76ce6732cc4070470`
- summary SHA-256: `781687c5e473d7431e8e3399a1b218d3c7a8764ca02c025b561e4ac96451ccd5`
- source/evidence bundle SHA-256: `1e1b8146bdf44a58a410b3f1747ba0c3f8607f681cd738981d739ccc0f174f61`

Headline evidence:

- full-key research TT: 14 bytes/entry;
- fixed-format exact residual-key TT: 10 bytes/entry;
- storage reduction: 28.57%;
- `41267575`, 1 worker, 512K entries: 5,854,083 nodes in both baseline and fixed-format modes;
- representative six-repeat medians: ~1.312 s baseline vs ~1.157 s fixed-format in that one-worker 512K batch;
- `663152175`, 4 workers, 256K entries: strongest repeated comparison effectively tied.

Detailed preserved report: `docs/research/2026-09-09-exact-key-compression-local-preservation.md`.

## Organic remaining-requirement / neutral-move experiment

- report SHA-256: `4fd4bb9705d0e01dae7cb37992d627c583f18117f4708a57a873a3bcbfcf5026`
- summary SHA-256: `7f491b2daa4a27034d9aba1014586d69af3f69a0fecca9b04cbcdfb0b79cb86a`
- source/evidence bundle SHA-256: `3a7eccf3a24ba512e272791980d69222a10d3582245a8b0c5c1edd11a33be677`

Headline evidence:

- exhaustive 4x3 connect-three check covered all 4,659 reachable nonterminal states;
- full remaining-game signatures produced 3,670 classes, removing 989 historical distinctions (~21.2%) in that small variant;
- ordinary 80-position 7x6 holdout did not reduce nodes and compilation overhead made unconditional use unattractive;
- 24 structurally eligible 7x6 holdout positions: 923 -> 694 nodes (~24.8% reduction), but searches were too small for setup cost to pay back;
- 54-position structural stress cohort, 128K TT: baseline 112,174 nodes / ~17.918 ms compile+search vs integrated structural-mask kernel 76,853 nodes / ~12.784 ms;
- stress-cohort effect: ~31.5% fewer nodes and ~28.7% less compile+search time; including measured table clear reduced the timing advantage to ~17.5%.

Interpretation: use structure to remove distinctions, then retain the low-level kernel; do not blindly replace the kernel with a heavier abstraction interpreter.

## Coarse shared-proof experiment

- report SHA-256: `abdf812ca0b37db0371094f7264f8322d326bc3ad00f271ebfeb92abcf161fc0`
- summary SHA-256: `6fcaf2a4fd72cb75d80ef7650d86a4280b33e9f8411af712b71e6ad3035a2e7c`
- source/evidence bundle SHA-256: `3bfcac82e3aae863c4e2dced05e426e88dea42656c7f8a8c368411e82f90bc42`

Headline evidence:

- negamax worker kernel retained; proof coordination remained above coarse worker tasks;
- `41267575`, 4 workers, 512K TT, one tuned six-repeat comparison:
  - flat: ~1.012 s, ~13.059M nodes, ~5,441 dispatches;
  - shared proof graph: ~0.805 s, ~10.660M nodes, ~2,530 dispatches;
  - approximately 20.5% lower median time, 18.4% fewer nodes, 53.5% fewer dispatches in that batch;
- completed-proof reuse captured a substantial fraction of the benefit and could beat full in-flight graph joining in some compact-key comparisons;
- duplicate-heavy mechanism tests showed strong joining value;
- unrelated-request controls showed essentially no graph benefit;
- smaller established position did not show a stable cross-session graph timing win.

Interpretation: completed coarse proof knowledge has earned further consideration; universal in-flight joining has not earned mandatory status.

## Current win-space concept

The newest candidate is preserved separately in `docs/research/2026-09-09-win-space-search-representation.md`.

The central hypothesis is that recursive exact negamax may be able to search:

```text
remaining winning requirements for both players
+ column frontiers/heights
+ side to move
```

rather than carrying every historical colored-board distinction as the primary search identity. Legal moves still define expansion. Draw is not constructed as an independent goal space: if both players' surviving winning requirements are exhausted, the remaining continuation is exactly drawn.

## Preservation limits

The large local research bundles contain additional raw JSONL/TSV and prototype sources. Their exact hashes are recorded above. They are intentionally not transported as large base64 blobs. The repository notes preserve the conclusions, qualification scope, adverse results, and exact bundle identities. Future selection/testing should treat the large local bundles as raw evidence when available, and these repository notes as the durable research record.
