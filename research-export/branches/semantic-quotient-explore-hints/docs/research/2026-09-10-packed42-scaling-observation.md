# Packed42 scaling observation — 2026-09-10

This checkpoint records the first exact packed-42 rolling BSFP scaling run at source `2c593023a5b66bde3dde7f0d1e6eca489ab8034f`.

## Measured result

The exact-number/two-u32-compatible mask representation materially reduces CPU overhead without changing the symbolic workload.

- 5x4 connect-4: root Draw, 3,125 support skeletons, 108,266 total boundary records, 2,298,403 generated pair candidates, 801.253 ms wall time, 75.27 MiB max RSS.
- 5x5 connect-4: root Draw, 7,776 support skeletons, 1,044,159 total boundary records, 81,515,570 generated pair candidates, 18,864.632 ms wall time, 132.40 MiB max RSS.
- 6x5 connect-4: did not complete within the 600 s bounded run; max RSS was about 199 MiB.
- 7x6 connect-4: did not complete within the 600 s bounded run; max RSS was about 210 MiB.

The earlier rolling BigInt 5x5 run was about 62.5 s with the same frontier/candidate counts, so fixed-width exact-number masks improve the 5x5 CPU reference by roughly 3.3x. This confirms that BigInt allocation/comparison was a major constant-factor cost, but it does not remove the 6x5 scaling wall.

## Interpretation

Memory is not the immediate blocker. The 6x5 and 7x6 bounded runs timed out while remaining far below even 1 GiB of host residency. The dominant unresolved cost is the large number of exact antichain candidate comparisons/reductions.

B1 native evidence already measured approximately 35.35 billion exact 42-bit subset checks/second on the GTX 1660 Ti. Therefore the next production-oriented step remains GPU-resident segmented candidate reduction/compaction and then integration into the rolling-rank BSFP executor. The goal is not to further micro-optimize JavaScript reference algebra except where needed for an independent oracle.

## CI defects observed concurrently

Two non-semantic defects were exposed by the same commit:

1. the packed42 normalization equivalence test compared canonical antichain arrays by sequence even though the packed and BigInt implementations choose different deterministic orderings among equal-popcount incomparable masks; the antichain sets and complete-game results agree;
2. the first segmented Device-JS reducer used a conditional expression in one status assignment, which Device-JS v0 rejects syntactically.

Both are local repair items and do not change the scaling conclusion above.
