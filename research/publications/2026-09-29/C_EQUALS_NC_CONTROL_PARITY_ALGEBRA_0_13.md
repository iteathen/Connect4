# C = NC? Control-Parity Algebra, Branch Collapse, and a Structural Research Program for Generalized Connect Four

**Joshua Oshiro**

**Agent-assisted research produced using the IsoGraph system designed by Joshua Oshiro. An AI agent was used in this research, but the AI agent was not responsible for the core findings. The core conceptual findings and research direction were identified by Joshua Oshiro; AI agents assisted in testing, extending, verifying, and documenting them.**

**Connect4 / IsoGraph Project research publication — revision 0.13**

**Local publication date:** 2026-09-29 (America/Los_Angeles)  
**Canonical research branch:** research/semantic-quotient  
**Source experimental branch:** research/nim-control-parity-algebra-20260929  
**Publication status:** research preprint; not peer reviewed  
**Revision note:** revision 0.13 integrates the late structural-closure and recursive-phase research campaign: remaining-move and support-release realizability laws, literal-continuation residual redundancy, first-terminal dominance, representation non-monotonicity, the falsification of raw action-permutation parity, and the deeper GF(2) continuation cocycle result extended from 4x4 to forty independent cycle constraints on 4x5 Connect-4. Revisions 0.1 through 0.12 remain immutable historical publication evidence.  
**License:** CC BY 4.0  
© 2026 Joshua Oshiro.

The original text, analysis, diagrams, and explanatory material in this paper are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0). Referenced source code, repository contents, third-party publications, trademarks, and externally owned materials retain their respective licenses and ownership.

---

## Abstract

Connect Four is usually approached computationally as a search problem over a rapidly branching game tree. This paper reports a different research direction: whether a substantial part of perfect-play structure can be represented by a rule-derived control algebra whose construction may be complicated while its composition and cancellation laws are comparatively simple.

The motivating hypothesis is Nim-like only in a narrow algebraic sense. Connect Four is partizan, gravity-coupled, first-win terminating, and structurally unlike an ordinary disjunctive sum of impartial games. No Sprague-Grundy theorem is assumed. Instead, the hypothesis asks whether geometry, support parity, residual winning obligations, response resources, and first-win deadlines induce a latent control representation whose compatible components admit XOR-like cancellation over GF(2).

Several bounded results support this direction while also sharply limiting it. First, under a restricted rule-derived response policy on the standard 7x6 board, the odd center prefixes 4, 444, and 44444 collapse onto exactly the same set of 2,108 unresolved boundary states despite different literal histories and different distances to the center boundary. Second, the 7x6 single-defect response family yields 20 GF(2) response-pair generators of rank 19 with a unique recovered dependency, while the unmatched center-top event adds an independent dimension. Third, the common 2,108-state boundary has no nonzero degree-1 or degree-2 vanishing polynomial in the declared 12-bit support encoding, exactly two independent cubic identities, and 43 identities by degree four; the cubic identities factor into reflected support-parity gates associated with center-crossing diagonal completion. Fourth, blind width/height perturbation preserves a one-relation/one-unmatched-defect skeleton across every tested safe single-defect family, but post-hoc solved-board comparison shows that this skeleton is not sufficient to determine W/D/L. Fifth, an exhaustive 4x4 control demonstrates that perfect play itself is highly non-unique and repeatedly reconvergent: 56,763 states have multiple optimal moves and 65,507 states are optimal transposition merges.

Subsequent experiments sharpen the quotient result substantially. On exhaustive 4x4 Connect-4, erasing literal action labels yields 8,242 recursive all-legal classes from 161,029 physical states, while a static residual-q carrier canonicalized under column permutations yields 10,507 orbit states. Every one of those static residual-q orbit signatures lies wholly inside one recursive unlabeled class. A direct producer starting from empty-board geometry and residual antichain transitions reconstructs that quotient without constructing the physical board-state graph. Three exact local realizability rules then reduce the 4x4 structural graph from 10,507 to 9,441 states while preserving all 8,242 recursive classes, directly explaining 1,066 of the original 2,265 static-to-recursive excess states, about 47%. Repeated child-class closure reaches the exact quotient from the rewritten 9,441-state graph in seven rounds, separating the polynomial quotient-minimization problem over an existing graph from the still-open problem of constructing a small graph.

Later rule-derived closure extends this explanation. Remaining-move capacity reduces the 4x4 C4 carrier to 9,321 states, support-release turn-slot capacity to 9,319, and bounded open-cap first-terminal dominance to 9,090 while preserving the same 8,242 recursive classes. Relative to the original 10,507-state carrier, 1,417 of the 2,265 static excess states are thereby removed or explained, about 62.56%. The strongest conceptual result is not merely the additional reduction: 427 of 438 observed class-preserving single-opponent-residual deletions are already equivalent under identical literal future column actions, including all 170 open-cap cases. For the 143 feasible open-cap cases not already removed by support-release capacity, every cap-completing continuation reaches another terminal obligation no later. This identifies first-terminal dominance, rather than only unrealizability or action relabeling, as a major source of structural redundancy. A negative control is equally important: deleting a behaviorally redundant residual can enlarge intermediate structural graphs because the residual may still simplify later cofactors. Semantic redundancy is therefore not representation-monotone [68-72].

Direct rule-only growth controls extend the structural producer to 4x5, 4x6, 4x7, and 5x4 Connect-4 without physical-board enumeration. The fixed-width 4x4 through 4x7 sequence grows from 9,441 to 102,815 to 693,284 to 3,534,913 direct structural states; the successive growth factors fall but remain fully compatible with exponential asymptotics. A same-area 4x5 versus 5x4 control differs by about 2.82x in structural-state count, strengthening the conclusion that gravity/support orientation is load-bearing.

Column canonicalization has also advanced from a bounded symmetry observation to a constructive guarded result. Exact incidence refinement makes 99.8091% of audited 4x4 nonterminal states canonical without permutation search. In the remaining binary-tie family, residual incidence now constructs the exact stabilizer directly by GF(2) elimination, recovering H_s={(0,0),(1,1)} and x1 xor x2=0 on all 18 audited states without enumerating the 2^m orientation assignments. This construction extends to an exact affine binary-tie canonicalizer whose work is polynomial in the explicit residual representation and number of binary tie classes, while retaining exhaustive fallback for larger tie classes. On 5x4 it reduces exhaustive permutation candidates by 73.27% but is 40.69% slower than the simpler partitioned exact method, a useful negative result separating structural polynomiality from current runtime efficiency.

The next width probe exposes the remaining bottleneck more sharply. A full 6x4 direct-structural run reached the ten-minute workflow wall without producing a completed graph. Exact prefixes show 286,356 cumulative states through rank 10 and 616,710 through rank 11, with the rank-11 frontier alone containing 330,354 structural states. Through rank 10 all unresolved ties are binary; by rank 11 only 16 nonbinary-tie calls appear among 848,710 transition canonicalizations, maximum exact candidate count remains eight, and average residual requirements per state fall by 12.32% while the frontier grows by about 1.97x. The visible width-growth burden is therefore the cardinality of the structural frontier itself, not large permutation search or growing residual-antichain size per state.

A later XOR-placement audit materially sharpens the algebraic picture. Ordinary current-action permutation parity is rejected as generic symmetric-group bookkeeping: transporter parity is well-defined exactly in the fibers with all action-slot tokens distinct. After quotienting that gauge away and requiring identical immediate phase-free action profiles, however, a deeper recursive two-sheet residue remains. On 4x4 C4 it contains 61 binary groups and 31 binary-continuation edges with one independent reconvergent cycle; its GF(2) syndrome is zero. On the larger outcome-blind 4x5 C4 carrier, 696 binary groups yield 469 binary-continuation edges, including 95 sheet-flipping edges, 42 genuine reconvergent source/target pairs, and cycle rank 40. All forty independent cycle syndromes vanish. Thus the bounded recursive phase is non-vacuously integrable over GF(2) across both controls, while generic transition/cofactor confluence remains an active alternative explanation [65-67,73].

These results do not establish a polynomial-time perfect-play algorithm, a scalar nimber, a W/D/L XOR formula, or a general theorem for arbitrary board dimensions. They instead identify a concrete research object: a latent control quotient in which literal branches may diverge and later collapse, paired control resources may cancel, unmatched defects may survive, and geometry-dependent guards may mediate algebraic consequences.

The paper also records a methodological finding about IsoGraph. A full Discovery Protocol pass over the represented IsoMax material found valid structure but did not generate the experimental space that exposed the control-algebra phenomena. This motivated a separate proposal in which Discovery Protocol issues an Experimental Warrant and a distinct experimental module constructs and revises an open-world experimental model. The proposal is treated as methodology, not as evidence for the game-theoretic hypothesis.

A comprehensive audit of the wider Connect4/IsoMax corpus shows that the recent control-parity campaign is one layer of a larger structural program. Earlier exact work establishes an ordinary future-behavior carrier from support plus residual winning requirements, a reflection-aware action quotient, finite-difference and binary control-potential descriptions of the geometry, and a rule-derived theorem excluding every non-center first move from being a P0 forced win on standard 7x6. Separate work develops exact perfect-play output algebra, recursive proof-antichain normalization, realizability and strategy-dependency characterizations, partial-value residual-boundary algebra, and support-local exact action-value frontiers. Together these findings localize the remaining standard-root problem to a compact realizability-preserving controllable-predecessor/obligation calculus capable of proving the positive center opening before structural frontiers expand.

Because the structural language can otherwise remain remote from ordinary play, revision 0.9 also gives a human-facing translation. The practical protocol treats a board as support plus surviving winning recipes: take terminal wins, answer playable immediate threats, distinguish live from blocked lines, account for which cells become playable after a move, seek response overload rather than raw line count, and use parity only under its support/resource guards. On the empty standard board the exact non-center safety theorem has a direct human consequence: a first player seeking a forced win should open in the center, because every non-center opening is structurally proved non-winning for P0. Later center preference is not elevated into a universal theorem; live-line structure, support, accessibility, and deadlines dominate static center distance.

---

## 1. Introduction

Connect Four has been solved on the standard 7x6 board since 1988. Victor Allis established a first-player win using a knowledge-based strategy system together with search, and later work by John Tromp solved additional board sizes and developed highly optimized search programs [1–3]. These results establish game-theoretic values for important finite instances. They do not imply that the structure of perfect play has been reduced to a compact algebraic object.

The present research asks a different question.

Suppose a Connect Four position contains several interacting structures:

- geometric winning-line incidence;
- gravity and legal support;
- alternating ownership/control;
- residual requirements for future winning lines;
- response resources;
- first-win deadlines;
- symmetry and transposition structure.

Must exact perfect play be obtained primarily by traversing a large future game graph, or can these structures be transformed into a smaller control representation whose combination law is substantially simpler than the search that originally revealed it?

Joshua Oshiro proposed that the relevant shape might be “Nim-like”: not because Connect Four is an impartial game, and not because columns should be assigned ordinary nimbers, but because pairing, cancellation, parity, unmatched residuals, and multiple equivalent winning continuations suggested that the hard object might decompose into components with an XOR-like composition rule. The conjectured simplicity is in the combination law, not necessarily in the construction of the operands.

A schematic form is

$$
X(s)=F(G(s),R(s),P(s),O(s),D(s),\ldots),
$$

where:

- $G$ represents geometry and winning-line incidence;
- $R$ represents residual winning requirements;
- $P$ represents support/control parity;
- $O$ represents guarded obligations and response resources;
- $D$ represents first-win timing and deadlines.

The function $F$ may be high-degree, vector-valued, recursively derived, or itself represented as a system of constraints or polynomials. The hypothesis only asks whether, after $F$ has been constructed, compatible control components obey a simpler composition law.

This paper reports the first bounded evidence for that program.

The title “C = NC?” is intentionally playful. Here C refers to Connect Four. The title is a play on P versus NP, not a formal complexity-class identity and not a claim that Connect Four belongs to or equals the complexity class NC. If a generalized Connect Four family were eventually shown to admit a polynomially constructible structural solution replacing what otherwise appears to require large search, the joke would become descriptively apt. No such theorem is claimed here.

---

## 2. Prior work and conceptual background

### 2.1 Solved Connect Four

Allis’s 1988 work gave a knowledge-based solution of standard Connect Four and proved a first-player win on the 7x6 board [1]. The work is notable here because it already demonstrates that rule-level structural reasoning can replace part of blind game-tree expansion.

Tromp later reported game-theoretical values for many medium board sizes and described the Fhourstones solver family [2,3]. These board-size results are used in this paper only after rule-derived structural measurements have been frozen. They are external comparison evidence, never inputs to the structural producer.

### 2.2 Nim and Sprague-Grundy theory

Sprague-Grundy theory gives an exact reduction of finite impartial normal-play games under disjunctive sum to Nim values, with XOR as the composition law [4,5]. Connect Four does not satisfy the assumptions needed to apply that theorem directly:

- the players have distinct roles;
- legal consequences depend on ownership;
- gravity couples spatial substructures;
- winning lines can share cells;
- first-win stopping creates deadline effects;
- apparent components may share blockers and response resources.

Therefore this paper does not import nimbers into Connect Four.

The useful analogy is narrower. In many systems, the representation of a component can be difficult while the law for composing already-derived components is simple. Pairing can cancel. Unmatched components can survive. Parity can determine who receives a residual opportunity. The present work tests whether some Connect Four control structure has this form.

### 2.3 IsoGraph and IsoMax

The research was organized using the IsoGraph family, whose current qualified stack includes primitive-logic closure, implicit assertions, Quantifiable Unknown, Discovery Protocol, Natural Entropic Identity, and Detailed Transition System modules [6–11]. IsoGraph is used here as a structural research framework. It does not supply game values by authority.

IsoMax is the project’s exact forward Connect Four solver family. Its modern implementation is built around JSMinSys and Lazy SMP search, including one-wide/multiple-deep worker configurations, exact sharing, local proof bounds, and heavily qualified hot-loop accounting [21–24]. IsoMax is relevant for three reasons.

First, it provides an exact computational baseline against which structural methods may eventually be checked.

Second, previous IsoGraph renderings of IsoMax exposed proof-state and transition structure that helped motivate the search for a more compact control description [19,20].

Third, the experiments reported in this paper were deliberately separated from solved-position knowledge. The structural producer uses geometry and game rules; existing exact solvers and solved databases are validation or post-hoc comparison sources, not premises.

---

## 3. Research discipline

The project adopted a strict separation between construction evidence and validation evidence.

### 3.1 Rule-only producer

The producer is permitted to use:

- board width and height;
- Connect-K winning-line geometry;
- gravity/support legality;
- alternating turns;
- first-win stopping;
- the literal tested prefix;
- consequences derived freshly from those rules.

It is not permitted to use:

- solved opening books;
- precomputed W/D/L labels;
- known best-move labels;
- solved perfect-play terminal-line maps;
- search-oracle outputs as leaf truth.

This boundary is essential because the goal is to test whether structure can produce the relevant algebra rather than fit an already-solved answer.

### 3.2 Post-hoc outcome comparison

Once a structural result is frozen, known outcomes may be consulted to ask whether the structure correlates with, distinguishes, or fails to distinguish game value.

A post-hoc mismatch is valuable. It prevents a structural coincidence from being over-promoted into a value theorem.

### 3.3 Separate burdens

Three burdens are kept distinct:

1. **Soundness:** does a proposed relation follow from rules and represented structure?
2. **Construction:** how is the relation or certificate discovered?
3. **Cost:** how much work is required to construct and verify it over a generalized family?

A compact certificate does not by itself establish a polynomial-time discovery algorithm.

### 3.4 Heuristic provenance: the centerline problem

A further distinction is necessary between **what preserves exact search correctness** and **what qualifies as rule-derived research evidence**.

A move-ordering heuristic can be harmless to exact minimax correctness even when it is only a guess. Alpha-beta may search a guessed move first and still return an exact result so long as every pruning decision is justified by sound bounds rather than by the guess itself.

That is not sufficient for the present research standard.

This campaign asks whether a reduction can be reconstructed from the axioms of the board geometry and game rules without importing prior solved knowledge. Under that stronger standard, heuristics fall into three provenance classes.

#### A. Rule-derived heuristic

A quantity is rule-derived when its definition can be generated mechanically from the current position, board geometry, and game rules alone.

Examples include:

- the number or structure of currently live winning lines;
- support-accessible winning-line incidence;
- symmetry classes;
- parity or deadline quantities proved from legal support and alternation;
- a static center-incidence score, **if** that score is explicitly derived from mechanically generated winning-line geometry rather than chosen because center is already known to be strong.

Such a quantity may be used as a search heuristic without contaminating the blind producer.

However:

~~~text
rule-derived heuristic
    !=
exact value theorem
~~~

A live-line or center-incidence score may order moves. It may eliminate moves only after an independent theorem proves that the relevant score relation implies the required minimax consequence.

#### B. Unproved heuristic prior

A move preference may instead be chosen because it appears plausible:

~~~text
"center probably matters"
"this shape looks stronger"
"this move usually seems good"
~~~

This need not invalidate an exact search if it affects ordering only.

But it is not evidence that the preference follows from Connect Four itself.

For this research program, an unproved prior is therefore admissible only as an explicitly labelled experimental/search-ordering device. It cannot be counted as part of a structural derivation and cannot justify removing alternatives.

#### C. Solved-knowledge-contaminated preference

A preference is contaminated when its selection depends on a known solved result:

~~~text
"search center first because solved play says center is best"
"start from 444 because the opening database says those moves are optimal"
"choose this weight because it best reproduces solved W/D/L labels"
~~~

That information may be used after a result is frozen as validation or falsification evidence, but it is not admissible as a premise of the rule-only producer.

Under the project's strict blind standard, using such information to eliminate search is equivalent to importing an opening-book fact, even if the fact is disguised as a heuristic weight or fixed move order.

#### Centerline versus live-line evaluation

This distinction explains why centerline strategy occupies an epistemically awkward position.

A center-first ordering can have at least three different justifications:

~~~text
mechanically derived center incidence
    -> rule-derived heuristic

human intuition that center is likely strongest
    -> unproved prior

knowledge that solved perfect play favors center
    -> solved-knowledge contamination
~~~

The numerical move order can be identical in all three cases. What differs is its provenance.

Live-line evaluation is cleaner under this standard when it is computed directly from the current position's surviving winning-line geometry. Its value changes because blockers, ownership, support and accessibility change. No solved game label is required to define the quantity.

That does not make live-line evaluation an exact value oracle. It makes it a **rule-derived evaluation function**.

The key firewall is therefore:

~~~text
rule-derived evaluation
    -> may guide search

unproved prior
    -> may guide exact search if disclosed,
       but supplies no structural evidence

solved-result-derived preference
    -> excluded from the blind producer

