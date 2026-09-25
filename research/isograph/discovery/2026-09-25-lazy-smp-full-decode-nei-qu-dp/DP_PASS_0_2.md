# Lazy SMP Full-Decode Discovery Protocol 0.2

**Status:** COMPLETE  
**Authority effect:** none

## DP-01 — Cross-boundary relational structure
PASS. Semantic-root replication, private-to-shared exact publication, exact-result-to-winner arbitration, and host-to-thread teardown are separate boundaries.

## DP-02 — Constraint-structure discovery
PASS. Private completeness, exact-only publication, key/profile compatibility, committed-row validation, result-before-winner publication, and host fail-closed exactness are load-bearing constraints.

## DP-03 — Interface / port correspondence
PASS. Root, geometry, shared cache, control, results and metrics are distinct ports with distinct ownership.

## DP-04 — Dependency-topology discovery
PASS. N private recursive materializations share an exact-fact side channel. No work-partition topology exists.

## DP-05 — QU / open-region topology
PASS. Open regions now include deterministic key-partition leverage, publication latency, termination tail, persistence, contention/replacement and key-to-q mapping.

## DP-06 — Repeated relational motifs
PASS. Local-first probe and exact-store motifs repeat per worker/node; committed-slot state machines repeat per share-eligible key.

## DP-07 — Alternative-factorization discovery
PASS. Lazy SMP factorizes into root replication, private exact traversal, deterministic shared-key subset, lossy shared materialization, result publication, winner arbitration and teardown.

## DP-08 — Residual structure after partial match
PASS. Shared cache and ordering diversity can be removed without removing exact private correctness; private completeness cannot.

## DP-09 — Symmetry / automorphism discovery
PASS. Worker-role permutation is operational symmetry; equal exact keys also preserve share eligibility across workers.

## DP-10 — Role-equivalent elements under different labels
PASS. Worker indices are distinct occurrences of one role; repeated shared-slot generations are distinct temporal occurrences of one physical slot role.

## DP-11 — Invariants across admissible variation
PASS. Exact root value survives shared misses, replacement, contention and worker interleaving under private completeness.

## DP-12 — Known/unknown interface correspondence
PASS. Only committed exact rows are shared knowledge; odd rows, misses, unresolved recursion and alpha/beta bounds are not.

## DP-13 — Multi-scale common substructure
PASS. Content is established before publication metadata both at shared-slot commit and root-result winner arbitration.

## DP-14 — Transformation-invariant discovery
PASS. Worker permutation preserves scalar exact result but not winner, timing, completion multiplicity, hits or witness.

## DP-15 — Information-flow structure
PASS. Exact-key hash controls private address and deterministic shared eligibility; facts flow local store -> optional shared store -> peer local-miss probe.

## DP-16 — Causal / temporal structure
PASS. Result publication precedes winner CAS; key/value publication precedes even-sequence commit. These orders are load-bearing.

## DP-17 — Containment / ownership structure
PASS. Local state/cache are worker-owned; shared cache/control/results/metrics are invocation-shared; all are realization objects.

## DP-18 — Cardinality / multiplicity structure
PASS. Many workers may complete; one wins. One slot may carry many committed generations. Policy multiplicity may be lower than worker multiplicity.

## DP-19 — Dual / reversed structures
PASS. Root replication is one-to-many, winner arbitration many-to-one, shared cache probe/store read/write dual.

## DP-20 — Complement / exclusion structure
PASS. Non-share-eligible keys, odd rows and non-exact bounds are deliberately excluded from shared exact consumption.

## DP-21 — Fixed-point / recurrence structure
PASS. No new game recurrence; sequence generations are storage-version progression only.

## DP-22 — Compositional-structure discovery
PASS. Private exact solve + result publication + host exact gate is correctness composition; sharing/order only affect performance.

## DP-23 — Reconstruction-structure discovery
PASS. Any worker reconstructs root independently; shared probe reconstructs fact only under full key equality and stable sequence.

