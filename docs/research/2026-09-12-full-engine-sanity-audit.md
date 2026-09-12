# Full-engine sanity audit — frontier-native exact forward solver

**Date:** 2026-09-12  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Purpose

Revision 2 of the standard 7x6 empty-root solve ran for about 26 minutes, approached the hosted runner memory ceiling, and never returned the first win-threshold root proof. The whole forward engine was therefore audited as suspect rather than treating the event as one more isolated allocation problem.

The governing ordinary proof identity remains:

```text
supportIndex
+ normalized P0 residual winning requirements
+ normalized P1 residual winning requirements
```

Hashes remain filters only; exact descriptor equality is proof identity. CPC/WSL/NDC facts remain admissible only where their premises are exact.

## Revision-2 evidence

Run `34676507073`, job `103507205045`, admission commit `8052b757002758494e9776b1f4c23224e6eeb44f`.

The last complete record was at about `1,575,560.714991 ms` elapsed. The runner then received its shutdown signal before the workflow's 30-minute limit, with process RSS near the 16 GB host limit.

```text
root phase:          searching-win-threshold
root WDL:            unresolved
RSS:                 15,711,215,616 bytes
shared TT entries:   8,388,608
TT replacements:     481,919,672
slot reuses:         455,755,857
slot grows:           26,163,815
shared chunk count:   34,552,423
shared term IDs:     251,999,029
shared arena words:  355,656,298 / 460,000,000
```

The v5 shared arena did not exhaust. Worker high-water was approximately 98.7M / 113.6M / 96.5M local quotient states and 23.0M / 26.4M / 22.9M residual classes. Revision 2 also performed about 1.52 billion semantic descriptor builds across the three workers.

## Findings and repairs

### 1. Generation-bearing proof handles escaped the semantic-TT owner

**Status:** real defect, repaired and bounded-qualified.

The engine could hold a generation-bearing shared-TT handle across recursive work. If the physical slot was replaced, the packed proof store rejected the stale publication but the search path did not reacquire the exact semantic state. Completed proofs could therefore disappear under heavy replacement pressure.

Repair: `a728475ba95ced550263b7897c565ccaef6bae21`.

The engine now keeps stable local state IDs; the semantic adapter resolves current generations and retries publication after replacement. A dedicated control forced root handle `8` stale, rejected the raw stale publication, then rebound the same semantic root under handle `17` while the engine key remained `0`.

### 2. Semantic descriptor ownership was duplicated and allocated on the hot path

**Status:** real resource defect, repaired and bounded-qualified.

The canonical slot64 residual-class pool already owned exact class content. The descriptor layer retained another term-ID arena and allocated state descriptor/hash objects during TT access.

Repair: `fa4363435dfc2b5e2b19a95b5f8b8bf370c1b93e`.

The active path now retains only class length plus two 32-bit hash words per class and uses one reusable state-descriptor/hash scratch. Exact term IDs are reconstructed transiently only for exact shared-TT comparison/installation after hash filtering.

Qualified invariants:

```text
retained descriptor term IDs:     0
retained descriptor term arena:   0
retained per-class JS objects:    0
retained per-class term arrays:   0
hot state-descriptor allocations: 0
```

### 3. Online workers retained private local proof arrays despite shared proof ownership

**Status:** real duplicate ownership, repaired and bounded-qualified.

The generic quotient state pool carried `lower`, `upper`, and `bestMove` Int8 arrays for the local solver. Online workers use the shared semantic proof store instead.

Repair: `9141b2038502f401aaddc1ec9e7cd1f1d2f50b42`.

The online-only state specialization removes those three arrays without altering the local/private solver outside the worker path. Savings are exactly 3 bytes of state capacity. At the revision-2 capacity tier of `134,217,728`, that is 384 MiB per worker, 1.125 GiB across three workers.

## Search-control faults and open owners

### 4. Standard-root split depth contradicts measured presearch

**Status:** configuration fault; not yet promoted to the full-root gate.

Revision 2 used unresolved decision split depth `8` with three workers. Standard-7x6 structural presearch had already measured:

