# IsoMax Late-Stage Algebra — Full IsoGraph Decomposition 0.1

**Status:** research decomposition candidate; no authority effect  
**Date:** 2026-09-30  
**Owner:** research/semantic-quotient; temporary execution on experiment/isomax-late-xor-components-20260929  
**IsoGraph family:** current qualified integrated stack through Core 0.21 + QU 0.1 + NEI 0.4 + Discovery Protocols 0.1–0.10 + DTS 0.1 + Experimental Inquiry 0.1  
**Connect4 semantic authority:** research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md

## Purpose

This artifact decomposes the current late-stage scalar-value candidate to exact structural content, recursively derives implicit assertions to fixed point, separates exact recodings from bounded empirical sufficiency, applies NEI identity discipline, exposes DTS transition obligations, and performs objective-scoped DP minimum-sufficient-support analysis.

It does not promote the late-stage candidate into game-theory authority.

## Frozen provenance

Consumed evidence:

- run-role-aligned-capacity-rel-inc-zoe.mjs blob 3ba17a71d10ac5831193ce91d613a7b46c35b60c
- ROLE_CAPPAR_REL_INC_ZOE_FRESH_6X3K4_0_1.json blob ab30b86b597ff409045fd8212afee0440e5b82b5
- REPAIRED_COORDINATE_CUBIC_DECODER_0_1.json blob 854d7e0d0c081e52bcedcb02491d0dd0b245bb4d
- EW-RS-059 sealed formula-holdout warrant blob 8210dad9a35a076606ea90cc25eb87cf9b164041
- EW-RS-060 warrant blob 2d72c30dc60c4ef983a4d9e8a185e4b22935da84
- REPAIRED_CUBIC_QUOTIENT_TARGET_0_1.json frozen at branch commit 8e3196dd2c4d5b52dbf97b0dff8315425054da33

EW-RS-059 remains sealed. This decomposition does not solve, sample, or inspect W/D/L outcomes for primary 3x6-k4 or backup 5x3-k4.

---

# 1. Objective boundary

The demonstrated target is exact scalar relative W/D/L on declared finite carriers.

Current domain split:

- T2-W: mover has an immediate win.
- T2-L2: every legal move leaves the opponent an immediate win under the frozen direct classifier.
- T2-O: unresolved scalar domain handled by the late-stage algebra.

The current repaired-coordinate evidence is Q-V evidence only.

Not established:

- Q-A exactness;
- Q-F exactness;
- signature-level transition congruence;
- standard-7x6 sufficiency;
- a universal closed-form decoder;
- a center-opening theorem.

This scope distinction is load-bearing.

---

# 2. Source Semantic Census

## 2.1 Physical/event game

For fixed width W, height H, and connect length K:

- gravity orders cells within each column;
- players alternate with no pass;
- a move occupies the frontier cell of one non-full column;
- first completed K-line terminates the game;
- a full non-winning board is draw;
- occupied-cell rank increases by one per nonterminal move.

These remain owned by Connect4 authority 1.2.

## 2.2 Residual requirements

For each player p, take geometric winning lines not blocked by the opponent. For each such line L, form the nonempty residual requirement

\[
R=L\setminus S_p.
\]

Normalize by duplicate removal and strict-superset absorption. The ordinary structural carrier used by the harness is

\[
q=(h,R_0,R_1)
\]

with support heights

\[
h=(h_0,\ldots,h_{W-1}).
\]

## 2.3 Rank-local forgetting

The late-stage harness applies R, F, and G before componentization.

R keeps only residual requirements that remain schedulable in that owner's alternating move slots under current gravity.

F applies the frozen current-frontier absorption rule to the mover's residual family.

G removes the frozen non-final top-cap impossibility family.

The reduced view is

\[
q_{RFG}=G(F(R(q))).
\]

The complete bounded evidence for this reduction is distinct from a general standard-7x6 proof.

## 2.4 T2 tactical boundary

\[
T2(P)\in\{W,L2,O\}.
\]

