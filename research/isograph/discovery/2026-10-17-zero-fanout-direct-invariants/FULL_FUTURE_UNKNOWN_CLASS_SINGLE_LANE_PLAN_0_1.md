# Frozen theorem experiment: quotient unknown actions by EXACT future behavior; follow one semantic lane

**Date:** 2026-10-17 Pacific. **Source HEAD at freeze:** `fb2154acb298522495e836c26da8d2285081fe18`.
**Owner:** `research/semantic-quotient`. **Goal:** general zero-strategic-fanout exact WDL and ALL equally optimal literal moves; status remains OPEN.

## Established core
Source-only two-turn exact per-action WDL rules, plus source-local paired-draw / forced-column rules, close 2,019/3,734 and 2,866/34,094 small-board q values without evaluating any future. The single-lane evaluator then follows exactly ONE unresolved q child at each rank and closes 2,881/3,734 and 5,978/34,094, zero reference discrepancies, MAX actual strategic future fanout=1.

**New exact inference before any experiment:** if the remaining unknown first actions form exactly ONE equivalence class under source-only *full-future behavioral equivalence*, a SINGLE representative successor may be evaluated. Its exact WDL is assigned to every unknown label in that class. The other actions are exact already by the source-only frontier theorem. Thus the entire action vector/minmax/ties close with one strategic continuation. If there are two or more unknown classes not connected by a proof, terminate INCOMPLETE: no search across classes is allowed.

## Sound input equivalences

- From earlier `column-transport-partial-generators.mjs`, `pair.exactFutureActionMap` gives a fixed height/capacity-preserving column mapping and mutual P0/P1 residual-upset equality for two ORIGINAL P1 first-move child games, hence exact future-program isomorphism. For P0 turns extend the same static permutation formula with the correct current mover-owned residual contraction; use the original P0/P1 completion-upset equality. Do NOT import one-way WDL dominance as equivalent futures.
- From `inert-capacity-bisimulation.mjs`, currently fully inert playable columns (ALL remaining suffix cells absent from both source R0/R1) are one dynamic neutral-token future bisimulation class with all literal labels retained, even across different capacity multisets.
- Exact mirror q automorphism, when source support and both original residual antichains are mirror-invariant, gives a further full-future class. This is a strict source check, not a policy/solved-value lookup.
- Union/transitive closure of these certified full-future congruences is sound, even when their transporters differ. However a chain of mere scalar WDL equalities does NOT justify using one continued future representative unless all edges carry full behavioral equivalence (one fixed column program mapping or dynamic neutral-token bisimulation).

## Candidate algorithm (one lane)
At source q:
1. run existing source-only `direct-two-turn-frontier-operator` to collect exact per-action values and labels;
2. if complete, output exact WDL and ALL tied best labels;
3. build an undirected labelled equivalence graph using source-only full-future program certificates for remaining unknown actions; never build a future child game in equivalence construction.
4. for any component containing an exact-known action, assign its same scalar WDL to all unknown labels **with the full-future equality proof**;
5. if remaining unknown labels are all in one component, take ONE representative (smallest literal label), produce ONE true q cofactor, and continue this same algorithm. Propagate its WDL to all equivalent labels and compute the exact complete best set including potentially tied exact-known actions;
6. otherwise return INCOMPLETE, producing NO speculative child, with explicit remaining unknown inequivalent groups.
7. stop at terminal/cofactor rank; no branching/minimax fallback.

Proof: full-future congruence makes every equivalent action's unrestricted WDL equal; the source-only direct values are exact. At most one q descendant is ever evaluated at a time. Well-founded rank induction then yields exact WDL/action vectors and complete ties whenever a lane closes.

## Falsifiers and scope
Independently exhaust every q on 4x3-c3 (3,734) and 4x4-c4 (34,094), compare exact entire WDL and all action values/move labels to separate exact-q reference **after derivation**, count exact new closure beyond previous one-lane, max strategic fanout, nonreflection equivalence groups consumed, inert neutral groups consumed, unknown-class failures. Read no solved/reference values in producer. Preserve `223` quantifier order, `111` short-horizon-same/full-game-different, original historical move7/8 transition, source after `44444` UNKNOWN unless actually closed.

Original 60k-node/300k-source-work/10k-support/15s per source controls remain safety envelopes and must not be silently increased. Solve runtime irrelevant to theorem. Full Connect4 ZERO-branch result is achieved ONLY if all legal source states can be exact in one semantic lane; partial improvements are scoped results.
