# Isometric–BSFP dual closure

**Status:** architectural research hypothesis. No production solver change.

**Research direction:** Josh Oshiro.

## Goal

Bring the Isometric structural-proof calculus and BSFP backward exact recurrence toward one solver without forcing either side to adopt the other's physical representation prematurely.

The intended integration is not:

```text
run Isometric to completion
then run BSFP
```

and not:

```text
materialize the full reachable semantic graph
then solve it backward.
```

Existing standard-7x6 evidence makes the latter too large without simultaneous proof contraction.

The candidate is an interacting **dual closure**.

## Shared proof currency

Use absolute P0-oriented W/D/L intervals:

```text
[-1,+1] unresolved
[-1, 0]  P0 cannot win
[ 0,+1]  P1 cannot win
[-1,-1]  exact P1 win
[ 0, 0]  exact draw
[+1,+1]  exact P0 win.
```

Isometric structural certificates may narrow an interval without establishing exact value.

BSFP terminal/predecessor closure may establish exact endpoints or further bounds.

Information combines by exact interval intersection plus guarded structural fact closure.

## Two directions

### Forward/root-side structural closure

Starting from the empty root or a runtime subproblem, Isometric derives only facts justified without solved labels:

```text
support/accessibility constraints
CPC owner/parity relations
affine ownership facts
blocker clauses
response-resource contracts
deadlines / event precedence
one-sided no-win certificates
forced response fragments
claim-relative theorem classes.
```

These facts restrict the feasible semantic states/actions and can seed BSFP interval bounds.

### Backward/terminal-side BSFP closure

Starting from geometric terminal axioms, BSFP propagates:

```text
exact terminal Win/Loss
existential/universal predecessor consequences
terminal subtraction
antichain/quotient boundaries
proof ranks / exact interval endpoints.
```

Backward facts may activate additional Isometric consequences by proving prerequisites or excluding alternatives.

## Interaction loop

Conceptually:

```text
forward guarded facts / feasible region
        |
        v
constraint-aware candidate reduction
        |
        v
BSFP backward interval/predecessor update
        |
        v
new exact/no-win consequence
        |
        v
NDC / affine-clause / resource-cut closure
        |
        +----> stronger feasible region / macro certificate
        |
        +----> repeat until root interval closes or unresolved seam remains.
```

No fact is promoted merely because the opposite engine would like it.

## Avoid full graph materialization

Because Connect Four is acyclic in support rank, use ranked/frontier execution rather than retain every q state.

Candidate execution forms:

1. rolling BSFP ranks plus a compact forward constraint descriptor per support/orbit;
2. bounded rendezvous cut: forward structural constraints summarized to rank `k`, backward BSFP summarized to rank `k`, then compose at the cut;
3. demand-driven semantic classes only where the current interval/constraint frontier remains unresolved.

Horizontal reflection, legal-cardinality slice pruning and first-win nonterminal clauses apply before either direction expands work.

## Constraint descriptor versus semantic identity

Keep three layers explicit:

```text
operational state:
  GPU work records / support orbit / dense IDs

semantic identity:
  exact future-relevant Connect4 state needed for the selected transition contract

proof state:
  interval + guarded facts + certificates + proof/deadline ranks.
```

A proof-state equality never silently becomes semantic-state equality.

Claim-relative theorem identity may reuse one transform/certificate across many semantic states without merging those states.

## Meet-at-cut formulation

For support rank `k`, define:

```text
Forward_k = exact structural constraints/certificates reachable from the root side
Backward_k = exact BSFP WDL/interval boundary induced from terminal side.
```

The cut operation asks only for semantic classes satisfying both:

```text
Forward_k constraints
AND
Backward_k boundary relation.
```

This gives a natural place for:

- feasible-slice cone rejection;
- affine/clause line-hit realizability;
- reflection canonicalization;
- Isometric resource cuts;
- O3 residual-pair factorization;
- device grouping/dense IDs.

The best cut rank is an empirical execution parameter, not theorem authority.

## Runtime exact search as gap oracle

If closure stalls, an exact runtime search/proof query may target a narrow unresolved proposition:

```text
which interval endpoint holds?
which response is forced?
is this guard universally stable?
what is the earliest deadline/terminal horizon for this subproblem?
```

Its result is admitted only with its exact runtime proof scope and cost.

The efficiency metric is:

```text
subsequent structural/BSFP work eliminated
------------------------------------------
runtime cost of the certificate query.
```

Repeated runtime certificates become discovery examples for Isometric. Once a searchless invariant theorem explains them, replace the runtime query by that theorem.

## Calculus-gap significance

Isometric's current missing rule is roughly:

```text
exact cofactor consequence
+ universal intervention/resource/deadline/first-win guards
-> certified obligation/bound.
```

BSFP's missing line-product law is roughly:

```text
compact realizability relation
+ exact preimage/terminal/existential-universal composition
-> direct symbolic predecessor.
```

Dual closure tests whether these are two views of the same guarded predecessor calculus.

A successful shared rule should be expressible both as:

- a forward proof/certificate transformer; and
- a backward interval/predecessor restriction.

That is the integration criterion, not shared source code.

## Qualification progression

1. Complete small games: run forward certificates and backward intervals separately; verify their meet never narrows past exact W/D/L.
2. Add one-sided exhaustion as the first shared interval certificate.
3. Add exact singleton/double-response and forced-response macro certificates.
4. Add legal-cardinality/nonterminal feasible-slice filtering and reflection orbits.
5. Add affine/clause realizability at a bounded line-hit cut.
6. Measure whether iterative cross-direction closure reduces candidate products versus backward-only BSFP.
7. Only after bounded exact success, run a hard-capped 6x5/7x6 frontier experiment.

## Falsifiers

- forward structural closure excludes an exact BSFP-valid legal state without a proved guard;
- backward proof result is treated as an unguarded forward ownership fact;
- interval intersection produces a contradiction on any exact control;
- proof-state identity is used as transition-state identity;
- runtime oracle facts leak into other runs or wider scopes without proof;
- cross-direction communication requires retaining a larger graph than either standalone method with no compensating work reduction;
- the shared rule requires reconstructing the full physical move tree, defeating the calculus objective.
