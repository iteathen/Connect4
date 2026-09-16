# Recursive alternative-convergence algebra pilot

**Date:** 2026-09-13  
**Status:** positive structural control / partial-solution candidate; not a 7x6 solve proof  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / recursive-matrix-free hypothesis:** **Josh Oshiro**  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Question

The previous constrained-synthesis pilot showed that scalar parent-state formulas are the wrong conjecture language: shallow classes admit many accidental fits while deeper `E/A` classes are not expressible by small conjunctions.

The owner proposed a different interpretation: the final proof must represent real game branching, but the *certificate itself need not contain the physical branch matrix*. If the already-observed typed action effects are a correct local partial solution, recursive quantified composition may absorb the branching.

This control tests that hypothesis directly.

Exact W/D/L values are used only to discover and falsify candidate positive proof cones. They are not admitted as theorem premises for the target 7x6 proof.

## Accepted positive leaves and recursion

The control uses the already-qualified small-game leaves:

```text
I = P0-to-move state with a playable immediate P0 terminal completion
O = P1-to-move response-overload state where every legal P1 move releases
    a P0 playable singleton completion and P1 has no immediate counterwin
```

and exact predecessor structure:

```text
E(C) = P0 has a selected legal continuation into certificate C
A(C1 | ... | Cn) = every legal P1 continuation is already certified
```

Physical duplicate alternatives are removed at `A` nodes by exact idempotence: if several P1 moves lead to the same recursively certified consequence class, the proof obligation contains that class once.

## Matrix-free recursive form

Turn alternation gives a sharper two-sorted grammar.

For P0-to-move positive certificates:

```text
D0 ::= I | E(D1)
```

For P1-to-move positive certificates:

```text
D1 ::= O | R(S, immediate)
```

where

```text
R(S, immediate)
  = A({ E(C) : C in S } union ({I} if immediate else empty))
```

Thus a universal defender node need not retain a move-by-move matrix. It retains only:

1. the finite set `S` of distinct lower recursive consequence classes reached by defender alternatives; and
2. whether any defender alternatives are already discharged by immediate P0 completion `I`.

Every normalized universal rule observed in all four complete controls had exactly this form. This is not an empirical accident of syntax: after a P1 move, the child is P0-to-move, so its positive proof root can only be `I` or `E(...)` under the accepted grammar.

The physical branching therefore survives semantically through the universal quantifier while duplicate branch identity disappears from the certificate.

## 4x3 and 4x4 connect-3 root reproduction

The accepted 4x3 root grammar was independently reproduced:

```text
E(A(E(A(E(A(E(O)|I))|I))|E(O)))
```

with root proof rank `7`.

The complete 4x4 connect-3 root produced **the identical canonical recursive expression** and the same rank `7` despite a substantially larger control graph.

For the selected roots:

```text
4x3 c3: 39 materialized proof states / 38 edges / 9 recursive rules
4x4 c3: 41 materialized proof states / 40 edges / 9 recursive rules
```

The 4x3 count includes the root representation convention used by this prototype; it is consistent with the previously retained 38-edge/root-DAG result.

The nine root rewrite rules are exactly shared between the two games.

## Connect-4 stress controls

The decisive stress test was not a convenient representative. It took **all maximum-rank P0-winning states** in each complete connect-4 control, selected minimum-rank existential witnesses, retained every universal defender alternative, and then normalized universal duplicates by recursive consequence class.

### 5x3 connect-4

```text
maximum positive proof rank:               9
maximum-rank winning states:              84
union proof-cone states:                4,926
union selected proof edges:             6,639
unique recursive rewrite forms:            29
unique universal-alternative forms:        13
universal nodes:                         1,212
raw universal branch edges:              3,528
normalized recursive consequence edges:  1,434
branch-edge reduction:                   59.35%
```

Universal consequence-class arity:

```text
unary:   990
binary:  222
wider:     0
maximum normalized arity: 2
```

