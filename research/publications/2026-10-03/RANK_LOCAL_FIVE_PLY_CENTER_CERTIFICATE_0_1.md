# Rank-Local Landing Certificates for the First Five Plies of Standard Connect Four

**Joshua Oshiro**

**Agent-assisted research produced within the Connect4 / IsoGraph research program designed and directed by Joshua Oshiro. The core research direction, structural target, and interpretation were supplied by Joshua Oshiro; OpenAI ChatGPT assisted with formalization, implementation, qualification, auditing, and documentation.**

**Connect4 / IsoGraph Project research publication — revision 0.1**

**Local publication date:** 2026-10-03 (America/Los_Angeles)  
**Canonical research branch:** research/semantic-quotient  
**Source research branch:** research/universal-structural-policy-20260930  
**Source implementation repository:** iteathen/JSMinSys  
**Publication status:** formal project research preprint; not peer reviewed  
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

After \(44444\), center remains the unique incidence maximum at \((6,6,0)\), but headroom is exhausted. The same rule therefore refuses to certify move six, returning an explicit unresolved boundary rather than silently selecting a runner-up. This boundary was the reason subsequent CPC/CPCX research began at turn six.

The result is a formal theorem about the declared rank-local certificate and the five-ply center prefix. It is not promoted here as a universal theorem that the same certificate condition proves perfect play at every legal Connect Four position.

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

---

## 2. Standard-board definitions

Let the standard Connect Four board have seven columns and six rows. Columns are numbered \(1,\dots,7\), with column 4 the center. Rows are counted upward from the bottom. A legal move occupies the lowest empty cell in its chosen column.

Let \(\mathcal L\) be the set of all length-four winning lines on the 7x6 board. There are exactly

\[
|\mathcal L|=69
\]

horizontal, vertical, and diagonal winning lines.

For a nonterminal current position \(P\), let \(m\) be the player to move and \(\bar m\) the opponent. For every legal column \(c\), let

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

### Theorem 1 — five-ply center certificate

Let \(P_s\) denote the standard 7x6 Connect Four position reached by legal move prefix \(s\). For

\[
s\in\{\epsilon,4,44,444,4444\},
\]

column 4 is the unique Pareto maximum under \((A,B)\), and its headroom is positive.

Therefore repeated application of the rank-local certificate from the empty board produces

\[
\boxed{44444}.
\]

At \(P_{44444}\), column 4 remains the unique Pareto maximum under \((A,B)\), but

\[
H(P_{44444},4)=0,
\]

so the certificate returns unresolved on move six.

### Proof

The proof is a finite direct count over the fixed set of 69 winning lines. The complete candidate triples are listed below. In every table through prefix \(4444\), the center candidate has both \(A\) and \(B\) at least as large as every other candidate, with at least one strict inequality against every other column. Hence every non-center candidate is Pareto-dominated by column 4. The center is therefore the unique Pareto maximum. Its listed headroom is strictly positive.

The certificate consequently returns column 4 at each of the five successive positions. Concatenating those certified moves gives \(44444\).

After prefix \(44444\), center again strictly dominates every non-center candidate in \((A,B)\), but its headroom is zero. By Definition 4 the certificate must refuse. ∎

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

## 9. Executable realization

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

## 10. Connect4 research provenance

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

## 11. Complexity

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

## 12. Interpretation

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

The headroom coordinate is equally important. Without it, the same incidence rule would continue to prefer center after \(44444\), even though the center column has no remaining landing above the fifth stone. The guard forces the certificate to stop exactly where the earlier local rule loses its continuation resource.

This is why the sixth move became a qualitatively different problem rather than simply the next application of the same formula.

---

## 13. Claim boundary

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

It does **not** retroactively use later CPCX closure as a premise of the five-ply result.

Those stronger questions belong to subsequent research.

---

## 14. Minimal independent reproduction

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

## 15. Conclusion

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

That separation is central to the research history. The five-ply result established that meaningful opening structure could be recovered without search. The explicit move-six refusal then localized the next missing structural rule and motivated the subsequent CPC/CPCX program.

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

## Appendix B — immutable evidence identifiers

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
