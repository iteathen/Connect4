# Connect4 Status

**Updated:** 2026-09-09
**Phase:** first CUDA-BSFP 4x3 slices implemented and portable-qualified; native CUDA numerical qualification next

## Product role

Connect4 is the product-owned Connect Four solver/validation repository. It owns Connect Four domain truth, evaluator/oracle evidence, benchmark fairness, and two intentionally separate exact-solver lanes:

1. `components/incumbent/` — incumbent minimax/alpha-beta/search implementation;
2. `components/bsfp/` — CUDA-BSFP, using backward symbolic fixed-point proof semantics rather than search semantics.

The lanes share Connect4-owned domain/oracle authority but do not inherit each other's solver internals.

## Protected baseline and active branch

Protected `main@de47d43f4f4133a68973d0876a402531ef5735da` remains unchanged.

Active BSFP development:

```text
branch: feature/cuda-bsfp
PR:     #14 (draft)
```

The recovered 2026-09-09 BSFP research/evidence packet is preserved on this branch as provenance/evidence. The incumbent lane remains intact.

## Formal BSFP specification stack

- `C4-0006-control-parity-and-winspace-v1.md` — CPC + WSL-625 structural/domain mathematics;
- `C4-0007-nested-dependency-closure-v1.md` — NDC dependency/certificate/fixed-point proof semantics;
- `C4-0008-bsfp-exact-solver-v1.md` — exact BSFP W/D/L semantics;
- `C4-0009-bsfp-cuda-execution-profile-v1.md` — CUDA-BSFP realization and CUDA-Algorithms/CUDA-JS composition.

C4-0006..0008 are branch-local Candidate semantic specs. C4-0009 remains Working until physical CUDA evidence closes its first execution profile. None is Accepted protected-main authority yet.

## First maintained BSFP semantic/reference slice

`components/bsfp/` now owns a maintained, CUDA-free BSFP semantic/reference surface:

- geometry-driven support lattice;
- exact support rank table and backward predecessor mapping;
- BSFP-owned geometric winning-line schemas;
- exact MTBDD reference machinery;
- direct symbolic support-lattice W/D/L solver;
- dense symbolic 4x3 correctness profile.

The maintained direct symbolic solver is not recursive minimax/search. It evaluates complete symbolic predecessor functions bottom-up over support skeletons.

For **4x3 connect-3**:

```text
support skeletons: 256
rank range:         0..12
winning lines:      14
root W/D/L:         Win
```

The independent test oracle is an explicit physical-state solver used only for differential qualification. The maintained BSFP result agrees on every reachable nonterminal state:

```text
nonterminal states checked: 4,631
legal edges checked:         11,818
W/D/L mismatches:            0
```

This preserves an independent semantic oracle for the CUDA implementation without making search part of the BSFP production path.

## CUDA-Algorithms seam

Exact current upstream development pair:

```text
CUDA-Algorithms: 48ee0aec9acae7776950f03ab52ab1737e598b6e
branch:          feature/ranked-closure
PR:              #8 (draft)
CUDA-JS:         98e2ebc942c14d63acf4dd82e912dd548c363a05
package:         cuda-js@0.1.0-alpha.20
```

CUDA-Algorithms now has a narrow Working **implicit ranked derived activation** subprofile:

```text
(u32 sourceIndex, u32 emissionLane)
  -> u32 targetIndex | 0xffffffff
```

It owns bounded emission, strict rank validation, duplicate-idempotent activation, deterministic next-workset compaction, device-resident next extent/status, capacity truth and prepared-epoch lifecycle.

It does **not** own BSFP W/D/L, CPC, WSL-625, NDC, proof equality, dominance, terminal semantics, or existential/universal reduction.

The upstream profile has portable typed-composition evidence from two materially different generic consumers: an implicit dependency DAG and staged data lineage. Connect4 is a third consumer mapping through the same public package surface.

## Ranked-activation CUDA-BSFP slice

`experiments/cuda-bsfp-vertical-slice/run.mjs` maps the 4x3 support-lattice predecessor relation onto CUDA-Algorithms ranked derived activation through CUDA-JS typed Device-JS library composition.

The portable slice proves:

- exact typed consumer leaf composition;
- public-package-only dependency path;
- one four-node prepared device epoch;
- no host semantic progression inside the epoch;
- bounded support item universe of 256;
- max predecessor emissions of 4;
- resource lifecycle/cleanup through public CUDA-JS.

