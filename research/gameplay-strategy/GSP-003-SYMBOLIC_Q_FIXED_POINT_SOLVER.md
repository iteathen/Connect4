# GSP-003 — Symbolic q fixed-point solver

**Status:** rough proposal  
**Goal:** exploit q without ordinary recursive game-tree search.

## Proposal

Solve over sets of quotient states using backward fixed-point semantics:

~~~text
terminal q regions
    -> symbolic predecessor over q
    -> Win/Loss/Draw closure
    -> empty-root classification
~~~

This is the gameplay-facing continuation of CUDA-BSFP once q is accepted as the ordinary future-behavior state.

## Key design point

Do not enumerate every q merely because q is exact.

The previous BSFP work already showed symbolic frontiers can be substantially smaller than explicit q-state enumeration on bounded controls.

The desired primitive is therefore:

~~~text
Pre_a(Qset)
~~~

over symbolic regions of q, not a giant reverse adjacency table.

## Implementation ideas

- represent support ranks separately from residual-family frontiers;
- reuse packed residual cofactor algebra;
- build predecessor constraints symbolically;
- use rank-local or rolling-rank execution;
- retain exact terminal injection and first-win semantics;
- exploit support-local dictionaries where qualified;
- move to GPU only after the symbolic representation is bounded and exact.

## Qualification

Compare explicit q dynamic programming, symbolic q fixed point, and the current BSFP representation.

Measure frontier size, generated candidates, normalization work, retained memory, root time-to-proof, and exact agreement.

## Strategic value

This is the clearest current route to an exact solver that avoids ordinary recursive minimax while still using the q reduction.


## 2026-10-16 — constructive core status and the actual improvement target

The exact q-oriented W/D/L algorithmic core is now **constructively
complete** under the qualified ordinary game-theory semantics. It is
realized in the standalone oracle-independent **recursive, branching**
research reference:

- `research/isograph/discovery/2026-10-16-algorithmic-core/exact-q-core.mjs`;
- `docs/research/2026-10-16-constructive-algorithmic-core-completeness.md`;
- `research/isograph/discovery/2026-10-16-algorithmic-core/CONSTRUCTIVE_CORE_QUALIFICATION_RESULTS_0_1.json`.

This does **not** implement the distinct GSP-003 symbolic fixed-point strategy
or imply production solver adoption. The direct core already computes
exact W/D/L and all W/D/L-optimal moves using ordinary recursive max/min.

The optional stronger objective is now **true branch-work compression**:
take a quantified set of child obligations and derive one exact compact
successor/proof object while avoiding separately recursive child-value
evaluation and avoiding a hidden Cartesian enumeration inside the
aggregating operator. Any proposed symbolic `Pre_a`, antichain-semiring
product, or G2 action quotient must be compared against the established
recursive reference in both exact W/D/L **and actual dependency count,
intermediate width, memory, and total work**.

Do not impose branch elimination, recursion elimination, or representation
minimality as prerequisites for calling the existing semantic algorithmic
core complete.


## 2026-10-16 — first non-distributed threshold-circuit qualification

The exact core remains constructively complete regardless of success of
this optional symbolic optimization. New support-local, **un-distributed**
Boolean value-threshold circuits were built independently of solved oracle
values, using exact residual-upset one-step preimage/substitution.

On three selected 4x3 and 4x4 supports, the compiler passed **260 physical
states and 384 bounded abstract q antichain checks**, recovering complete
W/D/L and equal-value action sets without recursive *concrete q-value*
computation during construction. A support-poset implication simplifier
reduced final reachable circuit gates by 15.6%–53.7% with zero disagreements;
a corrupted first-win guard was rejected on all three controls.

The empty 4x3 root **still exceeded 60,000 transient gate allocations** in
both variants. This is a qualification **PARTIAL**, not general branch
elimination: the compiler visits multiple child supports and the Boolean
circuit still contains alternating fanout. A single output circuit is not
equivalent to one computational path.

Sources/evidence:
`docs/research/2026-10-16-nondistributed-symbolic-alternation.md`
and `research/isograph/discovery/2026-10-16-algorithmic-core/`.

Next GSP-003 target: shrink the *construction-time* alternating expression
rather than prove minimality or recompile complete standard-board ranks.
Use a bounded root-suffix control and report both retained/live DAG
and all transient/discarded work.


## 2026-10-16 — qualified source-q anchored interval WDL and mirror support orbit

**Current strongest exact symbolic route** for this optional strategy is
source-q anchored owner-variable Bellman WDL, strengthened with finite
support-cone lower/upper intervals, batched ROBDD reclamation, strict
source h/R0/R1 horizontal reflection quotient, and a STATIC source
residual-frequency variable order. It is derived from qualified
first-win/owner-cofactor semantics and never searches a concrete
game-state policy while building formulas.

