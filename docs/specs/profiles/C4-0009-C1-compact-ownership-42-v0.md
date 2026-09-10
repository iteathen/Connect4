# C4-0009-C1 — Compact ownership CUDA-BSFP v0

Working experimental profile under C4-0008/C4-0009 and Q1. Native local
all-frontier passes exist for 4x3, 4x4 and 5x5; official publication is pending.
This is a full compact root solve, distinct from B1 throughput.

The exact symbolic regions are minimal P0-Win generators and maximal P0-Loss
generators at one support skeleton. Row-major ownership masks use two u32 words
with 42 valid bits. Static support metadata owns gravity, rank, landing cells,
and geometric terminal requirements; it contains no computed W/D/L.

One block owns one support's cofactor, terminal overrides, exact union and
OR/AND intersection. The shared packed pair/normalization collective generates
bounded candidate tiles. Terminal subtraction uses the complement-cone
intersection identity documented in the associated research record. Full-board
boundary frontiers are empty. Complete rank dependencies are ordered before
predecessor publication; only two rank arenas are authoritative at once.

All extents and semantic operations remain device-owned. The finite DAG is
partitioned into CUDA-JS's 32-node prepared epochs. Node submits this precomputed
sequence and waits for runtime completion, without reading counts, frontiers,
rank status or W/D/L between epochs. CUDA-JS owns execution, synchronization and
memory; Connect4 owns all antichain algebra. No generic compaction implementation
is added: survivor publication is part of the BSFP cardinality collective.

Capacity is 1,024 masks per intermediate/frontier, 2,048 fresh pair candidates
per tile, at most 64 support blocks per scratch shard, and 128 threads/block.
The layout builder proves u32 indexing/pair products. The qualifier admits the
conservative payload plus bounded oracle data plus 256 MiB runtime allowance.
Capacity failure is sticky and invalidates the whole root result. Reallocation
or spill is not implemented; there is no partial-success result. This first
profile uses a fixed conservative shard ceiling; adaptive VRAM admission and
larger geometries require further qualification.

Qualification uploads CPU expected frontiers separately and compares both set
inclusion directions and counts for every support after its rank. Observer
kernels cannot feed semantic progression. The timed second solve has no oracle
buffers/comparisons. Both runs return exact root, boundary counts, pair candidates,
subset checks, launches, rank batches, runtime/compile/setup/transfer/submit/wall
times and cleanup status. Fused generation, normalization and compaction timings
are explicitly unavailable pending device profiling; submit/wait is not pure
kernel time. Q1 owns sampled GPU memory telemetry, timeout and publication.

Supported qualification geometries: 4x3 connect-3 (Win), 4x4 connect-4 (Draw),
5x5 connect-4 (Draw). Smaller WDL boundary cases are tested through complete
frontier equality. The 4x4 case also verifies a 17-support/128-candidate/64-thread
variant, an all-support 1x42 high-lane control, and capacity failure at four
records. Counterexample runs are isolated and close before the next begins.

The separate Q1 registry ID `c4-0009-c2-compact-scaling-42` attempts only 6x5,
with 8,192-record rank/frontier capacity, 2,048-candidate tiles and no large CPU
oracle. Its result grade is complete symbolic closure, not independent all-state
qualification. The first 8,192-candidate attempt timed out at 180 s. No 6x5/7x6
root result or acceleration is currently established. Static support metadata is
capped at 1,048,576 items before host allocation. Public CUDA-JS memory policy is
configured to the admitted profile bound; no lower-library limit is bypassed.

Falsifiers: any frontier/root disagreement, incomplete support coverage, a
capacity failure accepted as valid, schedule-dependent results, same-phase
publication reads, a CPU semantic decision, or unclosed CUDA resources.