Native mode is already prepared to check exact predecessor output, duplicate activation idempotence, output-capacity truth and strict rank-violation failure on a real NVIDIA host.

## Complete dense CUDA-BSFP W/D/L slice

A second 4x3 profile proves that the complete BSFP W/D/L recurrence can be expressed directly in Device-JS **without adding another CUDA-Algorithms primitive**.

The correctness-first dense profile is intentionally redundant:

```text
support skeletons:    256
ownership valuations: 4,096
symbolic table entries: 1,048,576
table bytes:          4,194,304 (4 MiB)
prepared rank nodes:  13
rank order:           12 -> 0
```

`components/bsfp/cuda/dense-symbolic-4x3-plan.mjs` submits one fixed prepared DAG. Each rank reads only already-finalized rank+1 table entries and performs Connect4-owned immediate-terminal and P0-max/P1-min W/D/L composition on device. Node does not choose the next rank or inspect intermediate values.

This dense table is a **correctness profile, not a scalability design**. It intentionally avoids introducing compression complexity before the device recurrence is physically qualified.

`experiments/cuda-bsfp-dense-4x3/run.mjs` has two modes:

- `portable` — compile/prepare/submit/cleanup through CUDA-JS testing runtime;
- `native` — execute on real CUDA, read the completed table after the operation, and compare every 4x3 nonterminal state with the independent physical-game oracle.

## Portable qualification

The exact pre-repin Connect4 slice at `ace55b2b5558e22d195abf19694446c5805af86c` passed all four PR workflows, including the initial pinned CUDA-Algorithms revision:

```text
verify:             success
benchmark-evidence: success
strength-evidence:  success
bsfp-portable:      success
```

`bsfp-portable` run `34438350937` successfully compiled/submitted both:

1. ranked activation: 256 support items, rank 0..12, max fanout 4, four prepared nodes;
2. dense W/D/L: 1,048,576 table entries, 4 MiB, 14 winning lines, 13 prepared rank nodes.

The workflow is now repinned to the final CUDA-Algorithms development head `48ee0aec9acae7776950f03ab52ab1737e598b6e`; the resulting exact-pair CI run is the next evidence record to freeze.

CUDA-Algorithms itself passed full CI on `48ee0aec9acae7776950f03ab52ab1737e598b6e`, including reference tests, two typed consumer-composition cases and syntax checks for its native harness.

## CUDA-JS boundary

**CUDA-JS was not modified.**

The slices consume existing accepted/public capabilities only:

- SPEC-0028 typed Device-JS library composition;
- Device-JS program compilation/linking;
- device views and public range-relation inspection;
- prepared operation DAGs;
- atomic/status mechanisms used by CUDA-Algorithms;
- ordinary operations and resource lifecycle.

No direct CUDA FFI, C/C++/CUDA C++, hand PTX, native-addon escape, private lower import, or Python was added.

## Native qualification still required

No native NVIDIA CUDA-BSFP numerical result is claimed yet.

Required physical runs are prepared:

```text
CUDA-Algorithms:
  node experiments/native-qualification/run-ranked-derived-activation.mjs

Connect4 ranked activation:
  node experiments/cuda-bsfp-vertical-slice/run.mjs native

Connect4 dense W/D/L:
  node experiments/cuda-bsfp-dense-4x3/run.mjs native
```

The dense native run is the decisive first solver gate: root must be Win and all **4,631** reachable nonterminal states / **11,818** legal edges must agree with the independent oracle.

## Next engineering seam after native correctness

Do **not** scale the dense ownership table toward empty 7x6. Its purpose is to qualify the recurrence and GPU execution path.

After native parity, move the same exact BSFP semantics toward compact representation, beginning with the already-established structural candidates:

- WSL/residual requirement and blocker state;
- NDC shared dependency/certificate structure;
- CPC event/response facts;
- exact dominance/antichain frontiers;
- exact residual symmetry/canonicalization;
- bounded rank/shard execution where required.

Only generic mechanisms demonstrated reusable by materially different consumers should be promoted to CUDA-Algorithms. BSFP semantics remain in Connect4.

## Non-claims

- no native CUDA-BSFP numerical correctness result yet;
- no CUDA-BSFP GPU performance result;
- no empty-board standard-7x6 CUDA-BSFP completion;
- no exact strong-distance BSFP result;
- the dense 4 MiB profile is not a proposed 7x6 representation;
- CUDA-Algorithms SPEC-0004 remains Working Draft;
- C4-0006..0009 are not Accepted protected-main authority;
- the incumbent minimax/search lane is not replaced or modified.
