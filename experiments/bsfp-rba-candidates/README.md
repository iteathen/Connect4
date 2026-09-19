# BSFP RBA candidate campaign

Implementation qualification for B3 in issue #71. Production P2 and RBA are
unchanged. The isolated Node variant streams each local maximal skyline instead
of materializing the projected array and Set first. Factor orientation, candidate
charging, sorted local order and final global normalization are unchanged.
The loader checks a unique current-source seam and fails on drift.

```sh
node --test experiments/bsfp-rba-candidates/qualification.test.mjs
node experiments/bsfp-rba-candidates/run.mjs
```

The candidate replays the complete existing RBA suite (physical 4x3 oracle,
abstract 2x2 recurrence, 608 pinned rank-33 semantic hashes and capacity errors)
plus duplicate/permutation/128-bit/orientation/charge controls.

Six sequential fresh processes run baseline/candidate/candidate/baseline/
baseline/candidate. Each measures complete 4x3 c3 and the two existing rank-33
cones, after identical small untimed warmup. Heap sampling is identical and
progress flushes every 16 supports. Timeout remains 30 seconds per worker;
default reference capacities remain 4096 supports, 2M candidates, 50K frontier.
Raw logs and partial reports survive in Git-private solver-performance.

Compare total recurrence time. The streaming candidate's local normalization
timer includes projection generation, unlike the baseline; that internal timer
is not a valid isolated speed comparison. Heap samples can miss transient peaks;
RSS includes runtime/imports and earlier cases in the same worker. Repeats
compare root WDL, complete boundary digests, pinned semantic hashes and exact
work counters. No 7x6 solve, GPU utilization or native speedup is claimed.

This tests only B3 streaming local skylines. Same-coordinate absorption, tree
pruning and orientation planning are separate unmeasured subcandidates.
B1 absorption and B2 scalable normalization await a public upstream profile:
the installed CUDA-Algorithms 48ee0aec exports stable select, lexicographic order
and ranked derived activation, not either requested complete API (#12/#11).
The possible composition is still to be qualified in its owning library.
B4 completed artifacts, B5 device progression and B6 native clause coverage
remain queued with their individual acceptance criteria in issue #71.

## Measured B3 streaming result

Source `664c693ae5f860623ea9b51c18c5ac1e0d238dc1`, Node 26.7.0.
Two independent batches, six fresh samples per variant in total:
`20260919T163216752Z-rba-candidates` and
`20260919T163307351Z-rba-candidates`. See `initial-results.json` and
`repeated-results.json` for chronological samples and hardware.

| Case | Initial baseline → stream ms | Repeat baseline → stream ms |
|---|---:|---:|
| Complete 4x3 c3 | 763.37 → 721.84 (-5.44%) | 757.46 → 724.18 (-4.39%) |
| Rank 33, [5,5,1,4,6,6,6] | 158.65 → 152.20 (-4.06%) | 157.47 → 154.10 (-2.14%) |
| Rank 33, [5,5,2,3,6,6,6] | 1925.37 → 1832.94 (-4.80%) | 1881.25 → 1834.30 (-2.50%) |

All seven qualification tests passed. Both batches preserved boundary digests,
608 pinned hashes per process, and generated/projection/skyline/boundary counts.
4x3 root WDL remained 1. Rank-33 cone roots have no specified ownership/residual
root assignment and correctly report null WDL. These are complete support cones,
not partial solves of the empty 7x6 board.

The first batch's largest-cone observed heap rose from 33.33 MB to 45.82 MB;
the repeat shows the same pattern. RSS stayed around 130 MB. Sampling cannot
prove peak allocations or GC savings: no memory improvement is claimed.
Across both batches the candidate was faster on all three measured cases,
but the magnitude varied. Disposition: qualified **bounded Node-reference
performance candidate**, pending production integration/requalification.
P2 remains unchanged; this cannot establish a native GPU or full-7x6 gain.

No temporary limits or debug source changes were needed. All twelve workers
exited normally; raw flushed logs remain under the two Git-private run IDs.
