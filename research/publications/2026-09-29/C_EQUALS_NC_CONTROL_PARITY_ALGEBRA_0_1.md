# C = NC? Control-Parity Algebra, Branch Collapse, and a Structural Research Program for Generalized Connect Four

**Joshua Oshiro**

**Agent-assisted research produced using the IsoGraph system designed by Joshua Oshiro. An AI agent was used in this research, but the AI agent was not responsible for the core findings. The core conceptual findings and research direction were identified by Joshua Oshiro; AI agents assisted in testing, extending, verifying, and documenting them.**

**Connect4 / IsoGraph Project research publication — revision 0.1**

**Local publication date:** 2026-09-29 (America/Los_Angeles)  
**Research branch:** research/nim-control-parity-algebra-20260929  
**Publication status:** research preprint; not peer reviewed  
**License:** CC BY 4.0  
© 2026 Joshua Oshiro.

The original text, analysis, diagrams, and explanatory material in this paper are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0). Referenced source code, repository contents, third-party publications, trademarks, and externally owned materials retain their respective licenses and ownership.

---

## Abstract

Connect Four is usually approached computationally as a search problem over a rapidly branching game tree. This paper reports a different research direction: whether a substantial part of perfect-play structure can be represented by a rule-derived control algebra whose construction may be complicated while its composition and cancellation laws are comparatively simple.

The motivating hypothesis is Nim-like only in a narrow algebraic sense. Connect Four is partizan, gravity-coupled, first-win terminating, and structurally unlike an ordinary disjunctive sum of impartial games. No Sprague-Grundy theorem is assumed. Instead, the hypothesis asks whether geometry, support parity, residual winning obligations, response resources, and first-win deadlines induce a latent control representation whose compatible components admit XOR-like cancellation over GF(2).

Several bounded results support this direction while also sharply limiting it. First, under a restricted rule-derived response policy on the standard 7x6 board, the odd center prefixes 4, 444, and 44444 collapse onto exactly the same set of 2,108 unresolved boundary states despite different literal histories and different distances to the center boundary. Second, the 7x6 single-defect response family yields 20 GF(2) response-pair generators of rank 19 with a unique recovered dependency, while the unmatched center-top event adds an independent dimension. Third, the common 2,108-state boundary has no nonzero degree-1 or degree-2 vanishing polynomial in the declared 12-bit support encoding, exactly two independent cubic identities, and 43 identities by degree four; the cubic identities factor into reflected support-parity gates associated with center-crossing diagonal completion. Fourth, blind width/height perturbation preserves a one-relation/one-unmatched-defect skeleton across every tested safe single-defect family, but post-hoc solved-board comparison shows that this skeleton is not sufficient to determine W/D/L. Fifth, an exhaustive 4x4 control demonstrates that perfect play itself is highly non-unique and repeatedly reconvergent: 56,763 states have multiple optimal moves and 65,507 states are optimal transposition merges.

These results do not establish a polynomial-time perfect-play algorithm, a scalar nimber, a W/D/L XOR formula, or a general theorem for arbitrary board dimensions. They instead identify a concrete research object: a latent control quotient in which literal branches may diverge and later collapse, paired control resources may cancel, unmatched defects may survive, and geometry-dependent guards may mediate algebraic consequences.

The paper also records a methodological finding about IsoGraph. A full Discovery Protocol pass over the represented IsoMax material found valid structure but did not generate the experimental space that exposed the control-algebra phenomena. This motivated a separate proposal in which Discovery Protocol issues an Experimental Warrant and a distinct experimental module constructs and revises an open-world experimental model. The proposal is treated as methodology, not as evidence for the game-theoretic hypothesis.

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

## 11. The latent control-algebra hypothesis

The current evidence motivates, but does not establish, the following program.

### 11.1 Candidate state

Let

$$
X(s)=F(G(s),R(s),P(s),O(s),D(s),\ldots)
$$

be a latent control representation.

The representation should be derivable from rules and geometry without solved W/D/L labels.

### 11.2 Candidate composition

For appropriately independent or guarded components $x_i$, composition may admit a law such as

$$
X = x_1 \oplus x_2 \oplus \cdots \oplus x_m,
$$

or a related finite-group/vector operation.

XOR is a candidate because exact GF(2) cancellation has already appeared in a nontrivial response-incidence space. It is not assumed universally.

### 11.3 Required guards

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

### 11.4 Missing value bridge

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

---

## 12. Relationship to IsoMax

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

## 13. What IsoGraph found, and what it missed

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

### 13.1 Experimental Warrant proposal

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

## 14. Quantifiable Unknown and missing structure

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

## 15. Complexity implications and limits

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

A finite-board closed form is also insufficient for a generalized complexity claim.

The present evidence only says that several structures commonly treated as part of the search tree possess exact algebraic regularities and quotient behavior.

