# Negamax optimization candidates

**Status:** research candidate matrix; negamax selected as the forward value formulation, production driver not yet selected

**Branch:** `research/semantic-quotient`

## Purpose

With the forward solver standardized on side-to-move-relative negamax over the shared relational state `q`, identify optimizations that become newly available, materially cheaper, or architecturally cleaner than in the historical root-relative minimax implementation.

The common semantic state remains:

```text
q = support/accessibility
  + side-to-move orientation
  + normalized P0 residual requirements
  + normalized P1 residual requirements
```

The search implementation may use current/opponent views derived from `q`, but must not create a second state ontology or become incompatible with CUDA-BSFP/hybrid proof exchange.

## Baseline properties that become structural defaults

These are not optional add-ons in the new generation; they are consequences of choosing negamax and should be part of the baseline unless falsified by implementation evidence.

### N0 — single-perspective exact value

```text
V(q) = max_a -V(T(q,a))
```

All TT values and bounds are side-to-move relative. Historical root-player score duplication is removed.

Expected effects:

- one score/bound/depth/best-action record per semantic identity;
- no P0/P1 or root-perspective TT duplication;
- simpler exact BSFP value injection;
- simpler null-window and PVS/MTD(f) kernels.

### N1 — fail-soft negamax bound semantics

On a cutoff, return/store the best proved value rather than clipping every result to alpha/beta. This can make TT bounds more informative for subsequent null-window searches and transpositions while preserving exactness when bound flags remain explicit.

The campaign should compare fail-soft against a fail-hard control rather than assume the benefit.

## Primary campaign candidates

### N2 — W/D/L-native negamax

The product goal is exact root W/D/L. The historical strong-score solver carries distance-sensitive values through every node. Under negamax we can instead search directly in:

```text
{-1, 0, +1}
```

and optionally refine distance only when a consumer explicitly requests it.

Potential benefits:

- dramatically smaller value domain;
- cheaper TT payload and comparisons;
- at most a few threshold/null-window probes;
- exact compatibility with CUDA-BSFP v1, whose authoritative result domain is W/D/L;
- no wasted distance proof work when root W/D/L is sufficient.

This is the highest-priority semantic optimization candidate.

### N3 — exact remaining-distance envelope pruning

For rank `r`, only a bounded set of strong scores remains possible. Intersect the incoming alpha/beta window with the exact rank-derived score envelope before searching children.

This is the Connect4 analogue of mate-distance pruning, but the bound must be derived from this solver's exact strong-score convention rather than imported from chess.

Falsifier: any strong-score mismatch.

### N4 — Enhanced Transposition Cutoff / child-bound probing

Because `T(q,a)` yields compact relational child identity directly, probe already-known child TT bounds before recursively expanding the node.

Use the negamax sign relation to determine whether a child bound already proves the parent's beta cutoff. If no immediate cutoff exists, child bounds may also improve move ordering.

Measure:

- extra probes;
- cutoffs obtained without recursive expansion;
- expansion reduction;
- elapsed-time change.

This is especially relevant to the relational DAG because semantic collapse raises transposition reuse.

### N5 — side-normalized cutoff history + killer/refutation ordering

Negamax removes the need for separate max/min or player-specific ordering statistics. Maintain a single side-to-move-relative ordering policy over Connect4 actions.

Candidates:

- cutoff history indexed by remaining rank and column;
- one/two killer columns per remaining rank;
- optional previous-refutation/countermove column.

All are hints only; they carry no proof authority.

With only seven columns, any dynamic ordering policy must beat its own bookkeeping cost.

### N6 — W/D/L first, distance refinement second

When strong distance is requested, first prove the outcome class using W/D/L-native negamax, then restrict the strong-score search to the proved sign class.

For draw, refinement is unnecessary under the current strong-score contract because exact draw score is zero.

For wins/losses, the first phase may significantly narrow the subsequent strong-score domain.

This also matches the hybrid seam naturally: CUDA-BSFP may provide W/D/L while forward search optionally refines distance.

### N7 — aspiration / threshold driver over the single-perspective TT

Negamax makes narrow-window drivers uniform:

```text
search(q, alpha, beta)
child -> -search(child, -beta, -alpha)
```

Candidates include:

- aspiration around a prior exact/qualified guess;
- PVS/NegaScout;
- MTD(f) repeated null-window probes;
- W/D/L threshold tests.

Search-method campaign v1 already showed PVS and MTD(f) effectively tied ahead of plain alpha-beta on the larger bounded controls. This campaign should evaluate these only after the new negamax-specific optimizations are composed.

### N8 — child-bound ordering

A lighter form of ETC: probe child TT records and order children by the strongest available negated bound before ordinary center/history order.

This is safe because it changes order only. It is distinct from N4 because it may be useful even when no child proves an immediate cutoff.

### N9 — BSFP W/D/L singleton injection + optional strong refinement

An exact BSFP W/D/L fact at `q` collapses the negamax W/D/L interval immediately. For strong-distance search it narrows the permitted score sign and may permit class-specific bounds.

The optimization campaign may use an idealized boundary only to measure forward-work leverage. End-to-end promotion requires actual BSFP construction/query cost.

## Candidates retained but deferred from the first campaign

### N10 — internal iterative deepening / shallow ordering search

Historically useful when no TT move exists, but exact Connect4-to-terminal search has no free heuristic horizon. A shallow ordering search would need a separately qualified non-authoritative evaluator. Defer until the packed relational kernel exists.

### N11 — generalized refutation/countermove tables

Potential extension of N5 if simple history/killer evidence is positive. Do not introduce a larger dynamic policy table before the low-cardinality version wins.

### N12 — score/bound packing and one-record TT layout

Likely implementation gain from the single-perspective contract, but it belongs to the packed-kernel/equal-byte campaign rather than proof-work comparison.

## Explicit exclusions from the exact candidate campaign

Do not import selective chess pruning simply because negamax makes the formulas easy.

Excluded pending independent Connect4 soundness proof:

- null-move pruning;
- futility pruning;
- razoring;
- late-move reductions that can omit exact proof work;
- speculative forward pruning based on heuristic evaluation;
- probabilistic TT equality.

Safe ordering use of heuristic information is allowed; using it as proof authority is not.

## Campaign design

The first negamax optimization campaign should use the same precompiled exact relational DAG as search-method campaign v1. This deliberately isolates search-control/proof-work effects before physical transition cost enters.

Compare at least:

```text
A0 strong negamax + exact interval TT + relational tactics + center order
A1 A0 + exact rank/distance envelope
A2 A0 + ETC
A3 A0 + history/killer ordering
A4 A0 + envelope + ETC + history/killer
W0 W/D/L-native negamax + exact TT + relational tactics
W1 W0 + ETC + history/killer
R0 W/D/L first -> strong-distance refinement
```

For each serious candidate measure both standalone and with the same ideal ~50% BSFP boundary used in campaign v1.

Metrics:

- exact root result;
- expanded states;
- recursive calls;
- TT exact/bound returns;
- ETC child probes and direct cutoffs;
- history/killer ordering hits and first-move cutoff rate;
- tactical closures;
- BSFP hits;
- median search-only elapsed time.

## Promotion rule

A candidate advances only if it preserves exactness and improves a meaningful combination of proof work and elapsed time. Because the campaign runs over a precompiled DAG, elapsed time is search-driver evidence only; production promotion still requires the packed/on-the-fly relational kernel.
