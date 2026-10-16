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


## 2026-10-16 — candidate-first backward generator certificate

The next GSP-004 vertical experiment is no longer an open-ended verification
traversal. The exact G2 support-fiber equivalence is now checkable by a compact
column-map certificate and finite local incidence/cofactor obligations:

- `docs/research/2026-10-16-equivalence-first-wdl-quotient.md`;
- `research/isograph/discovery/2026-10-16-oracle-compiled-frontier/G2_REVERSE_CERTIFICATE_RESULTS_0_1.json`;
- `research/isograph/discovery/2026-10-16-oracle-compiled-frontier/G2_REVERSE_CERTIFICATE_ADVERSARIAL_RESULTS_0_1.json`.

To move vertically from **equivalence** to **winning-move proof**, apply
`docs/research/2026-10-16-generator-backward-winning-certificate.md`.

The proposed certificate is an oracle-blind family of claimant-favorable
upward-closed regions, represented by minimal residual generators on the
necessary G2 fibers. Verify the supplied family **backward**, generator by
generator:

- claimant turn: certify at least one immediate win or child-region inclusion;
- opponent turn: certify every legal reply;
- require terminal correctness and first-win guards;
- use the physically decreasing rank to establish progress;
- transport equivalent fibers through the exact G2 witness without forgetting
  extra CPC/NDC reservation, response, race or deadline premises.

This is a **sufficient certificate condition**, not yet a 7x6 certificate.
It does not justify expanding the certificate into another rank-complete
frontier or disguising recursive game search as verification.

For `44444`, the next objective is a *small structurally derived P0-winning
generator family* covering the current q and all seven possible P1 replies.
The previous 2,108-state center-prefix boundary is historical discovery
evidence, not an instruction to enumerate those states anew. A failing
`(fiber,generator,reply)` is the correct next research output if the proposed
family does not close.


## 2026-10-16 — turn-six local closure and precise remaining guard

See `docs/research/2026-10-16-turn6-bidirectional-certificate-campaign.md`.
The previous 2,108-state restricted-response UNKNOWN boundary is **not** an
instruction to re-run a complete search. New exact, bounded reverse checks
establish:

- `44444` has seven P1 replies but four mirror-equivalent structural
  classes; the seven local q cofactors agree with physical first-win replay.
- Every rank-6 child has P0 residual minimum length three.
- A verified four-class P1 short-horizon strategy prevents P0 from forcing
  a win on P0's next **three** moves after every P1 turn-6 choice. This is
  a delay result only, not a refutation of eventual P0 winning.
- A positive P0-winning state `444444273` has distinct immediately legal
  terminal landings 1 and 5 and no immediate P1 terminal. Its fork is checked
  against all six P1 replies.
- Backward direct certificates establish P0 wins at the three rank-8 states
  `44444422`, `44444426`, and `44444427`: P0 plays 3, generating that
  double threat. These are genuine limited P0-winning generators, not
  extrapolations from perfect-play oracle labels.
- The same simple P0 policy is **not** yet a win certificate from
  `4444442`. P1 replies **1, 3, 5** remain outside the supplied positive
  winning region.

The three P1 interventions have concrete missing guards:

```text
b=1 -> right current P0 terminal landing c5,r1, blockable by P1
b=5 -> left current P0 terminal landing c1,r1, blockable by P1
b=3 -> latent P0 diagonal landing c5,r4 needs three
       gravity prerequisites; zero-reservation CPC owner is P1
       (N=31 at ply 9, rho parity correction needed is odd)
```

All columns/rows above are one-based. The zero-reservation CPC owner is
**conditional baseline control**, not a legal future-ownership certificate:
no valid parity correction, reservation schedule or first-win deadline has
yet been derived for the diagonal target.

**Next vertical proof obligation:** derive an exact CPC/WSL/NDC guard which,
for each of these three interventions, either forces an additional independent
simultaneous P0 threat, certifies a realizable and timely ownership-control
change, or transports into a separately verified P0-winning generator.
Check this in the existing fixed-support antichain/quantified predecessor
calculus; do not add another unrestricted depth or support-fiber census.

The P0 winning-claim for `44444` remains **OPEN** and no authority or
production adoption follows from the local certificates.