Whether those regularities extend far enough to eliminate ordinary perfect-play search remains open.

---

## 16. Falsifiers and research obligations

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

## 17. Discussion

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

Taken together, these results support a research program rather than a conclusion:

> derive the smallest exact control representation that preserves perfect-play obligations, then determine whether that representation can be constructed and composed substantially more efficiently than the ordinary game tree.

If that program eventually yields a polynomial generalized solution, “C = NC” would be an appropriate joke.

For now the question mark is load-bearing.

---

## 18. Conclusion

This paper reports four exact bounded structural findings and one exact small-board perfect-play audit.

1. Three distinct odd center prefixes on 7x6 collapse to the same 2,108-state unresolved boundary under a fixed rule-derived response policy.
2. The standard single-defect response family has a nontrivial GF(2) cancellation relation, while the unmatched center-top event adds an independent dimension.
3. The unresolved boundary first admits nontrivial vanishing polynomials at degree three; the cubic generators factor into interpretable reflected geometric guards, and degree-four structure separates the entire immediate-win comparison family.
4. Blind dimension perturbation preserves the coarse one-relation/one-defect skeleton across the tested safe families, while known outcomes prove that this skeleton alone is not W/D/L-complete.
5. Exhaustive 4x4 perfect play exhibits extensive optimal branching, reconvergence, and multiple terminal winning-line realizations.

None of these establishes a generalized polynomial solver.

Together they establish that exact Connect Four structure contains nontrivial algebraic cancellation and many-to-one quotient behavior that is invisible if the game is viewed only as a literal move tree.

The main mathematical burden is now clear: construct a rule-derived guarded control object that joins geometry, parity, obligations, resources, and deadlines; prove a stable composition law; and prove that the object is sufficient for exact value.

The main methodological burden is also clearer: a discovery system must sometimes generate the experimental space needed to reveal such an object rather than only search within the space it was initially given.

Both problems remain open.

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

[16] Connect4 Project. “Optimal branch-and-collapse audit — exhaustive 4x4.” Blob 3ab3c0e7bb5fe5f8386c2e623ef9a148f4dde25e; tested head f03d08e9ba6ab941f87b7e815bc1086a2238c832; workflow 36542646831. research/isograph/discovery/2026-09-29-center-proof-cycle/BRANCH_COLLAPSE_RESULT.md.

[17] Connect4 Project. “Nim-like control-parity algebra hypothesis.” Blob 412271eb1d5e2db1e8947bfe49fb32de6d1673c9. research/hypotheses/NIM_LIKE_CONTROL_PARITY_ALGEBRA.md, branch research/nim-control-parity-algebra-20260929.

[18] Connect4 Project. “GSP-004 — Guarded obligation closure.” Blob d8124df0a80aeecc5c3e6b531694a4d0528572c5. research/gameplay-strategy/GSP-004-GUARDED_OBLIGATION_CLOSURE.md, branch research/nim-control-parity-algebra-20260929.

[19] Connect4 Project. “IsoMax post-IA DP 0.8 pass 0.1.” Blob 856773fb1f8b61db815e7a6e10e8cc44cb27bc24. research/isograph/discovery/2026-09-27-isomax-core020-dp-dts/DP_PASS_0_1.md.

[20] Connect4 Project. “IsoMax post-IA DTS 0.1 pass 0.1.” Blob 058ebfffdf0540b58d64f17d48625693f9f01a2c. research/isograph/discovery/2026-09-27-isomax-core020-dp-dts/DTS_PASS_0_1.md.

[21] JSMinSys Project. Pull Request #52, “Promote selected IsoMax six-deep/one-wide implementation.” https://github.com/iteathen/JSMinSys/pull/52.

[22] JSMinSys Project. Pull Request #79, “IsoMax Phase2: integrate local search-derived zero bounds.” https://github.com/iteathen/JSMinSys/pull/79.

[23] JSMinSys Project. Pull Request #119, “Promote qualified IsoMax runtime and selected localhost profile.” https://github.com/iteathen/JSMinSys/pull/119.

[24] Connect4 Project. Pull Request #163, “Refactor IsoMax to JSMinSys Lazy SMP-only execution.” https://github.com/iteathen/Connect4/pull/163.

[25] IsoGraph Project. Issue #60, “Proposal: DP Experimental Warrant + open-world experimental inquiry module.” https://github.com/iteathen/IsoGraph/issues/60.

---

## Citation

Oshiro, Joshua. *C = NC? Control-Parity Algebra, Branch Collapse, and a Structural Research Program for Generalized Connect Four.* Connect4 / IsoGraph Project research publication, revision 0.1, 2026. Agent-assisted research using the IsoGraph system designed by Joshua Oshiro; core conceptual research direction and findings originated by Joshua Oshiro. CC BY 4.0.
