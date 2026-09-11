# C4-0009-B1 — Packed 42-bit dominance throughput benchmark v0

**Status:** Working performance profile on `feature/cuda-bsfp`.  
**Parent:** C4-0009 CUDA-BSFP execution profile v1.  
**Qualifier:** C4-0009-Q1.

## Purpose

Measure whether the exact hot operation exposed by compact ownership-antichain BSFP is a practical CUDA workload before building the complete compact solver around it.

B1 is **performance evidence, not a solver qualification profile**. It does not claim to solve 7x6 Connect Four. It measures fixed-width packed candidate-vs-frontier dominance marking on real CUDA hardware using the same 42-bit ownership width required by standard 7x6.

## Workload

Standard profile:

- geometry label: 7x6 connect-4;
- candidate masks: 1,048,576;
- frontier masks: 568;
- mask width: 42 bits stored as two u32 lanes;
- measured repetitions: 5 after one warmup;
- exact subset checks per measured pass: 595,591,168;
- exact u32-lane subset operations per measured pass: 1,191,182,336.

The fixture is `full-scan-no-hit-bit41`: every frontier mask owns bit 41 while every candidate mask clears bit 41. Therefore no frontier element can be a subset of any candidate, and every candidate must examine the complete 568-element frontier. This intentionally measures the full-scan boundary rather than relying on early-exit luck.

## Kernel semantics

For each candidate `c`, the kernel tests frontier masks `f` until either:

```text
f subset_of c
```

or the frontier is exhausted. A 42-bit subset test is exactly:

```text
(f.lo & ~c.lo) == 0
and
(f.hi & ~c.hi) == 0
```

The benchmark writes a dominated flag and exact number of frontier entries tested for each candidate. Native qualification reads both arrays back and requires every flag to be zero and every check count to equal 568.

## Performance fields

The child result records separately:

- fixture construction;
- CUDA runtime open;
- Device-JS compile/module load/prepared operation construction;
- device allocation;
- upload;
- each submit+wait sample;
- median/min/mean/max submit+wait time;
- readback;
- host verification;
- candidates/second;
- 42-bit subset checks/second;
- u32-lane subset operations/second.

`submit+wait` is not labeled pure kernel time because it includes the CUDA-JS prepared-operation submission/synchronization boundary.

No throughput number is a correctness gate. Correctness requires exact output/check-count agreement; speed remains descriptive evidence.

## Memory bound

B1 device payload is approximately 16 MiB:

- candidate low/high words;
- output dominated flags;
- output check counts;
- frontier low/high words.

Q1 admission adds a fixed 256 MiB runtime allowance. The resulting finite upper bound is checked against Q1's current 95%-of-free-VRAM capacity policy before launch.

## Why this benchmark exists

The retained 5x5 ownership-antichain solve produced 1,044,159 surviving boundary records but the rolling executor generated about 81.5 million pair candidates. CPU BigInt dominance became the scaling wall while resident memory remained modest. B1 tests the hypothesis that fixed-width dominance marking is massively parallel enough on the target NVIDIA device to justify a CUDA compact-antichain implementation.

A strong B1 result does not prove the entire 7x6 solver will be fast. It only removes one major execution uncertainty. Candidate generation, deduplication, survivor compaction, WSL/CPC/NDC compression and rank/shard scheduling remain separate qualification seams.

## Falsifiers

Reassess the packed-antichain CUDA direction if full-scan dominance throughput is too low to make the measured 5x5 candidate volume practical, Device-JS code generation makes the fixed-width comparison unexpectedly expensive, or memory/launch overhead dominates despite the small bounded payload.
