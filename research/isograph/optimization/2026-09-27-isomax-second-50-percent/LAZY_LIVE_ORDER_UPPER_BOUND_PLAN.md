# IsoMax Phase-2 plan — exact lazy live-line ordering by static upper bound

Date: 2026-09-28
Status: planned experiment from selected solver baseline `81c9475e94607cff9e777776157b82b3466c385b`.

## Trigger

The Phase-2 baseline search census found that eager live-line ordering materialized
5,478,527 sibling scores that were never consumed on exact control `353335714`,
37.755% of all scored siblings.

The current live-line order is valuable:
- 63.962% of alpha child cutoffs occurred on the first ordered child;
- historical two-pass best-first variants regressed because they changed the
  work economics and/or recomputed transitions.

The cache campaign has now qualified:
- compact shared exact identity;
- compact private exact/bound identity.

The latest row-carried shared-publication micro-optimization was rejected.
The measured unconsumed move-order work is therefore the next larger unresolved
operation class.

## Exact structural observation

For player p and landing cell x, the current score is:

```
score(p,x) = popcount(live[p] AND through[x])
```

Prepared geometry defines:

```
maxScore[x] = popcount(through[x])
```

Because `live[p]` is always a subset of the complete line set:

```
score(p,x) <= maxScore[x]
```

This gives a cold/precomputed exact upper bound on every dynamic score.

The existing eager insertion sort is stable:
- higher score first;
- equal score preserves initialized `actionOrder`.

Therefore, while scanning surviving actions in that same tie order, once a
candidate score `bestScore` is known, a later unevaluated action with

```
maxScore <= bestScore
```

cannot outrank the current candidate. It may remain unscored until/if a later
selection is required.

## Candidate algorithm

Create an isolated JSMinSys branch from exactly `81c9475e...`.

Preparation:
- add one uint8 `maxScore` per physical cell to the prepared live-line
  evaluator;
- populate it while the existing cold line-incidence table is built.

At each non-forced branching q:
1. collect surviving columns in the existing `actionOrder`, but do not score
   them eagerly;
2. keep per-depth score slots initialized to an unevaluated sentinel;
3. to select the next child, scan remaining actions in the original tie order;
4. for an unevaluated action:
   - compute its landing cell;
   - if `maxScore[cell] <= bestScore`, leave it unevaluated;
   - otherwise compute the exact existing live-line score and cache it;
5. choose the earliest action with the greatest exact score;
6. search that child;
7. only if search continues, repeat selection for remaining actions.

This is exact selection, not heuristic ordering.

## Sameness proof

Induction over child ordinal:

- every skipped action has exact score <= its upper bound <= current selected
  score;
- a later equal score cannot outrank the earlier current action because current
  stable ordering preserves `actionOrder`;
- after removing the selected action, the next scan begins again in the same
  tie order, and any previously skipped action is evaluated if its bound can now
  beat the new best;
- therefore the selected child sequence is identical to the existing full eager
  stable sort.

No child/cofactor transition is computed for ordering.
No transition is recomputed.
No value/bound semantics change.

## Storage consequence

The current scratch `moveScores` is only one row because eager scoring ends
before recursion.

Lazy scoring survives across recursive child calls, so candidate scratch must be
per-depth:

```
(levels * columns) int32 scores
```

This is small and private. It is not a semantic table.

## Correctness gates

- directed synthetic ordering test: lazy selector sequence equals eager stable
  score sort across varied score/upper-bound patterns;
- real 4x4 / 7x6 / 10x10 exact solver controls preserve WDL/root move;
- generated behavior/root-frontier mirrors remain source-derived;
- runtime-geometry audit remains green;
- cycle ledger/source blobs updated in the same source commit;
- no single-worker execution.

## Benchmark

A = `81c9475e...` selected compact-private baseline.

B = exact lazy live-line ordering candidate.

Fixed:
- 4 workers = worker 0 wide + workers 1..3 deep;
- rootFrontier=true;
- shared cache 4,194,304;
- local cache 1,048,576 per worker;
- full sharing / sharedSampleMask=0;
- Node 26.7.0.

Primary exact fixture:
`353335714`, eight balanced completed A/B blocks.

Authority:
whole-process cycles.

Secondary:
`35333571`, 120000 ms application ceiling, censored on timeout.

Record score evaluations / upper-bound skips so a performance result can be
interpreted structurally.

Reject if correctness fails or exact completed whole-process cycles do not
establish improvement.

PR #84 remains draft/open and is not authorized for merge by this work.
