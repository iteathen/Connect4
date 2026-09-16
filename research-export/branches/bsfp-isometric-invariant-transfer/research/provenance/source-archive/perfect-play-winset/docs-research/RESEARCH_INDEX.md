# Connect4 research index

This file is the routing map for the active Connect4 research corpus.

Continuation context: [conversation summary](2026-09-12-frontier-conversation-summary.md)
and [handoff prompt](2026-09-12-frontier-optimization-handoff.md).

Latest source-history audit and retained hot-path change: [transition-state read commit audit](2026-09-12-transition-state-read-commit-audit.md).
The audit verifies `50aac925` and `5ec678f6` against the governing agent/spec set.
The fused state-owner read preserves exact identity/proof semantics and all depth-8
counters; the hosted timing difference is noise-scale, not a speedup claim. The
audit also records and corrects the current-state documentation lag that followed
the source commit.

Latest integrated result: [native identity integration and corrected attribution](2026-09-12-native-key-integration.md),
smaller state payload, flat depth-8 elapsed time, modestly lower measured CPU and
74 controls plus six bounded campaigns passing. Earlier regressions are preserved.

Latest representation experiment: [native two-word relational identity](2026-09-12-native-relational-key.md),
exact local packing and 18.0% faster isolated native lookup; production integration remains.

Latest external benchmark: [Pons protocol, one 60-second W/D/L batch](2026-09-12-pons-protocol-benchmark.md),
137 correct completed positions, explicit partial-set coverage and fresh setup costs.

Latest optimization: [ranked depth-21 hot-loop pass](2026-09-12-depth21-ranked-optimization.md),
five qualified units, 52.3% more calls in the fixed profile window, and an
identical-counter completed depth-8 comparison. Depth 21 remains incomplete.

Latest bounded resource result: [board/depth reservations and timeout-safe profiling](2026-09-12-board-depth-reservation.md),
with the resized depth-21 timeout and a preserved 55-second source-mapped window.

Latest requested measurement: [depth-21 CPU profile](evidence/2026-09-12-depth21-line-cpu/line-cpu.md),
stopped by reserved state capacity after 2.268 seconds; 60-second timeout retained.

Latest local identity optimization: [changed-slot class fingerprint](2026-09-12-changed-slot-class-hash.md),
removing the second tuple traversal with no additional storage, bounded qualification and source-mapped CPU evidence.

Latest identity investigation: [relational positions and direct addressing](2026-09-12-relational-address-investigation.md),
with actual depth-8 key witnesses, radix layout costs and the changed-slot identity-reuse candidate.

Latest representation result: [compact chunk index](2026-09-12-compact-chunk-index.md),
preserving full capacity while saving 5 MiB at the measured reservation, with final bounded qualification.

Latest measurement: [chunk probe distribution and accessed footprint](2026-09-12-chunk-probe-distribution.md),
using isolated counters on the normal depth-8 search, with production source unchanged.

Latest lookup experiments: [chunk transformation reuse and cheaper addressing](2026-09-12-chunk-lookup-experiments.md),
including two rejected cache layouts and the qualified three-multiplication hash.

Latest descriptor optimization: [composed semantic hash reuse](2026-09-12-state-hash-reuse.md),
with the rejected writer experiment, exact memory accounting and bounded timing evidence.

Latest local forward-lane optimization: [ranked probe/frontier refinement](2026-09-12-ranked-probe-refinement.md),
with exactness controls, alternating bounded timings and a frozen-source CPU report.

## Cross-solver semantic-state research

**Branch:** `research/semantic-quotient`

Owns new work about the smallest exact future-behavior state shared in principle by multiple solving methods:

- behavioral equivalence / quotienting;
- minimum-description state experiments;
- identified-line and win-space equivalence;
- support/event sufficiency;
- residual-class synthesis;
- flat transition automata;
- cross-solver falsifiers.

Start with:

- `SEMANTIC_QUOTIENT_RESEARCH.md`
- `docs/research/2026-09-10-minimum-description-semantic-quotient.md`

## Frontier-native exact forward solver research

- [Direct semantic-edge reuse eliminates repeated hash work](2026-09-12-direct-semantic-edge-reuse.md):
  enables the existing numeric transition table in active workers/harness;
  91.18% repeated transitions bypass interning, 8.40 to 2.22 seconds in paired
  depth-8 evidence, with unchanged search/proof work and 7 MiB reserved cost.

- [Preallocated recursive search storage](2026-09-12-preallocated-search-storage.md):
  initialization reservation/sealing, fixed descriptor scratch, capacity failure
  controls and zero growth during depth-8 search; memory/timing tradeoff recorded.

