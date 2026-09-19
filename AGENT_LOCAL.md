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

This branch owns the research corpus itself. Solver-local or historical paths named `research/` or `docs/research/` are source/provenance or implementation-experiment material unless and until their durable research meaning is integrated into canonical research. Do not add new durable research to those noncanonical paths; integrate it into canonical research on this branch.

See `docs/decisions/2026-09-17-single-research-owner.md`.

## Current logic authority — IsoGraph

The qualified historical/current logic authority remains `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_1.md` with native root `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_1.isg` and immutable manifest `research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_1.json` until a successor is explicitly qualified/promoted. Authority 1.0 remains immutable historical qualification evidence.

For **active game-theory research**, the single current successor interpretation is `research/isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.*`. It cleanly integrates q, ordinary value dependency, proof/certificate boundaries, RBA, QU, and the NEI-0.4 successor model. Do not compose the old applied-NEI overlay or RBA overlay stack with 1.1 as a parallel active semantics; those files are historical/provenance/evidence inputs to the successor.

This is representation authority, not a branch-ownership transfer. `research/semantic-quotient` remains the sole durable research owner; solver branches remain implementation owners.

The pre-IsoGraph Markdown/JSON/spec/claim files are retained as provenance and readability/compatibility bridges. Their qualified frozen content is represented inside authority 1.1, with authority 1.0 preserved as historical evidence of its earlier boundary. A newer direct edit to a legacy view does not become logical authority unless incorporated into a newly qualified IsoGraph authority revision.

Unknown and unresolved research remains authoritative as explicit unresolved structure. Do not silently convert `INCOMPLETE_SCOPE`, hypotheses, missing laws, candidate rules, or open questions into settled claims.

### Observation-first discrepancy discipline

For any material discrepancy involving identity, count, scope, relation membership, provenance, uncertainty, aggregation, or evidence meaning:

1. preserve the raw observations before repair;
2. determine whether both observations denote the same semantic quantity under the same scope/layer/authority;
3. keep `qualification_disposition` separate from `discovery_disposition`;
4. a proven decoder/scorer/implementation error may close qualification while leaving a structural lead open;
5. do not promote an open lead into authority without exact supporting evidence;
6. do not weaken dependency propagation merely to localize a newly exposed distinction.

Current 1.1 post-hoc dispositions are recorded in:
- `research/isograph/qualification/CORE_0_18_SANITY_AUDIT_1_1.md`;
- `research/isograph/qualification/DISCREPANCY_DISCOVERY_DISPOSITIONS_1_1.json`.

### Active identity/game-theory successor

The old applied-NEI overlay is superseded for active interpretation.

Use:

- `research/isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.md`;
- `research/isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.json`;
- `research/isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.isg`.

The successor follows the NEI 0.4 candidate architecture pinned to `iteathen/isograph@485a16cd44299b3e7ec03768791d261a38bc08c8`:

- SAME/DISTINCT are derived outputs, never profile answer tags;
- ordinary facts, q-congruence evidence, proof context and QU are represented first;
- Bayes/log-Bayes identity evidence is permitted only with a real likelihood model;
- finite controls/test counts are not converted into invented Bayes factors;
- QU is required whenever unresolved identity-relevant structure can change identity or identity-evidence interpretation;
- missing qualification/authority is incomplete, not semantic NEI UNKNOWN.

The old files under `research/isograph/identity/CONNECT4_NEI_*` remain historical/provenance evidence and MUST NOT be layered into new game-theory reasoning as a second identity authority.

For hot-loop performance research, use only `research/isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_0_3_CANDIDATE.*` as the current integrated interpretation. The older hot-loop 0.1/0.2 graph/NEI/qualification files are historical evidence.


## Current durable topology authority

This branch is the **single canonical owner of all Connect4 research** under the owner-authorized closed topology in `docs/decisions/2026-09-17-solver-namespace-normalization.md`.

The durable set is closed. Do not create or promote another continuity branch without explicit owner instruction. Any `work/*`, `experiment/*`, noncanonical `research/*`, `feature/*`, handoff, staging or evidence ref created from this lane must name this or another durable owner, preserve useful results back to that owner or an immutable archive, and retire when its bounded purpose ends.

## Mission and ownership

Connect4 is an independent Node benchmark/validation product and exact-solver laboratory for Connect Four. It owns Connect Four domain semantics, the custom evaluator and conformance vectors, solved-game oracle evidence, benchmark positions/budgets/fairness/metrics/evidence, exact-solver semantics/evidence, and product composition of public CUDA libraries.

