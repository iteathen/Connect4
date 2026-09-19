# Repository context: Connect4

Universal engineering and design guidance comes from the account-global `AGENTS.md`.

## Crash-safe runner checkpoint discipline

Runner and long-form execution tasks must assume the chat/tool transport can disconnect at any time. Durable progress is part of normal execution, not cleanup at the end.

Required behavior:

- **Never accumulate more than one meaningful unsaved research or implementation step.** A new exact result, falsifier, negative result, algorithmic observation, changed hypothesis, selected control, new wall, or completed qualification unit must be written to the correct durable owner promptly.
- **Checkpoint before any long, bounded, expensive, or multi-stage run.** Persist the live branch/head, target, harness/source needed to reproduce the run, inputs/configuration, and the exact question/falsifier being tested before launching it.
- **Make expensive runs resumable by default.** Persist monotone cache/progress state incrementally when recomputation would be material. Do not rely on `/tmp`, process memory, chat context, or an uncommitted generated artifact as the only copy.
- **Checkpoint immediately after a meaningful phase completes**, even when a larger campaign is still running. Do not wait for the whole campaign, full boundary, full benchmark matrix, or final interpretation.
- **Persist negative evidence too.** Timeouts, rejected approaches, mismatches, unexpected bottlenecks, and localized walls are durable research/engineering results when they change the next action.
- **Before switching algorithms or hypotheses, save the evidence that justified the switch.** The prior path must remain reconstructable after a disconnect.
- **Before a run likely to cross a connection boundary, persist the executable harness or exact reconstruction recipe first.** Transient prototypes may remain transient only when their complete semantics and recovery seam are already durable.
- **On reconnect, re-fetch the live branch and latest durable checkpoint before doing new work.** Preserve any newer valid work. Do not reconstruct from an older chat checkpoint when the repository has advanced.
- **If a write or publish call disconnects, treat mutation as uncertain.** Re-fetch the live ref/file before retrying; never assume the write failed or succeeded.
- **Chat updates are not checkpoints.** The sole durable copy of a result must not exist only in conversation text.
- Route the checkpoint to the correct owner: canonical research results to `research/semantic-quotient`; solver implementation/contracts/qualification to their durable solver branch; shared accepted product changes through the repository's normal authority path.

The default bias is toward many small durable checkpoints. Consolidation can happen later; lost research cannot.

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

**Agents must not invent another durable lane or alter this topology without explicit owner instruction.** Current authority is `docs/decisions/2026-09-18-three-active-solver-topology.md`.
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
