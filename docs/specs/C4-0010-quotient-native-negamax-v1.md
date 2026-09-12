# C4-0010 — Quotient-native exact Negamax v1

**Status:** accepted research specification

## Purpose

Define the Connect4-owned exact **forward** W/D/L Negamax solver over the future-relevant Connect Four frontier.

This specification owns forward Negamax proof procedure, proof-state interaction, worker/Branch-Manager execution semantics, and forward-lane evidence requirements. It does **not** independently own the structural mathematics from which the frontier is derived.

## Structural dependencies

Read and preserve these meanings before changing this lane:

- **C4-0001** — Connect Four domain/legal-game semantics;
- **C4-0006** — CPC control parity, support/event semantics, WSL-625 residual requirements/blockers, antichain/exhaustion semantics;
- **C4-0007** — NDC dependency/certificate/timing semantics whenever strategic closure facts are consumed by the forward solver.

C4-0008 defines the separate BSFP solver architecture. Negamax is not BSFP and BSFP is not a specialization of Negamax, but both consume the same Connect4-owned structural facts where their scopes overlap.

C4-0010 must not redefine CPC, WSL-625 or NDC with forward-search-specific substitutes.

## Frontier layers

Keep these layers distinct:

```text
support / future event accessibility
residual winning requirements
CPC parity / response / event-order facts where material
certified blockers / NDC facts where material
proof state (W/D/L bounds and exact values)
advisory ordering state
```

A smaller projection may be sufficient for ordinary legal-transition identity, but auxiliary ordering context or strategic certificates do not become part of that identity merely because one implementation stores them nearby.

## Exact forward quotient

The currently qualified ordinary forward quotient projection is:

```text
q = supportIndex
  + normalized P0 residual winning-requirement antichain
  + normalized P1 residual winning-requirement antichain
```

`sideToMove` is derived from support rank parity under standard alternating no-pass Connect Four.

This projection is a consumer of C4-0006 residual semantics. It is not the complete NDC closure state. If a strategic proof fact depends on blockers, response resources, event-order premises, parity reservoirs, deadlines or horizons that are not derivable from `q`, that fact may not be cached/reused under `q` alone.

Worker-local qIDs, residual-class IDs, term IDs, packed support encodings and cache indices are implementation representations, not semantic identity.

## Quotient transition semantics

For a legal landing event, consume C4-0006 semantics:

- mover requirements containing the landing cell shrink by that cell;
- shrinking a singleton requirement completes a geometric win;
- opponent requirements containing the landing cell are permanently blocked and disappear;
- same-player residual requirements remain canonically normalized as the minimal antichain;
- support advances by the legal gravity transition.

A removed blocked line never reappears.

## CPC control invariant

Do not reduce CPC to a row-parity heuristic.

For the zero-reservation/base event reservoir and target `t=(c,r)`:

```text
N(t)
  = (r - h_c + 1)
    + sum_{d != c}(H - h_d)
  = (W - 1)H - ply + r + 1
```

Control of the target depends on `(N(t) - 1) mod 2` relative to side to move.

When a strategic fragment reserves/releases/removes events before a parity-dependent target:

```text
N'(t) = N(t) + Delta
```

and control is preserved only when `Delta` is even, subject also to the fragment's exact response/resource and event-order guards.

Therefore any compressed frontier that omits or releases events must preserve their parity effect whenever CPC proof meaning depends on that reservoir. Eventual ownership is insufficient where a race/deadline matters.

## Terminal and tactical closure

Immediate tactical closure is a specialization of the structural frontier, not an independent board detector.

Cheap exact cases include:

- mover playable singleton requirement -> immediate win;
- one distinct playable opponent singleton -> forced response;
- multiple distinct playable opponent singleton cells -> forced loss if no immediate mover win supersedes them;
- one-sided residual exhaustion -> exact no-win bound for that player;
- bilateral residual exhaustion -> exact draw absent an earlier win;
- no legal continuation under the same terminal convention -> exact draw where applicable.

These are not the complete strategic closure language.

When C4-0007/NDC facts are used, exact closure may additionally derive ownership, blockers, requirement elimination, one-sided no-win or stronger terminal propositions through parity/response/race dependencies. Such facts retain their complete premises and timing meaning.

Search consumes exact closure. Search does not redefine it.

## Forced transition normalization

A single forced response is not an ordinary decision branch.

Repeated forced responses may be collapsed into a deterministic macro-edge until the next decision or terminal proposition, provided exact semantics are preserved.

Deterministic transit states need not receive the same shared-proof admission priority as decision states. This is an execution/cache policy derived from exact forced-transition structure, not a change in game semantics.

## Negamax semantics

The forward solver returns exact side-to-move W/D/L values in `{-1, 0, +1}`.

Unresolved decision states may be solved with fail-soft alpha-beta Negamax over exact frontier transitions.

The active Negamax policy is one logical component. Local, shared-graph and online worker forms adapt state/proof capabilities into the same policy rather than carrying independent recursive semantics.

Exact frontier closure should be consumed before branching so already-derived terminal/bound facts are not rediscovered through legal-move enumeration.

## Move ordering

Move ordering is advisory only, but the default policy should be **frontier-derived**, not conventional merely by habit.

