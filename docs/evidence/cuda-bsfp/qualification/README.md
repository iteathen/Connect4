# CUDA-BSFP qualification evidence

This directory is the immutable repository sink defined by `docs/specs/profiles/C4-0009-Q1-benchmark-qualification-v1.md`.

Each child directory is one independently identified qualifier run published by `tools/cuda-bsfp-qualifier.mjs --qualify-benchmark`. Runs are append-only; reruns use new IDs. Evidence may contain successful solves, timeouts, memory-safety refusals, unsupported geometries, correctness failures, runtime failures, or recovered interrupted runs.

Do not hand-edit generated evidence to turn a failure/boundary into a pass. If qualification must be repeated, generate another run.

## Consolidated qualification runs

The repository restructure moved branch-isolated qualification directories into the canonical `solver/cuda-bsfp` lane **without rewriting generated contents**. Original evidence branch heads are retained as merge parents, and each run directory is attached by its exact Git tree SHA.

| Run | Historical evidence PR | Outcome | Profile | Qualified source revision |
| --- | ---: | --- | --- | --- |
| `20260910T054132880Z-b043b1eb` | #15 | failed | `c4-0009-p1` | `e9db3d0464277b60989c3aa160bb6122f17b0b46` |
| `20260910T055412412Z-59fbc872` | #16 | failed | `c4-0009-p1` | `16b48b4eb1501e122510a2a052cdbed7bccaa8f0` |
| `20260910T064427961Z-92f8a76d` | #17 | failed | `c4-0009-p1` | `16b48b4eb1501e122510a2a052cdbed7bccaa8f0` |
| `20260910T065508562Z-fb451dd8` | #18 | complete-with-boundaries | `c4-0009-p1` | `5b0e1448a3d5ed2b4314aef8fe52a226b752effd` |
| `20260910T083225135Z-2245e20a` | #19 | qualified | `c4-0009-b1-packed-dominance-42` | `c9480b50e55222049b55e2ead6ac924c099499bc` |
| `20260910T100734116Z-e8de3c61` | #20 | qualified | `c4-0009-c1-compact-ownership-42` | `fc7c8cc233b3cf1670ef75fde69750c91dd6492b` |
| `20260911T032754503Z-b0df94a3` | #21 | qualified | `c4-0009-o1-oqs-cofactor-42` | `6e30e3829ddede96c7a9dce3fdad71df467e4ebe` |
| `20260911T043015870Z-2d8e0785` | #28 | qualified | `c4-0009-o2-oqs-7x6-seed-slice` | `5c298c7e1dfdf1cfd93116884585144e33fb9dd7` |
| `20260911T050640911Z-b3554293` | — | qualified | `c4-0009-o3-oqs-residual-reuse` | `5dfe1312a357c48eee53168e82fd6eba27814a06` |

O2 qualified a native 7x6 selected seed slice. O3 qualified exact residual-pair reuse and crossing-occurrence mapping on 4x4 and a bounded selected 7x6 reuse cut. Neither is a complete 7x6 quotient, solver closure, or root W/D/L claim.

The generated `summary.md`, `manifest.json`, `results.json`, system records, case records and logs inside each run remain the evidence authority for that run. This table is only a navigation index.

Evidence PR branches are delivery surfaces, not durable work lanes. Once an exact generated run subtree and its evidence-head ancestry are consolidated here, the evidence PR can be closed and the delivery ref becomes retirement-safe. The original PR conversation remains GitHub history.
