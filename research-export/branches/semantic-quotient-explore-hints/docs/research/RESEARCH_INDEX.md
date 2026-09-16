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

When it asks **how BSFP should compute/propagate an already-defined symbolic state**, put it on the BSFP/OQS lane.

When a result changes accepted Connect4 domain semantics, route it through the relevant C4 specification rather than allowing a research branch to become authority by accumulation.
