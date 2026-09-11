# C4-0009 — CUDA-BSFP execution profile v1

**Status:** Working execution-profile specification on `feature/cuda-bsfp`; intentionally mutable until the first real BSFP-backed GPU vertical slice fixes the remaining composition details.

## Purpose

Define the **Connect4 consumer projection** of BSFP onto the CUDA-JS ecosystem without moving BSFP semantics into CUDA-Algorithms or reimplementing generic GPU algorithms inside Connect4.

This is the only C4-0006..0009 specification that knows about CUDA execution.

C4-0006 owns CPC/WSL structural mathematics. C4-0007 owns NDC proof semantics. C4-0008 owns exact BSFP W/D/L semantics. C4-0009 owns how those semantics are presented to reusable CUDA-Algorithms and CUDA-JS mechanisms.

## Depends on

### Connect4

- C4-0001 Connect Four domain semantics;
- C4-0005 independent solved-strength oracle evidence;
- C4-0006 Control Parity and Winspace v1;
- C4-0007 Nested Dependency Closure v1;
- C4-0008 BSFP exact solver v1.

### CUDA-Algorithms

At the current seam:

- **SPEC-0002 — Algorithm Plans, Active Extents, and Device Chaining** — Candidate;
- **SPEC-0003 — Stable Index Selection and Permutation Ordering** — Candidate;
- **SPEC-0004 — Device Worksets and Fixed-Point Closure** — Working Draft;
- `docs/design/2026-09-09-first-profile-design.md` — design evidence;
- `docs/design/2026-09-09-canonicalization-ownership-boundary.md` — design evidence;
- `reference/ranked-index-closure.mjs` — generic reference semantics/evidence, not BSFP semantics.

### CUDA-JS

- **SPEC-0028 — Typed Device-JS Library Composition** — Accepted;
- accepted CUDA-JS device-view, prepared-execution, operation-lifecycle, compiler/linker and memory contracts transitively used by CUDA-Algorithms.

Every qualification record must freeze the exact repository/package revisions exercised. Branch names and draft status alone are not compatibility evidence.

## 1. Ownership table

| Fact/mechanism | Owner |
| --- | --- |
| Connect Four legality, terminal meaning | Connect4 |
| CPC / WSL-625 structural meaning | Connect4 C4-0006 |
| NDC prerequisite/consequence/proof meaning | Connect4 C4-0007 |
| BSFP W/D/L, existential/universal predecessor semantics | Connect4 C4-0008 |
| BSFP record/equality/dominance/canonical proof meaning | Connect4 |
| Generic algorithm plans, active extents, bounded status | CUDA-Algorithms |
| Stable index selection/order and other accepted generic sequence mechanics | CUDA-Algorithms |
| Generic ranked workset/activation/progression semantics | CUDA-Algorithms SPEC-0004 profile |
| Device-JS syntax/types/library imports/compilation/linking | CUDA-JS |
| Device memory/views/prepared execution/native operation lifecycle | CUDA-JS |
| Host orchestration of the Connect4 solve and final product result | Connect4 |

No implementation convenience transfers semantic ownership.

## 2. Required logical pipeline

The CUDA-BSFP profile must preserve the already-developed first-consumer pipeline:

```text
BSFP active resolved facts/items at rank r
  -> BSFP derives bounded predecessor/proof contributions
  -> BSFP writes consumer-owned candidate records / structural key words
  -> CUDA-Algorithms orders/selects/compacts candidate indices using generic primitives
  -> BSFP exact equality / semantic-boundary facts
  -> generic grouping/segment/selection mechanics where available and justified
  -> BSFP existential/universal proof reduction and target finalization
  -> CUDA-Algorithms activates/progresses finalized target indices at lower rank
  -> next rank / administrative boundary
```

The exact kernel/node count is not normative. The ownership order is.

## 3. Critical distinction: dependency reachability is not W/D/L evaluation

The current CUDA-Algorithms `runRankedIndexClosure()` reference proves useful generic semantics:

- bounded consumer-owned item-index universe;
- explicit finite rank;
- strict rank descent;
- bounded emission count;
- idempotent activation;
- shard-size invariance for the tested reference profile.

That reference answers primarily:

> which lower-rank item indices become active/reachable under a consumer derivation?

BSFP additionally requires:

> what exact proof contribution does each resolved higher-rank fact make to each lower-rank predecessor, and when are **all** contributions needed to finalize that predecessor available?

Therefore simple activation closure is **necessary but not sufficient** for CUDA-BSFP W/D/L.

