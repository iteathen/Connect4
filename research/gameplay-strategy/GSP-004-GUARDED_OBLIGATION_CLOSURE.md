# GSP-004 — Guarded obligation closure

**Status:** rough proposal / highest-risk highest-upside  
**Goal:** derive game value from structural obligations rather than enumerating the q graph.

## Proposal

Complete the missing structural composition rule:

~~~text
MixedCofactorConsequence
+ AdmissibleSupport
+ UniversalInterventionStability
+ SharedResourceAccounting
+ FirstWinBeforeDeadline
-> CertifiedObligation
~~~

Then iterate exact obligation/proof closure until the root is classified.

## Why this matters

The q-congruence result solves the state-identity problem, but q still describes a future game rather than directly stating its value.

A complete guarded obligation calculus could transform:

~~~text
initial q
-> structural consequences
-> obligations / blockers / response constraints
-> exact terminal or no-win facts
-> W/D/L
~~~

without recursively traversing every successor.

## Implementation ideas

Start from the preserved A/B six-ply collision:

- retain full residual antichains;
- apply exact owner-labelled cofactors;
- represent opponent choices universally;
- share equal consequences across variants;
- account for support, response capacity, deadlines, and first-win stopping;
- stop when a genuinely new consequence type is required.

Compile obligations into a proof DAG rather than a move tree.

## Required discipline

- degree drop is not obligation birth;
- eventual ownership is not ownership-before-deadline;
- absence of Hall deficiency is not draw evidence;
- solved labels are falsifiers, never premises;
- a new primitive is allowed only after existing affine/clause/guarded consequence forms fail exactly.

## Success condition

An empty-root proof obtained from structural closure alone, with no ordinary minimax recursion and no hidden exhaustive successor traversal.

## Current center-prefix discovery checkpoint

[Dimension/parity and center-boundary controls](../isograph/discovery/2026-09-29-center-proof-cycle/PARITY_DIMENSION_RESULT.md)
retain the existing strict-followup draw theorem and test a stronger restricted
policy: take an immediate win, otherwise follow up. On standard 7x6, starts
4/444/44444 reach the same 2108 unresolved boundary states and no draw endpoints
within that policy. This is bounded research evidence, not a completed winning
certificate or production optimization. The next obligation is to cover those
states with compatible response/deadline rules or derive a necessary earlier
control switch. External board-size outcomes are discovery evidence only.

## Nim-like control-parity algebra lead

The active hypothesis [NIM_LIKE_CONTROL_PARITY_ALGEBRA.md](../hypotheses/NIM_LIKE_CONTROL_PARITY_ALGEBRA.md)
adds an algebraic discovery route to GSP-004.

The proposal is not that columns carry simple nimbers. The latent value may be
complex and may depend on geometry, residual obligations, support/control parity,
shared resources and first-win deadlines. The candidate simplification is that
compatible control contributions may compose/cancel by XOR or another small
GF(2)-derived law after the correct guarded representation is found.

Treat XOR as a candidate operation to derive, never as a value premise. A
rule-only experiment must first establish nontrivial cancellation relations and
translate them back into explicit geometry. Only an independently proved bridge
from such algebra into CertifiedObligation may affect W/D/L closure.


## First bounded control-algebra result

The rule-only experiment
[CONTROL_ALGEBRA_RESULT.md](../isograph/discovery/2026-09-29-center-proof-cycle/CONTROL_ALGEBRA_RESULT.md)
now supplies bounded evidence for the algebraic route.

On standard 7x6, the single-defect response family has 20 ownership-labelled
winning-line incidence generators of GF(2) rank 19. The unmatched center-top
event raises the rank to 20. The recovered pair relation is the XOR of all
three ordinary response pairs in columns 1,3,5,7.

The 2,108 unresolved support boundary has no linear or quadratic vanishing
identity in the declared 12-bit pair-count encoding, exactly two cubic
identities, and a degree-four vanishing space sufficient to separate all 1,987
rule-derived immediate-win comparison states.

The dimension perturbation across widths 4..10 and even heights 4/6/8 found the
same one-pair-relation / one-independent-unmatched-defect structure in every
geometrically safe single-defect family.

This strengthens the case for XOR as a **composition/cancellation operation**.
It does not identify the latent value being composed and does not establish a
W/D/L map. The post-hoc board-outcome comparison explicitly falsifies that
over-strong interpretation: 7x4, 7x6 and 7x8 share this first algebraic skeleton
while their external outcomes differ.

Accordingly, the next GSP-004 burden is to derive the missing guarded refinement:

~~~text
GF(2) control syndrome
+ support/deadline/resource state
+ universal intervention stability
    -> CertifiedObligation
~~~

The syndrome is evidence for structure, not a substitute for the guards.
