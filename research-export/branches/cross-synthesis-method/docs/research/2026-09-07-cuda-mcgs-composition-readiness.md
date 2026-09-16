# CUDA-MCGS public composition readiness — 2026-09-07

## Disposition

Connect4 is paused after C4-0005. The public CUDA-MCGS/CUDA-JS-Tensor/CUDA-JS prerequisites needed to describe the future comparison lane are present, but the executable CUDA-MCGS lane is **not dependency-ready** yet.

The blocking gap is not Connect Four semantics and is not a missing Tensor callable. It is the still-paused CUDA-MCGS #124 evaluator-runtime lifecycle: device-owned request accumulation, finite batching, request/item freshness, scatter/readiness/publication, pressure/failure/cancellation mapping, retryability, and terminal cleanup.

Connect4 must not implement those facts downstream because CUDA-MCGS owns them.

## Read-back identities

- Connect4 protected baseline: `main@0da0c4c692e648b26b0565a6bc6e75c8eb79ac8e`.
- CUDA-MCGS assessed main: `893a1676a303bf28aff8f24847b0be1559ba859c`.
- CUDA-JS-Tensor assessed main: `cbecc75138769419ed2c09fbfeb227f3ffe2de57`.

CUDA-MCGS #124 is open and explicitly paused at the time of this assessment.

## Public surfaces already sufficient

CUDA-MCGS package exports public entry points for:

- root library resolve/compose;
- `./search-compiler`;
- `./runtime/cuda-js`;
- `./evaluator/cuda-js-tensor`.

The public Tensor evaluator connector accepts a public `TensorDeviceProgram`, validates callable/item/workspace/import identity, and exposes an identity-bound Device-JS evaluator function/import without taking ownership of Tensor mathematics.

The Search Compiler / Program Package can carry selected-profile-owned Device-JS import declarations into the execution package, and the public CUDA-JS runtime adapter validates live imports and forwards them to public `compileDeviceProgram({ imports })`.

CUDA-JS-Tensor publicly exports `TensorDeviceProgram` and `compileTensorDeviceProgram` from its package root, so Connect4 does not need a deep import or a local native path to realize its product evaluator later.

CUDA-MCGS evaluator semantics already define the product-neutral lifecycle ports required by the future lane, including request admission, enqueue, batch formation/execution, completion, cancellation/failure, reuse, encoding, and capability publication.

## Missing owner implementation

The existing Tensor connector is intentionally stateless. The public import/runtime path only composes callable libraries into the generated Device-JS program. Neither one implements the active evaluator lifecycle.

The unchecked #124 acceptance work owns exactly the missing runtime bridge:

- multiple device-owned requests progressing without a host gather/launch/poll/relaunch loop;
- full and partial batch identity preservation;
- slot incarnation/freshness and stale-result rejection;
- result scatter/readiness/publication;
- explicit pressure, unavailable-capability, failure and cancellation dispositions;
- evaluator-free/non-Tensor deletion and substitution;
- terminal or honestly quarantined cleanup/retryability.

A downstream Connect4 implementation of those mechanisms would create a second owner for generic evaluator/search lifecycle semantics and violate the project ownership boundary.

## Connect4 composition map after #124

When the generic dependency is protected-complete, Connect4 should own only:

1. its C4-0002 evaluator semantics and product input/output encoding;
2. construction/qualification of the matching public `TensorDeviceProgram` / Device-JS realization;
3. the C4-0004 fairness profiles: incumbent, tree-equivalent CUDA-MCGS, and graph/transposition-enabled CUDA-MCGS kept distinct;
4. C4-0005 solved-game strength evidence applied to comparison outputs;
5. benchmark metrics and result identity.

It should consume CUDA-MCGS request/batch/scatter/session/resource semantics and CUDA-JS-Tensor/CUDA-JS only through their public surfaces.

## Resume condition

Connect4 remains paused until CUDA-MCGS #124 is explicitly resumed and its generic evaluator lifecycle is protected-complete enough to expose an executable public composition path. At that point return to Connect4, re-read exact dependency state, freeze the Connect4-owned comparison contract, and implement the product lane without reopening C4-0001 through C4-0005.
