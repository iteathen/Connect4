# Full-engine sanity audit — frontier-native exact forward solver

**Date:** 2026-09-12  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Purpose

**Continuation status:** audit in progress; full-root admission is blocked. The
sections below preserve earlier findings, not a claim that every active line is
clean. Current continuation coverage and corrections are recorded at the end.

Revision 2 of the standard 7x6 empty-root solve ran for about 26 minutes, approached the hosted runner memory ceiling, and never returned the first win-threshold root proof. The whole forward engine was therefore audited as suspect rather than treating the event as one more isolated allocation problem.

The governing ordinary proof identity remains:

```text
supportIndex
+ normalized P0 residual winning requirements
+ normalized P1 residual winning requirements
```

Hashes remain filters only; exact descriptor equality is proof identity. CPC/WSL/NDC facts remain admissible only where their premises are exact.

## Revision-2 evidence

Run `34676507073`, job `103507205045`, admission commit `8052b757002758494e9776b1f4c23224e6eeb44f`.

The last complete record was at about `1,575,560.714991 ms` elapsed. The runner then received its shutdown signal before the workflow's 30-minute limit, with process RSS near the 16 GB host limit.

```text
root phase:          searching-win-threshold
root WDL:            unresolved
RSS:                 15,711,215,616 bytes
shared TT entries:   8,388,608
TT replacements:     481,919,672
slot reuses:         455,755,857
slot grows:           26,163,815
shared chunk count:   34,552,423
shared term IDs:     251,999,029
shared arena words:  355,656,298 / 460,000,000
```

The v5 shared arena did not exhaust. Worker high-water was approximately 98.7M / 113.6M / 96.5M local quotient states and 23.0M / 26.4M / 22.9M residual classes. Revision 2 also performed about 1.52 billion semantic descriptor builds across the three workers.

## Findings and repairs

### 1. Generation-bearing proof handles escaped the semantic-TT owner

**Status:** real defect, repaired and bounded-qualified.

The engine could hold a generation-bearing shared-TT handle across recursive work. If the physical slot was replaced, the packed proof store rejected the stale publication but the search path did not reacquire the exact semantic state. Completed proofs could therefore disappear under heavy replacement pressure.

Repair: `a728475ba95ced550263b7897c565ccaef6bae21`.

The engine now keeps stable local state IDs; the semantic adapter resolves current generations and retries publication after replacement. A dedicated control forced root handle `8` stale, rejected the raw stale publication, then rebound the same semantic root under handle `17` while the engine key remained `0`.

### 2. Semantic descriptor ownership was duplicated and allocated on the hot path

**Status:** real resource defect, repaired and bounded-qualified.

The canonical slot64 residual-class pool already owned exact class content. The descriptor layer retained another term-ID arena and allocated state descriptor/hash objects during TT access.

Repair: `fa4363435dfc2b5e2b19a95b5f8b8bf370c1b93e`.

The active path now retains only class length plus two 32-bit hash words per class and uses one reusable state-descriptor/hash scratch. Exact term IDs are reconstructed transiently only for exact shared-TT comparison/installation after hash filtering.

Qualified invariants:

```text
retained descriptor term IDs:     0
retained descriptor term arena:   0
retained per-class JS objects:    0
retained per-class term arrays:   0
hot state-descriptor allocations: 0
```

### 3. Online workers retained private local proof arrays despite shared proof ownership

**Status:** real duplicate ownership, repaired and bounded-qualified.

The generic quotient state pool carried `lower`, `upper`, and `bestMove` Int8 arrays for the local solver. Online workers use the shared semantic proof store instead.

Repair: `9141b2038502f401aaddc1ec9e7cd1f1d2f50b42`.

The online-only state specialization removes those three arrays without altering the local/private solver outside the worker path. Savings are exactly 3 bytes of state capacity. At the revision-2 capacity tier of `134,217,728`, that is 384 MiB per worker, 1.125 GiB across three workers.

## Search-control faults and open owners

### 4. Standard-root split depth contradicts measured presearch

**Status:** configuration fault; not yet promoted to the full-root gate.

Revision 2 used unresolved decision split depth `8` with three workers. Standard-7x6 structural presearch had already measured:

```text
depth 3:   238 frontier q states
depth 4: 1,120 frontier q states
```

and identified depth 3-4 as the meaningful range. Tactical forced-response structure begins materially after that region.