## DP-24 — Proof / witness topology
PASS. Winner move belongs to one exact result occurrence; scalar value sharing does not transport proof/witness identity.

## DP-25 — Refinement-relation discovery
PASS. Mask/capacity/workers/order refine realization only. Reinterpreting mask as deterministic key partition corrects representation without changing implementation.

## DP-26 — Boundary-movement invariance
PASS. Local->shared exact copying preserves fact semantics; persistence across invocations would be a new realization and remains QU.

## DP-27 — Parameter-role correspondence
PASS. Mask is a key-class selector, capacity controls replacement address space, workers controls occurrence count, offset controls traversal order.

## DP-28 — Dimensional / unit structure
PASS. Mask is not a probability. Completion count and winner count differ. Approximate sharing fraction requires hash-distribution assumptions.

## DP-29 — Ordering / partial-order structure
PASS. Solver action order, shared-slot commit order and result-before-winner order are distinct.

## DP-30 — Reachability / connectivity structure
PASS. A shared fact helps only if commit precedes peer local miss and the row survives until validated probe.

## DP-31 — Conservation / balance structure
PASS. Exact content is conserved across valid copies; cache occupancy and loser-private state are not conserved at teardown.

## DP-32 — Threshold / phase-boundary structure
PASS. Worker/mask/capacity validation boundaries are implementation constraints, not game-semantic thresholds.

## DP-33 — Degenerate / special-case structure
PASS. Mask 0 shares all; order offsets repeat beyond board width; simultaneous completion may create multiple completion flags but one winner.

## DP-34 — Failure-mode correspondence
PASS. Worker error, unexpected exit, deadline and abort converge on ERROR/STOP/WAKE; cache contention/miss does not.

## DP-35 — Exception-structure discovery
PASS. Loser termination is external Worker.terminate, not cooperative STOP polling in current recursive solve.

## DP-36 — Representation-redundancy discovery
PASS. Shared probe/store recompute hash after local hash exists; prior known-hash reuse A/B was rejected, so this remains durable negative evidence.

## DP-37 — Equivalent constraint-closure discovery
PASS. Shared on/off and qualified sample masks preserve exact root closure under private completeness.

## DP-38 — Semantic-identity candidate discovery
PASS. Same root content can inhabit distinct worker storage; same slot index across sequence generations is not same storage occurrence.

## DP-39 — QU extension from partial unknown correspondence
PASS. Added QU for key-partition leverage, termination tail/discarded private state, persistence, contention/replacement.

## DP-40 — Global whole-structure isomorphism
PASS with stronger non-isomorphism. Semantic DAG lacks worker multiplicity, cache generations, result race, completion multiplicity and teardown loss.

## DP-41 — Literal-value coincidence
PASS. Sequence numbers, worker indices, result slots, hashes and W/D/L encodings remain owner-scoped literals.

## DP-42 — Lexical / name similarity
PASS. "sample" is deterministic key selection, not random access sampling; "done" is global winning completion, not all-worker completion.

## DP-43 — Shared ontology / class-label hints
PASS. Exact/cache/worker/root/result/completion/winner labels do not establish identity across owners.

## DP-44 — Serialization / layout similarity
PASS. Corresponding worker roots, SAB geometry views and per-worker rows retain separate occurrence/ownership semantics.

## DP-45 — Raw identifier correspondence
PASS. Worker index, slot index, sequence, hash and row offsets are realization identifiers, not q/game identities.

## New findings

- **FD-001:** deterministic share-key subgraph.
- **FD-002:** exact result publication precedes winner arbitration.
- **FD-003:** all search evidence is invocation-local and ephemeral.
- **FD-004:** losers are externally terminated; recursive search does not cooperatively poll STOP.
- **FD-005:** shared writer contention is one-shot and degrades to lost reuse.
- **FD-006:** completion identity and winner identity are separate.
- **FD-007:** shared slot generation is required context; raw slot index is insufficient identity.
