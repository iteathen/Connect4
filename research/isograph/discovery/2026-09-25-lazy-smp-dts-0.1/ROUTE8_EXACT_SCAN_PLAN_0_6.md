# Lazy SMP DTS 0.1 — Route-8 Exact Continuation Scan Plan 0.6

**Date:** 2026-09-25  
**Status:** CHECKPOINTED BEFORE SCAN  
**Authority effect:** none

## Seed

The first bounded scan found the unresolved 12-ply position:

`133331112714`

with strong long-range-response activity:

```text
route8 stores:     16
route8 hits:       74,612
route8 displaced:  10
incoming route3:    1
incoming route5:    9
```

but it did not finish within the 8-second diagnostic window.

## Next scan

Scan sixteen deterministic legal nonterminal two-ply continuations of this seed at ply 14.

Goal:

> find a position that reaches EXACT while retaining route-8 displacement under the same route-displacement diagnostic build.

Use the existing diagnostic baseline and unchanged candidate policy. This is position discovery, not performance qualification.

## Selection

Prefer:

1. EXACT result;
2. route8.displaced > 0;
3. several seconds of runtime rather than a trivial closure;
4. stable cleanup/four-worker exit.

If multiple positions qualify, preserve at least two for clean baseline/candidate completion-cost A/B.