W and L2 are direct scalar absorbing categories. The repaired component algebra was derived and qualified on T2-O.

---

# 3. Exact Structural Rendering

## 3.1 Residual-incidence components

Build a graph on physical columns after RFG.

Two columns are joined when a surviving residual requirement spans both. Connected components partition the columns.

For each component retain owner-labelled residual requirements internal to that component.

The historical exact component identity retained exact local heights and canonicalized over local column permutations. The repaired scalar candidate is coarser.

## 3.2 REL_INC

For local column c with frontier height h_c, a represented residual cell at absolute row r has relative depth

\[
d=r-h_c,\qquad d\ge 0.
\]

REL_INC retains:

- component width;
- owner-labelled residual incidence;
- canonical local column roles;
- exact relative depth d.

Absolute column identity and exact local height are omitted.

## 3.3 Role-attached phase

The repaired identity attaches to each local role the bit

\[
\kappa_c=(H-h_c)\bmod2.
\]

The bit participates in the same column-permutation canonicalization as residual incidence.

Thus the current structural identity is

\[
D(C)=\operatorname{canon}\left(
REL\_INC(C),
\{(\operatorname{role}_c,\kappa_c)\}_{c\in C}
\right).
\]

## 3.4 Descriptor multiplicity

For each structural identity d,

\[
n_d(P)=\#\{C:D(C)=d\}.
\]

## 3.5 ZOE count state

Define

\[
z(n)=
\begin{cases}
Z,&n=0,\\
E,&n>0\text{ and even},\\
O,&n\text{ odd}.
\end{cases}
\]

The repaired scalar signature is the finite-support map

\[
S(P):d\mapsto z(n_d(P)).
\]

No explicit rank grade is present.

---

# 4. Recursive Implicit Assertions

## Round 1 — phase recoding

### IA-01: capacity parity is frontier-height phase

For fixed H,

\[
\kappa_c=(H-h_c)\bmod2
=(H\bmod2)\oplus(h_c\bmod2).
\]

Therefore \(\kappa_c\) and \(h_c\bmod2\) are exactly interconvertible given H.

Disposition: deductive exact within the frozen representation.

For standard 7x6, H=6 is even, hence

\[
\boxed{\kappa_c=h_c\bmod2.}
\]

The current name "capacity parity" therefore hides a simpler semantic role: it is a vertical frontier phase attached to an incidence role.

### IA-02: role phase anchors relative depth to absolute row parity

Since

\[
r=h_c+d,
\]

\[
r\bmod2
=(h_c\bmod2)\oplus(d\bmod2)
=(H\bmod2)\oplus\kappa_c\oplus(d\bmod2).
\]

Thus REL_INC plus role phase carries an absolute vertical parity anchor for every represented residual cell.

An exact semantic recoding is therefore:

\[
\boxed{
ROLE\_CAPPAR\_REL\_INC
\equiv
\text{phase-anchored relative incidence}.
}
\]

This is a recoding statement, not a new Q-V sufficiency claim.

### IA-03: move-gauge invariant

A move in column c gives

\[
h_c\mapsto h_c+1,
\qquad
\kappa_c\mapsto\kappa_c\oplus1.
\]

For a residual cell that survives at the same absolute row,

\[
d\mapsto d-1.
\]

Therefore \(d\bmod2\) and \(\kappa_c\) both toggle and

\[
\kappa_c\oplus(d\bmod2)
\]

is invariant.

The recovered absolute row parity is therefore invariant for surviving cells.

This is a DTS-relevant exact invariant.

---

## Round 2 — native ZOE algebra

### IA-04: ZOE is an additive quotient monoid

Encode count n by

\[
p(n)=[n>0],\qquad o(n)=n\bmod2.
\]

Then

\[
Z=(0,0),\quad E=(1,0),\quad O=(1,1),
\]

with constraint

\[
o\Rightarrow p.
\]

For counts m,n,

\[
p(m+n)=p(m)\lor p(n),
\]

\[
o(m+n)=o(m)\oplus o(n).
\]

