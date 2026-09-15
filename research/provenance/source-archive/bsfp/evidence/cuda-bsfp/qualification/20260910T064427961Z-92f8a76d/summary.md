# CUDA-BSFP qualification 20260910T064427961Z-92f8a76d

- Outcome: **failed**
- Profile: `c4-0009-p1`
- Source revision: `16b48b4eb1501e122510a2a052cdbed7bccaa8f0`
- Anonymous machine ID: `q1-fd1a1a6c-ed4b-4845-a86c-5ce0688477a4`
- GPU: NVIDIA GeForce GTX 1660 Ti (6144 MiB, driver 610.74)
- Node: v26.7.0
- Per-case timeout: 120000 ms
- Run timeout: 900000 ms
- VRAM policy: min(70% free, free-1024 MiB, 12288 MiB absolute); emergency reserve 512 MiB
- Evidence PR: pending/not published

| Case | Tier | Status | Elapsed | Estimated device bound | Result |
| --- | --- | --- | ---: | ---: | --- |
| 4x3 c3 | exhaustive-known | runtime-failure | 672 ms | 260 MiB | child exited 1 signal none |
| 4x4 c4 | known-oracle | skipped-after-boundary | 0 ms | 156 MiB | 01-4x3-c3: runtime-failure |
| 5x4 c4 | known-oracle | skipped-after-boundary | 0 ms | 12,500 MiB | 01-4x3-c3: runtime-failure |
| 5x5 c4 | scaling | skipped-after-boundary | 0 ms | 995,328 MiB | 01-4x3-c3: runtime-failure |
| 6x5 c4 | scaling | skipped-after-boundary | 0 ms | 191,102,976 MiB | 01-4x3-c3: runtime-failure |
| 7x5 c4 | scaling | skipped-after-boundary | 0 ms | 36,691,771,392 MiB | 01-4x3-c3: runtime-failure |
| 7x6 c4 | known-oracle | skipped-after-boundary | 0 ms | 13,816,758,796,288 MiB | 01-4x3-c3: runtime-failure |
| 8x6 c4 | scaling | skipped-after-boundary | 0 ms | 6,189,907,940,737,024 MiB | 01-4x3-c3: runtime-failure |
| 8x7 c4 | scaling | skipped-after-boundary | 0 ms | 4,611,686,018,427,388,000 MiB | 01-4x3-c3: runtime-failure |
| 9x7 c4 | scaling | skipped-after-boundary | 0 ms | 4,722,366,482,869,645,000,000 MiB | 01-4x3-c3: runtime-failure |

Timeouts, memory-safety refusals, unsupported geometries, crashes, and correctness failures are evidence outcomes; they are not silently omitted.