exact search elimination
    -> requires a theorem
       from admissible rule/geometry premises
~~~

#### Heuristic-domain firewall: heuristics may change search order, never the proof domain

The word **heuristic** must not become a route for importing an opening book one move at a time.

A heuristic is permitted to influence **how** an exact proof is searched. It is not permitted to redefine **what must be proved**.

The governing rule is:

> **A heuristic may decide what the solver examines first; it may not decide what the solver is allowed not to prove.**

Therefore a heuristic may legitimately:

- order legal moves;
- prioritize one branch before another;
- allocate different amounts of speculative effort;
- supply a non-authoritative static evaluation;
- select a principal variation for early exploration;
- improve alpha-beta cut opportunities when the resulting cuts are justified by exact bounds.

A heuristic may not, merely because of its score:

- delete a legal move from the minimax proof;
- assert an exact W/D/L bound;
- advance the claimed solved root through an unproved move;
- initialize the solver at a descendant and then claim that its ancestors were solved;
- convert a preferred line into an assumed opening prefix;
- turn repeated high-confidence choices into a de facto opening book.

Formally:

~~~text
heuristic
    -> ordering / prioritization / estimation

closed law or exact search consequence
    -> proof-domain reduction
~~~

The distinction must hold at every ply.

##### The long-prefix failure mode

Suppose a centerline or other evaluation ranks the following sequence highest:

~~~text
4
44
444
4444
44444
...
~~~

The solver may follow that line first for ten, twenty, or more plies.

But if the other siblings have not been eliminated by exact search or by qualified closed laws, they remain part of the proof obligation.

Thus:

~~~text
search heuristic PV:
    4 -> 4 -> 4 -> 4 -> ...
        is allowed

assumed solved prefix:
    4 -> 4 -> 4 -> 4 -> ...
        is not allowed
        unless every skipped alternative
        has an exact justification
~~~

A long sequence of heuristic moves does not become exact merely because every individual move was produced by an evaluation function.

This prevents the definition of heuristic from being stretched until almost the entire solved opening is silently assumed.

##### Rule-derived versus oracle-informed heuristics

Two heuristics can return the same move order while having different provenance.

A **rule-derived heuristic** is defined independently from:

- current position;
- board geometry;
- legal support;
- generated winning-line incidence;
- live residual requirements;
- symmetry;
- other quantities mechanically derived from the formal game.

Examples include a mechanically defined center-incidence score or live-line evaluation.

An **oracle-informed heuristic** is one whose structure, weights, thresholds, feature choices, tie breaking, or tuning were selected because they reproduce known solved moves or W/D/L labels.

Both can preserve the correctness of an exhaustive exact search if they alter ordering only.

But for the blind structural-solver claim in this paper:

~~~text
rule-derived heuristic
    -> admissible search guidance

oracle-informed heuristic
    -> may be useful engineering
    -> not admissible evidence for blind structural performance
       unless clearly separated and disclosed
~~~

The reason is methodological rather than semantic. Exact alpha-beta may still return the correct value under an oracle-informed move order, but the measured efficiency would partly reflect prior knowledge of the solved game.

##### Centerline evaluation

A centerline evaluation is admissible as a heuristic when its formula is independently generated from geometry rather than fitted to known opening play.

For example:

~~~text
generated Connect-K incidence
    -> count or weight the lines incident to each legal landing cell
    -> order moves by the resulting geometric centrality
~~~

On the empty standard board, such a calculation may predictably rank the center first.

Knowing in advance that the computation will rank center first does not by itself invalidate the heuristic.

The invalid step would be:

~~~text
centerline ranks 4 first
    ->
therefore 4 is exact
    ->
discard all other openings
~~~

That implication requires a closed law, not a heuristic.

##### Live-line evaluation

Live-line evaluation is similarly admissible when recomputed from the current position's surviving winning geometry.

Because blockers, residual requirements, support, and accessibility change during play, a live-line score is dynamic rather than a stored move preference.

It may be used to order and prioritize search.

It may not, without a closed law, establish:

~~~text
higher live-line score
    ->
equal-or-better exact game value
~~~

The support-local isotony work is relevant research toward such laws, but a heuristic score and an exact value order must remain separate until the required theorem closes.

##### Proof-domain invariant

For an exact root claim, the solver should be able to maintain the following invariant:

> Every legal alternative omitted from explicit recursive search is covered by an exact bound, exact equivalence, terminal rule, or qualified closed law.

If an omitted alternative is justified only by:

~~~text
the evaluation preferred another move
~~~

then the proof is incomplete.

This invariant provides a simple audit of heuristic use regardless of how sophisticated the evaluation becomes.

#### Theorem contamination: the more serious failure mode

The most serious contamination risk is not an obvious opening-book lookup. It is **prior solved-game knowledge being smuggled into the definitions, lemmas, constants, case partitions, or supporting theorems that later justify an apparently rule-derived production method**.

A final theorem can have a clean surface form while still depending on contaminated upstream choices.

Examples include:

- choosing a threshold because it reproduces solved W/D/L labels;
- defining a "special" structural class around a known winning opening;
- selecting only those case splits that separate already-known best moves;
- fitting evaluation weights against solved positions and later treating the fitted score as if it were geometric law;
- stopping a derivation when the oracle says the remaining cases have the desired value;
- declaring particular cells, lines, or prefixes "important" because their importance was learned from solved play;
- depending on an earlier lemma whose own construction used solved-game knowledge.

This leads to a stronger production-admission rule:

> **Every theorem used to eliminate search must have a complete provenance chain terminating only in game rules, board geometry, explicitly admissible current-state facts, and previously qualified rule-derived theorems.**

The provenance requirement applies to the entire proof graph, not merely the final theorem statement.

The distinction is:

~~~text
solved knowledge suggests where to look
    -> admissible discovery guidance

solved knowledge determines what theorem, parameter,
definition, case split, or lemma is accepted
    -> contaminated support
~~~

The oracle may therefore inspire a conjecture. It may test a frozen theorem. It may provide a counterexample. It may not supply authority to any node in the production proof graph.

##### Canonical example: the 28-realization trap

A particularly important example comes from the standard 7x6 perfect-play corpus.

Suppose exhaustive perfect-play analysis establishes that, among the perfect-play winning continuations under study, Player 1's terminal wins occur in exactly **28 distinct winning-line realizations**.

If that observation is obtained from the solved corpus, then the value

~~~text
28
~~~

is solved-game knowledge.

It may be useful as external evidence. It may not be used as theorem authority.

The following procedure is contaminated:

~~~text
solved perfect-play corpus
    -> observe 28 terminal winning-line realizations
    -> search for a geometric formula that evaluates to 28
    -> accept that formula because it matches 28
    -> use the formula to prune or certify play
~~~

The contamination remains even if the final production formula contains only board dimensions, line incidence, parity, or other apparently geometric quantities. The problem is not the surface syntax of the formula. The problem is that **28 acted as the target that selected, tuned, or validated the theorem before the theorem had an independent derivation**.

Likewise, contamination can occur without the literal constant 28 ever appearing in production code. Knowing the solved result may influence:

- which variables are introduced;
- which geometric decomposition is tried;
- which cases are retained or discarded;
- which threshold is selected;
- which invariant is called significant;
- when the derivation is declared complete.

The clean order is the reverse:

~~~text
board geometry + game rules
    -> independently derive theorem T
    -> freeze T and its proof dependencies
    -> evaluate T on 7x6
    -> obtain some value N

only afterward:
    compare N with the solved perfect-play observation 28
~~~

If $N=28$, the equality is post-hoc validation evidence. The theorem's authority still comes entirely from its independent rule/geometry proof.

If, moreover, one can prove from first principles that

$
\text{7x6 geometry}+\text{Connect Four rules}
\vdash
N=28.
$

without using the solved perfect-play realization count anywhere in the construction or support of that proof, then the number 28 has acquired an independent admissible derivation for that theorem.

Until such a derivation exists:

~~~text
28 from solved perfect play
    -> validation / falsification evidence only

28 independently derived from geometry and rules
    -> admissible theorem consequence
~~~

This example demonstrates why theorem provenance must include the **discovery and selection path**, not merely the final proof statement. A theorem can be extensionally correct and still fail the blind-production standard if its form was fitted to a known solved answer.

A useful deletion test is:

~~~text
delete:
    solved tables
    opening books
    oracle outputs
    known best-move labels
    fitted outcome-derived parameters
    solved-game annotations

retain:
    board geometry
    game rules
    current position
    qualified closed laws
    generic theorem code

note:
    a target-instance proof certificate may verify an earlier
    result, but it is not a closed law and therefore cannot
    substitute for solving the target instance

re-derive / re-check the theorem

if the reduction still follows:
    provenance-clean

if it no longer follows:
    contaminated
~~~

A second useful control is **blind perturbation**. Change width, height, Connect-K, or another structural parameter and verify that the theorem responds only to its declared premises rather than continuing mysteriously to reproduce the known 7x6 solution. This does not prove generality by itself, but it is an effective falsifier for disguised answer-fitting.

This theorem-contamination firewall is stricter than ordinary engine correctness. An exact engine may remain mathematically correct while using an opening book, persistent solved cache, or outcome-informed heuristic. The present research claim is stronger: a search-eliminating production theorem must be independently reconstructible from the formal game itself.

#### Closed laws versus unclosed theorems and results

For a solve engine, the central distinction is not whether a statement was computed earlier. It is whether the statement has been established as a **closed law of the system** or remains an **instance result**.

The governing rule is:

> **A provenance-clean closed law may be used directly as part of the solver's mathematics. A result of solving a particular instance may not be promoted into such a law merely so that the same instance can be skipped later.**

This gives three different objects.

~~~text
closed law
    = a generally quantified theorem
      with all proof obligations discharged
      from rules, geometry, logic, and already qualified laws

unclosed theorem / research theorem
    = a theorem-shaped claim whose general proof,
      domain closure, or supporting obligations
      are not yet fully discharged for solver admission

instance result
    = a value, move, bound, certificate, policy,
      or other conclusion obtained for one particular instance
~~~

Only the first category belongs in the solver's trusted mathematical basis.

##### A closed law does not need to be re-proved during every solve

Once a general theorem has been proved, provenance-audited, and admitted as a law, the engine may use it exactly as it uses any other established mathematics.

It need not regenerate the original proof every time.

For example, if a closed law has the form

$$
G(W,H,K,\ldots)\Longrightarrow B(W,H,K,\ldots),
$$

then on an input satisfying the guard $G$, the solver may infer $B$ directly.

This is no more an opening book than using gravity, symmetry, Boolean absorption, or a proved algebraic identity.

The admissible chain is:

~~~text
primitive game axioms
    ->
proved general laws
    ->
apply laws to the current instance
    ->
solve what remains
~~~

The forbidden chain is:

~~~text
solve target instance
    ->
record target-instance conclusion
    ->
rename or package that conclusion as a theorem
    ->
skip the same work on later runs
~~~

##### Closed form is the clearest admissible case

A closed-form theorem is especially easy to use correctly.

If a theorem proves, for a declared family,

$$
F(W,H,K)=C(W,H,K),
$$

or proves a value bound from symbolic guards, then the solver may evaluate or specialize that law directly.

The theorem's proof need not execute again.

What matters is that the theorem was established independently of the target solved answer and that its quantifiers and guards really close over the stated family.

Thus:

~~~text
use a proved general formula
    -> mathematics

reuse a previously computed 7x6 answer
    -> solved-instance reuse
~~~

##### General specialization is allowed

A law may have a specialized domain.

For example, a theorem of the form

$$
K=4,quad W=7,quad Hge4,quad Hequiv0pmod2
Longrightarrow
orall c
e	ext{center},;
operatorname{NonWin}_{P0}(c)
$$

would be a legitimate solver law **if its universal proof is genuinely closed**.

Its use on $H=6$ would then be ordinary theorem specialization. The engine would not need to reconstruct the 69-line proof every time.

The presence of constants such as (K=4) or (W=7) is not itself contamination. A theorem can legitimately characterize a special mathematical family.

The contamination question is how that law was obtained and justified.

##### What makes a law closed

For this project, a theorem is admissible as a closed solver law only when:

1. its variables quantify over a genuine declared family rather than merely renaming the target solved state;
2. its premises terminate in game rules, geometry, logic, or already qualified closed laws;
3. every proof obligation required by the stated quantifiers has been discharged;
4. no solved table, best-move label, oracle value, fitted parameter, or target-instance answer is a premise;
5. solved knowledge did not determine acceptance of the law through target fitting, selective case retention, or an equivalent hidden dependency;
6. the stated conclusion follows for every instance satisfying the declared guards;
7. any supporting theorem used as a law is itself closed under the same standard.

Once these conditions hold, the law can be promoted into the solver's mathematical basis.

##### What remains an unclosed theorem

A statement can be mathematically persuasive, exhaustively checked on a target board, or even accompanied by a correct target-instance proof and still fail to qualify as a solver law.

Examples include:

- a construction proved only for the standard 7x6 instance;
- a parameterized claim whose universal step has not been proved;
- a general-looking theorem whose proof still requires an instance-specific enumeration or certificate that has not itself been generalized;
- a theorem whose stated family is broader than the cases actually closed;
- a result whose discovery path may have been shaped by known solved answers and has not yet passed the provenance audit required for law promotion.

Such work remains valuable research evidence.

But until closure is established, its target-instance consequence cannot be imported into the solver as an axiom without becoming equivalent to answer reuse.

##### Instance results remain results

The following are instance results even when perfectly correct:

- a solved W/D/L value;
- a known best move;
- a root bound;
- a generated response policy for one board;
- a target-instance proof certificate;
- a completed 69-line coverage table for one target position;
- a persistent transposition-table entry;
- an exact search result such as (44	o444).

They may validate a theorem, falsify a theorem, or document an earlier solve.

They do not become reusable solver laws merely because they were produced by mathematics rather than brute-force search.

##### Application to the current center-opening work

The existing non-center opening research establishes a strong target-instance result and records a parameterized seven-wide/even-height statement.

Under the stricter law/result distinction, that is not yet enough by itself to authorize the solver shortcut.

Before using the result as a built-in solver law, the project must perform a **closure audit** of the generalized theorem:

~~~text
candidate law:
    K=4
    W=7
    even H>=4
        ->
    every non-center P0 opening is non-winning

closure questions:
    are all quantified heights covered by one proof?
    is the response construction symbolic/generic?
    are legality and preemption proved for the whole family?
    does any supporting step depend on a target-instance certificate?
    did known 7x6 solved values influence theorem acceptance?
~~~

If those obligations close, the theorem may be promoted to a law and used directly by IsoMax.

If they do not close, the existing 7x6 consequence remains an exact research result but cannot serve as a search-skipping axiom.

This is why the status of the current center result matters:

~~~text
proved 7x6 consequence
    != automatically
closed solver law
~~~

The research target is to close the general theorem.

##### Solver-law promotion boundary

The project should therefore maintain a distinct promotion step:

~~~text
research claim
    ->
general proof
    ->
provenance audit
    ->
closure audit
    ->
qualified closed law
    ->
solver theorem base
~~~

A theorem should not enter the solver theorem base merely because it is useful.

It enters because its general proof and provenance are closed.

##### Practical deletion test

A useful test remains:

~~~text
delete:
    opening books
    solved tables
    known best-move labels
    target-instance certificates
    persistent solved-state caches
    prior target-instance theorem outputs

retain:
    game rules
    geometry definitions
    qualified closed laws
    generic solver code
~~~

If the solver can still derive the target result using those laws plus the ordinary remaining search, the solver is using mathematics rather than replaying the previous answer.

##### Solver versus verifier

A proof verifier and a solve engine remain different:

~~~text
old instance certificate + checker
    -> verifier

closed general law + solver
    -> solver using mathematics

target-instance result embedded as a rule
    -> answer reuse
~~~

The distinction is not whether something is precomputed.

A closed theorem is necessarily known before the solve.

The distinction is whether the pre-existing object is a **general law** or the **answer to the instance being solved**.

##### Operational rule for IsoMax

For IsoMax, the intended opening reduction is therefore:

~~~text
trusted theorem base:
    primitive rules
    + qualified closed structural laws

current input:
    W,H,K

apply all matching closed laws
    ->
obtain exact admissible bounds
    ->
search only what those laws leave unresolved
    ->
derive root value
~~~

The solver does not need to re-prove the laws.

But until the non-center opening theorem is closed and promoted under this standard, IsoMax should not simply embed its standard-7x6 conclusion.

The governing statement is:

> **Laws may be used. Results may not be smuggled in as laws. An unclosed theorem stays on the research side of that boundary until its general proof is closed.**

#### The opening-prefix consequence

This is directly relevant to the desired opening reduction.

The target is not to add the move sequence

~~~text
444
~~~

as an opening-book axiom.

The admissible target is a theorem chain:

$
\text{Connect Four rules}+\text{7x6 geometry}
\vdash
\varnothing\to4\to44\to444.
$

Every implication must remain valid if all solved tables, opening books, precomputed W/D/L data, and search-oracle conclusions are deleted.

An exact oracle may verify or falsify the theorem after construction. It may not supply a premise.

The distinction is important because a theorem-backed prefix may legitimately remove the explosive opening plies from later search, while an intuition-backed or solved-result-backed prefix cannot satisfy the same research claim.

---


## 4. Center-prefix phase structure

The first useful family arose from repeated center play on the standard 7x6 board.

Using one-based column labels, consider the prefixes:

~~~text
4
44
444
4444
44444
~~~

The odd stacks 4, 444, and 44444 share a rule-derived phase pattern under the tested follow-up response policy. The six non-center columns remain paired, while the center contains one unmatched top event. The distance to that unmatched event changes with the literal center depth.

The even stacks 44 and 4444 are structurally different. The controller roles swap, the unmatched center defect disappears under the same response template, and horizontal winning requirements become relevant.

This already rejects a simple “center depth alone” account. What matters is a combination of center geometry, control role, phase, and boundary position [12].

---

## 5. Exact common-boundary collapse

The strongest first invariant is a many-to-one collapse across different histories.

For each odd center stack 4, 444, and 44444, consider a restricted defender policy:

1. after each opponent move, take an immediate legal win if one exists;
2. otherwise respond directly above the opponent’s move;
3. if the prescribed response is unavailable and there is no immediate win, stop and classify the state as unresolved.

Every opponent choice inside that fixed policy is explored. This is not full minimax.

### 5.1 The 4,096 endpoint support family

When the unmatched center-top event is reached, every non-center column has consumed an even number of cells: 0, 2, 4, or 6. Therefore the side-column support family has

$$
4^6 = 4096
$$

possible endpoints.

The exact rule-only census is:

| Endpoint class | Count |
|---|---:|
| Immediate legal P0 win | 1,987 |
| No immediate threat for either player | 2,108 |
| Full board with no winner | 1 |

