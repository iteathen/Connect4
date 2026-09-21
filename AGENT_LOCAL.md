# Repository context: Connect4

Universal engineering and design guidance comes from the account-global `AGENTS.md`.

## Restart-safe active coordination

Before substantive work, inspect `.agent/coordination.json` when it exists. If it declares an active campaign overlapping the requested work, read `.agent/COORDINATION.md` and refresh the declared live communication channel before researching, mutating, reviewing, or qualifying that campaign.

A durable `role_id` survives agent/session restart; a prior session handle does not. After the owner/director reassigns a role to a restarted agent, recover the role's latest state from the live channel, announce the rejoin using the campaign transport profile, and resume channel monitoring. Prefer a runtime-supported conditional/scheduled watch when available; otherwise refresh the channel before and after each substantive work unit. Do not claim monitoring while disconnected.

The coordination registry is discovery/recovery metadata, not solver/specification authority. Live task/claim state belongs to the declared communication channel, and normal repository authority continues to govern implementation and qualification.

## Private administrative boundary

Financial, budget, funding, revenue, treasury, trading, account, payment, tax, and other sensitive administrative records do **not** belong in this public repository, public issues, public pull requests, public branches, workflow logs, or public evidence.

Keep only the minimum non-sensitive routing fact needed for engineering coordination. Durable financial/administrative state belongs on the owner's private administrative control plane. Never place credentials, wallet addresses tied to private activity, keys, seed phrases, bank/payment details, tax identifiers, or private financial ledgers in this repository.

## Mission and ownership

Connect4 owns Connect Four domain semantics, benchmark/oracle meaning, exact-solver product semantics, product Device-JS composition, solver qualification contracts, and product-specific evidence. Generic CUDA/search/tensor/runtime mechanisms remain owned by their natural lower repositories.

`main` owns the **shared accepted substrate** for all Connect4 solver lines: domain rules, benchmark/fairness semantics, oracle/reference behavior, accepted cross-lane contracts, repository routing and shared product documentation. It is not itself a solver implementation head.

The incumbent implementation retained on `main` is a qualified baseline/reference and oracle comparator. Do not treat it as an active Minimax solver-family lane.

## Closed durable lane set

The current durable branch topology is owner-authorized and closed:

- `main` — accepted shared product/domain/spec/oracle substrate and repository router; not a solver head.
- `research/semantic-quotient` — single canonical owner of all Connect4 research and historical solver knowledge.
- `solver/isometric` — active IsoMax structural/frontier exact solver.
- `solver/cuda-bsfp` — active backward symbolic fixed-point solver.
- `solver/sut` — retained future exact composition lane for IsoMax + CUDA-BSFP.

`solver/minimax-alpha-beta` and `solver/hybrid-confluence` are historical lineages only and must not receive new implementation work.

**Agents must not invent another durable lane, revive a historical solver branch, or alter this topology without explicit owner instruction.** See `docs/decisions/2026-09-18-three-active-solver-topology.md`.
## Temporary branch rule

Temporary `work/*`, `experiment/*`, `feature/*`, handoff, staging and evidence branches are subordinate to a named durable owner. Do not create new durable focused `research/*` branches.

Before creating one, identify:

- owning durable lane;
- bounded question/change;
- acceptance or falsifier;
- retirement condition.

Before retiring one, preserve useful implementation in its solver owner and preserve **all durable research output**—including negative results, hypotheses, experiment results, research evidence, and unresolved questions—on `research/semantic-quotient` or in its provenance archive. A temporary branch never becomes authority merely because an agent continued working on it.

## Cross-lane flow

- Shared accepted domain/oracle/benchmark/contract changes originate or are deliberately promoted to `main`, then flow into solver lines.
- **All research**, including solver-specific research observations, is normalized and preserved on `research/semantic-quotient`.
- Solver-specific implementation, contracts, qualification machinery, and implementation qualification evidence stay on the owning solver head.
- Do not merge a solver branch wholesale into `main` merely to synchronize history.
- If a solver discovers a shared fact, extract and qualify the smallest shared change, then route it to `main` or canonical research according to ownership.
- SUT may compose IsoMax and CUDA-BSFP capabilities without becoming owner of either parent's private internals.

## Authority routing

- accepted `docs/specs/` and ADR/contract files own their stated semantics;
- `components/domain/` and `components/oracle/` on `main` own shared maintained product semantics/reference behavior within their accepted contracts;
- `components/incumbent/` on `main` is retained as qualified baseline/reference material, not an active solver-lane ownership claim;
- solver-owned maintained kernels belong on their durable solver-family branch;
- `reference/legacy-source/`, conformance vectors and frozen oracles are provenance/reference evidence;
- historical `reference/research-prototypes/` paths are retained for reproducibility, but new research should not extend that catch-all tree;
- all durable research belongs on `research/semantic-quotient`; solver branches are implementation owners only, though bounded temporary experiments may carry in-progress research until it is integrated back into canonical research;
- `docs/decisions/` records explicit promotion/rejection/ownership decisions; research reports themselves do not silently become architecture authority.

## Local constraints

Maintained source is JavaScript/Node.js plus product Device-JS through public CUDA contracts. No Python, direct CUDA FFI, C/C++/CUDA C++, hand PTX, or native-addon escape path. Benchmark correctness/fairness semantics remain Connect4-owned.

Before mutating a lane, read that lane's exact branch state and governing specifications. Treat historical branches, PR descriptions and research summaries as evidence until their relationship to the durable owner is verified.
