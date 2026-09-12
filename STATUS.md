# Connect4 frontier-native forward-solver research status

**Updated:** 2026-09-11  
**Current branch:** `research/frontier-negamax-conformance`  
**Forward solver authority:** `docs/specs/C4-0010-quotient-native-negamax-v1.md`

## Structural authority

The forward solver consumes, rather than redefines, the Connect Four structural chain:

```text
C4-0001  legal game/domain
  -> C4-0006  CPC control parity + WSL-625 requirements/blockers
  -> C4-0007  NDC certificate/timing semantics when strategic closure is used
  -> C4-0010  exact forward W/D/L Negamax consumption/execution policy
```

The broader research model remains:

```text
geometric winning-line axioms
  -> support / future event frontier
  -> CPC control parity / event precedence / race
  -> WSL-625 residual requirements and blockers
  -> NDC nested dependency closure
  -> solver-specific exact proof procedure
```

BSFP is the separate backward fixed-point solver lane. The forward Negamax lane is an exact forward solver/control over unresolved decisions after exact frontier facts are consumed.

## CPC invariant

For target event `t=(c,r)` in the base event reservoir:

```text
N(t)
  = (r - h_c + 1)
    + sum_{d != c}(H - h_d)
  = (W - 1)H - ply + r + 1
```

Future control is event-rank parity relative to side to move. If a strategy/frontier transformation changes the relevant reservoir by `Delta`, control is preserved only when the relevant parity change is even and the associated response/resource/event-order guards remain valid.

CPC is not static row parity. No current forward proof code claims general CPC/NDC strategic closure unless the complete premises are represented.

## Exact forward projection

The currently qualified ordinary forward quotient remains:

```text
q = supportIndex
  + normalized P0 residual winning requirements
  + normalized P1 residual winning requirements

sideToMove = rank(supportIndex) & 1
```

Complete bounded controls checked 1,681,808 reachable physical states with zero qualified quotient/WDL mismatches.

This projection is not the complete NDC closure state. Strategic facts with additional parity/resource/race/horizon premises cannot be cached under `q` alone unless those premises are derivable from it.

## Frontier-native execution now implemented

The conformance branch has removed the conventional execution assumptions identified by the frontier audit.

### Dynamic live-line ordering

Move value is derived from the player-relative live geometric-line frontier:

```text
value_p(cell)
  = number of original geometric winning lines through cell
    containing no opponent stone
```

An opponent stone permanently removes every incident line from that player's live-line set. Own stones do not cancel it. The standard empty-root `[3,4,5,7,5,4,3]` vector is a derived regression result only.

The frontier is carried incrementally; authoritative workers reconstruct the exact frontier seed while replaying representative paths. Static center-first/reverse-by-worker ordering is no longer the active frontier policy.

### Exact local closure/bounds

The forward engine consumes:

- immediate playable singleton win;
- forced single response;
- multiple immediate opponent threats -> forced loss where applicable;
- one-sided WSL exhaustion as an exact no-win bound;
- bilateral exhaustion as exact draw where terminal convention permits.

This is still only the already-qualified local subset of the broader CPC/WSL/NDC terminalization algebra.

### Forced macro normalization

Repeated forced responses are traversed as deterministic transit before unresolved decision depth is incremented. Split depth now means **unresolved decision depth after forced macro normalization**, not raw ply depth.

### Shared proof admission

Ordinary proof lookup is non-allocating. Shared semantic proof storage is admitted only when retained proof/hint state is published.

This removed the ambiguity in the earlier 8,388,608-entry result: a corrected 7x6 run still filled all 8,388,608 entries from retained proof publication alone, proving bounded proof replacement was actually required.

### Generation-safe bounded proof replacement

The shared semantic proof table is now 8-way set-associative with exact descriptor equality and generation-bearing proof handles.

A stale handle:

- reads as unknown `[-1,+1]`;
- cannot publish into a replacement identity;
- cannot carry a move hint into a replacement identity.