No solved game-value label is used in this classification [13].

### 5.2 Stronger opportunistic policy

With the “take the win, otherwise follow up” policy, the three starts traverse very different numbers of states:

| Start | Unique counter states | Opponent choices | Immediate-win responses | Unresolved top endpoints |
|---|---:|---:|---:|---:|
| 4 | 9,180 | 52,210 | 20,269 | 2,108 |
| 444 | 6,673 | 37,701 | 13,083 | 2,108 |
| 44444 | 3,400 | 19,046 | 6,284 | 2,108 |

The important result is not the equal count.

The exact unresolved endpoint sets are element-by-element identical.

Thus three positions with different literal histories and different center-stack depths collapse to the same unresolved future boundary after the center defect is discharged [12,13].

### 5.3 Interpretation

This suggests that literal move history is finer than the control state needed at that boundary.

Schematically,

$$
A \ne B \ne C
$$

while, under the tested boundary transformation $F$,

$$
F(A)=F(B)=F(C).
$$

That is exactly the kind of structure a quotient-based solution would need: many physical realizations corresponding to one downstream control class.

This result is restricted to the declared policy and boundary. It does not prove that the three starting positions are globally equivalent under arbitrary play.

---

## 6. GF(2) response algebra

The next experiment projected legal response-pair fragments into an ownership-labelled incidence space over the standard board’s winning-line geometry.

For the 7x6 single-defect response family:

~~~text
response-pair generators  = 20
GF(2) rank                = 19
linear relation nullity   = 1
rank after unmatched top  = 20
~~~

The unique recovered dependency is

$$
T_1 \oplus T_3 \oplus T_5 \oplus T_7 = 0,
$$

where $T_c$ denotes the XOR contribution of all three ordinary response pairs in one-based column $c$ [14].

Expanded, the dependency contains the ordinary response pairs in columns 1, 3, 5, and 7.

The unmatched P1 center-top event lies outside the span of the paired-response generators. Adding it raises rank from 19 to 20.

### 6.1 Why this matters

This is not raw token parity alone.

The vectors are derived from ownership-labelled incidence with winning-line geometry. The relation therefore reflects a geometric response structure.

The result has the qualitative form proposed by the hypothesis:

~~~text
paired response resources
    -> one exact cancellation relation

unmatched control event
    -> survives as an independent dimension
~~~

This is a genuine GF(2) structural result.

It is not a W/D/L theorem.

---

## 7. Guarded Boolean-polynomial structure

The common 2,108-state unresolved boundary was then encoded using 12 Boolean variables representing the six side-column pair counts.

The vanishing-polynomial space over GF(2) was computed by maximum degree.

| Maximum degree | Monomials | Rank on unresolved set | Nullity | Immediate-win states separated |
|---:|---:|---:|---:|---:|
| 1 | 13 | 13 | 0 | 0 |
| 2 | 79 | 79 | 0 | 0 |
| 3 | 299 | 297 | 2 | 768 |
| 4 | 794 | 751 | 43 | 1,987 |

There are no nonzero degree-1 or degree-2 vanishing identities.

The complete cubic vanishing space has dimension two, generated by

$$
c3_H c5_H (1 \oplus c2_L)=0,
$$

and

$$
c3_H c5_H (1 \oplus c6_L)=0.
$$

The factors decode into reflected center-crossing diagonal completion conditions in the actual board geometry [14].

By degree four, the vanishing space is large enough to separate every one of the 1,987 immediate-win comparison states from the unresolved boundary.

### 7.1 Interpretation

This is useful for two reasons.

First, it shows that the boundary is not characterized by a trivial linear parity rule.

Second, the first nontrivial low-degree identities factor into recognizable geometric guards rather than opaque fitted polynomials.

The useful pattern is therefore not simply

$$
\text{syndrome}=0,
$$

but more like

$$
\text{guard}\cdot \text{syndrome}=0.
$$

That form is compatible with the broader hypothesis that cancellation laws may be simple only after support, geometry, resource, or deadline guards are represented explicitly.

### 7.2 Non-claim

A degree-four polynomial that separates this finite immediate-win comparison does not imply that perfect-play value is a degree-four polynomial.

The finite boundary classification is a structural laboratory, not a solved generalized value function.

---

## 8. Blind dimension perturbation

To test whether the 7x6 algebra was a one-board accident, the same response relation was derived before consulting known outcomes for widths 4 through 10 and even heights 4, 6, and 8.

Safe single-defect columns were:

| Width | Safe defect columns | Dependence on tested height |
|---:|---|---|
| 4 | 1,2,3,4 | none observed |
| 5 | 2,3,4 | none observed |
| 6 | 3,4 | none observed |
| 7 | 4 | none observed |
| 8 | none | none observed |
| 9 | none | none observed |
| 10 | none | none observed |

For every tested safe defect,

~~~text
paired-response relation nullity = 1
unmatched top defect adds one independent GF(2) dimension
~~~

and the observed finite matrix satisfies

$$
\text{responsePairs}=WH/2-1,
$$

$$
\text{responsePairRank}=\text{responsePairs}-1.
$$

The tested safe-defect count fits

$$
\max(0,8-W)
$$

for Connect-4 in the declared matrix [14].

These are bounded observations, not promoted general theorems.

---

## 9. Post-hoc board outcomes: a productive falsifier

After the structural matrix was frozen, known board-size outcomes were consulted using Tromp’s published results [2,3].

The overlapping even-height matrix contains a decisive counterexample to any claim that the one-relation/one-defect skeleton determines W/D/L.

At width seven:

- 7x4 is a draw;
- 7x6 is a first-player win;
- 7x8 is a first-player win.

Yet all three share the same measured coarse skeleton:

~~~text
one paired-response dependency
one independent unmatched defect
one safe center defect column
~~~

Therefore the first GF(2) skeleton is insufficient for game value [15].

This is not a failure of the research direction. It identifies missing information.

Height changes:

- generator count;
- response-space rank;
- support distance;
- first-win deadlines;
- actual outcome at width seven.

The likely latent object must therefore refine the coarse cancellation structure with additional geometry-dependent support, resource, and deadline information.

---

## 10. Perfect play branches and collapses

The control-algebra hypothesis also predicts that literal optimal moves and literal terminal winning lines may be realizations of a coarser control object rather than the object itself.

An exhaustive rule-derived 4x4 Connect-4 audit provides a clean small-board control [16].

The complete legal game graph contains 161,029 states.

Retaining all exact W/D/L-optimal edges gives:

~~~text
optimal edges                         219,010
states with >1 optimal move            56,763
mover-winning states with >1 optimal    5,695
maximum optimal branching                   4
optimal transposition merge states      65,507
maximum optimal indegree                     4
explicit three-ply optimal diamonds      67,292
~~~

Among exact winning states:

~~~text
winning states with >1 terminal winning line   13,951
maximum distinct winning lines from one state        6
~~~

Thus perfect play is not a unique principal variation even on this small board.

Different optimal physical branches frequently reconverge to the same exact board state.

### 10.1 Local diamond

One exact three-ply diamond begins from a rank-13 draw-valued state.

Two different optimal first choices, columns 2 and 3, admit a common optimal reply in column 4. Playing the other first-choice column on the third ply reaches the same physical state.

This is exact board-state equality, not merely equal W/D/L.

### 10.2 Consequence for the latent representation

A plausible control quotient must allow:

~~~text
one control class
-> multiple literal optimal actions
-> different physical states
-> later transposition / quotient collapse
-> multiple terminal realizations with the same exact value
~~~

Any proposed “closed-form solution” that always emits one literal best move would therefore be imposing a tie-break unless uniqueness were independently proved.

This branch-and-collapse property also makes the Nim analogy more precise. The research target is not a single canonical path. It is a value/control object compatible with many equivalent realizations.

---

## 11. Recursive unlabeled quotient and direct structural reconstruction

Later research tested the branch-and-collapse idea directly by erasing literal action labels and comparing recursive future structure.

### 11.1 Full recursive successor quotient on 4x4

For every state in exhaustive 4x4 Connect-4, define a bottom-up action-unlabeled signature:

~~~text
terminal:
    (rank, terminal type)

nonterminal:
    (rank, player to move, SET of child classes)
~~~

Literal column labels and duplicate equivalent choices are erased.

Across the complete 161,029-state graph this yields [26]:

~~~text
all-legal structural classes                 8,242
states with duplicate equivalent moves      39,231
duplicate equivalent move edges erased      46,002
maximum class size                          11,902
root legal moves                                 4
root distinct child classes                      2
~~~

Restricting to exact optimal continuations yields:

~~~text
optimal structural classes                   1,130
states with duplicate equivalent moves      51,033
duplicate equivalent optimal edges erased   73,201
root optimal moves                               4
root distinct optimal child classes              1
~~~

All four optimal opening moves of the 4x4 draw therefore occupy one recursive optimal child class even though they are four literal physical actions.

The all-legal quotient has zero mover-relative W/D/L split classes. That homogeneity is expected by backward induction from the quotient definition: terminal type is preserved, nonterminal classes preserve mover and the set of child classes, and minimax depends only on the mover and child values once duplicate equivalent actions are ignored. The zero split count is therefore a correctness property of the quotient, not independent evidence for a new Connect Four value theorem.

The important empirical fact is the compression shape:

~~~text
161,029 physical states
304,574 physical legal successor edges

-> 8,242 recursive action-unlabeled classes
~~~

At rank 13, the physical frontier contains 28,922 states but only 25 recursive classes [26].

### 11.2 Cross-dimension quotient control

The same action-unlabeled recursive quotient was tested on five small boards before outcome validation [27]:

| Board | Physical states | Legal edges | Recursive classes | States/class |
|---|---:|---:|---:|---:|
| 3x3 C3 | 694 | 966 | 130 | 5.34 |
| 4x3 C3 | 7,157 | 11,818 | 1,002 | 7.14 |
| 3x4 C3 | 2,715 | 3,714 | 406 | 6.69 |
| 4x4 C3 | 41,750 | 65,756 | 4,384 | 9.52 |
| 4x4 C4 | 161,029 | 304,574 | 8,242 | 19.54 |

The quotient-class frontier peaks before the physical-state frontier in every tested board.

The 4x3 C3 and 3x4 C3 controls are especially informative. They have equal area and the same raw winning-line count, yet their legal state counts and recursive quotient sizes differ substantially:

~~~text
4x3 C3:
    7,157 states
    1,002 recursive classes

3x4 C3:
    2,715 states
      406 recursive classes
~~~

Therefore board area plus winning-line count is not a sufficient carrier. Gravity/support orientation is load-bearing.

Changing Connect-K on fixed 4x4 geometry also changes the quotient:

~~~text
4x4 C3:
    41,750 states
     4,384 classes

4x4 C4:
    161,029 states
      8,242 classes
~~~

The same support lattice does not determine the quotient independently of early-stopping and winning-obligation structure.

### 11.3 Residual-q orbit carrier

The next experiment asked how much of the recursive quotient can be predicted from the project’s existing rule-derived residual carrier before recursive child-class closure [28].

For every exhaustive 4x4 state, the producer forms:

~~~text
support
+ normalized P0 residual antichain
+ normalized P1 residual antichain
~~~

and then canonicalizes support and residual cells together under all 24 permutations of the four column labels.

No minimax value is used to form the signature.

The result is:

~~~text
physical states                              161,029
orientation-sensitive residual-q classes     34,105
column-permutation residual-q orbits          10,507
recursive action-unlabeled classes             8,242

orbit signatures spanning >1 recursive class     0
states in a split orbit signature                 0
recursive classes containing >1 orbit         1,050
maximum orbit signatures in one class             30
~~~

Thus, on the finite control,

~~~text
equal column-orbit residual-q signature
    -> equal recursive action-unlabeled class
~~~

with zero counterexamples.

A fixed global column permutation therefore removes a large fraction of orientation-sensitive distinctions:

~~~text
34,105
    -> 10,507
    -> 8,242
~~~

but does not complete the quotient. The remaining 2,265-class static-to-recursive gap requires branch-local re-identification of actions.

This suggests that the relevant object is closer to a local action-transporter system or bisimulation than one fixed global symmetry group.

### 11.4 Direct residual-orbit graph reconstruction

The strongest recent result removes the physical-board graph from the producer entirely [29].

Starting from empty support and the complete initial winning-window residual antichains, the direct producer:

1. obtains the landing cell from support;
2. positively cofactors the mover’s residual requirements;
3. deletes opponent requirements blocked by that event;
4. normalizes duplicates and strict supersets;
5. stops on completed winning requirements;
6. advances support;
7. canonicalizes support plus both residual antichains under column-label permutations;
8. recurses only on the canonical residual state.

It does not construct token-board keys or enumerate the physical board-state graph.

On 4x4 C4 it obtains exactly:

~~~text
residual-orbit states                 10,507
literal residual-orbit action edges   31,669
duplicate equivalent action edges      1,169

recursive action-unlabeled classes     8,242
~~~

The independently enumerated physical audits give the same 10,507 orbit-state count and 8,242 recursive-class count.

Relative to the physical graph:

~~~text
161,029 physical states
    -> 10,507 direct residual-orbit states
       (~6.5%)

304,574 physical legal edges
    -> 31,669 direct residual-orbit action edges
       (~10.4%)
~~~

This is the first result in the campaign that reconstructs the full finite action-unlabeled quotient without traversing the physical game graph.

The same direct producer also reconstructs the independently enumerated recursive class count on every current small-board control:

| Board | Physical states | Direct residual-orbit states | Direct action edges | Recursive classes |
|---|---:|---:|---:|---:|
| 3x3 C3 | 694 | 197 | 404 | 130 |
| 4x3 C3 | 7,157 | 1,656 | 4,603 | 1,002 |
| 3x4 C3 | 2,715 | 690 | 1,528 | 406 |
| 4x4 C3 | 41,750 | 8,898 | 26,400 | 4,384 |
| 4x4 C4 | 161,029 | 10,507 | 31,669 | 8,242 |

For all five boards,

~~~text
direct recursive class count
=
physical recursive class count
~~~

and separately derived root W/D/L values agree.

The gravity-orientation distinction also survives: 4x3 C3 and 3x4 C3 produce different direct residual-orbit graphs despite equal area and raw winning-line count.

### 11.5 What this changes

The earlier paper could only say that a smaller semantic quotient existed after exhaustive physical analysis.

The new evidence permits a stronger bounded statement:

> On every current small-board control, the same recursive action-unlabeled quotient can be reconstructed from rule-derived residual transition structure without enumerating the physical board states.

This is a substantive step toward the intended research direction because it replaces one representation of the state space with a smaller structural one.

But the complexity firewall remains essential.

Revision 0.2 correctly identified factorial action canonicalization and residual-graph growth as the two major unresolved burdens. Revision 0.3 improves the first burden substantially but does not eliminate it.

The refinement-partitioned exact canonicalizer avoids full $W!$ enumeration on almost all audited states and gives a 7.66x matched 5x4 speedup, but unresolved tie classes can still require factorial search. The binary-tie theorem gives a linear-algebraic description of the stabilizer when all unresolved classes have size two, but no polynomial procedure for deriving the parity-check matrix $A_s$ has yet been established, and larger tie classes generally have non-abelian internal permutation groups.

The second burden remains more serious. Direct structural-state growth through 4x7 reaches 3,534,913 states and 2,747,043 recursive classes. The full 6x4 run then hits a ten-minute workflow wall without a final graph. Exact 6x4 prefixes show 286,356 cumulative states through rank 10 and 616,710 through rank 11. The rank-11 frontier alone contains 330,354 structural states.

Those prefixes materially narrow the diagnosis. Maximum exact column-canonicalization search remains only eight candidates; nonbinary tie classes are absent through rank 10 and occur only 16 times in the rank-10-to-11 transition; average residual requirements per state fall while the frontier continues to expand. The observed width wall is therefore primarily a structural-state cardinality problem under the current closure, not an obvious permutation-search or per-state residual-size problem.

Falling successive 4-column height-growth factors remain interesting but do not prove polynomial size.

Therefore:

~~~text
physical graph avoided
    !=
polynomial generalized construction
~~~

The next mathematical burden is to derive a compact action-canonical/refinement mechanism and bound the growth of the residual/control graph directly in board parameters.

### 11.6 A linear move-coordinate gauge is falsified

The updated branch-collapse audit also tested whether perfect-play sibling equivalence could be explained by a fixed GF(2) subspace of player-labelled partial-squared move-coordinate differences [16].

It cannot.

On exhaustive 4x4:

~~~text
same-terminal-set optimal sibling pairs       98,702
different-terminal-set optimal sibling pairs  18,484
distinct optimal partial2 deltas                  176
optimal delta-space rank                            22
~~~

The same-terminal subset already generates the complete observed optimal delta set and rank-22 span.

More decisively, the all-legal negative control gives:

~~~text
all legal sibling pairs                     246,704
distinct legal partial2 deltas                   176
legal delta-space rank                            22
legal deltas outside optimal span                  0
optimal delta set == legal delta set            true
~~~

Thus the linear sibling delta space is geometric move-choice structure, not a perfect-play selector.

If GF(2)-like composition survives in the final theory, the recent evidence moves its likely location upward:

~~~text
not literal move coordinates

but possibly

guarded residual/control objects
after action identity has been quotiented
and branch-local correspondence is represented
~~~


## 12. From quotient reconstruction to local closure and exact canonicalization

Revision 0.2 established that the finite recursive quotient could be generated from residual transition structure without first enumerating physical board states. The next research round asked two harder questions:

1. how much of the remaining recursive collapse can be compiled into local rule-derived normalization; and
2. how much of the action-label canonicalization burden can be removed without sacrificing exactness.

### 12.1 Universal and nonterminal frontier blockers

The earliest dynamic 4x4 residual merge exposed an opponent residual requirement containing every currently legal landing event [30].

Let $F$ be the set of current legal landing events and $R$ one residual requirement of the opponent. If

$
F\subseteq R,
$

then every current move occupies a cell of $R$ before the opponent can act again. The requirement is therefore future-inert on every nonterminal successor.

The stronger rule needs only the currently legal moves that do **not** immediately win for the mover. Let $N$ be that set. Then [31]:

$
N\subseteq R
\quad\Longrightarrow\quad
R\text{ is ordinary-future inert at this node.}
$

Moves outside $R$ are irrelevant to the surviving future if they terminate immediately in a mover win.

On exhaustive 4x4 C4, the first blocker reduces:

~~~text
10,507 -> 10,075 structural states
31,669 -> 30,732 literal structural edges
~~~

while preserving all 8,242 recursive classes.

The stronger nonterminal form continues to:

~~~text
10,075 -> 9,951 structural states
30,732 -> 30,473 literal structural edges
~~~

again preserving all 8,242 recursive classes.

