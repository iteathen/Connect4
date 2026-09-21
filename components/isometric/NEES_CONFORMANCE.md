# IsoMax NEES conformance audit — active ordinary worker profile

**Status:** Draft 0.3 baseline retained as inherited evidence; Draft 0.4 authority pinned, with requalification intentionally deferred until the current BranchManager/worker E2 rebuild is complete  
**Solver revision audited:** `solver/isometric@b784c710382a819717889a3c71183ceff6f40f49`  
**NEES authority:** `iteathen/NEES@34412670878316295736799097ebb8f248a7bb50` — Draft 0.4  
**Runtime profile:** Node v26.7.0 / Node 26-V8 14.6 family  
**Semantic authority effect:** none

## 1. Conformance status after the Draft 0.4 pin

The authority pin has moved to Draft 0.4. By explicit owner direction, Draft 0.4 qualification is **deferred until after the current BranchManager rebuild and worker E2 cleanup**. The existing Draft 0.3 baseline remains inherited historical evidence; this pin move alone is not a new conformance claim.

### Historical Draft 0.3 baseline

The completed audit below remains valid inherited structural/runtime evidence from the Draft 0.2 qualification.

It is **not by itself a completed Draft 0.3 conformance claim** because Draft 0.3 adds a one-time full E0-E2 maximal-effort cost/debt baseline.

That additional baseline is now recorded in `NEES_BASELINE_0_3.md`, covering
11f3ec61 plus the qualified support-first q implementation. Its ordinary E0-E2
scope conforms with visible UNVERIFIED-DEBT, not a global-optimality claim.
Qualification: 118 relevant tests pass; nine alternating paired totals favor
the support-first candidate with unchanged exact decisions. Full evidence is
in `benchmarks/isomax-workers/ISSUE-CAMPAIGN.md` and `issue-97-support-first.json`.

Subsequent coherent campaign qualification covers the retained signed hash,
ordering-word reuse, ordinary WDL storage and E3 rank-cut admission changes:
125 relevant tests pass at runtime c1c06791. E791f080 restores that same runtime
after rejecting a cold-preparation candidate. All nine final three-root paired
times improve against 11f3ec61; the separate 96-root rank-cut comparison reduces
expanded entries. Mixed-timing hash carriage is retained for demonstrated boxing
and allocation reduction, not a claimed clock win. The full baseline's debt
dispositions and issue boundaries remain explicit.

Active governing requirement:

```text
NEES Draft 0.3
    -> governing immediately
    -> full E0-E2 baseline maximal-effort audit required
    -> only then may current profile be declared fully NEES-EXTREME 0.3 conformant
```

The inherited Draft 0.2 execution-class evidence was:

```text
E0 / NEES-EXTREME
    IsoMaxSolver.solveNode ordinary-value recurrence

E1 / NEES-EXTREME
    native frontier classification
    applyUnchecked / undo
    residual own/block transitions
    q/cache preparation, lookup and publication
    native advisory ordering

E2 / NEES-EXTREME
    scheduled task-control polling only

E3
    task admission/preparation
    current manager task orchestration
    continuation packaging
    worker message/result transport
    current shared executor lifecycle

COLD
    worker construction/termination
    capacity growth/widening/rehash preparation
    rich reporting / human diagnostics
```

This is a scoped implementation-conformance claim. It does not claim every optional IsoMax API is an E0-conformant worker profile.

## 2. Why the current Branch Manager is E3

The current Branch Manager operates on coarse worker tasks whose default node quantum is:

```text
1-2 workers: 131072 recursive nodes
3+ workers:   65536 recursive nodes
```

Current manager expansion/submission/reconciliation therefore occurs at task/quantum orchestration frequency rather than ordinary recursive-node frequency.

Its present Maps, Sets, Promises, node objects and message objects are not precedent for E0/E1.

**Reclassification trigger:** if scheduling architecture moves branch exposure, priority competition, work claim, or reconciliation to decision-frontier frequency—as planned by issue #102—those operations become E2 and MUST satisfy NEES-EXTREME. Their existing E3 object/Promise implementation MUST NOT be reused as the hot implementation by convenience.

## 3. Optional synchronous profiles

### Guarded certificate consumer

Current certificate lookup uses object/Map/array-oriented proof APIs.

It is explicitly excluded from ordinary native worker admission:

