# Repository context: Connect4

Universal engineering and design guidance comes from the account-global `AGENTS.md`.

## Mission and ownership

Connect4 is an independent Node benchmark/validation product and exact-solver laboratory for Connect Four. It owns Connect Four domain semantics, the custom evaluator and conformance vectors, solved-game oracle evidence, benchmark positions/budgets/fairness/metrics/evidence, exact-solver semantics/evidence, and product composition of public CUDA libraries.

The repository contains deliberately separate solver lanes:

- `components/incumbent/` owns the incumbent minimax/alpha-beta/search implementation and its search-specific semantics.
- `components/bsfp/` owns Connect4 CUDA-BSFP consumer semantics: backward symbolic fixed-point proof-state meaning, Connect4-specific derivation/terminal/proof rules, and composition of generic GPU-algorithm capabilities.
- `research/semantic-quotient/` owns the current quotient-native forward-solver research: exact future-relevant Connect4 quotient state, quotient transitions/tactical closure, exact W/D/L Negamax semantics, and Connect4-specific evidence for that lane.

Do not make BSFP a specialization of the incumbent or quotient-forward search components, and do not import minimax/Negamax/alpha-beta/search lifecycle semantics into BSFP merely because the lanes solve the same game.

CUDA-Algorithms owns reusable provider-neutral GPU parallel-algorithm semantics. CUDA-MCGS owns generic search/evaluator/resource/session semantics. CUDA-JS-Tensor owns generic Tensor semantics. CUDA-JS owns runtime/compiler/memory/provider/lifecycle mechanisms.

Consumer-neutral worker/session scheduling, CPU topology, affinity, runtime thread placement, and generic shared search-resource mechanisms belong in their natural lower-layer owner when promoted beyond Connect4 research. A Connect4 research prototype may investigate them, but first-consumer implementation does not transfer semantic ownership.

## Local routing

- `STATUS.md` and `next_step.yaml` — current product/workstream state; keep them current-state/router artifacts rather than historical ledgers.
- C4-0001 through C4-0005 — protected baseline domain/incumbent/benchmark/oracle authority within their stated scopes.
- `docs/specs/C4-0006-control-parity-and-winspace-v1.md` — CPC + WSL-625 structural/domain mathematics for the BSFP lane.
- `docs/specs/C4-0007-nested-dependency-closure-v1.md` — NDC dependency/certificate/fixed-point proof semantics.
- `docs/specs/C4-0008-bsfp-exact-solver-v1.md` — exact BSFP W/D/L solver semantics, terminal axioms and result meaning.
- `docs/specs/C4-0009-bsfp-cuda-execution-profile-v1.md` — CUDA-BSFP consumer projection, CUDA-Algorithms/CUDA-JS seam, GPU/Node boundary and physical qualification requirements.
- `docs/specs/C4-0010-quotient-native-negamax-v1.md` — quotient-native exact forward solver: quotient identity/transition/tactical semantics, exact W/D/L Negamax, proof-state separation, shared semantic identity, worker/planner ownership and dynamic search profile.
- `docs/specs/profiles/C4-0009-P1-4x3-cuda-bsfp-v0.md` — exact first 4x3 CUDA-BSFP qualification profile.
- `docs/specs/profiles/C4-0009-Q1-benchmark-qualification-v1.md` — benchmark qualifier, crash-safe evidence, timeout/VRAM safety and repository publication authority.
- `docs/evidence/cuda-bsfp/qualification/` — immutable Q1-generated report bundles; never rewrite a prior run into a different outcome.
- `docs/research/2026-09-09-*` plus associated evidence/prototypes — preserved research/provenance; evidence is not stronger authority than accepted specs.
- `research/semantic-quotient/state-identity-unification/` — quotient-native research implementation and evidence; research files do not redefine C4-0010 semantics.
- `components/bsfp/` — BSFP consumer implementation and local proof semantics on BSFP work branches.
- `tools/cuda-bsfp-qualifier.mjs` and `tools/cuda-bsfp-qualifier/` — Connect4-owned outer qualification/reporting machinery; solver children must not own repository credentials/publication.
- `reference/legacy-source/` — provenance/source evidence only, not specification authority.

