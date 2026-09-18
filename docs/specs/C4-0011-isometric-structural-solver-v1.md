# C4-0011 — Isometric structural solver v1

**Status:** candidate research specification

**Research direction / structural architecture:** Josh Oshiro

## Purpose

Define the Connect4-owned **Isometric / IsoMax** solver family: the structural-calculus line that grew out of the terminal-frontier experiment but is now independent of Negamax and of the historical incumbent representation.

Isometric is a sibling of the BSFP, Research, and Negamax lineages. Historical descent from a forward search experiment does not make Negamax recurrence, value orientation, proof procedure, board-state layout, heuristic evaluation, or branch ownership authoritative here.

The active implementation now has a native WSL residual state and an exact recursive residue backend. Recursive value backup remains subordinate execution machinery for states not closed by structural facts or guarded certificates; it is not the solver-family identity.

## Shared structural dependencies

Read and preserve the shared Connect4 meanings from:

- **C4-0001** — legal Connect Four domain and first-win stopping;
- **C4-0006** — control parity, support/event semantics, residual win-space requirements, blocker semantics, antichain/exhaustion semantics;
- **C4-0007** — nested dependency closure, certificate, response/resource, timing and deadline semantics.

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

## Identity and authority separation

IsoMax must not force structural grouping, behavioral identity, representation identity, and proof reuse to use one key.

### Ordinary gameplay identity q

For legal nonterminal standard-7x6 states, the current canonical research candidate future-behavior identity is:

```text
q =
    support/accessibility
    + normalized P0 residual antichain
    + normalized P1 residual antichain
```

Under standard alternating no-pass play:

- rank/ply is derivable from support;
- side to move is derivable from rank parity;
- terminal outcome is emitted by the transition that first completes a win or fills the board and is not an additional nonterminal q coordinate.

The canonical research q-congruence derivation is newer than this branch's original specification and remains a research candidate pending its own authority/qualification cycle. Isometric may consume only the portions independently qualified for its implementation.

The current Isometric implementation already uses the q-shaped triple `(canonical P0 residual class, canonical P1 residual class, canonical support)` as the exact-value transition-cache equality check. Derived/runtime fields may remain physically stored for speed, reversible play, guards, or diagnostics without becoming additional gameplay identity.

A future implementation change must not remove those cached fields merely because they are semantically derivable; removal is an economics decision and still requires exact qualification.



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

## Current structural-closure boundary

The active implementation already represents temporal, resource and realizability guards as explicit unresolved guard kinds. That fail-closed behavior remains correct.

Canonical research has now isolated the next structural-composition seam as guarded obligation birth:

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
- recursive exact W/D/L remains the fallback for unresolved residue.

The target implementation direction is to close more residue structurally while preserving recursive search as an exact fallback, not to disguise recursive enumeration as certificate derivation.

## Exact frontier consequences currently admitted

Subject to first-win stopping and the maintained native residual frontier:

- a playable current-player singleton completion is an exact terminal win at physical distance `+1` ply;
- two or more distinct playable opponent singleton completions are an exact forced loss at physical distance `+2` plies when no current-player immediate win supersedes them;
- one playable opponent singleton completion gives a forced transition but does **not** by itself determine an exact value;
- bilateral residual exhaustion is an exact draw certificate;
- structural move-order effects remain advisory unless a separately qualified theorem upgrades them to an exact value or interval consequence.

Unlike the historical finite-horizon implementation, the active native solver does not fall through to heuristic evaluation. If structural consequences and guarded certificates do not close a state, the current backend recursively resolves exact W/D/L over the remaining native state transitions.

## Native exact residue solver

`IsoMaxSolver` consumes `IsometricState` directly.

Its authority order is:

```text
exact transition-cache hit
  -> native exact WSL consequence
  -> applicable guarded IsoMax certificates
  -> forced transition if certified
  -> exact max/min W/D/L recursion over unresolved residue
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

`research/terminal-frontier-horizon-exact` and draft PR #45 are retained only as historical provenance for the pre-split experiment. New Isometric/IsoMax semantics, implementation, experiments, qualification evidence, and current-state routing belong on `solver/isometric` unless a later explicit ownership decision says otherwise.

This repository is pre-alpha. No compatibility adapter, parallel legacy Isometric state, migration wrapper, or evaluator fallback is required merely to preserve the superseded inherited implementation path.
