# Claim-Relative Typed-Event Signature Library and Primitive Factorization

**Date:** 2026-09-13  
**Branch:** `research/frontier-negamax-conformance`

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

This artifact records the executable claim-relative theorem-reuse layer and the first cross-claim primitive factorization.

Governing rule:

> Erase a distinction only when the forgotten distinction is a congruence for the exact downstream claim being proved.

The implementation lives above the ordinary C4-0010 value identity and does not redefine it:

`q = exact support + normalized R0 + normalized R1`.

A theorem signature may observe E/P/R/C/N/terminal/provenance facts only when those facts are ancestors of the declared claim observation. Context outside that backward dependency cone remains live as opaque context and is not asserted equal across theorem instances.

## Generic interface

Implementation:

`research/semantic-quotient/state-identity-unification/src/quotient-claim-relative-typed-event-signature.mjs`

Required operations now exist:

- `DependencyCone_of_claim(claim, context, event)`
- `Canonicalize_typed_cone(cone)`
- `Verify_structure_preserving_renaming(leftCone, rightCone)`
- `Instantiate_theorem_with_opaque_nonincident_context(theorem, exemplarSignature, targetSignature)`
- `TypedEventSignature(claim, context, event)`

An event theorem is a finite typed dependency graph. Nodes carry semantic layers (`E`, `P`, `R`, `C`, `N`, `terminal`, `provenance`, `claim`); edges point prerequisite -> consequence; the claim names observation roots. `DependencyCone_of_claim` retains the exact backward ancestor slice.

Physical cells/resources are typed symbolic variables with optional concrete bindings. Concrete bindings do not enter the canonical key. Canonicalization uses exact finite permutation within invariant partitions after color refinement. The default hard bound is 100,000 candidate permutations; exceeding it is an explicit failure, not a heuristic fallback.

A successful isomorphism emits a concrete typed renaming witness. A failed merge emits the first canonical separator.

The theorem-instantiation boundary explicitly denies stronger implications:

- no q equality;
- no full-successor equivalence;
- no provenance equivalence;
- no later-strategy equivalence.

## Generic qualification

The bounded abstraction suite passes 9/9 controls. Important hostile controls include:

- terminal-policy mismatch rejects singleton reuse;
- P0-terminal same-column macro rejects stutter reuse;
- distinct-column guard rejects same-column phase transport;
- pure phase transport may forget incident residual class, while the stronger local-repair-effect claim must retain it;
- canonicalization has an exact permutation bound.

This makes “irrelevant context” a claim-relative statement rather than a global property of a physical state.

## Exact replay-qualified seed library

### `enabled_singleton_discharge`

Exact C4-0010 contexts:

- center serialization target C1, sequence `45112`;
- latent target C3, sequence `466565554644373`;
- latent target G3, sequence `466565554644377`.

Result: **3 physical contexts -> 1 canonical claim theorem**.

### `same_column_stutter_preserves_latent_contract`

Exact fixed-state macros:

- A1->A2
- B1->B2
- D5->D6
- E5->E6
- F5->F6

Each is rank +2, GF(2) displacement 0, preserves C3/G3 singleton facts, and is nonterminal over the macro.

Result: **5 physical macros -> 1 canonical claim theorem**.

### `cross_support_pair_establishes_two_chain_stage`

At `466565554644`, both mirrored support macros were replayed exactly:

- P0:C1 -> P1:G1
- P0:G1 -> P1:C1

Each advances rank by two, leaves C2/G2 as the next support events, preserves latent C3/G3 singleton facts, and remains nonterminal.

Result: **2 physical macros -> 1 canonical claim theorem**.

### `phase_defect_transport`

Across the fixed `4665655*` controls, all exact legal nonterminal distinct-column two-ply macros with opposite endpoint phase bits were enumerated. The GF(2) law was rechecked for every retained macro:

`phi' = phi + e_a + e_b`.

Result: **92 physical transport macros -> 1 canonical pure-phase theorem class**.

This does not collapse the stronger local repair-effect semantics. Incident R/cofactor data remains a required separator when the claim observes residual effects.

### `size_two_response_capacity_circuit`

All 3x3 = 9 nonempty two-obligation/two-slot response-neighborhood models were enumerated. Exactly two are Hall/rank violations: both obligations have the same sole response slot. Those two label choices canonicalize to one size-two circuit theorem.

Result: **9 finite matching models, 2 violations -> 1 circuit theorem class**.

Boundary: this is exact once obligation neighborhoods are supplied. The general Connect4 strategic-certificate -> obligation/response-slot mapping remains incomplete and is not promoted by this result.

### `universal_hinge_generates_two_latent_singletons`

