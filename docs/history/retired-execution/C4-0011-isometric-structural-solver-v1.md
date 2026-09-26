> HISTORICAL SNAPSHOT at Connect4 `7db9b5c3d31d86e7cfee84d02c551a96c892d0cb`.
> Retired execution design/evidence; not current implementation authority.
> See ../../decisions/2026-09-24-isomax-lazy-smp-only.md.

# C4-0011 — Isometric structural solver v1

**Status:** Candidate solver-semantic specification on durable branch `solver/isometric`; canonical research remains owned by `research/semantic-quotient`

**Research direction / structural architecture:** Josh Oshiro

## Active scratch-rebuild profile — 2026-09-23 owner correction

On `work/isomax-jsminsys-rebuild`, production recursive fallback is forbidden.
No RBA query may switch representation or invoke an alternate production solver.
RBA-native cofactor traversal, shared-q dependencies and interval propagation are
primary solving, not fallback. Independent reference solving is test-only.
This supersedes every fallback permission and recursive-backend requirement in the inherited text below for
this profile; the inherited implementation/NEES descriptions are historical,
not assertions about the scratch rebuild.

The current kernel performs bounded RBA four-front construction/query. It returns
EXACT only for a proved value and required action witness. Nonclosing queries
continue through RBA-native dependency solving. Construction budget exhaustion
returns INCOMPLETE, capacity exhaustion FAILED, without fabricated WDL.
Full boundary-artifact refinement/recomposition remains unimplemented and
empty-board completion is unproven. Removing fallback alone proves neither.
Current eight-word ABI, shared-TT execution and JSMinSys/NEES pins are defined by
`docs/design/rba-native-integration.md`, `components/isometric/execution/README.md`
and `components/isometric/NEES_PROFILE.md`. Historical qualification remains
evidence for its exact tested source, not current-profile conformance.

## Purpose

Define the Connect4-owned **Isometric / IsoMax** solver family: the structural-calculus line that grew out of the terminal-frontier experiment but is now independent of Negamax and of the historical incumbent representation.

Isometric is a sibling of the BSFP, Research, and Negamax lineages. Historical descent from a forward search experiment does not make Negamax recurrence, value orientation, proof procedure, board-state layout, heuristic evaluation, or branch ownership authoritative here.

The active implementation now has a native WSL residual state and an exact recursive residue backend. Recursive value backup remains subordinate fallback machinery for states not closed by exact structural/value facts; it is not the solver-family identity. A separately qualified ordinary-value boundary resolver may close residue before recursion without becoming proof/certificate identity.

## Shared structural dependencies

Read and preserve the shared Connect4 meanings from:

- **Connect4 logic authority 1.2** — current integrated game-theory authority on
  `research/semantic-quotient@21cfe24af925a2eceaadccac494cacc87b0faf6f`,
  `research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_2.json`
  (manifest blob `5f401c93f8ea653fd3bc96e386b08ef7d92c519e`). Authority 1.1 and
  former NEI/RBA overlays remain immutable historical evidence. The promotion
  root/manifest govern status even where frozen package filenames say CANDIDATE.

- **C4-0001** — legal Connect Four domain and first-win stopping;
- **C4-0006** — control parity, support/event semantics, residual win-space requirements, blocker semantics, antichain/exhaustion semantics;
- **C4-0007** — nested dependency closure, certificate, response/resource, timing and deadline semantics **when the selected IsoMax path consumes stronger proof/certificate facts**.

C4-0010 defines the separate quotient-native Negamax lane. It may be used as historical evidence, a control implementation, or an explicitly imported clause when independently justified, but it does not own Isometric semantics.

## Native implementation boundary

The active implementation is owned by `components/isometric/` and does not maintain a compatibility copy of the incumbent colored-board/search state.

For standard 7x6 Connect Four it uses:

```text
625 canonical non-empty residual requirements
  -> 20 x u32 ontology bits
  -> 10 two-word / 64-bit storage slots

support/accessibility
  -> 42-bit masks for direct cell predicates
  -> 27-bit support code = 7 x 3-bit column heights + 6-bit rank

P0 residual class + P1 residual class
  + support/accessibility
  -> ordinary future-behavior key q

derived/runtime fields:
  side to move
  rank / ply
  playable masks
  first-win terminal status
  reversible history
  -> maintained where useful for execution, guards, undo and diagnostics
```

