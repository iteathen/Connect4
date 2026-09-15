# Repository context: Connect4

Universal engineering and design guidance comes from the account-global `AGENTS.md`. This file supplies repository-specific ownership, routing, constraints, and authority. Research-space maintenance under `research/` is further specialized by `research/AGENTS.md`.

## Mission and ownership

Connect4 owns Connect Four domain semantics, benchmark/oracle meaning, exact-solver product semantics, product Device-JS composition, solver qualification contracts, and product-specific evidence. Generic CUDA/search/tensor/runtime mechanisms remain owned by their natural lower repositories.

`main` owns the **shared accepted substrate** for all Connect4 solver lines: domain rules, benchmark/fairness semantics, oracle/reference behavior, accepted cross-lane contracts, repository routing and shared product documentation. It is not itself the canonical implementation head for minimax, CUDA-BSFP, or hybrid confluence.

The incumbent implementation retained on `main` is a qualified baseline/reference and oracle comparator. Do not treat it as evidence that `main` owns the active minimax solver line.

## Canonical durable lanes

Connect4 has explicit durable lanes. Do not infer ownership or authority from historical branch names.

- `main` — accepted shared product/domain/spec/oracle substrate and repository-level dashboard/router; not a solver head.
- `solver/minimax-alpha-beta` — minimax/negamax/alpha-beta implementation, search-specific experiments and search evidence.
- `solver/cuda-bsfp` — CUDA-BSFP implementation, BSFP-specific qualification and production-adjacent work.
- `solver/hybrid-confluence` — hybrid minimax + CUDA-BSFP exact-confluence implementation and hybrid-specific qualification/evidence.
- `research/unified-knowledge` — canonical solver-neutral **normalized research knowledge plane**. Shared research claims, confidence/status, provenance relationships, open questions, claim indexes and solver-consumption mappings are maintained here.
- `research/semantic-quotient` and other focused research branches — exploratory/source lanes that may generate evidence, derivations, counterexamples or prototypes. They do not independently own cross-lineage research truth once material is normalized into `research/unified-knowledge`.

Each solver branch is a first-class long-lived product head and may diverge in implementation while remaining compatible with accepted shared semantics. Exploratory research branches may likewise remain useful workspaces, but branch existence or age does not confer research authority.

## Cross-lane flow

- Shared accepted domain/oracle/benchmark/contract changes originate or are deliberately promoted to `main`, then flow into solver lines.
- Solver-specific implementation and evidence stay on the owning `solver/*` branch.
- Do not merge a solver branch wholesale into `main` merely to synchronize history.
- If a solver or exploratory research branch discovers a potentially shared research fact, preserve its exact evidence/provenance and normalize the semantic claim into `research/unified-knowledge` before treating it as cross-family research authority.
- If normalized research becomes an accepted product/domain contract, promote the smallest accepted contract deliberately to `main`; research normalization itself does not silently override accepted specs.
- `solver/hybrid-confluence` may consume public/accepted semantics from both solver lines, but it does not become the owner of minimax or BSFP internals.
- `research/unified-knowledge` owns the shared research graph, not solver implementations. A solver may consume a claim without changing that claim's epistemic status.

## Research knowledge-plane routing

When working on `research/unified-knowledge` or mutating any path under `research/`:

1. obey `research/AGENTS.md`;
2. start from `research/README.md` and the canonical claim graph rather than historical branch dumps;
3. treat `research/canonical/CLAIM_INDEX.json` as the machine-readable root and read every registry shard it lists when assigning or interpreting claim IDs;
4. preserve stable claim IDs, explicit epistemic classification, guards/scope, sources, relations, solver-consumption meaning, open-question/hypothesis disposition, and provenance;
5. keep affected indexes, human ledgers, maps, evidence/history state and `research/untriaged/SOURCE_QUEUE.md` synchronized with claim changes;
6. preserve negative knowledge and historical source material until semantic retirement gates are satisfied.

The previous branch-first research ownership model is retired for shared truth. Historical and focused branches are evidence/source locations; the normalized graph is the shared research authority.

## Authority routing

- explicit current owner instructions govern the task;
- account-global `AGENTS.md` supplies universal engineering/process doctrine;
- this file supplies repository ownership/routing/constraints;
- `research/AGENTS.md` supplies research-space maintenance rules for `research/**`;
- accepted `docs/specs/` and ADR/contract files own their stated product/domain semantics;
- within research, `research/canonical/CLAIM_INDEX.json` plus every listed registry shard owns claim identity and epistemic status;
- `research/canonical/*.md` are human-facing normalized synthesis and must agree with machine claim records where they overlap;
- `research/maps/` connects claims and consumers but does not independently promote status;
- `research/open-questions/`, `hypotheses/`, `evidence/`, `history/`, `untriaged/` and `provenance/` retain their scoped roles defined by `research/README.md` and `research/AGENTS.md`;
- `components/domain/` and `components/oracle/` on `main` own shared maintained product semantics/reference behavior within accepted contracts;
- `components/incumbent/` on `main` is retained as qualified baseline/reference material, not an active solver-lane ownership claim;
- solver-owned maintained kernels belong on their canonical `solver/*` branch;
- `reference/legacy-source/`, conformance vectors, frozen oracles and research provenance are reference/evidence, not automatic implementation or theorem authority;
- `docs/decisions/` records explicit promotion/rejection/ownership decisions; research reports themselves do not silently become architecture authority.

## Research integrity boundary

A research-space mutation is not complete merely because a note was added or a registry file parses. The affected normalized graph must remain coherent.

At minimum, preserve these distinctions:

```text
exact geometry != game semantics
static invariant != game value
same number != same object
finite/oracle agreement != proof
exact certificate != advisory ordering/evaluation
mechanism != implementation form/workload/stage order/synergy/adoption
provenance source != current authority
```

Do not create duplicate claim IDs for alternate wording or solver lineage. Do not promote hypotheses or empirical results because they perform well. Do not remove source branches or queue entries merely because bytes are archived; retirement requires semantic claims, counterexamples, evidence, open questions and attribution to have stable dispositions.

## Local constraints

Maintained source is JavaScript/Node.js plus product Device-JS through public CUDA contracts. No Python, direct CUDA FFI, C/C++/CUDA C++, hand PTX, or native-addon escape path in maintained product code. Historical/provenance material may contain other languages and remains evidence rather than maintained implementation. Benchmark correctness/fairness semantics remain Connect4-owned.

Before mutating a lane, re-fetch that lane's exact live state and preserve newer valid work. Read governing specifications/contracts and the applicable agent routing before mutation. Treat historical branches, PR descriptions, issue text, handoffs, research summaries, solved labels and prior-agent conclusions as evidence until their relationship to current canonical authority is verified.
