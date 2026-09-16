# Negamax / BSFP proof intersection

**Date:** 2026-09-13  
**Status:** theoretical research / solver-duality seam; no production solver change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and synthesis:** OpenAI ChatGPT

## Purpose

Use the repository's two exact solver lanes as opposite-end derivations of the same Connect Four value logic.

- Quotient-native Negamax starts at a predecessor/root state and propagates exact value through legal forward transitions.
- BSFP starts from terminal facts / deeper support ranks and propagates exact symbolic value backward to predecessors.

The objective is not to merge the implementations. The objective is to identify the smallest semantic algebra that both independently realize. That common algebra is the strongest candidate for the missing structural predecessor calculus.

## 1. Shared semantic domain

Use absolute P0-oriented W/D/L values

```text
L = -1
D =  0
W = +1
```

ordered

```text
L < D < W.
```

Let `s` be a legal nonterminal structural state and `a` a legal landing action. Let

```text
T(s,a)
```

be the exact structural successor, including support/residual effects. Let

```text
Term(s,a)
```

be the exact immediate terminal value if the landing completes a legal first win, otherwise undefined.

The mover is determined by occupied-cell rank parity.

## 2. Common recurrence

For every legal action define the action value

```text
A(s,a) = Term(s,a)                         if the move wins immediately
       = V(T(s,a))                         otherwise.
```

Then

```text
P0 to move: V(s) = max_a A(s,a)
P1 to move: V(s) = min_a A(s,a).
```

BSFP implements this directly in absolute orientation by restricting the deeper symbolic function with the landing ownership and aggregating with `max` or `min`.

Negamax implements the same recurrence in side-to-move orientation by recursively negating the child result. The sign flip is representation, not different game semantics.

Therefore the semantic intersection is the predecessor algebra

```text
landing transition / restriction
+ immediate terminal injection
+ existential(max) or universal(min) choice
+ finite support rank.
```

## 3. The commuting requirement

Let `alpha(s)` be the selected exact structural projection (support + normalized residuals plus any CPC/NDC context whose proof meaning is not derivable from those fields).

A valid searchless structural calculus requires an exact transition operator `delta` satisfying

```text
alpha(T(s,a)) = delta(alpha(s), a)
```

for every legal nonterminal action.

It also needs an exact local terminal projection `tau` such that

```text
tau(alpha(s),a) = Term(s,a)
```

whenever the landing is terminal.

Finally it needs choice operators

```text
Join = max   (P0 predecessor)
Meet = min   (P1 predecessor)
```

or an equivalent existential/universal formulation.

The desired diagram is therefore

```text
physical state s  --a--> physical child T(s,a)
     | alpha                   | alpha
     v                         v
structural X      --delta_a--> structural child X'
     | V                       | V
     v                         v
   W/D/L      <-- choice --  child W/D/L
```

The calculus is complete for W/D/L exactly when this diagram commutes for every legal action and the local choice aggregation is complete.

## 4. What Negamax reveals

The forward solver exposes the predecessor obligations operationally:

1. exact tactical/terminal closure can return before branching;
2. one forced response becomes a deterministic macro-edge rather than a decision branch;
3. otherwise legal alternatives are evaluated under max/negation semantics;
4. one child is enough for an existential winning lower proof;
5. a losing/universal conclusion requires discharging every admissible alternative;
6. lower/upper proof bounds are valid partial evaluations of the same exact recurrence.

This makes response serialization visible: if two required consequences demand the same next action slot, they are not simultaneously valid certificates unless one action discharges both.

## 5. What BSFP reveals

The backward solver exposes the same logic without recursive search:

1. support rank is a finite acyclic orientation;
2. a child symbolic value function is restricted by the ownership of the landing event;
3. immediate terminal truth overrides continuation through an exact conditional;
4. all legal actions are combined by `max` or `min` at the predecessor;
5. the result is a symbolic predecessor function, not a path-specific history.

Thus the backward view identifies which forward distinctions are representational accidents. Any forward proof fact that cannot be expressed as a restriction, terminal injection, choice reduction, or a valid factorization thereof needs justification before becoming part of the common calculus.

## 6. CPC / WSL / NDC as partial evaluation

This gives a cleaner interpretation of the structural stack.

### CPC

CPC partially evaluates `delta` and action ownership/order by proving event-rank parity, response relations and deadlines without selecting a complete continuation.

### WSL-625

WSL partially evaluates terminal possibility by proving that residual requirements are killed, shrunk or covered by certified blockers. Upward closure is a compact method for proving many action/terminal alternatives impossible at once.