A conforming GPU profile must include consumer-owned rank-complete semantic reduction/finalization. CUDA-Algorithms may own the generic schedule/barrier/workset mechanics around it, but it must not invent BSFP `max/min`, existential/universal, terminal, blocker, or proof-reduction meaning.

## 4. Rank orientation

The first BSFP CUDA profile should use an explicit finite rank compatible with C4-0008.

For support-state progression the natural rank is:

```text
rank = occupied cell count
```

Terminal/deeper child facts are at higher rank. Backward propagation derives predecessor obligations at lower rank.

For any strictly descending CUDA-Algorithms RankedClosure profile:

```text
rank(derivedTarget) < rank(source)
```

must hold for every emitted dependency.

A violation is an exact semantic error/falsifier. The library must not repair, reorder, or silently bucket a rank violation into another level.

A refined NDC event/completion rank is permitted if C4-0007/C4-0008 prove its well-foundedness and the execution profile freezes its interpretation.

## 5. Consumer-owned item universe

CUDA-Algorithms should see compact item indices, not BSFP records as generic structs.

Conceptually:

```text
itemIndex -> consumer-owned BSFP fact/state/certificate record
```

The physical record may be structure-of-arrays or another exact bounded layout. CUDA-Algorithms may carry/reorder the index sequence while the wide BSFP record stays in Connect4-owned storage.

No generic CUDA-Algorithms record ABI is implied.

The item-index width and per-epoch capacity are physical profile facts. They do not limit the mathematical problem size when the logical problem is safely sharded/out-of-core.

## 6. Consumer-owned derivation

For each active resolved source item, BSFP owns the exact derivation of predecessor/proof contributions.

The first GPU profile must expose a **finite proven emission bound** per source item or a different explicitly bounded production contract accepted by CUDA-Algorithms.

Do not assume the bound is simply Connect Four's seven columns. NDC/certificate representations may emit a different number of proof contributions. The bound belongs to the selected BSFP record/derivation profile and must be measured/proved before plan construction.

Candidate emission conceptually contains enough consumer-owned information to identify:

```text
target proof/state identity
source/result contribution
existential/universal or equivalent proof role
timing/rank/horizon facts required by the selected representation
exact structural key material or indices from which it can be produced
```

CUDA-Algorithms does not interpret those fields.

## 7. Deterministic emission stripes

The preferred first correctness profile follows the existing CUDA-Algorithms direction of finite deterministic emission lanes/stripes.

A source item may conceptually reserve up to `maxEmissionsPerItem` lanes, each producing either:

```text
valid candidate
or
inactive lane
```

This gives the generic algorithm a bounded physical envelope without dynamic device function pointers or unbounded queues.

A different bounded shape may replace this after evidence, but silent overflow/truncation is forbidden.

## 8. Structural keys and permutation-first ordering

BSFP may produce primitive key-word columns for candidate indices.

CUDA-Algorithms SPEC-0003 owns stable lexicographic ordering of an index sequence by external primitive key words. This is the preferred generic seam because BSFP records can remain in place.

A hash may be one key word or an early partition hint, but:

```text
hash equality != BSFP equality
```

Stable multiword ordering can establish a deterministic candidate neighborhood for exact consumer comparison without moving proof-record semantics into CUDA-Algorithms.

## 9. Exact equality boundary

BSFP owns exact equality/canonicalization.

The existing CUDA-Algorithms canonicalization design establishes the preferred boundary:

```text
ordered candidate indices
  -> BSFP exact adjacent equality/change predicate
  -> device change/boundary flags or equivalent exact primitive facts
  -> CUDA-Algorithms generic select/scan/segment mechanics where maintained
```

Do not add a generic CUDA-Algorithms proof-record equality callback merely because BSFP is the first consumer unless evidence proves the primitive-fact boundary cannot support an efficient exact path.

If a required generic segmentation/scan primitive is not yet maintained by CUDA-Algorithms, route that reusable primitive to CUDA-Algorithms. Do not implement a permanent private BSFP copy and then call the seam complete.

## 10. Rank-complete semantic reduction

For backward W/D/L, target finalization depends on complete knowledge of the applicable higher-rank child/contribution set.

For a rank transition `r -> r-1`, a target at `r-1` may be finalized only after the execution profile has established that:

1. every active/logically required source item at rank `r` has been processed;
2. every valid contribution from those sources has been emitted or safely persisted;
3. all physical shards covering rank `r` are accounted for;
4. contributions targeting the same exact BSFP state/proof identity have been brought under exact consumer equality;
5. BSFP's existential/universal or equivalent semantic reduction has consumed the complete required contribution set;
6. the target's exact result/proof status has been published before it becomes an authoritative source for lower-rank work.

