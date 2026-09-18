# CUDA-BSFP qualification 20260910T100734116Z-e8de3c61

- Outcome: **qualified**
- Profile: `c4-0009-c1-compact-ownership-42`
- Source revision: `fc7c8cc233b3cf1670ef75fde69750c91dd6492b`
- Anonymous machine ID: `q1-127feb01-3401-4b7d-9b86-2e396c4995ae`
- GPU: NVIDIA GeForce GTX 1660 Ti (6144 MiB, driver 610.74)
- Node: v26.7.0
- Per-case timeout: 120000 ms
- Run timeout: 900000 ms
- VRAM policy: min(95% free, free-256 MiB, 12288 MiB absolute); emergency reserve 256 MiB
- Evidence PR: pending/not published

| Case | Tier | Status | Elapsed | Estimated device bound | Result |
| --- | --- | --- | ---: | ---: | --- |
| 4x3 c3 | user-specified | passed | 1927 ms | 265 MiB | native-compact-frontier-pass |
| 4x4 c4 | user-specified | passed | 2701 ms | 274 MiB | native-compact-frontier-pass |
| 5x5 c4 | user-specified | passed | 20496 ms | 417 MiB | native-compact-frontier-pass |

Timeouts, memory-safety refusals, unsupported geometries, crashes, and correctness failures are evidence outcomes; they are not silently omitted.
