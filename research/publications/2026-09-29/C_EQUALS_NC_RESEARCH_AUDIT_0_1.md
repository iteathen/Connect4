# C = NC? comprehensive Connect4 / IsoMax research audit — 2026-09-29

**Status:** publication-scope audit  
**Owner / research direction:** Joshua Oshiro  
**Canonical Connect4 research branch:** research/semantic-quotient  
**Purpose:** identify the Connect4/IsoMax findings that are novel or significant enough to appear in the C = NC? research paper, while preserving proof status and theorem-contamination boundaries.

## Audit method

The audit used the current Connect4 research authority and synthesis surfaces rather than treating the newest experiment branch as the whole corpus.

Primary inventory:

- Connect4 logic authority 1.2;
- the 1.2 claim-coverage inventory: 93 normalized claims, 65 retained, 4 strengthened, 17 historical-only, 7 open, 0 uncovered;
- the gameplay strategy index;
- the q-congruence and method-emergence derivations;
- the RBA QU refinement series;
- the standard-7x6 proof-frontier and perfect-play-output research;
- the current control-parity / direct structural graph campaign;
- current JSMinSys/IsoMax qualification and Phase-2 evidence.

### Inclusion rule

A finding belongs in the paper when at least one of the following holds:

1. it changes the mathematical description of Connect Four;
2. it establishes a new exact quotient, algebra, proof normalization, or structural theorem;
3. it sharply localizes a missing law or complexity barrier;
4. it materially changes what can be eliminated from exact search;
5. it supplies a decisive falsifier for a central candidate theory;
6. it changes the interpretation of IsoMax as a computational realization of the mathematics;
7. it is a large exact implementation result that demonstrates practical leverage of one of the structural mechanisms.

Routine micro-optimizations, duplicate implementation variants, benchmark plumbing, and historical experiments whose only value is lineage are not paper-core material.

### Novelty language

This audit distinguishes:

~~~text
project-local new/significant result
    !=
externally established novelty claim
~~~

A result may be mathematically exact and important to this project without this audit claiming priority over all prior literature. External novelty claims require a separate literature review.

---

# A. Exact semantic state and identity

## A1. q is an exact future-behavior congruence

**Paper priority: ESSENTIAL.**

For legal nonterminal Connect Four positions define:

~~~text
q_o =
    support
    + normalized P0 residual winning-requirement antichain
    + normalized P1 residual winning-requirement antichain.
~~~

The standard-7x6 q-congruence proof establishes:

~~~text
q_o(s) = q_o(t)
    ->
same legal columns
same landing cell for each column
same terminal token for each action
same successor q_o for every nonterminal action
    ->
same complete literal-action-labelled future game.
~~~

The proof uses support-determined legality, exact residual cofactors, first-win-aware strict-superset absorption, deterministic successor q, and induction on remaining cells.

Consequences include identical exact W/D/L, per-action exact values, and distance-sensitive values for any fixed convention depending only on the ordinary future game.

This is stronger than empirical state compression. It identifies a sufficient exact gameplay state.

Source:
- STANDARD_7X6_Q_CONGRUENCE.md, blob 4d72c6984380bfee2c74345062a1849ebbd514db.
- qualified authority integration: CONNECT4_LOGIC_AUTHORITY_1_2.md.

## A2. q_r is a transporter-aware reflection orbit, not literal identity

**Paper priority: ESSENTIAL.**

Horizontal reflection creates a second exact quotient:

~~~text
q_r = canonical orbit representative of {q_o, reflect(q_o)}.
~~~

Equal q_r states have exact future-game correspondence under either:

~~~text
c -> c
~~~

or:

~~~text
c -> 6-c.
~~~

This preserves scalar value and transported future behavior while explicitly not claiming identical literal action labels, physical occurrence, history, or proof-certificate identity.

This distinction is central to the later action-unlabelled quotient work.

## A3. Gameplay identity is not proof identity

**Paper priority: ESSENTIAL.**

Equal q does not authorize reuse of proof/certificate state whose validity depends on:

- deadlines;
- response resources;
- CPC/NDC premises;
- realizability;
- dependency/provenance cone;
- guard context.

This prevents semantic quotienting from silently erasing theorem premises.

## A4. Solver multiplicity collapses to one value-dependency relation

**Paper priority: HIGH.**

