# Lazy SMP Full Translation — Discovery Protocol Rerun 0.3

**Date:** 2026-09-25  
**Owner:** `research/semantic-quotient`  
**Subject:** `CONNECT4_LAZY_SMP_SEARCH_METHOD_0_2.*` full native translation  
**Status:** COMPLETE  
**Authority effect:** none  
**Solver-method effect:** none

This is a fresh DP-01..DP-45 pass over the full 0.2 translation. It does not reuse the 0.1 summary graph as evidence.

## DP-01 — Cross-boundary relational structure

PASS with refinement.

The full translation exposes five distinct boundaries:

1. semantic root -> per-worker root occurrence;
2. private exact state -> invocation-shared exact cache;
3. exact shared row -> peer local-miss consumption;
4. completed worker result -> winner arbitration;
5. host control -> external thread termination.

New lead: facts that never cross boundary 2 before loser teardown are permanently invisible to peers and are destroyed at invocation end.

## DP-02 — Constraint-structure discovery

PASS.

Load-bearing constraints:

- every worker remains independently exact;
- only exact cache values may enter shared cache;
- local exact cache is primary;
- shared row is accepted only after full-key match and stable even sequence;
- result publication precedes winner CAS;
- host returns EXACT only when ERROR=0, DONE=1, WINNER>=0.

No new semantic constraint is introduced by Lazy SMP.

## DP-03 — Interface / port correspondence

PASS with a new negative result.

The WAKE word is written/notified by winner, failure, and close paths, but the current Lazy-SMP host wait path polls STOP/DONE with `setInterval`, and current workers do not wait on WAKE.

Therefore WAKE is an **unconsumed signal in the current Lazy-SMP composition**. It remains part of the generic ManagedThreadSession interface, so this is not automatically a removable global primitive.

## DP-04 — Dependency-topology discovery

PASS.

Execution topology:

```text
one exact dependency graph
-> N private traversals
-> selected exact facts may cross a shared side channel
-> one completed result occurrence wins arbitration
```

No global branch ownership or search partition exists.

## DP-05 — QU / open-region topology

PASS with extension.

New/refined QU:

- QU-LSMP-12 — share-ineligible blind-region leverage;
- QU-LSMP-13 — shared-hit local-retention economics;
- QU-LSMP-14 — local/shared collision coupling;
- QU-LSMP-15 — winner-publication / host-observation latency;
- QU-LSMP-16 — post-DONE loser-fault policy;
- QU-LSMP-17 — action-order diversity rank.

## DP-06 — Repeated relational motifs

PASS.

Two main motifs repeat:

```text
local miss
-> deterministic share gate
-> optional stable shared read

exact local store
-> deterministic share gate
-> optional one-shot shared publication
```

A third motif is completion:

```text
publish diagnostics/result/completion
-> winner CAS
-> optional DONE/notify
```

## DP-07 — Alternative-factorization discovery

PASS with stronger factorization.

```text
private correctness
+ cyclic traversal-policy orbit
+ deterministic key-space sharing projection
+ lossy direct-map shared materialization
+ publication-delayed winner race
+ polling host observation
+ hard loser teardown
```

This is a more exact decomposition than “workers + shared cache + first finisher.”

## DP-08 — Residual structure after partial match

PASS.

Removing shared reuse leaves exact private workers.

Removing worker-order diversity leaves exact private workers.

Removing the winner race but waiting for any exact worker could still preserve value correctness, but changes operational termination.

Removing private exact completeness destroys the current correctness factorization.

## DP-09 — Symmetry / automorphism discovery

PASS with a new structural result.

Worker action policies form a **cyclic orbit** of one base order:

```text
pi_i = rotate(base_order, i mod columns)
```

The same rotation is used at every ordinary node in that worker.

Thus current diversity is one-dimensional and repeats exactly after `columns` workers.

## DP-10 — Role-equivalent elements under different labels

PASS.

Workers remain role-equivalent / occurrence-distinct.

New distinction:

```text
completed worker
!= winner worker
```

because a worker sets completion before attempting WINNER CAS.

## DP-11 — Invariants across admissible variation

PASS.

Scalar exact result is invariant under:

- shared-cache miss;
- dropped store contention;
- direct-map replacement;
- worker interleaving;
- winner identity;
- cyclic order offset.

Runtime, winner, witness, cache traffic and completion multiplicity are not invariant.

## DP-12 — Known/unknown interface correspondence

PASS with refinement.

Known shared state consists only of stable committed exact rows.

A share-ineligible exact fact is **known privately but structurally incapable of becoming shared under that mask**, even if every worker reaches it.

This is stronger than an ordinary cache miss.

## DP-13 — Multi-scale common substructure

PASS.

Publication-before-observation appears at:

- shared key/value before even sequence commit;
- worker result/completion before winner CAS;
- winner CAS before DONE signal;
- host exact gate after DONE/WINNER observation.

## DP-14 — Transformation-invariant discovery

PASS.

Permuting worker occurrences together with their policy assignments preserves value.

