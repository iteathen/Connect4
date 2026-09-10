# CUDA-BSFP qualification evidence

This directory is the immutable repository sink defined by `docs/specs/profiles/C4-0009-Q1-benchmark-qualification-v1.md`.

Each child directory is one independently identified qualifier run published by `tools/cuda-bsfp-qualifier.mjs --qualify-benchmark`. Runs are append-only; reruns use new IDs. Evidence PRs may contain successful solves, timeouts, memory-safety refusals, unsupported geometries, correctness failures, runtime failures, or recovered interrupted runs.

Do not hand-edit generated evidence to turn a failure/boundary into a pass. If qualification must be repeated, generate another run.
