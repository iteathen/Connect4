# Q1 first owner-hardware report — bootstrap failure and recovery

**Date:** 2026-09-09  
**Evidence PR:** #15  
**Run ID:** `20260910T054132880Z-b043b1eb`  
**Source revision:** `e9db3d0464277b60989c3aa160bb6122f17b0b46`

## What the report established

The first owner-machine Q1 invocation successfully exercised the qualification supervisor and repository publication path. It produced an immutable evidence branch/PR after the solver child failed.

Captured environment included:

```text
OS:        Windows 11 Pro x64
CPU:       Intel Core i5-12600K, 16 logical cores
RAM:       32,509 MiB
Node:      v24.15.0
GPU:       NVIDIA GeForce GTX 1660 Ti
VRAM:      6,144 MiB total; 4,923 MiB free at preflight
Driver:    610.74
Compute:   7.5
```

The 4x3 P1 case had a conservative upper bound of 272,635,960 bytes (~261 MiB). Q1 admitted it under the configured VRAM envelope of 3,446 MiB. The child failed after about 0.6 seconds; GPU telemetry remained safe.

Q1 correctly:

- captured the machine and exact dependency revisions;
- performed VRAM admission before launch;
- captured stdout/stderr and the Node stack;
- classified the first case as `runtime-failure`;
- retained all later geometry entries as `skipped-after-boundary`;
- finalized and published the failed run to repository PR #15.

This is useful qualification-supervisor evidence even though it is not solver/native-CUDA correctness evidence.

## First divergence

The ranked-activation child failed before CUDA execution with:

```text
ERR_MODULE_NOT_FOUND: Cannot find package 'cuda-js'
imported from CUDA-Algorithms/src/sequence/stable-select-indices-u32.mjs
```

The bootstrap placed Connect4, CUDA-Algorithms, and CUDA-JS as sibling repositories, then exposed both packages only through `Connect4/node_modules`. Node package resolution for code physically executing from the sibling `CUDA-Algorithms` tree walks upward from that tree, so it could not see `Connect4/node_modules/cuda-js`.

Therefore this report does **not** falsify Node 24 compatibility, CUDA-Algorithms semantics, CUDA-JS, or native CUDA execution. The process did not reach the CUDA path.

## Authoritative repair

The repair belongs to the qualification bootstrap, not CUDA-Algorithms or CUDA-JS.

`tools/bootstrap-cuda-bsfp-q1.mjs` now owns clean workspace construction:

```text
workspace/
  Connect4/
    node_modules/          # real ignored directory
      cuda-js -> ../../CUDA-JS
      cuda-algorithms -> ../../CUDA-Algorithms
  CUDA-Algorithms/
  CUDA-JS/
  node_modules/            # shared ancestor for sibling dependency resolution
    cuda-js -> ../CUDA-JS
    cuda-algorithms -> ../CUDA-Algorithms
```

`CUDA-JS/node_modules` is populated by `npm ci` for CUDA-JS's own ordinary dependency set. The bootstrap invokes npm through the platform shell on Windows, avoiding the earlier `spawnSync npm.cmd EINVAL` wrapper failure.

Before launching Q1, the bootstrap executes package-resolution probes from the actual Connect4 and CUDA-Algorithms consumer roots and refuses to continue if either public package cannot resolve. It also verifies that the cloned Connect4 source checkout remains clean, preserving Q1 publication eligibility.

The bootstrap runs with the Node executable that invoked it. It does not select or require a Node version.

## Qualification requirement for the repair

The supported bootstrap topology must pass `--prepare-only` in CI on both Windows and Linux under Node 24.15.0. The owner-machine native rerun should then use this bootstrap and produce a new immutable Q1 run ID; PR #15 remains preserved as failure evidence and must not be overwritten.
