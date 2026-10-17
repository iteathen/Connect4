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


## 2026-10-16 — move7-to-move8 column transition and arbitrary-rank cofactor closed

Following the owner's proposal to test through the filled center column
and onward **to completion**, the research now establishes a general
**fixed-history residual transition** algebra across *every* legal
first-win-stopped rank:

```text
Ri_after = Min({r minus Ai | r in Ri_source
                             and r intersect Aother is empty})
```

where A0/A1 are the subsequent P0/P1-owned cells. Source upset
membership follows by testing the same original residuals against
`S union Ai` under the opponent blocker guard. The terminal
test must still be executed in move order, and a full column must
be identified by support height H rather than parity alone.

The direct virtual cofactor passed **every** move-7 and move-8 path
following `44444` (384 replayed physical/q transitions, 122,928
upset comparison identities, 324 move8 histories) across all three
timings of center completion. It lifted the existing exact P1/P0
response-cover family through the P0 move7 true cofactor with
**zero successor q materializations** and matched all 324 move8
two-P0-own-move response predicates. Source-mask response queries
yield finite-horizon, not W/D/L-optimal, move8 defensive alternatives.

The arbitrary-depth owner-mask transformer additionally passed
**90 complete independent 7x6 game playouts**, including **eight
42-cell draws**, all ranks1..42, 291 full-column events,
2,549 nonterminal q comparisons and 10,812 source-upset
queries, with zero discrepancies. Missing opponent blockers
and treating phase-even as playable on a filled column were
rejected by explicit negative controls.

**This closes the column-full local transition problem. It does
NOT close full strategic value.** For example the input-only
five-ply formula correctly says no P0 first action wins by its
third own turn from empty 4x3 Connect-3, while the complete
exact WDL q core independently gives P0 WIN and all four
opening moves WDL-optimal. Thus source cofactor path
compositionality is necessary but insufficient for nonbranching
arbitrary-depth game-value computation.

**Next GSP-004 task:** derive exact compact repeated composition
of the **action-labelled maximal adaptive response-cover FAMILY**
with alternating existential/universal choices. Preserve
reply/action correlations, first-win precedence and shared
capacity/deadline guards. Use the now-proved owner-mask upset law
as the source-state substitution; do not invent another
column-completion state rule, enumerate long move histories as
candidate policy search, or extrapolate one fixed horizon to WDL.

Full derivation and reproducible evidence:
`docs/research/2026-10-16-column-completion-through-full-game.md`;
`research/isograph/discovery/2026-10-16-algorithmic-core/MOVE7_MOVE8_COLUMN_CLOSURE_RESULTS_0_2.json`,
`ALL_DEPTH_OWNER_MASK_RESULTS_0_1.json`,
`ALL_DEPTH_TRANSITION_NEGATIVE_RESULTS_0_1.json`,
and `SHORT_HORIZON_VS_FULL_WDL_GAP_RESULTS_0_1.json`.

No authority revision, production solver merge, general minimality claim
or arbitrarily deep nonbranching algorithm has been established.


## 2026-10-16 — interval BDD witness for open adaptive cover problem

The exact source-q owner-mask transition and turn7/8 full-column
mechanism remain closed; they are no longer the missing primitive.
A source-q anchored four-threshold WDL interval Bellman BDD can
exactly derive all literal actions when its lower/upper bounds
converge, without searching colored game-state continuations.
The resulting AND/OR quantifier **fanout remains encoded** in its
support DAG, so a single returned BDD is not sufficient to prove
the preferred general nonbranching algorithm.

Canonical standard7x6 `44444` is still UNKNOWN [-1,+1]
after **eleven symbolically composed plies**. Exact source q reflection
and source-residual-frequency owner-variable order compress that
depth to 9,366 support representatives (18,620 ordinary), under
the old 60k-node/300k-operation/10k-support/15s limits.
Depth12 requires 13,524 support orbits and is not currently qualified.

