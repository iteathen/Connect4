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


## 2026-10-16 — input-specific backward proof generator established

The prior complete recursive q core is exact, and branching is permitted.
The desired optional next achievement is fewer separately evaluated strategic
alternatives. An input-specific P0 winning-region proof **has now been
produced and independently backward-checked** on the empty 4x3 Connect-3
board:

- **46 P0-win generators**, **72 proof edges**, winning opening
  **column 2 (one-based)**;
- **34 one-choice P0 policy nodes**, **12 universal P1 nodes**
  and **38 complete P1 reply obligations**;
- independent direct physical replay, exact residual cofactors,
  first-win terminal and rank checks, plus one guarded P0-favorable
  generator reuse; five malformed/false proofs rejected;
- matched winner-only discovery *without* favorable reuse needed
  **47 generators/73 edges**: strong specialization benefit relative
  to the full-value reference, but only one extra improvement from
  the current order equivalence.

Research synthesis:
`docs/research/2026-10-16-input-specialized-winning-region-certificate.md`.
Evidence:
`research/isograph/discovery/2026-10-16-algorithmic-core/INPUT_SPECIALIZED_ROOT_WIN_CERTIFICATE_0_1.json`
and `INPUT_SPECIALIZED_PROOF_CONTROL_RESULTS_0_1.json`.

This is a genuine compact **positive P0 win** certificate for one
small board. It does **not** establish branch-free computation: the
discovery still recursively explores candidate obligations and the
checker explicitly covers all P1 replies. There is no change to
qualified authority 1.2 or any proof of a 7x6 winning move.

**Next GSP-004 structural target:** derive one sound, guarded
*universal predecessor containment* over the certified winning-region
antichain to discharge some or all of those 38 P1 action alternatives
without enumerating a distinct future solve for each. Exact gravity,
resource/race/first-win guards and honest algorithmic work counting
are required. Do not call a single returned AND value branch elimination
when it still enumerates the entire opponent response graph.


## 2026-10-16 — exact search-free local alternating quantifier fusion

**Correction to earlier "input-specific backward proof" direction:** the
46/47-node winner proofs were constructed using forward policy search.
They remain **validation fixtures only**; generating further searched
proof DAGs is *not* the proposed nonbranching method.

The first exact **rule-derived alternative** has now been implemented
and independently tested:

1. Given P1 to move, derive P0 immediate threat mask T, P1 immediate
   terminal mask B, and P0 latent upper threat mask U from the CURRENT q.
   A single bitmask equation identifies exactly all P1 replies that
   leave P0 an immediate first win. This removes an entire one-opponent
   universal reply layer without materializing any opponent child state.
2. The same condition is an O(W^2)-term monotone Boolean polynomial:
   guard away immediate P1 wins and require either two existing P0
   threats, one same-column upper relay, or an upper relay for every
   legal P1 response.
3. The P0 owner-true cofactor pulls that polynomial directly back
   through a proposed P0 placement using only original q residual
   shapes of sizes 1 and 2. This yields **all P0 first moves that force
   winning within the next two P0 own moves**, a closed
   **P0 OR / P1 AND / P0 OR** operator. No candidate policy search,
   recursive q value solve, or child q materialization is required.

Deductive derivation and explicit terminal/support guards:
`docs/research/2026-10-16-local-alternating-quantifier-fusion.md`.

Independent oracle-free physical controls:

- **70,200 / 70,200 P1 states**, exact favorable-opponent-reply mask
  and matching polynomial, no disagreements;
- **68,720 / 68,720 P0 states**, exact two-P0-own-move action mask
  against both the independent q-cofactor reference and direct
  physical continuation checker, no disagreements;
- 160,554 P0 candidate first actions tested; **143,280** child q
  objects constructed by the earlier comparator versus **zero**
  by the direct parent-q pullback; local source membership work
  counted separately;
- broken immediate-P1-win, upper-threat and pair-source-cofactor
  guards were all falsified by actual legal physical positions;