Residual updates are exact positive cofactors:

- mover-owned requirements containing the landing cell contract by removing that cell, then strict supersets are removed;
- opponent requirements containing the landing cell are deleted;
- an empty mover requirement is immediate terminal win;
- bilateral residual exhaustion is an exact draw certificate;
- first-win stopping terminates the state immediately.

The dense mover transform and direct slot-local blocker transform are the active transition forms. The previously tested branchy lazy-mover variant is not part of the production path.

The current packed WSL implementation is deliberately specialized to accepted standard 7x6 geometry. Broader board-family structural theorems remain research authority where stated, but this implementation does not claim a generic W x H packed vocabulary yet.

## NEES extreme-performance realization contract

The IsoMax **hot loop MUST conform to the Node Extreme Execution Standard (NEES)** under the repository-owned profile:

`components/isometric/NEES_PROFILE.md`

Current pinned NEES authority:

`iteathen/NEES@3a78310a3ba14fb3acb4046c8dffd396209c213c` — Draft 0.3.

NEES is a realization/performance authority only. It does not redefine Connect4 gameplay semantics, q identity, W/D/L orientation, first-win stopping, certificate/proof identity, or the qualified structural claims consumed by C4-0011.

The required frequency mapping is:

```text
E0 / NEES-EXTREME
    IsoMaxSolver.solveNode recursive ordinary-value kernel

E1 / NEES-EXTREME
    native frontier classification
    prepared q/cache probe and publication
    residual own/block transition
    applyUnchecked / undo
    qualified native ordering operations

E2 / NEES-EXTREME where implemented at hot cadence
    scheduled task-control polling
    future decision-frontier exposure / work claim / hot reconciliation

E3
    task admission and preparation
    continuation packaging
    worker message/result transport
    current Branch Manager task lifecycle

COLD
    worker startup/termination
    capacity growth/widening/rehash preparation
    rich diagnostics/report formatting
```

An operation's class follows its execution frequency, not the file/process that hosts it. A future manager or scheduler operation that becomes branch/claim/reconciliation-frequency work must be lowered to the applicable NEES class rather than grandfathered as "manager code".

Current conformance evidence is recorded in `components/isometric/NEES_CONFORMANCE.md`.

Draft 0.3 is the governing realization standard. The earlier Draft 0.2 audit
remains inherited evidence. The required complete E0-E2 baseline is now recorded
in `components/isometric/NEES_BASELINE_0_3.md`, with qualification and explicit
unverified optimization debt. This is a scoped conformance claim, not proof
that every candidate is implemented or that machine realization is optimal.

The promoted E0/E1 conformance claim is the active ordinary native worker profile. Optional guarded-certificate and RBA synchronous consumers may remain richer auxiliary APIs, but if they are promoted into repeated E0 worker execution they inherit NEES-EXTREME immediately and must receive a separate conformance/lowering decision before promotion.

Current Branch Manager task orchestration is E3 only while it remains amortized at current coarse worker-task quanta. If branch exposure, priority competition, claim, or reconciliation moves to decision-frontier frequency, that machinery becomes E2 and must satisfy NEES-EXTREME.

Project-local E0/E1 rules may be stricter than generic NEES where the qualified IsoMax domain permits it. In particular, ordinary recursive execution remains scalar/indexed over prepared sealed storage, with no per-node manager RPC, queue scan, string identity, structured clone, Promise orchestration, reporting, storage growth, or hash-only equality.

NEES adoption also requires preserving stronger upstream facts. When native frontier classification proves a stronger precondition than a generic proof-facing API requires, a scoped trusted specialization may consume that fact directly while the public/certificate path remains checked.

### Qualification cadence

The coherent implementation PR/change set is the default qualification unit.

Do not interrupt each optimized line or helper with the full test suite, benchmark matrix, profiling pass, or generated-code inspection. During implementation, use inherited qualified evidence and targeted checks only where their result can change the next design decision or protect a prerequisite invariant.

Before promotion, run the applicable exact correctness controls, NEES conformance review, structural detectors, runtime/JIT checks for load-bearing engine claims, and paired performance qualification required by the completed change.

