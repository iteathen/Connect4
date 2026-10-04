# Triadic relational normalization experiment 0.1

**Date:** 2026-10-03
**Branch:** `experiment/triadic-relational-normalization-20261003`
**Status:** frozen design before execution
**Research direction:** Joshua Oshiro

## Question

Do the independently developed UC4A regime-defect system and CPCX turn-6 carrier-transition system reduce, after separate domain-native normalization, to the same anonymous triadic coupling topology?

This is a structural-isomorphism probe only. It does not assert a three-body equivalence, computational irreducibility, value theorem, or remoteness impossibility.

## Anti-bias rule

Normalize UC4A and CPCX independently before comparing them.

Do not force CPCX certificate names into UC4A coordinates and do not use the UC4A 3:1 direction as a target fit for CPCX.

The cross-system comparison may permute anonymous channel labels only after both normalized outputs are frozen.

## UC4A normalization

Source:
`UC4A_IP_REGIME_SUBSPACE_TOMOGRAPHY_0_1.json`

Use only already-frozen directed defect directions.

Collapse exact fields into three predeclared channels:

- **U-A (axis-core):** left-right and geometric top-bottom reflection-fixed I-core fields.
- **U-R (rotation-core):** rotation-180 reflection-fixed I-core fields plus non-reflection I-core/incidence fields.
- **U-P (phase-path):** all `P.*` fields.

For each defect direction emit the active-channel mask over `{A,R,P}`.

Analyze both all nonzero directions and the already-frozen `extendedGridRecurring=true` subset.

## CPCX normalization

Use the exact turn-6 P1-boundary set produced from the current move-6 unresolved classes. When a source class is P0-to-move, first apply qualified controller saturation v0.2 to reach its open P1 boundary. Then apply qualified opponent-response descent v0.2.

For every exact nonterminal response-descent row compare source and final boundary through three predeclared channels:

- **C-C (carrier):** protected residual physical line/target-role identity: line id, orientation, missing-cell role set, and missing cardinality.
- **C-S (support):** protected residual support-distance profile and support debt.
- **C-R (response):** current P0 progress classification plus exact immediate-boundary class.

Emit the changed-channel mask over `{C,S,R}`.

Terminal first-win rows are counted separately and do not manufacture a successor mask.

## Pairwise nonclosure diagnostic

For each system, drop each one of the three channels in turn.

A projection is observationally non-closing in this finite test if two records agree on the retained two-channel source signature (and the same externally supplied transition selector where applicable) but require different full normalized successor/defect masks.

This is evidence only for the consumed cohort; absence of a collision is not a proof of pairwise closure.

## Cross-system comparison

After both sides are frozen, test all six permutations between UC4A and CPCX anonymous channels.

For each permutation compare:

1. observed nonzero mask set;
2. recurring mask set;
3. counts of singleton / pair / triple masks;
4. which dropped-channel projections show ambiguity.

Select the permutation maximizing exact mask-set overlap; ties are reported, not broken semantically.

## Strong positive signal

A strong first-pass signal requires all of:

1. both systems exhibit at least two distinct pair masks;
2. neither system collapses to one permanently dominant single channel;
3. at least one drop-one-channel projection is ambiguous on each side;
4. a channel permutation aligns most or all recurring pair masks;
5. CPCX carrier changes do not destroy the normalized class but re-enter another active mask.

## Strong falsifiers

- UC4A recurring defects are almost entirely one-channel.
- CPCX descent is effectively one-channel monotone with no channel exchange.
- No channel permutation produces meaningful mask overlap.
- The apparent match depends on using certificate names or solved outcomes.
- A claimed pairwise-nonclosure result disappears when the transition selector is included.

## Claim boundary

A positive result supports only:

> UC4A and CPCX instantiate a common triadic relational transition topology under the frozen normalizations.

It does not establish:
- equality to the Newtonian three-body equations;
- undecidability or computational irreducibility;
- strong-remoteness impossibility;
- a turn-6 best-move theorem;
- a universal UC4A theorem.
