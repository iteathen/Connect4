# Repository context: Connect4

Universal engineering and design guidance comes from the account-global `AGENTS.md`.

## Mission and ownership

Connect4 is an independent Node benchmark/validation product and exact-solver laboratory for Connect Four. It owns Connect Four domain semantics, the custom evaluator and conformance vectors, solved-game oracle evidence, benchmark positions/budgets/fairness/metrics/evidence, exact-solver semantics/evidence, and product composition of public CUDA libraries.

The repository contains deliberately separate solver lanes built on shared Connect4 structural mathematics:

- `components/incumbent/` owns the incumbent minimax/alpha-beta/search implementation and its accepted incumbent search/evaluator semantics.
- `components/bsfp/` owns the backward symbolic fixed-point solver implementation and Connect4-specific BSFP composition.
- `research/semantic-quotient/` owns quotient-native forward-solver research and its Negamax/parallel execution evidence.

Do not make BSFP a specialization of Negamax or import recursive search lifecycle semantics into BSFP. Conversely, do not let the forward Negamax lane redefine the CPC/WSL/NDC mathematics simply because it consumes those facts differently.

CUDA-Algorithms owns reusable provider-neutral GPU parallel-algorithm semantics. CUDA-MCGS owns generic search/evaluator/resource/session semantics. CUDA-JS-Tensor owns generic Tensor semantics. CUDA-JS owns runtime/compiler/memory/provider/lifecycle mechanisms.

Consumer-neutral worker/session scheduling, CPU topology, affinity, runtime thread placement, and generic shared search-resource mechanisms belong in their natural lower-layer owner when promoted beyond Connect4 research. A Connect4 research prototype may investigate them, but first-consumer implementation does not transfer semantic ownership.

## Structural authority and local routing

- `STATUS.md` and `next_step.yaml` — current workstream state/router; keep them current-state artifacts rather than historical ledgers.
- C4-0001 through C4-0005 — protected baseline domain/incumbent/benchmark/oracle authority within their scopes.
- `docs/specs/C4-0006-control-parity-and-winspace-v1.md` — **shared Connect4 structural mathematics**: CPC event/control parity, support/event semantics, WSL-625 residual requirements/blockers, antichain/exhaustion semantics. It is not BSFP-only merely because BSFP consumes it deeply.
- `docs/specs/C4-0007-nested-dependency-closure-v1.md` — NDC dependency/certificate/timing/fixed-point proof semantics. Any lane consuming strategic certificates must preserve these meanings.
- `docs/specs/C4-0008-bsfp-exact-solver-v1.md` — BSFP-specific exact W/D/L solver architecture and backward fixed-point meaning.
- `docs/specs/C4-0009-bsfp-cuda-execution-profile-v1.md` — CUDA-BSFP execution/consumer profile.
- `docs/specs/C4-0010-quotient-native-negamax-v1.md` — forward exact W/D/L Negamax **consumer** of C4-0006 structural semantics, plus proof-store/parallel/Branch-Manager execution policy.
- `docs/research/2026-09-09-owner-searchless-connect4-findings.md` — owner-authored synthesis of CPC → WSL-625 → NDC → BSFP and attribution.
- `docs/research/2026-09-09-universal-strategic-algebra.md` — U1 parity/response + U2 blocker-lattice unification, including even-release control preservation.
- `docs/research/2026-09-09-nested-strategic-dependency-closure.md` — nested conditional event reservoirs and proof closure.
- `docs/research/2026-09-09-searchless-solver-hypothesis.md` — explicit searchless criterion and unresolved algebraic-choice question.
- `docs/research/2026-09-09-backward-winline-fixed-point.md` — backward W/L attractor and draw-safety fixed-point evidence.
- `docs/research/2026-09-09-terminal-boundary-qualification.md` — independently qualified geometric terminal boundary.
- `research/semantic-quotient/state-identity-unification/` — forward quotient research implementation/evidence; research files do not redefine the structural specs.
- `reference/legacy-source/` — provenance/source evidence only, not specification authority.

### Required reading by lane

For BSFP work, read:

**C4-0001 → C4-0006 → C4-0007 → C4-0008 → C4-0009 → selected profile**.

For quotient-native Negamax work, read:

**C4-0001 → C4-0006 → C4-0010 → STATUS.md → next_step.yaml**.

If the forward lane touches parity/Zugzwang control, blockers, strategic terminalization, event-frontier compression, race/deadline facts, or nested certificates, also read **C4-0007** and the relevant 2026-09-09 research notes above before changing semantics.

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

- C4-0006 owns residual/CPC structural meaning;
- C4-0007 owns strategic certificate/dependency meaning when consumed;
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

Branch Manager should proactively maintain a bounded ready reservoir. Workers do not request work and wait. An idle worker consumes already-ready work with authoritative dependency-qualified proof work ahead of structural exploration.

Exploration discovers frontier structure; it does not independently invent an alpha/beta proof obligation.

## Local application of the design hierarchy

For Connect4 changes, apply the global hierarchy in order: **LEGO boundaries first, then SOLID inside each valid LEGO, then CUPID, then KISS**. Do not use a lower-level principle to justify crossing a higher-level semantic/ownership boundary.

Prefer logical edges where semantic meaning, authority, lifecycle, resource/failure behavior, or independently replaceable context changes. File size, queue shape, worker placement, search depth and implementation convenience are not sufficient reasons for a boundary by themselves.

Reserve **gate** language for an actually blocking condition. Ordinary benchmarks, comparisons, checkpoints, experiments and optimization decisions are not gates.

## Pre-alpha evolution

The quotient-native lane is pre-alpha and has no released compatibility contract.

Do not add compatibility aliases, deprecated names, redirect modules, tombstones, migration wrappers, duplicate old/new APIs, or dead historical implementations merely to preserve unreleased code. Rename, replace or delete directly and update current consumers/spec/current-state files coherently.

Preserve research findings/evidence with continuing informational value; do not preserve obsolete executable architecture as compatibility baggage.

## Local constraints

Maintained source is JavaScript/Node.js plus product Device-JS through public CUDA contracts. No Python, direct CUDA FFI, C/C++/CUDA C++, hand PTX, or native-addon escape path. Benchmark correctness/fairness semantics remain Connect4-owned.

BSFP may consume CUDA-Algorithms only through public consumer-neutral contracts. Generic workset/closure/sequence mechanics must not be copied downstream. Conversely CPC/WSL-625/NDC/WDL semantics, exact BSFP equality/dominance, existential/universal proof reduction and semantic rank completion remain Connect4-owned.

Q1 GPU qualification remains fail-closed for memory/telemetry and append-only evidence publication under its own profile.