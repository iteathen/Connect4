# Exact 7x6 solver performance research checkpoint

**Date:** 2026-09-08  
**Status:** research/evidence checkpoint; not an accepted product specification  
**Scope:** dirty Node prototypes used to characterize exact-search arithmetic, TT geometry/lifecycle, multicore scaling, null-window partitioning, and dynamic resource selection.

## Authority and preservation intent

The maintained Connect4 oracle remains `components/oracle/exact7x6.mjs`. The prototype sources captured with this note are experimental evidence only. They intentionally live outside maintained source and must not be treated as product authority without independent review/qualification.

This checkpoint exists because the experiments were performed in a disposable/flaky sandbox and several findings materially change the likely implementation direction.

## Test environment

Sandbox observed during the experiments:

- virtualized AMD EPYC 9V74;
- 5 logical CPUs exposed, with effective `os.availableParallelism()` of 4 for the worker experiments;
- approximately 4 CPU cores of quota;
- about 5.8 GiB visible RAM and a 4 GiB cgroup limit;
- no GPU;
- Debian 13 x86-64 under KVM;
- Node v22.16.0;
- no swap.

This differs from the project's intended Node 26 qualification environment. Performance values are therefore comparative research evidence, not release qualification.

## Same-sandbox C reference

A reconstructed Fhourstones 3.2 C reference was compiled and run in the same sandbox without an opening book (`BOOKPLY 0`) and with the TT reset before solve.

Empty 7x6 start position:

- exact result: first-player win;
- nodes: **1,479,113,766**;
- wall time: **163.87 s**;
- CPU time: about **163.817 s**;
- throughput: **9.029 M positions/s**;
- RSS: about **65,408 KiB**;
- TT entries: **8,306,069**.

This is the rough CPU benchmark target. It is a single-thread C reference, so aggregate multicore Node NPS is not a language-instruction comparison.

## Incumbent BigInt + Map failure

The maintained exact-solver shape was tested on the same empty-board workload.

Observed before failure:

- V8 `Map maximum size exceeded`;
- elapsed: **62.03 s**;
- nodes: **25,778,687**;
- throughput: about **0.416 M nodes/s**;
- Map entries at failure: **16,777,216 = 2^24**;
- RSS: about **1.04 GiB**;
- heap used: about **938 MiB**.

This established both BigInt hot-path cost and JavaScript `Map` density/capacity as immediate blockers.

## Fixed-width two-word representation

For the specialized 7x6 solver, the 49-bit board fits naturally in two canonical 32-bit words. Dirty prototypes moved the hot state to scalar locals such as:

- `currentLo`, `currentHi`;
- `maskLo`, `maskHi`.

Cross-word shifts and the carry required by the Pons-style `mask + bottomMask` expression were specialized explicitly.

Measured consequences:

- `winningPositions`-style two-word microkernel was about **13.6x faster** than the BigInt version in this Node 22 sandbox;
- full exact-search arithmetic with TT disabled sustained about **9.47-9.99 M nodes/s**;
- best sample: **50 M nodes / ~5.003 s = 9.993 M nodes/s**.

The key conclusion is that raw Node/V8 fixed-width search arithmetic is already near the same-sandbox C reference throughput. BigInt was a convenience bottleneck, not a domain requirement for 7x6.

## SharedArrayBuffer findings

The intended TT backing remains a fixed `SharedArrayBuffer` allocated before timed search.

Measured:

- ordinary fixed-length SAB indexed loads were roughly comparable to ordinary `ArrayBuffer` loads (about 460 M sequential loads/s in the microbenchmark);
- length-tracking views over a growable SAB were dramatically slower (roughly 29-35 M/s); growth has since been rejected entirely;
- `Atomics.load` was also much slower (roughly 48 M/s) than ordinary SAB loads.

Implication: use a fixed preallocated SAB, ordinary typed-array reads/writes where correctness permits, and keep atomic publication/synchronization minimal and coarse.

## TT locality and probe-layout findings

Representative dirty results:

- flat 8M-slot SAB TT: about **4.46 M nodes/s**;
- equivalent normal `ArrayBuffer`: about **4.72 M/s**;
- crude chunk-local addressing over the same 8M total slots: about **6.18 M/s**;
- cache-hot 64K TT: about **8.31 M/s**.

This made memory locality the dominant remaining single-thread cost.

### Two-word short-circuit identity

For a task-local/chunk-local direct probe, the best order was:

1. `keyLo`;
2. only on match, `keyHi`;
3. only on full identity match, payload.

Representative result was about **6.784 M/s** versus about **6.624 M/s** for the prior value-first arrangement.

In one ~3.05M-probe sample:

