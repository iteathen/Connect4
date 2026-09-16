# Full-engine sanity audit — frontier-native exact forward solver

**Date:** 2026-09-12  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Purpose

### Continuation: native state-owner integration

The [integration record](2026-09-12-native-key-integration.md) audits the new
packed state owner, reader lifecycle, capacity selection and migrated field
consumers against C4-0006/0010. The first integration regressed; attributing that
to a mask was unsupported. Repeated validation and intermediate access work were
reduced. A new stale-reader defect across reservation was found and fixed with
stable reader methods, and invalid reservation values now fail before mutation.
Final local qualification passed 74 controls, six bounded campaigns and ten
provider controls. Final depth-8 counters match exactly, elapsed time is flat,
measured CPU is about 2% lower and state storage saves two MiB. Performance
attribution and larger-working-set measurement remain open; this does not complete
the full-engine audit or establish full-root readiness. Attribution and exact
source/evidence routing are in the linked record.

### Continuation: native relational lookup identity

The [two-word identity experiment](2026-09-12-native-relational-key.md) reviewed
the support-layout state pool, reservation widths, local consumers and shared
identity boundary under C4-0006/0010. It found no new exactness defect. An isolated
native pair layout reduced successful-lookup elapsed time by 18.0%; constructing
the pair on every query regressed. All 221,398 observed states preserved their
exact IDs, 26,144 width controls passed, and the normal depth-8 result and all
search/operation counters matched the qualified reference. Function timing,
failed line-sampling attribution and exited-child evidence are preserved. This is a representation experiment,
not a production speedup or completed owner audit. Duplicate packed/triple
production storage is rejected. The next integration owner is local state
storage plus its field consumers; shared TT identity remains exact content.
Research direction / architecture: Josh Oshiro. Implementation / qualification:
OpenAI ChatGPT.

**Continuation status:** active-path audit complete for source revision
`9c778bcaf010372ca2a3a91a7cdcec8debf5518f`; one integrated root measurement
admitted. Earlier findings and intermediate readiness states below are historical.
Current completion coverage, qualification and measurement outcome are recorded
at the end.

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

## Qualification reference and teardown review

Reviewed every line of the replacement, dependency-aware, ExploreHint, slot64
and generation-lifecycle campaigns, the prefix-term comparison pool/kernel, and
the independent ownership-antichain oracle. Oracle union/intersection and
terminal subtraction remain P0-relative; exact Negamax signs remain mover-relative.
The graph comparison validates every bounded class, state and edge; the oracle
checks root and actions independently of residual normalization.

Removed a duplicate local proof-store construction in the comparison kernel:
the wrapper and kernel now expose the substrate's one proof owner. Prefix
baseline boundaries reject invalid class/cell/mask/term domains, check capacity
ceilings and prepare class arrays before committing growth. Both vocabulary
builders reject a line length that would overflow Uint16 term/sentinel space
before subset bit shifts. The independent comparison vocabulary algorithm is
retained as a qualification reference, not production semantic authority.

The slot64 campaign now imports sentinels from their domain owner, eliminating
an incidental import of the unused legacy recursive kernel. That legacy engine
is not an active qualification dependency and has not been promoted.

Several campaign `finally` blocks stopped at the first drain failure, skipping
worker and Branch Manager termination. A shared session teardown now attempts
every owned cleanup/termination and reports aggregated failures. The standard
root consumes that same lifecycle owner; authoritative proof time is unchanged.
A control forces stop, drain and close failures and confirms all terminations
still happen. All affected local campaigns pass again. Baseline adversarial
controls and the complete slot64 graph/oracle campaign pass.

Worker packet `dbc6fcf05fb2e753078cc2e8dc445b1bdad73f0e` remote checks succeeded:
replacement `34692479054`, ExploreHint `34692479027`, dependency `34692479021`.
Final review is checking explicit arena/domain binding, coverage inventory and
failure paths around initialization before a root-readiness decision.

## Final boundary review: arena domain and current generation

Exact residual term IDs are vocabulary-relative. Previously the semantic
adapter/worker attachment accepted an arena created for a different geometry,
so support and term-ID equality lacked an enforced domain premise. Arena creation
now captures a frozen `domainSpec`; Branch Manager supplies its owned geometry,
and game adapters/worker startup require an exact match. Raw synthetic descriptor
lifecycle controls may remain unbound, but an unbound arena cannot be attached to
a game adapter. This adds explicit namespace ownership without changing slot
layout, exact descriptor bytes or the v5 replacement policy. Cross-geometry and
unbound attachment controls fail closed; the correctly bound lifecycle control
still refreshes stable proof keys after replacement.

`isCurrent` now rechecks generation after observing status. An interleaving
control replaces the descriptor between those observations and verifies the old
handle is rejected. Root rank zero is validated on policy construction, and
ExploreHint campaign initialization is inside its teardown scope. The root
workflow has one concurrency group with cancellation disabled; the explicit
revision trigger is still untouched.

All affected bounded campaigns pass locally again, including complete slot64,
replacement, dependency-aware and ExploreHint. The final targeted suite covers
33 controls. No production/qualification source remains unread in the selected
active import closure; source/hash coverage reconciliation and exact-revision
remote qualification are the remaining admission gates. This statement does not
promote unused historical implementations or establish standard-root performance.

## Completion review and standard-root admission