The repaired exact dependency-aware control still favors depth 3 for three workers:

```text
split depth 2: ~59.43 ms median, ~11,348 expanded
split depth 3: ~36.00 ms median, ~11,418 expanded
split depth 4: ~38.41 ms median, ~14,669 expanded
```

There is no evidence supporting split depth 8 as the next standard-root configuration.

### 5. Priority probing is disabled

`PRIORITY_PROBE_DEPTH=0` gives no cost-based task differentiation. The 7x6 presearch also showed exhaustive cost probing to be disproportionately expensive, so increasing probe depth blindly is rejected.

### 6. Enhanced transposition cutoffs are disabled

Standard-root workers run with ETC disabled. ETC is exact when its premises hold, but it requires an isolated repaired-engine A/B before promotion.

### 7. TT best-move hints are bypassed under frontier ordering

When live-frontier ordering is active, the engine sorts solely by frontier score and does not consume the shared proof-table `bestMove` hint. A safe candidate is frontier score as primary order with current TT hint only as a tie-break within equal frontier-score classes.

### 8. Worker-local canonical universes are heavily duplicated

Each worker independently interns large overlapping quotient-state and residual-class universes. Shared proof state is shared; canonical state/class storage is not. This remains a major architectural cost after the completed lifetime repairs.

### 9. Stored per-state hashes remain large

The online state pool still stores one Uint32 hash per state. At the revision-2 `134,217,728` capacity tier that is 512 MiB per worker, about 1.5 GiB across three workers. A historical no-hash candidate exists, but CPU cost must be A/B measured before promotion.

### 10. Shared proof replacement pressure is extreme

Revision 2 recorded about 482M replacements against 8.4M physical entries. Because generation-safe republishing now changes proof survival, replacement policy/capacity must be remeasured after the repair before generic TT tuning.

### 11. Detached work drain can delay post-proof completion

The harness drains detached noninterruptible work for clean lifecycle closure. This could delay workflow completion after a proof returns, but revision 2 never returned the first root threshold proof, so it was not that run's root cause.

### 12. No W/D/L sign, terminality, or bounded exactness error found

Physical-vs-quotient controls and constrained exact solves remain consistent. Repaired bounded controls still return exact root `0` and actions `[0,0,0,0]`. No evidence was found of incorrect negation, terminal-win interpretation, tactical exactness, frontier-bound direction, forced-macro sign handling, or generation-safe proof reads.

The engine is therefore not mathematically disproven. The demonstrated failures are proof-lifecycle, resource ownership, and search-control/configuration defects severe enough to make the full solve pathological.

## Current bounded qualification

At head `9141b2038502f401aaddc1ec9e7cd1f1d2f50b42`, all three lanes are green:

- replacement/stale-handle: run `34678704806`, job `103513133339`;
- dependency-aware exact search: run `34678704773`, job `103513133262`;
- idle ExploreHint: run `34678704783`, job `103513133275`.

The replacement campaign preserves root `0`, actions `[0,0,0,0]`, stale-generation rebinding, v5 chunk growth, zero duplicate descriptor term arena, and zero online-worker local proof bytes.

## Disposition

Do not rerun standard 7x6 from the revision-2 configuration.

Before the next root admission:

1. promote a measured split-depth correction; current evidence favors depth 3 for three workers;
2. isolate TT-hint tie-breaking under frontier ordering;
3. A/B ETC on the repaired engine;
4. decide whether stored state-hash removal is worth its CPU tradeoff;
5. remeasure replacement/proof-refresh behavior after generation rebinding;
6. only then admit one standard-root revision through the explicit qualification trigger.

Rejected shortcuts: increasing the shared term arena, increasing TT capacity without remeasurement, weakening exact residual identity, replacing frontier ordering with generic heuristics, deep priority probing by assumption, inventing CPC/NDC closure, or launching repeated full roots while control faults remain unresolved.

## Continuation from 83dfe6f — packed proof boundary

Protected main was observed at `15b8e62de07f2b35a74ea2297fda79b72633bf64`;
the active research branch was unchanged at
`83dfe6f32c0cb6dcafa8bdfaee8f7dcc276030e2`. Existing fixes are preserved.

### Reviewed lines and governing contracts