Therefore the native composition is

\[
\boxed{
(p,o)\star(p',o')=(p\lor p',\,o\oplus o').
}
\]

Composition table:

| star | Z | E | O |
|---|---:|---:|---:|
| Z | Z | E | O |
| E | E | E | O |
| O | O | O | E |

Properties:

- associative;
- commutative;
- identity Z;
- E star E = E;
- O star O = E;
- E star O = O.

Disposition: deductive exact.

This is not a group. Positive-even presence does not cancel to absence.

### IA-05: XOR is lawful late, but is not the whole count state

Oddness composes by XOR:

\[
o_{\rm total}=\bigoplus_i o_i.
\]

Presence simultaneously composes by OR:

\[
p_{\rm total}=\bigvee_i p_i.
\]

Therefore XOR appears after structural identity normalization and multiplicity aggregation, but it is not the complete count algebra and is not established as the final W/D/L operation.

This is the precise normalization boundary at which XOR is currently justified.

### IA-06: ZOE is the coarsest quotient preserving zero and parity

Define count equivalence n ~ m iff:

- n=m=0; or
- n,m are positive and have equal parity.

This is a congruence under count addition.

Its quotient classes are exactly Z,E,O.

Any count quotient required to preserve both the zero predicate and parity must refine or equal ZOE.

Disposition: deductive exact relative to those required observables.

This does not prove that zero and parity are universally the only value-relevant count observables.

---

## Round 3 — rank/turn phase

### IA-07: rank parity is reconstructible from repaired state

Because

\[
h_c\bmod2=(H\bmod2)\oplus\kappa_c,
\]

\[
\operatorname{rank}(P)\bmod2
=
(WH\bmod2)\oplus\bigoplus_c\kappa_c.
\]

For descriptor d define its internal role-phase checksum

\[
K_d=\bigoplus_{c\in d}\kappa_c.
\]

If d occurs n_d times, its contribution to the global XOR is

\[
(n_d\bmod2)K_d.
\]

ZOE retains n_d mod 2 exactly through O versus Z/E.

Therefore

\[
\boxed{
\operatorname{rank}(P)\bmod2
=
(WH\bmod2)
\oplus
\bigoplus_{d:z(n_d)=O}K_d.
}
\]

Disposition: deductive exact from the repaired-coordinate definitions.

Consequences:

- side-to-move parity is derivable;
- a separate rank-parity coordinate is redundant;
- the empirical success of an ungraded repaired coordinate has a structural explanation at the parity level.

For standard 7x6, WH=42 is even:

\[
\boxed{
\operatorname{rank}(P)\bmod2
=
\bigoplus_{d:O}K_d.
}
\]

### IA-08: exact rank is not recovered

No derivation above recovers exact rank, rank mod 3, remaining-cell count, or arbitrary scheduler state.

No stronger rank claim is admitted.

---

## Round 4 — binary P/O absorption

For each descriptor d,

\[
P_d=[n_d>0],
\qquad
O_d=n_d\bmod2.
\]

Odd implies present:

\[
O_d\Rightarrow P_d.
\]

Therefore over Boolean arithmetic,

\[
\boxed{P_dO_d=O_d.}
\]

Any monomial containing both P_d and O_d reduces by absorption.

Examples:

\[
P_dO_dX=O_dX,
\]

\[
P_dO_dP_eO_e=O_dO_e.
\]

Disposition: deductive exact.

The generic GF(2) catalogs are therefore not primitive semantic catalogs even when rank elimination removes dependent columns mechanically.

---

## Round 5 — polynomial degree is representation-dependent

The native presence operation is OR.

Over GF(2),

\[
a\lor b=a\oplus b\oplus ab.
\]

Larger OR expressions expand to higher algebraic-normal-form degree.

Therefore a cubic GF(2) realization can reflect flattening of native presence logic rather than a fundamental three-body game law.

The bounded statement

\[
\text{complete DEGREE3 P/O decoding is exact}
\]

does not imply

\[
\text{Connect Four is intrinsically cubic}.
\]