- about **75.6%** failed immediately on `keyLo`;
- only about 744K probes needed `keyHi`;
- only 1,339 failed after matching `keyLo`;
- about 743K were hits.

High-word-first was slightly worse. Current local-probe winner is therefore `keyLo -> keyHi -> payload`.

### Chunk-size sweep

With fixed 8M total arena and one active task-local chunk:

- 8K: ~8.36 M/s;
- 16K: ~8.34 M/s;
- **32K: ~8.52 M/s**;
- 64K: ~8.28 M/s;
- 128K: ~7.73 M/s;
- 256K: ~7.27 M/s.

32K is the strongest current physical chunk-size candidate, not a specification constant.

### Associativity/tag experiments that lost

4-way bucket/tag machinery was materially slower in V8:

- 4-way + packed 8-bit tags: about **3.83 M/s**;
- 4-way direct key checks: about **3.62 M/s**;
- simple two-word direct probe in the same family of tests: about **6.78 M/s**.

2-way buckets also lost elapsed time despite reducing some node counts. The current winner remains a direct-mapped entry within a small dependency-local chunk.

## Active TT capacity is workload-dependent

Capacity sweeps using 32K-entry chunks showed that one universal active TT size is not optimal.

For the harder exact position `663152175` (exact score -4), the useful knee was approximately **128K-512K active entries**. Beyond that, node-count reductions were small while locality cost increased.

Other tested positions often preferred **32K-64K**. A rough empirical relationship with remaining plies emerged, but tactical shape can override it.

The architectural conclusion is stronger than any individual threshold:

> Preallocate the backing arena once, but dynamically assign only the amount of TT capacity the current solve/pass can profitably use.

## Multicore compute scaling

A raw multicore throughput experiment gave each worker an independent copy of the same real heavy subtree in a separate SAB chunk. This deliberately measured CPU/Node/SAB scaling without alpha-beta partitioning effects.

Representative medians:

| Workers | Aggregate throughput | Scaling |
|---:|---:|---:|
| 1 | 8.81 M/s | 1.00x |
| 2 | 13.74 M/s | 1.56x |
| 3 | 20.77 M/s | 2.36x |
| 4 | 30.17 M/s | 3.42x |

One 4-worker run reached **33.27 M nodes/s** aggregate.

Thus the sandbox CPU/Node/SAB machinery can scale well. The remaining multicore problem is exposing useful alpha-beta work without excessive speculative nodes.

## Why root-only splitting failed

A naive seven-root-child split produced essentially no wall-time scaling from 1 through 4 workers (~178-180 ms for the test position).

Instrumentation showed why:

- one root child (column 4 / internal index 3): **1,573,051 nodes / ~178 ms**;
- the other six returned essentially immediately.

The critical path was contained in one child. Parallelism must emerge recursively inside the heavy proof, not merely across root siblings.

## Null-window YBWC/Jamboree-style shell

The solver's exact-score procedure already uses null-window proof passes. A dirty eldest-first parallel shell was tested:

1. search eldest/first child serially;
2. if it cuts off, stop;
3. only after eldest fails low, expose younger siblings as coarse null-window tasks;
4. serial negamax remains unchanged below a shallow split shell.

Launching all younger siblings was too speculative. The useful form was deliberately lazy, with a small speculative-lane cap.

For `663152175`, a shallow shell with at most two younger siblings in flight gave a representative 4-worker result around **135 ms** versus about **192 ms** serial, with node count rising from about **1.60M** to about **1.97M** (~23% extra nodes).

For larger position `41267575`:

- serial: about **16.49M nodes / ~2.06 s**;
- depth-4 lazy multicore: about **27.2M nodes / ~1.54 s** with 4 workers (~1.34x wall-time speedup but ~65% extra work);
- depth 2 preserved pruning better (~20.5M nodes) but did not expose enough work to keep workers 3-4 useful;
- depth 5 became too speculative.

The useful split depth is therefore a dynamic workload variable, not a fixed constant.

## Dynamic resource selector experiment

A first selector used previous mandatory null-window-pass work as a predictor for the next pass. This avoids adding a separate probe search.

Candidate dynamically assigned values included:

- active worker count;
- maximum split depth / split permission;
- speculative sibling width;
- active TT chunk budget.

On `41267575`, the first selector achieved about **1.50 s median** versus roughly **2.04 s** single-worker in the same prototype environment. It searched about **25.0M nodes** versus **16.5M serial**.

The selector is not mature, but the experiment supports the architecture: resource choices should be made at game-init, solve/pass, or coarse-task boundaries and handed to a hot serial kernel as already-resolved numeric values.

