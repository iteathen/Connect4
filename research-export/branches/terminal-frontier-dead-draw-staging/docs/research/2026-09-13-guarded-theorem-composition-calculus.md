# Guarded theorem-composition calculus

**Date:** 2026-09-13  
**Branch:** `research/frontier-negamax-conformance`

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

The claim-relative signature library established that physically different Connect Four events can reuse the same exact local theorem when their load-bearing dependency cones are structurally isomorphic for a declared observation. That solved a theorem-reuse problem. It did not prove that independently exact theorems may be chained.

This unit supplies the missing first composition layer.

A composition is admitted only when the upstream contract explicitly supplies every fact required by the downstream contract. There is no implicit state equality, no implicit frame rule, no implicit temporal/resource persistence, and no implicit terminal-branch erasure.

The implementation is:

`research/semantic-quotient/state-identity-unification/src/quotient-guarded-theorem-composition.mjs`

The exact standard-7x6 control is:

`research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-guarded-theorem-composition-control.mjs`

The hostile/positive abstraction controls are:

`research/semantic-quotient/state-identity-unification/src/quotient-guarded-theorem-composition.test.mjs`

## Contract form

Each reusable theorem instance exports an explicit typed pre/post contract containing:

- typed symbolic variables with optional concrete bindings;
- ordinary structural preconditions and conclusions;
- opaque/load-bearing frame preconditions and conclusions;
- temporal/resource preconditions and conclusions;
- accepted, emitted, and explicitly closed terminal alternatives;
- provenance mode plus provenance preconditions/conclusions when observable.

The public operations are:

```text
Export_typed_theorem_contract
Unify_conclusion_with_premise
Verify_opaque_frame_condition
Verify_temporal_resource_compatibility
Verify_terminal_complete_composition
Compose_theorem_chain
```

A successful link from theorem `A` to theorem `B` therefore has the logical shape:

```text
A.conclusion              |= B.precondition
A.frame.conclusion        |= B.frame.precondition
A.temporalResource.post   |= B.temporalResource.precondition
live(A.terminal)          subset_of B.terminal.accepts
A.provenance.post         |= B.provenance.precondition   when provenance is observable
```

Typed variable names may differ, but their semantic types and concrete bindings must unify. A failed link reports the first exact separating condition rather than returning a generic incompatibility result.

## Deliberately absent implicit frame rule

A theorem does not automatically preserve everything it fails to mention.

That would be unsound for this project because nonincident context is ignorable only relative to a declared claim. The same physical fact can be opaque for one theorem and load-bearing for the theorem that follows it.

Therefore, if theorem `B` observes a frame fact, theorem `A` or an intervening qualified event contract must explicitly re-provide that fact. This forces event-local changes in CPC/NDC state, deadlines, resources, terminal status, or residuals to cross the composition boundary visibly.

The same rule prevents a claim-relative theorem reuse certificate from silently becoming a q-state merge.

## Minimal rejection certificates

The composer retains small separating reasons. Current classes include:

```text
missing_predicate
arity
value
semantic type
concrete binding
joint binding conflict
unhandled terminal alternative
provenance unavailable
```

The objective is not diagnostic convenience alone. These separators identify the exact premise that must be proved before a composition can be promoted into the structural proof.

## Hostile/positive qualification

Focused workflow run `34806311358` on commit `28a9990b9a8c539ee8e890e9d6d115d77ec31d4a` re-ran all prior claim-relative controls and the new composition controls.

The new generic composition suite passed **8/8** checks:

1. typed conclusion unification discharges a renamed-cell premise;
2. a positive link records premise, frame, temporal/resource, and terminal discharge;
3. a pure phase-transport theorem is rejected as input to the stronger local-repair theorem when incident `R` information is missing;
4. a response-capacity circuit application is rejected when no exact obligation-to-response-slot mapping is supplied;
5. a live `P1_terminal` alternative cannot silently disappear;
6. an opaque frame mutation is rejected without a qualified bridge fact;
7. an observable-provenance theorem cannot follow a value-only contract;
8. a temporal theorem is rejected when its deadline/resource state is missing.

This is intentionally a fail-closed calculus.

## Exact D3/D4 composition control

The first physical composition seam is:

```text
4665655546
  -- P0:D3 -->
  -- P1:D4 -->
466565554644
```

The final state is exactly the already-qualified latent C3/G3 temporal-contract root under C4-0010 state identity.

The composition was split into three contracts so that theorem authority and transition authority are not conflated.

### Contract A: hinge D3 instantiation

The qualified hinge theorem supplies:

```text
P0 live singleton C3
P0 live singleton G3
```

