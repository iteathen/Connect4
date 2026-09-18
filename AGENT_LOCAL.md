# Repository context: Connect4

Universal engineering and design guidance comes from the account-global `AGENTS.md`.

## Single research owner

All durable Connect4 research is owned by `research/semantic-quotient`, regardless of which solver exposed it. This includes derivations, hypotheses, research experiments/results, falsifiers, negative results, research evidence, open questions, synthesis, maps, and provenance.

This branch owns implementation, implementation contracts/status, qualification/reproduction machinery, and implementation-local qualification evidence—not a separate research corpus. Solver-local or historical paths named `research/` or `docs/research/` are source/provenance or implementation-experiment material unless and until their durable research meaning is integrated into canonical research. Do not add new durable research here.

See `docs/decisions/2026-09-17-single-research-owner.md`.

## Mission and ownership

Connect4 owns Connect Four domain semantics, benchmark/oracle meaning, exact-solver product semantics, product Device-JS composition, solver qualification contracts, and product-specific evidence. Generic CUDA/search/tensor/runtime mechanisms remain owned by their natural lower repositories.

`main` owns the **shared accepted substrate** for all Connect4 solver lines: domain rules, benchmark/fairness semantics, oracle/reference behavior, accepted cross-lane contracts, repository routing and shared product documentation. It is not itself a solver implementation head.

The incumbent implementation retained on `main` is a qualified baseline/reference and oracle comparator. Minimax is a historical solver lineage, not an active implementation owner.

## Closed durable lane set

The active durable solver topology is:

- `main` — accepted shared product/domain/spec/oracle substrate and repository router; not a solver head.
- `research/semantic-quotient` — single canonical owner of all research and historical solver knowledge.
- `solver/isometric` — active IsoMax structural/frontier exact solver.
- `solver/cuda-bsfp` — active backward symbolic fixed-point solver.
- `solver/sut` — future exact composition of IsoMax + CUDA-BSFP.

Minimax/Negamax/alpha-beta and Hybrid Confluence are historical lineages only. Do not recreate them as durable implementation owners.

**Agents must not invent another durable lane or alter this topology without explicit owner instruction.** Current authority is `docs/decisions/2026-09-18-three-active-solver-topology.md` once the shared topology change is present on this branch.
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
- All research is normalized and preserved on `research/semantic-quotient`.
- Solver-specific implementation and evidence stay on the owning solver head.
- Do not merge a solver branch wholesale into `main` merely to synchronize history.
- If a solver discovers a shared fact, extract and qualify the smallest shared change, then route it to `main` or canonical research according to ownership.
- SUT may compose IsoMax and CUDA-BSFP without becoming owner of either parent's private internals.

## Authority routing

- accepted `docs/specs/` and ADR/contract files own their stated semantics;
- `components/domain/` and `components/oracle/` on `main` own shared maintained product semantics/reference behavior within their accepted contracts;
- `components/incumbent/` on `main` is retained as qualified baseline/reference material, not an active solver-lane ownership claim;
- solver-owned maintained kernels belong on their durable solver-family branch;
- `reference/legacy-source/`, conformance vectors and frozen oracles are provenance/reference evidence;
- historical `reference/research-prototypes/` paths are retained for reproducibility, but new research should not extend that catch-all tree;
- all durable research belongs on `research/semantic-quotient`; solver branches own implementation and implementation qualification only;
- `docs/decisions/` records explicit promotion/rejection/ownership decisions; research reports themselves do not silently become architecture authority.

## Local constraints

Maintained source is JavaScript/Node.js plus product Device-JS through public CUDA contracts. No Python, direct CUDA FFI, C/C++/CUDA C++, hand PTX, or native-addon escape path. Benchmark correctness/fairness semantics remain Connect4-owned.

Before mutating a lane, read that lane's exact branch state and governing specifications. Treat historical branches, PR descriptions and research summaries as evidence until their relationship to the durable owner is verified.