This is the main additional contract beyond simple ranked activation.

`rank-complete` must therefore mean **semantic rank completion for the selected profile**, not merely "the current kernel had no more local indices."

## 11. Existential/universal reduction remains in BSFP

C4-0008 requires two distinct proof compositions.

Conceptually:

```text
existential predecessor:
  sufficient contribution from one resolved child/proof may establish Win

universal predecessor:
  every legal/admissible child contribution must be accounted for before Loss
```

The GPU realization may use counters, masks, reductions, proof certificates, antichains, or another exact representation.

Those meanings remain BSFP-owned. CUDA-Algorithms may supply generic reduction/grouping machinery only where the operation is consumer-neutral.

## 12. Consumer program composition through CUDA-JS

The preferred first experiment uses **Accepted CUDA-JS SPEC-0028 Typed Device-JS Library Composition**.

BSFP-owned bounded device functions are compiled as explicit typed leaf-library exports. CUDA-Algorithms-owned Device-JS programs may import those exports under explicit aliases when constructing the finite ranked-closure epoch.

The composed path must preserve:

- exact typed signatures;
- deterministic library/program semantic identity;
- exact target architecture/format compatibility;
- copied/frozen import metadata under CUDA-JS rules;
- no ambient registry or implicit import discovery;
- no dynamic device function pointers;
- no caller-selected native linker symbol surface;
- no private CUDA-JS/CUDA-Algorithms imports.

The exact BSFP exported function names and signatures are **not frozen by this Working specification**. The first real GPU slice must discover the smallest sufficient statically typed interface.

Likely logical roles include derivation, structural-key production, exact equality/change facts, and semantic finalization, but roles may be split across imported device functions and consumer-owned prepared kernels if that produces a cleaner generic boundary.

## 13. What the first vertical slice must decide

CUDA-Algorithms SPEC-0004 intentionally leaves its consumer callback/composition boundary open.

The first BSFP-backed GPU slice must settle, with implementation evidence, whether the reusable generic plan should consume:

- typed imported Device-JS leaf functions;
- prepared consumer function/kernel capabilities;
- a bounded declarative transform description;
- or another statically bounded consumer-neutral composition form.

The decision must satisfy the deletion test:

> if Connect4/BSFP disappears, the remaining CUDA-Algorithms public contract still makes coherent sense for another ranked dataflow/graph/dynamic-programming consumer.

If it does not, the seam is too BSFP-specific.

## 14. Device-resident active extent

For a GPU-owned profile, active counts/extents required for mathematical progression remain device-resident according to CUDA-Algorithms SPEC-0002.

Node must not read an active count between stages to decide:

- how many proof records survive;
- which candidates are equal;
- which predecessor becomes active;
- whether a universal obligation is complete;
- whether the fixed point has mathematically converged.

Qualification code may read back after completion to compare against independent oracles. That is not production progression.

## 15. Administrative states

CUDA-BSFP must distinguish mathematical state from administrative execution state.

At minimum the selected profile must be able to represent the semantic equivalents of:

```text
running
rank-complete
root-solved / converged
needs-input
needs-spill
capacity-yield
budget-yield
cancelled
invalid-semantic-state
failed
```

Exact numeric codes/spelling are not frozen here.

An administrative yield is never automatically convergence.

## 16. Node boundary

Node may:

- validate host-known finite plan/profile facts;
- compile/prepare through public CUDA APIs;
- allocate/bind public device views;
- submit bounded epochs;
- asynchronously observe device-produced administrative status;
- supply an opaque next shard requested by the plan;
- persist an opaque completed shard/checkpoint;
- resubmit after an explicit device-produced administrative yield;
- cancel/stop;
- deliver final exact result after semantic completion;
- close/reclaim resources according to lower lifecycle authority.

Node may **not**:

- inspect proof records to choose mathematical progression;
- inspect active counts to choose the next semantic rank/item set;
- perform BSFP equality/deduplication on CPU in the production path;
- perform existential/universal predecessor reduction on CPU;
- choose which dependency to expand next;
- turn capacity exhaustion into a truncated valid result;
- synchronously block the event loop waiting for GPU semantic progress.

## 17. Capacity and overflow truth

Every physical plan declares finite material bounds, including those applicable to the selected realization:

```text
item/workset capacity
candidate capacity
max emissions per source
key/index widths
workspace bytes
rank range
epoch work budget
status/control storage
prepared-node/import limits
```

If required output exceeds a bound:

- no work may be silently dropped;
- a truncated payload is not a valid success result;
- explicit capacity-yield/failure truth must be produced;
- a safely computed required count may be exposed for administration if the lower algorithm contract permits it.

