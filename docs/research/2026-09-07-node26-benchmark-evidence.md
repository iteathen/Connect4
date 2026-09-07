# Node 26.7 incumbent benchmark evidence — 2026-09-07

## Evidence identity

C4-0004 was exercised on source revision:

`5ca077c2073b7e5e4432c9267da729836efbacb0`

Correctness workflow:

- workflow: `verify`
- run: `34116027286`
- conclusion: success

Benchmark workflow:

- workflow: `benchmark-evidence`
- run: `34116027347`
- job: `101722930087`
- conclusion: success

The benchmark workflow intentionally has no performance threshold. Its purpose is to capture revision-bound evidence, not to turn hosted-runner timing noise into a correctness failure.

## Runtime / machine identity

The benchmark log recorded:

- Node: `v26.7.0`
- V8: `14.6.202.34-node.28`
- platform/arch: `linux/x64`
- runner OS: Ubuntu 24.04.4 / `ubuntu-24.04` image `20260831.293.1`
- kernel: `6.17.0-1022-azure`
- CPU: AMD EPYC 7763 64-Core Processor
- logical CPUs exposed: 4
- total memory reported: 16,766,414,848 bytes

These measurements bind to this machine/runtime/profile only.

## Fixed-request reroot workload

Profile:

- board: 7×6
- ordering: `persistent-best-move`
- TT capacity: 262,144 slots
- requested depth: 8
- repetitions: 3
- roots: 36 per lane
- predetermined reroot fixture: `[3,3,3,3,2,1,5,4,4,1,4,1]`

| Metric | Persistent TT | Reset each root |
| --- | ---: | ---: |
| elapsed | 480.554 ms | 542.686 ms |
| nodes | 501,027 | 624,351 |
| evaluator calls | 289,914 | 371,565 |
| nodes/sec | 1,042,602 | 1,150,483 |
| evaluator calls/sec | 603,291 | 684,678 |
| alpha-beta cutoffs | 73,131 | 104,289 |
| TT position hits | 113,664 | 104,676 |
| TT score hits | 35,046 | 42,027 |
| decision checksum | 2,804,412,475 | 2,804,412,475 |

The persistent lane used about **80.25%** as many nodes and **78.03%** as many evaluator calls as the reset lane. Equivalently, cross-move persistence removed about **19.75%** of nodes and **21.97%** of evaluator calls from this frozen request workload. Reset took about **1.1293×** the persistent elapsed time, so persistence reduced elapsed time by about **11.45%** on this runner.

Raw nodes/sec was higher in the reset lane. This is why C4-0004 does not use throughput alone: the persistent lane performed more TT/reuse bookkeeping per visited node but finished sooner because it avoided substantially more nodes and frontier evaluations.

## Cross-generation reuse

The persistent lane recorded:

- cross-generation position hits: **40,290**;
- cross-generation ordering hits: **40,461**;
- cross-generation score hits: **564**;
- shallow ordering hits: **53,493**;
- cross-perspective ordering hits: **25,125**;
- insufficient-depth score rejections: **53,493**.

The reset control recorded zero cross-generation position, ordering and score hits.

This directly demonstrates the intended C4-0003 split: inherited positions remain useful across moves, while score reuse is narrower than ordering reuse and remains perspective/depth qualified.

## Fixed-wall-clock depth sweep

C4-0004 uses a fresh-engine full iterative-deepening depth sweep so no deadline branch is inserted into the alpha-beta hot path.

Profile:

- position: `[3,3,3,3,2,1,5,4]`
- budget: 250 ms
- repetitions per depth: 3
- median completion time determines the budget result.

Relevant boundary:

- depth 10: **79.436 ms** median, 93,265 nodes;
- depth 11: **132.681 ms** median, 164,721 nodes;
- depth 12: **200.959 ms** median, 251,992 nodes;
- depth 13: **361.716 ms** median, 455,806 nodes.

Therefore the deepest complete search within the 250 ms median budget on this runner was **depth 12**; depth 13 was the first measured depth over budget.

## Memory / allocation interpretation

The benchmark was launched with `--expose-gc` and recorded process memory before, after, and after an out-of-timed-region explicit collection. Those values are practical retained-memory snapshots only.

They are not a total allocation count and should not be compared as though V8 external/ArrayBuffer accounting were an allocation profiler. The stronger hot-path fact remains architectural and reviewable in the source: the recursive search uses primitive/typed-array state and does not create board clones or object-per-node search records.

## Disposition

The incumbent has now passed:

- exact legacy evaluator differential qualification;
- exact fixed-depth search differential qualification;
- historical depth-3 through depth-12 self-play compatibility;
- exact Node 26.7 repository CI;
- the first C4-0004 Node 26.7 benchmark evidence run.

The next correctness/quality seam is an independent solved-game oracle/position corpus. Historical self-play remains an integration oracle, not proof of perfect Connect Four play.

CUDA-MCGS issue #124 remains paused and this evidence does not resume it.
