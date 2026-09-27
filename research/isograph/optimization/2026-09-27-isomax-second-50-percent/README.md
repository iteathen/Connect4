# IsoMax second cumulative 50% campaign — 2026-09-27

Owner directive: after the current Phase-1 optimization campaign is qualified,
target **another cumulative 50% improvement** from the qualified Phase-1 winner.

This is not restricted to hot-loop micro-optimization.

Accepted mechanisms include, without preference:
- faster search;
- fewer nodes;
- improved ordering/pruning;
- optimized primitive operations;
- structural simplification/compression/quotienting;
- evaluator/CPC/cofactor/cache/TT changes;
- parallel-work efficiency;
- representation redesign;
- algorithm redesign;
- combinations of the above.

The research question is total exact-solve effectiveness, not any one local
metric.

## Qualification discipline

- Freeze the exact qualified Phase-1 SHA before Phase 2 gets a permanent
  denominator.
- Exact W/D/L and witness correctness remain non-negotiable.
- If search work changes, report total cycles/wall plus nodes and relevant
  counters; cycles/node alone is not an acceptance metric.
- Re-anchor cumulative gains with direct matched whole-solve comparisons.
- Preserve negative results and falsifiers.
- Preserve the strict no-solved-answer-smuggling provenance boundary.

## Durability rule

Because UI sessions repeatedly desynchronize, research state must be committed
frequently. Record plans, exact source SHAs, run/artifact IDs, results,
dispositions and new hypotheses in the repository as the work progresses.
Do not allow chat state to be the sole record of a material result.

## Phase-2 target

    exact whole-solve cost <= 0.50 * qualified Phase-1 whole-solve baseline

The target may be reached by reducing per-node cost, reducing the number of
nodes, or changing the solver structure/algorithm so the exact result requires
less total work.
