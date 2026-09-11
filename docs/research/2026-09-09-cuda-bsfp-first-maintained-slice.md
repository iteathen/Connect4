# CUDA-BSFP first maintained slice — portable qualification checkpoint

**Date:** 2026-09-09 local / 2026-09-10 GitHub UTC  
**Status:** portable and reference qualification passed; physical NVIDIA numerical qualification remains open  
**Branch:** `feature/cuda-bsfp`  
**Draft PR:** #14

## Purpose

Preserve the first maintained CUDA-BSFP implementation checkpoint after recovery/formalization of the CPC → WSL-625 → NDC → BSFP research line.

This record separates three facts that must not be conflated:

1. exact BSFP semantic/reference qualification;
2. portable CUDA composition/compilation qualification;
3. physical NVIDIA numerical qualification.

Only the first two are complete here.

## Exact repository tuple

Portable cross-repository qualification is frozen against:

```text
Connect4 qualification head:
  d39322a1a66585114a35558f910a5582c0fc05e2

CUDA-Algorithms:
  48ee0aec9acae7776950f03ab52ab1737e598b6e
  branch: feature/ranked-closure
  draft PR: #8

CUDA-JS:
  98e2ebc942c14d63acf4dd82e912dd548c363a05
  cuda-js@0.1.0-alpha.20

Node in hosted workflows:
  26.7.0
```

CUDA-JS was read/consumed only. It was **not modified** by this work.

## 1. Maintained BSFP semantic/reference slice

The maintained Connect4 BSFP component now owns:

- finite support-lattice construction;
- exact occupied-cell rank;
- backward support-predecessor derivation;
- Connect4 winning-line geometry;
- exact MTBDD reference machinery;
- direct symbolic support-lattice W/D/L recurrence;
- fixed dense 4x3 correctness profile.

For **4x3 connect-3**:

```text
support skeletons: 256
rank range:         0..12
winning lines:      14
root:               Win
```

The direct symbolic solver is evaluated bottom-up over support skeletons. It does not recursively enumerate legal move continuations in its solver path.

An independent explicit physical-state solver exists only inside qualification tests. Exhaustive differential qualification passes:

```text
reachable nonterminal states checked: 4,631
legal edges checked:                  11,818
W/D/L disagreements:                 0
root:                                 Win
```

This is consistent with the preserved 2026-09-09 research evidence while moving the tested semantics into a maintained component boundary.

## 2. Generic CUDA-Algorithms activation seam

The first generic upstream addition is intentionally **not** a BSFP/WDL primitive.

CUDA-Algorithms draft PR #8 owns a narrow implicit ranked derived-activation subprofile with typed consumer seam:

```text
(u32 sourceIndex, u32 emissionLane)
  -> u32 targetIndex | 0xffffffff
```

CUDA-Algorithms owns:

- bounded item/input/output capacities;
- bounded per-source emission lanes;
- strict rank-descent validation;
- duplicate-idempotent activation;
- deterministic ascending-index next-workset compaction;
- device-resident next extent and semantic status;
- output-capacity truth;
- prepared-epoch lifecycle.

The consumer retains item/domain meaning, derivation meaning, rank meaning subject to the ordering invariant, and all proof/value/equality/dominance semantics.

The deletion/universality gate is supported by the actual typed composition path with two materially different non-BSFP-shaped consumers in CUDA-Algorithms:

- implicit dependency DAG;
- staged data lineage.

Connect4 then maps the 4x3 support-lattice predecessor relation onto the same public plan.

CUDA-Algorithms head `48ee0aec9acae7776950f03ab52ab1737e598b6e` passed CI run `34438700869`. SPEC-0004 remains Working Draft and the implemented subprofile is not claimed to be an arbitrary record/context callback.

## 3. Connect4 ranked-activation slice

`experiments/cuda-bsfp-vertical-slice/run.mjs` composes:

```text
Connect4 support-predecessor semantics
  -> CUDA-JS typed Device-JS leaf library
  -> CUDA-Algorithms ranked derived activation plan
  -> CUDA-JS prepared execution/lifecycle
```

The 4x3 consumer facts are:

```text
item capacity:          256 support skeletons
max rank:               12
max emissions/source:   4
full-board predecessors:[191, 239, 251, 254]
Algorithms contract:    CUDA-Algorithms-ranked-derived-activation-u32-working-v0
prepared nodes:         4
```

The portable path proves compile/link/prepared-submission/resource compatibility through public package surfaces. Native mode separately checks numerical predecessor output, duplicate-idempotence, capacity truth and rank-violation status.

## 4. Complete dense 4x3 CUDA-BSFP W/D/L profile

The first complete Device-JS BSFP W/D/L realization is deliberately dense and correctness-first:

