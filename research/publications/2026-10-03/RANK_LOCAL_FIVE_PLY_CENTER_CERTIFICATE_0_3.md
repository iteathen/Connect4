# Rank-Local Landing Certificates for the First Five Plies of Standard Connect Four

**Joshua Oshiro**

**Agent-assisted research produced within the Connect4 / IsoGraph research program designed and directed by Joshua Oshiro. The core research direction, structural target, and interpretation were supplied by Joshua Oshiro; OpenAI ChatGPT assisted with formalization, implementation, qualification, auditing, and documentation.**

**Connect4 / IsoGraph Project research publication — revision 0.3**

**Local publication date:** 2026-10-03 (America/Los_Angeles)  
**Canonical research branch:** research/semantic-quotient  
**Source research branch:** research/universal-structural-policy-20260930  
**Source implementation repository:** iteathen/JSMinSys  
**Publication status:** formal project research preprint; not peer reviewed  
**Revision note:** revision 0.3 states the dependency-audit purpose explicitly and makes the five-ply scope boundary quotable. Revision 0.2 added development-history disclosure, an explicit LLM-contamination limitation, a significance comparison against plain line incidence, notation definitions, self-play framing, and corrections to the move-six headroom description. Revisions 0.1 and 0.2 remain immutable historical publication evidence.  
**License:** CC BY 4.0  
© 2026 Joshua Oshiro.

The original text, analysis, tables, and explanatory material in this paper are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0). Referenced source code, repository contents, third-party materials, trademarks, and externally owned materials retain their respective licenses and ownership.

---

## Abstract

This paper publishes a constructive rank-local certificate for the first five plies of standard 7x6 Connect Four. The certificate uses only the current physical position, the fixed winning-line geometry, gravity, legal landing cells, ownership, and a three-coordinate measurement attached to each current legal landing. It does not enumerate descendants, invoke recursive search, query an opening book, consume solved W/D/L values, or project a future line.

For each legal landing \(c\), define \(A(P,c)\) as the number of mover-live winning lines through the landing, \(B(P,c)\) as the number of opponent-live winning lines denied by occupying the landing, and \(H(P,c)\) as the number of empty cells remaining above the landing in the same column. Candidate moves are ordered by Pareto dominance on \((A,B)\). A move is certified when exactly one legal landing is Pareto-maximal and that maximum has \(H>0\).

On the empty standard board and after each of the prefixes \(4\), \(44\), \(444\), and \(4444\), column 4 is the unique Pareto maximum and has positive headroom. Repeated application therefore yields the five-ply prefix

\[
\boxed{44444}.
\]

The corresponding center triples are

\[
(7,7,5),\quad (9,10,4),\quad (11,12,3),\quad (10,11,2),\quad (8,8,1).
\]

After \(44444\), center remains the unique incidence maximum at \((6,6,0)\), but headroom is exhausted. The same rule therefore refuses to certify move six, returning an explicit unresolved boundary rather than silently selecting a runner-up. This boundary localized the next structural research problem to turn six.

The result is a formal theorem about the declared rank-local certificate and the five-ply self-play prefix. It is not promoted here as a universal theorem that the same certificate condition proves perfect play at every legal Connect Four position. The development process was not oracle-blind: earlier move-finder work in the same research program was explicitly oracle-informed, and the desired first-five center behavior was frozen in a red test before the final implementation. The runtime certificate and its qualification do not consume an oracle or solved values, but the design cannot be claimed independent of prior knowledge of Connect Four best-play structure.

---

## 1. Research question

Connect Four is normally treated as a game-tree problem. The first question in this research line was narrower:

> Can the earliest moves be derived directly from current rank-local structure, before search starts, without encoding an opening table or using solved values?

A useful certificate had to satisfy several constraints.

1. It had to be computed from the actual current position rather than from an expected opening sequence.
2. It had to be rule- and geometry-derived.
3. It could not consume solved W/D/L labels, prior best-move labels, an opening book, or a table of known prefixes.
4. It could not disguise search as bounded projection.
5. It had to expose enough intermediate information that every elimination could be reproduced.
6. It had to refuse when its own sufficient condition ceased to hold.

