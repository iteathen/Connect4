# IsoMax NEES conformance profile

**Status:** governing implementation-performance contract for the IsoMax hot loop on `solver/isometric`  
**NEES authority:** `iteathen/NEES@0294f37909e9a5b7a2202d3a9367a9e2428d47b3`  
**NEES version:** Draft 0.2  
**Runtime profile:** Node.js 26.x / V8 14.6 family; current qualification runtime Node v26.7.0  
**Gameplay authority effect:** none  
**Semantic authority:** Connect4 logic authority and C4-0011 remain authoritative for game meaning

NEES governs **how** the IsoMax hot execution is realized. It does not change Connect4 semantics, q identity, W/D/L meaning, certificate/proof identity, first-win precedence, or any qualified research theorem.

## 0. Conformance scope

The current audited conformance record is:

`components/isometric/NEES_CONFORMANCE.md`

The promoted conformance claim covers the **active ordinary native worker profile**. Optional guarded-certificate and RBA synchronous consumers remain valid APIs, but they are not implicitly included in the ordinary-worker E0 claim because they currently use richer proof/boundary representations.

If either optional consumer is promoted into repeated E0 worker execution, it immediately inherits E0 / NEES-EXTREME and MUST be separately lowered or explicitly deviated/qualified before promotion.

Current Branch Manager orchestration is E3 because its default task quanta amortize 65,536-131,072 recursive nodes. If its scheduling/reconciliation frequency moves to decision-frontier cadence, it is reclassified E2 regardless of file/process ownership.

## 1. Conformance declaration

The IsoMax ordinary-value hot loop is required to conform to:

```text
NEES-EXTREME
    E0 recursive ordinary-value execution
    E1 native state/transition/cache operations
    E2 scheduled task-control polling and any future branch-exposure/claim hot path
```

The surrounding orchestration uses the weaker frequency classes:

```text
E3
    task admission
    continuation packaging
    worker message/result transport
    Branch Manager task submission/completion
    current central executor lifecycle

COLD
    worker startup/termination
    capacity growth / widening / rehash preparation
    human-readable reporting
    benchmark/result serialization
    heavyweight diagnostics
```

An operation does not become E3/COLD merely because it is implemented in the manager or worker wrapper. If future architecture moves it to branch/claim/reconciliation frequency, its NEES class moves with the execution frequency.

## 2. E0 boundary

Current E0 owner:

`components/isometric/solver.mjs :: IsoMaxSolver.solveNode`

E0 includes the recursive ordinary-value recurrence and its directly repeated scalar callees.

Local rules stricter than generic NEES:

- no dynamic aggregate allocation on the successful ordinary-value recursion path when a prepared/scalar representation exists;
- no strings or string-key identity;
- no Promise/microtask orchestration;
- no manager RPC;
- no queue scans or worker selection;
- no per-node structured clone, message transport, logging, JSON, or diagnostic snapshots;
- no storage growth, widening, or rehash;
- no hash-only equality;
- no proof/certificate identity inferred from q;
- no loss of first-win precedence;
- no state copy/replay where the qualified apply/undo state owns exact restoration.

These are project-local realization constraints, not universal JavaScript claims.

## 3. E1 boundary

Current E1 includes the high-frequency native operations used by E0:

- `nativeFrontierCode`;
- `IsometricState.applyUnchecked`;
- `IsometricState.undo`;
- `ResidualPool.ownTransition`;
- `ResidualPool.blockTransition`;
- q/reflection preparation needed by `IsoMaxTransitionCache`;
- `IsoMaxTransitionCache.prepareKey`;
- `getPreparedUnchecked`;
- `setPreparedUnchecked`;
- qualified native move-order classification.

E1 must preserve the same NEES-EXTREME representation discipline as E0.

### Strong-fact preservation

Upstream exact facts must remain available long enough to remove downstream generality when the specialization is safe.

Current example:

```text
nativeFrontierCode establishes unique playable forced cell
    ->
solveNode uses the cell's column directly
```

Certificate-origin forced cells remain on the checked proof-facing path.

Future specializations such as a frontier-qualified nonterminal mover cofactor may be added only under their exact admission proof and coherent PR-level qualification.

## 4. E2 boundary

The existing `IsoMaxTaskSolver.checkTaskControl` is an amortized E2 control boundary.

It may perform the bounded shared-control operations required to:

- observe global abort;
- observe task necessity;
- test the local node quantum;
- save a continuation into already-owned fixed storage.

It must not grow into:

- queue inspection;
- Branch Manager RPC;
- rich priority evaluation;
- object/result packaging;
- reporting;
- portable-q construction.

Issue #102 is a **planned candidate**, not current implementation authority. If decision-frontier exposure, global worker pull, numeric work arenas, or manager reconciliation are implemented, their branch/claim/reconciliation-frequency machinery must conform to NEES at E2. The candidate's preferred fixed-width/indexed/shared representation is consistent with NEES, but exact layout remains an implementation decision requiring qualification.

## 5. E3 / COLD boundaries

