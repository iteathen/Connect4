# IsoMax Lazy SMP four-worker Fhourstones qualification

**Date:** 2026-09-24 (America/Los_Angeles)  
**Connect4 benchmark commit:** `786042743b76d0fa1bb9d2c39608ba4751132cc4`  
**JSMinSys:** `19a96823cad46c7e5e9e70e0d68079d5574f92a3`  
**Workflow run:** `36097657777`  
**Execution:** Lazy SMP, exactly four search workers, no Branch Manager, no Surplus queue.

## Protocol

Official four Fhourstones inputs in order, one attempt each, fresh solver session per input, 120-second per-case ceiling.

Lazy SMP configuration:

- workers: 4
- shared exact-cache capacity: 65,536
- private exact-cache capacity per worker: 65,536
- CPC frontier response: off
- CPC projected advisory: off

Each worker owns a private CPC/Negamax search stack. Workers cooperate only through committed exact W/D/L entries in the shared exact cache. The first exact finisher supplies the result and the other workers are terminated cleanly.

## Results

### 45461667

- expected W/D/L: +1
- status: EXACT
- root W/D/L: +1
- move: 3
- oracle matched: true
- winning worker: 3
- wall: 3,235.7377 ms
- solver elapsed: 3,231.9433 ms
- CPU: 11,360 ms
- process CPU cycles: 27,276,840,537
- winner nodes: 716,450
- winner cutoffs: 226,125
- winner local cache hits: 284,695
- winner cofactors: 716,642
- shared exact-cache hits: 693,450
- shared exact-cache stores: 50,476
- shared store contention events: 13
- shared bytes: 5,895,077
- completed workers before host stop: [0,0,0,1]
- cleanup: true

### 35333571

- expected W/D/L: -1
- status: TIMEOUT
- wall: 120,020.9576 ms
- CPU: 445,985 ms
- process CPU cycles: 1,090,286,429,887
- shared exact-cache hits: 9,593,935
- shared exact-cache stores: 2,106,511
- shared store contention events: 2
- completed workers: [0,0,0,0]
- cleanup: true

### 13333111

- expected W/D/L: 0
- status: TIMEOUT
- wall: 120,015.0851 ms
- CPU: 463,485 ms
- process CPU cycles: 1,134,221,952,611
- shared exact-cache hits: 7,615,340
- shared exact-cache stores: 1,354,688
- shared store contention events: 0
- completed workers: [0,0,0,0]
- cleanup: true

### Empty root

- expected W/D/L: +1
- status: TIMEOUT
- wall: 120,022.5175 ms
- CPU: 464,328 ms
- process CPU cycles: 1,135,370,767,268
- shared exact-cache hits: 14,318,179
- shared exact-cache stores: 510,366
- shared store contention events: 0
- completed workers: [0,0,0,0]
- cleanup: true

## Interpretation

Lazy SMP avoids the shared-frontier capacity failure observed in the Surplus implementation. The shared exact cache is replaceable evidence rather than work ownership, so reaching 65,536 cache slots is not a failure condition.

The maintained control `45461667` completes exactly with four Lazy-SMP workers. The other three official positions remain beyond the 120-second ceiling.

The first control uses substantially more total CPU than wall time, as expected from four concurrently active search workers. Shared-cache traffic is substantial and store contention is negligible in this run.

This result does not replace or deprecate the Surplus + Branch Manager implementation. It is qualification evidence for the separate Lazy SMP option.