The active-path correctness/compliance pass is complete for source revision
`9c778bcaf010372ca2a3a91a7cdcec8debf5518f`. The accompanying
[`2026-09-12-frontier-audit-coverage.json`](2026-09-12-frontier-audit-coverage.json)
enumerates **44 source files / 10,780 lines and five workflows**, their complete
reviewed ranges, exact Git blob identities and recursive local dependencies.
It includes worker URLs, all six adversarial control suites and the bounded
reference implementations. All findings and fixes are classified in the
continuation sections above; earlier dispositions are retained historical evidence.

Exact-revision remote qualification is green:

| Lane | Run | Result |
| --- | --- | --- |
| Semantic replacement, stale generations and arena lifecycle | [34692987151](https://github.com/iteathen/Connect4/actions/runs/34692987151) | success |
| Dependency-aware exact policy, decision controls and root configuration | [34692987161](https://github.com/iteathen/Connect4/actions/runs/34692987161) | success |
| ExploreHint, worker lifecycle/protocol and bounded work plans | [34692987156](https://github.com/iteathen/Connect4/actions/runs/34692987156) | success |
| Complete bounded slot64 graph, residual storage controls and independent oracle | [34692987155](https://github.com/iteathen/Connect4/actions/runs/34692987155) | success |

Local Node 26.7.0 targeted suite: **33 passed, zero failed/skipped**. Complete
replacement, stale-generation lifecycle, dependency, exploration and slot64
campaigns also pass. No correctness result is inferred from a workflow that did
not execute. Final remote main remains `15b8e62de07f2b35a74ea2297fda79b72633bf64`;
this audit has not mutated protected main or any other solver/research lane.

The clean decision rests on explicit domain-bound exact semantic identity,
checked monotone proof intervals, generation-safe publication and observation,
transactional descriptor/state growth failure, one visible proof owner per
adapter, rank-increasing exact transitions, advisory-only hints, owned detached
work and fail-closed worker/protocol cleanup. Structural premises remain exactly
those admitted by C4-0006/C4-0007; no new CPC/WSL/NDC implication is assumed.
This is reviewed implementation plus bounded/adversarial evidence, not a formal
enumeration of all standard-board states.

**Readiness: admit one standard 7x6 integrated measurement.** No unresolved
correctness/lifecycle violation was found in the final selected import-graph
review. Global arena reset requires stopped submissions and quiescent workers;
all maintained campaign reset sites satisfy that ordering. Explicit finite
arena/counter exhaustion remains an allowed failing resource outcome, never a
valid proof. The root workflow was checked to have no active run before admission
and now enforces a single concurrency group. Documentation and coverage are
committed before changing the sole revision trigger.

Performance remains unproven: large worker-local state tiers, retained state
hash versus recomputation, checked growth peak memory, TT replacement pressure,
ETC and priority-probe cost are hypotheses for a later evidence-led pass. Default
split 3, three workers, priority depth 0, ETC disabled and current TT capacities
remain unchanged. A root resource failure must be recorded as such; this audit
does not claim that previous 15.7 GB failures have been solved by assumption.

## Follow-up: research methods and local execution

The user requested a methods review while the single hosted root was active.
The [methods review](2026-09-12-negamax-methods-local-review.md) reconciles the
canonical research head, actual enabled methods, native versus precompiled
evidence and missing complete strategic closure. A local shallow profile took
18.1714 ms through depth 4. A bounded actual-coordinator diagnostic proved only
one initial authoritative leaf task is ready at split 3; with exploration off,
other workers initially idle. This is an established initial scheduling condition,
not a wrong-result defect or proof of its eventual performance impact. It sharpens
the next performance owner without changing the qualified source. No duplicate
full root was launched.

## Follow-up: evaluation, terminals and hot-loop operations

The [hot-loop report](2026-09-12-hot-loop-eval-terminal-report.md) traces move
value, exact residual terminalization and every active deep-loop transformation.
It identifies repeated generation/packed-record reads, term scratch copying,
prefix-limited transition caching, tuple/object/closure/string constructions and
interner growth as performance costs. Zero descriptor-allocation counters do not
measure those other temporary constructions. This source-level report changes no
qualified engine behavior and makes no unmeasured CPU cost ranking.

## Follow-up: search volume and structural closure

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

The [structural reassessment](2026-09-12-search-volume-structural-review.md)
records primary published solve counts, the integrated root's 30-minute timeout,
and the source-confirmed omission of active tasks from workerExpanded. Its
171,561,248 completed-task expansions are not total Negamax invocations.
The common WSL blocker coverage invariant is distinct from the complete CPC/NDC
certificate construction needed to feed it. The active engine implements local
closure, not that complete strategic construction. Physical terminal tests do
not qualify completeness of future terminalization. Next owner is bounded
structural coverage and repeated proof work, before further throughput tuning.
No new root or semantic mutation accompanied this reassessment.

## Follow-up implementation: guarded response closure

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

The [response profile](2026-09-12-incremental-response-closure.md) records the
assess/research/reassess/plan/execute/qualify/review cycle and exact proof premises.
Reviewed owners: packed/table support guard, canonical chunk coverage query,
compiled response profile, frontier-bound integration and memory accounting,
Negamax public draw representation, independent physical oracle and standard
hostile-response controls, proof-reuse observer and all affected CI import paths.
Forty local contract controls pass alongside bounded worker/storage campaigns.

The preserved hot-path packet changes the proof port to one coherent read into
reusable non-narrowing scratch; removes temporary tuples, handle/victim objects
and publication closures; and permits a sound nonblocking atomic byte read during
same-generation proof writing. It preserves descriptor exclusion, generation
checks and poisoned-slot recovery. Eval policy is unchanged. Tests separately
exercise eval ordering, exact publications, side-dependent windows and physical
terminal truth. The original 9c778b audit snapshot remains historical; it does
not authorize a new root for this changed implementation.

Remaining: richer conditional response/deadline closure, proof retention under
measured useful-window demand, asynchronous reporting and write contention.
The first response profile is not a complete NDC implementation. No new root
was launched and the revision trigger remains unchanged.

## CPC address-parity reassessment

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

The owner corrected the implementation direction: the relational structure is
intended to eliminate work and reduce the control calculation to XOR and the low
bit. Expanding a catalog of response policies before deriving this mapping is
not an implementation of that instruction. Earlier conversational assurances
that the complete intended fix was understood were premature.

Assessment used research head `f6db7253c8898e6e870b027f42683de51197a57c` and
verified protected main `15b8e62de07f2b35a74ea2297fda79b72633bf64`. Both remote
heads matched the expected state. No production source or root trigger changed
in this reassessment.

Research and reviewed surfaces: C4-0001/0006/0007/0010; the owner searchless
findings, universal strategic algebra and nested-dependency notes; original
`Board.findZugzwang` and `virtualBoard._computeThreatFlags` in the preserved
legacy ZIP; support-lattice radix/weights; packed support descriptor and rank
access; slot64 residual coverage; paired-response profile and frontier-bound
consumer. Original source compares outside-column parity with support-to-target
parity. It also explicitly describes the condition of avoiding the threat column
while blocking opposing threats. The current adjacent-pair profile uses a
different, restricted response policy. Neither the old heuristic flags nor this
restricted profile establish the complete requested terminal mapping.

### Derived arithmetic

The owner explicitly reaffirmed variable board dimensions during this unit.
Every proposed runtime formula must derive from geometry. Standard 7x6 is one
qualification profile, not a hardcoded product contract. Geometry-dependent
reductions must be selected at profile construction, with their algebraic domain
established; no added per-node geometry guard is needed to select a fixed profile.

Let `s = sum(height[c] * (H+1)^c)` be the existing support index, and let
`a = c*H+r` be a column-major target address. For even `H`, every support weight
is odd, so `s & 1 = ply & 1`; also `a & 1 = r & 1`. Since `(W-1)*H` is even:

```text
baseRelativeControl = (s ^ a) & 1
                    = (N(t)-1) mod 2
```

This is a derived representation identity, not a replacement state arena. The
active cell ID is row-major (`r*W+c`), so its low bit must not silently be used
as column-major address parity. For odd widths, `rowMajorCell ^ column` has row
parity in its low bit. A compiled geometry-dependent target phase can avoid
coordinate reconstruction without changing residual identity. No such unused
production API or new per-state storage was added here.

For general geometry the reduced phase is
`(((W-1)*H) ^ ply ^ r) & 1`. For a *specified* reservoir adjustment `Delta`, XOR
with `Delta` changes the low bit correctly. The qualification of this arithmetic
does not certify any particular reservoir selection or strategic consequence.
Odd-height geometries do not in general support the same `s ^ a` shortcut.

### Qualification and remaining seam

`quotient-control-parity-derivation.test.mjs` independently enumerates physical
events through each target and compares their count with the XOR forms, using
an odometer to enumerate support heights and the production support port to
verify actual index/rank correspondence. It passed locally on Node 26.7.0:

| Geometry | Support configurations | Remaining targets |
|---|---:|---:|
| 1x4 connect-3 | 5 | 10 |
| 2x5 connect-4 | 36 | 180 |
| 3x4 connect-3 | 125 | 750 |
| 4x3 connect-3 | 256 | 1,536 |
| 4x4 connect-4 | 625 | 5,000 |
| 4x5 connect-4 | 1,296 | 12,960 |
| 5x3 connect-3 | 1,024 | 7,680 |
| 6x4 connect-4 | 15,625 | 187,500 |
| 7x5 connect-4 | 279,936 | 4,898,880 |
| 7x6 connect-4 | 823,543 | 17,294,403 |
| Total | 1,122,471 | 22,408,899 |

All base and bounded positive/negative Delta arithmetic comparisons passed.
Odd-height controls detect the invalid address shortcut. These are support
configurations, not an exhaustive census of legal colored standard positions.

A second independent physical control locates the interpretation boundary:
4x3 connect-3 paths `122442` and `124224` (one-based columns) both have heights
`[1,3,0,2]`, P0 to move, and an unplayable P0 singleton target at column 3,
zero-based row 1. Outside count is 3 and through-target count is 2 in both.
Their base relative-control bit is 0, but exhaustive physical WDL is respectively
loss and win. Their residual contexts differ. This is **not a falsifier of the
owner's full relational mapping**; it demonstrates why replacing that mapping
with the base bit alone would lose necessary information.

Both controls pass (2 passed, 0 failed/skipped). The slot64 bounded workflow
routes and executes the new test; existing imported production dependencies are
already in that workflow's path coverage. Existing production qualification
evidence remains attached to its original source, not relabeled as a completed
CPC replacement.

Reassessment: the address-level arithmetic is established. The exact mapping
that makes the control relation sufficient for terminal publication has not yet
been recovered from source/research. Clarification requested from the owner is
the file or definition encoding that relation. Preserve qualified production
behavior while resolving this seam. Do not add a general constraint engine,
another response-policy guard, or unconditional low-bit pruning to fill the gap.
Eval remains unchanged; no full root is admitted.

Additional preservation check: the canonical minimax lane's incumbent-v8 packet,
organic consolidation and winspace XOR/count-plane research were inspected as
evidence without importing their solver. The historical single-threat ZPAR
staging prototype is a fixed-7x6 classified differential experiment, explicitly
without pruning authority; it is not the requested variable-board mapping and
was not adopted. The recovered winspace XOR is an address reduction for the last
missing event, not by itself a proof of that event's controller.

## Original-source structural study

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

The owner redirected the work toward useful structural reductions, including
imperfect but working ideas in the original 2025 source. Full terminal mapping
is no longer treated as a prerequisite for every smaller improvement.
The [source study](2026-09-12-original-engine-structural-lessons.md) records the
actual original call paths, reuse of incident-line relationships, apply/undo
state lifetime, and a qualified projection of the original parity flags onto
canonical singleton masks. All four archived files were hash-verified and read;
the later evaluator was executed unchanged across six dimension profiles.
13,724 flag and 65,328 slot comparisons passed. No production eval policy changed.
The prototype is not yet a performance recommendation: the active solver does
not compute these flags. Further work should measure relevant existing work
eliminated by representation, including transient versus retained state cost.

## Derived state-hash retention review

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

The [retention review](2026-09-12-state-retention-review.md) audits the state
pool's constructor, growth, rehash, exact interning and byte accounting against
C4-0010, plus its online-storage consumer and storage qualification. Removing
the derived hash cache saves four bytes per capacity slot. This is a resource
representation change, not a correctness defect or duplicate proof authority.
Exact IDs, full hash-table placement, WDL and search work match the immutable
baseline. Allocation failure remains transactional; edge-cache and online modes
both survive repeated growth. Eight storage controls, 33 other contract controls
and seven local bounded campaigns pass. Workflow routing was checked and extended
for the new harness and online-storage dependency.

The old nohash monkey patch was rejected because it targets obsolete storage
ownership. Isolated timing does not show a speedup (−1.9% to +2.4%); mixed-module
timing is retained as a diagnostic. The bounded memory saving is accepted with
this explicit CPU limitation. No eval/parity policy or standard-root trigger
changed. Remaining owners are unnecessary terminal projection work and the
unresolved structural-closure/repeated-proof cost, not a claim that fewer stored
bytes has solved the search-volume problem.

## Immediate-terminal projection short-circuit

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

Reviewed every line of the support-layout kernel's `tacticalCode` again under
C4-0001/C4-0006/C4-0010. Once the mover's playable singleton is found, its result
and first-winning-column tie are fixed. The function unnecessarily continued
scanning opponent threats. Return at that existing exact test and remove the
deferred immediate-result variable. Opponent double threats still require the
complete scan because a later mover immediate win must override them.

This is redundant hot-path work, not a discovered WDL or parity defect. The
[follow-up report](2026-09-12-state-retention-review.md#follow-up-stop-work-at-an-exact-immediate-terminal)
records six passing local campaigns after the change. Independent terminal
coverage includes 401,165 immediate wins and 14,634 simultaneous multiple-threat
cases, with zero mismatches. No throughput claim is inferred from those counts.
Workflow routing already covers this source; prior evidence remains associated
with its original revisions. No full root was run or triggered. Next owner:
structural closure coverage and repeated proof work, with the original source's
relation reuse as evidence and no unproved parity terminalization substituted.

Branch Manager follow-up: current component campaigns pass, but the root disables
exploration and does not wire the executor's hint subscription/completion path.
A fresh held-leaf diagnostic at `3ebceedd7ecfce9fdbfbc3c0988e636b83b44187`
reconfirms one initially released proof task, zero scouts and zero parallel
batches. The [methods review](2026-09-12-negamax-methods-local-review.md) records
the integration/configuration limitation and distinguishes useful proof progress
from structural exploration. No full solve was launched to answer this question.

## Relational identity and duplicate-work reassessment

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

The [relational review](2026-09-12-relational-duplication-review.md) traces the
actual worker/kernel/descriptor path under C4-0006/C4-0010 and the DEAD/MQ2 research.
There is no coloured-bitboard substitution in that active path. Bilateral
exhaustion closes filler continuations, but the exact support coordinate still
distinguishes distributions of wholly neutral capacity. A research-only census
checks mapped-successor equality and unpruned WDL for pooled neutral columns
across four complete bounded quotient graphs. It merges 4,431 additional 4x5
states, including 1,727 unresolved states; the observed root visits additional
equivalent physical choices. This is not yet a production compression or a claim
that it explains full-root volume. Actual turn capacity remains in the relation.

The existing proof-reuse observer also demonstrates extra calls/expansions under
TT replacement pressure while preserving one-call warm exact-root reuse.
Independent pruning controls remain green; missing stronger closure is a
different finding from broken implemented pruning. Evidence and the diagnostic
adapter correction are recorded in the report. No production identity or root
trigger changed. Next owners are incremental neutral-event equivalence and
concurrent/eviction-driven repeated proof work, with physical addresses kept as
input/output mapping rather than restored historical proof authority.

## Current per-method CPU assessment

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

The [method ledger](2026-09-12-hot-method-cpu-assessment.md) revisits the current
deep policy, online adapter, descriptor/hash, semantic TT, packed record,
support/state, residual, evaluator/response and shallow task/reporting methods.
It separates compact primitives, remaining transformations, synchronization,
setup and inactive historical code. The old allocation/read findings are not
repeated as current defects. No production code changed in this assessment.

Twenty-four local profiled bounded searches across three cases returned the
expected WDL with stable call counts. The 4x6 profile has 3,395 samples; term
writing/counting, residual misses and exact descriptor installation are material
costs, while direct eval is about 0.53% inclusive in this bounded case. Metadata
reuse removes allocation but still performs 241,118 direct term writes and
283,768 term-count reads per 123,525-call solve. These counts and raw profiles
are preserved. The single-thread samples contain no contention and do not rank
full-root costs or prove JIT minimality.

Remaining decisions prioritize eliminated relational distinctions/conversions,
canonical metadata ownership, repeated adapter binding/coordinate validation,
contention/coalescing measurement and asynchronous reporting. Synchronous TT
writer waits remain; timer-based JSON formatting is still synchronous on the
coordinator. No full root or trigger change was made.

## Requested depth-8 normal Negamax test

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

The initial frontier census did not exercise Negamax pruning and was the wrong
test for the owner's request. The normal synchronous policy lacked a bounded
entry point. `searchBounded` now runs that same policy with an expansion horizon;
unresolved leaves return no WDL and cannot create an exact/upper publication.
Known lower proofs and valid cutoffs remain usable. Forced chains respect the
horizon. Twelve decision-contract controls pass, including four new bounded
controls. This is local working-tree work; full integration remains pending.

One empty-board 7-column, 6-row, depth-8 run completed in 10040.0977 ms plus
35.944 ms setup, under an external 60000 ms child-process kill timer. It made
4,777,115 calls, expanded 672,690 decisions, performed 2,424 cutoffs, reused
10,058 exact TT proofs and closed 1,859 tactical cases. There were 4,014,763
unresolved horizon visits and 221,398 unique local states. Root WDL remains
unknown. This was one cold run, not a paired speedup measurement. No test process
remained. [Exact output and source record](evidence/2026-09-12-normal-negamax-depth8/result.json).

### Same-bounds operation timing

One cold run of that same bounded entry point was sampled with Node Inspector,
after initialization and before reporting, with the same 60-second child timeout.
The search took 10861.8871 ms (10797 ms process CPU) and produced 6,831 samples.
The requested interval was 1000 microseconds; actual sample deltas were retained.
Every result/search/proof/descriptor counter matches the prior unprofiled run.
No engine or policy changes were made for profiling; the harness gained an
optional `--cpu-profile` output. No task process remained after completion.

The [154-row operation table](evidence/2026-09-12-normal-negamax-depth8-profile/operations.md)
and raw `.cpuprofile` preserve self/inclusive aggregate estimates and sample
counts. Residual own transitions took about 4143 ms inclusive, blocking 1809 ms,
and class interning 2528 ms; these nested totals overlap. Eval sampled about
54 ms inclusive. The observed profiled wall time exceeds the prior run by about
8.2%, which is not a separately established profiler-overhead estimate. This is
one run, with JIT/sampling/host effects; unsampled operations are not proven free.
The profile measures the bounded search, not standard-root solve performance.

The same raw profile also supplies V8 `positionTicks`. The report now links each
function to its definition and adds a [line-level source map](evidence/2026-09-12-normal-negamax-depth8-profile/operations-lines.md)
with code excerpts and aggregated position ticks inside each function. No search
rerun was needed. These ticks identify sampled locations/call sites; no exact
per-line elapsed time is inferred from them. JIT/inlining attribution remains
explicit, and both distinct `intern` owners are identified by file and line.

### Eliminate the mover input copy

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

Reviewed the mover/block transition and private-cache paths in
`quotient-slot64-residual-pool-v2.mjs` against C4-0006 residual semantics and
C4-0010 canonical identity. Both transitions can read immutable canonical
chunks directly until the later normalization/intern phase. Removed the mover's
whole-class input copy, scratch, unused copy helpers and repeated private-cache
input checks. Public validation and exact transition/normalization semantics
remain. This is an unnecessary-operation removal, not a new pruning rule.

All 23 storage/decision controls and four bounded qualification campaigns passed.
The isolated normal depth-8 run retained every search/proof counter and took
10059.9007 ms versus 10040.0977 ms; no speedup is established. No full root was
run. [Report and evidence](2026-09-12-direct-residual-read.md) record the cycle,
rejected shortcuts and next owner: established class/event transition reuse.
Broader working-tree integration remains pending.

The earlier profile's source links use historical line coordinates. Subsequent
edits can shift live lines; its retained code excerpts and source patch identify
the profiled operations without rewriting the original measurement.

### CPU estimates mapped to frozen source lines

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The new local `quotient-bounded-line-profile.mjs` diagnostic wrapper supplies
per-line CPU estimates alongside raw V8 position ticks, function names, code
excerpts and frozen source links/hashes. It corrects missing line-time presentation
and mutable source references. The [measurement report](2026-09-12-line-cpu-profiling.md)
records the estimator and its limits; exact per-line timestamps are not claimed.
The unchanged normal depth-8 search took 10763.457 ms / 10688 ms process CPU,
with 537 mapped locations and every search/proof counter matching baseline.
Source stability and tick conservation checks passed; no test process remained.
No engine authority or full-root trigger changed. The next owner is matched
before/after attribution and class/event reuse.

### First four ranked hot-loop locations

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The [ranked optimization report](2026-09-12-ranked-hot-loop-optimization.md)
records three reviewed invariants: exact Uint32 chunk-pair ownership, populated
TT bucket prefixes, and absence of playable singletons when both canonical
singleton masks are empty. The corresponding changes eliminate repeated checked
comparison calls, empty-tail TT probes and unproductive terminal column scans.
Full exact equality/generation checks, terminal meaning, eval and proof work remain.

Forty controls and five bounded campaigns passed, including the independent
1,716,141-position terminal oracle. Four alternating cold depth-8 runs measured
10159.8666 ms baseline mean versus 8268.8739 ms candidate (18.61% elapsed reduction;
18.58% CPU reduction). Search/proof counters and retained memory match; maximum
bucket scan telemetry deliberately changes from 8 to 5. Raw profiles and source
snapshots map estimates to every sampled source location. Moved comparison cost
is explicitly distinguished from removed work. No full root was run; remaining
ranked costs and broader integration are not declared complete.

### Initialization-owned storage reservation

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The [reservation report](2026-09-12-preallocated-search-storage.md) records changes
to state/residual owners, slot64 composition, descriptor cache, shared TT scratch,
online port/worker setup and the standalone local proof store. Storage is reserved
before search and then sealed. Exhaustion fails explicitly; published IDs remain
valid. Online workers retain no duplicate local proof arrays. Local proof reset
preserves its reservation.

53 controls and affected bounded campaigns passed, including allocation traps,
three capacity-exhaustion boundaries and local reset/re-solve. Depth-8 reports
prove unchanged growth counters and identical search/proof work. The four-run
comparison measured 8117.6739 ms before versus 8280.96775 ms after; no speedup is
claimed. The kernel reservation increased from 32,685,831 to 84,483,847 bytes.
Full-root sizing remains unresolved and its trigger is unchanged. Remaining
interner work and reservation locality are the next owners.

### Direct semantic edges eliminate repeated interning

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The [direct-edge report](2026-09-12-direct-semantic-edge-reuse.md) records enabling
the existing exact `(local semantic state ID, column)` table in the bounded
runner, online workers and standard-root coordinator. The table stores only
transition results, not proof generations, WDL/window authority or advisory
frontier state. It is preallocated and remains with its semantic state owner.

4,355,811 of 4,777,114 transition requests reused direct entries, bypassing
residual computation and its chunk/class/state lookups. The unchanged bounded
search/proof work took 8396.88595 ms baseline mean versus 2219.51305 ms candidate
over four alternating cold runs. Storage grew by a reserved 7 MiB before search;
there was no in-search growth. 54 controls and four bounded campaigns passed,
including cached/uncached transition and interner-bypass checks. Full-root trigger
and proof semantics are unchanged. Remaining shared-TT probes and first-time
transition interning remain on the ranked inventory.

### Ranked probe/frontier operation refinement

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The [ranked refinement](2026-09-12-ranked-probe-refinement.md) audits the shared TT
candidate-read sequence, slot64 chunk interner/singleton query and live-line
advance operation against C4-0006/C4-0010. Hash mismatches skip generation reads;
exact matching stays protected by generation/status observations. Empty chunk
IDs bypass hashing, singleton intersection drops redundant unsigned conversions,
and disjoint frontier frames combine copy/cancellation into one write per word.
Overlapping external views retain their tested semantics. No proof, terminal or
eval policy changes, duplicate semantic payloads or hot-loop allocations added.

57 contract controls and eight local campaigns/controls passed, including
replacement between hash filtering and generation acquisition, empty-ID reuse
after dictionary growth, multiple frontier geometries/view layouts, independent
terminal detection and pruning. Four alternating cold depth-8 runs measured
2155.39945 ms baseline versus 2080.63725 ms candidate. Variation prevents a robust
speedup claim. Search/proof counters and reserved typed bytes match; growth is
zero. The profile and complete unit hashes/patch are linked from the report.

Retained deliberately: shared atomic publication observation, exact collision
comparison, public hash-target validation and first-time nonempty interning.
Remaining work includes an initialization-owned semantic hash target and bounded
assessment of composed descriptor reuse; the entire hot loop is not claimed
fully optimized. No full-root trigger or integration state was changed.

### Composed semantic hash reuse

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The [state-hash report](2026-09-12-state-hash-reuse.md) records the descriptor
cache, executor resource telemetry, storage contract test, replacement campaign
and lifecycle control changes. C4-0010 semantic/proof separation and append-only
local state identity justify reusing composed hash words for a kernel lifetime.
Two reserved Uint32 arrays plus one readiness bitmap remain descriptor metadata;
no terms, descriptors or generation-bearing proof records are duplicated.
Cached words do not replace exact shared descriptor comparison. Two redundant
length writes were removed. No hot allocation or hash algorithm change is retained.

The first owned-writer candidate passed controls but ran slower; it was removed
and its exact patch/results retained. The selected direct hash reuse eliminated
4,560,000 of 4,781,398 computations. Four alternating depth-8 runs measured
2032.36945 ms baseline versus 1838.4439 ms candidate, with unchanged search/proof
work. Metadata adds 2,129,920 bytes at capacity 262,144; no storage grows in search.

58 controls and six campaigns/controls passed. Replacement initially failed the
old class-only memory assertion; executor telemetry and exact byte-accounting
assertions were updated to include state-hash metadata, retaining zero duplicate
term/descriptor requirements. The nine worker controls passed again afterward.
New controls exercise repeated visits, bitmap boundaries, invalid IDs and shared
reset/new proof generations with unchanged local semantic hashes.

Current source profile and provenance are linked in the report. Next owner is
nonempty chunk interning. Per-worker metadata scales with reserved capacity;
full-root sizing remains unqualified, and its trigger was untouched.

### Chunk transformation memoization and cheaper address filtering

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The [chunk lookup report](2026-09-12-chunk-lookup-experiments.md) records the
C4-0006 blocking invariant: parent chunk plus exact blocking mask determines
result chunk and removed count, independently of the surrounding residual class.
Two cache layouts compiled equal masks and avoided 490,290 intern calls, but
measured 3.50% and 1.53% slower while adding 6.19 MiB. Both were removed after
controls and bounded measurement; exact patches remain evidence. Mover
normalization was never given this reduced key.

The retained source change is only the chunk address filter: three multiplications
instead of eight, with unchanged exact two-word comparison. The adversarial
storage test deliberately forces 400 different keys into the same hash, including
high-bit words and dictionary rehash. All 59 controls and four affected local
campaigns pass. Four-run depth-8 means were 1950.0365 ms before and 1929.0560 ms
after; this is within observed variation, not a reliable speedup claim. Memory,
search/proof counters and storage growth remain unchanged. The new line profile,
unit provenance and candidate dispositions are linked from the report.

Next owner: actual chunk probe distribution and memory-access cost. No active
cache alternative, new proof authority or root trigger change remains.

### Exact chunk probe distribution

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The [probe diagnostic](2026-09-12-chunk-probe-distribution.md) instruments an
isolated copy of the normal depth-8 search after initialization. It observes
2,724,741 hashed lookups, 2,888,962 index reads and 164,221 rejected collisions:
1.06027 slots per lookup, 94.754% one-slot lookups, maximum 10. Exact candidate
reads remain 2,728,231. Long chains are not the primary lookup mechanism here.

All result/search/proof/descriptor counters and engine memory/growth match the
uninstrumented baseline. Diagnostic timing is not performance evidence. The
40 MiB chunk reservation produced 4.690 MiB of distinct read-address blocks at
64-byte granularity; this does not measure cache misses, latency or residency.
No production engine edit follows solely from those footprint counts.

Source hashes prove production files are unchanged. Isolated instrumentation,
raw result, summarizer and per-dictionary evidence are retained until integration;
all children exited. Next owner is initial index/dependent exact-key access
locality, with explicit capacity contracts. No full-root trigger changed.

### Compact chunk index with stable canonical IDs

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The [compact index report](2026-09-12-compact-chunk-index.md) records review of
`quotient-slot64-residual-pool-v2.mjs` and its storage contract controls against
C4-0006/0010 exact identity and resource ownership. Smaller bucket heads plus
private, preallocated collision links replace open addressing. Exact canonical
word pairs remain stored once; IDs remain stable across rehash. No per-query
allocation, reduced capacity or new proof authority was introduced.

Allocation precedes publication of grown payload/link arrays. Rehash allocates
heads before rebuilding links. The initial narrow control exposed exhaustion
ordering and an obsolete index-size assertion; both were corrected before final
qualification. Final source passed 60 controls and four campaigns, including
forced collisions, full-capacity insertion, allocation failure and recovery.

Four alternating normal empty 7-column by 6-row depth-8 runs, each with a hard
60-second timeout, measured 1918.67885 ms baseline versus 1928.15615 ms candidate.
CPU means were 2070 versus 2062.5 ms. Search/proof/descriptor counters match and
storage does not grow during search. This is not a demonstrated speedup. The
retained benefit is 5,242,880 fewer typed bytes per kernel/worker at the current
reservation: chunk dictionaries use 35 MiB instead of 40 MiB at the same capacity.

Final source hashes, patch, campaign logs, comparisons and frozen-source line CPU
profile are linked from the report. Capacity reduction and duplicate key storage
were rejected. Next owner is shared TT probe overhead and compact-index behavior
at larger loads; full-root throughput and sizing remain unqualified. Status,
next-step and research index are updated. The full-root trigger remains untouched.

### Relational positions as lookup addresses

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The [address investigation](2026-09-12-relational-address-investigation.md) traces
vocabulary, slot64 chunk/class ownership, support/state identity, descriptor and
shared-TT consumers against C4-0006/0010. Positions already encode exact term
meaning; the remaining chunk lookup discovers a canonical ID for a new content
mask. Known IDs, unchanged chunks and cached state edges already avoid hashing.

Post-search analysis of a normal depth-8 run found exact counter/memory agreement
and unchanged source hashes across 19 dependency files. Same-slot content and
same-support state witnesses reject those incomplete keys. Folded-word XOR has
actual collisions; aligned full-word equality remains exact. Two explicit radix
layouts were costed, not installed or benchmarked. Their storage/read costs do
not establish a benefit or rule out other structural indexing designs.

No engine defect or correction is claimed in this unit. The next candidate is
reusing the parent class fingerprint while processing changed slots, replacing
the current second tuple traversal with a separately qualified XOR composition.
This must preserve slot meaning and exact tuple confirmation, and must not turn
worker-local IDs into shared proof identity. First-descriptor term traversal is
a separate possible owner. No full-root, lifecycle, workflow or ref change occurred.

### Changed-slot class fingerprint

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The [changed-slot report](2026-09-12-changed-slot-class-hash.md) records removal of
the second tuple-hashing pass in `quotient-slot64-residual-pool-v2.mjs`. Bootstrap
composes slot-dependent contributions during construction; children update the
existing parent hash only at changed slots. Exact tuple comparison, stable IDs,
resource ownership and shared semantic identity remain unchanged under C4-0006/0010.
No retained storage or hot allocation is added. The old tuple-hash helper is removed.

The storage contract test adds different-order/idempotent blocker controls with
independent term filtering and deliberately all-zero address filters. All 61
controls and four affected local campaigns passed. An isolated owner assertion
compared 842,426 delta hashes against full recomputation; all matched. Contribution
evaluations fell from 8,424,260 to 5,749,172, without changing search/proof work.

Four alternating cold depth-8 runs measured 1940.4546 ms baseline versus
1865.14285 ms candidate, with identical counters/memory and no search storage
growth. The observed 3.88% elapsed reduction is limited by the small batch and
baseline variation. Final frozen-source profile, exact patch and source hashes
are linked in the report. Next measured owners are shared-TT probing and chunk
bucket reads. All children exited; docs are current. Full-root readiness and
trigger remain unchanged.

### Requested depth-21 bounded profile

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

Ran one normal empty 7-column by 6-row connect-4 search with depth 21 and a hard
60-second child timeout. Existing state reservation was exhausted at 262,144
local states after 2268.0779 ms, 2453 CPU ms and 3,684,484 search calls. Search did
not complete; this is a resource-capacity failure, not a timeout or W/D/L result.
There were 635,172 expanded nodes, 11,804 cutoffs and 46,693 tactical exact returns.

The [frozen-source profile](evidence/2026-09-12-depth21-line-cpu/line-cpu.md)
maps 361 locations. An evidence-only wrapper catches a search exception, ends
profiling and records the error/counters after measured work. The report explicitly
has no comparison baseline at this depth; no duplicate baseline solve was run.
The normal search policy, resource reservation and engine source are unchanged.
The existing parent timeout still kills its child at 60 seconds. This run failed
earlier and exited normally through failure reporting; no child remains. Hard-kill
profile recovery is not established by this exception-reporting wrapper. No full
root or root trigger change occurred. Status and next-step preserve the failed run.

### Board/depth reservation and hard-timeout profile capture

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The [resource report](2026-09-12-board-depth-reservation.md) replaces fixed bounded
test capacities with a conservative board/depth position bound and explicit typed
reservation budget. State/residual/descriptor/TT owners estimate their own bytes;
the harness checks actual allocations before search. Kernel preparation accepts
one explicit initialization plan and rejects later replacement. Planning, BigInt
and byte estimation remain outside the hot loop. Other production profiles are
unchanged. The slot64 CI path includes the new planner and harness dependencies.

62 controls and four bounded campaigns passed. The final reporting correction
also checks class capacity when claiming complete conservative coverage; storage
controls passed again and the measured plan is unchanged. Depth 21 receives
2,097,152 states, 4,194,304 classes/chunks per slot and a domain-sized shared arena,
accounting for 1,301,619,717 bytes within the explicit 2 GiB budget.

The first resized run timed out at 60 seconds but lost its unflushed profile.
A separate profiler worker was qualified on an isolated busy-main-thread control;
one replacement run timed out at the same bound and saved 55,037.7932 ms mapped
to 810 source locations. The final roughly five seconds and final node counters
are unavailable after the kill. The saved window measures 53,375 process CPU ms,
including reporting-worker CPU. Depth 21 did not complete. All processes exited;
no simultaneous duplicate solve, full-root trigger or protected-ref change occurred.
# 2026-09-12 ranked hot-loop continuation

Research direction / architecture: Josh Oshiro. Implementation / qualification: OpenAI ChatGPT.

See [ranked depth-21 optimization](2026-09-12-depth21-ranked-optimization.md) for the assess/research/reassess/execute/qualify/review record. Changed owners: semantic TT probe, support-layout tactical projection, residual singleton scalar readers and direct term writer, online tactical forwarding, and Negamax initialization-bound frontier access. Preserved exact identity and proof lifecycle checks, variable-board ownership, required frontier/descriptor payloads and the full-root trigger. Five optimization units plus one TT refinement were qualified. Final local result: 69 controls, six campaigns and ten representation controls passed; completed depth-8 counters identical. Seven separate depth-21 runs each timed out at 60 seconds. Final 55-second checkpoint 92.25M calls versus 60.56M baseline; depth 21 remains incomplete. No remaining solver processes. Further TT/descriptor/support optimization is unresolved; no claim of comprehensive performance completion.
