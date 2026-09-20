# Issue 102 measurement checkpoint — initial reserve screen

**Date:** 2026-09-19  
**Research owner head before write:** `c0adfbe2bf2868291b57408fd478a964d9443dc6`  
**Measured solver revision:** `cb496b6aaf75132d161af92d8cb1744d0eae6dbb`  
**GitHub Actions run:** `35480504178`  
**Artifact:** `10595378470`  
**Runtime:** Node v26.7.0  
**CPU:** AMD EPYC 7763 64-Core Processor  
**Available parallelism:** 4

The run used alternating fresh Node processes, three samples per configuration, and the established three completed-root corpus. Exact `[sequence,value,move]` decisions matched in every configuration.

## Screen result

| configuration | median wall ms | median result-ready ms | median nodes | median redispatch-idle ms | zero-node queued retirements |
|---|---:|---:|---:|---:|---|
| serial | 2755.95 | 2755.95 | 2,643,905 | 0 | 0 |
| 1w reserve 0 | 3349.34 | 3329.23 | 2,644,187 | 42.28 | 0/0/0 |
| 1w reserve 1 | 3387.51 | 3371.04 | 2,772,544 | 0.70 | 17/16/18 |
| 2w reserve 0 | 3106.41 | 3078.58 | 4,334,990 | 216.48 | 3/1/2 |
| 2w reserve 1 | 3245.30 | 3216.84 | 4,457,439 | 261.05 | 17/22/17 |
| 2w reserve 2 | 3182.46 | 3147.20 | 4,394,114 | 167.69 | 39/35/40 |
| 4w reserve 0 | 4729.55 | 4683.65 | 7,072,169 | 354.77 | 7/8/11 |
| 4w reserve 1 | 4789.25 | 4739.46 | 7,304,115 | 191.96 | 45/50/48 |
| 4w reserve 4 | 4638.46 | 4581.28 | 6,936,473 | 356.26 | 100/108/87 |

## Relative effects

Versus same-worker reserve-0 control:

- 1w +1: **+1.14% wall**, **+4.85% nodes**.
- 2w +1: **+4.47% wall**, **+2.82% nodes**.
- 2w +2: **+2.45% wall**, **+1.36% nodes**.
- 4w +1: **+1.26% wall**, **+3.28% nodes**.
- 4w +4: **-1.93% wall**, **-2.19% result-ready**, **-1.92% nodes**, **-3.51% observed max RSS**.

For 4w +4, all three screen wall samples were lower than their corresponding 4w reserve-0 sample within the same sample pass:
- 4638.46 vs 4779.43 ms;
- 4670.49 vs 4729.55 ms;
- 4533.08 vs 4606.12 ms.

The candidate also queued substantially more obsolete work: 87–108 zero-node retirements versus 7–11 for reserve 0.

## Falsification / interpretation

The broad hypothesis

> “keeping any small reserve of ready tasks improves next-available-worker scheduling”

is **falsified**.

Removing manager-refresh idle is not enough. Reserve +1 sharply reduced the counted idle-with-ready events at 1/4 workers, yet wall time and aggregate work regressed. The causal penalty is not queue coordination alone; earlier admission changes which speculative dependencies reach workers before root-critical closure, increasing recursive work and queued obsolescence.

This establishes a stronger scheduling fact:

> **Admission timing is semantically free but search-work non-neutral.**

Ready work is not fungible economically even when every ready item is exact/admissible.

The 4w +4 screen is anomalously but consistently positive in this first pass. It improves work as well as time, so it cannot be dismissed as mere utilization. It requires an independent confirmation run before any policy change.

## Next confirmation

Before the long confirmation run, freeze:

- live solver revision: successor of the screen preserving only instrumentation + `readyReserve` toggle;
- candidate: `workers=4, readyReserve=4`;
- control: `workers=4, readyReserve=0`;
- task quantum: incumbent 65,536;
- roots: same three completed roots;
- fresh process per configuration sample;
- alternating order;
- falsifier: no repeated wall/result-ready and node advantage under exact equal decisions;
- required measurements: wall, result-ready, nodes, queue/redispatch timing, zero-node retirement, queue/pending maxima, RSS.

If confirmation fails, reject reserve admission as a default scheduler policy and do not build a worker-side stealing deque from this evidence.

If it confirms, treat it as a 4-worker phase candidate only; do not generalize it to 1/2 workers.
