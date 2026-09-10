# CUDA-BSFP Q1 benchmark qualifier implementation checkpoint

**Date:** 2026-09-09  
**Branch:** `feature/cuda-bsfp`  
**Authority:** subordinate to C4-0009 and C4-0009-Q1

## Implemented

The Q1 outer qualifier now exists under `tools/cuda-bsfp-qualifier.mjs` and `tools/cuda-bsfp-qualifier/`.

The runner is explicitly armed with `--qualify-benchmark`, publishes official runs by default, and separates solver execution from report publication. Solver children never receive GitHub publication tokens.

The default geometry ladder reaches 9x7. Current P1 executes only its frozen 4x3 connect-3 case; larger entries remain explicit `unsupported-profile` observations until a compact representation registers support.

GPU launch admission is fail-closed. A profile must provide a finite conservative upper memory bound and current selected-device free VRAM must be readable. Default policy is the minimum of 70% current free VRAM, current free minus 1024 MiB, and a 12288 MiB absolute cap. Runtime monitoring terminates the child if free VRAM crosses the 512 MiB emergency floor.

Each case is child-process isolated with a 120 s default case timeout inside a 900 s whole-run timeout. stdout/stderr are captured. Nonzero exit, signal, unparseable result, timeout, memory abort and exact-result mismatch remain distinct evidence states.

Durable local state is written before child execution. Event JSONL is fsync'd at boundaries. A later invocation recognizes unfinished prior runs and converts them to `aborted-prior-process-or-host`, preserving surviving logs; requested publication is retried.

Published evidence is append-only under `docs/evidence/cuda-bsfp/qualification/<run-id>/`. Publication constructs Git blobs/tree/commit through GitHub's HTTPS API, creates `evidence/cuda-bsfp-q1/<run-id>`, then opens a PR to the selected base. Existing evidence branches/PRs are detected so publication recovery is idempotent rather than duplicating runs.

Machine evidence intentionally excludes hostname, username, serials, GPU UUID/PCI bus identity, MAC/network identifiers and arbitrary environment variables. A persistent locally generated anonymous UUID identifies repeat runs from the same host. Published log content redacts local home/repository paths and common GitHub token forms.

Repository logs are bounded to 8 MiB per file by default using head+tail retention; the traceback/error tail remains present and truncation is explicit. Full logs stay in the local spool. A SHA-256 manifest binds every published payload.

## Portable qualification performed before publication

Portable module tests exercise explicit arming, default ladder beyond 7x5, custom geometry parsing, simultaneous fraction/reserve/absolute VRAM admission, exact BigInt dense-shape scaling, logged child success, timeout containment, publication log sanitization/truncation with tail preservation, interrupted-run recovery, local-only recovery behavior, GitHub evidence branch/PR publication, and retry/resume of existing evidence publication. A dry-run also exercises orchestration/report finalization without GPU allocation or repository publication.

These are portable results only. Native NVIDIA solver evidence remains the next gate and must itself be emitted through Q1.
