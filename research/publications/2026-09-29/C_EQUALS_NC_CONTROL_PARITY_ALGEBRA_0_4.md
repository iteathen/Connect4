# C = NC? Control-Parity Algebra, Branch Collapse, and a Structural Research Program for Generalized Connect Four

**Joshua Oshiro**

**Agent-assisted research produced using the IsoGraph system designed by Joshua Oshiro. An AI agent was used in this research, but the AI agent was not responsible for the core findings. The core conceptual findings and research direction were identified by Joshua Oshiro; AI agents assisted in testing, extending, verifying, and documenting them.**

**Connect4 / IsoGraph Project research publication — revision 0.4**

**Local publication date:** 2026-09-29 (America/Los_Angeles)  
**Canonical research branch:** research/semantic-quotient  
**Source experimental branch:** research/nim-control-parity-algebra-20260929  
**Publication status:** research preprint; not peer reviewed  
**Revision note:** revision 0.4 incorporates the later constructive binary-tie stabilizer and exact affine canonicalizer, its matched 5x4 negative runtime control, the full 6x4 timeout wall, and exact 6x4 prefix diagnostics through rank 11. Revisions 0.1 through 0.3 remain immutable historical publication evidence.  
**License:** CC BY 4.0  
© 2026 Joshua Oshiro.

The original text, analysis, diagrams, and explanatory material in this paper are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0). Referenced source code, repository contents, third-party publications, trademarks, and externally owned materials retain their respective licenses and ownership.

---

## Abstract

Connect Four is usually approached computationally as a search problem over a rapidly branching game tree. This paper reports a different research direction: whether a substantial part of perfect-play structure can be represented by a rule-derived control algebra whose construction may be complicated while its composition and cancellation laws are comparatively simple.

The motivating hypothesis is Nim-like only in a narrow algebraic sense. Connect Four is partizan, gravity-coupled, first-win terminating, and structurally unlike an ordinary disjunctive sum of impartial games. No Sprague-Grundy theorem is assumed. Instead, the hypothesis asks whether geometry, support parity, residual winning obligations, response resources, and first-win deadlines induce a latent control representation whose compatible components admit XOR-like cancellation over GF(2).

Several bounded results support this direction while also sharply limiting it. First, under a restricted rule-derived response policy on the standard 7x6 board, the odd center prefixes 4, 444, and 44444 collapse onto exactly the same set of 2,108 unresolved boundary states despite different literal histories and different distances to the center boundary. Second, the 7x6 single-defect response family yields 20 GF(2) response-pair generators of rank 19 with a unique recovered dependency, while the unmatched center-top event adds an independent dimension. Third, the common 2,108-state boundary has no nonzero degree-1 or degree-2 vanishing polynomial in the declared 12-bit support encoding, exactly two independent cubic identities, and 43 identities by degree four; the cubic identities factor into reflected support-parity gates associated with center-crossing diagonal completion. Fourth, blind width/height perturbation preserves a one-relation/one-unmatched-defect skeleton across every tested safe single-defect family, but post-hoc solved-board comparison shows that this skeleton is not sufficient to determine W/D/L. Fifth, an exhaustive 4x4 control demonstrates that perfect play itself is highly non-unique and repeatedly reconvergent: 56,763 states have multiple optimal moves and 65,507 states are optimal transposition merges.

Subsequent experiments sharpen the quotient result substantially. On exhaustive 4x4 Connect-4, erasing literal action labels yields 8,242 recursive all-legal classes from 161,029 physical states, while a static residual-q carrier canonicalized under column permutations yields 10,507 orbit states. Every one of those static residual-q orbit signatures lies wholly inside one recursive unlabeled class. A direct producer starting from empty-board geometry and residual antichain transitions reconstructs that quotient without constructing the physical board-state graph. Three exact local realizability rules then reduce the 4x4 structural graph from 10,507 to 9,441 states while preserving all 8,242 recursive classes, directly explaining 1,066 of the original 2,265 static-to-recursive excess states, about 47%. Repeated child-class closure reaches the exact quotient from the rewritten 9,441-state graph in seven rounds, separating the polynomial quotient-minimization problem over an existing graph from the still-open problem of constructing a small graph.

Direct rule-only growth controls extend the structural producer to 4x5, 4x6, 4x7, and 5x4 Connect-4 without physical-board enumeration. The fixed-width 4x4 through 4x7 sequence grows from 9,441 to 102,815 to 693,284 to 3,534,913 direct structural states; the successive growth factors fall but remain fully compatible with exponential asymptotics. A same-area 4x5 versus 5x4 control differs by about 2.82x in structural-state count, strengthening the conclusion that gravity/support orientation is load-bearing.

Column canonicalization has also advanced from a bounded symmetry observation to a constructive guarded result. Exact incidence refinement makes 99.8091% of audited 4x4 nonterminal states canonical without permutation search. In the remaining binary-tie family, residual incidence now constructs the exact stabilizer directly by GF(2) elimination, recovering H_s={(0,0),(1,1)} and x1 xor x2=0 on all 18 audited states without enumerating the 2^m orientation assignments. This construction extends to an exact affine binary-tie canonicalizer whose work is polynomial in the explicit residual representation and number of binary tie classes, while retaining exhaustive fallback for larger tie classes. On 5x4 it reduces exhaustive permutation candidates by 73.27% but is 40.69% slower than the simpler partitioned exact method, a useful negative result separating structural polynomiality from current runtime efficiency.

