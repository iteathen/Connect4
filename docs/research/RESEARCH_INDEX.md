# Connect4 research index

This file is the routing map for the active Connect4 research corpus.

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