- Complete empty 4x3 Connect3 and 4x4 Connect4 WDL and all action-value
  roots already independently qualified under the earlier owner-BDD
  reference. The new four-threshold interval operator agrees when the
  cutoff reaches the whole small game; 90 independent cross-horizon
  checks show zero WDL interval/action or monotonicity errors.
- Rank20 standard7x6 is **tactically shallow**: root P0 win after one
  own move and all seven action values exact by two plies; independent
  q reference agrees. Do not use the earlier four-ply calculation as
  proof of a substantial nonbranching strategic collapse.
- Ranks14,16,18 similarly close by depth2; complete q references hit
  800k-edge caps, but separate physical depth2 action checks PASS.
- Rank10 and canonical `44444` remain UNKNOWN through ordinary k9
  bounded support cones; first-win transition/capacity rules remain
  exact and unchanged.
- Strict q_o mirror symmetry plus ordered Shannon BDD variable
  transport reduces canonical `44444` depth10 to 6,216 support
  orbits. A STATIC order by frequency of source R0/R1 residual
  incidence completes **depth11**, with 9,366 orbits representing
  18,620 ordinary supports, 16,511 peak BDD nodes and 268,341
  nontrivial operations under the SAME 60k/300k/10k/15s cap.
  **Root and action intervals remain UNKNOWN [-1,+1].**
- Depth12 requires 13,524 reflection orbits, beyond original 10k.
  Further progress demands a new mathematically qualified quotient
  or non-distributed multi-ply response-cover algebra, not raising the
  numerical gate limits or reintroducing winning-policy search.

Full derivation:
`docs/research/2026-10-16-source-anchored-interval-and-reflection.md`.
Implementation and evidence:
`research/isograph/discovery/2026-10-16-algorithmic-core/`
(`bounded-support-interval-bdd.mjs`,
`reflected-bounded-interval-variable-order.mjs`,
`BOUNDED_SUPPORT_INTERVAL_CROSS_HORIZON_RESULTS_0_1.json`,
`BOUNDED_INTERVAL_PHYSICAL_RESULTS_0_2.json`,
`REFLECTED_INTERVAL_VARIABLE_ORDER_RESULTS_0_1.json`).

**Status:** exact BDD interval mechanism and bounded controls PASS;
full arbitrary-depth value composition and computational branch
elimination **OPEN**. The existing recursive q algorithmic core is
complete and remains valid. No minimality or standard7x6 full-root
WDL claim follows.

## 2026-10-16 — mathematical proof search changes the next symbolic target

The latest source-q `44444` owner-BDD interval reaches k11 exactly,
with strict source-reflection and source-residual-frequency variable
order, but UNKNOWN full WDL. Higher support-orbit count is a
representation bottleneck, not a proven minimum-width theorem.

Independent GENERAL MATHEMATICS literature (NOT Connect4 search)
supplies a more precise approach:

- Capelli/Mengel: quantified Boolean projection blows up according
  to STRUCTURED CIRCUIT WIDTH; another static BDD order need not
  guarantee arbitrary-depth closure.
- Sieling/Wegener: reduced OBDD per-level width equals distinct
  essential future Boolean cofactors after assigned variables.
  Measure this **interface cofactor diversity** rather than counting
  total support states or final root constants only.
- Ge-Ernst et al. / FAQ: localize/commute quantifier operations
  only when logical variable dependency is proven absent.
  Strict mover, gravity, capacity, first-win and literal action
  labels belong in those dependencies.
- Amarilli/Monet/Senellart: structured/decomposable circuits may
  behave better than path-ordered BDDs when structural width is
  favorable, but general exponential lower bounds remain.

**Next GSP-003 control:** derive a source-q factored multi-output
WIN/NLOSS threshold descriptor, instrument per-quantified-block
cofactor-function counts and bounded interface width, and
compare its real construction work with the existing BDD.
Do not compute a game-tree winning policy inside the constructor.

Full literature/proof audit and reproducible structural diagnostic:
`docs/research/2026-10-16-general-mathematical-quantifier-width-proof-search.md`.
No general polynomial or nonbranching theorem was established.


## 2026-10-16 — proof-theoretic quantified-width candidate, NOT a solved symbolic root

