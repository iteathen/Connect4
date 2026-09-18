# Repository context: Connect4

Universal engineering and design guidance comes from the account-global `AGENTS.md`.

## Mission and ownership

Connect4 owns Connect Four domain semantics, benchmark/oracle meaning, exact-solver product semantics, product Device-JS composition, solver qualification contracts, and product-specific evidence. Generic CUDA/search/tensor/runtime mechanisms remain owned by their natural lower repositories.

`main` owns the **shared accepted substrate** for all Connect4 solver lines: domain rules, benchmark/fairness semantics, oracle/reference behavior, accepted cross-lane contracts, repository routing and shared product documentation. It is not itself a solver implementation head.

The incumbent implementation retained on `main` is a qualified baseline/reference and oracle comparator. Do not treat it as evidence that `main` owns the active minimax solver line.

## Closed durable lane set

The durable branch topology is owner-authorized and closed:

- `main` — accepted shared product/domain/spec/oracle substrate and repository router; not a solver head.
- `research/semantic-quotient` — canonical solver-neutral research and knowledge lane.
- `solver/minimax-alpha-beta` — minimax/negamax/alpha-beta implementation and search-specific evidence.
- `solver/cuda-bsfp` — CUDA-BSFP implementation, qualification and production-adjacent work.
- `solver/hybrid-confluence` — hybrid exact-confluence implementation and qualification.
- `solver/isometric` — Isometric structural/frontier solver implementation.
- `solver/sut` — SUT (`S ∪ T`) solver lineage.

The root-level `solver/isometric` and `solver/sut` names are intentional solver-family names.

**Agents must not invent another durable lane, promote a temporary branch into a continuity owner, or alter this topology without explicit owner instruction.** See `docs/decisions/2026-09-17-solver-namespace-normalization.md`.

Each non-main durable lane owns its own current-state routing. Where a solver lane lacks mature implementation state, its branch-local status must say so explicitly rather than inheriting `main`'s dashboard as if it were solver state.

## Temporary branch rule

Temporary `work/*`, `experiment/*`, noncanonical `research/*`, `feature/*`, handoff, staging and evidence branches are subordinate to a named durable owner.

Before creating one, identify:

- owning durable lane;
- bounded question/change;
- acceptance or falsifier;
- retirement condition.

Before retiring one, preserve useful code, evidence, negative results and research notes in the owner lane or an immutable archive. A temporary branch never becomes authority merely because an agent continued working on it.

## Cross-lane flow

- Shared accepted domain/oracle/benchmark/contract changes originate or are deliberately promoted to `main`, then flow into solver lines.
- Shared solver-neutral research is normalized on `research/semantic-quotient`.
- Solver-specific implementation and evidence stay on the owning solver head.
- Do not merge a solver branch wholesale into `main` merely to synchronize history.
- If a solver discovers a shared fact, extract and qualify the smallest shared change, then route it to `main` or canonical research according to ownership.
- Hybrid Confluence and SUT may compose other solver capabilities without becoming owners of those solvers' private internals.

## Authority routing

- accepted `docs/specs/` and ADR/contract files own their stated semantics;
- `components/domain/` and `components/oracle/` on `main` own shared maintained product semantics/reference behavior within their accepted contracts;
- `components/incumbent/` on `main` is retained as qualified baseline/reference material, not an active solver-lane ownership claim;
- solver-owned maintained kernels belong on their durable solver-family branch;
- `reference/legacy-source/`, conformance vectors and frozen oracles are provenance/reference evidence;
- historical `reference/research-prototypes/` paths are retained for reproducibility, but new research should not extend that catch-all tree;
- canonical shared research belongs on `research/semantic-quotient`; solver-specific implementation experiments belong to the owning solver lane;
- `docs/decisions/` records explicit promotion/rejection/ownership decisions; research reports themselves do not silently become architecture authority.

## Local constraints

Maintained source is JavaScript/Node.js plus product Device-JS through public CUDA contracts. No Python, direct CUDA FFI, C/C++/CUDA C++, hand PTX, or native-addon escape path. Benchmark correctness/fairness semantics remain Connect4-owned.

Before mutating a lane, read that lane's exact branch state and governing specifications. Treat historical branches, PR descriptions and research summaries as evidence until their relationship to the durable owner is verified.