The resulting construction is deliberately small.

For dependency-audit purposes, the central conclusion is narrower than a discovery claim:

> **Plies 1–5 of this opening line can be produced from current rule/geometry state without reading solved-game knowledge.**

Here “dependence” refers to runtime and proof inputs: the certificate used for these five moves reads no opening book, solved W/D/L value, solver output, or prior best-move label. This statement does not erase the development-history disclosures below; it identifies the dependency boundary being audited.

### 1.1 Development-history disclosure

The theorem below is about the behavior of a fully specified rule. It is **not** presented as a blind discovery of that rule.

The broader move-finder research program already had access to solved-game context, and earlier candidate policies on the source research branch were explicitly oracle-informed. In particular, `universal-structural-policy-v4.mjs`, committed on 2026-10-01 at `8957240debc2f6b4b7216aa4e4ea34ca012e3807`, identifies itself as an “ORACLE-INFORMED candidate v4.” That candidate did not consume oracle values at runtime, but oracle comparison participated in the surrounding design process.

The later JSMinSys rank-local implementation was developed test-first. Commit `c1a5603fc449316f6ad913ac5606a9703c0ce62f`, preceding the implementation commit, fixed the desired outputs for the prefixes `ε`, `4`, `44`, `444`, and `4444`, and fixed the refusal boundary at `44444`. The implementation was then added at `cd82ed47c8df0cc5d119182d5d324c825d88f2fd`.

Accordingly, this paper does **not** claim that the particular choice of live-line counts, two-coordinate Pareto dominance, uniqueness, and the headroom guard arose without exposure to known or solver-checked Connect Four behavior. Researcher degrees of freedom are real here.

What is narrower and auditable is the following:

- the final runtime rule contains no opening-prefix lookup;
- the final runtime rule calls no solver, oracle, other move-finder, or recursive search;
- the qualification workflow for the rank-local module runs its local tests and catalog verification without fetching or invoking an opening book or external solver;
- the theorem tables follow directly from the stated geometry and can be independently recomputed;
- the rule refuses at its declared boundary rather than being extended ad hoc to force a sixth answer.

Thus “no smuggled knowledge” should be read as a **runtime and proof-input statement**, not as a claim of historically blind rule discovery.

### 1.2 LLM-contamination limitation

OpenAI ChatGPT assisted with formalization and implementation. A general-purpose language model may have been exposed during training to Connect Four literature and to the well-known fact that center is the standard opening. It is therefore not possible to rule out indirect model-prior influence on which structural quantities were proposed or favored.

The paper makes no claim of LLM-blind discovery. The available mitigations are transparency rather than denial: Joshua Oshiro supplied and directed the rank-local, rule-only, no-search research target; the full formula is published; the complete tables are published; the commit chronology is preserved; the implementation is executable; and the result can be reproduced from the 69 board lines without access to the model that assisted in its construction. A clean-room implementation by an independent researcher remains the strongest external check on this issue.

---

## 2. Standard-board definitions

Let the standard Connect Four board have seven columns and six rows. Columns are numbered \(1,\dots,7\), with column 4 the center. Rows are counted upward from the bottom. A legal move occupies the lowest empty cell in its chosen column.

Let \(\mathcal L\) be the set of all length-four winning lines on the 7x6 board. There are exactly

\[
|\mathcal L|=69
\]

horizontal, vertical, and diagonal winning lines.

For a nonterminal current position \(P\), let \(S_0(P)\) and \(S_1(P)\) be the sets of cells occupied by players 0 and 1. Let \(m\in\{0,1\}\) be the player to move, let \(\bar m=1-m\) be the opponent, and abbreviate \(S_m=S_m(P)\) and \(S_{\bar m}=S_{\bar m}(P)\).

The **rank** of \(P\) is the number of accepted moves already played:

\[
\operatorname{rank}(P)=|S_0(P)|+|S_1(P)|.
\]