- All of `quotient-packed-proof-store.mjs`: C4-0010 proof monotonicity,
  generation identity, hint separation, and the semantic arena's slot lifecycle.
- All of `quotient-negamax-search-record.mjs`: exact W/D/L and packed-record
  value domains; reserved bits are not proof state.
- Arena validation/reset entry points in `quotient-proof-resource-service.mjs`
  and `quotient-semantic-shared-tt.mjs`: each arena owner validates its format.
  The remaining TT allocation/identity/reset/concurrency audit is still open.

### Corrected defects

1. **Contract dispatch:** an unknown arena kind fell through to static storage.
   Only explicit static-v3 and semantic-v5 contracts are now accepted; semantic
   shape validation is shared with the semantic owner.
2. **Value-domain correctness:** publication could coerce strings/null or clip
   invalid weaker bounds into valid W/D/L. Values are now validated before
   arithmetic and even before rejecting stale handles. Hints retain -1..6.
3. **Packed-record correctness:** readers/transforms silently decoded reserved
   bits, malformed bound codes and contradictory intervals. Complete records
   are validated before decoding or transformation, and single-bound transforms
   cannot construct contradictory intervals.
4. **Recoverability/concurrency:** replacement could finish after the writer's
   generation check but before its READY→PROOF_WRITING CAS. The stale writer
   correctly rejected its proof, but its old-generation guard prevented unlock
   of the new generation. The successful CAS owns the lock regardless of which
   generation won that race; `finally` now releases that acquired lock. No proof
   from the stale generation is published.
5. **CI routing:** record/domain/resource-owner changes did not consistently
   trigger replacement/dependency/exploration qualification. The affected paths
   and new contract controls are included in their bounded workflows.

### Evidence and intentional behavior

Five targeted controls on Node 26.7.0: four failed on the handed-off code,
all five pass after correction. The deterministic race schedules replacement
through public `tt.ensure()` at the pre-CAS boundary; production has no test hook.
Contradictory publication preserves the existing record and releases its lock.
The complete 4x5 replacement campaign and stale-generation adapter lifecycle
control also pass locally, retaining poisoned-install recovery and zero duplicate
descriptor-term ownership. CI evidence will be added after remote qualification.

Retained: old handles read unknown bounds and reject publication; descriptor
replacement cannot acquire PROOF_WRITING; poisoned descriptor slots stay
unavailable until globally quiescent reset; hints never strengthen bounds.
Rejected: silently coercing values, accepting look-alike unknown arenas,
restoring an obsolete generation, or using a full root as a race test.

### Remaining owners / root readiness

Continue TT shape/lifetime/counters/chunks/probes, semantic identity and scratch,
slot64 residual/state/support storage, exact engine, coordinator, worker and
Branch Manager lifecycle, root harness, and the complete bounded workflow import
graph. No all-lines-clean conclusion is made. Split depth 3, frontier-first hint
tie-breaking, separate proof ownership and authoritative root-proof timing are
already implemented in the handed-off source; the older descriptions above are
historical. ETC, priority probing, hash removal and large state tiers remain
performance hypotheses, not permission to weaken correctness. The revision
trigger remains untouched and no full root has been launched in this continuation.

## Semantic arena lifecycle continuation

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

Reviewed all lines of `quotient-semantic-shared-tt.mjs` and
`quotient-proof-resource-service.mjs`, and re-reviewed the semantic packed writer
against C4-0010 and the EMPTY / DESCRIPTOR_WRITING / READY / PROOF_WRITING /
POISONED lifecycle. Arena boundaries now reject aliased buffers and growable
buffers and snapshot transport metadata before attachment. Negative allocation
cursors/counters fail before they can alias already allocated storage. These are
value-domain and ownership defects, not changes to exact identity or replacement
policy.

Retained after review: bucket serialization; exact support and separate ordered
P0/P1 comparison after the hash filter; double generation/status checks around
optimistic reads; slot-owned linked extension chunks; checked Int32 allocation
and telemetry limits; Uint32 generations that never wrap; unpublished installs
becoming POISONED on any exception. Reset preserves generations and requires
global quiescence. Its slot/lock checks detect existing writers; the lifecycle
owner must also prevent new work during reset. Worker shutdown and reset callers
remain in the upcoming lifecycle review. Finite counters are explicit resource
limits, not permission to wrap or silently saturate.

