# Phase 2 lead — local zero-bound transposition reuse

Date: 2026-09-27
Status: candidate theorem/design; not implemented or qualified.

## Observation

The selected CPC-only alpha-beta lane probes a direct-mapped local exact cache
before CPC at every recursive q.

The local cache value carrier is Uint8, but exact W/D/L currently uses only:

- 1 = absolute P1 win;
- 2 = draw;
- 3 = absolute P0 win.

Interior alpha-beta cutoffs are deliberately not stored because they are bounds,
not exact q truth.

## W/D/L-specific reduction

In mover-relative W/D/L, the value domain is exactly:

    {-1, 0, +1}

Therefore the only **nontrivial non-exact threshold bounds** are:

    LOWER0: value >= 0
    UPPER0: value <= 0

Bounds >= -1 and <= +1 carry no information. Bounds >= +1 and <= -1 are exact
wins/losses and already belong in the exact cache.

Thus local bound reuse needs only two additional byte codes. No second value
array is mathematically required.

## Information/provenance boundary

These bounds are derived online from the current exact search/CPC state.

They contain no:
- solved-game prior;
- precomputed W/D/L;
- best move from an offline solution;
- BSFP solved-position answer.

They are admissible under the strict IsoMax provenance rule.

## Safe probe semantics

A local LOWER0 hit may:
- return bound 0 immediately if beta <= 0;
- otherwise raise alpha to 0 when alpha < 0.

A local UPPER0 hit may:
- return bound 0 immediately if alpha >= 0;
- otherwise lower beta to 0 when beta > 0.

A bound code MUST NOT be consumed by exact-only APIs or published to the shared
exact cache.

Shared-worker publication remains exact-only unless separately proven.

## Candidate store sources

Potentially reusable LOWER0:
- CPC semantic interval [0,+1];
- fail-high/cutoff whose established best is 0.

Potentially reusable UPPER0:
- CPC semantic interval [-1,0];
- fail-low completion establishing value <= 0.

Exact +/-1 and exact draw remain exact-cache values.

## Primary risks

1. **Cache pollution**
   Frequent bound entries may evict more valuable exact entries in the same
   direct-mapped table.

2. **Store cost**
   Publishing a full q key for weak bounds may cost more cycles than later
   avoided work.

3. **Shared exact masking**
   A local bound must not accidentally hide a sampled shared exact hit in the
   multiworker path without measuring that trade.

4. **Forced-chain frame**
   Bounds are mover-relative to the current q inside searchCpcOnly. Store/probe
   logic must remain on the current q before the forced-tail sign is returned
   to the caller.

5. **Exact-only consumers**
   Existing public exact-cache probe APIs and non-CPC search lanes must never
   interpret bound codes as exact W/D/L.

## Low-risk experimental realization

Prefer a new CPC-only local probe path:

- existing exact-only probe remains unchanged for public/non-CPC consumers;
- new search probe may return exact or LOWER0/UPPER0;
- bounds never enter shared exact storage;
- exact stores may replace bounds;
- first candidate should prevent a bound store from evicting an existing exact
  slot, even if this reduces bound coverage.

This preserves the current exact cache as the higher-value information class.

## First measurement

Before broad implementation, measure at least:
- candidate bound stores;
- repeat hits on the same q;
- bound hits that would immediately cutoff;
- bound hits that would only tighten alpha/beta;
- rank distribution;
- exact slots protected from bound replacement.

If shadow hit/cutoff rates are weak, reject without adding hot-path complexity.

If strong, run an isolated A/B from the frozen Phase-2 denominator
`10380f79af68dc1f57455d535814ac0a7eacea33` and report:
- total process cycles;
- wall;
- nodes;
- cofactors;
- exact hits;
- bound hits/cutoffs;
- CPC counts;
- memory.

Node reduction alone is not sufficient.