## Identity and authority separation

IsoMax must not force structural grouping, behavioral identity, representation identity, and proof reuse to use one key.

### Ordinary gameplay identity q

For legal nonterminal standard-7x6 states, authority 1.2 qualifies the
orientation-sensitive ordinary future-behavior carrier:

```text
q_o =
    support/accessibility
    + normalized P0 residual antichain
    + normalized P1 residual antichain
```

Under standard alternating no-pass play:

- rank/ply is derivable from support;
- side to move is derivable from rank parity;
- terminal outcome is emitted by the transition that first completes a win or fills the board and is not an additional nonterminal q coordinate.

Equal q_o preserves literal legal actions, their terminal tokens and successor
q_o, hence the complete ordinary future game. The reflection orbit q_r is a
separate exact quotient: actions transport as c -> 6-c when orientations differ.
Equal q_r permits scalar WDL reuse, not untransported literal action reuse or
physical/history/proof identity. Support-local isotony and threshold-frontier
claims retain their separate qualification burden; C4-R0076 remains open.

The current Isometric implementation already uses the q-shaped triple `(canonical P0 residual class, canonical P1 residual class, canonical support)` as the exact-value transition-cache equality check. Derived/runtime fields may remain physically stored for speed, reversible play, guards, or diagnostics without becoming additional gameplay identity.

`gameplayKey()` chooses the q_r representative by support first, breaking
symmetric-support ties by residual content. `gameplayOrientation()` uses the
same rule. The proof-facing `structuralSignature()` has its own residual-first
representative; its orientation must not be inferred from gameplayOrientation.

A future implementation change must not remove those cached fields merely because they are semantically derivable; removal is an economics decision and still requires exact qualification.

Authority 1.2 integrates the exact/deductive ordinary-value RBA relations over
the support-conditioned residual carrier. Representation/evaluation questions
remain explicitly open. IsoMax may consume a pinned, qualified completed
value-boundary realization without equating it with NDC proof identity.



### Coarse structural signature

The canonical pair of P0/P1 WSL residual classes is a **retrieval signature**. Horizontal reflection is currently the implemented exact board automorphism.

A structural-signature match means:

> structurally related knowledge is indexed here.

It does **not** by itself authorize exact transition reuse or proof transfer.

This is intentionally a contextual-correspondence design rather than a global quotient: one coarse structural bucket may contain certificates whose applicability differs by support, playability, rank, turn, temporal/resource context, or another guard. The bucket locates candidates; the guard/context establishes which certificate image applies.

### Guarded proof authority

A reusable certificate contains a typed conclusion and the minimum guard required for that conclusion. A certificate transfers only when its guard is applicable after the same structural transporter is applied to the guard/conclusion pair.

Current cheap guard classes include support/playability masks, side to move, rank and conjunction. Temporal, resource and realizability guard kinds exist as explicit unresolved authority boundaries; until their semantics are implemented, they return **unresolved**, never false and never applicable.

Horizontal-reflection stabilizers are handled explicitly. When multiple transporters preserve the same coarse WSL signature, applicability may be tested through the valid transporter images rather than made dependent on an arbitrary canonicalization choice.

### Transition / exact-value identity

Exact ordinary transition/value memoization uses the q identity:

```text
canonical P0 residual class
+ canonical P1 residual class
+ canonical packed support
```

Horizontal mirrors share one canonical entry.

The implementation may expose additional side/status/orientation fields from a diagnostic or transport signature, but those fields are not part of exact-value cache equality when they are derivable or terminal-administrative under the declared scope.

Coarse WSL equality without support remains only a retrieval relation, not transition authority.

### Proof identity

Proof/certificate identity is independent from transition identity. Multiple gameplay states may reuse one guarded proof when the certificate's structural domain, transporter and guard justify the transfer.

A proof identity is valid only for the exact proof profile and canonical payload it names. Reusing one `proofIdentity` token with a different canonical guard, conclusion, dependency cone, or other load-bearing proof premise must fail closed or create a distinct proof identity; it must never silently deduplicate the new proof into an older certificate.

This separation is intentional:

```text
WSL equality tells IsoMax where to look.
q tells IsoMax what ordinary future game is the same.
A proved guard tells IsoMax what stronger fact may safely transfer.
A proof identity tells IsoMax what proof work need not be repeated.
```

## Ordinary-value boundary closure before recursion

C4-0011 does not require every unresolved q state to be resolved either by an NDC certificate or by recursive move expansion.

A conforming IsoMax implementation may insert an exact ordinary-value boundary resolver before recursive fallback:

```text
transition-cache hit
  -> native exact structural consequence
  -> applicable guarded proof/certificate consequence
  -> qualified q/RBA ordinary-value boundary consequence
  -> forced transition if certified
  -> recursive exact W/D/L fallback
```

The integrated ordinary-value RBA route is:

```text
support-conditioned residual fiber
  -> residual distributive lattice
  -> terminal-extended cofactor adjunction
  -> exact W/D/L / strong-value threshold boundaries
  -> extremal antichain-semiring Bellman composition
  -> exact local-skyline / projection-index evaluation
```

This path is ordinary-value authority only. It must not publish an NDC proof certificate unless the stronger proof premises are separately established.

Implementation requirements:

- pin the exact canonical research revision/evidence consumed;
- preserve q/support identity and first-win semantics;
- keep recursive exact W/D/L as an independent fallback/control until replacement economics and coverage are qualified;
- treat factor order, orientation, skyline evaluation and projection-tree pruning as exact evaluation policy, not semantic identity;
- never infer a value from incomplete boundary work, budget exhaustion or missing threshold membership;
- qualify same-state W/D/L and value-preserving moves against the retained recursive/oracle path;
- measure recursive children avoided separately from boundary-construction/query cost.

The qualified semantic relations do not by themselves qualify a producer's
runtime economics, incomplete artifact, stronger proof guard or worker ABI.

## Current structural-closure boundary

The active implementation already represents temporal, resource and realizability guards as explicit unresolved guard kinds. That fail-closed behavior remains correct.

Canonical research has isolated a stronger **proof/certificate** composition seam as guarded obligation birth:

```text
MixedCofactorConsequence
+ AdmissibleSupport
+ UniversalInterventionStability
+ SharedResourceAccounting
+ FirstWinBeforeDeadline
-> CertifiedObligation
```

Isometric must not treat residual degree drop, eventual ownership, or a surviving named residual as an obligation without those guards.

Until the relevant temporal/resource/realizability semantics are implemented and qualified:

- such guards remain unresolved;
- certificate lookup may not treat them as false or applicable;
- no stronger proof/certificate consequence may be synthesized from their absence.

This does **not** block an independently qualified ordinary-value q/RBA boundary consequence. If neither value-boundary closure nor stronger proof closure applies, recursive exact W/D/L remains the fallback.

The target implementation direction is to close more residue by exact structural/value consequences while preserving recursion as an exact fallback/control, not to disguise recursive enumeration as certificate derivation.

## Exact frontier consequences currently admitted

Subject to first-win stopping and the maintained native residual frontier:

- a playable current-player singleton completion is an exact terminal win at physical distance `+1` ply;
- two or more distinct playable opponent singleton completions are an exact forced loss at physical distance `+2` plies when no current-player immediate win supersedes them;
- one playable opponent singleton completion gives a forced transition but does **not** by itself determine an exact value;
- bilateral residual exhaustion is an exact draw certificate;
- structural move-order effects remain advisory unless a separately qualified theorem upgrades them to an exact value or interval consequence.

Unlike the historical finite-horizon implementation, the active native solver does not fall through to heuristic evaluation. If structural consequences and guarded certificates do not close a state, the current backend recursively resolves exact W/D/L over the remaining native state transitions.

## Native exact residue solver

### Qualified native advisory move ordering

The default unresolved-recursion policy is the qualified playable-singleton
effect order. This is an implementation-policy promotion; C4-0011 retains its
declared Candidate status and the ordering creates no new value theorem.

After exact cache/native/certificate/value-boundary closure and any forced
transition, a quiet nonterminal node strictly below the external root may
promote one legal column ahead of the remaining center-first order:

1. two distinct own playable singleton completions after the move;
2. one own playable singleton completion after the move;
3. otherwise no promotion.