### 12.2 Final-event cap parity

A third exact local rule uses gravity and alternating control [31].

Let $C$ be the non-full columns and let $\operatorname{cap}(C)$ contain the top remaining board cell in every such column. Let $R$ be a residual requirement of the mover.

If

$
\operatorname{cap}(C)\subseteq R,
$

then completing $R$ requires the final board placement. If the number of remaining cells is even and the mover acts first, that final placement belongs to the opponent. Hence:

$
\text{remaining cells even}
\land
\operatorname{cap}(C)\subseteq R
\quad\Longrightarrow\quad
R\text{ is unrealizable for the mover.}
$

Applied after the blocker closures, the 4x4 structural graph becomes:

~~~text
9,951 -> 9,441 structural states
30,473 -> 29,351 literal structural edges
~~~

while the recursive quotient remains exactly 8,242 classes.

The combined local reduction is therefore:

~~~text
baseline structural states      10,507
after three local rules           9,441
recursive target classes          8,242

baseline static excess            2,265
remaining excess                  1,199
explained excess                  1,066
~~~

So these three rule-derived eliminations directly explain about 47% of the original static-to-recursive state gap on exhaustive 4x4 C4.

The earliest unexplained dynamic merge moves to rank 8. The remaining examples differ in support topology and opponent obligations, shifting the active seam toward support-chain equivalence and branch-local action transport rather than simple dead-residual removal.

### 12.3 Finite local branch closure

The remaining recursive collapse can be studied without minimax values by repeatedly replacing each nonterminal state with:

~~~text
(rank, mover, SET of previous-round child classes)
~~~

while preserving terminal classes [32].

On the 9,441-state rewritten 4x4 C4 graph:

~~~text
round 0   9,441
round 1   9,237
round 2   8,948
round 3   8,629
round 4   8,375
round 5   8,269
round 6   8,250
round 7   8,242
~~~

Seven rounds reach the exact full recursive partition.

On the unreduced small-board controls, the rounds to full quotient are:

| Board | Direct states | Recursive classes | Rounds |
|---|---:|---:|---:|
| 3x3 C3 | 197 | 130 | 4 |
| 4x3 C3 | 1,656 | 1,002 | 6 |
| 3x4 C3 | 690 | 406 | 6 |
| 4x4 C3 | 8,898 | 4,384 | 10 |
| 4x4 C4 | 10,507 | 8,242 | 8 |

The iterative rounds are a discovery instrument. Once a finite acyclic structural graph exists, the exact quotient can instead be computed in one reverse-topological pass by hash-consing child-class sets.

This yields an important complexity separation:

~~~text
quotient minimization over an existing finite structural graph
    !=
construction size of the structural graph
~~~

The former is polynomial in the represented graph. The latter remains the unresolved generalized burden.

### 12.4 Direct structural growth beyond the original matrix

The direct residual/control producer was then pushed to larger Connect-4 boards without solved labels or physical-board enumeration [33–36].

At fixed width four:

| Board | Cells | Direct structural states | Recursive classes | Direct edges |
|---|---:|---:|---:|---:|
| 4x4 C4 | 16 | 9,441 | 8,242 | 29,351 |
| 4x5 C4 | 20 | 102,815 | 86,791 | 325,038 |
| 4x6 C4 | 24 | 693,284 | 562,550 | 2,197,552 |
| 4x7 C4 | 28 | 3,534,913 | 2,747,043 | 11,200,763 |

Successive direct-state growth factors are approximately:

~~~text
4x4 -> 4x5   10.89x
4x5 -> 4x6    6.74x
4x6 -> 4x7    5.10x
~~~

and recursive-class growth factors are approximately:

~~~text
4x4 -> 4x5   10.53x
4x5 -> 4x6    6.48x
4x6 -> 4x7    4.88x
~~~

The falling factors are noteworthy bounded evidence, but four heights do not justify an asymptotic conclusion. The graph still reaches millions of states at 28 cells and remains fully compatible with exponential generalized growth.

A same-area orientation control is also decisive [33,36]:

~~~text
4x5 C4:
    20 cells
    17 winning lines
    102,815 direct states
     86,791 recursive classes

5x4 C4:
    20 cells
    17 winning lines
    289,852 direct states
    251,222 recursive classes
~~~

The rotated 5x4 board therefore has about 2.82 times as many direct states and 2.89 times as many recursive classes despite equal area and raw winning-line count.

Gravity/support orientation and future accessibility materially affect structural growth.

### 12.5 Exact refinement-partitioned column canonicalization

The original direct producer canonicalized a residual state under all column permutations. That is exact but creates a factorial-width implementation burden.

Rule-derived column-incidence refinement now removes nearly all of that search on the audited 4x4 graph [37].

For 9,430 audited nonterminal states:

~~~text
search-free states   9,412
fallback states          18
search-free fraction 99.8091%
canonical collisions      0
maximum iterations         3
~~~

Every fallback contains two unresolved color classes, each of size two.

A stronger ordered-pair refinement resolves **none** of the 18 fallbacks. This is useful negative evidence: the remaining ambiguity is not missing independent local or pairwise column detail.

The exact canonicalizer therefore uses refinement only to partition and order distinguishable column classes, then exhaustively searches inside unresolved tie classes. It remains exact while reducing the candidate set from $W!$ to the product of factorials of unresolved tie-class sizes.

On the matched 5x4 C4 control, it reproduces the exact 289,852-state / 251,222-class graph while changing measured canonicalization economics from:

~~~text
full 120-permutation method:
    208.76 s

refinement-partitioned exact method:
     27.26 s

speedup:
      7.66x
~~~

The refined run processes 1,934,011 total permutation candidates with at most 24 candidates for any one state.

This is not yet a polynomial canonicalization theorem. A large unresolved tie class can still require factorial search.

### 12.6 A derived XOR law in the binary orientation stabilizer

The 18 unresolved 4x4 fallback states expose a stronger algebraic result [37].

Suppose a refined residual state has $m$ unresolved column-color classes, each containing exactly two columns. Assign an orientation bit:

~~~text
x_i = 0  keep the pair orientation
x_i = 1  swap the pair
~~~

The complete within-class permutation group is then

$
G=(\mathbb Z_2)^m\cong GF(2)^m,
$

because pair-swap composition is componentwise XOR.

For a fixed structural state $s$, let

$
H_s=\{x\in G:x(s)=s\}
$

be the exact stabilizer.

A stabilizer is a subgroup of $G$, and every subgroup of $GF(2)^m$ is a vector subspace. Therefore some binary matrix $A_s$ exists such that

$
H_s=\ker(A_s),
$

so the exact coupled orientation symmetries satisfy

$
A_sx=0.
$

This is a deductive result about the binary orientation-stabilizer layer, not an empirical guess about game value.

For every one of the 18 audited fallback states:

~~~text
m = 2
dim(H_s) = 1
H_s = {(0,0),(1,1)}
~~~

so the exact nontrivial symmetry is:

$
x_1\oplus x_2=0.
$

The full permutation audit confirms that neither pair can be flipped independently; only the simultaneous flip preserves the structural state.

This is the clearest result so far matching the original Nim-like intuition: an XOR composition law is now **derived**, but only for a guarded residual-state orientation symmetry subproblem.

It does **not** imply:

~~~text
XOR determines W/D/L
binary tie classes always occur
larger tie classes are abelian
A_s is cheaply constructible
the generalized canonicalizer is polynomial
~~~

The constructive question is now whether the parity-check constraints $A_s$ can be derived directly from residual/support incidence without enumerating all $2^m$ orientations. Tie classes larger than two generally involve non-abelian symmetric groups and remain a separate problem.




### 12.7 Constructive binary stabilizers and exact affine orientation

The binary-tie result has now advanced from an existence theorem plus exhaustive audit to a direct construction [38].

For each residual requirement, the constructive stabilizer records only:

- the player;
- the orbit-invariant unordered row-pattern pair in each binary column class;
- the orientation bit associated with each asymmetric pair.

Requirements sharing the same invariant data form orientation blocks. Their exact translation stabilizers can be intersected by GF(2) elimination, yielding the state stabilizer without enumerating all $2^m$ binary orientation assignments.

On all 18 audited 4x4 fallback states the construction independently recovers:

~~~text
fallback states                 18
pair-count set                 [2]
stabilizer dimensions          [1]
parity-check sets             [11_2]
exact orientation sets        [{00,11}]
constructive matches exact     true
unrepresented exact autos         0
~~~

Thus the constructive method recovers exactly the same

$$
H_s=\{(0,0),(1,1)\}
$$

and

$$
x_1\oplus x_2=0
$$

stabilizer previously established by exhaustive permutation auditing.

The method was then extended from stabilizer detection to exact canonical orientation.

Let $X\subseteq GF(2)^m$ be the affine set of pair-flip assignments still compatible with canonical choices already fixed. For each invariant residual-orbit block, the canonicalizer projects $X$ onto the active tie coordinates, obtains the lexicographically minimum reachable block representative by GF(2) row reduction, then intersects $X$ with the affine coset preserving that minimum image.

Once all blocks are fixed, any remaining free directions are exact state stabilizers and therefore serialize to the same residual state.

Consequently, under the explicit guard

~~~text
every unresolved refinement class has size at most two
~~~

exact within-class canonical orientation can be computed with polynomial work in the explicit residual representation and number of binary tie classes. No $2^m$ orientation sweep is required.

If any unresolved class has size greater than two, the implementation falls back to the already qualified partitioned exhaustive canonicalizer. The polynomial claim is therefore intentionally local to the binary-tie case.

### 12.8 Structural polynomiality is not current runtime superiority

The affine binary-tie canonicalizer was benchmarked on the same exact 5x4 C4 control [38].

It reproduces the complete prior semantic result:

~~~text
direct states          289,852
edges                 1,079,881
duplicate edges          28,827
recursive classes       251,222
W/D/L splits                  0
root                         draw
earliest merge rank             9
complete frontier            equal
dynamic-merge-by-rank        equal
~~~

The canonicalization workload changes substantially:

~~~text
partitioned exhaustive permutation candidates   1,934,011
affine nonbinary fallback candidates               517,038
reduction                                           73.27%

binary affine canonicalizations                    928,658
nonbinary fallback canonicalizations                80,680
binary share of those calls                         92.01%
binary block-translation candidates              2,353,268
maximum block candidates in one call                    34
~~~

But the current implementation is slower:

~~~text
partitioned exact elapsed   27.2599 s
affine GF(2) elapsed        38.3523 s
wall-time change              +40.69%

partitioned RSS       283,312,128 bytes
affine RSS            388,780,032 bytes
RSS change                +37.23%
~~~

This negative result is important:

~~~text
polynomial guarded representation
    !=
current runtime improvement
~~~

The affine construction removes exponential binary-orientation enumeration as a representation requirement, but its present block-translation and repeated linear-algebra work costs more than the small exact partitioned searches encountered at width five.

It therefore should not be promoted as an IsoMax or runtime optimization.

### 12.9 The 6x4 width wall

The first full 6x4 C4 run using the refinement-partitioned exact canonicalizer did not complete inside the ten-minute workflow limit [39].

The declared board has:

~~~text
width          6
height         4
cells         24
winning lines 24
~~~

The job ran for approximately 600 seconds and was cancelled by the workflow wall without emitting a final JSON result. No out-of-memory event was observed.

Because the matched 5x4 partitioned run completed in 27.26 seconds, the incomplete 6x4 attempt required more than about 22 times that wall time before cancellation:

$$
600/27.26 > 22.
$$

This is an execution-economics lower bound only. It is not a structural-state growth factor and cannot by itself identify the cause.

The subsequent exact-prefix diagnostics were designed specifically to separate structural frontier growth from canonicalization cost.

### 12.10 Exact 6x4 prefix through rank 10

The direct producer was restricted to exact ranks 0 through 10 of the same residual/action-orbit graph [40].

The result is:

~~~text
cumulative prefix states        286,356
rank-10 frontier states         167,629
literal edges through rank 9    655,811
duplicate equivalent edges          777

canonicalization calls          642,849
permutation candidates          677,916
average candidates/call           1.05455
maximum candidates/call               8
nonbinary tie calls                   0
~~~

The run completed in 40.42 seconds.

At rank 10 the frontier alone is approximately:

~~~text
4.64x the completed 5x4 rank-10 frontier
9.34x the completed 4x6 rank-10 frontier
~~~

and cumulative prefix states through rank 10 are approximately:

~~~text
6x4 / 5x4   3.99x
6x4 / 4x6   8.82x
~~~

The 4x6 comparison is especially informative: both boards have 24 cells and 24 raw winning lines, yet their direct structural prefix growth differs by almost an order of magnitude.

Through rank 10, every unresolved refinement tie is binary. No size-three-or-larger tie class occurs, and the maximum exact partitioned candidate count is only eight.

This is strong negative evidence against the hypothesis that factorial or nonbinary column-permutation search causes the early 6x4 width wall.

### 12.11 Exact 6x4 prefix through rank 11

The rank-11 prefix deepens that diagnosis [41]:

~~~text
cumulative prefix states          616,710
rank-11 frontier states           330,354
literal edges through rank 10   1,542,137
duplicate equivalent edges          3,543

canonicalization calls          1,491,559
permutation candidates          1,651,326
average candidates/call            1.10711
maximum candidates/call                  8
nonbinary tie calls                     16
~~~

Execution remains bounded:

~~~text
elapsed       65.6141 s
RSS           862,093,312 bytes
heap used     649,155,176 bytes
~~~

The transition from rank 10 to 11 alone contains:

~~~text
886,326 literal action edges
848,710 canonicalization calls
973,410 partitioned permutation candidates
330,354 distinct produced states
~~~

Tie structure remains small:

~~~text
no tie      724,888 calls
binary tie  123,806 calls
nonbinary        16 calls
maximum exact candidate count: 8
~~~

The first size-three tie classes therefore exist, but only 16 times among 848,710 transition canonicalizations.

At the same time, average residual requirements per state decline:

~~~text
rank 10   16.4772
rank 11   14.4469
change    -12.32%
~~~

while the structural frontier grows:

$$
330354/167629\approx1.9707.
$$

The current width wall is therefore not visibly caused by larger residual antichains per state either.

The dominant measured burden is the number of distinct structural states being generated under the current exact realizability closures.

This changes the immediate research priority:

> additional progress must collapse structurally distinct support/obligation states before the frontier multiplies, rather than merely making each state's canonicalization cheaper.



### 12.12 Remaining-move capacity is an exact late realizability law

A residual winning requirement owned by player \(P\) contains distinct future cells that \(P\) must occupy before the game ends.

If \(R\) cells remain empty and \(M\) is the player to move, the absolute maximum future placements available are [68]:

~~~text
moves(M)        = ceil(R/2)
moves(opponent) = floor(R/2)
~~~

Therefore, for any residual requirement \(Q\),

$
|Q|>\operatorname{moves}(P)
\Longrightarrow
Q\text{ is unrealizable}.
$

First-win stopping can only decrease the available move budget, so it cannot invalidate this impossibility direction.

Across the complete current small-board qualification matrix the closure preserves recursive-class count and root W/D/L with zero W/D/L split classes.

On 4x4 C4, applied after the earlier blocker and final-cap rules:

~~~text
before                       9,441 states / 29,351 edges
after move capacity          9,321 states / 29,078 edges
recursive classes            8,242
~~~

It removes 120 additional structural states and 273 edges.

Relative to the original 10,507-state residual-orbit graph:

~~~text
original static excess       2,265
remaining excess             1,079
directly explained excess    1,186
explained fraction          ~52.36%
~~~

The exact 6x4 rank-12 prefix supplies an important scale negative control. The rule removes zero states through rank 12 there, while its unconditional check increases measured elapsed time by about 39.68%. The law is semantically exact but is not an early-width-growth optimization.

### 12.13 Support-release turn-slot capacity refines move count

Raw move capacity ignores when a required cell can become playable.

For a required future cell, define a support-release lower bound [69]:

$
\operatorname{release}(x)
=
\operatorname{row}(x)
-
\operatorname{currentHeight}(\operatorname{col}(x))
+1.
$

Each player also has fixed parity-compatible future turn slots. Relaxing all other interactions, every legal completion of a residual requirement induces an injection from its required cells into distinct owner turn slots at or after their release bounds.

Hence failure of this relaxed matching proves the residual unrealizable.

The test is one-sided: passing the relaxed schedule does not prove true realizability.

On 4x4 C4 the incremental effect is small but exact:

~~~text
before support-release       9,321 states / 29,078 edges
after                        9,319 states / 29,076 edges
recursive classes            8,242
~~~

The static excess falls to 1,077 states, with about 52.45% of the original static-to-recursive excess directly explained.

The small gain is itself informative: simple local realizability is no longer the dominant unexplained mechanism.

### 12.14 Most opponent-residual deletion equivalence is already literal behavior equivalence

A separate audit examined 438 reachable 4x4 C4 cases where deleting one opponent residual lands in the same recursive structural class [70].

Instead of relying on recursive class identity, it compared source and deletion-target under exactly the same future column actions, respecting support, residual cofactors, blockers, and first-win stopping.

Result:

~~~text
class-preserving single-opponent-residual deletions     438
literal-continuation equivalent                         427
not literal-continuation equivalent                      11
~~~

Thus about 97.49% of these deletion equivalences already have identical literal continuation behavior; they do not require action relabeling or delayed recursive quotienting.

The open-cap family is stronger:

~~~text
exact open-cap class-preserving deletions               170
literal-continuation equivalent                         170
~~~

This moves the active question from

~~~text
why do two recursive graphs eventually merge?
~~~

toward

~~~text
why can this residual never create a distinct first terminal event?
~~~

### 12.15 First-terminal dominance explains the complete open-cap deletion family

Let \(R\) be one residual obligation owned by player \(P\).

The first-terminal dominance principle is [71]:

$
\forall\text{ legal continuations completing }R,\;
\exists Q\ne R:
\operatorname{completion}(Q)\le\operatorname{completion}(R)
$

which implies that \(R\) can never be the unique first terminal cause.

For the complete observed 4x4 open-cap deletion family:

~~~text
open-cap class-preserving deletions                    170
already support/turn unrealizable                       27
remaining feasible cases                               143
terminal-dominated feasible cases                      143

conditioned cap-completing schedules                   523
covered schedules                                      523
uncovered schedules                                      0
~~~

So every observed exact open-cap deletion equivalence has a direct rule-derived explanation: either the cap residual cannot be completed, or whenever it is completed another residual terminates no later.

This separates two concepts that had previously been conflated:

~~~text
residual realizability
    !=
residual strategic relevance
~~~

A residual may be realizable yet behaviorally inert because it can never become the first terminal cause.

### 12.16 Semantic deletion is not representation-monotone

The bounded open-cap closure removes an opponent open-cap residual only when support analysis proves it unrealizable or first-terminal dominated [72].