So **every** maximum-rank universal proof obligation in this complete connect-4 control reduces to at most two recursively distinct consequence classes, even though the physical defender may have up to five legal moves in the control.

### 4x4 connect-4

```text
maximum positive proof rank:               7
maximum-rank winning states:              56
union proof-cone states:                1,230
union selected proof edges:             1,360
unique recursive rewrite forms:            55
unique universal-alternative forms:        26
universal nodes:                           293
raw universal branch edges:                800
normalized recursive consequence edges:    513
branch-edge reduction:                   35.88%
```

Universal consequence-class arity:

```text
unary:    99
binary:  170
wider:    24
maximum normalized arity: 4
```

This control is less collapsed than 5x3, which is important negative pressure against overclaiming. But 269 of 293 universal nodes are still unary or binary after exact recursive normalization.

## Cross-game reuse

Across the all-maximum-rank connect-4 cones:

```text
5x3 recursive forms: 29
4x4 recursive forms: 55
shared exact recursive forms: 17
```

Thus the 5x3 family is 58.6% covered by exact forms also occurring in 4x4. The coarse local effect vocabulary had 25 types in 5x3, 124 in 4x4, with 19 shared; 76% of the 5x3 effect alphabet reappeared in 4x4.

The local effect descriptor used here is deliberately exploratory and still too literal to be specification authority. The stronger result is the recursive consequence compression, not the exact effect-token counts.

## Strongest structural inference

The experiment supports the owner's partial-solution interpretation:

```text
small local transition algebra
+ recursive existential/universal composition
+ consequence-class idempotence / convergence
= compact positive proof grammar
```

The one-step action-effect candidate failed previously because it was asked to classify deeper proof obligations non-recursively. Once real branching is represented recursively, the proof cones remain small relative to their physical branch graphs.

A particularly important recurring macro is:

```text
R(C) = A(E(C))
```

meaning every defender alternative admits an attacker continuation returning to the same lower certificate class. Repeated `R` applications generate long positive proof chains without retaining the physical move matrix.

The more general exact operator is `R(S, immediate)` above.

## What this does and does not establish

Established as bounded control evidence:

- the accepted `I/O/E/A` 4x3 root grammar is reproduced exactly;
- the 4x4 connect-3 root has the identical canonical recursive expression;
- physical universal branch multiplicity can be eliminated exactly when branches share the same recursive consequence class;
- all normalized universal rules have the two-sorted `R(S, immediate)` form forced by turn alternation;
- maximum-rank complete connect-4 proof cones compress to tens of recursive rule forms rather than thousands of physical states/edges;
- 5x3 connect-4 needs at most two recursively distinct consequence classes at every maximum-rank universal node;
- 4x4 connect-4 is a useful harder counterpressure: some universal nodes still require three or four consequence classes.

Not established:

- a structural CPC/WSL/NDC rule that maps every legal 7x6 action into the correct lower recursive consequence class;
- that the standard 7x6 center-positive proof has the same small arity bounds;
- that the exploratory local effect descriptor is sufficient or minimal;
- a complete 7x6 center win or root solve;
- any terminal-line-output membership/cardinality result.

## New missing seam

The missing calculus is now narrower than generic proof-shape synthesis.

For a candidate certificate class `C`, derive from structural facts a finite set-valued transition map:

```text
P0 state:
  exists legal action a with Effect(s,a) -> C

P1 state:
  for every legal action b,
    Effect(s,b) -> I
    or Effect(s,b) -> E(C_i) for some C_i in S
```

and then prove that every `C_i` has lower well-founded rank.

The next synthesis target should therefore be **recursive alternative-class transport**:

```text
CPC + WSL + support + NDC + resource/deadline effect
    -> lower recursive certificate class C_i
```

not another scalar state classifier and not a physical branch matrix.

If that transport can be proved for the center-opening 7x6 certificate, the recursive `R(S, immediate)` grammar already supplies the exact quantified composition and well-founded proof skeleton.