Support exposure of an existing opponent singleton immediately above the
landing cell vetoes promotion. Counts are capped at two and deduplicated by
completion cell, not by residual or original winning-line multiplicity.
Equal classes retain the tie order `[3, 2, 4, 1, 5, 0, 6]`. Every remaining
legal move stays available exactly once, in that same order.

The native implementation derives effects from current WSL degree-two
requirements containing the landing cell, current singleton masks, and
support/playability. Pair incidence is compiled once from the standard WSL
vocabulary. Classification does not materialize a child, reconstruct a colored
board, intern residual classes, or add maintained state to gameplay identity.

Normalization may suppress a degree-two requirement only when a singleton
subset already supplies the completion, or when the landing singleton would
have closed the parent as an immediate win. Quiet-node classification therefore
retains the relevant completion-cell effect without original-line multiplicity.

`solve` and `solveValue` establish root scope from the supplied state's actual
ply on each call, including legal imported replays. Root expansion and
value-preserving root move selection keep center-first tie selection. An
external root is not inferred from empty-board ply zero. The solver reports
`metrics.orderingPromotions` as the count of below-root unresolved nodes with
a positive advisory class; it is work telemetry, not proof evidence.

No ordering class may supply W/D/L, a bound, pruning, a certificate, or a change
to q/proof identity. Opponent-residual suppression and own-cofactor proximity
tiers remain excluded. Exact first-win, immediate-win, forced-block and
double-threat authorities retain precedence.

The consumed ordering evidence is the September 15 native singleton-effect
research, preserved at canonical research revision
`104abfbe4444fcd315ac807b46ce2be8da13df39`.
Native implementation qualification and limits are recorded in
`benchmarks/isomax-ordering/README.md`: 96 synthetic roots, repeated independent
processes, unchanged WDL/root moves, 26.43% fewer nodes and 17.55% less aggregate
median time in the pre-promotion comparison. One workload had a small overlapping
timing regression. These observations do not promise universal speedup,
Begin-Hard performance, or an empty-board solve.

### Value recursion

`IsoMaxSolver` consumes `IsometricState` directly.

Its authority order is:

```text
exact transition-cache hit
  -> native exact WSL consequence
  -> applicable guarded IsoMax certificates
  -> qualified exact q/RBA value-boundary consequence when available
  -> forced transition if certified
  -> below-root advisory singleton-effect ordering
  -> exact max/min W/D/L recursion over remaining unresolved residue
```

The value orientation is fixed P0-oriented W/D/L:

```text
+1 = P0 win
 0 = draw
-1 = P1 win
```

No-win certificates narrow the exact interval. Opposing no-win certificates close the state to draw. Contradictory applicable exact/no-win/forced claims fail closed rather than being silently ranked or overwritten.

The recursive backend is deliberately exact and contains no evaluator fallback. Legal move generation remains an implementation mechanism for unresolved residue and does not change the structural solver identity.

## Qualification boundary

### Native Branch Manager execution

The normal execution entry is `solveIsoMax(moves)` or a reusable
`IsoMaxBranchManager` session. The performance command routes through this
manager. `IsoMaxSolver` remains the synchronous native worker kernel and serial
control, not the default whole-host performance entry.

The manager reintegrates the existing worker executor's queue, priority,
dispatch, task identity and failure lifecycle. It supplies bounded native
ordinary-value work proactively. Workers execute packed IsoMax directly; the
historical quotient/Negamax kernel is not an execution dependency.

Tasks carry legal replay roots and the external root ply. Process-local pool
IDs are not wire identity. The manager deduplicates exact q in its own pool;
proof/certificate identity does not collapse into q.

Only an exact worker result carries WDL. A bounded scheduling yield carries its
unfinished native dependency path and already exact sibling values, with no
value for unfinished work. The manager resumes those dependencies instead of
restarting the parent proof. Forced edges remain single edges, native terminal
facts retain precedence, and parent values reduce in fixed P0 coordinates.
Root witnesses retain center-first ties regardless of completion order.

Queued obsolete work retires before execution. Busy workers complete their
bounded native task or observe the manager-owned task-necessity word at a
scheduled local control check. Retirement unwinds to the exact task root and
reports no WDL; it neither inspects the queue nor interrupts recursion to take
another task. A completed exact value remains valid if retirement arrives
later. A global deadline, failure or explicit session close may abort execution.
Incomplete work, worker death and capacity failures must never be reported as
a draw. Every owned worker must be drained or terminated.