The new reviewed SAT-2026 bilateral-treewidth theorem supplies a conditional QBF decision algorithm combining guarded resolution/universal reduction with bounded local existential-strategy extension; it can handle decompositions which simple dependency-treewidth or prefix-pathwidth alone cannot. It requires a **full quantified CNF**, polynomial-time sound dependency poset and a qualifying trunk-aligned decomposition. The prior `44444` source-residual graph's greedy width15 is not a measurement of those prerequisites.

Exact local action/reply Galois-closure reconstruction and Node22 finite tests also establish a useful *negative* carrier result: enumerating all maximal binary-relation concepts can expand intermediate size (32,916 of 65,536 four-action relations; legal `223` four concepts vs minimum rank three). Do not substitute this basis for a compact multi-ply predecessor operator merely because it returns one factor object.

**Next GSP-003 experiment:** prove the source q WIN/NLOSS threshold-to-guarded-CNF equivalence including every legal action, terminal/first-win, mover and original owner cofactor; instrument the genuine dependency-qualified *quantified* interface and candidate trunk aligned decomposition; compare with structured-dDNNF elimination and exact q/physical controls. Freeze current computational budgets before testing source `44444`. No unsupported value closure or production implementation.

See `docs/research/2026-10-16-bilateral-treewidth-and-galois-response-closures.md`.

## 2026-10-16 — guard-complete source QBF compiled to full game, value still UNKNOWN

A mathematically explicit source-q residual action-threshold circuit has now
constructed, **without support or game-history enumeration**, the entire
37-ply alternating action QBF after canonical `44444`. It retains literal
action labels and first-win/draw/legal move guards; a stage-local Tseitin
existential definition can be introduced immediately after its last
transitive action input because its value is uniquely forced and future
choices cannot affect it.

The actual 37-ply quantified CNF has 12,436 variables, 36,976 clauses
and 35,473 primal edges. With the **trivial total prefix dependency
poset**, an explicit verified trunk-aligned path decomposition certifies
bilateral width <=232, compared to <=1335 with postfix gate quantification.
These are legitimate width UPPER bounds, not optimal widths. 78 physical
finite-horizon controls and 1,024 sampled full-depth words agree with the
source formula, with separately counted construction work.

**Critical boundary:** None of the `44444` formula truth values were
computed by a QBF solver. Full-depth representation is NOT a solution
of the adaptive strategic-value composition problem. Do not relabel
CNF creation as elimination of quantified choices; its remaining
strategy complexity is real.

Next GSP-003 target: implement one bounded exact quantified-predecessor
projection on the constructed CNF or an equivalent structured-DNNF
carrier and measure intermediate quantifier function width; validate
on small boards before `44444` k12. Do not exceed 60k nodes, 300k
Boolean work, 10k supports, or 15s per compile.
Full proof: `docs/research/2026-10-16-guarded-action-qbf-full-depth-width.md`.

## 2026-10-16 — actual action-QBF quantified projection, scoped negative

A Shannon-cofactor action-bit projector (after exact deterministic
Tseitin elimination) now evaluates source-only guarded QBF thresholds
by quantifying from the innermost action bit outward, with original
P0 existential OR/P1 universal AND. It made 120 finite threshold
attempts; 118 returned exact bounded truths with zero independent
physical minimax discrepancies. On `44444`, k5 all four results are
computed but remain [-1,+1]. At k6 Wlo/Nlo hit the original 60k
retained-node ceiling after 12 of 18 bits; Whi/Nhi completed.

This does NOT improve on the earlier source-owner reflected BDD k11
and does not establish a lower bound on *semantic* quantified width
because dead DAG nodes are not reclaimed. Next measure reachable
live/essential-future-cofactor width, then use actual quantified
structured-circuit reduction, not just a smaller CNF.

Record: `docs/research/2026-10-16-guarded-qbf-shannon-projection-depth6-obstruction.md`.

## 2026-10-16 — exact quantified live compaction advances to k6; k7 within-bit cap

The earlier action-bit QBF Shannon projector's `44444` k6 60k node
cap was not an essential width bound: at its last completed bit
53,025 IDs had been allocated, but only 17,990 AND gates remained
root-reachable. A proven post-quantifier signed-edge AND-DAG
compaction now completes every k6 root threshold with independent
physical finite-horizon agreement. Wlo/Nlo FALSE and Whi/Nhi TRUE
still imply unrestricted UNKNOWN [-1,+1]. This required 216,140
nontrivial Boolean operations and **517,861 additional** compaction
traversal/evaluation units (lower threshold), so cheap total-work
compression was NOT obtained.

Both k7 lower and upper thresholds again hit 60k retained nodes
**during the next single cofactor** after 12/21 quantified bits;
after post-bit GC they previously held 26,783 and 30,848 live AND
gates, respectively. GC between whole bits cannot safely reclaim
temporary nodes still needed by an unfinished cofactor. This is a
construction-schedule wall, not proven Boolean essential width.

