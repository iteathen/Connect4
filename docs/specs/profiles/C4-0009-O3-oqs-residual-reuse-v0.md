# O3 — OQS exact residual reuse and output mapping

Working bounded research qualification under C4-0006..0009 and Q1. O3 extends
O1/O2 with a Connect4 crossing-state mapping kernel after the existing exact
cofactor kernel. One prepared DAG resets and transforms unique residual/input
pairs, then resets and maps every original crossing-state/input occurrence to
that payload. There is no intermediate host decision inside the submission.

Exact input pair IDs are CPU qualification fixtures. Output slots identify
unmerged pair/input payloads; they are not canonical next-quotient IDs. Generic
next-pair grouping/compaction remains a CUDA-Algorithms capability requirement.
O3 does not qualify device ID discovery, chained OQS, or a root solve.

Frozen workloads: 4x4 connect-4 support 468, all ten cuts, 1,409 logical outputs
and 326 residual/input transforms; 7x6 connect-4 support 470594, cut five only,
2,048 input occurrences, 32 distinct pairs, fanout four, 8,192 logical outputs
and 128 residual/input transforms. Small reference layers use independent R3;
the large reference matches all six retained baseline layer digests and direct
cofactor checks before selecting cut five. Pair equality uses complete masks.

The 7x6 unfactored shape is 2,048 states, 8,192 candidates, frontier 512,
1,048,576 records per input side. Factored shape is 32 pairs, 128 candidates,
frontier 512, 32,768 records per side, 2,048 occurrence entries and 8,192 mapping
entries. Their disjoint device arrays total 151,290,024 and 2,781,876 bytes.
Both plans remain resident, so admission is their sum plus 256 MiB runtime
allowance: 422,507,356 bytes. The 4x4 combined admission is 277,098,844 bytes.
The block variant replaces the prior factored plan before allocating its buffers.
Copied transfers are limited to 64 MiB, allocations to 128 MiB, arguments to 64.

Both A/B representations use preservation-enabled exact normalization. Each cut
runs one warmup and three alternating-order repetitions per representation.
Every native pass checks all logical candidates, referenced payloads, crossing
bits and the complete next-target set. Samples separate upload, submit/wait,
readback; setup is separate. One bounded layer is not end-to-end OQS throughput.

Nine 4x4 controls cover shared residuals with distinct crossing assignments and
bits 31/32/40/41, invalid occurrence extent, mapping product overflow, invalid
pair ID, invalid high crossing bits, upstream cofactor error, empty occurrence
extent, valid reuse after errors with both normalizers, and blocks 64/128.
Device errors cannot produce accepted partial mappings. Reset kernels precede
status publication; guarded u32 products and references stay within live extents.
Reverse cleanup and graceful runtime close are required before native success.

Use Q1 with 30-second case and 120-second run budgets initially. A timeout remains
visible evidence; extend only on measured setup/verification cost or to sharpen
a known timing boundary. Portable submission proves composition only. Native
acceptance requires complete pass/sample counts, zero mismatches, target coverage
one, all control outcomes and explicit false/null full-solve claims.
