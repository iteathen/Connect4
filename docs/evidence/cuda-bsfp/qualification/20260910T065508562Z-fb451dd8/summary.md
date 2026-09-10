# CUDA-BSFP qualification 20260910T065508562Z-fb451dd8

- Outcome: **complete-with-boundaries**
- Profile: `c4-0009-p1`
- Source revision: `5b0e1448a3d5ed2b4314aef8fe52a226b752effd`
- Anonymous machine ID: `q1-553b6531-b0fa-4f5a-9026-21c7178f5d9a`
- GPU: NVIDIA GeForce GTX 1660 Ti (6144 MiB, driver 610.74)
- Node: v26.7.0
- Per-case timeout: 120000 ms
- Run timeout: 900000 ms
- VRAM policy: min(70% free, free-1024 MiB, 12288 MiB absolute); emergency reserve 512 MiB
- Evidence PR: pending/not published

| Case | Tier | Status | Elapsed | Estimated device bound | Result |
| --- | --- | --- | ---: | ---: | --- |
| 4x3 c3 | exhaustive-known | passed | 13285 ms | 260 MiB | native-exhaustive-wdl-pass |
| 4x4 c4 | known-oracle | unsupported-profile | 0 ms | 156 MiB | c4-0009-p1 does not implement 4x4-c4 |
| 5x4 c4 | known-oracle | unsupported-profile | 0 ms | 12,500 MiB | c4-0009-p1 does not implement 5x4-c4 |
| 5x5 c4 | scaling | unsupported-profile | 0 ms | 995,328 MiB | c4-0009-p1 does not implement 5x5-c4 |
| 6x5 c4 | scaling | unsupported-profile | 0 ms | 191,102,976 MiB | c4-0009-p1 does not implement 6x5-c4 |
| 7x5 c4 | scaling | unsupported-profile | 0 ms | 36,691,771,392 MiB | c4-0009-p1 does not implement 7x5-c4 |
| 7x6 c4 | known-oracle | unsupported-profile | 0 ms | 13,816,758,796,288 MiB | c4-0009-p1 does not implement 7x6-c4 |
| 8x6 c4 | scaling | unsupported-profile | 0 ms | 6,189,907,940,737,024 MiB | c4-0009-p1 does not implement 8x6-c4 |
| 8x7 c4 | scaling | unsupported-profile | 0 ms | 4,611,686,018,427,388,000 MiB | c4-0009-p1 does not implement 8x7-c4 |
| 9x7 c4 | scaling | unsupported-profile | 0 ms | 4,722,366,482,869,645,000,000 MiB | c4-0009-p1 does not implement 9x7-c4 |

Timeouts, memory-safety refusals, unsupported geometries, crashes, and correctness failures are evidence outcomes; they are not silently omitted.
