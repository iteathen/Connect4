# IsoMax worker hot-loop cycle campaign — checkpoint 2026-09-27

**Status:** active performance research checkpoint; no gameplay-authority effect; no production-promotion claim.  
**Canonical research owner:** `research/semantic-quotient`  
**Target:** reduce current deep-worker hot-loop cycle cost by at least 50%.

This checkpoint preserves the current campaign state after recovering the older
IsoMax/Isometric optimization lineage and before completing the new support-plan
candidate.

## Current selected implementation input

JSMinSys selected source before this campaign:

`a3cf7f9ca5c90e5025542c3b27ab0b735a610e9a`

The application-selected method is the six-deep/one-wide Lazy-SMP composition.
The local-kernel experiments below deliberately isolate one evaluator first so
parallel scheduling cannot hide per-worker costs.

## GitHub-VM baseline

Measurement-only JSMinSys branch / draft PR #53 records the baseline.

Exact-head baseline workflow:
- run `36340251823`;
- Windows hosted runner / AMD EPYC 7763;
- Node 26.7.0 / V8 14.6;
- real `QueryProcessCycleTime`, no nominal-GHz conversion.

Long local control `353335714`:
- 11,755,731 nodes;
- 11,813,310 cofactors;
- approximately 3.37k cycles/node on that specific hosted VM.

Absolute cycles are not portable across GitHub jobs. Candidate decisions use
same-job paired comparisons.

Separate CPU profiling attributes approximately **63.8% sampled self time** to
the cofactor family:

```text
connect4RbaCofactorKnownHeight
+ connect4RbaCofactorBasis
+ emitSortedSetBits32
+ removeDensePrepared
+ subsetDensePrepared
```

This essentially reproduces the older ~64.9% cofactor-family hotspot despite
later IsoMax architecture changes.

## Stage 1 — dense-table realization composed with current C1

Four equal-work arms were qualified:

- A current C1 baseline: `a3cf7f9c...`
- B dense removal + C1: `629b0e1430bfebdbb18a51927d8f66b91e863ee2`
- C dense subset + C1: `f997fc3af9eaaf5ef0005821f8ead5f48d5a7d3e`
- D dense removal + dense subset + C1:
  `390aed4888a0414afaf0d4c09c051d4ef4a5a13f`

All have matching JSMinSys cycle ledgers and passed normal verification.

Factorial workflow run `36343722434`, eight balanced long-control blocks.
Every arm had exactly the same search result and metrics.

Long-control paired solve-cycle changes versus A:

```text
B dense remove + C1      -6.70%   95% descriptive [-9.28, -4.13]
C dense subset + C1      -1.88%   95% descriptive [-5.43, +1.67]
D dense both + C1        -7.88%   95% descriptive [-10.38, -5.38]
```

D is the strongest direct-recompute candidate. The gain is real but far below
the >=50% campaign target.

## Stage 2 structural observation — support-plan reuse

A measurement-only exact-key census used the key:

```text
(prepared gravity support heights, legal landing column)
```

No W/D/L, CPC, best-move or solved-position information participates.

Long-control result:
- deep cofactor calls: 11,755,740;
- unique deep support/column plans: 137,909;
- repeated deep occurrences: **98.8269%**;
- hottest plan: 82,883 calls.

Concentration:
- 5,291 keys (3.84% of unique plans) carry 78.46% of calls;
- plans used >=65 times carry 89.57% of calls;
- plans used >=33 times carry 93.37% of calls.

Reuse rises above 99% through much of the deep-rank workload.

This establishes a large exact geometry-reuse opportunity but does not prove a
cache is faster.

## Dynamic cofactor work after C1

Separate diagnostic census on the same long control:

- parent basis entries scanned: **210,780,024**;
- child basis entries emitted: **183,170,360**;
- C1 guard image candidates: 114,248,370;
- C1 absorbed images: 55,902,588 (**48.93%**);
- images still expanded: 58,345,782;
- dense subset candidate tests after C1: **448,668,285**.

Thus C1 already removes nearly half of image expansions, while hundreds of
millions of support-derived geometry operations remain.

## Active Stage 2 candidate

JSMinSys draft PR #57 / branch
`experiment/isomax-cofactor-support-plan-v1-20260927`.

Verified head at this checkpoint:

`8d9b3dd2c353a8162addd1a4babbedd84d68f18b`

The first prototype was corrected after the runtime-geometry audit rejected
fixed standard-board carrier constants. The current implementation derives:

- support radix from rows;
- support-key space from rows/columns;
- basis stride from `maxBasis`;
- coordinate word count from prepared geometry;
- terminal board size from `cellCount`.

Full JSMinSys Verify is green.

The plan payload is strictly geometry/support-derived:
- child basis;
- parent-index -> child image/index mapping;
- immutable child-basis upward-closure masks.

It explicitly does **not** store:
- W/D/L;
- CPC conclusions;
- current P0/P1 coordinate membership;
- exact-cache answers;
- best moves;
- solved-game labels.

Current coordinate membership is applied at runtime and C1 absorption remains.

A same-job Windows A/B screen of D versus the support-plan candidate is active.
No performance disposition is recorded until that run completes.

## Next decision

If support plans do not lower total equal-work solve cycles, reject them despite
the ~99% reuse rate.

If they win materially, next optimize the plan-hit application itself before
multiworker promotion, especially:
- iterate active coordinate bits rather than scanning every parent basis entry;
- reduce support-plan key formation cost;
- compress the deliberately oversized private proof-of-concept arena;
- then determine whether immutable support plans should be shared across workers.

All later performance conclusions remain host/runtime/workload scoped.