Disposition: exact representation warning plus bounded empirical decoder evidence.

---

## Round 6 — corrected interpretation of decoder target dimension

Relative to the affine span, EW-RS-057 found both encoded outcome columns independently outside that span on the tested carriers.

That gives joint target dimension 2 relative to affine.

Because the scalar output itself has only two binary columns, this does not prove that exactly two unique structural syndrome generators exist.

EW-RS-060 gives the sharper result relative to the complete degree-2 span:

| carrier | cubic quotient dimension | y0 gain beyond degree2 | y1 gain beyond degree2 | joint target dimension |
|---|---:|---:|---:|---:|
| 6x3-k3 | 75 | 0 | 1 | 1 |
| 4x5-k4 | 371 | 1 | 1 | 2 |
| 6x3-k4 | 16 | 1 | 1 | 2 |

Thus:

- on 6x3-k3, only one output direction still requires cubic information after complete degree 2;
- on 4x5-k4 and 6x3-k4, both output directions remain independent of degree 2;
- the existence of two output bits remains distinct from the number or identity of structural syndrome generators.

### Discovery clue from the outcome-independent cubic quotient

The deterministic quotient basis has these motif kinds:

- 6x3-k3: 75 OOO, 0 other kinds;
- 6x3-k4: 16 OOO, 0 other kinds;
- 4x5-k4: 294 OOO + 77 OOP.

Every retained basis triple uses three distinct descriptor identities.

This is outcome-independent basis evidence but basis identities remain gauge-dependent. The motif histogram is a discovery clue, not a promoted invariant.

The clue is nevertheless strong: the residual cubic space is dominated by oddness interactions, with presence entering only in the 4x5-k4 quotient basis.

---

## IA fixed point

Reapplying the admitted implications yields no further exact coordinate eliminations without adding an unresolved assumption.

Current fixed point:

\[
\boxed{
\text{phase-anchored REL\_INC identity}
+
\text{native ZOE count monoid}
}
\]

with:

- rank parity derivable;
- explicit rank grade unnecessary at parity level;
- P/O encoding non-primitive;
- generic GF(2) degree non-invariant;
- exact relative-depth magnitude unresolved;
- T2 necessity unresolved;
- closed scalar decoder unresolved.

---

# 5. NEI identity discipline

## 5.1 Exact representation identity

These are exact recodings for the appropriate query:

1. kappa_c and frontier-height parity given H.
2. ternary ZOE and constrained binary (P,O).
3. ROLE_CAPPAR_REL_INC and REL_INC plus role-attached frontier phase.

These may be treated as SAME for representation-content questions.

## 5.2 Bounded scalar-value equivalence only

The tested evidence supports, under declared finite scopes,

\[
S(P)=S(Q)\Rightarrow V(P)=V(Q)
\]

inside the frozen T2-O domains.

This is Q-V equivalence evidence.

It is not:

- physical-board identity;
- move-history identity;
- future-behavior identity;
- action identity;
- proof identity;
- standard-7x6 identity.

## 5.3 Exact component identity versus repaired identity

Exact component identity is finer than phase-anchored REL_INC.

The repaired identity passes the declared derivation carriers and a predeclared fresh non-affine 6x3-k4 carrier.

This supports a scalar quotient candidate only.

## 5.4 Count identity

1 and 3 are not arithmetically identical; both map to O.

2 and 4 are not arithmetically identical; both map to E.

ZOE identity is therefore query-scoped quotient identity.

---

# 6. DTS transition anatomy

## 6.1 Physical move

A move in column c increments h_c and may:

- terminate by winning;
- cofactor mover residuals;
- delete blocked opponent residuals;
- trigger antichain absorption;
- change R feasibility;
- change F/G forgetting;
- change incidence connectivity;
- split, remove, reclassify, or apparently create projected components.

## 6.2 Phase move

\[
\kappa_c\mapsto\kappa_c\oplus1.
\]

For surviving cells at fixed absolute row,

\[
d\mapsto d-1.
\]

