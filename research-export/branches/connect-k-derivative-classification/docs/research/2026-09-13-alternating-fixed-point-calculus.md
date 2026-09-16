# Alternating fixed-point calculus for structural Connect Four proof

**Date:** 2026-09-13  
**Status:** theoretical research / exact game-semantics decomposition; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization:** OpenAI ChatGPT

## Purpose

State the strategic calculus gap exposed by the CPC/WSL/NDC, safety-cover, response-capacity, and defect-transfer work in exact fixed-point terms.

C4-0007 currently defines monotone proof-fact accumulation:

```text
F(X) = X union exactConsequences(X)
X*   = lfp(F)
```

That is sufficient as a proof-composition substrate, but it does not by itself specify the alternating predecessor semantics of a two-player reachability game.

The missing layer is an **alternating fixed-point calculus** connecting structural certificates to existential/universal strategic predecessors.

The final perfect-play terminal-line subset remains an output only.

---

## 1. Exact state-level reference semantics

Let `S` be the finite legal state universe and let:

```text
T0 subset_of S
```

be states in which P0 has just won.

Define the predecessor operator:

```text
A(X)
  = T0
    union { s | P0ToMove(s) and exists child(s,c) in X }
    union { s | P1ToMove(s) and every child(s,c) is in X }.
```

Then the exact P0 winning region is the least fixed point:

```text
W0 = mu X . A(X).
```

This is the standard reachability-game attractor equation specialized to finite Connect Four.

The `exists` and `every` clauses are precisely the predecessor operators that the structural calculus must reproduce without enumerating physical children.

---

## 2. Progress rank from the least fixed point

Construct the approximants:

```text
W_0 = T0
W_{k+1} = A(W_k).
```

Because the legal game is finite, the sequence stabilizes.

For any winning state `s`, define its attractor rank:

```text
rho(s) = least k such that s in W_k.
```

Then:

- at a P0 state of rank `k>0`, at least one legal successor has smaller rank;
- at a P1 state of rank `k>0`, every legal successor lies in the earlier winning approximation required by the predecessor condition.

Thus least-fixed-point membership already carries a well-founded **progress rank**.

The current structural program needs a quotient-level analogue of this rank over CPC/WSL/NDC obligations rather than physical states.

---

## 3. Dual safety region

Let `N0` mean that P0 cannot force a win.

The complement of the reachability attractor is characterized dually as the greatest fixed point of a safety predecessor. Conceptually:

```text
N0 = nu Y . B(Y)
```

where a nonterminal state remains in `Y` when:

- at a P0 turn, every legal P0 move remains in `Y`;
- at a P1 turn, at least one legal P1 response remains in `Y`;
- P0 has not already reached a terminal win.

This is exactly the logical shape of a P1 safety strategy.

The Allis-style compatible blocker cover, generalized through CPC/WSL/NDC, is therefore a **certificate of membership in the safety/greatest-fixed-point side**, not merely a bag of blocked lines.

---

## 4. Why coverage alone cannot establish the safety fixed point

To prove the existential P1 predecessor on the safety side, one must exhibit a response that remains inside the safety invariant after **every** possible future P0 continuation.

Hence a valid safety certificate requires more than:

```text
union of blocker solved masks covers every current P0 requirement.
```

It must also prove:

```text
certificate compatibility
response ownership/playability
response-slot capacity
deadline/race correctness
closure under future attacker triggers.
```

The recent controls show this distinction is essential:

- a hypothetical center parity repair can statically hit all 69 lines while lacking a proved joint policy;
- raw A1-A9 blocker unions cover every P0 requirement in all 49 early center-prefix controls, including every known P0-win state.

Thus WSL coverage is a consequence algebra inside the safety proof, not the safety predecessor itself.

---

## 5. Response matroid as part of the safety predecessor

Given a proposed set of mandatory response obligations, legal defender turns form the right side of a bipartite graph.

Schedulable obligation sets form a transversal matroid.

This gives exact local predicates for the safety predecessor:

```text
ResponseRank(O) = |O|
```

for temporal feasibility, plus circuits/closure when a repair overloads the current response system.

It solves one component of:

```text
Pre_exists^P1(safety)
```

but not the whole predecessor, because CPC/resource/race guards and closure under future P0 triggers remain necessary.

---

## 6. Defect transfer as failed safety preservation

Suppose a candidate safety invariant covers every current P0 requirement except `R`.

A proposed repair `r` may enter the closure of the current response matroid and create a fundamental circuit.

Keeping `r` requires ejecting an existing obligation. If that obligation has private WSL coverage, a different P0 requirement becomes uncovered.

This is exactly a failure to establish the safety predecessor:

```text
repair current defect
-> leave safety invariant somewhere else.
```

Rather than enumerate all policy branches, the structural program can carry the resulting family of possible defects symbolically.

---

## 7. Alternative convergence and MUST/MAY facts

For an exhaustive family of strategic alternatives `A_i`, two different information projections are useful.

### MAY

A fact/output possible in at least one alternative:

```text
MayFacts = union_i Facts(A_i).
```

### MUST

A fact true under every alternative:

```text
MustFacts = intersection_i Facts(A_i).
```

Any fact in `MustFacts` may be promoted without selecting an alternative.

The center phase-cover response fork is a small example:

```text
P1 chooses A1 or E1
```

but every alternative implies:

```text
the unique complete phase safety certificate is destroyed.
```

So the common consequence closes without a move-tree branch.

This suggests a proof-information order in which:

```text
MAY possibilities shrink
MUST consequences grow.
```

NDC fact accumulation can host the MUST side, while explicit refutations/alternative elimination shrink the MAY side.

---

## 8. Structural predecessor target

Let `alpha(s)` be a structural proof state containing at least:

```text
support/accessibility
residual requirements
CPC ownership/response relations
certified blockers
response obligations/resource constraints
deadlines/race facts
proof alternatives / MUST-MAY summaries
```

The missing exact theorem is a congruence/predicate-transformer pair:

```text
Pre_exists_structural(alpha)
Pre_forall_structural(alpha)
```

such that their result agrees with the physical-state predecessors for the requested W/D/L/terminal-line semantics.

A sufficiently strong result would prove:

```text
alpha(s1) == alpha(s2)
=> same strategic predecessor meaning
=> same requested output semantics.
```

No such complete 7x6 congruence theorem is claimed yet.

---

## 9. Line-output lifting

The already-derived exact set-valued output algebra can be layered on the winning fixed point.

Let:

```text
G(s) subset_of Lambda_69
```

be the P0 terminal winning lines possible on at least one W/D/L-perfect trajectory from winning state `s`; use `G(s)=empty` when P0 cannot force a win.

Then:

```text
Lambda_PP = G(root).
```

The strategic fixed-point calculus first establishes which transitions remain inside `W0`; the output algebra then accumulates terminal-line labels over those value-preserving transitions.

Therefore the suspected output count never appears in the predecessor equations.

---

## 10. Safety + liveness interpretation

The research stack now separates into two obligations.

### Safety

Prove that the opponent cannot complete a winning requirement before the relevant horizon.

Mechanisms:

```text
CPC response/control
WSL blocker coverage
NDC dependency closure
response-matroid feasibility
race/preemption guards
```

### Liveness / progress

Prove that P0 eventually reaches a terminal P0 completion rather than merely preventing P1.

Mechanisms under investigation:

```text
least-fixed-point attractor rank
forced response circuits
defect transfer
alternative convergence
threat production
well-founded support/deadline/slack ranks
```

The missing positive calculus is therefore a quotient-level construction of the least-fixed-point progress rank.

---

## 11. Relationship to C4-0007

C4-0007 remains sound as the generic monotone certificate-composition layer.

The new conclusion is not that `lfp(F)` is wrong. It is that a complete strategic proof profile needs to specify **which alternating predecessor propositions the certificates discharge**.

In other words:

```text
NDC = how exact facts compose
AFC = which existential/universal strategic predecessor those facts prove
```

A future accepted profile may compile AFC predecessor obligations into NDC certificates rather than introduce a separate runtime subsystem.

---

## 12. Decisive next theorem

The current center-opening research has already produced:

- a safety-cover boundary defect;
- a unique complete phase-cover candidate inside one structural family;
- a first-response capacity circuit refuting that candidate;
- general response-matroid defect-transfer rules.

The next decisive theorem is:

> derive a structural rank `rho_struct` on unresolved attack/defect obligations such that every defender alternative either permits an immediate P0 terminal completion or produces a successor defect with strictly smaller `rho_struct`.

That theorem would discharge the quotient-level P0 existential predecessor and supply the missing least-fixed-point progress calculus.

If no such rank exists without reconstructing physical child states, that is a concrete falsifier of the strongest searchless hypothesis.

## Claim boundary

Established:

- exact state-level alternating least/greatest fixed-point semantics;
- direct correspondence between safety policies and the dual predecessor shape;
- response-capacity/matroid facts discharge only part of the safety predecessor;
- the positive structural gap is a quotient-level well-founded progress/predecessor calculus.

Not established:

- a complete structural predecessor transformer for standard 7x6;
- a complete quotient congruence;
- a structural attractor rank from the empty root;
- the final perfect-play terminal-line subset or its cardinality.