Thus “rank-local” means that the certificate is evaluated from the present rank-\(r\) position and its current legal landings; it does not enumerate descendants at ranks \(r+1,r+2,\ldots\).

For every legal column \(c\), let

\[
\ell(P,c)
\]

be the current gravity landing cell in that column.

A winning line \(L\in\mathcal L\) is **mover-live** when it contains no token owned by \(\bar m\). It is **opponent-live** when it contains no token owned by \(m\).

---

## 3. The rank-local landing coordinates

For each legal landing \(c\), define three integers.

### Definition 1 — mover-live incidence

\[
A(P,c)=
\left|
\left\{
L\in\mathcal L:
\ell(P,c)\in L
\ \land\
L\cap S_{\bar m}=\varnothing
\right\}
\right|.
\]

Thus \(A(P,c)\) counts the still-live winning lines of the mover that pass through the cell occupied by playing \(c\).

### Definition 2 — opponent-denial incidence

\[
B(P,c)=
\left|
\left\{
L\in\mathcal L:
\ell(P,c)\in L
\ \land\
L\cap S_m=\varnothing
\right\}
\right|.
\]

Every such line is live for the opponent before the move and is denied by the mover occupying the landing.

### Definition 3 — column headroom

If the landing row is \(r(P,c)\), numbered from \(0\) at the bottom, define

\[
H(P,c)=5-r(P,c).
\]

This is exactly the number of cells remaining above the candidate landing after that landing is occupied.

The first two coordinates measure present winning-line incidence only. The third is a support/resource guard.

---

## 4. Pareto rule and certificate

For legal candidates \(a\) and \(b\), say that \(b\) **dominates** \(a\) when

\[
A(P,b)\ge A(P,a),
\]

\[
B(P,b)\ge B(P,a),
\]

and at least one inequality is strict.

Let \(M(P)\) be the set of undominated legal landings.

### Definition 4 — rank-local certificate

The position \(P\) has a rank-local certified move when

\[
|M(P)|=1
\]

and, for the unique \(c^\*\in M(P)\),

\[
H(P,c^\*)>0.
\]

The certified move is then \(c^\*\).

If the Pareto maximum is non-unique, the certificate returns unresolved. If the unique maximum has zero headroom, the certificate also returns unresolved. In particular, the algorithm does **not** discard an exhausted maximum and choose a weaker runner-up.

---

## 5. Main theorem

### Theorem 1 — five-ply center certificate under certificate self-play

Let \(P_s\) denote the standard 7x6 Connect Four position reached by legal move prefix \(s\). Define **certificate self-play** to mean that, at each successive ply, whichever player is to move applies the same rank-local certificate to the actual current position and plays its certified move when one exists.

For

\[
s\in\{\epsilon,4,44,444,4444\},
\]

column 4 is the unique Pareto maximum under \((A,B)\), and its headroom is positive.

Therefore the first five plies of certificate self-play from the empty board produce

\[
\boxed{44444}.
\]

At \(P_{44444}\), column 4 remains the unique Pareto maximum under \((A,B)\), but

\[
H(P_{44444},4)=0,
\]

so the certificate returns unresolved on move six.

### Proof

The proof is a finite direct count over the fixed set of 69 winning lines. The complete candidate triples are listed below. In every table through prefix \(4444\), the center candidate has both \(A\) and \(B\) at least as large as every other candidate, with at least one strict inequality against every other column. Hence, at each of the five certified positions, column 4 Pareto-dominates **every** non-center legal landing. The center is therefore the unique Pareto maximum. Its listed headroom is strictly positive.

The certificate consequently returns column 4 at each of the five successive positions. Concatenating those certified moves gives \(44444\).

After prefix \(44444\), center again Pareto-dominates every non-center candidate in \((A,B)\), but its headroom is zero. By Definition 4 the certificate must refuse. ∎

---

## 6. Complete certificate tables

These tables are sufficient to reproduce the five-ply theorem independently of the implementation.

### 6.1 Empty board

