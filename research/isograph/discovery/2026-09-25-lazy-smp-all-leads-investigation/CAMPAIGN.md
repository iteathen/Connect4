# Lazy SMP — All Leads Investigation

**Date:** 2026-09-25  
**Owner:** `research/semantic-quotient`  
**Status:** COMPLETE  
**Authority effect:** none  
**Solver-method effect:** none  
**Search-method subject:** JSMinSys Lazy SMP  
**Baseline JSMinSys:** `04d37498607ace16dae33c79462ddfe1503c8a0d`

## Purpose

Investigate every lead retained by the full Lazy-SMP IsoGraph / NEI / QU / DP translation and the fresh DP rerun.

The campaign kept causal questions isolated:

- measurement-only instrumentation was separated from behavior-changing candidates;
- all performance comparisons used exactly four Lazy-SMP workers;
- shared-sample policy remained mask 7 unless the experiment specifically measured the mask itself;
- correctness/witness contracts were not weakened to rescue a performance candidate;
- every modified JSMinSys path retained same-change cycle accounting.

## Evidence runs

### Measurement / topology

- JSMinSys measurement branch: `experiment/lazy-smp-lead-census-v1`
- first measurement head: `4e38335993b6900759dbac7cb09a0ada31190ff9`
- rank-resolved measurement head: `1b882b39a412f11fef5cdedafadfbbe6d4eac6f5`
- JSMinSys Verify: `36159811677`, `36161523854` — success
- Connect4 lead census: `36159882004` — success
- Connect4 rank-resolved census: `36161559144` — success

### Candidate A/B

- lead A/B run: `36160377796`
  - shared-hit local backfill
  - root-order diversity
  - wake-driven wait
- remaining-leads run: `36161121512`
  - spread recursive offsets
  - shifted shared-slot address
  - cross-invocation persistence
  - post-DONE loser-fault policy
- shifted-slot confirmation: rerun attempt 2 of `36161121512`
- shifted-slot hard/empty check: `36161744696`

All accepted measurements retained exact W/D/L controls. Where a candidate violated the move-witness contract it was rejected before performance acceptance.

## Final lead dispositions

| Lead | Disposition |
|---|---|
| deterministic share blind region / leverage | **STRUCTURE ESTABLISHED; HASH PARTITION IS RANK-NEUTRAL; LEVERAGE-AWARE SHARING REMAINS OPEN** |
| shared hit -> local backfill | **REJECTED** |
| local/shared collision coupling | **STRUCTURE ESTABLISHED; SIMPLE SHIFTED-SLOT CANDIDATE REJECTED GLOBALLY** |
| winner/publication/poll/cleanup timing | **MEASURED; NOT A MAJOR CPU/CYCLE TARGET** |
| worker-order diversity | **ROOT VARIANT INADMISSIBLE; RECURSIVE SPREAD VARIANT REJECTED** |
| post-DONE loser fault policy | **POLICY CONFIRMED; KEEP FAIL-CLOSED UNLESS CONTRACT CHANGES** |
| cross-invocation shared-cache persistence | **REJECTED** |
| shared contention / replacement | **CONTENTION NEGLIGIBLE; REPLACEMENT REAL BUT NOT PRIMARY BOTTLENECK** |
| scalar-only shared evidence | **RETAIN CURRENT BOUNDARY** |
| JSMinSys key -> q_o/q_r | **NARROWED TO q_r MECHANICAL QUALIFICATION GAP** |

No lead justified reintroducing Branch Manager, a global work queue, retrying shared stores, or persistent cross-run cache state.
