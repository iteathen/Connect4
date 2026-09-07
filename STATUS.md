# Connect4 Status

**Updated:** 2026-09-07
**Phase:** paused after qualified Node + solved-strength baseline; waiting on CUDA-MCGS #124

## Product role

Connect4 is the product-owned Node benchmark/validation lane for Connect Four search. It owns Connect Four domain/evaluator/benchmark meaning and consumes CUDA-MCGS/CUDA-JS-Tensor/CUDA-JS only through public surfaces.

## Protected baseline

Protected `main@0da0c4c692e648b26b0565a6bc6e75c8eb79ac8e` contains C4-0001 through C4-0005:

- dimension-parameterized Connect Four incumbent semantics with canonical 7×6 benchmark profile;
- frozen optimized evaluator semantics including parity reasoning and repeated-immediate frontier promotion;
- explicit-root-player low-allocation alpha-beta with tactical prepass;
- persistent cross-move TT with safe score/bound reuse and ordering-only inherited move reuse;
- exact legacy evaluator/search/self-play conformance;
- Node 26.7 persistent-vs-reset and wall-clock benchmark evidence;
- independent solved-game oracle evidence and the frozen depth-12 W/D/L defect.

Post-merge `verify` run **34122562926** succeeded on the C4-0005 main head.

Reference incumbent benchmark evidence remains run **34116027347**. C4-0005 qualification remains backed by `verify` **34122018213**, `strength-evidence` **34122018076**, and benchmark regression **34122018187**.

## Solved-strength disposition

C4-0005 established that incumbent v1 is strong but not globally perfect at depth 12. The frozen defect `54676552255627` chooses a solved losing move at depth 12 and first reaches the exact-optimal move at depth 19 in the investigated seam. Cross-move TT ordering was falsified as the cause. The repeated-immediate evaluator behavior remains frozen because the isolated removal experiment produced mixed gains and regressions rather than a uniformly better replacement.

## CUDA-MCGS composition assessment

Read-only assessment of CUDA-MCGS `main@893a1676a303bf28aff8f24847b0be1559ba859c` and CUDA-JS-Tensor `main@cbecc75138769419ed2c09fbfeb227f3ffe2de57` found:

- required public package entry points and external Device-JS import composition exist;
- the public CUDA-JS-Tensor evaluator connector can bind a public `TensorDeviceProgram` without deep imports;
- CUDA-MCGS evaluator semantics already define the required request/batch/lifecycle ports;
- the executable comparison lane is **not dependency-ready** because CUDA-MCGS #124 still owns and lacks the active device-resident evaluator request/batching/scatter/freshness/failure/cleanup runtime bridge.

Connect4 must not implement those generic lifecycle semantics downstream. The full assessment is recorded in `docs/research/2026-09-07-cuda-mcgs-composition-readiness.md`.

## Pause / resume seam

Connect4 is now intentionally paused while owner attention shifts to CUDA-MCGS #124.

When returning to Connect4:

1. re-read protected Connect4 and dependency state;
2. require #124's generic evaluator lifecycle to be public/protected enough for execution;
3. freeze the Connect4-owned comparison contract;
4. implement three distinct evidence lanes: incumbent Node, tree-equivalent CUDA-MCGS, graph/transposition-enabled CUDA-MCGS;
5. preserve C4-0002 evaluator semantics and apply C4-0005 solved-strength evidence to comparison outputs.

Do not reopen C4-0001 through C4-0005 merely because #124 changes upstream implementation details.

## Repository governance

Governance alignment remains separately tracked by issue #3. Product pause/completeness does not imply repository-policy alignment.

## Non-claims

- no CUDA-MCGS performance advantage is demonstrated;
- no GPU-resident Connect Four comparison lane exists yet;
- no downstream workaround for missing #124 semantics is authorized;
- no Python or cross-language comparison is part of the first benchmark gate.
