# Repository context: Connect4

Universal engineering and design guidance comes from the account-global `AGENTS.md`.

## Mission and ownership

Connect4 owns Connect Four domain semantics, the incumbent evaluator/search baseline, exact-solver semantics, benchmark/oracle meaning, product Device-JS composition, and product-specific qualification/evidence. Generic CUDA/search/tensor/runtime mechanisms remain owned by their natural lower repositories.

## Canonical work lanes

Connect4 now has explicit durable lanes. Do not infer ownership from historical branch names.

- `main` — accepted product/domain/spec/oracle baseline and repository-level dashboard only.
- `solver/minimax-alpha-beta` — minimax/negamax/alpha-beta implementation, search-specific experiments and search evidence.
- `solver/cuda-bsfp` — CUDA-BSFP implementation, BSFP-specific qualification and production-adjacent work.
- `research/semantic-quotient` — solver-neutral research into win-space, support/accessibility, future-behavior equivalence, quotient construction, residual classes and minimum-description representations.

Each non-main canonical lane owns its own root `STATUS.md` and `next_step.yaml`. Root `STATUS.md` and `next_step.yaml` on `main` are routing/dashboard records, not substitutes for lane-local state.

## Authority routing

- accepted `docs/specs/` and ADR/contract files own their stated semantics;
- `components/` contains maintained/product implementations for the active branch;
- `reference/legacy-source/`, conformance vectors and frozen oracles are provenance/reference evidence;
- historical `reference/research-prototypes/` paths are retained for reproducibility, but new research should not extend that catch-all tree;
- new research packets belong under a lane-owned `research/` namespace or the solver-neutral research branch and should carry source/evidence/disposition metadata;
- `docs/decisions/` records explicit promotion/rejection decisions; research reports themselves do not silently become architecture authority.

## Local constraints

Maintained source is JavaScript/Node.js plus product Device-JS through public CUDA contracts. No Python, direct CUDA FFI, C/C++/CUDA C++, hand PTX, or native-addon escape path. Benchmark correctness/fairness semantics remain Connect4-owned.

Before mutating a lane, read that lane's exact branch state and governing specifications. Treat historical branches, PR descriptions and research summaries as evidence until their relationship to the canonical lane is verified.