Their anchored parity remains invariant.

## 6.3 Projection warning

At full q_o residual level, moves cofactor or delete represented residual obligations.

At the RFG projection, an obligation omitted at one rank may become visible at a later rank when rank/support conditions change, because R/F/G are re-evaluated from fuller state.

Therefore the RFG component graph must not be assumed to evolve only by deletion or splitting.

Projected component appearance, disappearance, split, apparent merge, or reclassification can occur.

## 6.4 Current DTS QU

No exact law is established of the form

\[
S(P),a\mapsto S(P_a)
\]

using only the repaired scalar signature.

Therefore:

\[
Q\text{-V exact}\not\Rightarrow Q\text{-A exact}\not\Rightarrow Q\text{-F exact}.
\]

A direct scalar evaluator may exist even if S is not a Markov transition state.

---

# 7. DP Minimum Sufficient Support

Objective: exact relative W/D/L on declared bounded T2-O domains.

| support | disposition | evidence/reason |
|---|---|---|
| exact component multiplicity | nonessential in tested scopes | ZOE passes |
| multiplicity mod 2 alone | insufficient | parity collisions on 4x5-k4 and 5x4-k4 |
| presence alone | insufficient on multiple carriers | frozen collisions |
| multiplicity mod 3 alone | insufficient on 4x5-k4 without exact rank | frozen M3 collisions |
| ZOE | sufficient on completed exact-type tests including fresh non-affine 5x4-k4 | bounded |
| exact component identity | substitutable in repaired-coordinate scopes | role-phase REL_INC passes |
| REL_INC alone after ZOE aggregation | insufficient | mixed scalar classes |
| total capacity + REL_INC | insufficient on 4x4/4x5 | frozen collisions |
| unordered capacity profile + REL_INC | insufficient on 4x4/4x5 | frozen collisions |
| role-aligned exact capacity + REL_INC | sufficient control in tested scopes | bounded |
| role-aligned three-state capacity + REL_INC | sufficient but finer than parity candidate | bounded |
| role-aligned capacity parity + REL_INC | coarsest passing declared role-capacity candidate; fresh 6x3-k4 pass | bounded |
| explicit rank parity | nonessential | deductively reconstructible |
| exact rank | not part of repaired signature; no universal nonessentiality claim | scope limited |
| exact relative-depth magnitude | unresolved | not removed after role phase repair |
| owner-labelled residual separation | unresolved | not removed |
| T2 boundary | unresolved as semantic support | current algebra derived on T2-O |
| binary P/O encoding | nonsemantic realization | exact ZOE recoding |
| polynomial pair/triple features | decoder realization, not primitive support | encoding-dependent |
| W/D/L code 00/01/10 | gauge choice | not semantic |

## Current justified candidate

No global minimum has been established.

The strongest compact candidate is

\[
\boxed{
\text{phase-anchored REL\_INC}
+
\text{ZOE}.
}
\]

Under a cost profile preferring fewer coordinates, no exact count magnitude, no explicit rank grade, and native operations before polynomial expansion, this carrier is preferred to the generic cubic P/O realization.

That is a DP valuation result, not a global-minimum theorem.

---

# 8. Decoder decomposition

## 8.1 Established bounded decoder facts

Complete observed square-free degree-3 GF(2) decoding is exact on the demanding repaired-coordinate carriers:

- 6x3-k3;
- 4x5-k4;
- 6x3-k4.

EW-RS-060 reduces the cubic space outcome-independently modulo complete degree 2 to dimensions:

- 75;
- 371;
- 16.

The reduced bases remain exact.

## 8.2 What is not established

Cubic success does not establish:

- intrinsic cubic game interaction;
- a unique polynomial;
- a minimal polynomial;
- a standard-7x6 formula;
- a transition law;
- a center-opening proof.

## 8.3 Native algebra before degree escalation

The count carrier is

\[
\mathcal M=\{Z,E,O\}
\]

with native OR/XOR composition.