- standard7x6 controls over `44444`, all seven rank6 replies,
  and 12 generated late cases plus predecessors: zero mismatches.
  No 7x6 eventual win claim follows.

These are **genuine fixed-horizon quantifier eliminations**. They do
**not** prove full arbitrary-depth branch elimination, a polynomial
game-value procedure, minimality, or the P0 winning condition for
`44444`.

**Next exact GSP-004 seam:** derive the guarded `P1 universal
preimage of the source-q two-own-move winning region` as one
algebraic object. The new operation may require size-three source
residuals and mixed-response correlations; compare against existing
RBA antichain semiring and exact cofactor adjoints *before* inventing
another semantic mechanism. Do not enumerate action words as disguised
search. Verification uses exact q/physical solvers **after** a candidate
law is mathematically derived.


## 2026-10-16 — four-ply original-q universal predecessor and quantifier-scope boundary

A **rule-only** response-cover operator now composes the precise
`P1 FORALL / P0 EXISTS / P1 FORALL / P0 immediate terminal EXISTS`
pattern without constructing any child q or running recursive
game-value search.

For source P1-to-move q, each possible P0 action a has one bitmask
K_a of original P1 reply columns b against which P0 may choose a
*after seeing b* and guarantee a first win on its first/second own move.
The exact bounded conclusion is **union(K_a) equals the original legal
P1 mask**, with all first-win and board-draw guards included.

The code uses only original R0/R1 singleton and pair residual
requirements, original support arithmetic, and O(W^3) local
action-column incidence/membership work. This is **bounded-depth
quantifier composition**, not an algorithm for full game WDL.

- Complete 4x3/4x4 cofactor qualifier: **70,200 P1 positions**,
  **310,120 b,a response rows**, **zero** source/child-cofactor
  mask disagreements.
- Direct physical first-win independent qualifier: all 2,208 4x3
  P1 states plus 31,501/67,992 4x4 states (bounded by fixed 800k
  transition ceiling), **zero** disagreements; do not mislabel
  the partial 4x4 physical subset as exhaustive.
- Standard7x6: literal `44444` plus 12 seeded rank35 P1 states:
  source original-q, child-cofactor, direct physical and mirror
  results agree; two late states satisfy the bounded predicate.
- Reference reconstructed 133,392 P1 child q states across small
  games while original-q algebra created zero, but source operator
  made 3,438,998 residual membership queries; **no universal
  runtime speedup** claimed.
- Real physical counterexamples reject omission of **both**
  necessary size-two source cofactor antecedents.

**Load-bearing algebraic obstruction: quantifier order.** In actual
legal 4x3 prefix `223`, the family K=[0xe,0x4,0xe,0x7]
covers the full legal P1 mask 0xf *in union*, but no one P0 action
covers it alone. A physical checker replays and confirms this.
The complete small-board census finds **2,584 P1 states** whose
bounded success requires action choices adaptive to b.
Therefore an outer P0-first transformer must preserve the **full
action-labelled cover family**, not collapse it to its union. An
inclusion-maximal nonzero cover-antichain is exact for both union
coverage and existence of a full individual response cover.

**Next guarded GSP-004 target:** pull back a **family** of maximal
action-labelled covers through one preceding P0 true cofactor via the
qualified residual-upset/adjunction laws, not a bare union or
search-generated policy. Measure whether mixed reply correlation
forces antichain width blowup. Do not simply nest loops over five-ply
move words and call that algebraic branch elimination.

Proof, controls and exact witnesses:
`docs/research/2026-10-16-response-cover-next-quantifier-law.md`;
`research/isograph/discovery/2026-10-16-algorithmic-core/UNIVERSAL_RESPONSE_COVER_RESULTS_0_1.json`,
`UNIVERSAL_RESPONSE_COVER_7X6_RESULTS_0_1.json`,
and `RESPONSE_COVER_QUANTIFIER_SCOPE_RESULTS_0_1.json`.

Current qualified WDL core remains constructively complete despite
the optional general nonbranching question still being OPEN.
