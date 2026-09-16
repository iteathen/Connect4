# Searchless Connect Four solver hypothesis

**Date:** 2026-09-09  
**Status:** theoretical research target; maintained source and `main` unchanged.  
**Branch:** `research/low-confidence-survival-2026-09-09`

## Strong hypothesis

The target is no longer merely to prune or compress the move tree.

> Standard 7x6 Connect Four may be solvable from the empty board without ordinary move-tree search, by computing the closure of a finite system of strategic dependencies over future placement events.

This does **not** mean zero computation. It means no recursive enumeration of legal move continuations as the primary proof mechanism.

## Candidate mathematical object

Represent the unresolved game by:

```text
future strategic events E
+ gravity/event precedence relation
+ residual winning requirements R0/R1
+ parity/response ownership constraints P
+ certified blockers B0/B1
+ terminal propositions T
```

Then repeatedly apply exact inference rules until a fixed point is reached:

```text
X_{n+1} = F(X_n)
```

where `F` derives all consequences currently implied by:

- event-rank parity;
- response/XOR ownership relations;
- support/event accessibility;
- blocker subset closure over the 625-ID requirement lattice;
- requirement exhaustion;
- race/deadline relations;
- nested certificate dependencies.

If the least fixed point contains the exact root proposition, no move search is required.

## What must be true for a genuinely searchless solver

### 1. Completeness

The closure language must be expressive enough that every strategically relevant Connect Four relation needed for the empty-board proof can be represented.

Allis A1-A9 coverage already collapses to universal blocker closure; the remaining question is whether their strategy/compatibility side and the owner's parity/Zugzwang logic also collapse into one complete dependency language.

### 2. Algebraic resolution of alternatives

The critical issue is unresolved choice.

If the closure reaches:

```text
policy A works OR policy B works
```

and must recursively try A and B, that is strategic search.

A searchless solution requires the alternatives to be eliminated algebraically, for example by:

- GF(2) solution of parity/ownership constraints;
- monotone implication closure;
- canonical least/greatest fixed points;
- matching/flow-like polynomial structures;
- dominance/subsumption in the blocker lattice;
- deterministic response-policy synthesis from the event poset.

The central research question is therefore not whether certificates can be nested, but whether **nested response alternatives can be solved as one algebraic constraint system rather than branched over**.

### 3. Exact terminal authority

For a complete exact-distance solver, W/D/L closure is not necessarily enough. The closure must either:

- derive the same distance-sensitive value directly; or
- derive W/D/L searchlessly and leave only a much smaller secondary distance computation.

The first milestone should be searchless W/D/L / one-sided win impossibility. Distance can be treated separately.

## Why the hypothesis is now credible

Several formerly separate mechanisms have already collapsed onto common algebra:

1. **Future-target parity and Allis Zugzwang compatibility** are the same mod-2 event-rank invariant.
2. **All nine Allis `Solutions` relations** reduce to one blocker-subset/upward-closure operation over the existing 625-ID universe; 331,955 generated A1-A9 instances produced zero coverage mismatches.
3. **EXH/BEXH** are degenerate requirement-lattice terminal queries.
4. **Support-event state** has exhaustive small-game evidence as a sufficient semantic state abstraction.
5. **Nested dependencies** are well-founded by event/move rank.

This leaves a much smaller unresolved mathematical core than the original nine-rule/search formulation suggests.

## Strongest candidate formulation

The whole game may reduce to a finite constraint/fixed-point system:

```text
Event-poset constraints
    + GF(2) ownership/response equations
    + blocker hyperedge closure
    + monotone terminal predicates
```

The move tree would then be an inefficient operational expansion of relations already implicit in this compact system.

## Searchlessness criterion

A prototype qualifies as searchless only if:

- it does not recursively enumerate legal move continuations to choose among alternatives;
- it does not perform alpha-beta/minimax/MCTS/PNS over move states;
- it may iterate to a fixed point, solve equations, perform matching/closure, propagate constraints, or traverse a static dependency DAG;
- any internal branching must be bounded structural case analysis fixed by board geometry, not data-dependent exploration of game continuations.

## Falsifiers

The hypothesis is weakened if any of the following holds:

1. exact empty-board proof requires exponentially many incompatible response-policy assignments;
2. the universal dependency language cannot reproduce a known Allis/Zugzwang certificate without named special-case semantics;
3. closure stalls on many early states unless it recursively chooses legal moves;
4. the resulting constraint problem is effectively equivalent to solving the original game tree in size/complexity;
5. a complete W/D/L fixed point exists only after importing solved-state information produced by search.

## Decisive experiment

Build a **closure-only small-game solver**.

Inputs:

- empty board;
- geometry/event poset;
- fixed requirement universe;
- generic parity/response primitives;
- blocker closure;
- no minimax recursion.

For every complete small Connect Four variant already used in research:

- compute fixed-point terminal propositions from the empty board;
- compare against exact known W/D/L;
- record unresolved states/obligations if closure fails;
- record dependency depth;
- record number of algebraic alternative classes, if any;
- specifically determine whether unresolved alternatives can be represented/solved as GF(2), matching, monotone closure, or another polynomial object.

If the closure solves the small games from their empty roots without move-tree enumeration, progressively increase geometry toward 7x6.

## Interpretation

The strongest current research question is now:

> Is Connect Four fundamentally a game-tree problem, or is the tree only one expansion of a much smaller finite algebra of future-event ownership and winning-set obstruction?

The accumulated evidence is sufficient to justify testing the second possibility directly.