The ordinary-value worker prepares and seals typed search storage before each
bounded quantum. Residual/chunk capacity, reference width and exact-cache
rehashing/copying belong to preparation, never recursive growth. A sealed
capacity violation fails closed. Preparation preserves warm identities/values.
Recursive native consequences use scalars; immutable proof-facing views are
preloaded. Continuation packaging occurs after recursive unwind, and periodic
report serialization/output belongs to a reporting worker outside recursion.

The default is min(4, available logical CPUs minus one), at least one worker.
The qualified four-worker admission policy targets a root-relative three-ply
q frontier, bounded by 64 manager expansions per scheduling turn and the existing
capacity limit. `rankCutDepth:0` retains the control; other worker counts default
to zero. This is task admission only, not a solve-depth cutoff or new value rule.
An explicit worker count remains available. The solve deadline is at most
120 seconds. Worker count is a resource policy, not an exactness premise or
an assertion that more workers improve latency.

This parallel profile currently accepts ordinary legal replay roots without
custom certificate indexes or optional RBA resolver objects. Those existing
synchronous APIs remain supported explicitly; no transfer of guarded proof
objects across workers is implied. There is no shared recursive TT yet.
See `components/isometric/execution/README.md` for retained-state bounds,
cleanup, qualification and known performance limitations.

Current native qualification includes:

- exact construction of the 625-term standard WSL universe;
- reflection involution over all 625 terms;
- independent reconstruction of both residual antichains from the 69 physical winning lines over deterministic game prefixes;
- exact play/undo and first-win stopping;
- mirror-equivalent structural and transition signatures;
- typed guard applicable/inapplicable/unresolved behavior;
- guarded certificate transfer across reflection;
- proof-identity deduplication independent from transition identity;
- exact native frontier win/forced-reply/double-threat consequences;
- native recursive W/D/L agreement and value-preserving move selection against an independent physical-board minimax oracle on late roots;
- fail-closed contradictory-certificate behavior;
- exact Node 26.7.0 CI qualification.

Future q/RBA value-boundary integration must additionally qualify:

- exact boundary/result agreement on pinned persisted RBA controls where applicable;
- W/D/L and value-preserving action agreement against the retained recursive/oracle path;
- boundary-query identity under q/support and horizontal reflection;
- no proof/certificate reuse inferred from ordinary value equality;
- exact factor-order/orientation/projection-pruning invariance for any optimized evaluator;
- recursive-residue reduction reported together with boundary construction/query cost.

These controls qualify the implemented standard-board semantics they exercise. They do not prove completeness of the broader structural calculus, future temporal/resource/realizability guard languages, or a universal board-family quotient.

## Proof and qualification rules

- Structural theorem claims require their stated guards; finite solved tables and stronger/deeper searches are validation/falsification evidence, not theorem premises.
- Unknown is not loss, absence of a forcing certificate is not draw, and lower residual degree is not signed value without a qualified coupling.
- Exact certificates retain support, resource, controller/opponent quantifiers, deadlines, and first-win timing where those facts affect validity.
- Unimplemented guard semantics remain unresolved and may not authorize reuse.
- Transition-cache reuse is legal only under a state identity sufficient for the stored semantic claim.
- A structural hash/signature is a candidate locator, not proof of semantic identity.
- Advisory ordering evidence must be qualified across independent workloads before promotion; a reduction on one fixture is not enough.
- Historical incumbent/Negamax behavior is evidence, not compatibility authority when a semantic defect or cleaner native ownership boundary is established.

## Ownership and migration

The branch `solver/isometric` is the active branch for this solver family.

`research/terminal-frontier-horizon-exact` and draft PR #45 remain historical
provenance. Implementation, solver contracts, implementation qualification and
current-state routing belong on `solver/isometric`. Durable theorem development,
research experiments and canonical semantic authority belong solely on
`research/semantic-quotient`, per the current research-ownership decision.

This repository is pre-alpha. No compatibility adapter, parallel legacy Isometric state, migration wrapper, or evaluator fallback is required merely to preserve the superseded inherited implementation path.
