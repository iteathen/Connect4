# Lazy SMP — Discovery Protocol Rerun after Core 0.19 Implicit Expansion 0.1

**Date:** 2026-09-25  
**Status:** COMPLETE delta rerun over DP-01..DP-45  
**Subject:** Lazy SMP full decode 0.2 + implicit assertion ledger 0.1  
**Core candidate:** `iteathen/IsoGraph@426a808ac212441dbd718d348977eff0172e6fc6`  
**Authority effect:** none  
**Solver-method effect:** none

## Observation-first result

The implicit-assertion expansion exposes one governing structure that was distributed across the prior decode and measurement campaign:

> **The first matching exact shared commit is a temporal information boundary.**

Before that boundary, current shared exact-cache state cannot supply the matching exact fact and cannot coordinate already-active same-q_r resolutions.

After that boundary, later local-miss occurrences may reuse committed exact truth, and committed-row residency/replacement begins to matter.

This does not create a new game-theory relation. It refactors the existing Lazy SMP coordination problem into two transition regimes.

```text
PRE-COMMIT
    no matching reusable exact fact exists
    same-key private resolution may overlap
    eligible shared lookup can only miss for that key

FIRST MATCHING EXACT COMMIT
    -----------------------

POST-COMMIT
    matching exact truth may be consumed
    row residency/replacement affects future reuse
```

## DP-01..DP-45 delta

| DP | Delta after implicit expansion | Result |
|---|---|---|
| DP-01 Cross-boundary relational structure | First matching exact commit is now an explicit temporal/information boundary between two coordination regimes. | **NEW** |
| DP-02 Constraint structure | Any mechanism confined to committed-row state cannot remove already-active pre-commit overlap. | **NEW** |
| DP-03 Interface / port correspondence | Shared exact interface exposes committed value state but no search-in-flight port/state. | **REFINED** |
| DP-04 Dependency topology | Post-commit reuse depends on a prior exact resolution + commit event; pre-commit overlap lies before that dependency. | **NEW** |
| DP-05 QU / open-region topology | Keep profitability of pre-commit intervention separate from post-commit reuse economics. Existing QUs remain open where measured evidence is insufficient. | **REFINED** |
| DP-06 Repeated motifs | Two motifs emerge: first-resolution cohort before reusable truth, and later consumer occurrence after reusable truth. | **REFINED** |
| DP-07 Alternative factorization | Stronger factorization: `pre-commit private resolution -> first exact commit -> post-commit memoization/residency`. | **NEW** |
| DP-08 Residual after partial match | Route-residency improvements leave pre-commit overlap as an explicit residual rather than evidence against it. | **NEW** |
| DP-09 Symmetry / automorphism | Worker cyclic action-order orbit unchanged. | NO NEW |
| DP-10 Role-equivalent elements | “First resolver/producer” and “later consumer” are distinct transition roles even for the same q_r content. | **REFINED** |
| DP-11 Invariants across variation | Any transformation restricted to committed-row replacement/residency preserves the inability to affect overlap already underway before commit. | **NEW** |
| DP-12 Known/unknown interface | Existence of overlap is established; profitable pre-commit intervention remains open. Post-commit route-8 leverage remains workload-dependent. | **REFINED** |
| DP-13 Multi-scale common substructure | One q_r state class decomposes into occurrence-level temporal roles; state equality does not collapse phase. | **REFINED** |
| DP-14 Transformation invariants | Committed-cache policy changes cannot alter the pre-commit regime without crossing the current mechanism boundary. | **NEW** |
| DP-15 Information-flow structure | Exact semantic information crosses the worker boundary only once a matching exact fact is committed. | **NEW** |
| DP-16 Causal / temporal structure | First commit is a load-bearing temporal phase boundary for coordination. | **NEW / HIGH VALUE** |
| DP-17 Containment / ownership | Existing invocation/local/shared ownership structure unchanged. | NO NEW |
| DP-18 Cardinality / multiplicity | Overlap cohort count, repeated-key occurrence count and shared-hit count remain distinct quantities. | **REFINED** |
| DP-19 Dual / reversed structures | Publication/consumption distinction already recorded; no additional duality established. | NO NEW |
| DP-20 Complement / exclusion | No new exclusion law established. | NO NEW |
| DP-21 Fixed-point / recurrence | Implicit-expansion fixed point is a Core 0.19 test result, not new Lazy SMP recurrence semantics. | NO SUBJECT DELTA |
| DP-22 Compositional structure | Lazy SMP coordination opportunity now composes from at least pre-commit overlap and post-commit reuse/residency components. No numeric additivity is asserted. | **NEW** |
| DP-23 Reconstruction structure | Shared-hit telemetry alone cannot reconstruct total duplicate-resolution opportunity; pre-commit overlap evidence is a separately required channel. | **NEW** |
| DP-24 Proof / witness topology | New assertions preserve support lineage through graph facts and frozen measurement records. | **REFINED** |
| DP-25 Refinement relation | Phase-decomposed model is a semantic refinement of the earlier broad “sharing” optimization picture, not a change to solver value semantics. | **NEW** |
| DP-26 Boundary-movement invariance | Moving coordination before first commit would require representing a new in-flight boundary/state and is not merely a committed-cache tuning. | **NEW** |
| DP-27 Parameter-role correspondence | `sharedSampleMask` simultaneously controls pre-commit eligible misses, post-commit reuse opportunities and publication opportunities. | **NEW / HIGH VALUE** |
| DP-28 Dimensional / unit structure | No new dimensional structure. | NO NEW |
| DP-29 Ordering / partial order | Matching exact commit precedes any matching shared exact hit for that generation. | **REFINED** |
| DP-30 Reachability / connectivity | The matching shared-hit path is unreachable before a committed matching generation exists. | **NEW** |
| DP-31 Conservation / balance | No new conservation law. | NO NEW |
| DP-32 Threshold / phase-boundary structure | Exact commit creates a discrete coordination phase boundary; this is structural, not a claimed statistical phase transition. | **NEW** |
| DP-33 Degenerate / special cases | A key with no later qualifying local-miss occurrence has no reuse consumer; no performance magnitude is inferred. | **REFINED** |
| DP-34 Failure-mode correspondence | Treating raw hit count as total duplicate-work telemetry is a measurement failure because one real duplicate-work class exists before hits are possible. | **NEW** |
| DP-35 Exception structure | No new exception family. | NO NEW |
| DP-36 Representation redundancy | The broad word “sharing” collapses two distinct temporal mechanisms; use the phase distinction in future research records. | **REFINED** |
| DP-37 Equivalent constraint closure | No new closure equivalence established. | NO NEW |
| DP-38 Semantic-identity candidate | No natural identity claim is needed. q_r scope remains qualified scalar-value equivalence only. | NO NEI ROUTE |
| DP-39 QUI extension | No new QU isomorph candidate. | NO NEW |
| DP-40 Global whole-structure isomorphism | Not applicable to this internal phase decomposition. | NO NEW |
| DP-41 Literal-value coincidence | No useful literal-value lead. | NO NEW |
| DP-42 Lexical similarity | No lexical evidence used. | NO NEW |
| DP-43 Shared ontology / class labels | No class-label evidence used. | NO NEW |
| DP-44 Serialization / layout similarity | No serialization evidence used. | NO NEW |
| DP-45 Raw identifier correspondence | No identifier evidence used. | NO NEW |