It is semantically sound on the complete current small-board matrix: recursive class counts and root values are preserved with zero W/D/L split classes.

But the represented graph does not shrink monotonically:

| Board | Baseline states | Closure states | Baseline edges | Closure edges | Recursive classes |
|---|---:|---:|---:|---:|---:|
| 3x3 C3 | 158 | 156 | 349 | 345 | 130 |
| 4x3 C3 | 1,475 | 1,518 | 4,260 | 4,387 | 1,002 |
| 3x4 C3 | 596 | 574 | 1,386 | 1,347 | 406 |
| 4x4 C3 | 8,169 | 8,618 | 24,901 | 26,204 | 4,384 |
| 4x4 C4 | 9,319 | 9,090 | 29,076 | 28,480 | 8,242 |

The intuitive implication

~~~text
behaviorally redundant residual
    -> delete it
    -> represented graph cannot get larger
~~~

is false.

A residual that can never be the unique first terminal cause may still participate in useful later cofactors and antichain absorption. Erasing it too early can prevent those simplifications, allowing more descendant representatives to survive.

On 4x4 C4 the closure is beneficial:

~~~text
9,319 -> 9,090 structural states
29,076 -> 28,480 edges
recursive classes remain 8,242

original static excess       2,265
remaining excess               848
explained/removed excess     1,417
explained fraction          ~62.56%
~~~

But the C3 countercontrols show that destructive semantic simplification is not a universal graph-size optimization.

The more promising generalized object is therefore a canonical derivative/continuation representation that preserves useful cofactor consequences while identifying obligations with the same first-terminal continuation language.

---

## 13. The latent control-algebra hypothesis

The current evidence motivates, but does not establish, the following program.

### 13.1 Candidate state

Let

$$
X(s)=F(G(s),R(s),P(s),O(s),D(s),\ldots)
$$

be a latent control representation.

The representation should be derivable from rules and geometry without solved W/D/L labels.

### 13.2 Candidate composition

For appropriately independent or guarded components $x_i$, composition may admit a law such as

$$
X = x_1 \oplus x_2 \oplus \cdots \oplus x_m,
$$

or a related finite-group/vector operation.

XOR is a candidate because exact GF(2) cancellation has already appeared in a nontrivial response-incidence space. It is not assumed universally.

### 13.3 Required guards

Component combination is invalid if supposedly separate components share a load-bearing:

- cell;
- blocker;
- support dependency;
- response resource;
- move-order dependency;
- first-win deadline.

Therefore any eventual algebra must make independence or coupling explicit.

A guard may condition an otherwise simple identity:

$$
g(s)\cdot \sigma(s)=0.
$$

### 13.4 Missing value bridge

The major unresolved step is

~~~text
rule-derived control algebra
+ support/resource/deadline guards
+ universal intervention stability
    -> certified obligation
    -> W/D/L consequence
~~~

This is the GSP-004 guarded-obligation seam [18].

Until that bridge is proved, the algebra remains structural evidence rather than a perfect-play solution.

### 13.5 What the new XOR stabilizer changes

The column-canonicalization result establishes that XOR is no longer merely a speculative analogy everywhere in the program. At one precisely guarded layer, binary unresolved orientation classes form a $GF(2)^m$ action and exact state-preserving orientations form a linear stabilizer subspace.

This does not establish that the final latent control value is a bit vector or that game value composes by XOR. It instead identifies one concrete location where an XOR law genuinely emerges from the structural symmetry itself.

The research question becomes more specific:

> Can the richer residual/control quotient be decomposed into guarded components whose exact transporter/stabilizer relations are efficiently representable, with binary components contributing linear GF(2) constraints and non-binary components handled by equally compact exact structure?

The answer remains open.

---


### 13.6 Raw action-permutation parity is a falsified XOR placement

A later audit asked whether XOR becomes meaningful only after continuation semantics have already been derived [67].

Starting from the exact direct 4x4 residual carrier:

~~~text
residual-orbit states                  10,507
recursive action-labelled classes       8,653
recursive action-unlabelled classes     8,242
labelled-minus-unlabelled excess           411
~~~

300 action-unlabelled classes split into multiple labelled subclasses.

Among pure action-transporter fibers, transporter sign is well-defined exactly when all action-slot tokens are distinct:

~~~text
pure-transporter distinct-slot fibers    38
parity-well-defined fibers               38
~~~

That equality has a generic group-theoretic explanation. Repeated slot tokens admit an odd stabilizer; all-distinct slots give a unique transporter.

Therefore ordinary current-action permutation parity is not positive Connect-Four-specific XOR evidence. The 26 opposite-sign binary fibers at this layer are generic symmetric-group bookkeeping.

This negative result relocates the algebraic question deeper rather than falsifying the entire sequencing hypothesis.

### 13.7 A recursive two-sheet continuation residue survives after current-action gauge is removed

Require simultaneously [65,66]:

~~~text
same recursive action-unlabelled class
+ same ordered immediate phase-free action profile
+ different recursive action-labelled class
~~~

On 4x4 C4 this leaves:

~~~text
deeper groups                       65
binary deeper groups                61
size-3 groups                        2
size-4 groups                        2
~~~

Across 79 changed recursive child pairs in the 61 binary groups:

~~~text
binary continuation                 31
nonbinary continuation               3
child action transporter            23
branch/multiplicity erasure         22
terminal/unknown                     0
~~~

So the binary distinction is recursively inherited on 31 edges after current-node action gauge has already been factored out.

It is not globally closed: some edges leave the binary region or terminate in ordinary representation effects.

### 13.8 Relative GF(2) edge maps form an integrable bounded cocycle

Treat each binary deeper group as a local two-sheet fiber.

Absolute sheet labels are gauge choices. A binary-continuation edge therefore carries only a relative map

$
\delta(e)\in GF(2).
$

A scalar phase potential exists on a component exactly when accumulated XOR is path-independent, equivalently when every independent cycle syndrome is zero.

For 4x4 C4 [65]:

~~~text
binary phase nodes                  61
active binary phase nodes           37
binary inheritance edges            31
delta=0 edges                       25
delta=1 edges                        6

reconvergent pairs                   1
cycle rank                           1
zero cycle syndromes                 1
nonzero cycle syndromes              0
~~~

The unique reconvergence is:

~~~text
24 -> 25 -> 7  -> 2    columns 3,0,1
24 -> 13 -> 14 -> 2    columns 0,3,1
~~~

and both routes carry the same accumulated XOR.

The result is gauge-robust and survives the qualified residual-closure stack as the represented 4x4 carrier shrinks from 10,507 to 9,090 states.

### 13.9 The 4x5 same-rule control raises the cocycle test from one cycle to forty

The same outcome-blind construction was then run on 4x5 Connect-4 [65,73].

The larger carrier contains:

~~~text
residual-orbit states                 102,815
recursive action-unlabelled classes   86,791
recursive action-labelled classes     89,642

deeper groups                            768
binary deeper groups                     696
binary continuation edges                469
delta=1 edges                              95
~~~

After collapsing 21 duplicate same-map parallel edges:

~~~text
reduced inheritance edges                448
active binary phase nodes                498
active weak components                    90
branching points                          75
joining points                            95

reconvergent source/target pairs          42
path-independent reconvergences           42
contradictory reconvergences               0
maximum path multiplicity                  5

cycle rank                                40
zero cycle syndromes                      40
nonzero cycle syndromes                    0
~~~

This is a materially stronger falsification test than the 4x4 single diamond.

The phase carrier is not an all-zero artifact: 95 edges flip sheets in the deterministic gauge.

The exact bounded conclusion is:

> On the declared 4x4 and 4x5 outcome-blind Connect-4 recursive binary continuation carriers, the relative two-sheet edge maps are integrable over GF(2); every measured independent cycle syndrome is zero.

This still does not establish:

~~~text
phase = W/D/L
Connect Four = Nim
a generalized-board theorem
globally closed binary dynamics
polynomial carrier construction
strategic value of the phase
~~~

### 13.10 The strongest remaining phase falsifier is explanatory

The present zero-syndrome result may still arise from generic transition/cofactor confluence.

A generic two-sheet lift of a confluent transition system can be integrable without encoding Connect-Four strategic value.

The next decisive split is therefore:

~~~text
cycles forced by local commuting-action/cofactor diamonds
vs
reconvergences not reducible to local action-order commutation
~~~

A width/height perturbation to 5x4 Connect-4 has also been prepared as the next same-cell-count same-rule falsifier [74]. At the current checkpoint no completed 5x4 cocycle result is claimed.

Any nonzero cycle syndrome would directly falsify the present scalar phase carrier or demonstrate that another structural variable is missing.

---

## 14. Relationship to IsoMax

IsoMax remains an exact search-based solver architecture.

The currently selected JSMinSys realization uses Lazy SMP with a wide/deep worker split, exact sharing, compact caches, and extensive cycle-accounting and qualification controls [21–24]. Search-derived local zero bounds and related Phase-2 experiments demonstrate that strong structural reductions can radically change search work while preserving exactness.

The control-algebra program is different in kind.

It asks whether some of the future game can be represented without recursively materializing ordinary successor search at all.

The long-term comparison is therefore not

~~~text
new heuristic versus old heuristic
~~~

but

~~~text
exact search over q
versus
direct structural construction of a smaller exact control object
~~~

No implementation replacement is proposed by the present results.

The bounded algebra experiments are intentionally cold, rule-only research.

---

## 15. What IsoGraph found, and what it missed

Before the center-boundary algebra work, the current IsoMax semantics had already been rendered through Core 0.20, recursive implicit assertions, Discovery Protocol, and DTS.

A complete DP-01 through DP-45 pass found meaningful structure, including:

- the six-state WDL proof carrier;
- a 3-bit possibility-mask representation;
- same-q proof refinement by intersection;
- proof-transition stutters;
- exact opposite-bound draw closure;
- shared-miss observation stutters [19,20].

Those findings were real.

But they remained inside the family of structures already presented to the discovery pass.

They did not generate the experimental family

~~~text
4
444
44444
~~~

aligned at the center-defect boundary, nor the blind width/height perturbation matrix that exposed the later control-algebra invariants.

The methodological gap was therefore not representational inability.

It was a missing transition from

~~~text
sufficiently coherent clue
~~~

to

~~~text
construct new observations in a partly unknown experimental space.
~~~

### 15.1 Experimental Warrant proposal

The resulting IsoGraph proposal separates two responsibilities [25].

Discovery Protocol should own an **Experimental Warrant**: a judgment that existing clues, residuals, QU structure, discrepancies, partial outputs, or unresolved structural demands justify active generation of new observations.

A separate experimental module should own the experiment itself.

That module must tolerate:

- incomplete models;
- incomplete scope;
- incomplete hypothesis sets;
- incomplete output vocabularies;
- structured known-unknowns through QU;
- an additional open-world reserve for unknown unknowns.

This methodology is not used as evidence for the control-algebra result. It is a consequence of examining how the result was eventually found.

---

## 16. Quantifiable Unknown and missing structure

QU is especially relevant to future experiments because an unknown can itself have structure [9].

A QU may specify:

- an unresolved carrier or relation;
- admissible realizations;
- constraints;
- boundaries to known structure;
- dependency topology;
- invariants shared by all admissible realizations.

Such a QU can describe the shape of a missing Lego even when the piece itself is unknown.

Experimental inquiry may then aim not only to resolve the QU, but to:

- refine its admissible family;
- discover another constraint;
- test an invariant across its realizations;
- identify coupling between QUs;
- determine whether the QU is actually load-bearing;
- discover that its detail can be quotiented away.

At the same time, QU cannot enumerate unknown unknowns. The experimental working model must retain the possibility that its current QU family, variable set, or output vocabulary is incomplete unless completeness is independently established.

---

## 17. Complexity implications and limits

A genuine polynomial structural solution would require much more than the bounded results presented here.

For a generalized family, one would need at least:

1. a precise input family and encoding;
2. a rule-derived latent control representation;
3. a proof that the representation is sufficient for exact perfect-play value or exact optimal-action classification;
4. a polynomial bound on the representation size;
5. a polynomial construction algorithm;
6. polynomial-time update/composition operations;
7. a proof that all required guards and deadlines can be generated within those bounds.

A polynomial checker alone is insufficient.

The direct residual-orbit reconstruction now removes one earlier ambiguity: on the tested small boards, the quotient does not require physical-board-state enumeration. But this still leaves two major asymptotic burdens unresolved:

- the present action canonicalizer enumerates all $W!$ column permutations;
- the number of residual-orbit states has not been bounded polynomially in board dimensions or input length.

Therefore the new structural producer is strictly smaller on the tested controls without yet being a polynomial generalized solver.

A finite-board closed form is also insufficient for a generalized complexity claim.

The present evidence only says that several structures commonly treated as part of the search tree possess exact algebraic regularities and quotient behavior.

Whether those regularities extend far enough to eliminate ordinary perfect-play search remains open.

---

## 18. Falsifiers and research obligations

The hypothesis should lose support if any of the following survive careful generalization:

1. nontrivial XOR relations vanish once correct support/resource/deadline guards are included;
2. every apparent cancellation reduces to raw token parity without obligation/control content;
3. candidate latent values require solved game labels for their definition;
4. polynomial identities fail systematically outside the finite families from which they were derived;
5. the composition law changes arbitrarily with context and cannot be captured by explicit guards;
6. purportedly independent components repeatedly share hidden cells, blockers, resources, or deadlines;
7. no rule-derived bridge from the algebra to certified value obligations can be proved;
8. constructing the exact latent state requires work asymptotically equivalent to exhaustive game search.

Positive evidence should also be held to a high standard.

A successful next step would be a rule-derived guarded control object that:

- generalizes across board dimensions;
- predicts or certifies nontrivial future obligations;
- preserves branch-and-collapse equivalence;
- remains independent of solved labels;
- composes by a stable algebraic rule;
- admits a bounded construction analysis.

---

## 19. Discussion

The current work suggests a useful distinction between **search structure** and **control structure**.

Search structure records literal alternatives.

Control structure records what those alternatives mean for the ability of each player to satisfy or block winning obligations under gravity and deadlines.

The two are not necessarily the same size.

The common 2,108-state boundary is evidence that different histories can lose their relevance after a structural event.

The 4x4 optimal-policy DAG is evidence that multiple exact optimal branches can diverge and reconverge.

The GF(2) response relation is evidence that paired resources can have exact cancellation structure.

The independent unmatched top event is evidence that defects can survive that cancellation.

The cubic boundary identities are evidence that geometric guards matter before a simple syndrome becomes valid.

The dimension/outcome mismatch is evidence that the first algebra is incomplete.

The recursive unlabeled quotient shows that literal action identity is also too fine. The residual-q orbit audit explains most of that excess through rule-derived residual structure plus action relabeling. The direct residual-orbit producer then reconstructs the same quotient without physical-board enumeration. The remaining static-to-recursive gap shows that one fixed symmetry is still too rigid: action correspondence may change branch by branch.

The legal-sibling delta falsifier further narrows the algebraic target. A fixed linear GF(2) gauge on literal move coordinates captures ordinary legal move-choice geometry and therefore cannot by itself encode strategic value. Any surviving XOR-like law must act on richer guarded control objects after the appropriate action quotient has been formed.

The realizability-closure results show that almost half of the 4x4 static-to-recursive excess can already be removed by local exact rules before recursive quotienting. This is important because it converts what looked like opaque future-behavior coincidence into explicit rule-derived semantics.

The column-canonicalization result adds a complementary lesson. Local refinement resolves almost every tested column identity, but the final 18 states require a coupled symmetry. Their simultaneous pair flip is exactly the diagonal one-dimensional subspace of $GF(2)^2$. Thus the campaign now contains both a negative and a positive algebraic result: raw sibling move deltas are too coarse to encode strategy, while a guarded orientation stabilizer exhibits a genuine XOR law.

The direct growth controls then keep the complexity claim honest. The structural representation is dramatically smaller and more semantically targeted than the physical game graph, yet it still grows into the millions on 4x7 and the 6x4 full run reaches the workflow wall. Exact 6x4 prefixes show why: structural-state cardinality is multiplying rapidly even while per-state residual complexity falls and canonicalization remains nearly trivial in candidate count.

At the same time, the constructive affine binary-tie result strengthens the algebraic side of the program. The stabilizer is no longer merely known to exist; under the binary-tie guard it can be derived and canonicalized by GF(2) methods without a $2^m$ orientation sweep. The matched 5x4 slowdown is equally informative: asymptotically cleaner structure is not automatically the best current implementation.

The problem has therefore shifted from “can the search graph be compressed?” to a more precise pair of questions: “which local structural equivalences can be compiled before frontier growth?” and “can the remaining structural graph be generated with provably bounded cardinality?”

Taken together, these results support a research program rather than a conclusion:

> derive the smallest exact control representation that preserves perfect-play obligations, then determine whether that representation can be constructed and composed substantially more efficiently than the ordinary game tree.

If that program eventually yields a polynomial generalized solution, “C = NC” would be an appropriate joke.

For now the question mark is load-bearing.

---


## 20. Comprehensive Connect4 / IsoMax research synthesis

Revision 0.8 was preceded by a full audit of the current Connect4 authority inventory and major historical research lines [42,51,61]. The qualified/successor claim inventory contains 93 normalized claims: 65 retained, 4 strengthened, 17 historical-only, 7 open, and 0 uncovered. The synthesis below includes the findings judged mathematically or methodologically significant enough to affect this paper. Source mapping is preserved in the dedicated audit and references [42]-[63]. This is a project-significance audit, not by itself an external priority/novelty claim.

### A. Exact semantic state and identity

#### A1. q is an exact future-behavior congruence

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

#### A2. q_r is a transporter-aware reflection orbit, not literal identity

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

#### A3. Gameplay identity is not proof identity

**Paper priority: ESSENTIAL.**

Equal q does not authorize reuse of proof/certificate state whose validity depends on:

- deadlines;
- response resources;
- CPC/NDC premises;
- realizability;
- dependency/provenance cone;
- guard context.

This prevents semantic quotienting from silently erasing theorem premises.

#### A4. Solver multiplicity collapses to one value-dependency relation

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

### B. Geometry and finite-difference algebra

#### B1. The residual winning-requirement universe is finite and small

**Paper priority: HIGH.**

The 69 standard 7x6 geometric winning lines induce exactly 625 unique nonempty residual winning-requirement masks under the qualified residual construction.

This supports fixed-ID residual semantics and gives a finite structural vocabulary smaller than physical ownership space.

Authority claim: C4-R0015.

#### B2. Connect-K line geometry has an exact finite-difference factorization

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

#### B3. Axis derivatives derive the diagonal constraints

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

#### B4. Regular Connect-4 has a seven-mode periodic annihilator code

**Paper priority: HIGH.**