The exact C4-0010 D3 transition supplies the bridge-local facts needed for the next event:

```text
after-D3 exact frame token
P1 to move
current-P1-turn reply deadline
```

These latter facts are not attributed to the abstract hinge theorem.

### Contract B: exact D4 event bridge

The exact transition consumes the D3 state and explicitly supplies:

```text
C3 singleton still live
G3 singleton still live
C1 enabled
G1 enabled
P0 to move
exact destination frame token
next-P1-turn response deadline
one defender response slot per attack
```

The destination state id is checked against replay of `466565554644` rather than assumed from the sequence notation.

### Contract C: latent-target contract activation

The already-qualified temporal-contract theorem consumes those exact destination premises and establishes:

```text
latent C3/G3 cross-pair temporal contract active
```

The resulting three-contract chain composes successfully:

```text
hinge_D3_instantiation
-> exact_D4_bridge
-> latent_target_contract_activation
```

This is the first executable multi-theorem chain in the current structural program that is replay-qualified without expanding a q search tree.

## Same-column stutter re-entry composition

The fixed latent state has five qualified same-column external stutter macros:

```text
A1 -> A2
B1 -> B2
D5 -> D6
E5 -> E6
F5 -> F6
```

Each macro was replayed again as part of the composition control. Every pair is legal and nonterminal, returns side-to-move to P0 at rank 14, and leaves both C3 and G3 singleton obligations live.

The active latent contract composes through each of these five macros. Therefore the earlier statement “these pairs preserve the local contract” is now stronger operationally: the theorem-composition layer can accept the contract before the macro and produce an admissible contract state after it without asserting q equality.

## What this closes

The previously missing operation

```text
local theorem reuse -> guarded theorem chaining
```

is now executable for bounded exact controls.

The work establishes that the structural proof system can distinguish three sources of premises:

1. theorem conclusions inherited from an abstract reusable theorem;
2. facts supplied only by an exact intervening C4 event;
3. frame/temporal/resource facts that must be explicitly threaded because they are observed downstream.

That distinction is important. It blocks the common unsound move of letting a theorem's useful conclusion drag along unrelated state facts for free.

## First remaining unproved premise toward center-opening W

The next missing premise is now narrower and has a useful exact name:

```text
well_founded_off_subsystem_progress_or_reentry
```

Required statement:

> For every legal off-target P0 event not covered by a qualified same-column stutter, prove a guarded composition that either re-enters the latent contract, enters an exact response-capacity circuit with a proved obligation/slot map, or strictly advances a well-founded structural progress rank toward a terminal or alternating-predecessor certificate.

Why this is the current blocker:

- target-chain attack orders are already handled by the exact five-state scheduler;
- the five fixed same-column external macros now have exact guarded re-entry composition;
- odd/mixed-column off-subsystem events remain capable of transporting phase/resource defects;
- previous controls proved that such a repair can transport rather than erase the defect;
- no theorem yet proves that every such transport eventually re-enters the contract, creates an exact capacity overload, or decreases a well-founded rank.

Thus the unknown is no longer “how do we compose theorem A with theorem B?” It is “what exact progress invariant controls the remaining off-subsystem event classes?”

## Next bounded research direction

Use the already-qualified local-effect domain instead of a physical move tree:

```text
20 exact repair transitions
-> 12 exact local semantic-effect classes
   8 reused classes
   4 singleton classes
```

Export guarded contracts for those classes and build a directed **theorem-class** transition relation only where exact retained evidence supplies the edge.

For each non-stutter class, attempt to prove one of:

```text
exact latent-contract re-entry
exact terminal alternative
exact response-capacity circuit, but only with a proved obligation/slot map
strict decrease in a candidate well-founded structural rank
```

A candidate rank must be derived from exact E/R/P/C/N structure. Phase weight by itself is forbidden as a rank because phase-defect transport can preserve or relocate the defect. If no rank exists for the current vocabulary, the required output is the smallest exact strongly connected class set/cycle that falsifies it, not a fabricated monotonicity claim.

## Boundaries retained

This result does **not** prove:

- center opening belongs to `W`;
- empty-board/root W/D/L;
- a complete later strategy outside the bounded bridge and stutter controls;
- q equality between theorem instances;
- provenance equality from value-only contracts;
- a 69 -> 28 geometric winning-line reduction;
- applicability of a response-capacity circuit before exact Connect4 obligation/slot mapping exists.

There are still exactly 69 geometric winning lines. The retained `28` remains a fixed-seam proof-term/witness count only.

No solved W/D/L label, recursive q-frontier search, Bayesian confidence, or suspected output cardinality was used as proof authority in this unit.
