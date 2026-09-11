# R6 — Incremental Offline Quotient Synthesis

## Scope

R6 tests whether the exact residual-class quotient can be synthesized incrementally from the previous quotient layer instead of rebuilding every cut independently from all forgotten ownership histories.

The construction seeds one exact C1 Win/Loss residual pair for a support, then advances line by line. At each cut it enumerates only the ownership assignments for newly introduced occupied cells, with width bounded by `connect`, cofactors the prior residual state, retains the next crossing ownership, and exact-deduplicates the resulting residual pairs.

This is research qualification, not a 7x6 completion or native CUDA performance claim.

## Exactness gate

The R6 workflow `BSFP OQS incremental qualification` completed successfully at commit `28b313b605d39b9ba66ffcde9aba45c5cdc7bf89` (run `34550418460`, job `103111963716`).

For 4x3 connect-3, 4x4 connect-4, 5x3 connect-4, 4x5 support 1284, 5x4 support 2353, and 5x5 support 4426, every incrementally generated layer was compared as an exact semantic state set against an independently rebuilt R3 layer. Direct multi-cell cofactors were also checked against sequential exact cofactors on those oracle controls.

The additional 5x5 R5 adversarial supports 4743, 6351, and 6465 were checked against the durable R5 totals for total dense states, maximum dense states, and transition entries.

No mismatch occurred.

## Results

| Geometry / scope | Incremental synthesis | Independent layer rebuild | Oracle / incremental | Max layer candidates | Max pair records/state |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4x3 c3 / all 256 supports | 168.711 ms | 639.847 ms | 3.79x | 224 | 53 |
| 4x4 c4 / all 625 supports | 903.557 ms | 2,155.553 ms | 2.39x | 1,536 | 60 |
| 5x3 c4 / all 1,024 supports | 208.301 ms | 378.243 ms | 1.82x | 48 | 29 |
| 4x5 c4 / support 1284 | 18.238 ms | 291.526 ms | 15.98x | 818 | 86 |
| 5x4 c4 / support 2353 | 17.239 ms | 398.413 ms | 23.11x | 726 | 151 |
| 5x5 c4 / support 4426 | 230.546 ms | 16,372.407 ms | 71.02x | 2,770 | 648 |

Additional R5 5x5 adversarial supports, for which R6 checked the durable R5 state/transition totals without independently rebuilding every layer:

| Support | Max dense states | Max layer candidates | Max active pair records | Max pair records/state | Incremental synthesis |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 4743 | 3,985 | 6,260 | 8,769 | 740 | 113.777 ms |
| 6351 | 2,107 | 2,850 | 7,129 | 648 | 63.664 ms |
| 6465 | 9,170 | 11,132 | 17,448 | 692 | 212.742 ms |

Support 4426 retained the authoritative R5 totals: 16,736 total dense states, 1,603 maximum dense states, and 22,598 transition entries. Supports 4743, 6351, and 6465 likewise retained their R5 totals.

## Bottleneck migration

R5 established independent `buildLayer` reconstruction as the dominant quotient-compilation cost. R6 removes that repeated history reconstruction. On the 5x5 support-4426 oracle checkpoint, exact quotient synthesis is now about 71 times faster than independently rebuilding the layers.

The dominant observed preprocessing cost has therefore moved upstream. The geometry-wide C1 ownership-antichain solve used to obtain exact seed frontiers took about 58.5–59.0 seconds in the two 5x5 R6 preparations, while the incremental quotient synthesis for an individual adversarial 5x5 support took only 64–231 ms.

This changes the CUDA priority:

1. preserve incremental quotient synthesis as the production OQS direction;
2. retain the independent R3/R4 construction as a qualification oracle, not the production builder;
3. move/replace the expensive C1 semantic seed construction before spending substantial effort optimizing already-subsecond CPU quotient synthesis;
4. still qualify packed CUDA cofactor/normalization because production OQS should remain device-resident and 7x6 scale is unknown, but measure its value against the new CPU baseline;
5. do not infer 7x6 capacities from the 5x5 maxima.

## CUDA seam

The first CUDA OQS semantic kernel was added after R6 under `components/bsfp/cuda/oqs-cofactor-42-program.mjs`. It operates on packed 42-bit residual Win/Loss frontiers, generates one successor candidate per `(quotient state, local input ordinal)`, normalizes exact antichains on device, and preserves explicit invalid-extent/offset/capacity status.

A portable compile qualification against CUDA-JS `98e2ebc942c14d63acf4dd82e912dd548c363a05` passed in workflow run `34555851973`. This proves Device-JS/compiler compatibility only; native result parity and native performance remain open.

## Decision

Promote **incremental OQS** as the current production synthesis algorithm candidate. The next performance investigation targets the C1 semantic seed/support-lattice construction and then measures the CUDA cofactor layer against the new incremental CPU baseline.
