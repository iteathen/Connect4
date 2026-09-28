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

Latest Phase-2 local experiment (2026-09-28):
[packed recursive move rows](PACKED_MOVE_ORDER_RESULT.md) did not qualify:
cycles +0.302%, 95% interval [-0.660%, +1.264%], 16/16 exact.
Selected experimental solver remains `f2d56c2788ef3a4c49fc4bef9d447c5be3184059`.
The concurrent packed-row branch is a separate realization; do not conflate its
source with this fixed-SHA comparison or silently repeat the same mechanism.

Latest local official-hard follow-up:
[selected-production local result](SELECTED_PRODUCTION_LOCAL_HARD_RESULT.md).
Both arms timed out in all eight planned samples; results are explicitly
**suspicious and require investigation**. The official-hard promotion gate
remains unmet. Earlier completed-control results remain separate evidence.

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
