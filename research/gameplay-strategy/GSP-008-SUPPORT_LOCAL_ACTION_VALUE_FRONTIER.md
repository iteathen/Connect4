# GSP-008 — Support-local exact action-value frontier

**Status:** active investigation  
**Goal:** determine the exact best move from structural frontier membership rather than full future-state traversal.

## Proposal

Fix one legal support and side to move.

Order exact residual states by the current-player favorable relation:

~~~text
qA >= qB
~~~

when:

- the current player's residual completion function is pointwise no harder in A than B;
- the opponent's residual completion function is pointwise no easier in A than B.

The current theorem candidate says every fixed action's exact strong score is isotone under this order.

Therefore, for each:

~~~text
support
+ legal action
+ score threshold
~~~

the states meeting that threshold form an upward-closed set and can be represented exactly by minimal antichain generators.

Runtime move selection becomes:

~~~text
for each legal action:
    recover exact action score from nested threshold-frontier membership

choose maximal score
~~~

## Why this is different from q minimization

A smaller transition-closed policy automaton retains most q distinctions.

The useful collapse is decisional:

~~~text
q
-> support-local action-value order
-> threshold frontiers
-> exact action score
-> best move
~~~

The method does not need to preserve the entire action-labelled future game as a smaller state machine.

## Complete-control evidence

Across complete 4x3 c3, 4x4 c4, 5x3 c4 and 4x5 c4 controls:

~~~text
comparable q-state pairs          6,300,753
state W/D/L violations                    0
state strong-distance violations           0

comparable fixed-action pairs    18,076,405
action W/D/L violations                   0
action strong-distance violations          0
~~~

W/D/L action-state frontier compression ranged from 1.900x to 5.949x.

Full strong-distance threshold-frontier compression ranged from 1.199x to 3.479x.

## Negative controls

Do not generalize the order across different supports without additional temporal/control guards.

Raw residual implication across different supports produced false action-dominance claims.

A simple cell-accessibility guard reduced but did not eliminate those failures.

Also:

~~~text
"column c is optimal"
~~~

is not itself upward-closed. A more favorable state may improve a competing action more strongly.

So store/derive **action values**, not direct policy regions.

## Implementation opportunities

### IsoMax

Use frontier membership to:

- return exact action scores without recursion when covered;
- eliminate siblings whose upper score cannot beat the current best;
- derive exact lower/upper action bounds from partial frontier coverage;
- recurse only on unresolved action/frontier comparisons.

### CUDA-BSFP

Investigate propagating only threshold-frontier generators under exact predecessor/cofactor transforms instead of materializing interior state families.

### Shared

The frontier relation belongs to Connect4 semantics/research, not either solver.

Both active solvers can construct or consume the same support-local action-value boundaries.

## Standard 7x6 bounded evidence

A deterministic exact standard-board control now shows the frontier relation can be used constructively across ranks.

Using independently constructed child-rank value frontiers and unseen parent states:

~~~text
20k child-state frontier budget:

rank 26 -> 15.40% exact best moves
rank 30 -> 54.62%
rank 34 -> 81.63%
rank 36 -> 88.39%
rank 38 -> 97.44%
rank 39 -> 100.00%
~~~

Across ranks 26-39:

~~~text
held-out q states        64,644
held-out legal actions  257,007

false action claims           0
false best-move claims        0
~~~

Increasing child-frontier coverage materially improves earlier ranks:

~~~text
rank 28:
    20k child states  -> 30.44%
    100k child states -> 73.36%

rank 26:
    20k child states  -> 15.40%
    100k child states -> 61.36%
~~~

The next bottleneck is therefore frontier construction/coverage toward the root, not a detected correctness failure in the support-local order.

See:

- `research/isograph/discovery/2026-09-18-policy-frontier/STANDARD_7X6_BOUNDED_FRONTIER_TEST.md`
- `research/isograph/discovery/2026-09-18-policy-frontier/STANDARD_7X6_BOUNDED_FRONTIER_RESULTS.json`

## Qualification burden

Before adoption:

1. independently review the isotony proof;
2. reproduce all four complete controls from the checked-in control;
3. test nonstandard complete geometries;
4. extend standard-7x6 frontier construction toward earlier ranks using support-aware/demand-aware generation and measure generator growth;
5. verify q/proof identity separation;
6. measure lookup/construction economics against current IsoMax and BSFP baselines.

## Research source

- `research/isograph/discovery/2026-09-18-policy-frontier/CAMPAIGN.md`
- `research/isograph/discovery/2026-09-18-policy-frontier/SUPPORT_LOCAL_ACTION_VALUE_ISOTONY.md`
- `research/isograph/discovery/2026-09-18-policy-frontier/RESULTS.json`
- `research/isograph/discovery/2026-09-18-policy-frontier/policy-frontier-control.mjs`