Five additional adversarial controls cover malformed arena shape/metadata,
negative counters, generation exhaustion, failure **after** payload overwrite,
and a real two-worker proof-writer/replacement exclusion schedule. The last
control also rejects reset while the writer owns the slot and checks that old
proof does not leak into the replacement generation. Combined targeted controls:
10/10 pass on Node 26.7.0. The full bounded semantic replacement campaign passes
again with poisoned recovery, exact result, and zero hot descriptor-object or
term-array materialization regressions. No full root was used.

Remote qualification for packed-proof commit `0b4ec7024cd83cdbae09aeab63a3833e35a83870`:

- semantic replacement: run `34691457029`, success;
- dependency-aware exact Negamax: run `34691457027`, success;
- idle ExploreHint: run `34691457011`, success.

The new arena controls are wired into the semantic replacement workflow.
Next owners: semantic identity/materialization and residual/support/state
storage, then the remaining execution and qualification import graph. Root
readiness remains **blocked: all-lines review incomplete**.

## Residual/support storage and semantic projection continuation

Reviewed `quotient-slot64-residual-pool-v2.mjs`, the support/state pool and
slot64 kernel, `quotient-local-semantic-descriptor.mjs`,
`quotient-semantic-identity.mjs`, `quotient-local-proof-store.mjs`, and the
geometry/support-lattice and term-vocabulary construction they consume. The
legacy dense residual implementation in the vocabulary module is not selected
by the active slot64 path; the bounded baseline selects its prefix-pool owner.
The online adapter's arena attachment now uses the same sealed metadata contract
as its TT and packed-proof views.

C4-0001 geometry/gravity, C4-0006 exact residual requirements, and C4-0010
semantic/proof separation govern these lines. Four adversarial controls first
failed and now pass:

- Invalid support indices no longer decode as rank zero, and invalid columns
  fail before indexing. Packed and table access agree on the illegal child
  sentinel for a full column.
- State interning validates support and both class IDs before typed storage;
  edge access/publication validates addresses and target/sentinel domains.
  Hash growth has an explicit power-of-two ceiling before signed-index overflow.
- Residual cell and singleton masks reject values outside Uint32, instead of
  silently wrapping them into valid masks.
- State growth prepares all arrays before committing any replacement. A
  controlled second-allocation failure during real graph expansion preserves
  existing array identities/capacity and previously interned states. Class
  metadata and descriptor-cache growth follow the same prepare/commit rule.

Retained deliberately: exact tuple comparison after hash filtering, increasing
canonical term iteration, P0/P1 separation and lengths in identity, private
bounded descriptor scratch, slot-owned chunks with widening references, prefix
caches keyed by immutable class plus cell, subset normalization after ownership
reduction, blocker deletion preserving antichains, and no independent proof
arrays in the semantic state pool. Borrowed hot descriptors are synchronous
scratch and must not escape across the next descriptor operation; persistent
descriptor materialization remains explicit. Hash collisions cannot authorize
proof reuse without exact comparison. No no-hash candidate was adopted.

Local Node 26.7.0 qualification: four storage controls pass; complete slot64
campaign passes all class/state/edge comparisons on 4x3, 4x4, 5x3 and 4x5, with
independent BSFP root/action W/D/L; semantic replacement passes again with zero
hot descriptor-object and temporary term-array materialization. The 67,108,864
state tier still has real retained support/P0/P1/hash and hash-table costs;
correctness checks do not establish that its memory budget is adequate.

CI ownership review found missing transitive dependencies in all four bounded
lanes. Their push paths now cover their actual recursive local imports,
including worker URLs, geometry, support lattice, record/resource owners and
qualification baselines. The storage control is executed by the slot64 lane.
The standard-root revision trigger remains untouched.

Arena packet `6e670eb6497257cd2142a0216b368896898542f9` remote checks succeeded:
replacement `34691771486`, dependency-aware `34691771493`, ExploreHint
`34691771479`. Next: exact engine, frontier ordering, coordinator, worker/
Branch Manager lifecycle and complete harness controls. These remain open;
there is no readiness claim for a full root.

## Decision policy and live frontier continuation

Reviewed all lines of `quotient-negamax-engine.mjs`,
`quotient-negamax-domain-contract.mjs`, `quotient-live-line-move-order.mjs` and
`quotient-online-dependency-coordinator.mjs` against C4-0010 exact threshold,
proof interval, structural ordering and asynchronous ownership contracts.

