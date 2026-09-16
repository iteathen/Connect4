# CUDA-BSFP Q1 native P1 qualification pass

**Date:** 2026-09-09 local / 2026-09-10 UTC  
**Branch:** `feature/cuda-bsfp`  
**Evidence PR:** #18  
**Run:** `20260910T065508562Z-fb451dd8`  
**Source revision:** `5b0e1448a3d5ed2b4314aef8fe52a226b752effd`

## Result

C4-0009-P1 completed its first real NVIDIA numerical qualification through the C4-0009-Q1 reporting harness.

Exact host evidence:

```text
OS:             Windows 11 Pro x64
Node:           26.7.0
GPU:            NVIDIA GeForce GTX 1660 Ti
VRAM:           6144 MiB
compute cap.:   7.5
driver:         610.74
CUDA-Algorithms 48ee0aec9acae7776950f03ab52ab1737e598b6e
CUDA-JS         98e2ebc942c14d63acf4dd82e912dd548c363a05
```

The Connect4 checkout was clean and the exact dependency pair was recorded by Q1.

## Native P1-A ranked activation

Outcome: `native-numerical-pass`.

Qualified facts:

- full-skeleton predecessor output exactly `[191, 239, 251, 254]`;
- duplicate source activation remained idempotent;
- output-capacity exhaustion reported semantic status `5` with required count `4`;
- strict rank-descent violation reported semantic status `4`;
- prepared operation completed through the public CUDA-Algorithms / CUDA-JS composition seam;
- child exited normally with no timeout or memory-safety abort.

Observed duration: 11,852 ms.

## Native P1-B dense BSFP W/D/L

Outcome: `native-exhaustive-wdl-pass`.

```text
support skeletons:        256
ownership assignments:    4096
table elements:            1,048,576
table bytes:               4,194,304
prepared rank nodes:       13
root WDL:                  +1 (Win)
reachable states checked:  4,631
legal edges checked:       11,818
W/D/L mismatches:          0
```

Observed duration: 1,418 ms.

The exhaustive comparison is against the independent Connect4 physical-state oracle and therefore closes the current P1 native numerical gate for the exact recorded pair.

## Memory-safety evidence

Q1 admitted the profile from its finite conservative bound:

```text
estimated profile upper bound: 261 MiB
initial free VRAM:              4,974 MiB
admission allowance:            3,481 MiB
minimum sampled free VRAM:      4,910 MiB
peak sampled used VRAM:         1,057 MiB
emergency free floor:             512 MiB
```

No timeout or memory-safety boundary occurred.

## Run disposition

The overall Q1 outcome is `complete-with-boundaries`, not `qualified`, because the registered P1 execution profile intentionally supports only 4x3 connect-3. The 4x4 through 9x7 ladder entries are `unsupported-profile`; they were not attempted using the dense P1 representation.

This distinction is important: the larger cases did not fail solving. They have no registered executable P1 representation.

## Consequence

The native correctness question for the first CUDA-BSFP vertical slice is closed. Do not scale the dense ownership table toward standard 7x6.

The next solver seam is compact BSFP representation work, beginning with the already-supported research direction:

1. residual WSL requirement representation;
2. exact residual-dominance W/L antichain frontiers per support/event skeleton;
3. direct predecessor production without a materialized physical-state graph;
4. CPC / temporal-response and blocker facts where needed;
5. exact canonicalization/symmetry;
6. bounded GPU execution profile registered in Q1 only after the compact semantics are independently qualified.

The first decisive compact target remains 4x3 + 4x4 with state enumeration forbidden in the solve path. Expected roots are 4x3 Win and 4x4 Draw.

## Preserved earlier failures

PRs #15, #16 and #17 remain useful negative evidence for bootstrap/package resolution, Node-24 native support policy, and missing experimental-FFI launch state respectively. They are not overwritten or reclassified as solver failures.

## Non-claims

- no empty-board 7x6 completion;
- no native compact BSFP representation yet;
- no strong distance-to-win/loss result;
- no GPU performance claim beyond the recorded qualification durations;
- no claim that the dense P1 representation is suitable beyond its frozen correctness profile.