**Next GSP-003 proof experiment:** dependency-sound quantified
localization/structured-DNNF or canonical cofactor sharing inside
the actual source guarded circuit, with complete physical scope
falsifiers and separate work/peak memory measurements. The
existing source-owner reflected BDD still reaches k11 and remains
the better bounded WDL carrier.

Record: `docs/research/2026-10-16-exact-qbf-live-compaction-transient-width.md`.

## 2026-10-16 — owner-prioritized exact branch elimination

**Primary continuing research objective:** from a legal q=(h,R0,R1), derive
the exact W/D/L value AND complete literal W/D/L-optimal action mask
*simultaneously* without independently solving each strategic continuation
or concealing that traversal in a support DAG, BDD/QBF, circuit or
precomputed policy. Return a singleton only when its strict uniqueness
is proved; exact ties are all retained.

The ordinary recursive algorithmic core remains complete. This
stronger nonbranching result is OPEN and is not a prerequisite for the
core's validity, but is now the central GSP-003 research target.
Measure actual constructed/quantified cofactors, independent successor
work eliminated, memory, total operations and full mask correctness
under existing limits. Source-anchored BDD k11 vs guarded QBF k6
remains reference evidence, not success at full branch elimination.
See `docs/research/2026-10-16-branch-elimination-primary-objective.md`.

## 2026-10-16 — shared free-first-action projection (all optimal ties retained)

The source-only guarded QBF matrix now admits a **single** quantified projection
of every future action block while leaving the first action code FREE.
This shared projected function returns all literal action Boolean
WIN/NONLOSS thresholds without a separate full QBF continuation per
first move. Four threshold vectors reconstruct exact WDL and the
complete set of tied-optimal legal actions whenever intervals close.
Independent physical control: 24/24 exact full suffix optimal masks,
13 singleton/11 ties; 672 bounded action threshold checks; zero
discrepancies. A deliberately uncached repeated-first-action baseline
used 76.5–86.7% more counted Boolean construction/projection work
when stated as baseline-relative savings from the shared method.
This is real root-action sharing but still not general branch elimination.
`44444` remains UNKNOWN at k6; k7 hits the same 60k future cofactor wall.
Next: guarded *inner subfactor* quantifier localization, not more
independent root compilation.

Research: `docs/research/2026-10-16-one-pass-optimal-action-vector-quantifier-projection.md`.

## 2026-10-16 — exact local quantified factor pushdown extends free-action vector to k7

Sound universal-AND, existential-OR (by signed negation), and
variable-independent-factor quantifier laws were implemented
**inside** the shared first-action-free source-QBF projector, before
building large whole-function cofactors. Both-x-dependent EXISTS-AND
and FORALL-OR cases still use exact Shannon, avoiding the false
independent-witness shortcut. Preserve action chronology and all
first-win/full-column/legal decision guards.

47 bounded source controls, 188 projected thresholds and 672
per-action physically checked values PASS, with 24 complete-game
short suffix optimal masks (13 singleton, 11 ties). Independent
standard7x6 canonical `44444` **k7** physical first-win check
covered 2,799,124 transitions, zero mismatches. Lower projected
thresholds use 63,757 Boolean ops/6,298 nodes; upper 166,807/
16,517, completing all seven labelled bounds as [-1,+1].
This fixes the prior action-QBF k7 retention wall but does NOT
determine any unrestricted 44444 action value; owner-BDD still
compiles k11.

k8 lower hits 60k node budget after 16/21 inner action bits.
Syntactic unate common-witness detection is exact but gave
negligible benefit (one useful k8 lower shortcut, 85,612 polarity
cache misses), so keep it a negative experimental carrier.
**Next GSP-003:** structure-aware semantic cofactor equivalence,
conditional-separator projection or proof-bearing TDD/structured
decision representation that truly reduces correlated mixed
quantifier work, preserving output masks and budgets. Proof:
`docs/research/2026-10-16-guard-qualified-quantifier-localization-and-action-vectors.md`.
Negative:
`docs/research/2026-10-16-common-witness-unateness-negative-width.md`.

## 2026-10-16 — canonical action-ROBDD exact cofactor quotient (k8 both, k9 lower)

A newly constructed shared Boolean-function carrier derives
`G_z(a0)=Q1 a1 ... Qk ak F_z(a0,...)` from the ORIGINAL
guard-complete source-q residual action formula, leaving every
literal first-action label free. It compiles only deterministic
AND/NOT gate ancestors of one threshold and uses a
complemented-edge reduced ordered BDD (true fixed-order
Boolean function/cofactor identity). Safe last-use and
stable-handle BDD garbage collection preserve all source
gate dependencies and avoid materializing concrete future
game states.

