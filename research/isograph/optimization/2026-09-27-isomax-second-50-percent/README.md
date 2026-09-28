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

Selected experimental continuation: `be7c2887defcefb37080fa61de7ce1dc38dc2990`,
the [qualified PR115 packed-row realization](PACKED_MOVE_ROWS_PR115_RESULT.md)
with the source-neutral K/STOP_TEST accounting repair. The earlier
[different packed-row realization](PACKED_MOVE_ORDER_RESULT.md) remains rejected.

Latest local experiment: [CPC six-state proof mask](CPC_PROOF_MASK_RESULT.md),
cycles +0.832%,95% interval[-1.228%,+2.892%],16/16 exact. No performance
qualification or baseline change. Six-state semantics remain valid.
Next planned operation class: [private epoch prefix](PRIVATE_EPOCH_PREFIX_PLAN.md).

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

Standard-input follow-up: [CPC proof-mask Fhourstones comparison](CPC_PROOF_MASK_RESULT.md#owner-requested-standard-fhourstones-follow-up).
Both revisions solved1/4 and timed out3/4 under the unchanged120-second limit;
raw and summarized evidence is published. No selected-baseline change.

Next prepared campaign: [shared-TT capacity, affinity and L2-sized private caches](SHARED_TT_L2_EXPERIMENT_PLAN.md).
Declarative configurations: [TT_L2_MATRIX.json](TT_L2_MATRIX.json).
First packet is the requested16x shared-TT empty-board attempt; not yet run.
Pinning is an implementation prerequisite for the later private-cache stage.