The method-emergence synthesis shows that the ordinary exact game already supplies:

~~~text
exact behavior carrier
+ legal successor relation
+ terminal boundary
+ alternating existential/universal choice
+ finite occupied-cell rank
    ->
exact W/D/L dependency.
~~~

IsoMax, BSFP, and potential SUT are primarily different evaluation/materialization policies:

~~~text
IsoMax: demand-driven
BSFP: supply-driven
SUT: possible meeting/bidirectional policy
~~~

The legal game graph is acyclic by occupied-cell rank. Ordinary exact value therefore requires backward induction, not a global semantic fixed point; fixed-point machinery is needed only for representations or extra closure layers that actually require it.

Source:
- OPERATIONAL_LAYER_METHOD_EMERGENCE.md, blob 88228aebbf266c363082d67043f6a3f9c18b8030.

---

# B. Geometry and finite-difference algebra

## B1. The residual winning-requirement universe is finite and small

**Paper priority: HIGH.**

The 69 standard 7x6 geometric winning lines induce exactly 625 unique nonempty residual winning-requirement masks under the qualified residual construction.

This supports fixed-ID residual semantics and gives a finite structural vocabulary smaller than physical ownership space.

Authority claim: C4-R0015.

## B2. Connect-K line geometry has an exact finite-difference factorization

**Paper priority: ESSENTIAL to the algebra story.**

For the 1D Connect-K winning-window polynomial over GF(2):

~~~text
S_K(T) = 1 + T + ... + T^(K-1)
~~~

the exact multiplicity of the finite-difference factor 1+T is:

~~~text
nu(K) = 2^(v2(K)) - 1.
~~~

A Connect-K window is a pure derivative exactly when K is a power of two.

For K=4:

~~~text
S_4(T) = (1+T)^3.
~~~

Thus Connect Four is the smallest nontrivial pure higher-derivative case.

Authority claim: C4-R0057.

## B3. Axis derivatives derive the diagonal constraints

**Paper priority: ESSENTIAL.**

Let:

~~~text
X = partial_x
Y = partial_y
X^3 = 0
Y^3 = 0
XY = YX.
~~~

Then the rising diagonal derivative gives:

~~~text
XY^2 + X^2Y = 0,
~~~

and the falling diagonal adds:

~~~text
X^2Y^2 = 0.
~~~

The diagonal incidence corrections are therefore derived mixed-derivative relations rather than independent axioms.

A two-cell response-pair has first-derivative incidence shape, tying the later paired-response algebra back to the same geometry.

Source:
- 2026-09-14-connect4-derived-difference-axioms.md, blob 6ac1b59a5085fc6ad72b6af23d27b01988501241.
- authority claim C4-R0058.

## B4. Regular Connect-4 has a seven-mode periodic annihilator code

**Paper priority: HIGH.**

One-axis length-4 annihilators form a 4-periodic even-parity [4,3] binary code. The 2D axis product has dimension 9; the two exact diagonal relations remove two modes, leaving a seven-dimensional regular-board incidence cokernel/code.

Authority claim: C4-R0059.

## B5. CPC ownership parity is one binary scalar potential

**Paper priority: ESSENTIAL.**

From the accepted CPC event-count formula:

~~~text
N(t) = (W-1)H - ply + r + 1,
~~~

the absolute zero-reservation owner bit is:

~~~text
q0(c,r) = ((W-1)H + r) mod 2.
~~~

Current ply and target-column height cancel.

With strategic parity correction rho:

~~~text
q(c,r) = kappa + r + rho(c,r).
~~~

Horizontal phase and vertical seam fields are simply discrete derivatives:

~~~text
H = delta_x rho
S = delta_y rho.
~~~

The earlier plaquette transport law becomes equality of mixed derivatives.

This unifies CPC ownership, phase, and seams as one binary control-potential representation.

Source:
- 2026-09-14-cpc-control-potential-unification.md, blob acc62a2817837b52cc93c34fa964e73195b1024a.
- authority claim C4-R0014 plus derived later work.

---

# C. Opening geometry and the first-move boundary

## C1. Pure-followup safe entry is a singleton transversal theorem

**Paper priority: ESSENTIAL.**

For Connect-K, K>=4, under the declared pure-followup ownership profile, one setup column is safe exactly when it belongs to every consecutive K-column window.

