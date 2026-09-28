# Packed recursive move rows: local rejection

2026-09-28. Implements [the plan](PACKED_MOVE_ORDER_PLAN.md) without changing
live-line scores, stable ties, CPC, cache semantics or worker topology.

Fixed A: `f2d56c2788ef3a4c49fc4bef9d447c5be3184059`.
Fixed B: `c496f57f3d1463805528cf1d904a3ee52a44e57f`.

Eight alternating AB/BA pairs, 16 fresh processes on `353335714`, all EXACT:
rootWdl=-1, move=4. All four workers performed work and exited with clean cleanup.
Topology: one wide + three deep; shared4194304/private1048576 each; mask0.
Windows 11 Pro 10.0.26200, i5-12600K (10 cores/16 logical), 34088599552 bytes RAM,
Node26.7.0/V8 14.6.202.34-node.28. QueryProcessCycleTime across process threads.
Both fixed-source worktrees were clean. No single-worker performance test.

| Metric | A mean | B mean | Paired delta | 95% paired interval |
|---|---:|---:|---:|---:|
| Process solve cycles | 37720338286.75 | 37832861565.625 | +0.302% | [-0.660%, +1.264%] |
| Wall ms | 2434.279 | 2442.881 | +0.358% | [-0.613%, +1.329%] |
| CPU ms | 10238.625 | 10244.125 | +0.063% | [-1.203%, +1.330%] |
| All-worker nodes | 4588417.5 | 4594076.5 | +0.125% | [-0.364%, +0.614%] |
| Winner nodes | 1275956.25 | 1270389.25 | -0.434% | [-1.798%, +0.930%] |

**Rejected: no established whole-process improvement.** The positive mean does
not prove a regression. Less insertion traffic did not establish lower solve
cost; packing/decoding/control/JIT offsets remain a hypothesis, not an isolated
causal finding. Reduced shared contention is not sufficient for acceptance.

The runtime selected baseline remains **f2d56c27**. Do not import packed rows
from this experiment. No claim of the cumulative 50% target being reached.
No secondary hard run or hosted requalification was justified after rejection;
the hard120000ms ceiling remains unchanged.

174 correctness tests passed, along with catalog/seal verification, authoritative
generator freshness, geometry/frontier audits, schema and module syntax checks.
Tests exercise actual source packing/sorting, unsigned boundaries, equal scores,
recursive traces, mirrors and multiple prepared orders. Independent review
exposed an inherited cycle-ledger K alias between insertion shifts and
cancellation checks. That accounting correction is independently useful and
does not justify promoting the runtime experiment.

The correction was separately committed as JSMinSys `25efbfafaaf4b6bd0ff82c37d5950ca1c64378df`
and submitted in [PR116](https://github.com/iteathen/JSMinSys/pull/116), based on
PR114's experimental branch. Only ledger data and its regression test changed;
runtime source and seals remain identical. The regression failed before the
repair, passed after, and catalog/generator checks passed. Independent review
found no blockers. No runtime speed claim attaches to this accounting repair.

Full report, environment, every sample, raw child output and Git-blob SHA-256
manifest are committed in JSMinSys:

- [Report and raw evidence at 3fc3dc2](https://github.com/iteathen/JSMinSys/tree/3fc3dc2/evidence/isomax-phase2-packed-move-order-local-20260928)
- Source checkpoint c496f57; raw checkpoint51dc209; report checkpoint3fc3dc2.
- Exact per-pair ratios, cache metrics, per-worker nodes/timing and cleanup are
  retained there, not duplicated as enormous logs in this research repository.

Concurrent work was discovered on
`experiment/isomax-phase2-packed-move-rows-20260928` (7f4ce29 at last inspection).
It pursues the same packing hypothesis but is a separate implementation; this
result does not qualify or reject its exact source. A further test should name
its materially different realization rather than repeat this experiment.
That branch has not been overwritten or deleted.

The concurrent implementation is now PR115. This result was posted there as
[review evidence](https://github.com/iteathen/JSMinSys/pull/115#issuecomment-5875264996)
and on [PR114](https://github.com/iteathen/JSMinSys/pull/114#issuecomment-5875234203).

PR84 and PR114 remain open/draft; neither was merged. The newer packed-tag hosted
repeat36455549930 has cycle delta -0.761%, interval[-1.647%,+0.125%]. Preserve it
beside the earlier qualifying result; it does not independently qualify a gain.
The full repeat artifact identity is in the plan.
