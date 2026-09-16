# W/D/L interval predecessor calculus — common proof currency for Negamax, BSFP and structural closure

**Date:** 2026-09-13  
**Status:** theoretical synthesis from qualified solver semantics and bounded proof-intersection evidence; no production solver change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and synthesis:** OpenAI ChatGPT

## Purpose

The bidirectional Negamax/BSFP control shows that the missing calculus is not another game-value recurrence. Both exact solvers already implement the same predecessor recurrence from opposite directions.

A further intersection is visible in the maintained forward solver: structural closure does not need to prove an exact W/D/L value to be useful. It may prove only a **one-sided exact bound**, such as `mover cannot win` or `opponent cannot win`, and intersect that bound with the existing proof interval.

This note promotes that observation into a solver-independent mathematical object.

## 1. Six-element interval lattice

Use absolute P0-oriented values

```text
-1 = P1 win
 0 = draw
+1 = P0 win
```

with the usual order.

Every non-contradictory interval whose endpoints are W/D/L values is one of exactly six elements:

```text
[-1,+1]   unresolved
[-1, 0]   P0 cannot win
[ 0,+1]   P1 cannot win
[-1,-1]   exact P1 win
[ 0, 0]   exact draw
[+1,+1]   exact P0 win
```

Call the interval for state `s`

```text
I(s) = [L(s), U(s)].
```

Information strengthens by interval intersection:

```text
[L1,U1] meetInfo [L2,U2]
  = [max(L1,L2), min(U1,U2)]
```

provided the result is non-contradictory.

This is exactly the semantic shape already enforced by the forward proof store and frontier-bound application.

## 2. Structural certificates produce intervals

The existing structural facts naturally map into this lattice.

### Exact terminal / tactical facts

```text
P0 terminal win       -> [+1,+1]
P1 terminal win       -> [-1,-1]
exact draw            -> [ 0, 0]
```

### One-sided no-win facts

```text
P0 has no surviving winning possibility
  -> [-1,0]

P1 has no surviving winning possibility
  -> [0,+1]
```

Examples of exact no-win certificates include:

- one-sided residual exhaustion;
- a complete compatible blocker cover against that player's requirements;
- a qualified paired-response policy covering every surviving requirement;
- a race/deadline certificate proving every surviving completion is preempted.

If both one-sided no-win facts hold:

```text
[-1,0] meetInfo [0,+1] = [0,0]
```

so draw is derived rather than separately guessed.

## 3. Existing forward implementation is already an instance

The quotient Negamax domain contract stores W/D/L intervals and applies structural frontier bounds by narrowing them.

In side-to-move orientation its current codes are:

```text
mover-no-win     -> upper <= 0
opponent-no-win  -> lower >= 0
draw             -> lower >= 0 and upper <= 0
```

The paired-response closure produces exactly such a no-win certificate when:

```text
all column remainders satisfy the required even guard
and
every surviving mover requirement intersects the compiled response mask.
```

The important semantic point is not the particular response profile. It is that CPC/WSL/NDC can emit a **sound interval narrowing** without solving the whole state.

## 4. BSFP is the backward dual

BSFP's exact attractors are the endpoint cases:

```text
P0 winning attractor -> [+1,+1]
P1 winning attractor -> [-1,-1]
remaining exact safety residue after complete closure -> [0,0]
```

But structural certificates can provide the two intermediate no-win intervals before the complete attractor is known:

```text
[-1,0]
[0,+1].
```

Therefore an interval-enhanced BSFP/NDC interpretation can consume the same structural certificates as Negamax without changing BSFP's exact result semantics.

The intervals are proof information; they are not a new game value.

## 5. Exact predecessor action on intervals

Let legal action `a` have exact or sound child interval

```text
I_a = [L_a,U_a].
```

Immediate terminal actions inject their exact singleton interval instead.

Because `max` and `min` are monotone:

### P0 predecessor

```text
I(s) = [ max_a L_a,  max_a U_a ]
```

is a sound predecessor interval.

### P1 predecessor

```text
I(s) = [ min_a L_a,  min_a U_a ]
```

is a sound predecessor interval.

When every child interval is exact, these formulas are the exact W/D/L recurrence.

When some children remain unresolved, they are still a valid partial evaluation.

## 6. Existential and universal proofs emerge automatically

The interval form recovers the familiar proof quantifiers.

### P0 existential win

