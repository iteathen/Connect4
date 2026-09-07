# Connect4 Agent Entry Point

Read this file before changing the repository.

## Product purpose

Connect4 is an independent Node benchmark and validation product for search architectures. Its first job is to preserve a strong incumbent CPU minimax/alpha-beta baseline and compare it fairly with a future CUDA-MCGS device-resident search lane under the same Connect Four game and evaluator semantics.

Connect4 is not a CUDA runtime, Tensor framework, MCGS framework, generic benchmark framework, or browser game.

## Authority order

1. Explicit current project-owner instruction.
2. This file and accepted Connect4 ADR/specification files.
3. `STATUS.md` and `next_step.yaml`.
4. Research notes and plans.
5. Legacy source material and historical behavior.

Legacy code is evidence and reusable source material, not specification authority.

## Governing engineering cycle

For every meaningful unit apply:

**assess -> research -> reassess -> plan -> execute -> qualify -> review -> cleanup/document**

Preserve valid work. Treat issues, comments, benchmark results, legacy code, and prior conclusions as evidence rather than authority.

## Ownership

Connect4 owns:

- standard 7x6 Connect Four rules and state semantics used by this product;
- the custom Connect Four evaluator meaning and its independent conformance vectors;
- product-specific state/action/evaluator Device-JS realization;
- incumbent minimax/alpha-beta search implementation used as a benchmark control;
- benchmark positions, budgets, fairness policy, metrics, result identity, and performance/strength evidence;
- composition of public CUDA-MCGS/CUDA-JS-Tensor/CUDA-JS contracts for the Connect Four product lane.

CUDA-MCGS owns generic graph/search/evaluator-request/resource/progress/session semantics. CUDA-JS-Tensor owns generic Tensor mathematics/callable/workspace semantics. CUDA-JS owns compiler/runtime/provider/memory/operation/lifecycle mechanisms. Connect4 must not deep-import sibling internals or export product semantics upstream merely to simplify implementation.

## Benchmark invariants

- Correctness precedes timing or strength promotion.
- The incumbent and CUDA-MCGS lanes use the same accepted game/evaluator semantics where a comparison claims search-architecture isolation.
- Fixed-work and fixed-wall-clock tests are distinct.
- Search quality is reported with throughput; a faster wrong/weaker result is not a performance win.
- Host/GPU submissions, synchronization, H2D/D2H transfer count/bytes, CPU utilization, evaluator requests, useful states and wall time are first-class metrics when applicable.
- Tree-equivalent and graph/transposition-enabled CUDA-MCGS results remain separate so device residency and graph reuse are not conflated.
- Benchmark adapters may express the same workload differently only when the mode explicitly permits idiomatic optimization; the benchmark contract owns the workload and acceptance conditions.
- Results bind to exact source revisions, runtime, OS, hardware/provider identity and benchmark configuration. No result silently transfers to another profile.

## Device-closure rule

For a CUDA-MCGS benchmark lane, after search ignition no active search decision may require a CPU-produced intermediate result. Bounded asynchronous observation, external control/cancellation, completion and teardown are allowed; a host read-decide-write loop that advances search is not.

## Source-language boundary

Maintained Connect4 source is ordinary JavaScript/Node.js plus product Device-JS submitted through public CUDA contracts. Do not add Python, C/C++, CUDA C++, hand-written PTX, direct CUDA Driver/runtime FFI, or a native addon to create a local escape path.

## Legacy-source rule

The supplied 2025 browser game is source material only. Do not import its DOM, audio, graphics, browser Worker plumbing, or application layout into the benchmark product. Reuse semantics or algorithms only after identifying their owner, intent and conformance evidence.

Two evaluator generations in the legacy source already disagree. Therefore neither implementation may become the new evaluator oracle merely by being newer or faster. Freeze intended evaluator semantics and independent vectors first.

## Current phase

Benchmark bootstrap and evaluator-semantic extraction. The clean standard Connect Four domain may be implemented and tested independently. Do not implement or claim the CUDA-MCGS performance lane until the shared evaluator contract is accepted and the required public CUDA-MCGS composition is dependency-ready under current owner instruction.
