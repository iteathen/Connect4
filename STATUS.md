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

Repeated forced responses are traversed as deterministic transit before unresolved decision depth is incremented. Split depth means **unresolved decision depth after forced macro normalization**, not raw ply depth.

### Shared proof admission

Ordinary proof lookup is non-allocating. Shared semantic proof storage is admitted only when retained proof/hint state is published.

### Generation-safe bounded proof replacement

The shared semantic proof table is 8-way set-associative with exact descriptor equality and generation-bearing proof handles.

A stale handle reads as unknown `[-1,+1]`, cannot publish into a replacement identity, and cannot carry a move hint into a replacement identity. Replacement and proof publication share the slot lifecycle lock. Generation wrap fails closed.

A deliberately tiny 4x5 table remained exact through tens of thousands of replacements, including exact root actions `[0,0,0,0]`.

### Slot-owned descriptor spans

Descriptor term storage is owned by the physical proof slot rather than by every semantic incarnation of that slot.

On replacement, an existing term span is overwritten in place when large enough; only a larger descriptor grows the slot's span. Generation changes on every replacement, preserving stale-handle safety.

The constrained 4x5 control exercised 43,533 replacements with 36,709 span reuses and only 6,824 span grows while preserving exact root actions.

### Worker-local state descriptor lifetime

Worker-local semantic state descriptors are no longer retained indefinitely.

Telemetry on standard-7x6 run `34673627048` localized the host-memory owner: each worker held about 1.06 GB of typed quotient-kernel storage while V8 heap high-water reached about 4.1-4.3 GB with roughly 17-18 million retained state descriptor objects and 4.4-4.5 million retained residual class descriptors.

Commit `29c96d40dc766d5ceb2c107625db57d758599d44` removed only the unbounded local **state descriptor** cache. State descriptors are now rebuilt ephemerally from exact support plus exact residual class descriptors. Exact residual class descriptors remain cached. Shared proof identity and frontier/CPC/WSL/NDC semantics are unchanged.

Bounded qualification is green:

- idle ExploreHint run `34673985296` passed;
- dependency-aware proof run `34673985304` passed;
- exact root/action WDL remained `[0,0,0,0]`;
- baseline work remained 11,303 expansions / 24,877 calls / 13,325 proof admissions;
- best measured bounded point was three workers / unresolved decision depth 3 at about 23.13 ms median.

See `docs/research/2026-09-11-7x6-worker-descriptor-retention.md`.

## Parallel proof semantics

The dependency-aware engine remains:

```text
preferred frontier child first
  -> establish/tighten parent bound
  -> expose dependency-qualified sibling scouts
  -> consume scout completions incrementally
  -> detach obsolete siblings after cutoff
```

Busy workers are never interrupted. Detached proof work may finish naturally and publish sound shared proof; the parent no longer waits on obsolete siblings. `drainBackground()` prevents reset/cleanup from racing detached work.

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

Autonomous exploration is qualified independently but remains disabled in the current standard-7x6 storage-isolation run.

## Standard 7x6 storage evidence

### Corrected proof-admission run

With dynamic frontier ordering, WSL bounds, forced macros and non-allocating probes:

```text
entries:        8,388,608 / 8,388,608
term IDs:      99,025,439 / 460,000,000
elapsed:       238.54 s
root W/D/L:    unresolved
```

This established retained proof-entry count as a real limiter and exposed a severe near-full probing cliff.

### Generation-safe replacement with append-only descriptor terms

Replacement removed the entry-count/open-addressing limiter but cumulative descriptor-incarnation storage became the next limiter:

```text
live entries:       8,388,606
replacements:      30,969,854
term IDs:         459,999,997 / 460,000,000
elapsed:           149.46 s
root W/D/L:        unresolved
```

That motivated slot-owned reusable descriptor spans rather than a general concurrent free-list.

### Slot-owned spans exposed worker-local host memory

Run `34671597871` used slot-owned reusable proof descriptor spans and was killed around 225 s at about 15.4 GB RSS while the descriptor arena was only about 58.7% used. Proof replacement and span reuse were still active, so neither proof-entry capacity nor descriptor-term capacity explained the kill.

The follow-up telemetry run `34673627048` reproduced the host-memory failure and localized it to worker-local V8 retention rather than typed quotient-kernel storage. The exact high-water evidence is preserved in the worker descriptor-retention research note.

### Current live measurement: ephemeral local state descriptors

Standard-7x6 workflow run `34674060855` at commit `1b9bb83f72a318c188750b421f352504048fe314` is the first root attempt after the bounded-qualified removal of unbounded local state-descriptor retention.

Configuration remains intentionally isolated:

```text
search workers:                  3
unresolved decision split depth: 8
autonomous Branch Manager explore: disabled
shared proof entries:            8,388,608
shared descriptor term capacity: 460,000,000
slot-owned descriptor spans:     enabled
```

As of this status update, the solver step remains healthy after roughly 15 minutes, materially beyond the previous approximately 225-second host-kill horizon. That validates unbounded state-descriptor retention as a major large-scale lifetime defect, but the root result and next limiter are not yet claimed.

**Do not launch a duplicate standard-7x6 root run while `34674060855` is active.**

## Next evidence boundary

When run `34674060855` closes, inspect its complete progress/high-water series before another memory mutation.

Capture and compare:

- exact root/action WDL if resolved;
- calls and expansions;
- proof probes/misses/admissions;
- shared proof entries/replacements;
- descriptor term IDs and span reuse/growth;
- forced macro transitions/frontier bound cuts/frontier-ordered nodes;
- authoritative/explore queue occupancy and worker utilization;
- detached sibling work;
- process RSS;
- per-worker local q states/residual classes/typed bytes;
- per-worker V8 heap/external/ArrayBuffer high-water;
- residual class descriptor builds and cached term-ID count.

A residual class descriptor currently retains a materialized `Uint16Array` of exact term IDs. That is a plausible next duplication boundary only if the completed run shows it owns the next memory slope. Do not remove or weaken exact class identity preemptively.

## Open mathematics

Complete cheap forward integration of U1/U2/NDC remains open. In particular, early response-policy alternatives may or may not collapse completely into GF(2), monotone closure, dominance, matching or another compact algebra without strategic branching.

The forward solver must not claim this open problem is solved merely because Negamax can search unresolved decisions.

## Pre-alpha

There is no released compatibility contract. Rename/replace/delete obsolete implementation directly and update current consumers coherently. Preserve useful research/evidence, not compatibility debris.
