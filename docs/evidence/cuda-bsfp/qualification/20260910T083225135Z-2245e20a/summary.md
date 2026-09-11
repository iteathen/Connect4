# CUDA-BSFP qualification 20260910T083225135Z-2245e20a

- Outcome: **qualified**
- Profile: `c4-0009-b1-packed-dominance-42`
- Source revision: `c9480b50e55222049b55e2ead6ac924c099499bc`
- Anonymous machine ID: `q1-d25ff8c9-0672-4c41-8df8-4d53499b3692`
- GPU: NVIDIA GeForce GTX 1660 Ti (6144 MiB, driver 610.74)
- Node: v26.7.0
- Per-case timeout: 120000 ms
- Run timeout: 900000 ms
- VRAM policy: min(95% free, free-256 MiB, 12288 MiB absolute); emergency reserve 256 MiB
- Evidence PR: pending/not published

| Case | Tier | Status | Elapsed | Estimated device bound | Result |
| --- | --- | --- | ---: | ---: | --- |
| 7x6 c4 | user-specified | passed | 2179 ms | 272 MiB | native-packed-dominance-pass |

Timeouts, memory-safety refusals, unsupported geometries, crashes, and correctness failures are evidence outcomes; they are not silently omitted.
