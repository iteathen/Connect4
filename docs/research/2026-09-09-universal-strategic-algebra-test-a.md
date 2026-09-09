# Universal strategic algebra — Test A result: Allis A1-A9 blocker coverage

**Date:** 2026-09-09  
**Status:** structural/mechanism evidence only.  
**Parent hypothesis:** `2026-09-09-universal-strategic-algebra.md`

## Question

Can the nine named Allis strategic-rule `Solutions` relations be represented by one generic operation over the existing 625-ID residual requirement lattice?

The tested universal operation is:

```text
blocker b := exact strategic guarantee that opponent cannot own all cells of b

Solved(b) := every residual requirement r with b subset_of r

Solved(B) := union over b in B of Solved(b)
```

`Solved(b)` is implemented as the same precomputed upward-closure relation already used by residual subset/implication work.

## Test construction

A Node/JavaScript-only research prototype generated deterministic random legal 7x6 states at plies:

```text
8, 12, 16, 20, 24, 28, 32, 34
```

For P0 residual requirements, it generated instances matching the formal solution shapes of:

- A1 Claimeven;
- A2 Baseinverse;
- A3 Vertical;
- A4 Aftereven;
- A5 Lowinverse;
- A6 Highinverse;
- A7 Baseclaim;
- A8 Before;
- A9 Specialbefore.

For every instance two solved-requirement masks were computed independently inside the harness:

1. the rule-specific predicate from the formal `Solutions` statement;
2. generic U2 coverage by OR-ing the precomputed upward closures of the rule's blocker set(s).

This is a **coverage-shape test**, not a proof that every generated strategic instance is valid or mutually compatible. Response-policy validity belongs to U1.

## Result

- legal roots: **1,732**;
- total generated rule instances: **331,955**;
- requirement/blocker universe: **625 IDs**;
- solved-group mismatches: **0**.

Per rule:

| Rule | Instances | Mismatches |
|---|---:|---:|
| Claimeven | 15,036 | 0 |
| Baseinverse | 25,939 | 0 |
| Vertical | 10,311 | 0 |
| Aftereven | 1,844 | 0 |
| Lowinverse | 32,787 | 0 |
| Highinverse | 32,787 | 0 |
| Baseclaim | 55,956 | 0 |
| Before | 26,976 | 0 |
| Specialbefore | 130,319 | 0 |

Executed source SHA-256:

`ed05eefbcff207b489a8f10c5490040e5116d986fcacc2e52e639189e19ce516`

Preserved source:

`reference/research-prototypes/2026-09-09-low-confidence-survival/allis_blocker_unification.mjs`

Structured evidence:

`docs/research/evidence/2026-09-09-universal-blocker-unification.json`

## Interpretation

This substantially raises confidence in **U2 blocker-lattice closure**.

The named Allis rules differ in how they establish strategic control, but their opponent-group coverage does **not** require nine representations or nine coverage algorithms. In every tested rule family the terminally relevant output reduces to one or more blocker subsets, and the existing 625-ID upward closure reproduces the formal solved-group relation.

Updated assessment:

- `A1-A9 -> U2 coverage unification`: **very strong**, confidence **0.96**;
- `U2 can replace named rule-specific solved-group representation`: confidence **0.95**;
- `U2 alone replaces rule compatibility/strategy selection`: **false / not claimed**. That remains U1's unresolved problem.

## Consequence for the unification search

The remaining hard question is sharply isolated:

> Can U1 generate/validate one globally coherent parity-response policy cheaply enough that named rule types and their pairwise compatibility table also disappear?

If yes, A1-A10 + ZPAR + exhaustion become different consequences/queries over one strategic algebra. If no, U2 is still a clear universal coverage owner, while strategy selection remains a smaller separate subsystem.