On a BSFP work branch, read **C4-0006 → C4-0007 → C4-0008 → C4-0009**, then the selected execution/qualification profile before implementing or changing CUDA-BSFP.

On the quotient-native Negamax research branch, read **C4-0001 → C4-0010 → STATUS.md → next_step.yaml** before changing solver semantics or ownership. Read experiment result notes only as needed for the specific representation/performance question.

## Quotient-native local boundaries

For the quotient-native lane, keep these local ownership facts explicit:

- quotient semantic state owns support + exact residual-requirement meaning and legal/tactical transitions;
- proof state is separate from semantic state and evolves through the proof-store contract;
- the Negamax engine owns recursive search policy, not quotient identity, proof-resource lifecycle or hardware discovery;
- canonical shared identity is semantic content, never worker-local qID/classID or a hash alone;
- search workers own synchronous recursive execution and local fast caches/state;
- the maintenance worker is an execution host for planner/resource/dedup/reclamation services, not the semantic owner of every hosted concern;
- split work at dependency-satisfied alpha-beta edges, not arbitrary depth/frontier cuts merely because they are easy to distribute;
- do not put per-node maintenance/dedup RPC in recursive search.

Execution locality is not semantic ownership. A process/thread/worker may host several coherent child LEGOs without becoming their semantic owner.

## Local application of the design hierarchy

For Connect4 changes, apply the global hierarchy in order: **LEGO boundaries first, then SOLID inside each valid LEGO, then CUPID, then KISS**. Do not use a lower-level principle to justify crossing or blurring a higher-level ownership or semantic boundary.

Prefer logical edges where semantic meaning, authority, lifecycle, resource/failure behavior, or independently replaceable context changes. File size, queue shape, worker placement, search depth, and implementation convenience are not sufficient reasons for a boundary by themselves.

Reserve **gate** language for an actually blocking condition whose failure must stop or reject the affected path. Ordinary benchmarks, comparisons, checkpoints, experiments, confidence-building tests, and optimization decisions are not gates. Do not add process ceremony merely to make work look more rigorous.

## Pre-alpha evolution

The quotient-native lane is pre-alpha and currently has no released external compatibility contract.

Do not add compatibility aliases, deprecated names, redirect modules, tombstones, migration wrappers, duplicate old/new APIs, or dead historical implementations merely to preserve code that has not been released. Rename, replace or delete directly when the current design changes, and update all current consumers/spec/current-state files coherently.

Preserve research findings and evidence that still have informational value; do not preserve obsolete executable architecture as compatibility baggage.

Compatibility work becomes justified only when there is a real beneficiary such as an explicitly supported beta/released API, persisted state, external consumer, recovery requirement, or demonstrated migration cost.

## Local constraints

Maintained source is JavaScript/Node.js plus product Device-JS through public CUDA contracts. No Python, direct CUDA FFI, C/C++/CUDA C++, hand PTX, or native-addon escape path. Benchmark correctness/fairness semantics remain Connect4-owned.

BSFP may consume CUDA-Algorithms only through its public consumer-neutral contracts; generic workset/closure/sequence mechanics must not be copied downstream into Connect4. Conversely, CPC/WSL-625/NDC/WDL semantics, exact BSFP equality/dominance, existential/universal proof reduction and semantic rank completion must not move into CUDA-Algorithms.

Generic ranked activation is not by itself BSFP W/D/L evaluation. A lower-rank BSFP target is authoritative only after the complete required higher-rank contribution set has been accounted for and consumer-owned semantic reduction has finalized it.

Q1 qualification is fail-closed for GPU memory: no GPU case may launch without both a profile-owned finite upper memory bound and current free-VRAM telemetry. Timeouts, memory-safety refusals/aborts, crashes and unsupported geometries must remain visible in evidence. Official qualifier runs publish append-only evidence through a dedicated branch/PR; never push generated reports directly to protected `main` and never pass repository tokens into solver children.
