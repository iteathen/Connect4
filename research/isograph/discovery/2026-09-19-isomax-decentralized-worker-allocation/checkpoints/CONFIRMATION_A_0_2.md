# Issue 102 independent confirmation — pass A

**Date:** 2026-09-19  
**Research head before write:** `a2741c6fe39fa754474305f0c6d849df724763a6`  
**Measured solver revision:** `7d63daa7da8c520e3de9c73ca913851da67888b4`  
**Actions run:** `35480723779`

Revision `7d63daa...` differs from the initial screen only by cold worker-boundary observation fields. Scheduler semantics are unchanged.

Exact decisions matched across the full grid.

## Four-worker confirmation

Control `workers=4, reserve=0`:

- wall samples: 3680.63, 3435.50, 3580.82 ms; median **3580.82 ms**
- result-ready median: **3546.16 ms**
- node samples: 7,101,926; 7,043,287; 7,213,205; median **7,101,926**
- zero-node retirements: 9, 12, 8

Candidate `workers=4, reserve=4`:

- wall samples: 3479.52, 3323.09, 3342.94 ms; median **3342.94 ms**
- result-ready median: **3312.18 ms**
- node samples: 7,167,529; 6,981,729; 6,898,608; median **6,981,729**
- zero-node retirements: 121, 140, 94

Relative median effect:

- wall: **-6.64%**
- result-ready: **-6.60%**
- nodes: **-1.69%**

All three candidate wall samples beat the same-pass reserve-0 sample.

This independently confirms the direction seen in the first screen. The benefit is not utilization-only because aggregate work also falls on the median.

## Lower-worker negative controls remain

The reserve policy is not universal:

- 1w reserve 1: 2541.70 -> 2734.13 ms median wall; nodes 2.644M -> 2.773M.
- 2w reserve 1: 2359.34 -> 2538.60 ms; nodes 4.328M -> 4.510M.
- 2w reserve 2: 2359.34 -> 2498.48 ms; nodes 4.328M -> 4.448M.

The first-pass conclusion therefore survives:

> reserve admission is a phase-dependent scheduling policy.

## Current status

The 4-worker/full-reserve candidate has survived one independent confirmation, but the fully instrumented confirmation at `1dc44118...` remains in flight. That pass is required to inspect manager scan cost, task-duration distribution, TT/cache metrics, residual growth and worker resets before disposition.

No default policy change is authorized by this checkpoint alone.
