# Repository context: Connect4

Universal engineering and design guidance comes from the account-global `AGENTS.md`.

## Mission and ownership

Connect4 owns Connect Four domain semantics, benchmark/oracle meaning, exact-solver product semantics, product Device-JS composition, solver qualification contracts, and product-specific evidence. Generic CUDA/search/tensor/runtime mechanisms remain owned by their natural lower repositories.

`main` owns the **shared accepted substrate** for all Connect4 solver lines: domain rules, benchmark/fairness semantics, oracle/reference behavior, accepted cross-lane contracts, repository routing and shared product documentation. It is not itself the canonical implementation head for minimax, CUDA-BSFP, or hybrid confluence.

The incumbent implementation retained on `main` is a qualified baseline/reference and oracle comparator. Do not treat it as evidence that `main` owns the active minimax solver line.

## Canonical durable lanes

Connect4 has explicit durable lanes. Do not infer ownership from historical branch names.

- `main` — accepted shared product/domain/spec/oracle substrate and repository-level dashboard/router; not a solver head.
- `solver/minimax-alpha-beta` — minimax/negamax/alpha-beta implementation, search-specific experiments and search evidence.
- `solver/cuda-bsfp` — CUDA-BSFP implementation, BSFP-specific qualification and production-adjacent work.
- `solver/hybrid-confluence` — hybrid minimax + CUDA-BSFP exact-confluence implementation and hybrid-specific qualification/evidence.
- `research/semantic-quotient` — solver-neutral research into win-space, support/accessibility, future-behavior equivalence, quotient construction, residual classes and minimum-description representations.

Each non-main canonical lane owns its own root `STATUS.md` and `next_step.yaml`. Root `STATUS.md` and `next_step.yaml` on `main` are routing/dashboard records, not substitutes for lane-local state.

The three `solver/*` branches are first-class long-lived product heads, not temporary feature branches. They are expected to diverge in solver-specific implementation while remaining compatible with shared accepted semantics.

## Cross-lane flow

- Shared accepted domain/oracle/benchmark/contract changes originate or are deliberately promoted to `main`, then flow into solver lines.
- Solver-specific implementation and evidence stay on the owning `solver/*` branch.
- Do not merge a solver branch wholesale into `main` merely to synchronize history.
- If a solver discovers a shared fact, extract and qualify the smallest shared change, then promote that change to `main` explicitly.
- `solver/hybrid-confluence` may consume public/accepted semantics from both solver lines, but it does not become the owner of minimax or BSFP internals.
- Solver-neutral representation research routes to `research/semantic-quotient` until deliberately accepted into shared or solver-specific authority.

## Authority routing

- accepted `docs/specs/` and ADR/contract files own their stated semantics;
- `components/domain/` and `components/oracle/` on `main` own shared maintained product semantics/reference behavior within their accepted contracts;
- `components/incumbent/` on `main` is retained as qualified baseline/reference material, not an active solver-lane ownership claim;
- solver-owned maintained kernels belong on their canonical `solver/*` branch;
- `reference/legacy-source/`, conformance vectors and frozen oracles are provenance/reference evidence;
- historical `reference/research-prototypes/` paths are retained for reproducibility, but new research should not extend that catch-all tree;
- new research packets belong under a lane-owned `research/` namespace or the solver-neutral research branch and should carry source/evidence/disposition metadata;
- `docs/decisions/` records explicit promotion/rejection/ownership decisions; research reports themselves do not silently become architecture authority.

## Local constraints

Maintained source is JavaScript/Node.js plus product Device-JS through public CUDA contracts. No Python, direct CUDA FFI, C/C++/CUDA C++, hand PTX, or native-addon escape path. Benchmark correctness/fairness semantics remain Connect4-owned.

Before mutating a lane, read that lane's exact branch state and governing specifications. Treat historical branches, PR descriptions and research summaries as evidence until their relationship to the canonical lane is verified.
