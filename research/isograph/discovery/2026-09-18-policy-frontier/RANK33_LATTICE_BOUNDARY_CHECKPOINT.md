# Rank-33 lattice-boundary checkpoint

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Status:** first rank-33 probe closed after deriving the residual-antichain lattice law
**Authority effect:** none
**Research direction:** Josh Oshiro

## Resume chain

Read `TWO_SIDED_BOUNDARY_PROPAGATION_CHECKPOINT.md`, `RANK34_BOUNDARY_PROPAGATION_CHECKPOINT.md`, `RANK34_SPARSE_ENVELOPE_RESULTS.json`, then this file.

## Rank-33 scale change

The immediate rank-33 parents of `[5,5,2,4,6,6,6]` have 12,929 to 49,682 single-player residual antichains. The largest explicit parent pair domain would be 2,468,301,124 states, so pair enumeration is no longer a reasonable construction or default oracle.

## Two lower-bound implementations rejected

On `[5,5,1,4,6,6,6]` (21 residual shapes, 12,929 antichains/player), upper propagation completed with max root Upper width 146 and max action-preimage candidates 214.

Complement-based Lower dualization was rejected after one threshold produced 5,888 distinct mover-active patterns and exceeded the bounded run.

A symmetric Lower recurrence was then tried: child Upper -> fixed-action parent Lower -> intersect action downsets. Its first implementation scanned all antichains to find coordinate common lower/upper bounds and also exceeded the bounded run. Do not repeat either implementation with a larger timeout.

## New structural law: residual-antichain lattice

For fixed support S, let P(S) be the finite poset of support-local residual shapes ordered by cell-set inclusion.

A normalized residual antichain A represents the upward-closed subset Up(A) = { r in P(S) | some a in A satisfies a subseteq r }.

The favorable formula order A >= B is exactly Up(A) superset Up(B). Therefore all normalized antichains over P(S) form the finite distributive lattice of upsets of P(S).

Join is `normalize(A union B)` and satisfies Up(A join B) = Up(A) union Up(B).

Meet is the antichain of minimal residual shapes in Up(A) intersection Up(B), and satisfies Up(A meet B) = Up(A) intersection Up(B).

This is a lattice law for the support-local residual-shape coverage order. It is not a claim that unrestricted Boolean DNF conjunction creates no new arbitrary cell-set terms.

## Exact state-downset intersection

For current beneficiary p, state favorability is mover formula order × reversed opponent formula order.

For maximal downset generators g=(g_m,g_o) and h=(h_m,h_o), the intersection of their principal downsets has one maximal product generator:

`(g_m meet h_m, g_o join h_o)`.

Thus Down(G) intersect Down(H) is obtained by forming these boundary-pair meet/join candidates and maximal-normalizing them. No scan of the full single-player antichain set is required to discover common bounds.

## Qualification

Meet/join was attacked on both rank-35 pathological supports with 12,500 basic order checks per support and then substituted into the full direct-Lower recurrence. All tested order laws passed and every rank-35 Lower threshold boundary matched the prior enumerated result exactly.

The previously oracle-qualified rank-34 cone `[5,5,5,1,6,6,6]` was rerun with lattice downset intersection. Every Upper and Lower boundary remained identical to the prior 480/480 exact oracle-qualified result. The lattice implementation completed that prototype recurrence in about 1.16 s.

## Rank-33 retry

Target: `[5,5,1,4,6,6,6]`.

Domain: 21 residual shapes, 12,929 antichains/player, 167,159,041 would-be parent residual pairs. No pair oracle was built.

Complete generator-only recurrence ranks 33..42 closed with:

- supports: 72
- max antichains/player: 12,929
- max fixed-action Upper candidates: 536
- max fixed-action Lower candidates: 513
- max Lower-intersection candidates before normalization: 41,307
- max stored Upper width: 359
- max stored Lower width: 372
- bounded prototype elapsed: ~19.9 s

Root rank-33 Upper widths by ordered threshold: 1, 8, 17, 71, 146, 145, 82, 23, 5, 4.
Root rank-33 Lower widths: 8, 13, 36, 114, 250, 101, 39, 6, 1, 1.

The 41,307 intermediate lattice-intersection candidates collapse to at most 372 stored generators.

## Current recurrence

Upper: child Lower -> coordinate-separable fixed-action Upper preimage -> union across actions -> parent Upper.

Lower: child Upper -> coordinate-separable fixed-action Lower preimage -> intersect action downsets using mover meet + opponent join -> parent Lower.

No distributed proof-alternative product and no P0/P1 residual-pair value census is part of this construction.

## Next executable step

Test `[5,5,2,3,6,6,6]`: 24 residual shapes, 49,682 antichains/player, would-be pair domain 2,468,301,124.

Do not build the pair domain. Measure cofactor-preimage scans, action Upper/Lower candidates, lattice-intersection candidates, stored boundary widths, time and memory.

If it fails, identify whether the new wall is antichain enumeration, cofactor-preimage extremization, boundary-pair lattice products, or stored generator width. Do not increase timeout before that classification.

## Disposition

- rank-35 distributed proof wall: bypassed on value-boundary path
- rank-34 immediate predecessor envelope: closed
- complement-pattern Lower method: rejected
- scan-common-bound Lower method: rejected
- residual-antichain meet/join law: deductive candidate
- lattice Lower intersection: qualified on prior exact controls
- rank-33 12,929-antichain probe: closed
- rank-33 49,682-antichain probe: next
- empty root solved: no
- new IsoGraph relation promoted: no
