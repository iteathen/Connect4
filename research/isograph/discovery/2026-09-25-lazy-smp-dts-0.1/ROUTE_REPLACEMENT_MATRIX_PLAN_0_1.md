# Lazy SMP DTS 0.1 — Route Replacement Matrix Plan 0.1

**Date:** 2026-09-25  
**Status:** CHECKPOINTED BEFORE IMPLEMENTATION  
**Authority effect:** none  
**Solver-method effect:** none

## Live anchors

- IsoGraph: `iteathen/IsoGraph@419f3d13ab5480d72fcd78f51502e5928bf5280f`
- JSMinSys production baseline: `04d37498607ace16dae33c79462ddfe1503c8a0d`
- JSMinSys measurement branch: `experiment/lazy-smp-dts-overlap-census-v1@2bde34d4869c1c6d58525eef02db6412109cb03b`
- Connect4 measurement branch: `experiment/isomax-lazy-smp-dts-overlap-v1@d0f7f6f61b4bb80a675baf964f85a5d1f0a216cd`
- Canonical research owner before this checkpoint: `4ab376942e023987f3106d2f24a696203c7eb19c`

## Question

The CPC exact-route census found large reuse asymmetry:

- long-range response: rare stores, extreme consumed-hit leverage;
- all-lift: low store share, high reuse;
- multiple-opponent-threat closure: materially lower reuse/store.

The next question is whether high-reuse rows are actually being displaced by lower-reuse incoming rows in the direct-mapped shared exact cache.

## Measurement

For every successful diagnostic shared-store ownership event whose slot already contains a committed generation:

1. read the displaced route while writer ownership is held;
2. compare the incoming full qualified q_r key with the displaced full key;
3. classify the event as:
   - same-key refresh;
   - different-key collision/replacement;
4. increment a 12 x 12 incoming-route x displaced-route matrix for each class.

Hash/slot equality is never identity authority; the refresh/collision split uses complete key equality.

## Falsifiers

Route-aware replacement protection is not justified if:

- high-reuse route rows are rarely displaced;
- displacement is dominated by same-key refresh rather than different-key collisions;
- high-reuse routes mostly displace each other;
- or lower-reuse -> high-reuse displacement volume is too small to plausibly repay any added admission/replacement branch.

## Next gate

Only if the matrix establishes material asymmetric harmful displacement should a behavior-changing route-aware replacement candidate be built. Any such candidate must update the cycle ledger in the same change and pass same-runner four-worker qualification plus hard probes.