The next width probe exposes the remaining bottleneck more sharply. A full 6x4 direct-structural run reached the ten-minute workflow wall without producing a completed graph. Exact prefixes show 286,356 cumulative states through rank 10 and 616,710 through rank 11, with the rank-11 frontier alone containing 330,354 structural states. Through rank 10 all unresolved ties are binary; by rank 11 only 16 nonbinary-tie calls appear among 848,710 transition canonicalizations, maximum exact candidate count remains eight, and average residual requirements per state fall by 12.32% while the frontier grows by about 1.97x. The visible width-growth burden is therefore the cardinality of the structural frontier itself, not large permutation search or growing residual-antichain size per state.

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

## 20. Conclusion

Revision 0.4 preserves all prior bounded findings and adds a sharper separation between what has now been structurally solved and what remains the dominant open complexity burden.

The established bounded picture now includes:

1. the common 2,108-state odd-center boundary on standard 7x6 under the declared rule-derived response policy;
2. a nontrivial GF(2) response cancellation relation plus an independent unmatched control event;
3. guarded low-degree Boolean-polynomial identities on the shared boundary;
4. a post-hoc outcome falsifier proving that the first one-relation/one-defect skeleton is not W/D/L-complete;
5. extensive exact optimal branch divergence and reconvergence on exhaustive 4x4;
6. an 8,242-class recursive action-unlabeled quotient of the 161,029-state physical 4x4 graph;
7. a direct residual transition producer that reconstructs that quotient without enumerating physical board states;
8. local realizability and blocker rules that remove 1,066 of 2,265 static excess states, about 47%, before recursive quotienting;
9. finite local branch closure that reaches the exact quotient in seven rounds on the rewritten 4x4 graph;
10. direct rule-only growth through 4x7 and 5x4, with gravity/support orientation strongly affecting structural graph size;
11. exact refinement-partitioned column canonicalization and an exact binary-tie XOR stabilizer theorem.

Revision 0.4 adds three further advances.

First, the binary-tie stabilizer is now **constructive**, not merely existential. Residual-incidence blocks and GF(2) elimination recover the exact stabilizer on all 18 audited 4x4 fallback states without enumerating all binary orientation assignments. Under the guard that every unresolved refinement class has size at most two, exact canonical orientation can likewise be selected by affine GF(2) methods with polynomial work in the explicit residual representation and number of tie pairs.

Second, this structurally cleaner canonicalizer fails an important runtime test. On exact 5x4 it reduces exhaustive fallback permutation candidates by 73.27% but increases wall time by 40.69% relative to the simpler partitioned exact canonicalizer. The result cleanly separates a polynomial guarded representation result from an implementation-performance claim.

Third, the 6x4 width experiments locate the present scale wall. The full direct run reaches the ten-minute workflow limit, but exact prefixes show:

~~~text
through rank 10:
    286,356 cumulative structural states
    167,629 frontier states

through rank 11:
    616,710 cumulative structural states
    330,354 frontier states
~~~

The rank-10-to-11 frontier nearly doubles while average residual requirements per state fall by 12.32%. Maximum exact canonicalization search remains only eight candidates, and only 16 nonbinary tie calls occur among 848,710 rank-10 transition canonicalizations.

The strongest current negative conclusion is therefore:

> the visible 6x4 width wall is dominated by structural frontier cardinality under the present exact closure, not by large permutation search or by growing residual-antichain size per state.

This sharply redirects the research.

The next major mathematical task is not merely to optimize canonicalization. It is to discover additional exact obligation, support-chain, deadline, or branch-transporter equivalences that identify states **before** the structural frontier multiplies.

The XOR program also has a clearer boundary. One exact XOR law is now proved and constructively usable inside the guarded binary orientation-stabilizer layer:

$$
H_s=\ker(A_s),
$$

with the audited family reducing to

$$
x_1\oplus x_2=0.
$$

But literal move-coordinate XOR has already been falsified as a strategic selector, and no XOR law for W/D/L has been established. Any larger algebra must operate on guarded residual/control objects after the appropriate action and realizability quotients.

A generalized structural solution would still require:

1. additional exact pre-branch closures that control structural frontier growth;
2. a compact construction for branch-local action/support transport;
3. exact treatment of nonbinary tie classes;
4. a bound on residual/control graph size in generalized board parameters;
5. integration of control parity, resources, obligations, and first-win deadlines;
6. a proved bridge from the final guarded algebra to exact W/D/L or optimal-action classification.

The paper therefore moves closer to the intended “C = NC?” idea in one important sense: more of the apparent search has become explicit structure, and one XOR component has become a theorem rather than a metaphor.

It also moves farther from premature optimism in another sense: the 6x4 diagnostics expose a concrete structural-growth wall that no current canonicalization improvement removes.

The question mark remains load-bearing.

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

[17] Connect4 Project. “Nim-like control-parity algebra hypothesis.” Blob 412271eb1d5e2db1e8947bfe49fb32de6d1673c9. research/hypotheses/NIM_LIKE_CONTROL_PARITY_ALGEBRA.md, branch research/nim-control-parity-algebra-20260929.

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

---

## Citation

Oshiro, Joshua. *C = NC? Control-Parity Algebra, Branch Collapse, and a Structural Research Program for Generalized Connect Four.* Connect4 / IsoGraph Project research publication, revision 0.4, 2026. Agent-assisted research using the IsoGraph system designed by Joshua Oshiro; core conceptual research direction and findings originated by Joshua Oshiro. CC BY 4.0.
