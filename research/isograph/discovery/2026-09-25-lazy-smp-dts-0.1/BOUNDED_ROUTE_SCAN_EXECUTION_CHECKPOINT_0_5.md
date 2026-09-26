# Lazy SMP DTS 0.1 — Bounded Route Scan Execution Checkpoint 0.5

**Date:** 2026-09-25  
**Status:** SCAN LAUNCHED  
**Authority effect:** none

## Transport

Connect4 measurement branch:

`experiment/isomax-lazy-smp-dts-overlap-v1@299cf46239442150e3761a19446dc30ec47f64c8`

New bounded scan tool:

`tools/bench-lazy-smp-route-scan.mjs`

Measurement JSMinSys:

`0bb979c61c012290fdbd4d69dd845f4896f70877`

Workflow:

`IsoMax Bounded CPC Route Scan`

## Candidate corpus

Twelve deterministic legal nonterminal continuations of hard seed `13333111`, at plies 12, 14, 16 and 18.

Each position gets an 8-second four-worker mask-7 diagnostic solve with overlap tracing disabled and route-displacement provenance enabled.

## Recovery seam

On reconnect:

1. find the newest `IsoMax Bounded CPC Route Scan` run for head `299cf462...`;
2. extract every `lazy-smp-bounded-route-scan` JSON line;
3. select positions with `status=EXACT` and `route6.displaced + route8.displaced > 0`;
4. prefer positions with longer exact wall time (enough work to resolve small performance deltas) and repeatable route displacement;
5. checkpoint the selected positions before launching clean baseline/candidate A/B.

No solver policy is changed by this scan.
