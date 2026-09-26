# IsoMax qualification — merged JSMinSys main pin

**Date:** 2026-09-24 (America/Los_Angeles)  
**Connect4 branch:** `work/isomax-jsminsys-boundary-cleanup`  
**Connect4 commit under test:** `fa6c8340e95c5da7f05641850bc9eb30c0f4b25b`  
**Pinned JSMinSys:** `7f866a87d0fc0662529621590c02b9832f685c6c`  
**Workflow run:** `36086563243` — IsoMax Fhourstones Benchmark

## Protocol

The maintained `tools/bench-fhourstones.mjs` protocol was used unchanged:

- official four Fhourstones inputs in repository order;
- one worker;
- capacity/buckets 65,536;
- manager budget 64;
- CPC frontier-response disabled;
- CPC projected-advisory disabled;
- fresh solver session per input;
- 120-second application ceiling per case;
- no extra warmup or retry.

Only EXACT with the expected W/D/L is a completed qualification result. TIMEOUT is incomplete, not an incorrect W/D/L.

## Results

### 45461667

- expected W/D/L: +1;
- status: EXACT;
- rootWdl: +1;
- move: 3;
- oracle matched: true;
- alpha-beta nodes: 806,844;
- cofactors/transitions: 807,290;
- cutoffs: 230,273;
- cache hits: 351,277;
- CPC calls: 455,568;
- CPC exact: 26,008;
- CPC bounds: 10,542;
- CPC restrictions: 96,912;
- CPC forced: 100,640;
- CPC precursors: 65;
- wall: 1,193.1766 ms;
- solver elapsed: 1,185.8438 ms;
- CPU: 1,391 ms;
- CPU cycles: 3,655,632,937;
- cycles / alpha-beta node: approximately 4,530.78;
- cleanup: true.

### 35333571

- expected W/D/L: -1;
- status: TIMEOUT;
- wall: 120,018.3825 ms;
- CPU: 119,531 ms;
- CPU cycles: 310,952,083,240;
- cleanup: true.

### 13333111

- expected W/D/L: 0;
- status: TIMEOUT;
- wall: 120,016.9586 ms;
- CPU: 120,079 ms;
- CPU cycles: 311,820,579,455;
- cleanup: true.

### Empty root

- expected W/D/L: +1;
- status: TIMEOUT;
- wall: 120,016.4901 ms;
- CPU: 120,171 ms;
- CPU cycles: 311,466,840,376;
- cleanup: true.

## Disposition

The JSMinSys pin is valid for the completed exact control: result, witness, cleanup and oracle match are correct.

The full official benchmark remains incomplete because three inputs still exceed the 120-second application ceiling. There is no oracle mismatch in this run.

Timeout result telemetry still zeros completed worker search counters, so those cases cannot currently support node-rate or cycles/node analysis.

For historical context only, the prior recorded live-line wiring checkpoint at JSMinSys `f191c5f...` completed `45461667` at 1,820.8976 ms and 5,144,835,720 cycles with the same 806,844 nodes. The new checkpoint is materially lower in wall/cycles, but this comparison is not a same-runner A/B and should not be treated as a precise isolated attribution.