The repository contains deliberately separate solver lanes built on shared Connect4 structural mathematics:

- `components/incumbent/` owns the incumbent minimax/alpha-beta/search implementation and its accepted incumbent search/evaluator semantics.
- `components/bsfp/` owns the backward symbolic fixed-point solver implementation and Connect4-specific BSFP composition.
- `research/semantic-quotient` owns all Connect4 research, regardless of solver or representation, including derivations, hypotheses, experiments/results, falsifiers, negative results, research evidence, open questions, maps, synthesis, and provenance.

Do not make BSFP a specialization of Negamax or import recursive search lifecycle semantics into BSFP. Conversely, do not let the forward Negamax lane redefine the CPC/WSL/NDC mathematics simply because it consumes those facts differently.

CUDA-Algorithms owns reusable provider-neutral GPU parallel-algorithm semantics. CUDA-MCGS owns generic search/evaluator/resource/session semantics. CUDA-JS-Tensor owns generic Tensor semantics. CUDA-JS owns runtime/compiler/memory/provider/lifecycle mechanisms.

Consumer-neutral worker/session scheduling, CPU topology, affinity, runtime thread placement, and generic shared search-resource mechanisms belong in their natural lower-layer owner when promoted beyond Connect4 research. A Connect4 research prototype may investigate them, but first-consumer implementation does not transfer semantic ownership.

## Structural authority and local routing

Acceptance status is part of the qualified IsoGraph authority. A required reading order does **not** silently promote a Candidate specification to Accepted.

The legacy files listed below remain useful human-readable bridge views of the logic represented by current IsoGraph authority 1.1 and preserved historical authority 1.0. They are not independent conflict-resolution authority after promotion. If a bridge view appears to conflict with the IsoGraph authority, audit the exact native source image and qualification evidence rather than silently preferring the bridge file.

- `STATUS.md` and `next_step.yaml` — current workstream state/router; keep them current-state artifacts rather than historical ledgers.
- C4-0001 through C4-0005 — protected baseline domain/incumbent/benchmark/oracle authority within their scopes.
- `docs/specs/C4-0006-control-parity-and-winspace-v1.md` — **Candidate structural research specification** for shared Connect4 mathematics: CPC event/control parity, support/event semantics, WSL-625 residual requirements/blockers, antichain/exhaustion semantics. Its definitions and qualified theorem instances may be used explicitly in research controls, but it is not Accepted authority until its own status changes.
- `docs/specs/C4-0007-nested-dependency-closure-v1.md` — **Candidate proof/certificate research specification** for NDC dependency/certificate/timing/fixed-point semantics. Research consuming these clauses must identify the dependency and qualification evidence; using the file does not change its Candidate status.
- `docs/specs/C4-0008-bsfp-exact-solver-v1.md` — BSFP-specific exact W/D/L solver architecture and backward fixed-point meaning, subject to the status declared in that specification.
- `docs/specs/C4-0009-bsfp-cuda-execution-profile-v1.md` — CUDA-BSFP execution/consumer profile, subject to its declared status.
- `docs/specs/C4-0010-quotient-native-negamax-v1.md` — accepted **research** specification for the forward exact W/D/L Negamax consumer/execution lane. Where it imports CPC/WSL/NDC semantics from C4-0006/C4-0007, those imported structural/proof clauses retain the upstream Candidate status unless independently restated and accepted here.
- `docs/research/2026-09-09-owner-searchless-connect4-findings.md` — owner-authored synthesis of CPC → WSL-625 → NDC → BSFP and attribution; research evidence, not a status override.
- `docs/research/2026-09-09-universal-strategic-algebra.md` — U1 parity/response + U2 blocker-lattice unification, including even-release control preservation; research evidence.
- `docs/research/2026-09-09-nested-strategic-dependency-closure.md` — nested conditional event reservoirs and proof closure; research evidence.
- `docs/research/2026-09-09-searchless-solver-hypothesis.md` — explicit searchless criterion and unresolved algebraic-choice question.
- `docs/research/2026-09-09-backward-winline-fixed-point.md` — backward W/L attractor and draw-safety fixed-point evidence.
- `docs/research/2026-09-09-terminal-boundary-qualification.md` — independently qualified geometric terminal boundary.
- `research/semantic-quotient/**` — canonical research content and research evidence; qualified controls may establish theorem instances inside the research calculus but do not redefine specification status.
- `reference/legacy-source/` — provenance/source evidence only, not specification authority.