Changing the mapping between workers and cyclic offsets can alter timing and winner without changing value.

## DP-15 — Information-flow structure

PASS with a new lead.

A shared exact hit is consumed directly as a return value but is **not backfilled into the worker local exact cache**.

Therefore exact information can flow:

```text
shared -> worker computation
```

without becoming retained:

```text
shared -> worker local cache
```

This creates QU-LSMP-13.

## DP-16 — Causal / temporal structure

PASS with stronger timing structure.

Before winner CAS, each worker performs:

- 15 metric-row writes;
- 4 atomic result-row stores (value, relative, move, completion).

Only then can it compete for WINNER.

Thus winner means **first successful post-publication CAS**, not literally first worker whose solver computation returned exact.

Near-simultaneous exact workers can be reordered by publication work.

## DP-17 — Containment / ownership structure

PASS.

Local exact cache and recursive state are private.

Shared cache/control/result/metrics are invocation-shared.

All exact-cache materialization is invocation-local.

No search evidence survives to the next `runLazySmpConnect4Rba32` call.

## DP-18 — Cardinality / multiplicity structure

PASS.

- many workers can complete;
- one winner exists;
- policy count <= min(workers, columns);
- one slot can have many committed generations;
- one exact key is either share-eligible for all workers or share-ineligible for all workers under one invocation mask.

## DP-19 — Dual / reversed structures

PASS.

New dual:

```text
share-eligible exact key
<-> share-ineligible exact key
```

Both can be privately exact, but only one class has a cross-worker publication path.

## DP-20 — Complement / exclusion structure

PASS with a major new finding.

The sample mask creates a **static exclusion region** of exact keys.

For mask 7:

```text
eligible iff hash bits selected by 0x07000000 are all zero
```

Keys outside that class cannot be shared by any worker during that invocation.

This is a deterministic blind region, not stochastic missed sampling.

## DP-21 — Fixed-point / recurrence structure

PASS.

No game fixed point is introduced.

Shared slot sequence is a storage generation counter.

Sequence wrap to zero makes a committed row look empty, which degrades reuse but does not fabricate an exact hit.

## DP-22 — Compositional-structure discovery

PASS.

Current correctness composition remains:

```text
private exact solver
+ exact result publication
+ exact host gate
```

All other Lazy-SMP pieces are performance/lifecycle composition.

## DP-23 — Reconstruction-structure discovery

PASS.

A peer reconstructs a shared fact only through:

```text
same exact key
+ stable committed slot generation
+ nonzero exact value
```

New lead: shared hit is not promoted into local storage, so repeated reconstruction may recur.

## DP-24 — Proof / witness topology

PASS.

Shared cache carries scalar exact W/D/L only.

It carries no move witness, proof provenance or best-action record.

This is an intentional identity-safe boundary but limits the information available for peer move ordering.

## DP-25 — Refinement-relation discovery

PASS.

Worker count adds occurrences, but diversity policy rank saturates at board width.

Sample mask refines a deterministic exact-key subgraph, not a probabilistic access frequency.

Capacity refines collision/replacement topology.

## DP-26 — Boundary-movement invariance

PASS.

Exact local->shared publication preserves value fact.

A new possible boundary move is:

```text
shared hit -> local exact backfill
```

It is exactness-safe in principle under full key/value preservation, but changes local replacement economics and therefore remains unqualified.

## DP-27 — Parameter-role correspondence

PASS with corrections.

- `workers` = execution-occurrence count;
- `orderOffset` = cyclic policy-orbit coordinate;
- `sharedSampleMask` = deterministic share-key classifier;
- local/shared capacities = direct-map address-space/replacement controls;
- `pollMs` = host observation cadence, not worker cooperation cadence.

## DP-28 — Dimensional / unit structure

PASS.

New warning:

```text
mask 7 != measured 12.5% runtime access sample
```

It defines three selected hash bits; approximately one-eighth of keys requires an adequate hash-distribution assumption.

## DP-29 — Ordering / partial-order structure

PASS with four independent orders:

1. worker action order;
2. local-before-shared cache order;
3. shared write commit order;
4. result publication before winner arbitration.

A fifth operational delay exists from DONE publication to host poll observation.

## DP-30 — Reachability / connectivity structure

PASS with a stronger graph interpretation.

A private exact fact can help another worker iff:

1. key is share-eligible;
2. first worker establishes exactness;
3. shared store succeeds;
4. fact remains in its direct-map slot;
5. peer local lookup misses;
6. peer reaches same key before teardown;
7. shared probe validates stable generation.

This is the actual cross-worker reuse path.

## DP-31 — Conservation / balance structure

PASS.

Exact fact content is conserved under successful publication/validation.

Not conserved:

- cache residency;
- losing private exact state;
- winner identity;
- witness identity;
- completion timing.

## DP-32 — Threshold / phase-boundary structure

PASS.

New practical boundary:

```text
workers > columns
-> no new cyclic orderOffset policy
```