### NDC

NDC is dependency-preserving partial evaluation of the predecessor expression. It allows one structural consequence to simplify another while retaining response resources, horizons and timing premises.

So the intended calculus is not a third solver. It is an exact symbolic simplifier for the same predecessor expression already computed by Negamax and BSFP.

## 7. Where the current gap lives

The common recurrence itself is complete. The missing theorem is the factorization that lets CPC/WSL/NDC discharge the choice operator without enumerating every child.

For P0:

```text
PreE(X)  := exists legal action a such that successor is in X.
```

For P1:

```text
PreA(X)  := every legal action a has successor in X.
```

Negamax discharges these by forward child evaluation.

BSFP discharges them by complete backward symbolic aggregation.

The searchless calculus must discharge the same predicates from structural certificate closure:

```text
CPC/WSL/NDC facts
  -> impossible/dominated/equivalent action classes
  -> forced-response macro-edges
  -> existential witness or universal cover
  -> PreE / PreA.
```

The exact seam is therefore **choice-factorization / quantifier elimination over structural action classes**.

## 8. Response-resource conflicts are instances of failed factorization

The center response-serialization result now has a precise interpretation.

A certificate claiming both

```text
Respond(B1,B2)
BlockBottom(C1)
```

requires two distinct action consequences at the same P1 predecessor unless one physical move can satisfy both. Negamax exposes this immediately because the node has one chosen action. BSFP exposes it because predecessor aggregation can only restrict one landing event per action edge.

Therefore a generic certificate composition rule must carry an **action-slot / trigger-window resource**. A blocker consequence cannot be lifted into the predecessor if its response schedule cannot be embedded in the same legal action relation used by both solvers.

This is not an extra game rule; it is a necessary condition for commuting with the exact predecessor recurrence.

## 9. Strong research method: proof intersection

For a bounded exact state `s`:

1. extract the exact forward Negamax proof shape (terminal facts, forced edges, alternatives, exact child values/bounds);
2. extract the exact BSFP backward proof at the same structural state/rank;
3. normalize both into:
   - structural state identity;
   - landing-event transitions;
   - terminal injections;
   - existential/universal choice obligations;
   - shared subproofs;
4. erase implementation-specific details (alpha/beta windows, TT identities, MTBDD node IDs, move ordering);
5. intersect the remaining predicates;
6. compare the intersection with CPC/WSL/NDC closure.

Anything required by both exact solvers but absent from the structural closure is a concrete missing calculus predicate/rule.

Anything present only in one implementation is presumptively execution machinery until proved semantically necessary.

## 10. Terminal-line provenance extension

After W/D/L is established, the same intersection can be lifted from scalar values to a provenance domain.

For a P0 terminal win, inject the set of geometric lines completed by the terminal move. For non-winning terminal states, inject the empty provenance set.

Inside the already-proved P0-winning region:

```text
P0 choice: union provenance over value-preserving winning actions.
P1 choice: union provenance over all legal actions (all must remain P0-winning in a P0-winning P1-turn state).
```

This yields the perfect-play terminal-line subset without putting its cardinality into the premises.

The W/D/L predecessor proof and the terminal-line provenance proof therefore share the same transition/choice calculus; provenance is a second-stage annotation over the proved winning region.

## 11. Immediate next experiment

Do not continue enlarging historical named-rule coverage blindly.

Instead choose a bounded state for which both solvers can produce an exact result and record a **proof-intersection table**:

```text
predicate / obligation | Negamax evidence | BSFP evidence | CPC/WSL/NDC derivable? | missing bridge
```

Prefer a state exhibiting:

- at least one forced response;
- at least one genuine decision;
- a nontrivial blocker/deadline fact;
- enough remaining depth for universal and existential predecessor cases.

The center-opening response-collision neighborhood is a strong candidate only if the selected concrete prefix is independently confirmed to lie in the intended W/D/L region. Otherwise use a smaller completely solved geometry first to qualify the intersection procedure, then return to standard 7x6.

## Non-claims

This note does not claim:

- that Negamax and BSFP are the same implementation;
- that alpha-beta search is searchless;
- that the current CPC/WSL/NDC closure is complete;
- that the center response-collision branch has a particular W/D/L value without an independent proof/control;
- that the suspected final perfect-play line count is established;
- that historical named strategic rules are normative runtime primitives.

The claim is narrower: both exact solver lanes implement the same predecessor value algebra from opposite evaluation directions, and their normalized proof intersection provides a direct method for identifying missing structural calculus rules.