| column | \(A\) | \(B\) | \(H\) |
|---:|---:|---:|---:|
| 1 | 3 | 3 | 5 |
| 2 | 4 | 4 | 5 |
| 3 | 5 | 5 | 5 |
| **4** | **7** | **7** | **5** |
| 5 | 5 | 5 | 5 |
| 6 | 4 | 4 | 5 |
| 7 | 3 | 3 | 5 |

Thus \(M(P_\epsilon)=\{4\}\), with \(H=5>0\).

### 6.2 After \(4\)

| column | \(A\) | \(B\) | \(H\) |
|---:|---:|---:|---:|
| 1 | 2 | 3 | 5 |
| 2 | 2 | 4 | 5 |
| 3 | 2 | 5 | 5 |
| **4** | **9** | **10** | **4** |
| 5 | 2 | 5 | 5 |
| 6 | 2 | 4 | 5 |
| 7 | 2 | 3 | 5 |

Thus \(M(P_4)=\{4\}\), with \(H=4>0\).

### 6.3 After \(44\)

| column | \(A\) | \(B\) | \(H\) |
|---:|---:|---:|---:|
| 1 | 3 | 2 | 5 |
| 2 | 4 | 2 | 5 |
| 3 | 4 | 2 | 5 |
| **4** | **11** | **12** | **3** |
| 5 | 4 | 2 | 5 |
| 6 | 4 | 2 | 5 |
| 7 | 3 | 2 | 5 |

Thus \(M(P_{44})=\{4\}\), with \(H=3>0\).

### 6.4 After \(444\)

| column | \(A\) | \(B\) | \(H\) |
|---:|---:|---:|---:|
| 1 | 2 | 3 | 5 |
| 2 | 1 | 4 | 5 |
| 3 | 2 | 4 | 5 |
| **4** | **10** | **11** | **2** |
| 5 | 2 | 4 | 5 |
| 6 | 1 | 4 | 5 |
| 7 | 2 | 3 | 5 |

Thus \(M(P_{444})=\{4\}\), with \(H=2>0\).

### 6.5 After \(4444\)

| column | \(A\) | \(B\) | \(H\) |
|---:|---:|---:|---:|
| 1 | 2 | 2 | 5 |
| 2 | 4 | 1 | 5 |
| 3 | 4 | 2 | 5 |
| **4** | **8** | **8** | **1** |
| 5 | 4 | 2 | 5 |
| 6 | 4 | 1 | 5 |
| 7 | 2 | 2 | 5 |

Thus \(M(P_{4444})=\{4\}\), with \(H=1>0\).

The fifth certified move therefore gives

\[
\boxed{P_{44444}}.
\]

### 6.6 Boundary after \(44444\)

| column | \(A\) | \(B\) | \(H\) |
|---:|---:|---:|---:|
| 1 | 2 | 2 | 5 |
| 2 | 1 | 4 | 5 |
| 3 | 2 | 4 | 5 |
| **4** | **6** | **6** | **0** |
| 5 | 2 | 4 | 5 |
| 6 | 1 | 4 | 5 |
| 7 | 2 | 2 | 5 |

Column 4 remains the unique incidence maximum:

\[
M(P_{44444})=\{4\}.
\]

But \(H(P_{44444},4)=0\). Hence the rule returns:

~~~text
UNRESOLVED / UNIQUE_MAX_EXHAUSTS_COLUMN
~~~

This is an intentional proof boundary, not a failure to notice that center still has the largest \((A,B)\) pair.

---

## 7. Why this is not an opening table

No literal prefix appears in the selector.

The implementation reconstructs the physical board from the supplied current move history, determines each current legal landing, and counts the two live-line incidence sets directly from the fixed geometry.

The following are explicitly absent from the certificate computation:

\[
\text{descendant enumeration}=\text{false},
\]

\[
\text{recursive search}=\text{false},
\]

\[
\text{oracle}=\text{false},
\]

\[
\text{solved values}=\text{false},
\]

\[
\text{projection}=\text{false}.
\]

The prefixes in Theorem 1 are therefore test inputs to the general current-state rule, not encoded cases inside that rule.

---

## 8. Off-line control: position \(41\)