- [Ranked hot-loop operation removal](2026-09-12-ranked-hot-loop-optimization.md):
  first four sampled locations, exact chunk key reuse, TT populated-prefix
  termination and singleton-free terminal scan elimination; 18.6% observed
  depth-8 time reduction in alternating cold runs with unchanged proof work.

- [CPU timing mapped to frozen source lines](2026-09-12-line-cpu-profiling.md):
  reusable bounded profiling runner; 537 mapped locations, raw sample counts,
  explicit CPU estimates, source snapshots/hashes and exact counter agreement.

- [Direct canonical residual reads](2026-09-12-direct-residual-read.md):
  removes the mover input copy and duplicate private-cache checks; 23 controls
  and four bounded campaigns passed, with unchanged depth-8 search counters.
  The 10.06-second measurement establishes no speedup over 10.04 seconds.

- [Depth-8 normal Negamax operation timings](evidence/2026-09-12-normal-negamax-depth8-profile/operations.md):
  same-bound CPU sample with exact counter agreement, per-method self/inclusive
  estimates and retained raw profile; 60-second timeout, no full-root solve.

- [Current hot-path method CPU assessment](2026-09-12-hot-method-cpu-assessment.md):
  per-method optimization assessment, remaining transformations and local CPU samples.

- [Relational duplication and neutral capacity](2026-09-12-relational-duplication-review.md):
  actual residual-path audit, bounded equivalent-choice census and proof-reuse evidence.

- [Derived state-hash retention](2026-09-12-state-retention-review.md):
  qualified memory reduction and immediate-terminal scan short-circuit;
  isolated hash-retention timing tradeoff, unchanged exact search policy.

- [Original engine: structural lessons and bounded adaptation](2026-09-12-original-engine-structural-lessons.md):
  actual source review and original-executable comparison with singleton masks.

