# Winning-region / terminal-line-output factorization

**Date:** 2026-09-13  
**Status:** exact finite-game theorem + complete-small-game control; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

The current theory carries two related but distinct targets:

1. prove whether P0 can force a W/D/L win;
2. among winning states, determine which original geometric winning lines can occur on at least one W/D/L-perfect trajectory.

Earlier work represented both in one set-valued function `G(s)`. The output-provenance controls now show that the two objectives admit different exact quotients. This note proves they also admit a clean two-stage fixed-point factorization.

The suspected standard-board terminal-line cardinality remains an output only.

---

## 1. Boolean winning region is a least fixed point

Let `I(s)` mean that P0 to move has an immediate legal terminal winning move.

Let:

```text
PreE(X) = { s | P0 to move and some legal successor is in X }
PreA(X) = { s | P1 to move and every legal successor is in X }
```

Then the P0 winning region is:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

This is the standard reachability-game / modal-mu-calculus attractor equation. In modal notation:

```text
mu X . [
  I
  OR (P0Turn AND <move>X)
  OR (P1Turn AND [move]X)
]
```

The formula is monotone, and Connect Four is finite and acyclic in occupied-cell rank, so its least fixed point is reached after finitely many stages.

### 4x3 qualification

On complete `4x3 connect-3`, seeding only `I` and iterating the two predecessor operators derives exactly:

```text
2,627 P0-winning states
```

against the independent exact control:

```text
2,627 wins
327 draws
1,705 losses
```

with:

```text
false positives      0
false-negative wins  0
```

The empty root enters at fixed-point rank `8`; maximum winning rank is `9`.

Thus the earlier response-overload leaf `O` is not primitive. It is exactly the first universal predecessor of immediate completion:

```text
O = PreA(I)
```

and poisoned-support / response-capacity theorems are compact Connect-specific lemmas for proving predecessor membership without enumerating all successor states.

---

## 2. The nine-node grammar is the fixed-point unfolding

Using a minimum-rank witness at P0 existential nodes and retaining all distinct child proof classes at P1 universal nodes, the selected empty-root proof contains exactly nine unique formulas:

```text
I
A(I)
E(A(I))
A(E(A(I))|I)
E(A(E(A(I))|I))
A(E(A(E(A(I))|I))|I)
E(A(E(A(E(A(I))|I))|I))
A(E(A(E(A(E(A(I))|I))|I))|E(A(I)))
E(A(E(A(E(A(E(A(I))|I))|I))|E(A(I))))
```

This is the same cardinality as the independently measured nine-node W/D/L dependency DAG from the earlier complete-game control.

The prior nine-node object is therefore not merely an empirical compression artifact. It is the quotient of a least-fixed-point proof unfolding generated from one terminal predicate plus existential/universal predecessor operators.

---

## 3. Perfect trajectories inside W

Assume W/D/L-only perfection, with no fastest-win or other secondary tie-break.

For a state `s in W`:

### P0 to move

P0 is perfect iff it chooses a successor that remains in `W`.

A successor outside `W` has strictly lower value and cannot occur on a perfect P0 trajectory.

### P1 to move

Because `s in W` and P1 is the minimizing player, **every legal successor is also in W**. If any legal move reached a draw or P1-win state, P1 would choose it and `s` would not have P0-win value.

Therefore every legal P1 move from a P0-winning state is equally W/D/L-perfect.

Hence:

> the perfect trajectories from a P0-winning state are exactly the legal paths that remain inside the induced subgraph `W`.

This removes the alternating game quantifier from the terminal-line-output stage.

---

## 4. Per-line output predicate becomes existential reachability

For original P0 geometric line `L`, let:

```text
T_L(s)
```

mean that `s` is a P0 terminal completion containing line label `L`.

Define:

```text
P_L = mu Y . [ T_L OR (W AND <move>Y) ]
```

Then:

```text
P_L(s)
```

holds exactly when there exists at least one W/D/L-perfect trajectory from `s` whose terminal P0 win contains line `L`.

At the root:

```text
PPWinLine(L) <=> P_L(root)
```

and therefore:

```text
Lambda_PP = { L in Lambda | P_L(root) }.
```

This is a second least fixed point, but unlike the value proof it uses only existential reachability once `W` is fixed.

---

## 5. Simultaneous line-set form

All geometric line predicates may be propagated together as a line-label set `Q(s)`.

For states outside `W`:

```text
Q(s) = empty
```

For a terminal P0 win in `W`:

```text
Q(s) = set of original lines completed by the terminal move
```

For a nonterminal `s in W`:

```text
Q(s) = union { Q(t) | s -> t and t in W }.
```

The same union rule applies at both players' turns because `W` has already discharged the adversarial value quantifier.

Thus:

```text
G(root) = Q(root)
```

but the computation is factored into:

```text
Stage 1: alternating Boolean fixed point W
Stage 2: existential provenance reachability Q inside W
```

The complete 4x3 control gives zero mismatches between this factorized construction and the original one-pass set-valued `G` recurrence at every physical state; the empty root returns all 14 geometric lines.

---

## 6. Why this matters for quotient design

The factorization aligns exactly with the output-provenance theorem.

### Stage 1 — value

Use the aggressive value quotient:

```text
support/event frontier
+ minimal residual WSL antichains
+ CPC / response / blocker / deadline facts
```

Its objective is only `W` membership. Duplicate and dominated requirements may be erased when the existential W/D/L theorem permits.

### Stage 2 — terminal-line output

Restrict attention to `W` and attach:

```text
Pi0(r) = original live P0 line labels whose exact residual is r
```

Then perform ordinary existential reachability of those labels through W-preserving transitions.

There is no reason to force the value quotient itself to retain line labels merely because the downstream research question asks for them.

---

## 7. The missing calculus is now sharply located

The formal fixed-point shell is not missing. It is standard reachability-game least-fixed-point logic.

The complete small-game work also supplies exact residual/event transition semantics without a colored board.

The remaining Connect-Four-specific challenge is therefore:

> compute or discharge the predecessor operators `PreE` and `PreA` **symbolically over CPC/WSL/support/NDC regions**, rather than enumerating every structural successor/state.

Local theorems already act as such symbolic predecessor transformers:

```text
playable singleton       -> terminal seed I
response overload        -> PreA(I) or a higher PreA region
poisoned support         -> remove an unsafe defender alternative
blocker cover            -> prove a non-win region
support-shadow preemption -> refute terminal alternatives
interval-Hall deficiency -> prove response-capacity failure
```

The task is to close these region-level transformers under implication, dominance, symmetry and NDC until they generate the required predecessor regions directly.

Once `W(root)` and the relevant winning-region structure are established, the suspected standard-board line subset is only the second-stage provenance reachability output. Its cardinality is inspected afterward.

---

## 8. Relation to formal logic

This identifies the weakest natural high-level formalism much more clearly than before.

The Boolean winning-region statement is an **alternation-free modal mu-calculus / least-fixed-point** formula over the structural transition relation. Equivalently it can be expressed in least-fixed-point logic or a suitable recursive Datalog-style system with existential/universal predecessor aggregation.

The line-output stage is an even simpler least fixed point: labeled existential reachability restricted to the already proved winning region.

Therefore a giant QBF encoding of 42 alternating moves is unnecessary as the conceptual theory. QBF remains a valid control oracle, but the structural proof naturally lives in finite fixed-point logic.

---

## Evidence

```text
docs/research/evidence/2026-09-13-winning-region-output-factorization.json
docs/research/evidence/2026-09-13-progress-grammar-4x3-closure.json
docs/research/evidence/2026-09-13-output-provenance-transition-control.json
```

## Literature alignment

The modal mu-calculus is the standard fixed-point extension of modal logic in which diamond/box modalities represent existential/universal successor quantification, and finite reachability-game winning regions are expressed by a least fixed point of precisely this form. This is used here only as general logical confirmation; all Connect-Four-specific transition and predicate semantics remain derived from the repository's game rules and structural mathematics.

## Claim boundary

Established:

- the P0 winning region is exactly the least fixed point of immediate P0 terminal wins plus existential P0 and universal P1 predecessors;
- on complete 4x3, `I + E/A` alone derives every and only P0-winning state;
- response overload is a derived universal-predecessor macro, not a necessary primitive;
- perfect-play terminal-line possibility factorizes into existential reachability inside the already proved P0-winning region;
- the factorized line-output construction exactly matches the original set-valued `G` control on complete 4x3.

Not established:

- a complete symbolic predecessor calculus for standard 7x6 that avoids structural-state enumeration;
- that current local CPC/WSL/NDC/response-capacity lemmas generate every predecessor region needed by the standard root;
- any final standard-7x6 terminal-line membership or cardinality.