A useful falsifier for opening-table behavior is a deviation from the center stutter.

After the actual prefix \(41\), the same rule recomputes the board and obtains:

| column | \(A\) | \(B\) | \(H\) |
|---:|---:|---:|---:|
| 1 | 3 | 4 | 4 |
| 2 | 3 | 2 | 5 |
| 3 | 4 | 2 | 5 |
| **4** | **10** | **9** | **4** |
| 5 | 5 | 2 | 5 |
| 6 | 4 | 2 | 5 |
| 7 | 3 | 2 | 5 |

Center is again uniquely Pareto-maximal and is certified.

There is no expected-line recovery rule of the form “if the opponent deviates, return to 4.” The result arises by recalculating \(A\), \(B\), and \(H\) on the actual \(41\) state.

---

## 9. What this adds beyond plain line incidence

A simpler heuristic deserves explicit comparison: choose the legal landing with the largest mover-live line count \(A\).

For the five positions used in Theorem 1, that simpler rule already selects center uniquely. Therefore the paper does **not** claim that Pareto dominance is necessary to obtain the sequence \(44444\) on this narrow corpus. Nor does it claim that the five-ply result, by itself, demonstrates a new perfect-play law stronger than ordinary center-incidence intuition.

The additional machinery has two narrower roles.

First, \(B\) keeps offensive opportunity and defensive denial as separate coordinates rather than collapsing them into an arbitrary weighted scalar. Pareto dominance therefore makes explicit that a certified move is not trading away one declared resource for another. On the five theorem positions center happens to dominate in both coordinates, so no weighting choice is needed.

Second, \(H\) creates a principled continuation-resource boundary. After \(44444\), the sixth center move is still legal: it lands in the top cell of column 4. What is exhausted is **post-move headroom**—after that candidate landing there is no cell remaining above it in the column. The rule therefore refuses at \((A,B,H)=(6,6,0)\) instead of continuing merely because center still has the largest incidence count.

The five-ply result is consequently stronger than the single observation “center has the most lines on the empty board” only in a limited, precise sense: the same present-state rule is recomputed after alternating ownership at each ply, the live-line counts change non-monotonically, and center remains the unique two-coordinate maximum through five successive actual positions. The move-six refusal is the clearest evidence that the certificate is a bounded structural rule rather than an instruction to keep choosing center.

---

## 10. Executable realization

The qualified reference implementation is in JSMinSys.

Repository: iteathen/JSMinSys

Integrated source commit:

~~~text
c8b450ae01073a684b68d492ec42a03403d56b2f
~~~

Primary implementation:

~~~text
addons/connect4-rank-local-presearch.mjs
~~~

at blob SHA:

~~~text
b8aeb9683685d13cc4a97fbd62781e9631a003be
~~~

Primary regression test:

~~~text
test/connect4-rank-local-presearch.test.mjs
~~~

at blob SHA:

~~~text
f4017694d7ff3efc95a52d6bd1f9844810e95716
~~~

The principal test is named:

> rank-local pre-search derives the first five center moves without an opening table

and checks the five center triples

\[
(7,7,5),
(9,10,4),
(11,12,3),
(10,11,2),
(8,8,1).
\]

A separate test checks the move-six refusal at \((6,6,0)\). A third test checks the \(41\) deviation control. A fourth verifies that the returned certificate is descriptive enough to reproduce every elimination. A fifth verifies that the IsoMax wrapper returns a certified rank-local move before Lazy SMP starts.

The corresponding green workflow was recorded as:

~~~text
Connect4 Rank-Local Pre-Search
run 36969689273
~~~

with five tests passing and the JSMinSys add-on catalog cycle-ledgered.

---

## 11. Connect4 research provenance

The integration record was preserved in the Connect4 repository at commit

~~~text
9201e6b26489deed814cf6fc33f91e4e710cd0a2
~~~

with commit message:

~~~text
research: record IsoMax rank-local pre-search integration
~~~

and source document:

~~~text
research/isograph/discovery/2026-09-30-universal-structural-policy/
ISOMAX_RANK_LOCAL_PRESEARCH_INTEGRATION_0_1.md
~~~

