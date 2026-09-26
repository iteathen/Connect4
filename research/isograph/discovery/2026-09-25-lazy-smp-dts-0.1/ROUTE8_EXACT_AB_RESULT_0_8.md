# Lazy SMP DTS 0.1 — Exact Route-8 A/B Result 0.8

**Date:** 2026-09-25  
**Status:** COMPLETE; mixed by protected-displacement density  
**Authority effect:** none  
**Solver-method effect:** experimental shared-cache policy only

## Exact anchors

- baseline JSMinSys: `04d37498607ace16dae33c79462ddfe1503c8a0d`
- protected route-6/8 candidate: `05a699b575e15d4039d835af61aa5c35b00822e1`
- JSMinSys PR: #48
- Connect4 head: `0e1fe8d6ea9dea3fe93ab4ac8b2cf7f9566e976e`
- workflow: `IsoMax CPC Route8 Exact A-B`
- run: `36203919806`
- samples: six baseline + six candidate per position

Every sample on both positions returned the expected exact value/witness, clean teardown, and four-worker exit. Winner-node count was identical between baseline and candidate on each position.

## Primary route-8 stress control

Position:

`13333111271421`

Diagnostic displacement evidence:

```text
route8 stores:     30
route8 displaced:  25
all 25 displaced by incoming route5
```

Exact result: +1 / witness 2.

| metric | baseline | candidate | delta |
|---|---:|---:|---:|
| wall | 2493.544 ms | 2434.661 ms | **-2.36%** |
| CPU | 9364.3 ms | 9286.5 ms | **-0.83%** |
| process cycles | 22.9028 B | 22.6519 B | **-1.10%** |
| winner nodes | 914,814 | 914,814 | 0.00% |
| shared hits | 121,937 | 123,209 | +1.04% |
| shared stores | 5,057.2 | 4,984.0 | -1.45% |

This is the first clean completion-cost evidence supporting the protected-residency mechanism.

## Independent lower-displacement route-8 control

Position:

`13333111271415`

Diagnostic displacement evidence:

```text
route8 stores:     10
route8 displaced:   5
all 5 displaced by incoming route3
```

Exact result: -1 / witness 5.

| metric | baseline | candidate | delta |
|---|---:|---:|---:|
| wall | 2912.925 ms | 2939.330 ms | +0.91% |
| CPU | 10950.7 ms | 11067.3 ms | **+1.07%** |
| process cycles | 26.7824 B | 27.0297 B | **+0.92%** |
| winner nodes | 1,169,179 | 1,169,179 | 0.00% |
| shared hits | 95,881 | 97,695 | +1.89% |
| shared stores | 3,653.7 | 3,645.7 | -0.22% |

The mechanism increases reuse but not enough to repay its implementation cost at this lower displacement density.

## Combined DTS interpretation

The sign reversal is informative:

```text
high route8 displacement density
    -> protected residency pays

low route8 displacement density
    -> reuse rises but overhead dominates
```

The route-6 exact control was also mildly negative (+0.46% cycles).

Therefore the broad v1 rule:

```text
protect route6 or route8
against routes 3/4/5
```

is **not globally merge-qualified**.

The transition-level leverage hypothesis itself is supported: the same mechanism crosses from net negative to net positive as the protected high-reuse transition is displaced often enough.

## Disposition

```text
PR #48 v1 correctness:             PASS
route8 high-displacement benefit:  SUPPORTED
route8 low-displacement benefit:   FALSIFIED
route6 benefit:                    FALSIFIED on exact control
v1 global promotion:               REJECT / DO NOT MERGE
DTS leverage structure:            SUPPORTED
```

## Next refinement

The next candidate should reduce the global recurring cost and narrow the protected class to the strongest semantic route: **long-range response (route 8)**.

Do not carry a full 1..8 route tag through every CPC exact closure merely to protect one rare class. Investigate the cheapest route-8-only signal/encoding, while retaining exact WDL in the existing shared value word and keeping the shared cache optional.