### Required reading by lane

For BSFP work, read:

**C4-0001 → C4-0006 → C4-0007 → C4-0008 → C4-0009 → selected profile**.

For quotient-native Negamax work, read:

**C4-0001 → C4-0006 → C4-0010 → STATUS.md → next_step.yaml**.

If the forward lane touches parity/Zugzwang control, blockers, strategic terminalization, event-frontier compression, race/deadline facts, or nested certificates, also read **C4-0007** and the relevant 2026-09-09 research notes above before changing semantics.

These arrows are reading/dependency order, not an acceptance-status ladder. Always inspect the status declared inside each specification.

Do not substitute generic alpha-beta literature for this repository's frontier mathematics.

## Core frontier model

The project research does not treat the colored board as the sole ontology of solving.

The structural stack is:

```text
geometric winning-line axioms
  -> support / future placement-event frontier
  -> CPC control parity / event precedence / race
  -> WSL-625 residual requirements and blockers
  -> NDC nested dependency closure
  -> exact solver-specific proof procedure
```

The forward quotient projection currently uses:

```text
supportIndex + normalized R0 + normalized R1
```

for ordinary legal-transition identity. That is not permission to discard CPC/NDC context from a strategic certificate that depends on reservations, releases, response resources, event order, race horizon or deadline.

## CPC invariant — do not flatten it

The zero-reservation target-event count is:

```text
N(t)
  = (r - h_c + 1)
    + sum_{d != c}(H - h_d)
  = (W - 1)H - ply + r + 1
```

The target-column height cancels. Future target control is the event-rank parity relative to side to move.

When a fragment changes the relevant future event reservoir by `Delta`, control is preserved iff the relevant change is even **and** its resource/response/event-order guards remain satisfied.

Therefore:

- CPC is not merely row parity;
- parity metadata is not automatically an exact certificate;
- dropping an event from a compressed frontier is not automatically parity-neutral;
- eventual ownership is weaker than ownership before an opponent completion deadline.

Any implementation that compresses/reserves/releases future events must account for their parity contribution where CPC proof meaning depends on it.

## WSL/NDC terminalization

Do not implement immediate win, double threat, exhaustion, Zugzwang, Allis-style coverage and blocker closure as unrelated conceptual systems if the common frontier algebra can express them.

Cheap local tactical checks may be specialized for speed, but their semantic meaning must remain projections of the shared structural model.

NDC permits feedback:

```text
response/parity fact
  -> certified blocker
  -> requirement elimination
  -> changed event obligations
  -> stronger response/parity fact
  -> ...
```

Timing/race premises are first-class. A blocker ID represents a consequence after certification; it does not erase the premises that made the blocker valid.

## Forward Negamax local boundaries

For the quotient-native forward lane:

- C4-0006 supplies Candidate residual/CPC structural meaning when explicitly imported by research controls;
- C4-0007 supplies Candidate strategic certificate/dependency meaning when explicitly consumed;
- C4-0010 owns the accepted research-lane transition/execution contract, but does not silently upgrade imported Candidate clauses;
- the quotient state-space implementation owns the chosen exact forward projection and transition realization, not the underlying structural theory;
- proof state is separate from semantic/frontier state;
- the Negamax engine owns recursive W/D/L proof policy over unresolved decisions;
- canonical shared identity is semantic content, never worker-local qID/classID or a hash alone;
- search workers own their synchronous active task and are not interrupted for new work;
- **Branch Manager** is an execution role for proactive branch/frontier work supply and hosted background services, not a semantic owner of every hosted concern;
- no per-node Branch-Manager RPC belongs in recursive search.

Execution locality is not semantic ownership.

## Frontier-native ordering

The legacy live-line position value is player-relative and dynamic:

```text
value_p(cell)
  = number of original geometric winning lines through cell
    containing no opponent stone
```

An opponent stone cancels that line's value for player `p`; own stones do not.

The empty 7x6 vector `[3,4,5,7,5,4,3]` is derived evidence, not a static table.

If this original-line multiplicity is used for ordering, carry an incremental live-line frontier or proved equivalent auxiliary representation. Do not reconstruct a conventional colored board just to recover the score, and do not pretend advisory line multiplicity is exact quotient identity.

Fixed center order, reversed worker order, history/killer tables and similar conventional search policies have no default authority here. They may exist as explicit controls or survive only by measurement.