That record states the same runtime rule and the same first-five controls, while explicitly preserving the move-six unresolved boundary.

This publication moves the result into the canonical research-publication lane so that the theorem, evidence, and provenance do not depend on recovering an older experimental branch.

---

## 12. Complexity

Let \(|\mathcal L|\) denote the number of winning lines and \(C\) the number of columns. For each legal landing the implementation scans the fixed winning-line geometry and tests ownership on four cells per line.

For fixed standard Connect Four,

\[
C=7,\qquad |\mathcal L|=69,
\]

so the computation is constant-sized.

For a generalized explicit board geometry, the direct implementation has work on the order of

\[
O(C|\mathcal L|K),
\]

where \(K\) is the connect length, followed by at most

\[
O(C^2)
\]

pairwise Pareto comparisons.

Nothing in this certificate requires expanding a game tree.

---

## 13. Interpretation

The notable feature of the theorem is not merely that center wins a static line-count contest on the empty board. The same current-state rule survives alternating ownership through five successive ranks:

\[
\epsilon
\rightarrow 4
\rightarrow 44
\rightarrow 444
\rightarrow 4444
\rightarrow 44444.
\]

The raw center incidence changes non-monotonically:

\[
7,9,11,10,8
\]

for \(A\), and

\[
7,10,12,11,8
\]

for \(B\).

Nevertheless, center remains the unique Pareto maximum at every certified rank.

The headroom coordinate is equally important. Without it, the same incidence rule would continue to prefer center after \(44444\). At that position the sixth center move is legal and occupies the top cell; however, after that candidate landing there is no remaining cell above it. The guard therefore stops the certificate exactly when its same-column continuation resource is exhausted.

This is why the sixth move became a qualitatively different problem rather than simply the next application of the same formula.

---

## 14. Claim boundary

This publication makes the following formal claim:

> On the declared standard 7x6 geometry, the rank-local landing certificate uniquely selects column 4 from each of the positions \(\epsilon\), \(4\), \(44\), \(444\), and \(4444\), and therefore constructively produces the prefix \(44444\) without descendant enumeration, recursive search, an oracle, solved values, projection, or an encoded opening table.

It also proves the boundary claim:

> At \(44444\), center remains the unique \((A,B)\) Pareto maximum but has zero headroom, so the certificate must return unresolved for move six.

This paper does **not** claim that the condition

\[
\text{unique Pareto maximum in }(A,B)\text{ with }H>0
\]

has been proved sufficient for perfect play on every legal Connect Four position.

It does **not** claim a search-free solution of standard Connect Four.

It does **not** retroactively use later turn-six structural work as a premise of the five-ply result.

Those stronger questions belong to subsequent research.

For dependency auditing, the scope is strictly one-directional:

> **This result establishes solved-knowledge independence only for plies 1–5 of the certified opening prefix. It makes no claim about solved-knowledge dependence or independence from ply 6 onward.**

At (44444) the rank-local rule refuses, so any later move-selection path must be audited separately.

---

## 15. Minimal independent reproduction

An independent implementation needs only:

1. enumerate the 69 length-four winning lines of a 7x6 board;
2. reconstruct current token ownership and column heights;
3. for each legal landing, count mover-live and opponent-live lines containing that landing;
4. compute same-column headroom;
5. eliminate Pareto-dominated candidates in \((A,B)\);
6. return a move only when exactly one maximum remains and its headroom is positive.

Running those six steps on

\[
\epsilon,\ 4,\ 44,\ 444,\ 4444
\]

must reproduce the tables in Section 6 and the prefix \(44444\).

Running them on \(44444\) must reproduce the unique center maximum \((6,6,0)\) and the unresolved result.

No external game value is required for this reproduction.

---

## 16. Conclusion

The first five plies of the center-stutter line are not merely stored as an opening preference in the qualified research implementation. They are reconstructed by a compact present-state certificate.

The result is:

\[
\boxed{
\epsilon
\xrightarrow{\mathrm{RLC}}4
\xrightarrow{\mathrm{RLC}}44
\xrightarrow{\mathrm{RLC}}444
\xrightarrow{\mathrm{RLC}}4444
\xrightarrow{\mathrm{RLC}}44444
}
\]

with a deliberate stopping boundary:

\[
\boxed{
44444
\xrightarrow{\mathrm{RLC}}
\mathrm{UNRESOLVED}.
}
\]

That separation is central to the research history. The five-ply result established that meaningful opening structure could be recovered without search. The explicit move-six refusal then localized the next missing structural rule and motivated the subsequent turn-six structural research program.

---

## Appendix A — reference pseudocode

~~~text
rank_local_certificate(P):
    candidates = []

    for each legal column c:
        landing = lowest empty cell in c

        A = number of winning lines:
              containing landing
              and containing no opponent stone

        B = number of winning lines:
              containing landing
              and containing no mover stone

        H = empty cells above landing after move

        candidates.append(c, A, B, H)

    maxima = candidates not Pareto-dominated in (A, B)

    if len(maxima) != 1:
        return UNRESOLVED_NON_UNIQUE

    q = maxima[0]

    if q.H == 0:
        return UNRESOLVED_UNIQUE_MAX_EXHAUSTS_COLUMN

    return CERTIFIED(q.column)
~~~

---

## Appendix B — development chronology and immutable evidence identifiers

### Development chronology

- 2026-10-01 — Connect4 commit `8957240debc2f6b4b7216aa4e4ea34ca012e3807`: earlier universal move-finder candidate; source file explicitly labels the candidate oracle-informed.
- 2026-10-02 — JSMinSys commit `c1a5603fc449316f6ad913ac5606a9703c0ce62f`: red test freezes the first-five center targets, the `44444` refusal boundary, the `41` deviation control, and the descriptive-certificate contract before implementation.
- 2026-10-02 — JSMinSys commit `cd82ed47c8df0cc5d119182d5d324c825d88f2fd`: rank-local landing certificate implementation.
- 2026-10-02 — JSMinSys commit `e302e99e04140a5e77b69d3f0ed818bc9a9fa901`: rank-local pre-search composed with IsoMax.
- 2026-10-02 — JSMinSys commit `c8b450ae01073a684b68d492ec42a03403d56b2f`: pre-search bypass qualification completed.
- 2026-10-01 local / 2026-10-02 UTC — Connect4 commit `9201e6b26489deed814cf6fc33f91e4e710cd0a2`: integration record preserved on the source research line.

The chronology is included specifically to expose researcher degrees of freedom. It should not be read as a claim that the rule was selected under oracle blindness.

### Immutable evidence identifiers

### Connect4

- canonical publication branch: research/semantic-quotient
- source research branch: research/universal-structural-policy-20260930
- integration record commit: 9201e6b26489deed814cf6fc33f91e4e710cd0a2
- integration record file: research/isograph/discovery/2026-09-30-universal-structural-policy/ISOMAX_RANK_LOCAL_PRESEARCH_INTEGRATION_0_1.md

### JSMinSys

- qualified implementation commit: c8b450ae01073a684b68d492ec42a03403d56b2f
- implementation blob: b8aeb9683685d13cc4a97fbd62781e9631a003be
- test blob: f4017694d7ff3efc95a52d6bd1f9844810e95716

### Qualification

- workflow: Connect4 Rank-Local Pre-Search
- green run: 36969689273
- recorded result: 5 tests passed, 0 failed
- first-five structural controls: passed
- move-six unresolved boundary: passed
- \(41\) deviation control: passed
- descriptive certificate contract: passed
- pre-search bypass control: passed

---

## Attribution statement

Research direction, structural target, invariant-first approach, and the decision to pursue a universal rank-local pre-search move finder: **Joshua Oshiro**.

Formalization, implementation assistance, automated qualification, audit assistance, and documentation assistance: **OpenAI ChatGPT**.

IsoGraph system design and research methodology: **Joshua Oshiro**.

No AI system is credited as the originator of the core research direction or conceptual finding reported here.