If any legal action has

```text
L_a = +1
```

then

```text
max_a L_a = +1
```

and the predecessor collapses to `[+1,+1]` without resolving other children.

### P1 existential win

If any P1 action has

```text
U_a = -1
```

then the P1 predecessor collapses to `[-1,-1]`.

### Universal exclusion

To prove P0 cannot win, every P0 action must satisfy

```text
U_a <= 0.
```

To prove P1 cannot win, every P1 action must satisfy

```text
L_a >= 0.
```

Thus `PreE` and `PreA` are not separate value theories. They are boundary cases of interval aggregation.

## 7. Forced-response macro edges

A forced response is also naturally represented in this calculus.

Suppose local exact closure proves that every action except `a*` is an immediate loss for the mover.

Then the predecessor `max/min` expression factors to the one unresolved action plus dominated exact-loss alternatives. The parent interval can therefore be propagated through `a*` without treating the node as a genuine decision.

This is the common semantic explanation for Negamax's forced macro-edge and the corresponding single admissible predecessor dependency in backward closure.

## 8. Response-resource conflicts become interval-certificate conflicts

A structural certificate may narrow an interval only if all of its guards can be embedded in legal action/event semantics.

For example:

```text
Respond(B1,B2)
BlockBottom(C1)
```

cannot jointly justify a no-win bound when they require two different P1 actions in the same response slot.

The failure is not merely a named-rule incompatibility. It means the proposed interval certificate does not commute with the actual predecessor relation.

Therefore every nonlocal interval certificate must retain:

```text
trigger
response resource
horizon/deadline
event-order guards
parity/reservoir guards
```

until the bound is safely derived.

## 9. Why this helps the missing calculus

The searchless objective can now be stated more narrowly.

We do **not** need CPC/WSL/NDC to jump directly from an unresolved state to exact W/D/L.

They may instead accumulate independently proved interval facts:

```text
[-1,+1]
  -> [-1,0]       via complete P0 blocker cover
  -> [0,0]        via independent P1 no-win certificate
```

or

```text
[-1,+1]
  -> [0,+1]
  -> [+1,+1]      after an existential predecessor witness
```

NDC supplies dependency-preserving closure between those facts.

This makes the calculus substantially easier to build than an all-or-nothing exact-state classifier.

## 10. Relation to the bidirectional 4x3 control

The complete 4x3 connect-3 proof-intersection control established:

```text
7,157 legal states
0 Negamax/BSFP W/D/L disagreements
4,631 nonterminal physical states
3,734 exact structural quotient classes
0 mixed-value quotient classes
0 mixed-proof-shape quotient classes
```

After local exact closure and forced-response recognition, only 710 quotient classes remain genuine decisions.

Those classes have 1,946 distinct exact successor classes; exact equality removes none, and reflection removes only 12 action edges.

Therefore interval certificates must provide **semantic bounds between distinct alternatives**, not merely merge equal successors.

## 11. Candidate common proof interface

At the theory level a certificate can be reduced to:

```text
BoundCertificate:
  prerequisites
  guards
  lowerBound   // optional strengthening
  upperBound   // optional strengthening
  horizon/rank
  provenance
```

Composition is:

```text
state interval
  meetInfo certificate interval
  predecessor max/min interval
  NDC-derived new certificates
  repeat to fixed point.
```

The physical encoding is not prescribed here.

## 12. Strong falsifiers

Reject or refine this calculus if any of the following occurs:

1. a sound CPC/WSL/NDC fact cannot be expressed as an interval narrowing or a prerequisite for one;
2. interval predecessor aggregation disagrees with either exact solver on a complete control;
3. certificate composition yields a narrower interval than the exact value permits;
4. two states merged for interval proof have different legal predecessor/response semantics;
5. timing/resource premises are lost while the bound survives.

## 13. Next seam

Use existing structural bounds as training examples rather than historical rule names.

For exact standard-7x6 states, collect cases where the forward solver narrows an interval before recursive child resolution and map the same fact into the backward structural domain.

The first target is the existing paired-response `moverNoWin` certificate because it already has:

```text
explicit support guard
explicit requirement cover
zero per-state proof payload
exact one-sided bound
```

Then generalize from that concrete certificate to response-capacity/deadline-aware blocker covers.

If the generalized certificate family can repeatedly narrow intervals until the predecessor operator collapses, that is the missing searchless calculus in operational form.