Five failing controls now pass. Structural draw must intersect existing bounds;
it previously replaced a contradictory exact win/loss with zero. Both decision
adapters now reject transitions whose child rank is not exactly parent rank + 1,
preventing malformed forced cycles and frontier-stack drift. A rejected scout
with a null reason is now an error, never a numeric draw. Every sibling-group
exit retains unfinished scouts for drain, including failed re-search, validation
or group construction. Distinct overlapping typed views now copy frontier words
in the correct direction, and the shared cached profile's mutable masks no longer
escape through the diagnostics profile. The latter is an ordering/resource
ownership fix; these masks have no proof authority.

Retained: exact sign/window transforms through forced macros without publishing
unproved intermediate-chain records; ETC only from sound child upper bounds;
full first-child windows and sibling scouts with re-search on interior
improvement; classification against the original window; frontier score primary
with proof hints only breaking equal scores; immutable representative paths and
priority memo keys including decision-probe depth. Priority depth zero stays
unchanged. No CPC or NDC theorem was invented.

Local qualification passes: five decision/frontier adversarial controls,
semantic replacement, dependency campaign (workers 1/2, split 2/3), ExploreHint,
and complete slot64 campaign. The decision controls are executed in the
dependency workflow. Next owner is worker executor/pool/Branch Manager failure
handling; complete active graph qualification and root admission remain blocked.

## Worker, Branch Manager and root harness continuation

Reviewed the complete executor, online worker pool, semantic search worker,
Branch Manager worker, ExploreHint service/path, work-plan service/DAG, shared
graph builder, online-only storage observer and standard-root harness. C4-0010
owns their exact-result, lifecycle and resource contracts. Corrected:

- Dispatch exceptions now poison and release all pending tasks; synchronous
  abandonment/completion callbacks are observed side effects and cannot interrupt
  poisoning. Malformed authoritative W/D/L and mismatched explore IDs fail before
  worker reuse. Queued payloads are captured at submission.
- Path replies must match the dispatched planner state as well as task ID.
  Failed/terminated path pools reject reuse, and simultaneous batches cannot own
  the same workers. Early dispatch failure does not attach fresh peer listeners.
- Branch Manager health persists after startup, so requests after observed exit
  fail instead of waiting for a dead worker. Pool startup observes workers that
  fail after their own ready reply but before all peers are ready.
- Semantic workers reject unknown protocols and malformed task IDs, and retain
  poison after any task failure. A subsequent request cannot revive them.
- Reset tests now reject semantic nonquiescence before static proofs are cleared.
  Branch Manager reset/cleanup also releases retained work plans. Work DAGs check
  the graph kind, complete move permutation and rank-increasing edges; their
  retained layer array is frozen. Forced work-estimate arithmetic is checked.
- Root configuration has a pure bounded validation owner, rejecting timer
  overflow, transition-cache index overflow and malformed decimal environment
  values before allocation. The failure summary tolerates a coordinator that
  failed construction. Default split 3, workers 3, priority 0, threshold windows,
  expected win oracle and authoritative proof timing are unchanged.

Eight worker/plan controls pass, including real poisoned-worker protocol,
observed Branch Manager exit, and actual two-worker bounded plan reduction
against the independent BSFP oracle. The reset regression and pure root-config
control pass. Replacement, dependency-aware (workers 1/2, split 2/3), and
ExploreHint campaigns pass locally. Worker controls run in ExploreHint CI;
configuration controls run in dependency CI. No root was launched and the
revision trigger is unchanged.

Remote decision packet `592bfe71faac790d87eac8a54dffb62326966720` is green:
replacement `34692138245`, slot64 `34692138267`, dependency `34692138270`,
ExploreHint `34692138269`. Storage packet `508b33ae4274572aba9452d96b256a6f38fd25d7`
was also green in all four lanes (`34691997720`, `34691997744`, `34691997709`,
`34691997734`).

Remaining: finish qualification reference/campaign line review, reconcile every
active import against durable coverage, and re-review all repaired boundaries.
Global reset still requires the owner to stop new submissions and quiesce every
worker; checking current slot locks alone is not an admission barrier. Static
plan code is not a second production proof authority: the standard root uses
semantic-only Branch Manager mode and the generic dependency policy. No full
root readiness decision has yet been made.