Replacement and proof publication share the slot lifecycle lock. Generation wrap fails closed.

A deliberately tiny 4x5 table remained exact through tens of thousands of replacements, including exact root actions `[0,0,0,0]`.

### Slot-owned descriptor spans

Descriptor term storage is now owned by the physical proof slot rather than by every semantic incarnation of that slot.

On replacement:

- if the new descriptor fits the slot's existing term span, the span is overwritten in place;
- only a larger descriptor grows that slot's span;
- generation changes on every replacement, preserving stale-handle safety.

The constrained 4x5 control exercised 43,533 replacements with 36,709 span reuses and only 6,824 span grows while preserving exact root actions.

## Parallel proof semantics

The dependency-aware engine:

```text
preferred frontier child first
  -> establish/tighten parent bound
  -> expose dependency-qualified sibling scouts
  -> consume scout completions incrementally
  -> detach obsolete siblings after cutoff
```

Busy workers are never interrupted. Detached proof work may finish naturally and publish sound shared proof; the parent no longer waits on obsolete siblings. `drainBackground()` prevents reset/cleanup from racing detached work.

Bounded 4x5 qualification remains exact. The best measured configuration on the current four-lane hosted control is three workers / unresolved-decision depth 3.

## Branch Manager

The old Maintenance Worker execution role has been removed from active source.

Branch Manager now:

- auto-seeds structural exploration when enabled;
- maintains a bounded ready reservoir ahead of worker demand;
- replenishes from completed frontier fragments;
- deduplicates persistent exploration context using exact q semantic content plus exact live-line frontier context;
- never requires workers to request work and wait.

Ready-work order remains:

```text
authoritative dependency-qualified proof work
  > queued structural frontier exploration
  > idle
```

Autonomous exploration is qualified independently but is disabled in the current standard-7x6 storage-isolation run.

## Standard 7x6 storage evidence

### Corrected proof-admission run

With dynamic frontier ordering, WSL bounds, forced macros and non-allocating probes:

```text
entries:        8,388,608 / 8,388,608
term IDs:      99,025,439 / 460,000,000
elapsed:       238.54 s
root W/D/L:    unresolved
```

This established retained proof-entry count as a real limiter and exposed a severe near-full linear-probing cliff.

### Generation-safe replacement with append-only descriptor terms

Replacement removed the entry-count/open-addressing limiter but cumulative descriptor incarnation storage became the next limiter:

```text
live entries:       8,388,606
replacements:      30,969,854
term IDs:         459,999,997 / 460,000,000
elapsed:           149.46 s
root W/D/L:        unresolved
```

That result motivated slot-owned reusable descriptor spans rather than a general concurrent free-list.

### Current live measurement

Workflow run `34671597871` is the standard-7x6 root experiment using the qualified generation-safe replacement table **plus slot-owned descriptor spans**. It was triggered by commit `ccbcc64c1eccc31a0acd73599a688a5b326975f3` and is intentionally running with autonomous exploration disabled so descriptor lifetime is isolated.

Do not launch a duplicate root run while this measurement is active.

## Known next resource question

If the current root does not close, the next measurement must identify worker-local growth rather than infer it from process RSS.

Workers already report local q-state and residual-class counts per completed task. The next telemetry extension, if needed, is worker high-water aggregation (and then descriptor-cache high-water only if that remains ambiguous).

Do not optimize worker-local memory before the current slot-span root result establishes whether it is actually the next limiter.

## Open mathematics

Complete cheap forward integration of U1/U2/NDC remains open. In particular, early response-policy alternatives may or may not collapse completely into GF(2), monotone closure, dominance, matching or another compact algebra without strategic branching.

The forward solver must not claim this open problem is solved merely because Negamax can search unresolved decisions.

## Pre-alpha

There is no released compatibility contract. Rename/replace/delete obsolete implementation directly and update current consumers coherently. Preserve useful research/evidence, not compatibility debris.
