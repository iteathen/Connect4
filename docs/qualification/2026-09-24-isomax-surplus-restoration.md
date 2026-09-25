# IsoMax worker Surplus restoration qualification

**Date:** 2026-09-24 (America/Los_Angeles)  
**Connect4 branch:** `work/isomax-jsminsys-boundary-cleanup`  
**JSMinSys authority:** `51bd9bc09b2c50b84619bc7efa953ad9c1e0302a`  
**Connect4 verified head:** `340920833a4c8bc2d0e75eb006ac22469fde9efb`

## Regression corrected

The managed worker had been changed to claim only the root q and run the entire recursive CPC-Negamax tree privately. That made additional workers structurally unable to receive work: the shared branch-publication path was never reached.

JSMinSys PR #28 restored the required worker semantics:

```text
claim q
  -> CPC/RBA evaluate q
  -> retain at most one continuation
  -> publish unresolved viable siblings through rbaTtPublishSurplus32
  -> continue retained q immediately
```

The Branch Manager remains asynchronous and off the worker evaluation hot loop. It organizes, dedupes, redirects and cleans; it does not manufacture worker work.

Managed Connect4 now rejects fewer than two search workers, and the host returns per-worker claim/evaluation counters.

## Qualification

JSMinSys Verify run `36089212244`:

- 157/157 tests passed;
- schema green;
- Node compatibility green;
- add-on cycle ledger complete.

Connect4 Verify run `36089752607`:

- passed;
- exact oracle/witness controls preserved;
- dedicated Surplus fixture requires 2/4-worker participation;
- single-worker qualification is no longer part of the accepted topology.

## Two-worker Fhourstones evidence

Run `36089367414` used the official four-input harness with two search workers and the Branch Manager.

### 45461667

- status: FAILED due TT capacity, not oracle mismatch;
- elapsed: 33,000.8994 ms;
- wall: 33,010.9094 ms;
- process cycles: 49,428,750,390;
- TT live: 65,536;
- ready q: 33,598;
- q claims: 73,427;
- shared branches: 73,329;
- evaluations: 73,427;
- worker claims: **36,596 / 36,831**;
- worker evaluations: **36,596 / 36,831**;
- idle polls: 2;
- CPC calls: 273,526;
- transitions: 200,743;
- cleanup: true.

### 35333571

- TT capacity reached at ~28.9 s;
- worker claims: **31,534 / 32,386**;
- total claims: 63,920;
- branches: 63,789;
- cleanup: true.

### 13333111

- TT capacity reached at ~27.2 s;
- worker claims: **32,002 / 30,723**;
- total claims: 62,725;
- branches: 62,633;
- cleanup: true.

### Empty root

- TT capacity reached at ~26.25 s;
- worker claims: **31,810 / 29,360**;
- total claims: 61,170;
- branches: 61,010;
- cleanup: true.

The important result is structural: both workers are doing substantial, balanced work and Surplus is flowing through the shared queue. The failure moved from worker starvation to shared-state capacity.

## Corrected 2/4-worker A/B

Run `36089466712` compared the pre-restoration JSMinSys `7f866a87...` with the restored `51bd9bc09...` under the same current adapter and profiles `[2,4]` only.

Pre-restoration baseline:

- 2 workers: `claims=1`, `branches=0`; one private Negamax solve;
- 4 workers: `claims=1`, `branches=0`; extra workers idle.

Restored candidate:

- 2 workers: tens of thousands of claims split approximately evenly across both workers;
- 4 workers: all four workers active, e.g. **38,530 / 39,430 / 39,500 / 39,174** claims in one run;
- candidate currently reaches the 65,536-row TT/frontier limit before completing the control.

## Disposition

**Accepted:** worker Surplus semantics are restored and multi-worker participation is mechanically visible.

**Not accepted as solved performance:** the shared q frontier grows faster than the current 65,536-row TT can retire/merge it. This is now the next engineering bottleneck.

The allowed optimization direction is to reduce live frontier/TT pressure while preserving:
- 2+ search workers;
- worker-owned Surplus publication;
- one retained continuation;
- Branch Manager independence;
- per-worker participation visibility.

Private root-only recursion and single-worker qualification are explicitly not valid fixes.
## Fresh two-worker rerun

Workflow `36090243769` at Connect4 `472521316c20f3c070e0fca94178e6836005aea5` reran the maintained official Fhourstones protocol with exactly two search workers plus Branch Manager.

Results:

- `45461667`: TT capacity failure after 50.196 s wall; 88,867 claims, 88,784 branches; worker claims **43,264 / 45,603**; TT live 65,536; ready 33,599; cleanup true.
- `35333571`: TT capacity failure after 25.024 s; worker claims **34,009 / 32,913**; 66,922 total claims; 66,777 branches; ready 34,488; cleanup true.
- `13333111`: TT capacity failure after 24.851 s; worker claims **29,086 / 27,967**; 57,053 total claims; 56,993 branches; ready 36,106; cleanup true.
- empty root: TT capacity failure after 25.732 s; worker claims **28,990 / 28,494**; 57,484 total claims; 57,289 branches; ready 33,967; cleanup true.

The rerun again confirms balanced participation by both workers. No case reached an oracle result because the configured 65,536-row TT filled first. The current blocker remains shared-frontier/TT pressure, not worker starvation.