**Next structural obligation:** derive an additional exact
*adaptive action-labelled response-cover* quotient that survives
further alternating P0/P1 quantifiers without discarding literal
action compatibility. It must be stronger than source horizontal
reflection; false shortcuts include replacing `forall b exists a`
by `exists a forall b`, as explicitly falsified on legal prefix
`223`. No searched certificate may be used to produce the
new algebra. Once frozen, current source-q interval BDD and
independent physical/q solvers are validation oracles only.

Full record:
`docs/research/2026-10-16-source-anchored-interval-and-reflection.md`.
This does **not** claim full W/D/L after `44444`, WDL equivalence of
all move7 actions, minimax elimination or polynomial scaling.

## 2026-10-16 — Boolean-rank factorization as action-labelled adaptive obligation

Mathematical (not game-search) proof literature suggests a different
representation for mixed P1/P0 response relations. Let P(b,a) be
the exact success predicate for P0 choosing a AFTER observing P1 b.
A Boolean matrix factorization

```text
P(b,a) = OR_j ( U_j(b) AND V_j(a) )
```

retains both move-label sets and their dependency. Exact existential
localization then gives

```text
FORALL b EXISTS a P(b,a)
 = FORALL b OR_j [ U_j(b) AND (EXISTS a V_j(a)) ].
```

No quantifier order is reversed and no prior opponent action is
discarded. The physically checked legal prefix `223` masks
[0xe,0x4,0xe,0x7] have Boolean rank **exactly 3**:
three literal all-true rectangles cover the relation and a
three-element fooling set proves rank >=3. This is a proof
of representation soundness, **not** an actual full-game speedup.

**Next GSP-004 target:** derive such rectangular/factored action
obligation terms directly from source residual hyperedges,
not AFTER constructing a full branching reply-history matrix.
Use independent factor-support quantifier-localization lemmas,
prove terminal/turn/capacity guarded variable independence
and measure Boolean rank/fooling-set lower bounds when a
factorization fails to stay compact. Preserve the fact that
`forall b exists a` is not `exists a forall b`.

Independent source residual interaction graph at `44444`
contains 37 future cells and one connected component with
198 edges; min-fill treewidth upper bound 15. Thus no immediate
disconnected raw-component factorization is evident; **conditional**
separator/factored logical formulas remain possible. The graph
probe has no WDL/game-tree search inputs.

Full proof/literature audit:
`docs/research/2026-10-16-general-mathematical-quantifier-width-proof-search.md`.

Still OPEN: unrestricted perfect-play WDL after `44444`,
all turn7 WDL-equivalence, polynomial arbitrary-depth composition
and full computational branch elimination.


## 2026-10-16 — closed rectangles exact; canonical maximal basis REJECTED for compression

A new local theorem (Galois closure) recovers every finite action-labelled P0-response/P1-reply binary relation as the union of **all maximal all-one rectangles**, without exchanging `forall reply exists action` and `exists action forall reply`. This is an exact fixed-relation law, not an unrestricted game-WDL theorem.

Executable producer and exhaustively tested standalone control:
`research/isograph/discovery/2026-10-16-algorithmic-core/adaptive-galois-factor.mjs`,
`adaptive-galois-factor-control.mjs`,
`ADAPTIVE_GALOIS_FACTOR_RESULTS_0_1.json`.
All 65,536 four-action matrices and their 1,048,576 reply-legality quantifier controls agree exactly; 100 seeded 7-action relations also pass. The source and control were independently rerun on local Node22 with Git blob identity verified.

**Negative compression finding:** legal `223` has three *minimal Boolean-rank* rectangles but four *maximal Galois concepts*. On 32,916 of 65,536 4x4 matrices the maximal concept basis exceeds the number of distinct action row types; a 7x7 control reaches 29 concepts from seven rows. Therefore **do not use enumeration of every maximal concept as the default recursive adaptive-cover normal form**. This does not disprove a smaller selected biclique cover, conditional independent factorization, or another compact strategy interface.

**Next candidate:** derive a full first-win/legality-guarded bounded action-threshold QBF with a sound dependency poset, then seek a trunk-aligned tree decomposition permitting the mixed Q-resolution / strategy-extension algorithm of Ganian–Gründel (SAT 2026, DOI 10.4230/LIPIcs.SAT.2026.16). A source hypergraph min-fill width-15 upper bound is not the quantified CNF's bilateral width. For a sound hybrid with source-factored structured DNNF, verify action-dependency localization before removing any universal/existential interaction.

