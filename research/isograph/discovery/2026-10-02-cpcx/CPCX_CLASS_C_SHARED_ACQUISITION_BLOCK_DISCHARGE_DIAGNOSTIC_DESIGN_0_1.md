# CPCX Class-C Shared Acquisition-Block Discharge Diagnostic Design 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** frozen before execution  
**Parent:** `CPCX_CLASS_C_SUPPORT_RELEASE_ACQUISITION_AUDIT_RESULT_0_1.md`  
**Target:** winner-existence / loser-outcome-equivalence

## Purpose

Test one narrow repair of the dominant Class-C acquisition rejection:

`SUPPLY_CREATES_OPPONENT_IMMEDIATE_SINGLETON`.

Do not weaken the qualified support-release acquisition theorem.

Instead test whether some rejected rows instantiate a distinct **shared
acquisition/block discharge**:

```
P0 protected target = t
P1 supply releases t
P1 also acquires a singleton obligation on t
P0:t both acquires the protected target and blocks the P1 singleton
```

One physical response must discharge both roles.

## Frozen cohort

Consume only acquisition attempts from the frozen 177-state Class-C audit that
fail exactly with:

`SUPPLY_CREATES_OPPONENT_IMMEDIATE_SINGLETON`.

All earlier acquisition premises must therefore already have passed:

- exact P0 source;
- protected P0 residual;
- target support distance one;
- pinned P0 action admissible and nonterminal;
- target release preserved;
- no P1 immediate singleton after the pinned action;
- protected residual unchanged;
- EXTERNAL class does not directly kill the protected residual;
- named P1 SUPPLY event is nonterminal.

## Shared-cell condition

Let `U` be the set of exact P1 playable singleton cells after SUPPLY.

The candidate shared-discharge condition is:

```
U = {t}
```

where `t` is the already-selected P0 acquisition target.

Do not admit:

- `|U| > 1`;
- a unique urgent cell different from `t`;
- any retargeting after observing the result.

## Exact discharge test

For a shared-cell candidate, apply the already-planned P0 event `t`.

Accept the local discharge only if:

1. `t` is legal current frontier;
2. first-terminal stopping is respected;
3. if terminal, the terminal player is P0;
4. otherwise the protected P0 residual contracts by `t`;
5. every P1 singleton whose missing cell was `t` is killed by P0 occupancy;
6. no P1 playable singleton remains immediately afterward.

Then run only deterministic forced normalization and the existing first-win
classifier to characterize the resulting boundary.

## Output

Report:

- total acquisition rejections at the target seam;
- unique-shared-cell candidate count;
- exact locally safe shared-discharge count;
- target-cell and pinned-action histograms;
- terminal-direction counts;
- post-discharge immediate-boundary histogram;
- existing P0 first-win/progress classification;
- negative seam histogram for candidates that fail the shared-cell test.

## Meaning of a positive result

A positive result would justify freezing a new theorem contract:

`SUPPORT_RELEASE_SHARED_ACQUISITION_BLOCK_EDGE`.

It would not modify the existing acquisition theorem.

## Search boundary

No later free P1 frontier is enumerated.

Only:

- the already-pinned P0 action;
- the named P1 SUPPLY event;
- the already-selected acquisition target;
- deterministic normalization

are executed.

No solved data, oracle, minimax, remoteness, or recursive game-tree traversal.