Physical small-board controls: 47 bounded cases/672 action
checks/24 full WDL and complete tied-optimal sets all PASS.
Independent `44444` future k8 physical evaluator: 3,567,031
transitions, all seven literal bounds [-1,+1], no discrepancies.
Both k8 threshold classes COMPLETE within original budgets
(lower 75,392 BDD ops / 19,354 peak slots, upper 40,220 /
15,988). K9 lower completes all seven FALSE in 121,999 BDD
ops/39,142 slots, agreeing with the independent prior
source-owner BDD. K9 upper remains INCOMPLETE at 60k slots
during output-cone compilation on all eight fixed action-bit
orders. The established source-owner reflected BDD k11
remains the deeper bounded-value method.

**Next mathematical stage:** a factor/structured-circuit
quantifier-aware compile that discharges local adaptive
obligations before the full output Boolean function is
materialized, with exact first-win/capacity guards and
action scope. The current result is canonical cofactor
sharing, NOT global strategic branch elimination.
Proof: `docs/research/2026-10-16-action-robd-output-cone-functional-quotient.md`.
Evidence: `ACTION_ROBDD_OUTPUT_CONE_RESULTS_0_1.json`.

## 2026-10-17 — branch elimination outranks deeper diagram compilation

The owner-primary objective is exact structural elimination of
**independently expanded strategic actions** with complete literal
WDL-optimal sets. The currently completed recursive q core and
chronological move7/8 full-column transition remain established.
New action-BDD output-cone work is valid supporting representation
research but does not itself decide unrestricted `44444` or
discharge adaptive opponent choices.

**New exact source-response algebra:** inclusion-MINIMAL
P1 reply success-action signatures preserve both quantified
bounded response predicates and all action labels. Exhaustive
65,536×16 generic controls plus complete small-board P1
state checks PASS (2,208 4x3 and 67,992 4x4 sources).
Original-to-minimal reply obligations 5,592→2,546 (4x3)
and 150,246→70,706 (4x4), but original response matrix
construction still incurs its full work.

A decisive legal full-game falsifier `111` (4x3 Connect3)
has identical bounded signatures after P1 replies 2,3
but different exact full-game outcomes (+1 vs 0 for P0).
There are 220 / 22,380 such pairs in the exhaustive 4x3/4x4
validations. Therefore none of these one-layer groups,
including all seven `44444` P1 replies, may be elevated
to full-WDL equivalence without a further theorem.

**Next GSP-003 role:** provide a source-residual-derived
functional/guarded simulation certificate for *entire future
adaptive response relations*, with labelled W and N
threshold implication, response/terminal/resource guards
and true saved downstream quantifier work. Once proved,
symbolic diagrams may be used as a *post-derivation falsifier*
or bounded implementation—not as the main research target.
The source-owner reflected BDD k11 and action-QBF k9
partial remain historical measurement baselines.
Proof/evidence:
`docs/research/2026-10-17-branch-elimination-dual-obligation-and-future-separation.md`.

## 2026-10-17 — exact source future-WDL simulation precedes any new symbolic solver work

The owner-primary branch elimination goal has a positive
STRUCTURAL proof component beyond bounded response masks:
for nonterminal `P1 b/P0 c` vs `P1 c/P0 b` owner-swap
histories with identical resulting support, original
source residual generator upset inclusions prove
full-unrestricted-game P0-relative WDL weak dominance,
and mutual inclusion proves full future-q equality.
This uses only parent `h,R0,R1` and first-win/capacity
guards, no recursive future solve or policy data.

Independent full small-board physical-q controls PASS on
1,522 unique 4x3 q+column diamonds (72 future equality,
352 one-way dominance) and 39,798 unique 4x4 pairs
(2,372 future equality, 9,380 dominance), zero false
structural/game-value claims. `44444` 21 swap diamonds
remain incomparable, and full WDL/best moves UNKNOWN.

**Next GSP-003 engineering role** is to realize a
mathematically frozen source-only multi-action
alternating-simulation/matching relation across DIFFERENT
support fibers (G2 action transport plus original
upset-favorable order is a candidate) once proved.
Do NOT resume routine variable-order/garbage-collection/
larger QBF diagram searches as the main research agenda.
Input values and winning policies from recursive reference
are POST-derivation falsifiers only; preserve complete
tie-set reconstruction. Mathematical proof:
`docs/research/2026-10-17-full-future-two-ply-cofactor-simulation.md`.
