# Connect4 SUT Status

**Updated:** 2026-09-17  
**Branch:** `solver/sut`  
**Solver family:** SUT (`S ∪ T`)  
**State:** early directional lineage; no established architecture or implementation contract yet

## Role

SUT is a first-class solver-family head retained specifically as the future exact composition lane for Isometric/IsoMax and CUDA-BSFP. Minimax/Negamax and Hybrid Confluence are historical solver lineages, not current peers.

Its working direction is to combine mature structural and terminal solving capabilities only after those parent boundaries are sufficiently explicit. The current `docs/SUT_DIRECTION_SKETCH.md` is a directional research note, not an implementation contract.

## Current implementation state

SUT currently contains no established solver kernel, shared-state contract, scheduler, confluence mechanism, or performance evidence. The branch exists to preserve an independent solver-family identity while the parent boundaries mature.

Do not infer implementation details from the name `S ∪ T`.

## Current working boundary

The existing directional note suggests:

- Isometric supplies forward structural/consequence reasoning;
- BSFP supplies backward exact terminal/fixed-point knowledge;
- a future coordination layer may detect exact overlap;
- exact solved knowledge, not heuristic similarity, must own any branch-closing splice.

This remains hypothesis-level direction. It does not authorize coupling either parent solver to a guessed SUT API.

## Immediate seam

Before implementation:

1. identify the first exact common semantic object both parent capabilities can expose without leaking private internals;
2. define exact membership/coverage semantics for terminal knowledge;
3. define what constitutes a sound structural-to-terminal splice;
4. define monotone proof-strength/result exchange, stale-information soundness, and safe supersession/cancellation using the useful questions preserved from historical Hybrid Confluence;
5. qualify the smallest bounded composition before concurrency or performance work.

## Historical Hybrid Confluence input

The retired Hybrid Confluence lineage did not establish a mature kernel, but it identified useful composition questions that now belong to SUT's design surface:

- exact shared semantic identity;
- monotone proof/result-strength ordering;
- sound use of stale exact information;
- safe close/supersede/cancel conditions;
- bounded falsification controls for the weld.

These are inputs, not a second composition architecture.

## Research ownership

This branch does not own research. SUT-specific research questions, hypotheses, weld candidates, negative results, and research evidence belong on `research/semantic-quotient`; this branch owns SUT implementation and implementation qualification.

## Routing

- Shared product/domain facts -> `main`.
- All research -> `research/semantic-quotient`.
- SUT-specific contracts/implementation/evidence -> this branch.
- Isometric and CUDA-BSFP remain independent owners of their own internals.

See `README.md`, `docs/SUT_DIRECTION_SKETCH.md`, and the current repository topology decision on `main`.