One-axis length-4 annihilators form a 4-periodic even-parity [4,3] binary code. The 2D axis product has dimension 9; the two exact diagonal relations remove two modes, leaving a seven-dimensional regular-board incidence cokernel/code.

Authority claim: C4-R0059.

#### B5. CPC ownership parity is one binary scalar potential

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

### C. Opening geometry and the first-move boundary

#### C1. Pure-followup safe entry is a singleton transversal theorem

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

#### C2. Unique safe entry and unique initial requirement impact coincide at W=2K-1

**Paper priority: ESSENTIAL.**

The initial bottom event's winning-requirement incidence has a unique maximum iff W=2K-1, and the maximizer is the same center event selected by the singleton-transversal theorem.

Specializing K=4 gives W=7, center column 4.

Combined with the project's regular K=4 core-balance relation, this selects H=6 and the structural core dimension 28.

Authority claim C4-R0071.

**Provenance caution:** this result was developed in a research environment where the solved center opening and the number 28 were already known. Under the newer theorem-contamination firewall it is mathematically significant but must not automatically be used as production theorem authority until its discovery/selection path is independently audited or blindly re-derived.

#### C3. Every non-center opening on seven-wide even-height Connect-4 has a defender safety certificate

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

#### C4. Center-positive partial results exist but are not a root proof

**Paper priority: HIGH, as boundary/falsifier.**

Examples include:

- unique complete static phase cover inside one 32-assignment wing-phase family;
- that unique cover requires two distinct bottom ownership facts before P1 has enough response capacity;
- the resulting safety cover is temporally unrealizable;
- local Before/Lowinverse-style repairs can fix some apparent center defects, falsifying overly strong defect-lift conjectures.

These results show that center-positive proof requires a complete response-resource/deadline calculus, not just static line coverage.

They do not prove center win.

#### C5. 44 -> 4 is exact but not yet a searchless theorem

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

### D. Perfect-play output and the meaning of 28

#### D1. Perfect-play terminal-line support has an exact set-valued game algebra

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

#### D2. Winning-region proof and output provenance factorize

**Paper priority: HIGH.**

Value proof and terminal-line output need not use the same quotient.

Stage 1 can aggressively quotient for W/D/L winning-region membership.

Stage 2 can restore original line provenance and perform existential reachability restricted to the proved winning region.

This cleanly explains why value-equivalent proof alternatives can differ in terminal-line outputs.

Source:
- 2026-09-13-winning-region-output-factorization.md, blob d2cb21a70052123a91e25271631505aa58a4c6d1.

#### D3. “Perfect play” terminal support depends on the tie convention

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

#### D4. A geometric structural 28 exists independently as mathematics, but its production provenance is sensitive

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

### E. Proof algebra and proof compression

#### E1. Recursive proof plans have the same antichain absorption algebra as residual winning lines

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

#### E2. Proof-class compression can be large even where state compression is absent

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

#### E3. Generic structural closure also recovers large parts of historical strategy logic

The authority audit records a generated comparison in which generic blocker/upward-closure semantics reproduced the tested solved-group behavior of 331,955 generated A1-A9 historical-rule instances with zero mismatches in that corpus [51]. This is empirical validation of the generic structural language, not a claim that the named historical strategies were newly discovered or that every strategic-compatibility condition has been subsumed.

The negative controls are equally important: race-free eventual-ownership inference is unsound; blanket resource-overlap exclusion is too strict; and one tested legacy A9 responder orientation produced false no-win claims [51]. Temporal order, compatibility, and exact role orientation therefore remain explicit proof obligations.

---

### F. Realizability, strategy dependence, and complexity boundaries

#### F1. Fixed-support line-hit realizability is a pinned NAE hypergraph CSP

**Paper priority: HIGH.**

For fixed occupied support, line-hit bits are realizable exactly when the hidden owner variables satisfy:

- monochromatic P0 pin constraints;
- monochromatic P1 pin constraints;
- NAE constraints for mixed-hit lines.

This gives an exact CSP interpretation of the support-local line-hit correlation problem.

Authority claim C4-R0060.

#### F2. Pairwise compatibility is not enough

**Paper priority: HIGH.**

A three-line odd inequality cycle exists on every K=4 board W>=5,H>=4 such that each one- and two-constraint subfamily is satisfiable but all three together are not.

Thus local/pairwise compatibility cannot replace higher-order realizability.

Authority claim C4-R0061.

#### F3. Legal colored history is a constrained shuffle / linear-extension problem

**Paper priority: HIGH.**

For fixed colored support, gravity yields column chains. Pre-terminal reachability under alternating play is exactly the existence of a linear extension whose ownership word is alternating 0101....

Equivalently, the global alternating word must lie in the shuffle of the column owner words.

Authority claim C4-R0062.

#### F4. Variable-width history realizability contains an NP-hard constrained-shuffle problem

**Paper priority: HIGH complexity boundary.**

When number of columns is part of the input, the even-rank alternating history-realizability problem contains CSh[(ab)*], known NP-hard.

This NP-hardness appears before adding winning-line geometry or first-win stopping.

It does not imply NP-hardness for fixed width 7.

Authority claim C4-R0066.

#### F5. Strategy preservation under projection is exactly observation-based uniformity

**Paper priority: HIGH.**

A controller strategy factors through a projection alpha exactly when it chooses the same action on alpha-equivalent consistent histories.

Thus a structural quotient is sufficient for an objective only when a winning strategy exists that is uniform under that observation.

Finite-horizon dependency restrictions admit a QBF/DQBF / Skolem-function representation.

Authority claims C4-R0064 and C4-R0065.

These findings explain why some state projections preserve value but not constructive strategy/proof.

---

### G. Residual Boundary Algebra (RBA)

#### G1. Exact board-fiber isomorphism transports ordinary value algebra

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

#### G2. Strong distance emerges as Bellman-information resolution ordinal on complete controls

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

#### G3. Six partial WDL values reduce exactly to four nested threshold fronts

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

#### G4. Bellman block composition is a monotone lattice polynomial but not a simple join/meet homomorphism

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

#### G5. Exact symbolic normalization laws have been derived

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

### H. Exact action-value frontiers

#### H1. Same-support favorable residual order is an exact action-value isotony candidate

**Paper priority: HIGH, clearly labeled candidate.**

At fixed support and side to move, define qA >= qB when:

- the mover's completion function is no harder in A;
- the opponent's completion function is no easier in A.

Same-action cofactors preserve the order, and the candidate induction implies exact state and fixed-action strong values are isotone.

Therefore each support/action/score-threshold region is upward closed and can be represented by a minimal antichain frontier.

Direct “action a is optimal” is **not** upward closed; exact action-value frontiers are the correct object.

Source:
- SUPPORT_LOCAL_ACTION_VALUE_ISOTONY.md, blob fb77a590aab4a3442fb902138e4ce1b9be960a90.

#### H2. Complete-control and standard-board evidence is substantial

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

### I. Recent control-parity / direct structural graph campaign

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
15. remaining-move capacity reducing 4x4 C4 from 9,441 to 9,321 states with exact quotient preservation;
16. support-release turn-slot capacity reducing the same carrier to 9,319 states;
17. 427/438 class-preserving opponent-residual deletions shown literally continuation-equivalent, including all 170 open-cap cases;
18. first-terminal dominance explaining all 143 feasible open-cap deletions not already ruled out by support capacity;
19. open-cap closure reducing 4x4 C4 to 9,090 states and explaining/removing ~62.56% of the original static excess, while falsifying representation monotonicity on width-4 C3 controls;
20. generic action-permutation parity rejected as the wrong XOR layer;
21. deeper recursive binary-continuation inheritance isolated after current-action gauge removal;
22. one zero-syndrome independent cocycle on 4x4 C4 surviving the closure stack;
23. 4x5 C4 expansion to 696 binary groups, 469 binary-continuation edges, 95 sheet flips, 42 reconvergences, and 40 independent zero-syndrome cycles.

---

### J. IsoMax / JSMinSys findings that belong in the paper

#### J1. Lazy SMP is execution policy, not game semantics

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

#### J2. One-wide plus deep workers is a qualified practical execution topology

**Paper priority: MEDIUM.**

The selected IsoMax line uses native Lazy SMP with one wide/root-frontier worker and remaining deep workers, exact-only shared publication, compact q identity, and separate private/shared caches.

This is implementation architecture, not a mathematical theorem.

#### J3. Search-derived local zero bounds can remove most work on a hard control

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

#### J4. Dense residual-cofactor propagation produced a measured exact whole-solver improvement

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

#### J5. Many plausible SMP optimizations were correctly rejected

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

### K. Important falsifiers and negative results

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


Additional late negative controls materially constrain the interpretation:

- current-action transporter parity is generic symmetric-group bookkeeping and is not the latent Connect-Four phase [67];
- exact semantic deletion is not representation-monotone: removing behaviorally redundant residuals can enlarge intermediate structural graphs [72];
- remaining-move capacity is exact but does nothing through the measured 6x4 rank-12 prefix and slows that control when enabled unconditionally [68];
- the recursive GF(2) phase remains only a bounded structural cocycle; generic transition/cofactor confluence has not yet been excluded [65,73].

### L. Findings that must remain quarantined from production proof authority

Under the revision-0.7 theorem-contamination rule, the following categories require special handling:

#### L1. Solved 28 and 61 terminal-line supports

These are validation/output evidence only.

#### L2. Structural 28 research

The algebra may be exact, but because the target 28 was already known during the discovery campaign, use as production proof authority requires a blind independent provenance audit/re-derivation.

#### L3. Opening-value premise studies

Research notes that explicitly admit published opening W/D/L values are useful for locating missing calculus but cannot support a blind theorem.

#### L4. Oracle-selected proof-frontier experiments

If an oracle was used only to choose which witness to try, any final claimed theorem must be rerun or otherwise shown independent of that choice. The 99/822 local proof-grammar result passed such an all-legal-move recheck; source-frontier values themselves remain control data.

#### L5. Solver/book benchmarks

Opening books, persistent solved caches, or known best moves may be used only as external controls unless the paper explicitly discusses ordinary engine practice rather than the blind production theorem lane.

---

## 21. From the algebra to the board: a human move protocol

The mathematical objects in this paper are deliberately more precise than the language a human player would normally use at the board. A player does not need to enumerate 625 residual masks, compute a GF(2) stabilizer, or construct an RBA boundary before choosing a move.

The research does, however, translate into a useful way of **looking at a Connect Four position**.

The central practical change is:

> Do not evaluate a move primarily by where the token lands. Evaluate how the move changes the set of still-live winning routes, which of those routes are actually playable under gravity, what responses they demand, and who reaches the critical cells first.

This section separates four evidence classes.

| Label | Meaning for a human player |
|---|---|
| **THEOREM** | The recommendation follows from a proved structural statement under its stated guards. |
| **RULE-DERIVED HEURISTIC** | The quantity is computed only from the current board, geometry, and rules, but is not itself an exact value theorem. |
| **COMPUTATIONALLY EXACT** | Exact rule-only search establishes the move/value, but the compact structural theorem is still missing. |
| **SOLVED-PLAY FACT** | The result comes from the independently solved game and is useful practical knowledge, but it is excluded from the blind theorem producer. |

The same move can appear in more than one class for different reasons.

For engine interpretation, one additional rule applies:

> **A heuristic may change search order, never the proof domain.**

A human may simply choose a promising move and continue playing. An exact solver claiming a root proof must still account for every alternative not removed by an exact law or exact search consequence.

### 21.1 The first move: center has a stronger justification than “center usually looks good”

For standard 7x6 Connect Four, the exact non-center safety theorem proves that every first move in columns

~~~text
1, 2, 3, 5, 6, 7
~~~

admits a P1 policy that prevents P0 from ever winning [46,51].

Therefore:

~~~text
THEOREM

If P0 wants to preserve the possibility of a forced win,
the first move must be column 4.
~~~

This is stronger than centerline intuition.

The theorem does **not** by itself prove that column 4 wins. It proves that every other first move fails to force a P0 win.

Separately, the solved standard game establishes that the empty 7x6 root is a first-player win and that the center opening is winning [1]. Thus the practical perfect-play move is:

~~~text
SOLVED-PLAY FACT
first move: 4
~~~

The important methodological difference is that the paper's blind research still owes the positive structural theorem:

$$
\text{rules}+\text{7x6 geometry}
\vdash
\text{opening 4 is a P0 win}.
$$

For a human player the action is already clear. For the structural research program the proof burden is not.

Also note what the opening theorem does **not** say:

> It does not say “always choose the most central legal move.”

Center is theorem-backed as the only empty-board opening not structurally excluded from a P0 forced win. For solver use, however, the relevant question is whether the generalized non-center theorem has been **closed and promoted as a law**. If so, the solver may use it directly; if not, the existing 7x6 consequence remains a research result and cannot be treated as a built-in opening axiom. Middle-game move choice is position-dependent.

### 21.2 See the board as live winning recipes

The exact q representation has a simple human interpretation [43,64].

For each player, every geometric four-in-a-row is one potential recipe.

If the opponent already occupies one cell of that four, the recipe is dead.

If some cells already belong to the player, those cells no longer need to be acquired. What remains is the **residual recipe**.

Example:

~~~text
winning line:
    A B C D

you already own:
    A B

live residual:
    {C,D}
~~~

If the opponent takes C, that route disappears.

If you take C, the route becomes:

~~~text
{D}
~~~

which is a one-cell completion obligation.

A human does not need to write every residual set down. For each candidate landing cell, scan the horizontal, vertical, and two diagonal directions passing through it and ask:

1. Which of my still-live fours does this move shorten?
2. Which opponent live fours does it kill?
3. Which new short residuals does it create?
4. Are their remaining cells actually reachable in time?

This is the board-level meaning of the residual-antichain state.

### 21.3 First practical priority: terminal tactics

Several structural facts reduce to familiar but exact tactical rules [51].

#### Take the win

~~~text
THEOREM

If a legal move completes one of your live singleton residuals,
play it and the game ends.
~~~

There is no reason to preserve a longer strategic plan after an immediate legal win exists.

#### One opponent immediate completion forces the answer

If the opponent has exactly one legal completion cell and you have no earlier immediate win, that cell is a forced defensive obligation.

~~~text
THEOREM

one distinct playable opponent completion
    -> forced reply
       unless you win first.
~~~

Blocking the geometric line somewhere else is irrelevant if the opponent's actual completion cell remains playable.

#### Two distinct opponent completion cells are decisive

If the opponent has at least two distinct playable completion cells and you cannot win immediately, one move cannot occupy both cells.

~~~text
THEOREM

two distinct playable opponent completions
+ no immediate win for you
    -> forced loss.
~~~

The practical offensive version is equally important:

> Try to create two independent playable winning cells, not merely two attractive-looking lines.

That is the cleanest form of a Connect Four fork.

### 21.4 A threat is not just “three in a row”

Gravity is one of the main reasons ordinary line counting misleads.

A missing winning cell can be:

- playable now;
- unsupported and therefore unavailable;
- made playable by your move;
- made playable for the opponent by your move;
- reachable only after another sequence of support events;
- strategically too late because another line terminates first.

Therefore the human question is not:

~~~text
How many threes do I have?
~~~

It is:

~~~text
Which live residual can actually complete first?
~~~

This is why the paper repeatedly separates:

~~~text
winning-line geometry
from
support/accessibility
from
deadline/first-win order.
~~~

A visually impressive three-in-a-row with an unreachable fourth cell may be less valuable than a two-cell residual whose support is already prepared.

### 21.5 Before dropping a token, ask what cell you are making playable

A legal move changes more than ownership of its landing cell.

Because pieces stack, it also exposes the cell immediately above it.

That exposed cell may be:

- your future completion;
- the opponent's future completion;
- a required support for a diagonal;
- a response resource;
- a parity-critical control point.

A strong human habit is therefore:

> Before every nonterminal move, look one cell above the landing cell and ask who benefits from making that cell legal next.

This is a direct practical consequence of support being load-bearing in the exact q semantics [43,51].

The research contains explicit counterexamples to support-free residual reasoning. Two positions can have similar-looking remaining lines but different values because the cells become available in a different order.

### 21.6 Look for support shadows and preemption

The non-center opening proof gives a particularly concrete example [46].

Some apparent upper-row P0 winning lines are not defeated merely by occupying one of their four target cells. Instead, a P1 winning line one row below completes **before** P0 can complete the upper line.

Schematic form:

~~~text
P0 target:
    B3 C3 D3 E3

P1 support-shadow line:
    B2 C2 D2 E2
~~~

If gravity and the response policy force P1 to obtain the lower cells first, P0's upper horizontal is strategically dead even though none of its four target cells was initially blocked.

Human lesson:

> When planning an upper horizontal or diagonal, inspect the support cells below the target. The opponent may be able to win through the support layer before your visible line ever becomes playable.

This is a first-win effect, not merely a static blocker effect.

### 21.7 Think in response resources, not only threats

A defensive strategy often works because every opponent trigger has a reserved answer.

For example, one qualified local component in the non-center theorem uses vertical trigger/response pairs of the form:

~~~text
P0 takes row 1
    -> P1 takes row 2

P0 takes row 3
    -> P1 takes row 4

P0 takes row 5
    -> P1 takes row 6.
~~~

This is not a universal instruction to “always play directly above.” Its validity depends on the surrounding response component and first-win guards.

The broader human principle is:

> A threat matters only if the opponent has enough independent response resources to answer it.

This suggests two complementary questions.

On offense:

~~~text
Can I create two obligations
that require two different replies
before the opponent gets two moves?
~~~

On defense:

~~~text
Can one move answer several apparent threats at once?
~~~

The exact two-immediate-threat fork is the simplest case. Longer-horizon overloads require more careful support/deadline reasoning and should be treated as strategic analysis rather than an automatic theorem.

### 21.8 Use parity as conditional control, not folklore

The CPC control-potential derivation gives a precise version of the familiar odd/even threat idea [48].

On standard 7x6, under the zero-reservation CPC profile, the baseline absolute owner bit depends only on row parity.

Using human row numbers 1 through 6 from bottom to top:

~~~text
baseline zero-reservation control:

P0:
    rows 1,3,5

P1:
    rows 2,4,6.
~~~

But this is **not** an unconditional statement that every odd-row threat belongs to P0 and every even-row threat belongs to P1.

Strategic fragments can change the relevant prior-event count. In the control-potential representation this is the correction field rho:

$$
q(c,r)=\kappa+r+\rho(c,r).
$$

So the practical use is:

1. start with the natural column/row parity;
2. identify moves that insert or consume an extra relevant event before the target;
3. ask whether that changes who gets the target cell;
4. retain the support, resource, and deadline guards.

Human translation:

> Parity tells you who receives a cell only after you know which moves must occur before that cell becomes playable.