For K<=W<=2K-1 the safe set has size:

~~~text
2K - W.
~~~

For W>=2K it is empty.

There is exactly one safe setup column iff:

~~~text
W = 2K - 1,
~~~

and it is the center c=K-1.

For K=4 this singles out width 7 and column 4 in one-based notation.

Authority claim C4-R0070.

## C2. Unique safe entry and unique initial requirement impact coincide at W=2K-1

**Paper priority: ESSENTIAL.**

The initial bottom event's winning-requirement incidence has a unique maximum iff W=2K-1, and the maximizer is the same center event selected by the singleton-transversal theorem.

Specializing K=4 gives W=7, center column 4.

Combined with the project's regular K=4 core-balance relation, this selects H=6 and the structural core dimension 28.

Authority claim C4-R0071.

**Provenance caution:** this result was developed in a research environment where the solved center opening and the number 28 were already known. Under the newer theorem-contamination firewall it is mathematically significant but must not automatically be used as production theorem authority until its discovery/selection path is independently audited or blindly re-derived.

## C3. Every non-center opening on seven-wide even-height Connect-4 has a defender safety certificate

**Paper priority: CRITICAL.**

For K=4, W=7, every even H>=4, every non-center first move by P0 admits an explicit P1 safety construction. Therefore any P0 forced-win proof on this family must begin in the center.

For standard 7x6 there is an independent local-product theorem using:

- normal even-column responders;
- an initial coupled pair;
- an empty coupled pair.

Their asynchronous product gives a total P1 response policy.

A generated invariant compiler mechanically classifies every one of the 69 P0 winning lines by:

- singleton blocker;
- same-component forbidden pair;
- support-shadow preemption.

For the three reflection-distinct opening classes there are zero unclassified lines.

This is a self-contained one-sided theorem:

~~~text
all six non-center openings <= draw for P0.
~~~

It does not prove the center opening is a P0 win.

Source:
- 2026-09-13-noncenter-opening-structural-safety-theorem.md, blob c6d62b984c68aa493fb0fe8f40a191f0ce8152b1.
- authority claim C4-R0072.

This is the strongest currently clean structural contribution toward turn-one perfect play.

## C4. Center-positive partial results exist but are not a root proof

**Paper priority: HIGH, as boundary/falsifier.**

Examples include:

- unique complete static phase cover inside one 32-assignment wing-phase family;
- that unique cover requires two distinct bottom ownership facts before P1 has enough response capacity;
- the resulting safety cover is temporally unrealizable;
- local Before/Lowinverse-style repairs can fix some apparent center defects, falsifying overly strong defect-lift conjectures.

These results show that center-positive proof requires a complete response-resource/deadline calculus, not just static line coverage.

They do not prove center win.

## C5. 44 -> 4 is exact but not yet a searchless theorem

**Paper priority: HIGH, clearly scoped.**

The 44 position has been solved from game rules with two materially independent exact engines, both giving:

~~~text
441,442,443 -> P0 loss
444         -> P0 win
~~~

with reflection covering 445..447.

This is an exact oracle-blind computational proof, useful validation and a production target.

Under the stricter theorem standard, it is not yet sufficient to hard-code 44->4 as a search-elimination theorem because the proof still relies on recursive exact solving rather than a compact geometry/rules certificate.

---

# D. Perfect-play output and the meaning of 28

## D1. Perfect-play terminal-line support has an exact set-valued game algebra

**Paper priority: ESSENTIAL.**

For winning-line universe Lambda, define G(s) as the set of P0 terminal winning lines reachable on at least one W/D/L-perfect continuation when P0 can force a win, else empty.

Then:

~~~text
P0 node:
    G(s) = union child G

P1 node:
    G(s) = empty if any legal child is empty
           else union child G.
~~~

Thus:

~~~text
G(s) != empty
    <->
P0 can force a W/D/L win,
~~~

while membership records possible perfect-play terminal-line identity.

The algebra uses union plus an annihilating union-like product and is an idempotent semiring-like value projection.

Source:
- 2026-09-13-perfect-play-line-output-algebra.md, blob a99f2e9246c69ce6b9091c34b679c99c61eeba80.
- authority claim C4-R0047.

## D2. Winning-region proof and output provenance factorize

**Paper priority: HIGH.**

