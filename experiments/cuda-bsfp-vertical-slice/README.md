# CUDA-BSFP first ranked-activation vertical slice

Status: active correctness-first qualification on `feature/cuda-bsfp`.

## Purpose

Exercise the first real Connect4 BSFP consumer mapping through public CUDA-Algorithms and CUDA-JS contracts without importing search semantics or duplicating generic GPU workset mechanics in Connect4.

The selected consumer profile is the already-qualified 4x3 connect-3 support lattice:

- 256 support skeletons;
- rank = occupied-cell count, 0..12;
- at most four backward support predecessors per source skeleton;
- consumer-owned predecessor derivation `(sourceIndex, columnLane) -> predecessorIndex | INVALID`.

This slice validates **ranked dependency activation**, not complete GPU W/D/L reduction. C4-0009 requires BSFP-owned rank-complete existential/universal semantic reduction before a predecessor can become an authoritative W/D/L fact.

## Frozen lower tuple

Portable CI is pinned to:

- CUDA-Algorithms `7605326816ee523d69e66dcfde5b03caf098f559` from draft PR #8;
- CUDA-JS `98e2ebc942c14d63acf4dd82e912dd548c363a05` / `cuda-js@0.1.0-alpha.20`.

Do not silently move these refs when recording evidence. A new tuple requires a new qualification record.

## Portable mode

```sh
node experiments/cuda-bsfp-vertical-slice/run.mjs portable
```

Portable mode uses the public CUDA-JS testing runtime. It proves:

- BSFP builds a typed Device-JS leaf library through `compileDeviceLibrary()`;
- CUDA-Algorithms accepts that exact public library value through its ranked-derived-activation plan;
- CUDA-JS composes/links the consumer export into the Algorithms program;
- the plan prepares and submits one four-node device-owned epoch;
- public device-view binding and terminal cleanup remain valid.

Portable mode does **not** claim numerical GPU execution.

## Native mode

On a supported NVIDIA CUDA-JS host with the same exact lower tuple:

```sh
node experiments/cuda-bsfp-vertical-slice/run.mjs native
```

Native mode additionally requires exact device results for:

1. duplicate source `255,255` activates exactly the four unique full-skeleton predecessors:

```text
191, 239, 251, 254
```

2. output capacity 2 truthfully reports `OUTPUT_CAPACITY_EXHAUSTED` with required count 4, without treating the truncated buffer as valid output;
3. an intentionally corrupted target rank truthfully reports `RANK_DESCENT_VIOLATION`;
4. every opened operation, plan, view, allocation and runtime closes gracefully.

Qualification readback occurs only after the submitted epoch completes. Node does not inspect active counts or records to decide mathematical progression inside the epoch.

## Independent BSFP semantic oracle

The maintained direct symbolic reference is under `components/bsfp/` and is qualified separately by `components/bsfp/test/reference-solver.test.mjs` against an independent explicit-state oracle over every reachable nonterminal 4x3 state.

The production/reference BSFP solve path itself is bottom-up symbolic support-lattice composition, not recursive minimax.

## Non-claims

This slice does not claim:

- GPU-complete 4x3 W/D/L yet;
- empty-board 7x6 completion;
- CUDA performance;
- that full-universe scan/compaction is the final efficient Algorithms realization;
- that Algorithms owns BSFP proof/value/equality semantics;
- that CUDA-Algorithms SPEC-0004 is ready for Accepted status.

## Next seam after this slice

If native ranked activation passes, implement the smallest **BSFP-owned rank-complete contribution/finalization layer** for 4x3. Reuse CUDA-Algorithms primitives only where the mechanism remains consumer-neutral under the deletion test. If a reusable grouping/reduction mechanism is demonstrably missing, add it to CUDA-Algorithms with an unrelated consumer control; otherwise keep it in `components/bsfp/`.