This is much safer than treating odd/even threat rules as context-free formulas.

### 21.9 Live-line evaluation is more informative than static center distance

Center distance is static.

Live winning structure changes every move.

A rule-derived human evaluation can therefore ask of candidate move \(a\):

~~~text
Does a win now?

How many opponent live recipes does a kill?

How many of my live recipes does a shorten?

Does a create a playable singleton?

Does a create two independent completion cells?

What support cell does a expose?

Does a give the opponent a playable singleton?

Which important residuals become easier/harder under gravity?

What happens to the parity/deadline of the critical targets?
~~~

This is a **RULE-DERIVED HEURISTIC** unless an exact theorem proves the corresponding value implication.

The support-local action-value research gives some formal support for this perspective [52,53]. At fixed support, making the mover's residual completion condition no harder while making the opponent's no easier is a candidate exact favorable order with millions of zero-violation bounded comparisons.

However, ordinary candidate moves usually change the support. The research explicitly found that cross-support residual comparison can fail.

Therefore:

> Do not turn “more live lines” into a context-free numerical law.

A move that creates three additional geometric routes can still be inferior if it exposes the wrong support cell or loses the timing race.

### 21.10 A useful human ordering of questions

The structural work suggests the following board scan.

#### 1. Can I win now?

If yes, take the terminal win.

#### 2. Can the opponent win on the next move?

Count **distinct playable completion cells**, not lines.

If there is one, answer it unless you win now.

If there are two and you cannot win now, the position is already tactically lost.

#### 3. What live winning recipes survive each candidate move?

Ignore lines already containing an opponent token.

Prefer to reason about the missing cells, not the visual length of the line.

#### 4. Which missing cells are actually playable?

Track support.

Do not call an unsupported completion cell an immediate threat.

#### 5. What does my move make playable for the opponent?

Especially inspect the cell immediately above the landing cell.

#### 6. Can I overload the opponent's response capacity?

Two independent playable completion cells are the clean exact case.

Longer-horizon overloads are valuable but need timing verification.

#### 7. Is there a support shadow or earlier terminal race?

An upper target can be strategically dead because the lower support layer lets the opponent finish first.

#### 8. Who gets the critical cell if the column fills naturally?

Use parity/control only after accounting for required intervening moves.

#### 9. Are two candidate continuations merely symmetric or behaviorally equivalent?

Horizontal reflection is exact with mirrored action labels. More generally, the q theorem says move history itself is irrelevant once it no longer changes support or live residual requirements [43].

#### 10. Only then use broad positional preferences

Center incidence, raw line count, and aesthetic shape are useful tie-breakers and heuristics.

They should come **after** terminal tactics, support, live residuals, response capacity, and timing.

### 21.11 A compact qualitative move score

For over-the-board play, one can turn the previous scan into a qualitative score without fitting anything to solved games.

For a candidate move, think:

~~~text
highest priority:
    immediate terminal win

then:
    mandatory defense of opponent immediate win

then favor:
    creating multiple independent playable completions
    creating a playable one-cell residual
    killing opponent short live residuals
    shortening several of your accessible residuals at once
    preserving multiple response options

penalize:
    giving opponent a playable singleton
    exposing critical support under an opponent target
    relying on an unsupported "threat"
    consuming a response resource needed elsewhere
    losing the parity/deadline race

late tie-breakers:
    broad live-line incidence
    centrality
    symmetry-preserving convenience.
~~~

No numeric weights are asserted.

That omission is deliberate. A numerical weight fitted because it reproduces solved positions would reintroduce the theorem-contamination problem discussed in §3.4.

### 21.12 Concrete opening examples and their status

#### Empty board

~~~text
Move:
    4

Status:
    theorem-backed as the only first move
    not structurally ruled out from a forced P0 win;
    independently confirmed winning by solved play.
~~~

#### Position 44, P0 to move

The separate exact two-engine computation gives [63]:

~~~text
441 -> P0 loss
442 -> P0 loss
443 -> P0 loss
444 -> P0 win
~~~

with reflection covering the remaining columns.

Therefore:

~~~text
COMPUTATIONALLY EXACT
after 44:
    play 4.
~~~

Under this paper's stricter production standard, this is not yet a compact structural theorem. For a human player, however, it is exact move knowledge.

#### After a different opponent reply to the initial center

The present blind structural program does not yet provide a simple one-line human formula for every third-ply reply.

Use the protocol above:

~~~text
terminal tactics
-> playable threats
-> live residuals
-> support exposure
-> response overload
-> parity/deadline
-> positional heuristic.
~~~

This is preferable to pretending that a static center-first rule contains the missing strategy.

### 21.13 What a human should remember from the entire paper

The paper's technical language can be compressed to a small set of practical habits.

> **Play the live game, not the picture.**  
> A line that is blocked is gone. A line whose completion is unsupported is not yet a threat.

> **Count playable winning cells, not apparent threes.**  
> Two independent playable completions are far more important than several inaccessible lines.

> **Every move changes future legality.**  
> Always inspect the cell your token makes playable above it.

> **Threats consume response resources.**  
> Try to demand two incompatible answers; try to defend several threats with one answer.

> **Timing beats eventual ownership.**  
> The line that completes first is the one that matters.

> **Parity is conditional control.**  
> Use it only after support order and intervening moves are understood.

> **Center is a theorem-backed opening, not a universal middle-game rule.**

> **Forget irrelevant history.**  
> If two positions have the same support and the same surviving winning recipes, their ordinary future game is the same [43].

This is the human-facing form of the structural program:

~~~text
do not ask only:
    where should I put a token?

ask:
    what future winning obligations,
    supports,
    responses,
    and deadlines
    does this move create or destroy?
~~~

---

## 22. Conclusion

The complete Connect4/IsoMax research corpus supports a broader conclusion than the recent control-parity campaign alone.

The project has **not** produced a polynomial generalized Connect Four solver, a complete searchless standard-root proof, or an XOR formula for W/D/L. It has, however, changed the mathematical shape of the remaining problem.

At the ordinary-game level, support plus normalized residual winning requirements gives an exact future-behavior state \(q_o\). Horizontal reflection gives an exact transporter-aware quotient \(q_r\). Ordinary value is one rank-well-founded alternating dependency; IsoMax, BSFP, and possible bidirectional methods are different evaluation policies over that relation rather than distinct game semantics.

At the geometry level, Connect-4 windows form a third finite-difference system over GF(2). The diagonal relations are derived mixed derivatives, the regular incidence cokernel has seven modes, and CPC ownership/phase/seam structure can be represented through one guarded binary control potential.

At the first-move level, the negative half of the root theorem is already internal and rule-derived: all six non-center openings admit exact defender safety certificates on standard 7x6. Therefore any self-contained proof of a P0 forced win must begin in the center. The remaining turn-one burden is a **positive center-win theorem**, not a comparison against six unresolved alternatives.

At the output level, W/D/L value and perfect-play terminal-line provenance admit an exact set-valued algebra and a clean factorization. The number of perfect-play terminal lines depends on the tie convention: the preserved W/D/L-only support is 61, while the distance-sensitive strong convention yields 28. Both are solved-result evidence, not theorem premises. A separate structural object also has dimension 28, but equal cardinality does not identify it with the strong-play terminal-line set, and its production use is quarantined pending blind provenance review.

At the proof level, residual winning requirements and recursive proof obligations share the same antichain absorption algebra. Proof expressions can compress even when state equivalence cannot. The standard-7x6 \(I/O/E/A\) pilot's 105 universal branches collapsing to 30 consequence branches is a concrete instance of this distinction.

At the realizability level, the project has exact characterizations of several hidden constraints: support-local line-hit realizability as a pinned NAE CSP, colored-history reachability as an alternating constrained shuffle/linear extension, and projection-preserving strategy as observation-based uniformity. Variable-width history realizability already contains an NP-hard constrained-shuffle problem. These facts explain why local parity, pairwise compatibility, or unit-capacity matching alone cannot supply a complete strategic calculus.

At the residual-boundary level, exact partial W/D/L information reduces to four nested antichain fronts, and alternating Bellman blocks are monotone lattice polynomials. The hard algebraic terms are mixed opponent-reply covers, not scalar minimax itself. Exact skyline, dominance, absorption, and shared-cover transformations demonstrate that these laws can eliminate enormous redundant symbolic products on bounded controls.

At the decision level, support-local action-value frontiers provide a candidate route directly from structural order to exact action scores and best-move proofs. Complete controls show millions of comparable state/action pairs with no recorded value-order violations, and bounded standard-7x6 tests prove many held-out best moves with zero false claims in the recorded samples. Root-scale frontier construction remains open.

At the newest control-parity layer, different physical histories collapse to common residual boundaries; paired responses exhibit exact GF(2) relations; guarded polynomial identities emerge; action labels can be quotiented; direct structural graphs can be constructed without physical-board enumeration; and binary tie symmetries yield a constructive XOR stabilizer. The late closure campaign pushes the 4x4 C4 structural carrier from 9,441 to 9,090 states while preserving 8,242 recursive classes, explaining or removing about 62.56% of the original static excess. Most observed opponent-residual deletion equivalence is already literal continuation equivalence, and the complete open-cap deletion family is explained by unrealizability or first-terminal dominance. At the same time, the C3 countercontrols prove that semantically safe deletion can enlarge the represented graph.

The XOR-placement campaign also moves the candidate phase deeper. Raw action-permutation sign is falsified as generic bookkeeping. After that gauge is removed, a recursively inherited binary continuation residue supports a gauge-invariant GF(2) cocycle: the sole 4x4 independent cycle has zero syndrome, and the larger 4x5 carrier has 40 independent zero-syndrome cycles despite 95 sheet-flipping edges and 42 genuine reconvergences. This is the strongest bounded XOR evidence in the campaign so far, but it remains structural rather than strategic: no W/D/L bridge, generalized-board theorem, or polynomial construction follows. Meanwhile 6x4 prefix growth still shows that the structural frontier itself can explode even when canonicalization and per-state residual size are modest.

At the implementation level, IsoMax demonstrates the practical consequence of exact structural information. Scoped local zero bounds removed roughly 75% of nodes and 56% of process cycles on their declared long control, while dense residual-cofactor propagation produced a smaller but measurable whole-solver improvement. Equally important, numerous plausible parallel-search changes were rejected when they increased total work or weakened an exact witness contract. The relevant objective is exact whole-proof economics, not a single proxy.

These findings localize the central missing law:

$$
\text{compact structural observation}
+\text{realizability}
+\text{support/resources/deadlines}
+\text{uniform controller response}
+\text{first-win semantics}
\longrightarrow
\text{CertifiedObligation / exact value consequence},
$$

computed **before** universal alternatives or structural frontiers expand.

For the immediate standard-board application, the next decisive theorem is especially concrete:

$$
\text{Connect Four rules}+\text{7x6 geometry}
\vdash
\text{center opening is a P0 win}.
$$

Combined with the non-center safety result, this would derive the first move without an opening book or solved-position premise. For solver admission, the generalized non-center theorem must first be closed as a genuine law. Once closed and provenance-qualified, IsoMax may use that law directly without re-running its proof; until then, embedding the existing 7x6 consequence would merely import an instance result.

The same standard applies to heuristics: centerline, live-line, or any other evaluation may prioritize a continuation but cannot make its unsearched siblings disappear from the proof domain. The same standard applies to later opening plies. The independently confirmed \(44\to444\) result is useful validation [63], but recursive exact search is not yet the desired compact structural theorem. A production shortcut must remain derivable after deleting every oracle output, solved table, opening book, known best-move label, and outcome-fitted parameter.

The broad research program can now be stated as:

~~~text
physical game
    -> exact residual future semantics
    -> finite-difference / control-potential geometry
    -> realizability and proof constraints
    -> compact antichain value/proof boundaries
    -> guarded controllable predecessor
    -> theorem-backed search elimination.
~~~

A substantial fraction of this chain is already exact.

The missing links are no longer vague.

They are now the primary research target.

---

## Provenance and Contribution Note

Joshua Oshiro is the author of this paper and the originator of the core research direction and core conceptual findings reported here, including the Nim-like control-parity hypothesis, the framing that control parity is pressured by geometry, and the interpretation of perfect-play branching and collapse as evidence for a coarser latent control object.

This work was produced with AI/agent assistance operating through and in conjunction with the IsoGraph and Connect4 research process. AI agents assisted with implementation of experiments, exhaustive and bounded computation, algebraic analysis, verification, literature research, synthesis, drafting, and repository operations.

**An AI agent was used for this research, but it was not responsible for the core findings.** The central conceptual findings and research direction were supplied by Joshua Oshiro. Agent-produced computations and derivations were used to test, refine, falsify, extend, and document those ideas.

Joshua Oshiro also designed the IsoGraph system and methodology used in this research.

External publications, solved-game results, software, and mathematical theories are attributed separately below.

---

## License

© 2026 Joshua Oshiro.

This work is licensed under the **Creative Commons Attribution 4.0 International License (CC BY 4.0)**.

You are free to share, copy, redistribute, remix, transform, and build upon the original material for commercial or noncommercial purposes, provided appropriate credit is given to Joshua Oshiro, the license is identified, and changes are indicated.

This license applies to the original text, analysis, diagrams, and explanatory material in this paper. Referenced source code, repository contents, third-party publications, trademarks, and other externally owned materials retain their original licenses and ownership.

---

## References

[1] Victor Allis. *A Knowledge-based Approach of Connect-Four: The Game Is Solved: White Wins.* Master’s thesis, Vrije Universiteit Amsterdam, 1988; also published in *ICGA Journal* 11(4), 1988. DOI: https://doi.org/10.3233/ICG-1988-11410.

[2] John Tromp. “Solving Connect-4 on Medium Board Sizes.” *ICGA Journal* 31(2):110–112, 2008. DOI: https://doi.org/10.3233/ICG-2008-31205.

[3] John Tromp. “John’s Connect Four Playground.” Board-size outcome table and Fhourstones research notes. https://tromp.github.io/c4/c4.html.

[4] Roland Sprague. “Über mathematische Kampfspiele.” *Tohoku Mathematical Journal* 41:438–444, 1935. https://www.jstage.jst.go.jp/article/tmj1911/41/0/41_0_438/_article.

[5] P. M. Grundy. “Mathematics and Games.” *Eureka* 2:6–8, 1939; reprinted in *Eureka* 27:9–11, 1964.

[6] IsoGraph Project. “Qualified Module Authority Manifest — 2026-09-28.” Repository baseline e14065689ad1c2183a6363f8e0cb85bd5630dc05; blob a2e009a7521345662017fd0ad5ae9fa80926e974. https://github.com/iteathen/IsoGraph/blob/e14065689ad1c2183a6363f8e0cb85bd5630dc05/qualification/QUALIFIED_MODULES_2026-09-28.md.

[7] IsoGraph Project. “Core Specification Draft 0.19 — Implicit Assertions.” Repository baseline e14065689ad1c2183a6363f8e0cb85bd5630dc05; blob ae482dda774456a855af942dc8d15fcfd5aae0bb. https://github.com/iteathen/IsoGraph/blob/e14065689ad1c2183a6363f8e0cb85bd5630dc05/CORE_SPEC_DRAFT_0_19_IMPLICIT_ASSERTIONS_CANDIDATE.md.

[8] IsoGraph Project. “Core Specification Draft 0.20 — Primitive-Logic Closure.” Repository baseline e14065689ad1c2183a6363f8e0cb85bd5630dc05; blob ef9ea2584ec24f87c956d486040d3cbbd7d49f79. https://github.com/iteathen/IsoGraph/blob/e14065689ad1c2183a6363f8e0cb85bd5630dc05/CORE_SPEC_DRAFT_0_20_PRIMITIVE_LOGIC_CLOSURE_CANDIDATE.md.

[9] IsoGraph Project. “Quantifiable Unknown Extension 0.1.” Repository baseline e14065689ad1c2183a6363f8e0cb85bd5630dc05; blob 745173425a647609db99ddb11530c28cc279ada8. https://github.com/iteathen/IsoGraph/blob/e14065689ad1c2183a6363f8e0cb85bd5630dc05/extensions/qu/QUANTIFIABLE_UNKNOWN_SPEC_0_1_CANDIDATE.md.

[10] IsoGraph Project. “Discovery Protocols 0.8 — Clue-Preserving Discrepancy Adjudication.” Repository baseline e14065689ad1c2183a6363f8e0cb85bd5630dc05; blob 6c0f50bd042a60bade549d7ab5f4cfd37bc744dc. https://github.com/iteathen/IsoGraph/blob/e14065689ad1c2183a6363f8e0cb85bd5630dc05/extensions/discovery/DISCOVERY_PROTOCOLS_0_8_CLUE_PRESERVING_DISCREPANCY_CANDIDATE.md.

[11] IsoGraph Project. “Detailed Transition System Extension 0.1.” Repository baseline e14065689ad1c2183a6363f8e0cb85bd5630dc05; blob 04170c1faa26ca8b76e211a0491ce76e358d111b. https://github.com/iteathen/IsoGraph/blob/e14065689ad1c2183a6363f8e0cb85bd5630dc05/extensions/dts/DETAILED_TRANSITION_SYSTEM_0_1_CANDIDATE.md.

[12] Connect4 Project. “Dimension/parity discovery and the shared center-boundary obligation.” Blob b0b7748591c7f0d61739639808c947dd58326e1d. research/isograph/discovery/2026-09-29-center-proof-cycle/PARITY_DIMENSION_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[13] Connect4 Project. “Parity boundary results.” Blob 5a01c376f90eca20c2949f2234eb6f530c7da5d5. research/isograph/discovery/2026-09-29-center-proof-cycle/PARITY_BOUNDARY_RESULTS.json, branch research/nim-control-parity-algebra-20260929.

[14] Connect4 Project. “Nim-like control-parity algebra — first bounded result.” Blob fc02fa0be399cd009c7e8cb69abea2e249cde565; experiment tested head 4ae1a1fca42cb30f1746c29c00616157b916ae6d. research/isograph/discovery/2026-09-29-center-proof-cycle/CONTROL_ALGEBRA_RESULT.md.

[15] Connect4 Project. “Post-hoc board-outcome comparison for the control-algebra probe.” Blob b23b7c100bb12125ff05dc6b9a79529a03915530. research/isograph/discovery/2026-09-29-center-proof-cycle/CONTROL_ALGEBRA_OUTCOME_COMPARISON.md.

[16] Connect4 Project. “Optimal branch-and-collapse audit — exhaustive 4x4.” Current blob 34d2654d72d0fc00d279e63dc5aa21f65ebe6cba; original tested head f03d08e9ba6ab941f87b7e815bc1086a2238c832; workflow 36542646831. The current artifact also contains the sibling-quotient and XOR-delta falsifier follow-ups. research/isograph/discovery/2026-09-29-center-proof-cycle/BRANCH_COLLAPSE_RESULT.md.

