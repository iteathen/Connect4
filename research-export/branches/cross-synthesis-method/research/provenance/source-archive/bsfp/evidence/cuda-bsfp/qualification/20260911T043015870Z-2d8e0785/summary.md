# CUDA-BSFP qualification 20260911T043015870Z-2d8e0785

- Outcome: **qualified**
- Profile: `c4-0009-o2-oqs-7x6-seed-slice`
- Source revision: `5c298c7e1dfdf1cfd93116884585144e33fb9dd7`
- Anonymous machine ID: `q1-3ef37d75-8664-4fb8-a2ed-04e49cc32199`
- GPU: NVIDIA GeForce GTX 1660 Ti (6144 MiB, driver 610.74)
- Node: v26.7.0
- Per-case timeout: 30000 ms
- Run timeout: 90000 ms
- VRAM policy: min(95% free, free-256 MiB, 12288 MiB absolute); emergency reserve 256 MiB
- Evidence PR: pending/not published

| Case | Tier | Status | Elapsed | Estimated device bound | Result |
| --- | --- | --- | ---: | ---: | --- |
| 7x6 c4 | user-specified | passed | 4944 ms | 258 MiB | native-oqs-seed-slice-pass |

Timeouts, memory-safety refusals, unsupported geometries, crashes, and correctness failures are evidence outcomes; they are not silently omitted.