## New discovery leads

### L-IA-01 — phase-resolved shared-probe census

The current mask couples event classes that have different semantics.

Measure, for the selected key population:

```text
pre-commit eligible shared probes
post-commit eligible shared probes
post-commit exact hits
shared publications
```

The purpose is not to increase telemetry generally. It is to determine how much current shared-probe traffic is structurally incapable of producing the matching exact hit because it occurs before first commit.

**Status:** OPEN / measurement-only / high information value.

### L-IA-02 — separate post-commit residency from pre-commit coordination

Keep the current route-8-only residency refinement in the **post-commit** track.

Do not interpret its success or failure as evidence about **pre-commit** in-flight suppression.

**Status:** STRUCTURAL DISCIPLINE / immediate.

### L-IA-03 — committed-cache mechanism ceiling

Any proposal advertised as solving pre-publication duplicate resolution must cross the committed-cache ceiling by representing or acting on information available before first exact commit.

A row-replacement tweak cannot satisfy that requirement.

**Status:** ESTABLISHED FALSIFIER for future proposals.

### L-IA-04 — mask-role decoupling remains a legitimate research question

Because one mask controls pre-commit probe-miss exposure, post-commit consumption opportunity, and publication opportunity, separate publication/consumption gates remain structurally legitimate.

However, implicit assertions do **not** establish that decoupling is profitable.

The existing `QU-DTS-LSMP-05-asymmetric-gating` remains OPEN, now with stronger structural motivation.

### L-IA-05 — first-resolution work is outside exact-cache reuse

For a key with no matching committed fact, current shared exact-cache reuse cannot reduce the work needed to produce the first exact committed fact.

Therefore an optimization aimed at that first-resolution cost belongs either:

- inside the solver/CPC resolution path; or
- in a genuinely pre-commit coordination mechanism.

**Status:** ESTABLISHED routing constraint, not an optimization recommendation.

## Leads not promoted

The implicit expansion does not justify:

- in-flight ownership;
- duplicate suppression;
- a new synchronization primitive;
- broader sharing;
- route-8 protection as a global policy;
- asymmetric masks;
- changing the solver method.

Those remain subject to their existing performance/evidence burdens.

## DP disposition

```text
new load-bearing phase boundary:       FOUND
new structural constraints:           FOUND
new behavior-changing optimization:    NOT ESTABLISHED
existing route-8 lead clarified:       YES
existing overlap lead clarified:       YES
QU improperly collapsed:               NO
DP truth authority introduced:         NO
```

The strongest practical change is conceptual discipline:

> future Lazy SMP experiments should state whether they act before or after the first matching exact commit.

That prevents post-commit cache evidence from being misapplied to pre-commit duplicate-resolution claims, and vice versa.