[17] Connect4 Project. “Nim-like control-parity algebra hypothesis.” Current canonical blob 3c3763b2f886cf2a70a0a854100f98dff0e03bf8. research/hypotheses/NIM_LIKE_CONTROL_PARITY_ALGEBRA.md, branch research/semantic-quotient.

[18] Connect4 Project. “GSP-004 — Guarded obligation closure.” Blob d8124df0a80aeecc5c3e6b531694a4d0528572c5. research/gameplay-strategy/GSP-004-GUARDED_OBLIGATION_CLOSURE.md, branch research/nim-control-parity-algebra-20260929.

[19] Connect4 Project. “IsoMax post-IA DP 0.8 pass 0.1.” Blob 856773fb1f8b61db815e7a6e10e8cc44cb27bc24. research/isograph/discovery/2026-09-27-isomax-core020-dp-dts/DP_PASS_0_1.md.

[20] Connect4 Project. “IsoMax post-IA DTS 0.1 pass 0.1.” Blob 058ebfffdf0540b58d64f17d48625693f9f01a2c. research/isograph/discovery/2026-09-27-isomax-core020-dp-dts/DTS_PASS_0_1.md.

[21] JSMinSys Project. Pull Request #52, “Promote selected IsoMax six-deep/one-wide implementation.” https://github.com/iteathen/JSMinSys/pull/52.

[22] JSMinSys Project. Pull Request #79, “IsoMax Phase2: integrate local search-derived zero bounds.” https://github.com/iteathen/JSMinSys/pull/79.

[23] JSMinSys Project. Pull Request #119, “Promote qualified IsoMax runtime and selected localhost profile.” https://github.com/iteathen/JSMinSys/pull/119.

[24] Connect4 Project. Pull Request #163, “Refactor IsoMax to JSMinSys Lazy SMP-only execution.” https://github.com/iteathen/Connect4/pull/163.

[25] IsoGraph Project. Issue #60, “Proposal: DP Experimental Warrant + open-world experimental inquiry module.” https://github.com/iteathen/IsoGraph/issues/60.


[26] Connect4 Project. “Unlabeled branch quotient cross-check — exhaustive 4x4.” Blob d25e5f4e46fc613f3c08fe1179e1ebd84040d974; tested head 89da39a23df10b61923d3d4d9c06256b2b50dc28; workflow 36546690005. research/isograph/discovery/2026-09-29-center-proof-cycle/UNLABELED_BRANCH_QUOTIENT_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[27] Connect4 Project. “Unlabeled recursive quotient — cross-dimension control.” Blob cbdb95999fec659939f7c91bd564a79cdfb14f10; tested head d19476c05e4d6ec9962ada97c09f0a036c7726ad; workflow 36547330072. research/isograph/discovery/2026-09-29-center-proof-cycle/UNLABELED_QUOTIENT_DIMENSION_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[28] Connect4 Project. “Residual-q column-orbit carrier audit — exhaustive 4x4.” Blob 1cac653892b6cbda4ce2e1c1b9057197be4ace87; tested head 1b2e1e71cbe5b3d075f93dffe1056a2717f1f5d5; workflow 36547940338. research/isograph/discovery/2026-09-29-center-proof-cycle/RESIDUAL_Q_COLUMN_ORBIT_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[29] Connect4 Project. “Direct residual-orbit graph reconstruction — exhaustive 4x4.” Blob cec90301cfbe40ecfa7af80839924db2212772a8; tested head d69767b3ae1890a705e607c9edead28f8a9e0787; workflow 36548797735. research/isograph/discovery/2026-09-29-center-proof-cycle/DIRECT_RESIDUAL_ORBIT_GRAPH_RESULT.md, branch research/nim-control-parity-algebra-20260929.


[30] Connect4 Project. “Earliest dynamic residual merge — universal frontier blocker.” Blob a06cf704f63a32093bf026312ccc640fba7dc501; source head cd92ad08832b398b5642861a198d9c1f0f9c9bcf; workflow 36549583331. research/isograph/discovery/2026-09-29-center-proof-cycle/UNIVERSAL_FRONTIER_BLOCKER_RESULT.md, canonical branch research/semantic-quotient.

[31] Connect4 Project. “Residual realizability closure — frontier blockers and final-event cap parity.” Blob cd197fa3f5c422f00cae84a76f197b80bda3e1f1; latest tested head 933c6b00428d79d79433518e24e734dc6cae41e3; workflow 36550319915. research/isograph/discovery/2026-09-29-center-proof-cycle/RESIDUAL_REALIZABILITY_CLOSURE_RESULT.md, canonical branch research/semantic-quotient.

[32] Connect4 Project. “Recursive local branch closure — finite quotient depth controls.” Blob d62642cb79490ab84b6bc0950df2212cd3485b59; tested implementation head 87bd327c18850625a952eaf5cf80348a87991a39; workflow 36551282296. research/isograph/discovery/2026-09-29-center-proof-cycle/LOCAL_BRANCH_CLOSURE_RESULT.md, canonical branch research/semantic-quotient.

[33] Connect4 Project. “Direct structural growth — 4x5 Connect-4.” Blob b3f26fc39fa6680f272d786727532a57faa3aeb3; sparse producer head 5b3084095ed4a7e4fabde8da444d832be4df8686; workflows 36551642428 and 36551912434. research/isograph/discovery/2026-09-29-center-proof-cycle/DIRECT_STRUCTURAL_GROWTH_4X5_RESULT.md, canonical branch research/semantic-quotient.

[34] Connect4 Project. “Direct structural growth — 4x6 Connect-4.” Blob 212eb98c6c61377116b8b184dfe0dd0eac5c6ecd; producer head 4942017060186de86b66f624d48f1e323ec6efcf; workflow 36552138120. research/isograph/discovery/2026-09-29-center-proof-cycle/DIRECT_STRUCTURAL_GROWTH_4X6_RESULT.md, canonical branch research/semantic-quotient.

[35] Connect4 Project. “Direct structural growth — 4x7 Connect-4.” Blob cd9a7443604b35f50121833355a09b4fb2dc2763; full and compact producer workflows 36553254671 and 36553655094. research/isograph/discovery/2026-09-29-center-proof-cycle/DIRECT_STRUCTURAL_GROWTH_4X7_RESULT.md, canonical branch research/semantic-quotient.

[36] Connect4 Project. “Direct structural growth — 5x4 Connect-4.” Blob 3179ee71ae0ae768f0e820144399e0519b2b9ca0; producer head ebb66e1dafcec9eab286dd67c9995459db859aaa; workflow 36553916023; partitioned exact rerun workflow 36554956756. research/isograph/discovery/2026-09-29-center-proof-cycle/DIRECT_STRUCTURAL_GROWTH_5X4_RESULT.md, canonical branch research/semantic-quotient.

[37] Connect4 Project. “Column canonicalization refinement — exact bounded controls.” Blob 391e4dee64e8b905c8b3c5867e282e2d0df0f4af; includes the exact partitioned canonicalizer, matched 5x4 control, guarded binary-tie stabilizer theorem, and complete 18-state coupled automorphism audit. research/isograph/discovery/2026-09-29-center-proof-cycle/COLUMN_CANONICALIZATION_RESULT.md, canonical branch research/semantic-quotient.


[38] Connect4 Project. “Column canonicalization refinement — exact bounded controls,” expanded experimental revision. Blob 80dc39f1e82af2c5b6b8e02143bf73bcbb1652cd; includes constructive binary stabilizer recovery, exact affine binary-tie canonicalization, and matched 5x4 affine benchmark at workflow 36557049257 / producer head 9d984e498b092fa13b5a289fe6b69d998a188372. research/isograph/discovery/2026-09-29-center-proof-cycle/COLUMN_CANONICALIZATION_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[39] Connect4 Project. “Direct structural growth — 6x4 Connect-4 timeout wall.” Blob 53ad24f5018471b49513c132f4c53f6b7bfb0442; producer head fb8aa63ff6d571f52ff5050c4b14999f73b6e863; workflow 36555332049. research/isograph/discovery/2026-09-29-center-proof-cycle/DIRECT_STRUCTURAL_GROWTH_6X4_WALL.md, branch research/nim-control-parity-algebra-20260929.

[40] Connect4 Project. “Direct structural prefix — 6x4 Connect-4 through rank 10.” Blob 980a11af95a346db32c9997839f87ad33968b3fc; producer head 00f22cc5e48b49a8aa6795fcdf0fcdc5323384c4; workflow 36558010011. research/isograph/discovery/2026-09-29-center-proof-cycle/DIRECT_STRUCTURAL_PREFIX_6X4_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[41] Connect4 Project. “Direct structural prefix — 6x4 Connect-4 through rank 11.” Blob 9e4325bc1912383694af5eee79696e6c01cfdeb0; producer head 4298b1d825361462eb03db7572bbe90991b06e4f; workflow 36558462364. research/isograph/discovery/2026-09-29-center-proof-cycle/DIRECT_STRUCTURAL_PREFIX_6X4_RANK11_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[42] Connect4 Project. “Connect4 IsoGraph Logic Authority 1.2.” Blob 14f46d82cfe349b01aea7fa881568dfdca9aa5a0. `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md`, branch `research/semantic-quotient`.

[43] Connect4 Project. “High-value lead investigation — exact future-behavior congruence of q.” Blob 4d72c6984380bfee2c74345062a1849ebbd514db. `research/isograph/discovery/2026-09-18-high-value-leads/STANDARD_7X6_Q_CONGRUENCE.md`.

[44] Connect4 Project. “Operational-layer method emergence from the Connect4 IsoGraph.” Blob 88228aebbf266c363082d67043f6a3f9c18b8030. `research/isograph/discovery/2026-09-18-method-emergence/OPERATIONAL_LAYER_METHOD_EMERGENCE.md`.

[45] Connect4 Project. “Recursive proof-frontier antichain isomorphism.” Blob 0ef1904e404a722a82693228a6e0ff5dcea1704a. `docs/research/2026-09-13-recursive-proof-frontier-antichain-isomorphism.md`.

[46] Connect4 Project. “Non-center opening structural safety theorem.” Blob c6d62b984c68aa493fb0fe8f40a191f0ce8152b1. `docs/research/2026-09-13-noncenter-opening-structural-safety-theorem.md`.

[47] Connect4 Project. “Connect-4 derived difference axioms.” Blob 6ac1b59a5085fc6ad72b6af23d27b01988501241. `docs/research/2026-09-14-connect4-derived-difference-axioms.md`.

[48] Connect4 Project. “CPC as a binary control potential: ownership, phase and seams in one scalar field.” Blob acc62a2817837b52cc93c34fa964e73195b1024a. `docs/research/2026-09-14-cpc-control-potential-unification.md`.

[49] Connect4 Project. “Perfect-play line-output algebra.” Blob a99f2e9246c69ce6b9091c34b679c99c61eeba80. `docs/research/2026-09-13-perfect-play-line-output-algebra.md`.

[50] Connect4 Project. “Winning-region / terminal-line-output factorization.” Blob d2cb21a70052123a91e25271631505aa58a4c6d1. `docs/research/2026-09-13-winning-region-output-factorization.md`.

[51] Connect4 Project. “Connect4 Game-Theory IsoGraph 1.2 — claim coverage.” Blob b0e2d21935b3035997c19c42941b225e77cf5ff9. `research/isograph/successor/CONNECT4_GAME_THEORY_CLAIM_COVERAGE_1_2_CANDIDATE.json`.

[52] Connect4 Project. “Candidate theorem — support-local residual order induces isotone exact action value.” Blob fb77a590aab4a3442fb902138e4ce1b9be960a90. `research/isograph/discovery/2026-09-18-policy-frontier/SUPPORT_LOCAL_ACTION_VALUE_ISOTONY.md`.

[53] Connect4 Project. “Standard 7x6 bounded action-value frontier test.” Blob 3e097d8d597cd90e73c5e695734517dd37fbfcb6. `research/isograph/discovery/2026-09-18-policy-frontier/STANDARD_7X6_BOUNDED_FRONTIER_TEST.md`.

[54] Connect4 Project. “RBA Quantifiable Unknown 0.3 — board-fiber refinement.” Blob 5be5a12117578efb9fd6a567ca9bc8dc6f1ec2b2. `research/isograph/successor/CONNECT4_RBA_QU_0_3.md`.

[55] Connect4 Project. “RBA Quantifiable Unknown 0.4 — Bellman-information refinement.” Blob b15e3b9c54254fd59cdc00d1915b0dfd368d09a7. `research/isograph/successor/CONNECT4_RBA_QU_0_4.md`.

[56] Connect4 Project. “RBA Quantifiable Unknown 0.6 — four-front block refinement.” Blob a84884654f1940addbb920d9e46a2d399fd6d8e9. `research/isograph/successor/CONNECT4_RBA_QU_0_6.md`.

[57] Connect4 Project. “RBA rank27 staged-product qualification 0.2.” Blob 70700a170d85a5d4427fe6d7f5bdbc039d12a6e6. `research/isograph/discovery/2026-09-18-policy-frontier/RBA_RANK27_STAGED_PLANNER_QUALIFICATION_0_2.md`.

[58] Connect4 Project. “RBA shared-target principal-cover transformer and rank26 predecessor assessment 0.1.” Blob 18a4b83cfb0a53e984dc6c77977b37b60900289b. `research/isograph/discovery/2026-09-18-policy-frontier/RBA_SHARED_TARGET_COVER_DP_RANK26_CHECKPOINT_0_1.md`.

[59] JSMinSys Project. Pull Request #79, “IsoMax Phase2: integrate local search-derived zero bounds.” Scoped long-control evidence reports process cycles -56.26% and nodes -75.33%, with exact/public/shared-value guards. https://github.com/iteathen/JSMinSys/pull/79.

[60] JSMinSys Project. Pull Request #33, “Optimize Connect4 cofactor dense propagation.” Scoped same-runner four-worker evidence reports wall -11.38%, CPU -8.68%, process cycles -8.72%. https://github.com/iteathen/JSMinSys/pull/33.

[61] Connect4 Project. “C = NC? comprehensive Connect4 / IsoMax research audit — 2026-09-29.” Blob 0b4788b9fc93cadc7cbfcf8d14b7759096d908a8. `research/publications/2026-09-29/C_EQUALS_NC_RESEARCH_AUDIT_0_1.md`.

[62] Connect4 Project. “Standard 7x6 recursive proof closure.” Blob 1496875ecddb356898c924578c94f3b41dd71d30. `docs/research/2026-09-13-standard7x6-recursive-proof-closure.md`.

[63] Connect4 Project. “Position 44 — oracle-blind exact next-move proof.” Blob 9e53a3e4515377a93fd4038988d79bc6560194cf. `research/isograph/discovery/2026-09-28-44-geometry-blind/RESULT.md`, branch `research/44-geometry-blind-20260928`.
[64] Connect4 Project. “Connect4 gameplay description — human guide.” Blob 0790487db556c677812ee66351d968c2c47713de. `research/GAMEPLAY_DESCRIPTION_FOR_HUMANS.md`, branch `research/semantic-quotient`.


[65] Connect4 Project. “Recursive binary phase and cocycle synthesis.” Blob e4c6609f0079e3121017b43ca0ba1299ff033399. research/isograph/discovery/2026-09-29-center-proof-cycle/RECURSIVE_PHASE_COCYCLE_SYNTHESIS.md, branch research/semantic-quotient.

[66] Connect4 Project. “Recursive continuation-phase inheritance — 4x4 Connect-4.” Blob ca31c030dd5202d2f861e4471fe53af4f542635b; tested head 7b141dbe7fefb7fa602ad4a2d03756b068c9903d; workflow 36598111645. research/isograph/discovery/2026-09-29-center-proof-cycle/RECURSIVE_PHASE_INHERITANCE_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[67] Connect4 Project. “Late action-parity audit — 4x4 Connect-4.” Blob 48f7c20e3b36e506c256bfb4ae8619c1723d7675; generic-sign falsifier workflow 36597022900. research/isograph/discovery/2026-09-29-center-proof-cycle/LATE_ACTION_PARITY_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[68] Connect4 Project. “Remaining-move capacity closure.” Blob c91db8ed42a296314e677f4043501e1315a0787e; qualification workflow 36573895595; 6x4 rank-12 control workflow 36574445551. research/isograph/discovery/2026-09-29-center-proof-cycle/REMAINING_MOVE_CAPACITY_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[69] Connect4 Project. “Support-release turn-slot capacity closure.” Blob 84f45289d8675d0f3f163d7c369a0d72ef6f07de; workflow 36574729963. research/isograph/discovery/2026-09-29-center-proof-cycle/SUPPORT_RELEASE_TURN_CAPACITY_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[70] Connect4 Project. “Opponent-residual literal-continuation equivalence.” Blob 5568d89f189e5934a676f596559de139f7ddf7e5; workflow 36592494824. research/isograph/discovery/2026-09-29-center-proof-cycle/OPPONENT_RESIDUAL_LITERAL_EQUIVALENCE_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[71] Connect4 Project. “Open-cap first-terminal dominance.” Blob a74d6c353e12558cef2f758c5182755698c589d9; workflow 36592801151. research/isograph/discovery/2026-09-29-center-proof-cycle/OPEN_CAP_TERMINAL_DOMINANCE_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[72] Connect4 Project. “Open-cap dominance closure — semantic success, representation non-monotonicity.” Blob 1d82f81959acbf7fe8176abc23703e8b072a1331; workflow 36594018714. research/isograph/discovery/2026-09-29-center-proof-cycle/OPEN_CAP_DOMINANCE_CLOSURE_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[73] Connect4 Project. “4x5 Connect-4 binary phase cocycle result.” Blob 2343fa76d86b7827ab397ba635ba01e4d9f1e24e; tested head db39e9c75b3807bbe156bd4919d8642fb194b9f8; workflow 36606903079. research/isograph/discovery/2026-09-29-center-proof-cycle/PHASE_COCYCLE_4X5_RESULT.md, branch research/nim-control-parity-algebra-20260929.

[74] Connect4 Project. “5x4 Connect-4 phase cocycle experiment checkpoint.” Blob 26a8aa9c8e120d3d6ceccce56ea499c3e288882c. research/isograph/discovery/2026-09-29-center-proof-cycle/PHASE_COCYCLE_5X4_CHECKPOINT.md, branch research/nim-control-parity-algebra-20260929.

---

## Citation

Oshiro, Joshua. *C = NC? Control-Parity Algebra, Branch Collapse, and a Structural Research Program for Generalized Connect Four.* Connect4 / IsoGraph Project research publication, revision 0.13, 2026. Agent-assisted research using the IsoGraph system designed by Joshua Oshiro; core conceptual research direction and findings originated by Joshua Oshiro. CC BY 4.0.
