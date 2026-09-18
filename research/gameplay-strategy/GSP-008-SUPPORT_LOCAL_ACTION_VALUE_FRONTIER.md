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

## Qualification burden

Before adoption:

1. independently review the isotony proof;
2. reproduce all four complete controls from the checked-in control;
3. test nonstandard complete geometries;
4. build bounded standard-7x6 rank slices and measure frontier growth;
5. verify q/proof identity separation;
6. measure lookup/construction economics against current IsoMax and BSFP baselines.

## Research source

- `research/isograph/discovery/2026-09-18-policy-frontier/CAMPAIGN.md`
- `research/isograph/discovery/2026-09-18-policy-frontier/SUPPORT_LOCAL_ACTION_VALUE_ISOTONY.md`
- `research/isograph/discovery/2026-09-18-policy-frontier/RESULTS.json`
- `research/isograph/discovery/2026-09-18-policy-frontier/policy-frontier-control.mjs`
