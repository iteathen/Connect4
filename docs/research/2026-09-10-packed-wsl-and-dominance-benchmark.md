# Packed WSL-625 and CUDA dominance benchmark checkpoint

**Date:** 2026-09-10  
**Branch:** `feature/cuda-bsfp`  
**Status:** packed semantic representation qualified in repository CI; native B1 throughput measurement pending owner NVIDIA hardware.

## Goal

Keep the work centered on the product objective: solve the standard empty 7x6 connect-4 root exactly and very quickly on CUDA, without reverting to move-tree search.

## Scaling evidence that motivated this step

The direct ownership-antichain BSFP reference is exact and much smaller than the MTBDD reference, but CPU scaling bent sharply:

- 5x4 c4: 1.531 s, 108,266 boundary records, max frontier 284/194;
- 5x5 c4: 58.326 s, 1,044,159 boundary records, max frontier 562/568;
- 6x5, 7x5 and 7x6: 600 s bounded-run timeout.

The rolling-rank executor reduced 5x5 resident memory to about 164 MiB and only 25.6% of total boundary records simultaneously resident, but still generated about 81.5 million pair candidates. Therefore the first wall is frontier manipulation/comparison throughput, not retained memory.

A no-sort streaming BigInt dominance reducer was tested and rejected: it preserved exact results but regressed 5x5 to 73.806 s.

## Packed WSL-625 representation

`components/bsfp/wsl-requirement-lattice.mjs` now constructs the exact residual requirement universe for a geometry and encodes a requirement antichain `A` by its upward closure:

```text
Up(A) = { r in WSL | exists a in A: a subset_of r }
```

For standard 7x6 connect-4:

- geometric winning lines: 69;
- residual requirement universe: exactly 625;
- packed closure width: 625 bits = 20 u32 words = 80 bytes.

The maintained semantic implication relation is exactly:

```text
A implies B  iff  Up(A) subset_of Up(B)
```

and P0-favourable residual dominance becomes two fixed-width closure-inclusion tests at identical support/side context.

Repository tests require:

- exact 625 cardinality and 20-word width;
- the complete 625 x 625 singleton implication matrix;
- deterministic composite requirement-set implication agreement;
- packed-vs-semantic residual dominance agreement across legal move histories that reach the same support skeleton through different move orders.

`verify` passed this batch at commit `1d50e616fce1ba4a0cb2db5b8911452054ed50fd`.

The numeric RID ordering remains an implementation detail. The normative semantic fact is the 625-element standard residual universe.

## B1 packed ownership-dominance throughput profile

Commit `787210ecfb4e87c06bab37ad9315bf6d2d82b50f` adds C4-0009-B1, a performance-only CUDA profile. It does **not** claim to solve 7x6.

B1 measures the hot fixed-width operation exposed by the ownership-antichain scaling run:

- 1,048,576 candidate masks;
- 568 frontier masks;
- 42-bit masks stored as two u32 lanes;
- full-scan/no-hit fixture so every candidate checks every frontier entry;
- 595,591,168 exact 42-bit subset checks per measured pass;
- 1,191,182,336 u32-lane subset operations per measured pass;
- one warmup plus five measured submit+wait passes on native hardware.

The child records fixture, runtime-open, compile/load/prepare, allocation, upload, submit+wait distribution, readback, verification, candidates/s, subset-checks/s and u32-lane-ops/s. Native correctness requires every candidate to report zero domination and exactly 568 checks.

B1 has a finite ~272 MiB Q1 admission upper bound including its 256 MiB runtime allowance. Q1 now targets 95% of currently free VRAM while preserving a 256 MiB hard floor; this remains a reusable-arena ceiling rather than a monolithic-allocation target.

## Portable qualification

`bsfp-portable` run `34455304919` passed all four lanes:

- Ubuntu 24.04 / Node 24.15.0;
- Ubuntu 24.04 / Node 26.7.0;
- Windows Server 2025 / Node 24.15.0;
- Windows Server 2025 / Node 26.7.0.

Each lane passed Device-JS compile/submit for B1, B1 Q1 dry-run registration, and parameterized clean-sibling bootstrap preparation. Native B1 remains pending real NVIDIA hardware under the CUDA-JS supported Node 26.7.0 baseline.

## Decision rule after native B1

If B1 shows that hundreds of millions of fixed-width subset checks are cheap on the GTX 1660 Ti, proceed with the compact CUDA ownership-antichain vertical slice: rank-local packed frontiers, candidate generation, dominance marking, CUDA-Algorithms survivor compaction, rolling ranks and VRAM-derived shard width.

If B1 throughput is too low even for this small fixed-width payload, do not hide the result with more batching. Shift more aggressively toward WSL-625/CPC/NDC semantic compression so far fewer candidate comparisons are generated before GPU reduction.