Value proof and terminal-line output need not use the same quotient.

Stage 1 can aggressively quotient for W/D/L winning-region membership.

Stage 2 can restore original line provenance and perform existential reachability restricted to the proved winning region.

This cleanly explains why value-equivalent proof alternatives can differ in terminal-line outputs.

Source:
- 2026-09-13-winning-region-output-factorization.md, blob d2cb21a70052123a91e25271631505aa58a4c6d1.

## D3. “Perfect play” terminal support depends on the tie convention

**Paper priority: CRITICAL clarification.**

The preserved W/D/L-only perfect-play traversal reports:

~~~text
61 distinct P0 terminal winning-line identities.
~~~

The distance-sensitive strong convention—W/D/L first, fastest forced win for P0, longest resistance for P1—reports:

~~~text
28 distinct P0 terminal winning-line identities,
all terminal witnesses at ply 41.
~~~

Therefore “perfect play has 28 winning lines” is incomplete unless the distance/tie convention is stated.

Authority claims:
- C4-R0048: W/D/L-only support = 61.
- C4-R0049: distance-sensitive support = 28.

Both are solved-result evidence and are forbidden as theorem premises in the blind production lane.

## D4. A geometric structural 28 exists independently as mathematics, but its production provenance is sensitive

**Paper priority: ESSENTIAL with quarantine.**

The research corpus contains exact algebra deriving a standard 7x6 structural dimension 28 from line-incidence geometry:

- total-domain incidence rank/cokernel relations;
- axis and gravity-oriented phase quotients;
- a common cell/line structural core.

It also contains a maximal-delay 38-to-28 geometric refinement and a theorem isolating 7x6 through core balance plus unique initial requirement impact.

These are mathematically significant and distinct from the oracle 28. The repository explicitly found that the oracle 28-line coordinate set is **not** the same object as the structural core despite equal cardinality.

Authority claims C4-R0050..C4-R0056.

However, because the research direction was pursued while 28 was already known from solved play, the new theorem-contamination standard requires quarantine:

~~~text
structural 28:
    significant mathematical result

production use as independent proof authority:
    pending blind provenance audit / independent re-derivation
~~~

The equal number must not be used to infer identity between the structural core and the distance-optimal terminal-line set.

---

# E. Proof algebra and proof compression

## E1. Recursive proof plans have the same antichain absorption algebra as residual winning lines

**Paper priority: ESSENTIAL.**

A P0 witness action induces a conjunction of recursive Win(q) obligations.

Alternative witness actions form an OR-of-ANDs monotone formula.

Therefore if one obligation set is a subset of another, the larger term is absorbed.

The witness family is exactly representable by a minimal subset antichain of recursive q obligations.

Distribution across a frontier produces the same absorption rule on next-frontier proof plans.

This is a genuine algebraic self-similarity:

~~~text
residual winning requirements
and
recursive proof obligations
~~~

share the same free idempotent distributive algebra modulo absorption.

Source:
- 2026-09-13-recursive-proof-frontier-antichain-isomorphism.md, blob 0ef1904e404a722a82693228a6e0ff5dcea1704a.

## E2. Proof-class compression can be large even where state compression is absent

**Paper priority: HIGH.**

On a bounded standard-7x6 positive frontier, equality-style state refinements reconstructed q/reflection and did not produce useful extra compression.

A small exact proof grammar:

~~~text
I       immediate win
O       universal opponent replies all give immediate wins
E(C)    existential move into certificate C
A(...)  universal reply aggregation
~~~

closed 99 of 822 positive obligations in the first pilot.

In its 15 universal nodes:

~~~text
105 raw defender branches
-> 30 normalized proof-consequence branches
= 71.4286% branch reduction.
~~~

A second exhaustive legal-move census reproduced the same closure without oracle witness selection, showing the result is not merely an oracle-choice artifact.

The key lesson is:

~~~text
smaller proof representation
    !=
smaller state equality.
~~~

This directly supports the current searchless theorem program.

---

# F. Realizability, strategy dependence, and complexity boundaries

## F1. Fixed-support line-hit realizability is a pinned NAE hypergraph CSP

**Paper priority: HIGH.**

For fixed occupied support, line-hit bits are realizable exactly when the hidden owner variables satisfy:

- monochromatic P0 pin constraints;
- monochromatic P1 pin constraints;
- NAE constraints for mixed-hit lines.

This gives an exact CSP interpretation of the support-local line-hit correlation problem.

Authority claim C4-R0060.

## F2. Pairwise compatibility is not enough

**Paper priority: HIGH.**

A three-line odd inequality cycle exists on every K=4 board W>=5,H>=4 such that each one- and two-constraint subfamily is satisfiable but all three together are not.

Thus local/pairwise compatibility cannot replace higher-order realizability.

Authority claim C4-R0061.

## F3. Legal colored history is a constrained shuffle / linear-extension problem

**Paper priority: HIGH.**

For fixed colored support, gravity yields column chains. Pre-terminal reachability under alternating play is exactly the existence of a linear extension whose ownership word is alternating 0101....

Equivalently, the global alternating word must lie in the shuffle of the column owner words.

Authority claim C4-R0062.

## F4. Variable-width history realizability contains an NP-hard constrained-shuffle problem

**Paper priority: HIGH complexity boundary.**

When number of columns is part of the input, the even-rank alternating history-realizability problem contains CSh[(ab)*], known NP-hard.

This NP-hardness appears before adding winning-line geometry or first-win stopping.

It does not imply NP-hardness for fixed width 7.

Authority claim C4-R0066.

## F5. Strategy preservation under projection is exactly observation-based uniformity

**Paper priority: HIGH.**

A controller strategy factors through a projection alpha exactly when it chooses the same action on alpha-equivalent consistent histories.

Thus a structural quotient is sufficient for an objective only when a winning strategy exists that is uniform under that observation.

Finite-horizon dependency restrictions admit a QBF/DQBF / Skolem-function representation.

Authority claims C4-R0064 and C4-R0065.

These findings explain why some state projections preserve value but not constructive strategy/proof.

---

# G. Residual Boundary Algebra (RBA)

## G1. Exact board-fiber isomorphism transports ordinary value algebra

**Paper priority: HIGH.**

The support-conditioned future-cell gravity/frontier plus residual-line incidence fiber determines the residual lattice and one-step cofactor neighborhood up to exact isomorphism.

That isomorphism transports:

- q-state order;
- legal actions;
- exact action values;
- exact state values;
- best-move sets;
- threshold boundaries.

In the G3 controls:

~~~text
1,592,642 complete q pairs
3,929,368 mapped action cases
0 state/action/best-move mismatches.
~~~

Source:
- RBA-QU-0003, blob 5be5a12117578efb9fd6a567ca9bc8dc6f1ec2b2.
- authority claims C4-R0077..R0079.

## G2. Strong distance emerges as Bellman-information resolution ordinal on complete controls

**Paper priority: HIGH.**

Starting nonterminals at UNKNOWN and applying exact W/D/L Bellman information refinement yields trace classes exactly matching strong-score classes on the complete controls.

The first iteration at which a state/action leaves UNKNOWN matches exact strong distance with zero mismatches.

This suggests:

~~~text
strong score =
    final W/D/L outcome
    + resolution ordinal.
~~~

Source:
- RBA-QU-0004, blob b15e3b9c54254fd59cdc00d1915b0dfd368d09a7.

This is strongly supported/theorem-shaped in the current research, not promoted as a universal theorem beyond stated controls.

## G3. Six partial WDL values reduce exactly to four nested threshold fronts

**Paper priority: ESSENTIAL.**

The six contiguous bounds:

~~~text
LL LD LW DD DW WW
~~~

are exactly represented by four nested upward-closed fronts:

~~~text
lower >= DRAW
lower >= WIN
upper >= DRAW
upper >= WIN.
~~~

These fronts reconstruct all six values pointwise and preserve state/action partial-value information through tested 2/4/6-ply alternating blocks.

Source:
- RBA-QU-0006, blob a84884654f1940addbb920d9e46a2d399fd6d8e9.
- authority claim C4-R0080.

## G4. Bellman block composition is a monotone lattice polynomial but not a simple join/meet homomorphism

**Paper priority: ESSENTIAL.**

One threshold transformer has the form:

~~~text
OR over current-player actions
    AND over opponent replies
        exact preimage(front)
~~~

with terminal constants.

Simple join/meet homomorphism fails because different opponent replies can be discharged by different alternatives.