Future decoder discovery should preserve this algebra directly and enforce the P/O absorption law before interpreting polynomial motifs.

The polynomial decoder is an existence witness and diagnostic basis, not the presumed final law.

---

# 9. Simplified current candidate

For legal P:

\[
P\to q_o(P)\to RFG(P)\to T2(P).
\]

If T2(P)=W, return mover win.

If T2(P)=L2, return mover loss.

Otherwise:

1. decompose surviving residual incidence into components;
2. canonicalize each as a phase-anchored relative-incidence type d;
3. aggregate count n_d;
4. map n_d to Z/E/O;
5. evaluate the finite-support map

\[
S(P)=\{d\mapsto z(n_d)\}.
\]

The evaluator has abstract form

\[
\boxed{
V(P)=
\begin{cases}
W,&T2(P)=W,\\
L,&T2(P)=L2,\\
\Phi(S(P)),&T2(P)=O.
\end{cases}
}
\]

The historical experimental machinery has therefore collapsed to:

A. residual normalization;

B. phase-anchored residual-incidence identity;

C. zero-aware parity count algebra;

D. scalar decoder.

---

# 10. QU ledger

## QU-LATE-01 — standard-7x6 sufficiency

Known: repaired signature is Q-V exact on all completed declared repaired-coordinate carriers including fresh non-affine 6x3-k4.

Open: standard 7x6.

## QU-LATE-02 — exact-depth necessity

Known: REL_INC retains exact relative depth.

Open: whether exact d can be reduced after role phase anchoring.

Candidate ladder for later warranted tests:

- exact d;
- frontier versus positive odd versus positive even;
- frontier flag plus d parity;
- weaker order/phase summaries.

No candidate is promoted here.

## QU-LATE-03 — T2 necessity

Known: T2 provides exact direct W/L2 boundaries and algebra was derived on T2-O.

Open: whether the repaired signature alone is scalar-pure across all nonterminal states, making T2 an execution shortcut rather than semantic coordinate.

## QU-LATE-04 — native decoder

Known: generic cubic P/O decoder exists in bounded discovery carriers.

Open: compact law over native ZOE plus phase-anchored structure.

## QU-LATE-05 — transition closure

Known: scalar purity does not establish action/future-state congruence.

Open: signature-level DTS law, if any.

## QU-LATE-06 — descriptor theorem

Known: bounded repaired descriptor substitution passes.

Open: general structural proof that exact component identity may be replaced for scalar value.

## QU-LATE-07 — CPC/control-parity bridge

The role-attached vertical phase is structurally suggestive of established event-control parity.

Open: exact theorem connecting them.

No authority edge is added.

## QU-LATE-08 — center-opening explanation

Open: after a standard-7x6 decoder exists, derive why the center opening occupies a structurally favorable class rather than merely citing solved-oracle output.

---

# 11. Recommended next discovery sequence

EW-RS-059 holdouts remain sealed.

## 11.1 Interpret EW-RS-060 structurally

Use the outcome-independent quotient dimensions and motif classes, not gauge-dependent basis coefficients, to search for a smaller native structural law.

The dominance of OOO motifs is a discovery clue.

## 11.2 Native-ZOE decoder reduction

Search directly over ternary Z/E/O descriptor states.

Enforce:

\[
O_d\Rightarrow P_d,
\qquad
P_dO_d=O_d.
\]

Prefer monoid/logical expressions over unconstrained polynomial expansion.

## 11.3 Phase-aware depth reduction

Test whether exact d can be replaced by progressively coarser depth labels while retaining the role phase.

This is the highest-value remaining structural MSS question.

## 11.4 T2 removal test

On already-open discovery carriers only, test scalar purity of the repaired signature across all nonterminal states without including W/L2/O in the key.

## 11.5 DTS transition test

Separately test whether equal repaired signatures admit corresponding signature-level transitions.

Do not infer this from Q-V.

## 11.6 Formula freeze, then holdout

Only after a closed candidate Phi is frozen may EW-RS-059 PRIMARY 3x6-k4 be unsealed.