The following are intentionally outside E0/E1:

- task replay validation;
- state creation at task entry;
- search-storage reservation;
- continuation object/array packaging after unwind;
- worker result object construction;
- current worker `postMessage`;
- current Branch Manager Maps/Sets/Promises and executor lifecycle;
- full progress snapshots;
- process/resource diagnostics;
- benchmark/report formatting.

Their existence does not authorize moving them into E0/E1.

### Diagnostics watch

The current worker performs `process.memoryUsage()` once per completed task result. Node documents this call as potentially slow because it gathers page-level memory information. It remains E3 diagnostic machinery, not recursive work. If task frequency or result-side service time makes it material, NEES M36 requires moving/sampling/narrowing it rather than accepting the cost as intrinsic.

## 6. Current NEES realization map

The current hot loop materially implements these NEES methods:

- M01 — normalization/validation at task/public boundaries;
- M02/M03 — stable bounded feedback and stable prepared state shapes;
- M04/M05 — scalar and indexed fixed-schema hot state;
- M06 — semantic q coordinates distinct from addresses/IDs;
- M07 — prepared finite profile relations;
- M08 — exact numeric hash lookup with full-coordinate equality;
- M10 — TypedArray/Array use selected by representation contract;
- M11 — avoid repeated aggregate allocation;
- M13/M14 — prepare/seal capacity and generation-safe ownership where reused;
- M15/M16 — derive once and retain structure rather than serialize/reparse;
- M17/M18 — fast-path exact closure and simplify before general recursion;
- M22 — checked external boundary to trusted internal primitives;
- M23 — mutate/undo reversible recursion;
- M35/M36 — diagnostic separation from recursive execution;
- M38 — specialize only after semantic narrowing;
- M39 — remove obsolete work before micro-optimizing it;
- M40 — retain optimized Node/V8 builtins unless a narrower method is admitted;
- M44 — runtime-sensitive realization is tied to a pinned profile.

Method numbering follows NEES Draft 0.2 at the pinned revision. A later NEES revision does not silently alter this profile.

## 7. Known realization-sensitive records

### Signed 32-bit hash carrier

The transition-cache prepared hash currently remains signed int32 across hot JS calls because prior Node/V8 evidence found unsigned values above the signed range could create a less favorable numeric carrier.

This is V8-sensitive, not semantic.

Requalification trigger:

- Node/V8 major/profile change;
- generated-code/runtime evidence shows the distinction disappeared or reversed;
- a replacement hash representation is proposed.

### Packed standard-7x6 residual representation

The 625-term WSL representation, two-word chunks, class indices, prefix caches, and prepared storage are implementation realizations for the accepted standard 7x6 product profile.

They are not universal Connect-k laws.

### Native frontier specialization

Native exact/forced consequences are consumed before recursive move enumeration. Stronger native provenance may bypass proof-facing validation only where the native theorem establishes the exact checked property.

## 8. Qualification cadence

Adopt the NEES PR-level qualification boundary.

During development:

- preserve semantics and continue through one coherent optimization/change set;
- reuse the pinned NEES runtime/profile evidence and already-qualified IsoMax realization records;
- checkpoint each meaningful implementation/research result durably;
- run a targeted check only when its answer can change the next design decision or protect an invariant required to continue.

Do **not** run the full correctness suite, benchmark matrix, V8 generated-code inspection, or paired timing after every optimized line.

At the completed PR/change-set boundary, run the applicable qualification:

- exact semantic/correctness suite;
- hot-loop restoration/play/undo controls;
- NEES conformance review;
- deterministic allocation/operation/capacity controls that apply;
- V8/generated-code checks only for load-bearing V8-sensitive claims;
- paired real-worker/performance qualification when the PR claims or depends on performance improvement;
- regression/negative controls material to the changed mechanism.

A meaningful regression blocks promotion of the completed candidate. It does not require stopping after every local edit inside the candidate.

## 9. Requalification triggers

Reassess this profile when any of these change materially:

- NEES authority revision is deliberately updated;
- Node major or V8 family;
- supported CPU/ABI where platform-sensitive behavior matters;
- ordinary q identity;
- state transition ownership;
- recursive cache equality;
- worker task boundary;
- branch/claim/reconciliation cadence;
- native/FFI/WASM escape policy;
- a current E3 operation becomes E0-E2 frequency;
- evidence falsifies an existing realization assumption.

## 10. Non-claims

This profile does not claim:

- current Branch Manager/executor scheduling is the final #102 architecture;
- every manager operation is already NEES-EXTREME;
- process-memory diagnostics are free;
- every possible E0 specialization is already implemented;
- fewer source lines imply lower execution cost;
- lower-level syntax is automatically faster;
- NEES changes Connect4 gameplay authority.

The governing separation is:

```text
Connect4 / IsoGraph
    owns what is true

C4-0011
    owns IsoMax solver semantics and implementation contract

NEES
    owns reusable extreme-performance realization discipline

this profile
    maps NEES onto the IsoMax execution frequencies
```
