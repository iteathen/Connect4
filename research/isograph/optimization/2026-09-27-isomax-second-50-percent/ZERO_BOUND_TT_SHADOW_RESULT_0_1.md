# Phase 2 zero-bound TT shadow census

Date: 2026-09-27
Status: diagnostic result; implementation justified, no performance claim.

## Provenance

Frozen denominator:
`10380f79af68dc1f57455d535814ac0a7eacea33`

Dedicated shadow branch:
`experiment/isomax-phase2-bound-shadow-20260927`

Workflow:
- run `36356316056`
- artifact `10944012879`
- digest
  `sha256:663c7233b59595b4e4b41c837162b929efe0f8ce9adbabc2fe9ad782c7165290`

The shadow tables do not alter alpha, beta, return values, the real exact cache,
or search order. Instrumented timing/cycles are invalid. Results below are reuse
opportunities along the unchanged denominator tree; a realized candidate will
change that tree and must be measured separately.

All policies used the same 1M-slot direct-map index as the local exact cache and
conservatively refused a bound store whenever the real slot currently contained
any exact entry.

## Long control — 353335714

Production denominator remains:
- 11,755,731 nodes
- 11,813,310 cofactors
- 3,298,018 exact-cache hits
- exact W/D/L/root move unchanged.

### Search-derived bounds only

Sources:
- fail-high / terminal child returning mover-relative 0 -> LOWER0;
- completed narrow fail-low with best 0 -> UPPER0.

Results:
- probes after exact miss: **8,457,713**
- shadow hits: **3,172,498** (**37.51%**)
- immediate cutoff opportunities: **2,715,477**
- cutoff per hit: **85.59%**
- window-tighten opportunities: 5,231
- no-op hits: 451,790
- candidate stores: 3,680,721
- stores blocked to protect a real exact slot: 1,774,612
- retained-store opportunity after protection: ~51.79%

The repeat/cutoff signal is extremely strong.

### CPC-derived two-value interval bounds only

Sources:
- semantic interval [0,+1] -> LOWER0;
- semantic interval [-1,0] -> UPPER0.

Results:
- hits: **2,227,186** (26.33% of probes)
- immediate cutoff opportunities: **712,377**
- cutoff per hit: 31.99%
- stores: 2,427,250
- exact-protected stores: 1,076,547.

Useful, but substantially weaker cutoff economics than search-derived bounds.

### Combined shadow policy

Results:
- hits: **4,132,300** (48.86%)
- immediate cutoff opportunities: **3,298,018**
- cutoff per hit: 79.81%
- tighten opportunities: 6,192
- stores: 6,107,971
- exact-protected stores: 2,851,159.

Combined coverage is largest, but store pressure is also much larger.

## Short control — 45461667

Search-only:
- 877 hits / 52,851 probes (1.66%)
- 717 immediate cutoff opportunities
- 1,163 stores.

CPC-only:
- 767 hits (1.45%)
- 206 immediate cutoff opportunities.

Combined:
- 1,110 hits (2.10%)
- 881 immediate cutoff opportunities.

The bound mechanism is therefore primarily a hard/deep-workload optimization.
Any retained implementation must not materially regress short solves.

## Interpretation

The shadow hypothesis survives very strongly on the hard long control.

The best first implementation is **not automatically combined**. Search-only
has the best hit-to-cutoff economics and much lower store volume than combined.
Because full q-key publication is expensive and direct-map pollution matters,
the realized experiment must separate:

A. current Stage-9 denominator;
B. search-derived local LOWER0/UPPER0 only;
C. CPC-derived local LOWER0/UPPER0 only;
D. combined.

All bound entries must:
- remain local/private;
- never enter the shared exact cache;
- never evict an existing exact local slot in the first experiment;
- be overwritten by exact information;
- use the existing value byte where possible;
- preserve public exact-only probe semantics.

## Correctness gate

Before timing:
- full JSMinSys Verify;
- directed narrow-window 4x4 physical-oracle test;
- late standard-7x6 exact-oracle controls;
- exact endpoint-cache tests;
- no bound code visible through public exact-cache probe APIs.

Performance promotion then requires whole-solve cycles/wall plus nodes/cofactors,
not node reduction alone.