---

# 12. Standard 7x6 specialization

For W=7, H=6, K=4:

\[
\kappa_c=h_c\bmod2,
\]

and

\[
\operatorname{rank}(P)\bmod2
=
\bigoplus_{d:z(n_d)=O}K_d.
\]

Thus the candidate does not require an independent side-to-move parity bit.

If the same structural carrier and a frozen decoder survive standard 7x6, the opening question becomes:

\[
\text{empty}
\xrightarrow{\text{opening column}}
S(P_c)
\xrightarrow{\Phi}
V(P_c).
\]

A center-opening proof would require an exact structural argument showing why the center-opening signature has the favorable value and why the competing opening signatures do not.

That proof does not yet exist.

---

# 13. Final decomposition

The current messy late-stage representation reduces to:

\[
\boxed{\textbf{Residual normalization}}
\]

followed by

\[
\boxed{\textbf{Phase-anchored residual incidence}}
\]

followed by

\[
\boxed{\textbf{Zero-aware parity counts}}
\]

with exact native count composition

\[
\boxed{(\mathrm{OR},\mathrm{XOR})}
\]

followed by

\[
\boxed{\textbf{an unresolved compact scalar decoder}}.
\]

T2 currently provides direct absorbing tactical boundaries around the unresolved domain.

The current cubic GF(2) construction is best treated as evidence that the information is present, not as the semantic endpoint.

The principal remaining question is:

\[
\boxed{
\text{What is the smallest lawful }\Phi
\text{ over phase-anchored residual incidence + ZOE?}
}
\]


---

# 14. Post-decomposition evidence — EW-RS-061 oddness-only cubic

A concurrent discovery-corpus experiment completed after the first decomposition checkpoint.

EW-RS-061 tested the restricted decoder family:

\[
\text{complete affine P/O}
+
\text{complete degree-2 P/O}
+
\text{all mechanically generated OOO triples only}.
\]

Every cubic monomial containing a presence bit P was removed.

Results:

| carrier | full cubic catalog | OOO-only cubic catalog | OOO rank gain over degree 2 | contradictions |
|---|---:|---:|---:|---:|
| 6x3-k3 | 64,991 | 1,753 | 75 | 0 |
| 4x5-k4 | 263,021 | 7,485 | 294 | 0 |
| 6x3-k4 | 52,467 | 501 | 16 | 0 |

This is particularly informative on 4x5-k4.

EW-RS-060 found an outcome-independent cubic quotient of dimension 371 whose deterministic basis contained:

- 294 OOO directions;
- 77 OOP directions.

EW-RS-061 shows that retaining the complete lower-degree P/O span plus all OOO triples is already scalar-exact. The 77 presence-containing cubic quotient directions are therefore not required for scalar decoding on that carrier, even though they are genuine structural directions modulo degree 2 in the broader feature space.

Disposition:

- **bounded discovery-corpus evidence:** cubic scalar correction can be restricted to oddness-only triple interactions on all three hard carriers;
- **not independent qualification:** the hypothesis was motivated by EW-RS-060;
- **not a final formula:** all observed OOO triples are still admitted mechanically;
- **holdouts remain sealed:** EW-RS-059 is untouched.

## IA/DP consequence

This does not alter the exact IA fixed point, because it is empirical decoder evidence rather than a deductive identity.

It does sharpen the discovery frontier:

\[
\boxed{
\text{presence information is needed in lower-degree structure, but the observed cubic scalar correction needs only oddness bits.}
}
\]

That is strongly aligned with the native decomposition:

\[
ZOE=(\text{presence by OR},\text{oddness by XOR}).
\]

The highest-degree correction seen so far lies entirely in the XOR/oddness coordinate.

The next warranted structural question is no longer whether OOP cubic terms are needed. On the current discovery corpus they are not.

The next question is:

\[
\boxed{
\text{What structural rule selects or composes the required OOO oddness interactions?}
}
\]

Any such rule must be frozen before the EW-RS-059 primary formula holdout is unsealed.