The legacy live-line value for player `p` is:

```text
value_p(cell)
  = count of original geometric winning lines through cell
    that contain no opponent stone
```

An opponent stone cancels that line's value for `p`; own stones do not.

The empty-board standard-7x6 vector `[3,4,5,7,5,4,3]` is a derived test result, never a static table.

If original-line multiplicity/provenance is used for ordering, maintain a player-relative live-line frontier (or proved equivalent projection) incrementally. Do not reconstruct a conventional board merely to recover the score, and do not make that advisory multiplicity part of exact quotient identity.

Proof-store move hints may be combined with frontier ordering only as measured advisory policy. Fixed center order, reverse-by-worker-salt, history/killer tables or similar conventional search techniques have no default authority in this frontier engine.

## Semantic state versus proof state

Semantic/frontier state answers exact game questions such as legality, support progression, residual transformations and qualified closure facts.

Proof state answers:

```text
what exact W/D/L value or sound lower/upper bound is established?
what advisory move hint is available?
```

Semantic identity is stable for its declared projection. Proof state evolves during solving.

A proof store must not manufacture stronger claims from races, stale hints, hash collisions, incomplete certificate context or partial publication.

## Proof publication

For W/D/L bounds:

- lower bounds strengthen only upward;
- upper bounds strengthen only downward;
- equal lower/upper means exact;
- contradictory publication is an error;
- advisory move hints cannot erase stronger proof facts.

Packed byte layout is implementation detail, not semantic authority.

## Canonical shared identity

For the ordinary forward quotient projection, shared proof identity is:

```text
supportIndex
+ exact sorted P0 residual term sequence
+ exact sorted P1 residual term sequence
```

Hash values may address candidate storage locations but never establish equality.

If shared proof facts later include CPC/NDC certificate state that is not derivable from this descriptor, the identity must be extended or those facts must remain separately/contextually owned. Never attach path-dependent strategic proof to the smaller key by assumption.

## Shared proof admission

Shared proof storage is not required to intern every visited state.

A conforming implementation may separate:

```text
probe existing proof without allocation
ensure storage when publishing retained proof/hint state
```

Decision-state or proof-value-aware admission is allowed and should be compared against allocate-on-read behavior. Forced deterministic transit states are especially important candidates for non-admission.

Fixed-capacity arenas require explicit lifecycle/replacement semantics before a slot can be reused. Stale slot handles must never publish proof to a new identity.

## Parallel search ownership

Search workers own synchronous local execution of their current proof/explore task. They are not interrupted to accept new work.

Workers may share exact proof information through the proof-store contract.

**Branch Manager** is the execution role that hosts branch/work-supply, dedup/reconciliation and related background services. Hosting a service does not transfer that service's semantic ownership to the worker process.

Recursive search must not require per-node RPC to Branch Manager.

## Branch Manager work supply

Branch Manager should maintain a bounded ready reservoir ahead of worker demand.

Workers do not request a new branch and wait for a reply. When a worker finishes its current task and would otherwise idle, the local executor chooses from already-ready work:

```text
authoritative dependency-qualified proof work
  > queued frontier exploration
  > idle
```

An exploration hint may be represented as:

```text
ExploreHint(path-or-frontier-reference, depth)
```

where `depth` bounds structural lookahead, not Negamax proof depth.

Exploration discovers frontier structure, transpositions, forced closure and future branch candidates. Discovery alone does not create a valid parent alpha/beta obligation.

## Dependency-aware parallel proof

Parallel authoritative work is exposed at logical proof dependencies, not arbitrary fixed-depth cuts.

The intended shape is:

```text
preferred frontier child / proof obligation first
  -> establish or tighten parent bound
  -> release dependency-satisfied sibling obligations
  -> consume completions incrementally
  -> detach obsolete sibling work from the parent after cutoff
```

Busy workers are not forcibly cancelled. Detached work may finish naturally and publish any sound proof before returning to the ready queue.

Do not insert a bulk barrier that requires every sibling scout to complete before an already-satisfied parent can return.

## Dynamic frontier profile

Worker count, exploration depth and task granularity are measured properties of hardware **and current proof/frontier shape**, not universal constants.

A fixed depth may be used as a bounded initialization/control parameter. It must not be mistaken for the semantic definition of parallel work.

Useful presearch/exploration should retain exact frontier/proof information where practical rather than exist only as disposable calibration.

## Representation freedom

The solver may change support encoding, residual representation, line-frontier representation, interning layout, cache admission, proof packing or worker scheduling when exact semantics remain unchanged.

Representation-specific limits must come from the supported domain/resource model rather than bounded controls.

## Evidence and claims

Accepted evidence includes:

- complete bounded quotient equivalence and exact W/D/L controls;
- standard-7x6 quotient/rank-growth checkpoints;
- bounded quotient-versus-physical forward comparisons;
- exact semantic-content proof sharing across worker-local quotient IDs;
- dependency-aware bounded worker experiments;
- independent geometric terminal qualification from the broader research line.

Those results do not establish universal worker count/split depth, standard-7x6 empty-root wall clock, complete U1/U2/NDC forward integration, or final shared-TT replacement policy.

Current-state files own current implementation/evidence. Research notes preserve experiment provenance but do not override these ownership boundaries.