The irreducible terms are mixed reply covers, linking RBA to:

- minimal transversals/blockers;
- antichain products;
- positive alternating formulas.

This localizes the remaining compactness problem.

Authority claims C4-R0081..R0082 and RBA-QU-0006.

## G5. Exact symbolic normalization laws have been derived

**Paper priority: MEDIUM/HIGH, summarized rather than detailed.**

The current retained exact RBA laws include:

- outer-restriction skyline-width monotonicity;
- projection-tree subtree dominance pruning;
- block-signature subset/superset indexing;
- static dominance-tree normalization;
- core-relative pre-product absorption;
- shared-target principal-cover dynamic programming.

The last two removed very large redundant product work in the bounded rank27/rank26 controls and localized prior evaluator walls.

Authority claims C4-R0085..R0092.

The paper should summarize this as evidence that RBA is not merely conceptual; exact algebraic reductions are producing bounded execution routes.

---

# H. Exact action-value frontiers

## H1. Same-support favorable residual order is an exact action-value isotony candidate

**Paper priority: HIGH, clearly labeled candidate.**

At fixed support and side to move, define qA >= qB when:

- the mover's completion function is no harder in A;
- the opponent's completion function is no easier in A.

Same-action cofactors preserve the order, and the candidate induction implies exact state and fixed-action strong values are isotone.

Therefore each support/action/score-threshold region is upward closed and can be represented by a minimal antichain frontier.

Direct “action a is optimal” is **not** upward closed; exact action-value frontiers are the correct object.

Source:
- SUPPORT_LOCAL_ACTION_VALUE_ISOTONY.md, blob fb77a590aab4a3442fb902138e4ce1b9be960a90.

## H2. Complete-control and standard-board evidence is substantial

Across four complete controls:

~~~text
6,300,753 comparable q-state pairs
18,076,405 comparable fixed-action pairs
0 W/D/L or strong-distance violations.
~~~

On sampled standard 7x6 cross-rank construction:

~~~text
64,644 held-out q states
257,007 held-out legal actions
40,855 exact best moves proved
0 false best-move claims.
~~~

Coverage reaches 100% at rank 39 in the 20k-child control, and expanding child-frontier budgets materially improves ranks 26/28.

This is bounded evidence for a nonrecursive exact move-selection method, not root qualification.

---

# I. Recent control-parity / direct structural graph campaign

These are already central in paper revision 0.7 and remain essential:

1. exact common 2,108-state odd-center boundary collapse for 4/444/44444 under the declared policy;
2. 20 response-pair generators of rank 19 plus independent unmatched defect;
3. first nontrivial boundary vanishing identities at degree 3 and degree-4 immediate-win separation;
4. dimension perturbation falsifying the coarse GF(2) skeleton as W/D/L-complete;
5. exact 4x4 branch-and-collapse multiplicity;
6. 8,242-class recursive action-unlabelled quotient;
7. 10,507 residual-q column-orbit carrier refining the recursive quotient;
8. direct reconstruction of the quotient without physical-board-state enumeration;
9. three realizability/blocker rules explaining ~47% of the static-to-recursive gap;
10. finite local branch closure;
11. direct growth through 4x7 and 5x4;
12. exact binary-tie stabilizer H_s=ker(A_s);
13. constructive affine binary-tie canonicalization;
14. 6x4 prefix evidence localizing the scale wall to structural frontier cardinality.

---

# J. IsoMax / JSMinSys findings that belong in the paper

## J1. Lazy SMP is execution policy, not game semantics

**Paper priority: HIGH.**

The active solver method is:

~~~text
one exact value-dependency relation
+ multiple private demand traversals
+ optional deterministic exact-fact shared subgraph
+ first-exact-finisher arbitration
+ loser teardown.
~~~

The shared cache accelerates but does not own completeness.

This reinforces the method-emergence result: solver scheduling is operational policy over the common game relation.

## J2. One-wide plus deep workers is a qualified practical execution topology

**Paper priority: MEDIUM.**

The selected IsoMax line uses native Lazy SMP with one wide/root-frontier worker and remaining deep workers, exact-only shared publication, compact q identity, and separate private/shared caches.

This is implementation architecture, not a mathematical theorem.

## J3. Search-derived local zero bounds can remove most work on a hard control

**Paper priority: HIGH implementation consequence.**

