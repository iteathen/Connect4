# IsoMax Fhourstones two-worker comparison

**Date:** 2026-09-24 (America/Los_Angeles)  
**Connect4 benchmark commit:** `b40d918f15011268c383dd9d00b73c62af85d9e1`  
**Pinned JSMinSys:** `7f866a87d0fc0662529621590c02b9832f685c6c`  
**Workflow run:** `36087647926`

## Change under test

The maintained official Fhourstones protocol was left unchanged except:

`workers: 1 -> 2`

Capacity, buckets, manager budget, CPC options, inputs, order, per-case ceiling, and fresh-session policy were unchanged.

## Results

### 45461667

- expected W/D/L: +1
- status: EXACT
- rootWdl: +1
- move: 3
- oracle matched: true
- alpha-beta nodes: 806,844
- cofactors/transitions: 807,290
- cutoffs: 230,273
- cache hits: 351,277
- CPC calls: 455,568
- CPC exact: 26,008
- CPC bounds: 10,542
- CPC restrictions: 96,912
- CPC forced: 100,640
- CPC precursors: 65
- idle polls: 118
- wall: 1,651.8195 ms
- solver elapsed: 1,642.8344 ms
- CPU: 2,094 ms
- process CPU cycles: 4,897,937,681
- cycles / alpha-beta node: approximately 6,070.49
- cleanup: true

### 35333571

- expected W/D/L: -1
- status: TIMEOUT
- wall: 120,025.9498 ms
- CPU: 120,437 ms
- process CPU cycles: 294,009,099,039
- cleanup: true

### 13333111

- expected W/D/L: 0
- status: TIMEOUT
- wall: 120,015.5697 ms
- CPU: 120,281 ms
- process CPU cycles: 293,675,149,716
- cleanup: true

### Empty root

- expected W/D/L: +1
- status: TIMEOUT
- wall: 120,024.4560 ms
- CPU: 120,156 ms
- process CPU cycles: 293,524,980,343
- cleanup: true

## Comparison with preceding one-worker run

The immediately preceding one-worker run `36086563243` completed the same first input with the identical 806,844-node tree:

| metric | 1 worker | 2 workers | delta |
| --- | ---: | ---: | ---: |
| wall | 1,193.1766 ms | 1,651.8195 ms | +38.44% |
| CPU | 1,391 ms | 2,094 ms | +50.54% |
| process cycles | 3,655,632,937 | 4,897,937,681 | +33.98% |
| cycles/node | 4,530.78 | 6,070.49 | +33.98% |

This is not a same-runner A/B: the two measurements came from separate GitHub-hosted workflow runs, so the deltas are directional evidence only. The exact search tree and result were unchanged.

The remaining three positions timed out in both worker configurations. Timeout telemetry still zeros completed search counters, so those cases cannot support node-rate or cycles/node scaling analysis.

## Disposition

The two-worker configuration does not show a benefit on the completed official control in this run. The maintained benchmark harness is restored to the canonical one-worker configuration after recording this comparison.
