# IsoMax PR review and branch retirement — 2026-09-26

Owner requested review, qualified merges, then stale-branch cleanup. IsoMax is
hosted in Connect4 and implemented through JSMinSys. BSFP and unrelated agent
governance PRs were excluded. Historical research outcomes were not rewritten.

## Integrated

- JSMinSys [#49](https://github.com/iteathen/JSMinSys/pull/49): C1 closure
  absorption merged as `d41bd3d3042024b0c5a5a9c316d89be2b3a48fda`. Fresh159 tests,
  catalog/geometry checks and post-merge CI pass. Merged tree matches reviewed
  head `0d5e72d2e6931c8dc0d0c6c923d6cd59bb8a9bb1`. The configured owner exception
  was used after independent review and explicit owner merge authorization;
  no protections were changed and no separate GitHub approver was impersonated.
- Connect4 [#165](https://github.com/iteathen/Connect4/pull/165): benchmark evidence
  plus overwrite guard merged into `work/isomax-jsminsys-boundary-cleanup` as
  `7db9b5c3d31d86e7cfee84d02c551a96c892d0cb`. The raw results were unchanged.
  Independent bounded checks, all19 artifact hashes and post-merge CI pass.

The Connect4 consumer still pins JSMinSys04d3749; this pass does not claim that
the library's newly merged C1 is already selected by that consumer. Dependency
promotion belongs with the next qualified consumer integration.

## Held open

- Connect4 #163: active AGENT_LOCAL/STATUS still describe superseded Surplus /
  Branch Manager requirements and an old library pin, contradicting the actual
  Lazy-SMP-only source and accepted decision. Correct that routing before promotion.
- JSMinSys #33: useful independently tested dense-cofactor candidate, but its
  active dense body would bypass newly merged C1. Compose and qualify the actual
  combined target; separate A/B results do not qualify their composition.
- JSMinSys #41/#47: unique research instrumentation still useful for reconciliation
  and route refinement.
- JSMinSys #45/#46: catalog source hashes are stale. Qualification is incomplete;
  no measured performance rejection is inferred from setup failures.

## Retired without merging

Closed Connect4 #113, #134, #146, #161 and #164 as superseded, preserving exact
source history first. Closed JSMinSys #34–40, #42–44 and #48 as completed or
rejected under their recorded scope. Detailed findings and evidence are in:

- [Active PR review](ACTIVE_PR_REVIEW.md)
- [Historical scheduler review](HISTORICAL_PR_REVIEW.md)
- [Library experiment review](LIBRARY_EXPERIMENT_REVIEW.md)
- [Library dispositions](library-dispositions.json)

All18 reviewed source heads have remote annotated archive tags named
`archive/pr-N-20260926` in their owning repository. These preserve executable
experiments, qualification history and exact revision identity without leaving
them as active branches or promoting their semantics.

Sixteen branches were explicitly deleted with atomic, exact-head-lease pushes;
the two merged source branches were already removed by repository auto-deletion.
Before deletion, archive tag resolution was checked; open PR dependencies were
excluded; after deletion, unrelated branch heads were verified unchanged.
Local working trees and unrelated unique experimental branches were preserved.

[Connect4 cleanup](connect4-cleanup.json) and [JSMinSys cleanup](jsminsys-cleanup.json)
record exact heads, archive identities, dispositions and remaining PRs. Research
and durable solver branches were not deleted. No rejected implementation was
merged merely to make branch deletion possible.

## Evidence limits

Reviews checked exact changes and reused valid historical measurements. They did
not rerun long benchmarks for rejected experiments. Threshold-campaign machine
outputs are preserved in [threshold-raw-json.json](threshold-raw-json.json), with
run IDs, source-line/label/checkout context and full-log hash anchors. These are
extracted observations, not new qualification runs. Fixed-time unresolved probes
are not completion-cost evidence. Original reports retain their contextual limits.

The main new repair is only the benchmark evidence-overwrite guard. No solver
semantics, timeout, memory limit, branch protection, or BSFP implementation changed.
