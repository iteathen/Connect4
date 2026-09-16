# CUDA-BSFP qualification 20260911T050640911Z-b3554293

- Outcome: **qualified**
- Profile: `c4-0009-o3-oqs-residual-reuse`
- Source revision: `5dfe1312a357c48eee53168e82fd6eba27814a06`
- Anonymous machine ID: `q1-3ef37d75-8664-4fb8-a2ed-04e49cc32199`
- GPU: NVIDIA GeForce GTX 1660 Ti (6144 MiB, driver 610.74)
- Node: v26.7.0
- Per-case timeout: 30000 ms
- Run timeout: 120000 ms
- VRAM policy: min(95% free, free-256 MiB, 12288 MiB absolute); emergency reserve 256 MiB
- Evidence PR: pending/not published

| Case | Tier | Status | Elapsed | Estimated device bound | Result |
| --- | --- | --- | ---: | ---: | --- |
| 4x4 c4 | user-specified | passed | 2845 ms | 264 MiB | native-oqs-factored-reuse-pass |
| 7x6 c4 | user-specified | passed | 10361 ms | 402 MiB | native-oqs-factored-reuse-pass |

Timeouts, memory-safety refusals, unsupported geometries, crashes, and correctness failures are evidence outcomes; they are not silently omitted.