Primary mathematical derivation and hierarchy:
`docs/research/2026-10-16-bilateral-treewidth-and-galois-response-closures.md`.
Canonical `44444` full W/D/L, seven-reply equivalence and deep branchless composition stay **OPEN**. No authority/implementation promotion.

## 2026-10-16 — full-depth quantified guard formula; adaptive proof obligation remains

The strict source-residual owner/cell algebra, counting exact proposed
column occurrences and reflecting *first* illegal or terminal outcomes,
has now generated a truth-equivalent full 37-ply quantified formula at
`44444`. It encodes P1 universal invalid-action neutrality and P0
existential invalid-action neutrality without quantifier swapping;
the deterministic Tseitin auxiliary witnesses have proven sound
stage-local existential scopes.

A QBF formula of 12,436 variables, 36,976 CNF clauses with a sound
trunk-aligned path-width UPPER bound 232 is a genuine full-horizon,
non-history-enumerating *representation*. It is **not** an adaptive
response-cover decision/certificate. In particular, the original
`forall b exists a` scope and its legal `223` counterexample are
preserved. Every existential P0 response remains contingent on earlier
P1 universal moves; no uniform response was inferred.

**Next GSP-004 proof:** find a rule-derived quantified elimination or
sound nontrivial dependency/factor quotient that discharges these
adaptive obligations while keeping source first-win/resource guards.
Instrument growing complete future Boolean cofactors or obstruction
fooling sets. A bounded width-232 QBF decision algorithm may still be
prohibitively expensive; a theorem providing an FPT f(k) is not a
demonstrated practical solver at this k. See
`docs/research/2026-10-16-guarded-action-qbf-full-depth-width.md`.

## 2026-10-16 — adaptive quantified obligation expansion measured

The action-labelled, legality/terminal-guarded source-QBF has now been
actually projected by exact right-to-left Shannon cofactors. All 118
finished finite-horizon thresholds agree with independently computed
physical P0/P1 max-min values. But syntactic support-literal DAG
deduplication is not sufficient to keep every deep mixed universal/
existential obligation compact: `44444` k6 lower thresholds exhaust
60,000 retained nodes, while upper thresholds close only their bounded
truth.

This is a retained-representation wall, NOT a proof that no compact
adaptive response cover exists, and NOT a proof of WDL after `44444`.
The GSP-004 proof objective is to identify sound semantic response
equivalence, cofactor-interface quotient or conditional factorization
that materially reduces *quantifier elimination work*, retaining
the real `223` noncommutation falsifier and all first-win/resource
guards. See
`docs/research/2026-10-16-guarded-qbf-shannon-projection-depth6-obstruction.md`.

## 2026-10-16 — mixed adaptive obligation carrier fails within quantified bit at k7

Rule-derived source action-QBF truth-preserving live-gate compaction
eliminates the earlier `44444` k6 allocated-dead memory wall:
all four k6 bounded thresholds finish, with 120 of 124 local
independently physically compared threshold queries EXACT and
four resource-partial k8 queries. But k7 action-bit cofactor
construction itself reaches 60k retained nodes after 12/21 bits
despite between-bit compaction. No arbitrary-depth strategy
compression, unrestricted outcome, or new equivalent-action class
has been proved.

The relevant next structural law must **not** repackage another
Cartesian adaptive expansion. Test variable-support-qualified
Boolean adjunction and quantifier localization inside subcircuits
before constructing both unrestricted Shannon cofactor DAGs.
Preserve earlier opponent-dependent action Skolem scope, `223`
noncommutation counterexample, first-win, draw and full-column
guards; count all quantifier/gate/GC work, not just the returned
factored expression. The shared exact recursive core remains
complete and `44444` remains UNKNOWN [-1,+1].

Full law/evidence: `docs/research/2026-10-16-exact-qbf-live-compaction-transient-width.md`.