At exact prefix `4665655546`, P0:D3 is nonterminal and cofactors the two incident P0 residual pairs into singleton obligations C3 and G3. All seven legal P1 replies were replayed:

- no reply is immediately P1-terminal;
- C3 remains a P0 singleton after every reply;
- G3 remains a P0 singleton after every reply.

Result: **1 physical hinge context, 7/7 legal P1 replies checked, one exact one-reply-horizon theorem**.

Boundary: this is not a later strategy theorem.

## Qualification runs

Commit `722d2f69a289bf40561f24aef9ae115a10f260d1` introduced the generic library. Workflow run `34804665143` passed the 9-control generic suite plus the first two exact C4 replay classes.

Commit `27fe94853a8a6625b6a79c9ff80bf68374a381d7` added the remaining four seed qualifiers. Workflow run `34805072309` passed all stages. Its exact output reported:

- cross-support: 2 physical contexts -> 1 class;
- phase transport: 92 physical contexts -> 1 class;
- response capacity: 9 models, 2 violations -> 1 abstract class;
- hinge: 7 legal replies exhaustively checked.

Commit `41acdedf735d2d0532ccaee1cc4fe6708b373dff` added the cross-claim primitive factorization control. Workflow run `34805220177` passed the full four-stage suite and confirmed the exact hinge-to-latent-root bridge.

All focused workflow steps retain a five-minute job wall and 270-second inner process bounds.

## First cross-claim primitive factorization

The seed library is smaller than six unrelated rule names.

### R primitive: monotone residual cofactor

The same exact residual operator specializes in two opposite ways:

1. **own event / shrink:** P0:D3 removes D3 from the incident P0 residual pairs `{C3,D3}` and `{D3,G3}`, yielding singleton residuals `{C3}` and `{G3}` after antichain normalization;
2. **opponent event / kill:** P1 claiming an enabled P0 singleton cell kills every P0 residual term containing that cell, including the singleton term itself.

Thus `universal_hinge_generates_two_latent_singletons` and `enabled_singleton_discharge` are different claims built from one R-layer primitive operator.

### P primitive: two-ply GF(2) column operator

The same exact phase operator

`phi' = phi + e_a + e_b`

specializes to:

- `a=b`: zero phase displacement, used by same-column stutters;
- `a!=b`: two-coordinate toggle, including phase-defect transport.

Thus stutter preservation and phase transport are not unrelated phase rules; they use one P-layer primitive with different equality/claim conditions.

### Partial C factor

Cross-support response obligations and the size-two capacity circuit both point to a common response-matching/capacity primitive. This factor is **not yet promoted to a general Connect4 theorem**, because the certificate-to-obligation/response-slot mapping is still incomplete.

## Exact composition seam

There is now a concrete bridge between the hinge theorem and the latent-target temporal-contract state:

`4665655546 -- P0:D3 -- P1:D4 --> 466565554644`.

The second state is exactly the fixed root used by the qualified latent C3/G3 cross-pair scheduler.

This does **not** prove a P0 win. In fact, the target-only scheduler shows that the two latent singleton obligations are locally defensible in that subsystem. The importance of the bridge is that it provides a real theorem-composition seam where the next calculus can be tested without reconstructing the physical game tree.

## The missing calculus is now specific

Claim-relative isomorphism solves **theorem reuse**. It does not by itself solve **theorem composition**.

A sound composition rule still has to prove that the conclusion of theorem A satisfies the exact premises of theorem B while threading:

- temporal-contract state;
- event order and side-to-move;
- CPC/GF(2) phase;
- resources and deadlines;
- NDC guards;
- terminal alternatives;
- opaque nonincident context;
- provenance when observable.

This is the next mathematical seam. Without that calculus, a collection of individually exact local theorems cannot be promoted into the alternating fixed-point proof `W`.

## Negative boundaries retained

This work does not prove:

- empty-board/root W/D/L;
- center opening `4 ∈ W`;
- a 69 -> 28 reduction of geometric winning lines;
- that phase weight classifies game value;
- that a response-capacity circuit applies before exact obligation/slot mapping;
- that local theorem isomorphism implies q equality;
- that the hinge theorem alone implies a later win;
- that target-only local defense settles off-subsystem play.

The retained 28 remains a fixed-seam proof-term/witness count, not a geometric-line reduction.

## Next seam

Build a guarded theorem-composition calculus over the typed-event library. The first exact composition control should use the bridge

`4665655546 -> D3 -> D4 -> 466565554644`

and then compose only already-qualified local claims. The composer must reject composition when terminal branches, incident R effects, temporal resource state, or required opaque frame conditions are missing.

The objective is not another named tactical rule. It is a small exact calculus that can assemble reusable theorem instances into a proof of alternating predecessor membership without expanding the physical q-tree.
