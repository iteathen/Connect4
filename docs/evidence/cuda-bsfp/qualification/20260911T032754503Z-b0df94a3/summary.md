# CUDA-BSFP qualification 20260911T032754503Z-b0df94a3

- Outcome: **qualified**
- Profile: `c4-0009-o1-oqs-cofactor-42`
- Source revision: `6e30e3829ddede96c7a9dce3fdad71df467e4ebe`
- Anonymous machine ID: `q1-3ef37d75-8664-4fb8-a2ed-04e49cc32199`
- GPU: NVIDIA GeForce GTX 1660 Ti (6144 MiB, driver 610.74)
- Node: v26.7.0
- Per-case timeout: 240000 ms
- Run timeout: 600000 ms
- VRAM policy: min(95% free, free-256 MiB, 12288 MiB absolute); emergency reserve 256 MiB
- Evidence PR: pending/not published

| Case | Tier | Status | Elapsed | Estimated device bound | Result |
| --- | --- | --- | ---: | ---: | --- |
| 4x3 c3 | user-specified | passed | 5490 ms | 260 MiB | native-oqs-cofactor-pass |
| 4x4 c4 | user-specified | passed | 1849 ms | 260 MiB | native-oqs-cofactor-pass |
| 5x5 c4 | user-specified | passed | 58525 ms | 513 MiB | native-oqs-cofactor-pass |

Timeouts, memory-safety refusals, unsupported geometries, crashes, and correctness failures are evidence outcomes; they are not silently omitted.