## Forced work and Branch Manager

One exact forced response is not a decision branch. Repeated forced responses may be collapsed into a deterministic macro-edge when semantics remain exact.

When the side to move faces enabled opponent singleton obligations, **response-capacity classification precedes ordinary progress induction**:

- an immediate terminal move for the side to move closes first;
- two or more distinct enabled opponent singleton cells with only one placement response slot are an exact loss boundary;
- exactly one enabled opponent singleton cell forces that exact defense before any ordinary `mu`/`rho`/`kappa` action choice;
- only a zero-obligation state may enter the ordinary progress-action vocabulary unrestricted.

A failed progress theorem remains unknown unless a separate exact loss certificate applies.

Branch Manager should proactively maintain a bounded ready reservoir. Workers do not request work and wait. An idle worker consumes already-ready work with authoritative dependency-qualified proof work ahead of structural exploration.

Exploration discovers frontier structure; it does not independently invent an alpha/beta proof obligation.

## Local application of the design hierarchy

For Connect4 changes, apply the global hierarchy in order: **LEGO boundaries first, then SOLID inside each valid LEGO, then CUPID, then KISS**. Do not use a lower-level principle to justify crossing a higher-level semantic/ownership boundary.

Prefer logical edges where semantic meaning, authority, lifecycle, resource/failure behavior, or independently replaceable context changes. File size, queue shape, worker placement, search depth and implementation convenience are not sufficient reasons for a boundary by themselves.

Reserve **gate** language for an actually blocking condition. Ordinary benchmarks, comparisons, checkpoints, experiments and optimization decisions are not gates.

## Frontier hot-path specialization

Apply the account-global compute-synergy doctrine aggressively to the quotient-native solver hot path.

- A measured ~0.5% reduction in total CPU is material when it survives deliberate paired/repeated evidence and exact work remains unchanged.
- Prefer invariant-bearing packed structures that reduce work on both producer and consumer sides. Masks/shifts and fixed-width typed-array arithmetic are acceptable implementation detail when the owner preserves exact semantics and explicit width/domain contracts.
- Preallocated/sealed memory is intentionally spendable to remove recursive growth/rehash, lower load factors, shorten probe chains, reduce dependent loads, keep backing stores stable, and improve V8/JIT visibility. Do not optimize bytes independently of total solve time and the supported memory budget.
- The recursive search path should remain fixed-storage after preparation; a setup-time resize/rehash is categorically different from growth during recursion.
- Hashes/fingerprints are addressing/rejection accelerators only. Exact quotient/residual content remains equality authority unless an injective encoding is proved over the supported domain.
- A meaningful performance regression blocks additional stacking until the exact diff and expanded producer→boundary→consumer causal neighborhood are audited and paired retested. If it still loses and no higher-priority requirement justifies it, record and remove/supersede it before continuing.
- Stay in Node/JavaScript for product/domain implementation whenever the result is practically achievable there. If a genuinely consumer-neutral primitive materially requires native/GPU/SIMD/runtime support, implement the universal primitive in the appropriate CUDA-* library and consume it through a public Node-facing contract; do not add a Connect4-specific native escape path.

Current durable optimization checkpoint/handoff:

- `docs/research/2026-09-12-universal-optimization-checkpoint.md`
- `docs/research/2026-09-12-frontier-optimization-handoff-v2.md`

## Pre-alpha evolution

The quotient-native lane is pre-alpha and has no released compatibility contract.

Do not add compatibility aliases, deprecated names, redirect modules, tombstones, migration wrappers, duplicate old/new APIs, or dead historical implementations merely to preserve unreleased code. Rename, replace or delete directly and update current consumers/spec/current-state files coherently.

Preserve research findings/evidence with continuing informational value; do not preserve obsolete executable architecture as compatibility baggage.

## Local constraints

Maintained source is JavaScript/Node.js plus product Device-JS through public CUDA contracts. No Python, direct CUDA FFI, C/C++/CUDA C++, hand PTX, or native-addon escape path. Benchmark correctness/fairness semantics remain Connect4-owned.

BSFP may consume CUDA-Algorithms only through public consumer-neutral contracts. Generic workset/closure/sequence mechanics must not be copied downstream. Conversely CPC/WSL-625/NDC/WDL semantics, exact BSFP equality/dominance, existential/universal proof reduction and semantic rank completion remain Connect4-owned.

Q1 GPU qualification remains fail-closed for memory/telemetry and append-only evidence publication under its own profile.