The Phase-2 local LOWER0/UPPER0 experiment reported on its long control:

~~~text
total process cycles  -56.26%
nodes                 -75.33%
~~~

while preserving exact/public/shared filtering constraints.

This is direct evidence that theorem/bound information can matter more than low-level cycle shaving.

It should be presented as scoped experiment evidence, not a universal speedup.

Source:
- JSMinSys PR #79.

## J4. Dense residual-cofactor propagation produced a measured exact whole-solver improvement

**Paper priority: MEDIUM implementation evidence.**

The qualified dense-indexed cofactor path reduced same-runner:

~~~text
wall            -11.38%
CPU             -8.68%
process cycles  -8.72%
~~~

on its declared four-worker control while preserving solver semantics.

Source:
- JSMinSys PR #33.

## J5. Many plausible SMP optimizations were correctly rejected

**Paper priority: MEDIUM methodological summary.**

Root-order diversity, broader recursive-order diversity, wake-driven wait, low-legal sharing and other plausible changes were rejected when they increased total machine work or violated the move-witness contract.

This supports the project's optimization doctrine:

~~~text
wall-time signal alone
    !=
whole-solve effectiveness.
~~~

Do not enumerate every rejected PR in the paper; summarize the methodological conclusion.

---

# K. Important falsifiers and negative results

The paper should preserve these because they prevent overclaiming:

1. support-free residual state is insufficient; gravity/accessibility is load-bearing;
2. raw residual cardinality / antichain cardinality is not value-complete;
3. local/pairwise line-hit compatibility does not imply global realizability;
4. parity windows plus unit-capacity matching do not reconstruct legal alternating history without precedence correlation;
5. literal partial-squared sibling delta GF(2) space is move geometry, not strategic value;
6. the coarse one-relation/one-defect GF(2) skeleton is not W/D/L-complete;
7. same scalar 28 does not imply the structural core is the oracle terminal-line set;
8. direct best-action regions are not monotone under the favorable q order;
9. simple join/meet homomorphism fails for Bellman block transformers because of mixed reply covers;
10. stronger local column refinement does not resolve the coupled binary-tie fallback;
11. a polynomial guarded binary canonicalizer can be slower in practice;
12. the 6x4 wall is structural-frontier cardinality under current closure, not obviously canonicalization.

---

# L. Findings that must remain quarantined from production proof authority

Under the revision-0.7 theorem-contamination rule, the following categories require special handling:

## L1. Solved 28 and 61 terminal-line supports

These are validation/output evidence only.

## L2. Structural 28 research

The algebra may be exact, but because the target 28 was already known during the discovery campaign, use as production proof authority requires a blind independent provenance audit/re-derivation.

## L3. Opening-value premise studies

Research notes that explicitly admit published opening W/D/L values are useful for locating missing calculus but cannot support a blind theorem.

## L4. Oracle-selected proof-frontier experiments

If an oracle was used only to choose which witness to try, any final claimed theorem must be rerun or otherwise shown independent of that choice. The 99/822 local proof-grammar result passed such an all-legal-move recheck; source-frontier values themselves remain control data.

## L5. Solver/book benchmarks

Opening books, persistent solved caches, or known best moves may be used only as external controls unless the paper explicitly discusses ordinary engine practice rather than the blind production theorem lane.

---

# M. Publication integration decision

Revision 0.8 of the paper should add a broader synthesis section containing at minimum:

1. q_o/q_r exact semantics and proof/value identity boundary;
2. method emergence: one value relation, multiple evaluation policies;
3. finite-difference / seven-mode geometry and CPC binary potential;
4. exact non-center opening safety theorem and the remaining center-positive burden;
5. perfect-play set-valued output algebra and 61-vs-28 tie-convention distinction;
6. proof-frontier antichain algebra and proof-class compression;
7. realizability CSP/shuffle/NP-hardness/strategy-uniformity boundary;
8. RBA board-fiber, Bellman-information and four-front algebra;
9. support-local exact action-value frontier candidate/evidence;
10. scoped IsoMax execution consequences and the local-zero-bound result;
11. explicit provenance quarantine around structural 28 and solved-output-derived studies.

The recent control-parity/direct-structural campaign remains the paper's primary narrative, but it should be presented as the newest layer of a much larger structural program rather than as the whole program.