```text
support skeletons:       256
ownership valuations:    4,096
symbolic table entries:  1,048,576
table bytes:             4,194,304 (4 MiB)
winning lines:           14
prepared rank nodes:     13
rank order:              12 -> 0
result encoding:         Loss=0, Draw=1, Win=2 from P0 perspective
```

`components/bsfp/cuda/dense-symbolic-4x3-plan.mjs` constructs one fixed prepared DAG. Each rank kernel consumes only already-finalized rank+1 entries and applies Connect4-owned terminal geometry and exact P0-max/P1-min W/D/L composition.

Node submits/observes the operation but does not inspect intermediate rank values or select mathematical progression.

No new CUDA-Algorithms primitive was required for this complete W/D/L recurrence. This is important ownership evidence: the generic activation mechanism is useful infrastructure, but BSFP W/D/L reduction remains Connect4-owned.

The 4 MiB dense table is **not** a proposed standard-7x6 representation. It intentionally spends memory to make the first device recurrence simple enough to qualify independently.

## 5. Portable workflow evidence

Final repinned Connect4 qualification head:

```text
d39322a1a66585114a35558f910a5582c0fc05e2
```

All PR workflows passed:

```text
verify:             run 34438946185 — success
benchmark-evidence: run 34438946186 — success
strength-evidence:  run 34438946188 — success
bsfp-portable:      run 34438946196 — success
```

The `bsfp-portable` workflow checks out exact CUDA-Algorithms `48ee0aec9acae7776950f03ab52ab1737e598b6e` and exact CUDA-JS `98e2ebc942c14d63acf4dd82e912dd548c363a05`, binds them only through their public package surfaces, and successfully executes both portable slices:

1. ranked support-predecessor activation composition;
2. complete dense 13-rank W/D/L compile/prepare/submit path.

Hosted portable execution is not physical NVIDIA numerical evidence.

## 6. Physical qualification prepared but not yet executed

The following real-CUDA commands are ready:

```sh
# CUDA-Algorithms generic subprofile
node experiments/native-qualification/run-ranked-derived-activation.mjs

# Connect4 generic activation consumer
node experiments/cuda-bsfp-vertical-slice/run.mjs native

# Connect4 complete dense BSFP W/D/L
node experiments/cuda-bsfp-dense-4x3/run.mjs native
```

The dense native gate must establish:

```text
root W/D/L:             Win
nonterminal states:     4,631 checked
legal edges:            11,818 checked
W/D/L mismatches:       0
```

Physical evidence must record the exact Connect4/CUDA-Algorithms/CUDA-JS/Node/GPU/driver/provider tuple and cleanup result.

## 7. Architectural conclusions from the slice

Established enough to carry forward:

- BSFP can remain a separate solver lane from incumbent search semantics.
- The direct support-lattice recurrence has a maintained exact reference boundary.
- CUDA-JS SPEC-0028 typed library composition is sufficient for the first index-only consumer derivation seam; no CUDA-JS widening was required.
- A narrow implicit ranked derived-activation primitive is coherent in CUDA-Algorithms and has materially different consumer evidence.
- Generic target activation is not BSFP value/proof evaluation.
- Complete 4x3 W/D/L progression can remain entirely Connect4-owned while using public CUDA-JS execution.
- The semantic index should remain CUDA-free; CUDA execution is isolated under `components/bsfp/cuda/`.

Not established:

- arbitrary runtime-record derivation callbacks in CUDA-Algorithms;
- native GPU numerical correctness;
- GPU performance;
- standard-7x6 scalability;
- final WSL/NDC record layout;
- exact strong distance.

## 8. Next seam after physical correctness

Do not scale the dense ownership table to 7x6.

After the native 4x3 gate passes, preserve the same exact recurrence while replacing the intentionally redundant correctness representation with compact BSFP structure drawn from already-qualified research:

```text
WSL residual requirements/blockers
+ NDC shared dependency/certificate structure
+ CPC event/response facts
+ exact dominance/antichain frontiers
+ exact residual canonicalization/symmetry
+ bounded rank/shard execution where required
```

Any missing mechanism belongs in CUDA-Algorithms only if it is consumer-neutral, survives deletion of Connect4, and is supported by materially different consumers. A generic runtime/compiler/memory mechanism belongs in CUDA-JS only after a demonstrated lower-layer need.

## Non-claims

- no physical NVIDIA CUDA-BSFP numerical correctness result yet;
- no CUDA-BSFP GPU performance claim;
- no empty-board standard-7x6 solve;
- no strong-distance BSFP result;
- no claim that dense 4x3 state is the future production representation;
- no promotion of CUDA-Algorithms SPEC-0004 or C4-0006..0009 to Accepted authority.