Runtime CPU capacity is also dynamic. `os.availableParallelism()` is an upper bound, not an assumed profitable worker count. Hybrid P-core/E-core/SMT systems must be treated as heterogeneous capacity; coarse work stealing and measured throughput should reveal how many lanes are worth using.

## Dependency-chunk cleanup prototype

The current TT cleanup direction remains:

- one fixed preallocated SAB arena;
- dependency-state-owned physical chunks;
- no age/LRU/refcount/cleanup metadata in negamax;
- whole-chunk retirement/reuse outside the hot loop;
- conservative proof-of-impossibility reclamation;
- false retention/recomputation acceptable; false hits/use-after-recycle forbidden.

A dirty prototype tested irreversible ownership signatures at task boundaries. Bottom-two-row dependency signatures over-partitioned the table and saturated the spill path. Coarsening the signature to the bottom row materially reduced search work.

The experiments also revealed that merely increasing physical chunk count does not cure a poor family projection. Chunk identity/granularity and reclamation policy must be evaluated together.

## Clean 15-minute empty-board cleanup run

Earlier cleanup runs accidentally overlapped because tool-side timeouts returned control without killing shell-launched Node processes. Those timings are contaminated and should not be used as evidence. All stray processes were killed before this run.

Clean configuration:

- start position: empty board;
- `os.availableParallelism()`: **4**;
- max workers: **4**;
- dependency rows: **1** (bottom row);
- physical chunks per worker: **64**;
- entries per chunk: **32,768**;
- total TT entries: **8,388,608**;
- reported TT storage: **72 MiB**;
- lazy YBWC shell, dynamic worker/depth choice, speculative lanes capped at 2;
- hard wall-time ceiling: **15 minutes**.

Completed iterations before the timeout:

| Iteration | med | returned score/bound | Nodes | Seconds | Aggregate NPS |
|---:|---:|---:|---:|---:|---:|
| 1 | -10 | -9 | 1,458,761 | 0.224 | 6.51 M/s |
| 2 | 10 | 10 | 1,297,221 | 0.107 | 12.08 M/s |
| 3 | -4 | -3 | 89,066,402 | 9.035 | 9.86 M/s |
| 4 | 5 | 5 | 62,452,957 | 4.897 | 12.75 M/s |
| 5 | 2 | 2 | 1,573,297,571 | 123.189 | 12.77 M/s |
| 6 | -1 | 0 | 2,790,285,263 | 229.501 | 12.16 M/s |
| 7 | 1 | 1 | 4,374,118,996 | 280.182 | **15.61 M/s** |

Totals for the **seven completed** iterations:

- nodes: **8,891,977,171**;
- measured search time inside completed iterations: **647.134 s**;
- aggregate completed-iteration throughput: about **13.74 M nodes/s**.

The process exited with timeout status **124** at the 15-minute ceiling while working on the next proof pass. It did **not** produce a final exact empty-board score in this run.

This is evidence that the arithmetic/multicore machinery can sustain high aggregate throughput on multi-billion-node proof passes, but the current search/TT policy still performs far more work than the Fhourstones reference.

## Important missing optimization: move ordering

The current research prototype has not yet incorporated a fully tuned move-ordering system. That matters enormously to alpha-beta/null-window node count.

High-leverage candidates already available from existing search information include:

- immediate wins / forced defense;
- previous-null-window cutoff move replay;
- TT cutoff/best-move hint;
- static center preference;
- coarse previous-pass child cost/cutoff history.

Any such hints should remain compact and should not turn the recursive hot path into a policy engine.

## Next architectural experiment: global shared TT

The current cleanup prototype uses worker-local physical TT ownership for experimental simplicity. That likely leaves substantial parallel transposition reuse on the floor.

Next experiment after this checkpoint:

> Replace per-worker TT knowledge with one global shared dependency TT while retaining coarse task scheduling and conservative cleanup.

Candidate shape:

- one fixed SAB TT arena shared by all workers;
- canonical dependency chunk map is search-global;
- all workers may read a live chunk;
- one coarse write lease per chunk initially, avoiding writer-vs-writer arbitration in negamax;
- publication protocol must allow false misses but must prohibit torn/false hits;
- shared TT entry may eventually carry a compact cutoff/best-move column hint;
- whole-chunk retirement/reuse remains outside negamax;
- no atomics on every state operation.

This could reduce both duplicate parallel search work and poor move ordering because a transposition learned by one worker becomes immediately useful to the others.

## Preserved prototype sources

The research branch preserves the current dirty prototype line separately from maintained source. Prototype code is evidence/reconstruction material only; promotion into maintained source requires independent review and qualification.
