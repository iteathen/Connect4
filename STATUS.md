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

A deliberately tiny 4x5 table remains exact through tens of thousands of replacements, including exact root/actions `[0,0,0,0]`.

### Slot-owned descriptor extension chunks

Descriptor term storage is owned by the physical proof slot rather than by every semantic incarnation of that slot.

The old `v4` implementation overwrote an existing slot span when the replacement fit, but a larger descriptor allocated a new whole contiguous span and abandoned the old one. Standard-7x6 run `34674060855` proved that historical whole-span growth remained cumulative at large scale.

The current `v5` store keeps a slot-owned chain of exact descriptor-term chunks. Replacements overwrite existing aggregate slot capacity when they fit. Growth appends only the missing descriptor-data capacity as a new chunk. Exact descriptor equality walks the chunk chain. Generation-bearing handles and proof identity are unchanged.

In `v5`, `termIdsUsed` reports owned descriptor-data capacity while `termArenaWordsUsed` includes descriptor data plus three header words per chunk. The configured term capacity bounds total arena words.

Adversarial eight-slot monotone growth qualification exercised 144 replacements/growth events while final descriptor data remained exactly `8 * 20 = 160` terms. Total arena usage was 616 / 640 words including 456 header words. The constrained exact 4x5 control remained root/actions `[0,0,0,0]` through 43,387 replacements.

See `docs/research/2026-09-11-7x6-proof-term-lifetime.md`.

### Worker-local state descriptor lifetime

Worker-local semantic state descriptors are no longer retained indefinitely.

Telemetry on standard-7x6 run `34673627048` localized the previous host-memory owner: each worker held about 1.06 GB of typed quotient-kernel storage while V8 heap high-water reached about 4.1-4.3 GB with roughly 17-18 million retained state descriptor objects and 4.4-4.5 million retained residual class descriptors.

Commit `29c96d40dc766d5ceb2c107625db57d758599d44` removed only the unbounded local **state descriptor** cache. State descriptors are rebuilt ephemerally from exact support plus exact residual class descriptors. Exact residual class descriptors remain cached. Shared proof identity and frontier/CPC/WSL/NDC semantics are unchanged.

Bounded qualification remained green:

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

Autonomous exploration is independently qualified but remains disabled in the standard-7x6 storage-isolation measurement.

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

### Generation-safe replacement with append-only descriptor incarnations

Replacement removed the entry-count/open-addressing limiter but cumulative descriptor-incarnation storage became the next limiter:

```text
live entries:       8,388,606
replacements:      30,969,854
term IDs:         459,999,997 / 460,000,000
elapsed:           149.46 s
root W/D/L:        unresolved
```

That motivated physical-slot-owned descriptor storage rather than semantic-incarnation ownership.

### Slot-owned spans exposed worker-local host memory

Run `34671597871` used slot-owned reusable proof descriptor spans and was killed around 225 s at about 15.4 GB RSS while the descriptor arena was only about 58.7% used. Proof replacement and span reuse were still active, so neither proof-entry capacity nor descriptor-term capacity explained that kill.

The follow-up telemetry run `34673627048` reproduced the host-memory failure and localized it to worker-local V8 retention rather than typed quotient-kernel storage. The exact high-water evidence is preserved in the worker descriptor-retention research note.

### Ephemeral state descriptors exposed v4 span-growth lifetime

Standard-7x6 run `34674060855` at commit `1b9bb83f72a318c188750b421f352504048fe314` was the first root attempt after unbounded local state-descriptor retention was removed.

Configuration:

```text
search workers:                  3
unresolved decision split depth: 8
autonomous Branch Manager explore: disabled
shared proof entries:            8,388,608
shared descriptor term capacity: 460,000,000
old v4 slot-owned spans:         enabled
```

The solver ran for `855.44 s` before failing exactly on:

```text
semantic TT term arena exhausted: 460000025 > 460000000
```

Final evidence:

```text
root W/D/L:             unresolved
entries:                8,388,608
replacements:         153,310,210
span reuses:          134,966,299
span grows:            18,343,911
term IDs used:        459,999,998 / 460,000,000
process RSS:       15,600,738,304 bytes
worker expansions:    114,003,282
worker calls:         342,254,103
```

Per-worker high-water reached roughly 40.1-45.5 million local q states, 9.59-11.11 million residual classes, 2.12-2.14 GB typed local storage and 3.56-4.14 GB V8 heap. The run materially exceeded the earlier host-kill horizon and then hit the old whole-span descriptor-growth boundary exactly.

### v5 slot-owned extension chunks qualified

The `v5` proof-store correction was bounded-qualified before full-root admission:

- semantic replacement/stale-handle/growth run `34675102224` passed;
- dependency-aware proof run `34675126023` passed;
- idle ExploreHint run `34675132451` passed;
- constrained exact 4x5 root/actions remained `[0,0,0,0]`.

The standard-7x6 workflow is path-gated so implementation commits do not automatically launch expensive root attempts. Full-root measurement is admitted only through `standard7x6-root-qualification-revision.txt` after bounded qualification.

## Active v5 standard-7x6 measurement

Exactly one `v5` full-root measurement is active:

```text
workflow run:                     34675467051
job:                              103504435817
admission commit:                 5049e3b25eaca8526e2559123b12ea3e6283b8da
search workers:                   3
unresolved decision split depth:  8
autonomous Branch Manager explore: disabled
shared proof entries:             8,388,608
shared term arena words:          460,000,000
proof descriptor storage:         v5 slot-owned extension chunks
```

The qualification-trigger commit launched only this standard-7x6 workflow. The solver step is in progress. GitHub does not expose the in-progress job log blob through the current connector, so no live progress series is claimed before the job log is finalized.

**Do not admit or launch a second standard-7x6 root run while `34675467051` is active.**

When the run closes, capture and compare:

- exact root/action W/D/L if resolved;
- calls and expansions;
- proof probes/misses/admissions;
- shared proof entries/replacements;
- descriptor data capacity, chunk count, header words and total arena words;
- forced macro transitions/frontier bound cuts/frontier-ordered nodes;
- authoritative/explore queue occupancy and worker utilization;
- detached sibling work;
- process RSS;
- per-worker local q states/residual classes/typed bytes;
- per-worker V8 heap/external/ArrayBuffer high-water;
- residual class descriptor builds and cached term-ID count.

A residual class descriptor still retains exact term-ID material. That is a plausible next duplication boundary only if the `v5` run shows it owns the next memory slope. Do not remove, reclaim or weaken exact class identity preemptively.

## Open mathematics

Complete cheap forward integration of U1/U2/NDC remains open. In particular, early response-policy alternatives may or may not collapse completely into GF(2), monotone closure, dominance, matching or another compact algebra without strategic branching.

The forward solver must not claim this open problem is solved merely because Negamax can search unresolved decisions.

## Pre-alpha

There is no released compatibility contract. Rename/replace/delete obsolete implementation directly and update current consumers coherently. Preserve useful research/evidence, not compatibility debris.
