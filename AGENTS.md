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

- Connect Four game/domain semantics used by this product, including the canonical standard 7x6 benchmark profile and supported adjustable-board incumbent profiles;
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
- Persistent cross-move transposition memory is normal incumbent production policy. Explicit TT reset is allowed for benchmark isolation; it is not a production simplification.
- Adjustable board dimensions remain profile data for incumbent evaluator/search machinery. The canonical 7x6 benchmark does not authorize hidden 7x6 implementation assumptions.

## Device-closure rule

For a CUDA-MCGS benchmark lane, after search ignition no active search decision may require a CPU-produced intermediate result. Bounded asynchronous observation, external control/cancellation, completion and teardown are allowed; a host read-decide-write loop that advances search is not.

## Source-language boundary

Maintained Connect4 source is ordinary JavaScript/Node.js plus product Device-JS submitted through public CUDA contracts. Do not add Python, C/C++, CUDA C++, hand-written PTX, direct CUDA Driver/runtime FFI, or a native addon to create a local escape path.

## Legacy-source rule

The supplied 2025 browser game is source material only. Do not import its DOM, audio, graphics, browser Worker plumbing, or application layout into the benchmark product. Reuse semantics or algorithms only after identifying their owner, intent and conformance evidence.

The exact benchmark-relevant legacy engine/evaluator source is retained in `reference/legacy-source/Connect4-engine-source.zip` with hashes in the manifest. This exists for reproducibility/provenance and is not maintained architecture or specification authority.

Two evaluator generations in the legacy source differ semantically. C4-0002 freezes the optimized incumbent-v1 observable evaluator behavior, including the repeated-immediate horizon promotion, without claiming that historical diagnostic labels literally describe distinct threat lines.

## Incumbent search rule

The evaluator is root-relative and asymmetric; do not rewrite the incumbent as negamax. Search owns the tactical prepass and depth preference described by C4-0003.

The TT survives ordinary moves. Score/bound reuse must be same-root-perspective and depth-sufficient; opposite-perspective or shallower entries may still contribute a best move for ordering under the production policy. Do not clear the TT between ordinary moves to make validity reasoning easier.

## Solved-strength oracle rule

C4-0005 owns the independent 7×6 solved-game strength oracle and strength metrics. The oracle is evidence about the incumbent, not part of the incumbent evaluator/search and not a benchmark competitor. Oracle-generated action labels are accepted only after exact external parent-score checkpoint parity.

Keep exact strong-score optimality distinct from game-theoretic W/D/L preservation. Calibration and selection-biased spot-check corpora must remain visibly separate; neither may be generalized into a global perfect-depth claim.

A solved-position regression can justify investigating a frozen evaluator quirk, but incumbent-v1 semantics do not change until a replacement is shown to improve solved evidence without offsetting regressions and is versioned explicitly.

## Current phase

The Node incumbent is qualified under C4-0001 through C4-0005: exact legacy evaluator/search compatibility, persistent cross-move TT benchmark evidence, and independent solved-game strength evidence. The next Connect4 work may assess and specify the CUDA-MCGS comparison composition through public dependency surfaces, but CUDA-MCGS issue #124 remains paused and no upstream mutation is authorized by this status alone.

CUDA-MCGS #124 remains paused until explicit owner instruction.