Retry/resizing must preserve exact generation identity so duplicate or omitted proof contributions cannot arise.

## 18. Physical sharding and out-of-core execution

VRAM is a physical batch limit, not the mathematical problem limit.

A logical rank may be partitioned into finite physical shards only when exact result invariance is preserved.

Before a target rank is finalized, the system must prove/account for complete source-shard coverage and exact cross-shard grouping/reduction of contributions that belong to the same target.

A shard boundary may not hide a duplicate, split a universal obligation, or cause premature rank completion.

Checkpoint descriptors must bind enough generation/rank/partition identity to prevent partially written or stale shards from being treated as complete.

Physical spill/placement policy belongs in its natural CUDA subsystem if generalized; Connect4 owns only the BSFP semantic requirement that sharding not change the proof.

## 19. Determinism

For identical exact input/profile identities, logical W/D/L and canonical proof results must not depend on:

- CUDA thread scheduling;
- stream overlap;
- block size;
- physical shard size;
- candidate batch partitioning;
- nondeterministic arrival order of equivalent contributions.

A provider may change physical implementation while preserving the exact semantic result and declared administrative-state contract.

## 20. Runtime completion versus BSFP validity

A CUDA operation may complete successfully while the algorithm status reports semantic failure or capacity yield.

Conversely, an administrative `rank-complete` signal is not a final Connect4 result unless C4-0008's exact proof conditions for the requested root are satisfied.

The Connect4 product must preserve this distinction through result delivery.

## 21. First CUDA-BSFP vertical slice

The first implementation should be deliberately small and correctness-first.

It must:

1. choose one already-qualified small Connect Four geometry/profile;
2. express a finite BSFP rank and consumer-owned derivation;
3. compose consumer Device-JS through the public typed-library path or falsify that seam;
4. use CUDA-Algorithms for maintained generic ordering/selection/workset mechanics rather than local copies;
5. perform consumer exact equality and semantic rank finalization on device;
6. keep Node administrative only;
7. compare every produced rank/root result with independent C4-0008/reference-oracle results;
8. exercise duplicate activation and exact equality collisions/duplicate-heavy fixtures;
9. exercise capacity/budget yield without false convergence;
10. prove physical shard/batch invariance on the selected fixture;
11. close every opened CUDA-Algorithms/CUDA-JS resource and preserve cleanup failures;
12. record exact Connect4, CUDA-Algorithms, CUDA-JS, Node, provider, GPU/driver and profile identity.

Performance optimization is not part of this first gate.

## 22. Promotion gate

C4-0009 may move from Working to Candidate only after the first physical CUDA-BSFP slice demonstrates a clean reusable seam and SPEC-0004 is revised, if necessary, to match the observed generic contract.

Before any standard-7x6 CUDA support claim, additionally require:

- exact W/D/L parity on the maintained BSFP qualification corpus;
- standard-7x6 root evidence;
- capacity/sharding behavior at representative scale;
- physical cleanup evidence;
- performance evidence separated from correctness.

## 23. Cross-repository change routing

If the vertical slice exposes a missing capability:

- BSFP proof/domain fact -> Connect4;
- generic sequence/workset/ranked-closure algorithm fact -> CUDA-Algorithms;
- generic Device-JS/compiler/memory/execution/native mechanism -> CUDA-JS;
- generic physical memory-placement/spill policy -> its natural memory subsystem if activated.

Do not patch around a lower missing generic capability inside Connect4.

## Non-claims

This Working profile does not claim:

- a frozen CUDA-Algorithms SPEC-0004 callback API;
- a final BSFP Device-JS function signature set;
- native CUDA-BSFP qualification;
- standard-7x6 empty-board completion;
- GPU performance advantage;
- that the current generic `runRankedIndexClosure()` reference alone computes BSFP W/D/L;
- that every future BSFP representation must use the same physical pipeline.

## Falsifiers

Rework the seam if:

- CUDA-Algorithms must understand CPC/WSL/NDC/WDL fields to progress the workset;
- Connect4 must reimplement reusable selection/order/group/closure mechanics to stay correct;
- Node must inspect proof data/counts to advance the mathematics;
- rank completion can occur before all cross-shard contributions are finalized;
- simple activation closure is mistaken for existential/universal BSFP reduction;
- typed Device-JS composition cannot provide a statically bounded consumer-neutral seam and no cleaner generic alternative exists;
- physical batch/shard size changes exact W/D/L;
- capacity or watchdog boundaries can falsely report convergence;
- a hash collision can merge unequal BSFP records;
- resource cleanup or semantic status is lost behind lower operation success.
