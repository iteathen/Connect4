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