```text
IsoMaxTaskSolver.runTask
    requires certificates.size === 0
```

The API remains valid for synchronous proof-facing use.

If guarded-certificate consumption is promoted into repeated E0 worker recursion, it inherits E0 / NEES-EXTREME immediately. The current rich lookup API is not implicitly grandfathered; it must either be lowered or receive explicit NEES deviations justified by required proof semantics and qualified economics.

### Optional RBA value resolver

Current RBA consumption is opt-in and disabled in ordinary worker tasks:

```text
IsoMaxTaskSolver.runTask
    requires valueResolver === null
```

The resolver contains Map, object, BigInt and boundary-evaluation machinery and is therefore not claimed as part of the current E0 ordinary-worker conformance profile.

If RBA closure becomes a normal repeated worker hot-path consumer, it MUST receive its own E0 NEES conformance pass before promotion.

This is not permission to classify hot work as cold. It is a promotion boundary: **optional rich consumers may exist, but they may not become the promoted hot loop while non-conformant.**

## 4. Method dispositions

### Stable structure

| NEES method / rule family | Disposition | IsoMax realization |
|---|---|---|
| boundary normalization / trusted primitive | CONFORMS | checked replay/task/public boundaries feed `applyUnchecked`, prepared q and sealed recursion |
| stronger upstream facts | CONFORMS | native forced-cell provenance now survives into direct trusted column derivation; certificate-origin cell remains checked |
| semantic identity vs addressing | CONFORMS | q coordinates decide exact equality; hashes, slots, pool IDs and task IDs do not |
| structured facts stay structured | CONFORMS | recursive path consumes WSL/support/q directly rather than serializing/reparsing |
| derived facts one owner | CONFORMS | singleton masks, incidence tables, reflection/profile data and transition prefixes are prepared/maintained |
| avoidable E0 allocation | CONFORMS for ordinary worker profile | allocation/copy/iterator/string trap test executes actual recursive worker path under sealed storage |
| prepared/sealed growth | CONFORMS | ResidualPool and transition cache reserve before recursion and fail closed when sealed |
| reversible state | CONFORMS | apply/undo uses preallocated history; no per-child board clone/replay |
| exact hash indexing | CONFORMS | numeric hashing narrows location; full p0/p1/support or chunk content confirms equality |
| exact simplifying facts first | CONFORMS | cache/native frontier/exact structural consequences precede unresolved recursion |
| deterministic forced structure | CONFORMS | forced response is one direct edge; no scheduler decision is invented inside recursive worker |
| diagnostics separated | CONFORMS E0/E1 | no logging/report serialization/process snapshots in recursive kernel |
| coordination amortization | CONFORMS | worker task-necessity/abort checks occur at scheduled node thresholds rather than per node |
| shared-memory correctness | CONFORMS current E2 control | abort/needed words use Atomics; no ordinary conflicting shared payload is used by E0 |
| builtin-first / no folklore rewrite | CONFORMS | no general builtin replacement introduced by NEES adoption |
| structural elimination before micro-optimization | CONFORMS | native provenance removes redundant proof-facing validation rather than making validator syntax faster |

### V8-sensitive realization

#### Signed int32 prepared hash carrier

Disposition: **CONFORMS, V8-SENSITIVE**.

The existing hot cache keeps hash bits in signed int32 form across calls. This is a realization record, not q semantics.

Requalification trigger:

- Node/V8 family change;
- generated/runtime evidence falsifies the carrier distinction;
- hash API changes.

#### Stable state/object shapes

Disposition: **CONFORMS for active profile**.

Persistent solver/state/cache objects are constructed through stable code paths. E0 does not create dynamic per-node aggregate state.

NEES does not require converting every stable object field into a TypedArray merely to appear lower level.

## 5. Known non-E0/E1 observations

These remain visible rather than being hidden as "conformant hot-loop costs":

### Worker result memory census

`process.memoryUsage()` is executed once per worker result after `runTask`.

Classification: E3 diagnostic watch.

Research finding: F-004 / QU-HOT-03B.

NEES consequence: if result-side service time makes it material, sample/move/narrow the metric rather than accepting it as intrinsic. No E0 violation exists today.

### Shared executor structured clone

The shared executor performs an explicit pre-dispatch `structuredClone`.

Classification: current E3 transport lead.