```text
depth 3:   238 frontier q states
depth 4: 1,120 frontier q states
```

and identified depth 3-4 as the meaningful range. Tactical forced-response structure begins materially after that region.

The repaired exact dependency-aware control still favors depth 3 for three workers:

```text
split depth 2: ~59.43 ms median, ~11,348 expanded
split depth 3: ~36.00 ms median, ~11,418 expanded
split depth 4: ~38.41 ms median, ~14,669 expanded
```

There is no evidence supporting split depth 8 as the next standard-root configuration.

### 5. Priority probing is disabled

`PRIORITY_PROBE_DEPTH=0` gives no cost-based task differentiation. The 7x6 presearch also showed exhaustive cost probing to be disproportionately expensive, so increasing probe depth blindly is rejected.

### 6. Enhanced transposition cutoffs are disabled

Standard-root workers run with ETC disabled. ETC is exact when its premises hold, but it requires an isolated repaired-engine A/B before promotion.

### 7. TT best-move hints are bypassed under frontier ordering

When live-frontier ordering is active, the engine sorts solely by frontier score and does not consume the shared proof-table `bestMove` hint. A safe candidate is frontier score as primary order with current TT hint only as a tie-break within equal frontier-score classes.

### 8. Worker-local canonical universes are heavily duplicated

Each worker independently interns large overlapping quotient-state and residual-class universes. Shared proof state is shared; canonical state/class storage is not. This remains a major architectural cost after the completed lifetime repairs.

### 9. Stored per-state hashes remain large

The online state pool still stores one Uint32 hash per state. At the revision-2 `134,217,728` capacity tier that is 512 MiB per worker, about 1.5 GiB across three workers. A historical no-hash candidate exists, but CPU cost must be A/B measured before promotion.

### 10. Shared proof replacement pressure is extreme

Revision 2 recorded about 482M replacements against 8.4M physical entries. Because generation-safe republishing now changes proof survival, replacement policy/capacity must be remeasured after the repair before generic TT tuning.

### 11. Detached work drain can delay post-proof completion

The harness drains detached noninterruptible work for clean lifecycle closure. This could delay workflow completion after a proof returns, but revision 2 never returned the first root threshold proof, so it was not that run's root cause.

### 12. No W/D/L sign, terminality, or bounded exactness error found

Physical-vs-quotient controls and constrained exact solves remain consistent. Repaired bounded controls still return exact root `0` and actions `[0,0,0,0]`. No evidence was found of incorrect negation, terminal-win interpretation, tactical exactness, frontier-bound direction, forced-macro sign handling, or generation-safe proof reads.

The engine is therefore not mathematically disproven. The demonstrated failures are proof-lifecycle, resource ownership, and search-control/configuration defects severe enough to make the full solve pathological.

## Current bounded qualification

At head `9141b2038502f401aaddc1ec9e7cd1f1d2f50b42`, all three lanes are green:

- replacement/stale-handle: run `34678704806`, job `103513133339`;
- dependency-aware exact search: run `34678704773`, job `103513133262`;
- idle ExploreHint: run `34678704783`, job `103513133275`.

The replacement campaign preserves root `0`, actions `[0,0,0,0]`, stale-generation rebinding, v5 chunk growth, zero duplicate descriptor term arena, and zero online-worker local proof bytes.

## Disposition

Do not rerun standard 7x6 from the revision-2 configuration.

Before the next root admission:

1. promote a measured split-depth correction; current evidence favors depth 3 for three workers;
2. isolate TT-hint tie-breaking under frontier ordering;
3. A/B ETC on the repaired engine;
4. decide whether stored state-hash removal is worth its CPU tradeoff;
5. remeasure replacement/proof-refresh behavior after generation rebinding;
6. only then admit one standard-root revision through the explicit qualification trigger.

Rejected shortcuts: increasing the shared term arena, increasing TT capacity without remeasurement, weakening exact residual identity, replacing frontier ordering with generic heuristics, deep priority probing by assumption, inventing CPC/NDC closure, or launching repeated full roots while control faults remain unresolved.
