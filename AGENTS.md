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

- standard 7x6 benchmark rules/state plus adjustable rectangular Connect Four product semantics where explicitly profiled;
- the custom Connect Four evaluator meaning and its independent/archive-derived conformance evidence;
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

## Incumbent Node/V8 hot-path rule

The incumbent CPU control is intentionally specialized and low-level. During active search/evaluation:

- avoid high-level collection operations and transformation pipelines;
- avoid board/object cloning, apply/undo game-state mutation, JSON/string representations, and allocation of per-node objects/arrays/closures;
- carry position facts in the representation in which search/evaluation consumes them;
- generated/static geometry tables are allowed outside the hot path;
- a preallocated transposition table is an explicitly owned mutable performance cache and is not game-state mutation;
- persistent TT lifetime is intentional because the next played position is a descendant of prior search work; do not delete/reset it as a simplification without explicit evidence/authority.

An optimization may change implementation mechanics without changing an accepted evaluator/search compatibility profile only after exact regression evidence proves semantic parity.

## Adjustable-board rule

Do not silently bake 7x6 arithmetic into evaluator semantics. The headline benchmark profile is standard 7x6, but legacy evaluator/search ideas were written against adjustable `columns x rows` boards. Any specialized representation limit must be explicit as an implementation profile and must not be misreported as the product semantic boundary.

## Device-closure rule

For a CUDA-MCGS benchmark lane, after search ignition no active search decision may require a CPU-produced intermediate result. Bounded asynchronous observation, external control/cancellation, completion and teardown are allowed; a host read-decide-write loop that advances search is not.

## Source-language boundary

Maintained Connect4 source is ordinary JavaScript/Node.js plus product Device-JS submitted through public CUDA contracts. Do not add Python, C/C++, CUDA C++, hand-written PTX, direct CUDA Driver/runtime FFI, or a native addon to create a local escape path.

## Legacy-source rule

The supplied 2025 browser game is source material only. Do not import its DOM, audio, graphics, browser Worker plumbing, or application layout into the benchmark product. Reuse semantics or algorithms only after identifying their owner, intent and conformance evidence.

The older and optimized evaluator generations differ. That fact is not by itself proof that the optimized behavior is a gameplay bug. The accepted C4-0002 compatibility profile freezes the actual optimized score behavior; future semantic changes require a new profile and strength/correctness evidence.

## Current phase

Incumbent Node/V8 rewrite qualification. C4-0002 freezes the legacy-current evaluator and C4-0003 defines the optimized CPU search lane. Do not implement or claim the CUDA-MCGS performance lane until the required public CUDA-MCGS composition is dependency-ready and explicitly resumed by the project owner.