Research finding: F-003.

Disposition remains measurement-gated; NEES does not authorize removal without accounting for transport semantics.

### Current central Branch Manager graph representation

Manager nodes/parents/edges and ready-work discovery use ordinary JS aggregates.

Classification: current coarse E3 task orchestration.

This representation is **not qualified for future #102 E2 use**. If #102 is implemented, its hot scheduler/reconciler receives a separate lowering/conformance pass.

## 6. Current exact implementation alignment completed by NEES adoption

The NEES adoption change completed one exact E0/E1 specialization immediately justified by existing research:

```text
nativeFrontierCode
    proves unique playable opponent singleton cell
        ->
preserve native provenance
        ->
derive column directly
        ->
applyUnchecked

certificate forced cell
        ->
columnForForcedCell checked proof-facing path
```

This realizes F-005 and NEES stronger-fact preservation without changing game semantics.

Structural control:

`components/isometric/test/hot-loop.test.mjs`

`native forced response preserves playable provenance and bypasses proof-facing validation`

The completed PR qualification passed:

- full repository `npm test`;
- Isometric native WSL domain qualification under Node v26.7.0;
- benchmark-evidence workflow;
- strength-evidence workflow;
- portable checks.

No performance speedup claim is made from the specialization alone.

## 7. Open NEES-aligned candidates — not required for current conformance

These are candidates or measurement gates, not current conformance defects:

- F-002 frontier-qualified nonterminal mover cofactor;
- F-003 executor pre-dispatch structuredClone;
- F-004 worker result memory census;
- F-006 manager child q derivation;
- #102 decentralized worker pull / global priority / canonical q reconciliation;
- future lowering of manager reconciliation if it becomes an E2 bottleneck.

NEES requires correct realization **when these are implemented**; it does not require implementing every exact or plausible optimization.

## 8. Qualification cadence

This audit follows the NEES coherent-PR rule.

The implementation was not fully benchmarked/tested after every local edit. Qualification was performed at the completed adoption PR boundary.

Future IsoMax hot-loop optimization work should follow the same cadence:

```text
assess
-> implement coherent candidate
-> checkpoint durably
-> targeted checks only when decision-blocking
-> completed PR qualification
-> promote/reject
```

## 8.1. Draft 0.3 requalification delta

Draft 0.3 requires the next conformance pass to inventory the **complete declared E0-E2 scope**, not only the last changed operation.

The baseline must preserve durable disposition of known or suspected machine costs, including small non-dominant candidates.

Existing known leads that must enter that baseline rather than disappear include, at minimum:

- native/frontier transition specialization opportunities already represented by F-002;
- signed-int32 hash carrier as V8-sensitive retained realization;
- q/reflection/cache probe and publication cost;
- residual own/block transition load/store/probe cost;
- apply/undo history and support update cost;
- native ordering classification cost;
- scheduled control polling/Atomics cost;
- any other reasonably visible E0-E2 calls, branches, loads/stores, conversions, allocation/lifetime, or runtime/JIT machinery found by the baseline audit.

E3 observations such as result-side `process.memoryUsage()`, pre-dispatch `structuredClone`, and current coarse manager object/Promise orchestration remain outside E0-E2 unless their execution cadence changes, but they stay visible as optimization leads rather than being called free.

## 9. Historical Draft 0.2 conclusion and current Draft 0.3 status

The previous Draft 0.2 audit concluded for the promoted ordinary native worker profile:

```text
E0 ordinary recursion      CONFORMS NEES-EXTREME
E1 native operations       CONFORMS NEES-EXTREME
E2 scheduled control       CONFORMS NEES-EXTREME
E3 current orchestration   CONFORMS to its declared lower-frequency scope
COLD preparation/report    CONFORMS to its declared cold scope
```

Optional certificate/RBA profiles are not claimed as ordinary-worker E0 realizations and may not be promoted into that role without a separate NEES conformance decision.

Issue #102 remains planned. Its future E2 realization must conform before promotion.

**Draft 0.3 current status:** the complete E0-E2 baseline and qualification are recorded in `NEES_BASELINE_0_3.md` and the implementation campaign ledger. Inherited methods remain qualified within their declared profiles; remaining suspected costs stay explicit debt. Optional consumers and future decentralized E2 scheduling are not covered by this ordinary-worker claim.