Additional workers can still differ by scheduling/shared observations, but not by the configured order policy.

## DP-33 — Degenerate / special-case structure

PASS.

Special cases include:

- mask 0: all keys eligible;
- workers > columns: repeated policy;
- multiple workers complete before host close;
- a completed worker can lose;
- a winner can exist transiently before DONE is set;
- a committed slot can wrap sequence to zero and become a safe miss.

## DP-34 — Failure-mode correspondence

PASS with a new observation-first discrepancy.

Worker `error` handler always enters fail-closed ERROR/STOP.

Worker clean `exit` after DONE/STOP/finished does not.

Therefore a loser error after a winner has completed can still poison the invocation, while a clean loser exit after DONE does not.

This is a real policy distinction, not yet classified as defect.

## DP-35 — Exception-structure discovery

PASS.

Deadline/cancel and exact completion can race.

Host exact gate gives ERROR dominance:

```text
if ERROR != 0
    result is not EXACT
```

even if DONE/WINNER also became set.

This is conservative fail-closed semantics.

## DP-36 — Representation-redundancy discovery

PASS with three new candidates.

1. WAKE add/notify is unconsumed by current Lazy-SMP poll wait.
2. Shared exact hits are not locally backfilled.
3. With equal local/shared capacities, both direct maps use the same low hash bits, coupling collision classes.

None is promoted directly to optimization without measurement.

The previously tested known-hash-reuse candidate remains rejected evidence.

## DP-37 — Equivalent constraint-closure discovery

PASS.

Exact closure is preserved under:

- sharing enabled/disabled;
- qualified sample masks;
- cache misses/replacement/contention.

A local-backfill variant would need separate exact differential qualification but has a straightforward scoped exactness argument.

## DP-38 — Semantic-identity candidate discovery

PASS.

Additional identity boundaries:

- share-eligibility class is not q identity;
- collision class is not q identity;
- completion occurrence is not winner occurrence;
- winning worker is not necessarily earliest solver-return occurrence;
- same physical slot across generations is not same storage occurrence.

## DP-39 — QU extension from partial unknown correspondence

PASS.

Added:

- QU-LSMP-12 share-ineligible blind-region leverage;
- QU-LSMP-13 shared-hit local-retention economics;
- QU-LSMP-14 local/shared collision coupling;
- QU-LSMP-15 winner-publication / host-observation latency;
- QU-LSMP-16 post-DONE loser-fault policy;
- QU-LSMP-17 cyclic policy-orbit diversity rank.

## DP-40 — Global whole-structure isomorphism

PASS with a stronger non-isomorphism.

Semantic exact dependency has no analogue of:

- share-ineligible key class;
- direct-map collision class;
- slot generation;
- local/shared retention asymmetry;
- publication diagnostics before winner race;
- polling latency;
- post-DONE loser-fault policy;
- hard teardown loss.

These are realization topology, not game topology.

## DP-41 — Literal-value coincidence

PASS.

New non-inferences:

- same hash gate bits != same semantic importance;
- same low slot bits != same semantic relation;
- same completion value `1` across rows != same completion occurrence;
- same policy offset after wrap != same worker.

## DP-42 — Lexical / name similarity

PASS.

Corrections:

- “sample” -> deterministic key classifier;
- “first finisher” -> first successful winner CAS after result publication;
- “stop” -> host/lifecycle signal, not cooperative recursive solver stop;
- “shared cache” -> invocation-local lossy materialization, not persistent shared knowledge base.

## DP-43 — Shared ontology / class-label hints

PASS.

The implementation's exact/cache/state/root/winner vocabulary maps to multiple identity carriers. No label supplies identity authority by itself.

## DP-44 — Serialization / layout similarity

PASS.

The same hash feeds local and shared direct-map addressing, but equal layout/address formulas do not merge ownership.

Equal capacity creates coupled collision classes without making caches the same object.

## DP-45 — Raw identifier correspondence

PASS.

Rejected as semantic identity:

- worker index;
- order offset;
- hash;
- eligibility bits;
- local/shared slot index;
- sequence number;
- result row;
- completion flag;
- winner index;
- control index.

## Rerun synthesis

The full translation reveals that current Lazy SMP is not merely “independent workers plus shared exact cache.”

It is:

```text
complete private exact traversals
+ one-dimensional cyclic traversal-policy orbit
+ deterministic hash-defined shared-key subgraph
+ local-first / shared-second retention hierarchy
+ lossy direct-map exact materialization
+ publication-delayed winner arbitration
+ polling host observation
+ fail-closed error dominance
+ hard external loser teardown
+ zero persistence across solve invocations
```

The highest-value new experimental leads are:

1. measure leverage of the permanently share-ineligible key region;
2. measure repeated shared hits and test local backfill;
3. measure collision coupling between equal-capacity local/shared direct maps;
4. measure solve-return -> winner CAS -> host observation -> cleanup tail;
5. test whether cyclic order rotations are providing enough independent traversal diversity;
6. explicitly qualify post-DONE loser-error policy before changing it.
