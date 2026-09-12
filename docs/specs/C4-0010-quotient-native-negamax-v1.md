# C4-0010 — Quotient-native exact Negamax v1

**Status:** accepted research specification

## Purpose

Define the Connect4-owned exact forward solver that operates on the future-relevant quotient state rather than a recursive colored-board state.

This specification owns Connect Four quotient-state meaning, exact W/D/L Negamax behavior, proof-state interaction, and Connect4-specific parallel work semantics. It does not own generic worker/runtime topology discovery, generic thread affinity, generic shared-memory/runtime mechanisms, or consumer-neutral search-session infrastructure.

C4-0001 remains authoritative for standard Connect Four domain rules. C4-0010 defines the quotient-native forward solver built on those rules.

## Exact quotient state

The solver state is

```text
q = supportIndex
  + normalized P0 residual winning-requirement antichain
  + normalized P1 residual winning-requirement antichain
```

`sideToMove` is derived from support rank parity and is not an independent semantic field.

Two physical histories may map to one quotient state only when they have the same action-labeled future behavior for the solver consumer scope.

The recursive solver does not require a colored physical board as machine state. Physical-board state may remain an oracle, provenance source, or independent control.

## Quotient transition semantics

For a legal landing cell:

- the mover's residual requirements containing the cell shrink by that cell;
- shrinking a singleton residual requirement produces an immediate terminal win;
- the opponent's residual requirements containing the cell are removed;
- residual requirements remain canonically normalized as the minimal antichain;
- support advances by the legal column transition.

Illegal moves and terminal-win transitions have one Connect4-owned meaning across all quotient implementations.

Representations such as term IDs, slot-local bit chunks, packed support descriptors, local class IDs, or cache indices are implementation choices and do not redefine quotient identity.

## Tactical closure

The quotient state space owns Connect4 tactical classification:

- immediate mover win;
- forced response to one immediate opponent threat;
- forced loss from multiple simultaneous opponent threats;
- draw when no winning requirement remains for either side or no legal continuation can change the exact W/D/L result;
- no tactical shortcut otherwise.

Search consumes this classification; it does not independently redefine tactical meanings.

## Negamax semantics

The solver returns exact side-to-move W/D/L values in `{-1, 0, +1}`.

The recursive search is fail-soft alpha-beta Negamax over quotient transitions.

A state may return from previously established exact or bound proof information only when that proof refers to the same exact quotient identity.

Move ordering is advisory. It may affect work and tie order but must not alter exact W/D/L semantics.

The active Negamax policy is one logical component. Local, shared-graph, and online worker execution forms adapt their state-space and proof-store capabilities into that same policy rather than carrying independent search semantics.

## Semantic state versus proof state

Semantic state and proof state are separate responsibilities.

Semantic state answers:

```text
what exact quotient state is this?
what actions are legal?
what exact quotient transition follows an action?
what tactical closure applies?
```

Proof state answers:

```text
what exact W/D/L value or sound lower/upper bound is established?
what advisory move hint is available?
```

Semantic identity is stable. Proof state evolves during solving.

A proof store must not manufacture a stronger claim from races, stale hints, hash collisions, or partial publication.

## Proof publication

For W/D/L bounds:

- lower bounds may only strengthen monotonically upward;
- upper bounds may only strengthen monotonically downward;
- an exact value is represented by equal lower and upper bounds;
- contradictory publication is an error, not a replacement policy;
- best-move hints are advisory and must not erase stronger proof facts.

The packed byte layout is an implementation detail of the current proof-store service, not solver semantic authority.

## Canonical shared identity

Worker-local qIDs and residual-class IDs are execution-local and need not agree between workers.

The canonical semantic descriptor for shared proof identity is:

```text
supportIndex
+ exact sorted P0 residual term sequence
+ exact sorted P1 residual term sequence
```

Hash values may select candidate storage locations but are not semantic equality. A hash match is accepted only after exact descriptor equality.

No probabilistic hash-only hit may produce an exact or bound proof reuse.

## Parallel search ownership

Search workers own synchronous recursive Negamax execution over local fast quotient state.

They may share exact proof information through the proof-store contract.

The maintenance execution host may physically host planning, proof-resource lifecycle, dedup reconciliation, and reclamation services. Execution locality does not make the worker process the semantic owner of those child responsibilities.

Recursive search must not require per-node RPC to the maintenance host.

## Dependency-aware work planning

Parallel work is exposed at logical alpha-beta dependency edges, not at arbitrary depth boundaries.

A work item becomes independently schedulable only after the parent information required to define its useful proof obligation is available.

The intended parallel shape is:

```text
preferred child first
  -> establish or tighten parent bound
  -> expose dependency-satisfied sibling proof work
  -> consume shared proof updates
  -> stop, ignore, or cancel obsolete sibling work after cutoff
```

Blind root-branch fanout and bulk full-window solving of every shallow frontier node are not the default solver semantics.

A shallow quotient work DAG may be used to discover transpositions, forced responses, tactical closures, work estimates, and representative task paths, provided it preserves alpha-beta dependency meaning.

## Dynamic search profile

Worker count, lookahead/split depth, and task granularity are measured properties of the hardware and current proof shape rather than universal constants.

Initialization or useful presearch may measure:

- available effective search concurrency;
- frontier width after quotient deduplication;
- tactical/forced-response closure;
- transposition rate;
- task-cost skew;
- dependency-qualified parallel slack;
- shared-proof reuse and contention.

Useful presearch should contribute retained proof/search work where practical rather than exist only as disposable calibration.

Connect4 consumes a measured search-capacity/profile capability. Consumer-neutral CPU topology, affinity, runtime thread placement, and generic search-session capacity belong to their natural lower-layer owners.

## Deduplication and reclamation

Canonical deduplication and storage reclamation each require one visible lifecycle owner.

Search workers may use local execution caches and local IDs, but those do not become global semantic authority.

Shared arenas are fixed-capacity resources unless a later accepted design explicitly changes that contract. Cleanup/reuse must preserve exact identity and proof validity.

## Representation freedom

The solver may change support encoding, residual representation, interning layout, chunk geometry, cache policy, proof-record packing, or worker scheduling when exact solver semantics remain unchanged.

Representation-specific limits must come from the supported domain and resource model rather than the first bounded control.

## Evidence and claims

The currently accepted research evidence includes:

- complete bounded quotient equivalence and exact W/D/L controls;
- standard-7x6 rank-growth representation checkpoints;
- bounded quotient-versus-physical forward comparisons;
- useful shared-proof worker parallelism;
- exact semantic-content TT sharing across worker-local quotient IDs.

Those results do not by themselves establish standard-7x6 empty-root wall clock, a universal worker count, a universal split depth, production CPU-affinity placement, or end-to-end hybrid performance.

`STATUS.md` and `next_step.yaml` own current implementation/evidence state and the next research seam. Research notes preserve useful experimental provenance but do not override this specification.