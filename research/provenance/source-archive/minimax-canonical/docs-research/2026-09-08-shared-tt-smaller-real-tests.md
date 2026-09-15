# Shared TT smaller-real-position experiments

**Date:** 2026-09-08 / 2026-09-09 UTC transition  
**Status:** dirty research evidence; not maintained solver authority

## Question

Does a transposition table shared by Node `worker_threads` materially reduce duplicate exact-search work compared with worker-local TT slices, when total TT entry capacity is held equal?

## Prototype publication protocol

The shared-TT prototype uses one fixed preallocated `SharedArrayBuffer` table. Each slot contains two 32-bit canonical key words, one byte of bound payload, one byte of writer ID for research instrumentation, and one 32-bit control/version word.

Reader path:
1. ordinary `keyLo` read rejects most misses before any atomic operation;
2. on first-word match, atomically read the control/version word;
3. read full key/payload/writer;
4. atomically reread control/version;
5. accept only if both control reads match and are even.

Writer path:
1. atomically read control;
2. CAS even -> odd to acquire that slot;
3. write key/payload/writer with ordinary typed-array stores;
4. atomically publish the next even version.

A reader may conservatively miss a racing entry. It must not accept a torn key/payload. A writer that loses slot acquisition skips that cache store rather than waiting.

This is deliberately a simple research protocol, not the intended final one-writer-per-dependency-chunk design.

## Search shell

- exact 7x6 two-word `Uint32` negamax;
- null-window exact solve;
- lazy eldest-first YBWC shell;
- split depth 4;
- speculative lane cap 2;
- 4 warmed workers for the main comparisons;
- direct-mapped TT;
- three measured repeats per configuration;
- exact score required to agree across every mode/repeat.

## Real test positions

### `663152175` — exact score `-4`

Same total 256K entries:

| TT layout | Total entries | Median nodes | Median wall |
| --- | ---: | ---: | ---: |
| 4 local x 64K | 262,144 | 1,868,317 | 177.65 ms |
| 1 shared x 256K | 262,144 | 1,139,440 | 105.67 ms |

Shared result: about **39.0% fewer nodes** and **40.5% lower wall time**. In the median shared run, 51,732 of 203,160 validated TT hits (about **25.5%**) came from entries written by another worker.

Same total 512K entries:

| TT layout | Total entries | Median nodes | Median wall |
| --- | ---: | ---: | ---: |
| 4 local x 128K | 524,288 | 1,798,618 | 202.64 ms |
| 1 shared x 512K | 524,288 | 1,095,835 | 174.69 ms |

Node count continues to fall, but the smaller position's wall-time knee is around 256K shared; larger tables lose locality despite additional pruning.

### `41267575` — exact score `3`

Same total 256K entries:

| TT layout | Total entries | Median nodes | Median wall |
| --- | ---: | ---: | ---: |
| 4 local x 64K | 262,144 | 20,171,909 | 1.662 s |
| 1 shared x 256K | 262,144 | 15,213,016 | 1.321 s |

Shared result: about **24.6% fewer nodes** and **20.5% lower wall time**.

Same total 512K entries:

| TT layout | Total entries | Median nodes | Median wall |
| --- | ---: | ---: | ---: |
| 4 local x 128K | 524,288 | 16,766,523 | 1.469 s |
| 1 shared x 512K | 524,288 | 10,941,887 | 1.149 s |

Shared result: about **34.7% fewer nodes** and **21.8% lower wall time**. In the median shared run, 315,786 of 1,957,337 validated hits (about **16.1%**) came from another worker.

## Shared capacity sweep

For `663152175` with 4 workers:

- 32K shared: ~173 ms;
- 64K shared: ~153 ms;
- 128K shared: ~148 ms;
- **256K shared: ~112 ms**;
- 512K shared: ~123-175 ms across repeated batches, fewer nodes but worse locality.

For `41267575` with 4 workers:

- 128K shared: ~1.9 s class;
- 256K shared: ~1.32-1.40 s class;
- **512K shared: ~1.15-1.21 s class**;
- 1M shared: ~1.32 s despite fewer nodes (~9.1M);
- 2M shared: ~1.34 s despite fewer nodes (~8.55M).

Thus TT capacity is a dynamic resource variable: more capacity continues to reduce node count after the wall-time optimum because cache/memory cost eventually dominates.

## Two-worker check

Sharing also helped with only two workers, so the effect is not unique to four-way duplication:

- `663152175`, equal total 64K: local ~1.875M nodes / 197 ms; shared ~1.513M / 164 ms.
- `41267575`, equal total 64K: local ~19.19M / 2.284 s; shared ~15.58M / 1.944 s.

## Conclusions

1. A global TT materially eliminates duplicate parallel search work.
2. The benefit survives equal-total-capacity comparisons; it is not merely a larger-table effect.
3. Cross-worker TT hits are directly observed and can constitute a substantial fraction of useful validated hits.
4. Too-small shared tables can be worse than local slices because collision/contention pressure overwhelms reuse.
5. Shared TT capacity has a workload-dependent wall-time knee, reinforcing dynamic coarse resource assignment.
6. The simple per-slot atomic publication protocol already wins despite measurable synchronization overhead; a one-writer-per-dependency-chunk design may remove additional publication cost.
7. Next step is to combine global sharing with the dependency-chunk cleanup/recycling architecture, then test shared compact cutoff/best-move hints.

## Preserved prototype files

- `twoword_solver_sharedtt.mjs`
- `ybwc_sharedtt_worker.mjs`
- `shared_tt_fair_capacity.mjs`

These remain research prototypes only.