- [CPC mapping derivation and unresolved terminal interpretation](2026-09-12-full-engine-sanity-audit.md#cpc-address-parity-reassessment):
  exhaustive support/address arithmetic on ten variable-dimension profiles;
  no production terminal replacement yet.

- [Guarded incremental response closure and proof reuse](2026-09-12-incremental-response-closure.md):
  integrated bounded profile, full premises, independent qualification and measured limits.

Current investigation: [search volume and structural closure reassessment](2026-09-12-search-volume-structural-review.md).
The admitted root timed out. Structural closure coverage and repeated proof work
take priority; completed-task expansion counts omit running workers.

**Branch:** `research/frontier-negamax-conformance`

Owns the exact forward W/D/L solver/control lane that consumes the accepted support/residual quotient plus frontier/CPC/WSL/NDC facts and resolves remaining decisions with Negamax. This is not authority for redefining the underlying game or structural mathematics.

Current work includes:

- exact semantic shared-proof identity and generation-safe replacement;
- dynamic live-line frontier ordering and exact local frontier bounds;
- forced-response macro normalization;
- dependency-aware sibling scouts with incremental completion and detached obsolete work;
- Branch Manager autonomous bounded exploration;
- standard-7x6 proof-entry, descriptor-term, worker-memory and resource-lifetime qualification.

Start with:

- `STATUS.md`
- `next_step.yaml`
- `docs/specs/C4-0010-quotient-native-negamax-v1.md`
- `docs/research/2026-09-12-transition-state-read-commit-audit.md` — bounded
  compliance audit of the latest two source-history commits and current next seam.
- `docs/research/2026-09-12-full-engine-sanity-audit.md` — completed active-path
  correctness, ownership and lifecycle audit; one integrated root admitted after
  exact-source bounded qualification. Standard-root performance remains unproven.
- `docs/research/2026-09-12-frontier-audit-coverage.json` — 44 reviewed source files,
  five workflows, exact blob identities and qualification evidence.
- `docs/research/2026-09-12-hot-loop-eval-terminal-report.md` — move evaluation,
  exact terminal rules and high-level operations across the active hot loop.
- `docs/research/2026-09-12-negamax-methods-local-review.md` — actual enabled
  Negamax methods, local shallow measurements and initial work-supply limitation.
- `docs/research/2026-09-11-7x6-replacement-term-lifetime.md`
- `docs/research/2026-09-11-7x6-worker-descriptor-retention.md`
- `docs/research/2026-09-11-7x6-proof-term-lifetime.md`
- `docs/research/2026-09-11-worker-residual-descriptor-ownership.md`

The current standard-7x6 measurement is intentionally evidence-driven: do not duplicate an active root run or turn an observed capacity/lifetime symptom into a blind capacity increase.

## Minimax / alpha-beta research

**Branch:** `solver/minimax-alpha-beta`  
**Consolidated head when this index was created:** `87f537f425c03b12c6bff0141ff0b0c6b3810b5e`

Owns actual search prototypes/evidence, including:

- fixed-width exact solver and NPS work;
- TT geometry/capacity/shared-TT experiments;
- multicore/YBWC work;
- decision-state admission and rank banking;
- compact exact search keys;
- residual automorphisms;
- win-space/native-winspace search;
- structural quotient experiments;
- evaluator/proof-order experiments;
- forced macro/implication work;
- negative controls and candidate ledgers.

Start with:

- `MINIMAX_BRANCH.md`
- `reference/research-prototypes/MINIMAX_INDEX.md`
- `docs/research/2026-09-10-minimax-branch-lineage-audit.md`

Do not copy the later BSFP solving recurrence into this line merely because the state mathematics overlaps.

## CUDA-BSFP production-adjacent lane

**Branch:** `feature/cuda-bsfp`

Owns maintained/production-adjacent BSFP implementation and its qualification state. Relevant shared structural authority includes C4-0006 Control Parity / Winspace and the WSL-625 residual vocabulary.

This is not the umbrella research branch.

## CUDA-BSFP / OQS representation research

**Source branch:** `research/zdd-transfer-20260910`  
**Head used to create the semantic-quotient branch:** `42e1a1ca90905bb3edec8ad4a2e49c99ef635651`

Owns the newest completed research on:

- identified 69-line hit quotient;
- product-order symbolic compression;
- ZDD/BDD positive and negative evidence;
- optimized line-first separator;
- hidden-history census;
- transition-stable residual classes;
- pointer-free flat transfer tables;
- widened R5 qualification;
- incremental OQS R6;
- CUDA OQS cofactor qualification.

Key records:

- `docs/research/2026-09-10-cuda-bsfp-research-synthesis.md`
- `docs/research/2026-09-10-identified-winline-quotient-exact-results.md`
- `docs/research/2026-09-10-separator-history-census.md`
- `docs/research/2026-09-10-cuda-bsfp-flat-transfer-r4.md`
- `docs/research/2026-09-10-r6-incremental-oqs-results.md`
- `docs/research/2026-09-11-oqs-cuda-cofactor-qualification.md`

The semantic-quotient branch descends from this line; those files are therefore present here as historical source material. Future solver-neutral quotient work should continue on `research/semantic-quotient` rather than extending the old `zdd-transfer` name indefinitely.

## Historical research refs

Older refs remain useful provenance/evidence but should not be treated as active continuity branches merely because they still exist. Examples include:

- `research/exact-solver-perf-checkpoint-2026-09-08`
- `research/exact-solver-rethink-controls-2026-09-09`
- `research/forced-macro-implication-2026-09-09`
- `research/residual-automorphisms-2026-09-09`
- `research/low-confidence-survival-2026-09-09`
- `research/identified-winline-quotient-*`
- `research/winline-*`

Their relevant minimax history has been consolidated into `solver/minimax-alpha-beta`; their relevant later BSFP/OQS history has been superseded by the active BSFP/OQS lines above.

## Preservation caveat: historical local packets

Not every historical research execution was fully transported into Git. The minimax preservation record explicitly notes several large local packets preserved only by durable reports, hashes and selected compact evidence.

See on `solver/minimax-alpha-beta`:

`docs/research/evidence/2026-09-09-local-research-artifact-index.md`

Known examples include the original complete packets for:

- exact-key compression;
- organic remaining-requirement / neutral-move experiments;
- coarse shared-proof experiments.

Do not claim those original full packets are present merely because their conclusions or later descendants are preserved. If copies are recovered, import them as historical evidence without rewriting the original reports.

## Routing rule

When a new experiment asks **what the exact game state is**, put the research on `research/semantic-quotient`.

When it asks **how alpha-beta should search an already-defined state**, put it on `solver/minimax-alpha-beta`.

When it asks **how the frontier-native exact forward solver should consume an already-defined state and exact structural facts**, put it on `research/frontier-negamax-conformance`.

When it asks **how BSFP should compute/propagate an already-defined symbolic state**, put it on the BSFP/OQS lane.

When a result changes accepted Connect4 domain semantics, route it through the relevant C4 specification rather than allowing a research branch to become authority by accumulation.

- [2026-09-12 integrated identity ownership](2026-09-12-integrated-identity-ownership.md) — clears proof-handle validation by paired A/B and promotes direct semantic hashing from canonical packed residual storage; records the compute/memory-synergy follow-up.
