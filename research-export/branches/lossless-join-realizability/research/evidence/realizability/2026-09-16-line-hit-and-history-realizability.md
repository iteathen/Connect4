# Exact realizability split: line-hit ownership image, legal history, and lossless composition

**Research direction / structural architecture:** Josh Oshiro  
**Formalization / qualification:** OpenAI ChatGPT  
**Date:** 2026-09-16

## Classification

This packet records deductive results and counterexamples. No solved database label, recursive game search, minimax/Negamax result, MCTS result, or perfect-play terminal census is a premise.

Affected claims: `C4-R0060` through `C4-R0063`.

The result sharpens `C4-R0043`: the phrase *support-local realizability* contains at least two mathematically distinct relations before dynamic game proof is considered.

```text
A. ownership-partition realizability of a symbolic line-hit pair
B. legal-history realizability of a fixed ownership partition
C. dynamic proof/game realizability under intervention/resources/deadlines/stopping
```

Only A and B are closed here. C remains governed by the existing NDC/cofactor/response/deadline research.

---

## A. Fixed-support line-hit image is a pinned NAE CSP

Fix board geometry and a support ideal `I` (the occupied cells). For every occupied cell `v in I`, introduce one Boolean owner variable

```text
x_v = 1  iff v is owned by P0
x_v = 0  iff v is owned by P1.
```

For each geometric winning line `lambda`, define

```text
A_lambda = I intersect lambda.
```

The physical line-hit bits are exactly

```text
h0_lambda = OR_(v in A_lambda) x_v
h1_lambda = OR_(v in A_lambda) (1-x_v).
```

Therefore the four candidate statuses have exact meanings:

| status `(h0,h1)` | exact constraint |
| --- | --- |
| `00` | valid iff `A_lambda` is empty |
| `10` | `A_lambda` nonempty and every `x_v=1` |
| `01` | `A_lambda` nonempty and every `x_v=0` |
| `11` | `A_lambda` contains at least one `0` and at least one `1` |

For nonempty `A_lambda`, status `11` is exactly a not-all-equal constraint on its owner variables. Thus a complete candidate pair `(H0,H1)` is induced by some ownership partition of the occupied support iff the conjunction of the resulting pins and NAE hyperedges is satisfiable.

### Proof

The displayed OR definitions are the definition of a line being physically hit by each owner. Their four truth-table cases give the table directly. Conjoining the line-wise constraints is necessary because one ownership assignment must realize every line status simultaneously. It is sufficient because any satisfying assignment colors every occupied cell and, by the same truth table, induces exactly the requested hit bits on every line. QED.

### Mathematical object

This is a standard finite constraint-satisfaction problem: pinned NAE-SAT, equivalently hypergraph two-coloring with some monochromatic pins and support-determined scopes. No new project-specific object is required for this layer.

It is an **existential characterization**, not yet the desired compact owner-free recurrence. Eliminating the `x_v` variables is the remaining representation problem.

---

## B. Higher-order correlation is unavoidable

For K=4 on any board with `W>=5,H>=4`, use zero-based coordinates and support heights

```text
h_1 = 2
h_2 = 2
all other h_c = 0.
```

Name occupied cells

```text
c=(1,0), a=(1,1), d=(2,0), b=(2,1).
```

Three valid Connect-4 lines have occupied intersections

```text
vertical column 1, rows 0..3:                 {c,a}
horizontal row 1, columns 0..3:              {a,b}
rising diagonal (1,0),(2,1),(3,2),(4,3):     {c,b}.
```

Demand status `11` on all three lines. By part A these become

```text
c != a
a != b
c != b.
```

No binary coloring satisfies an odd inequality triangle. Every individual constraint and every pair of constraints is satisfiable.

### Consequences

1. line-local status validity is not sufficient;
2. pairwise satisfiability of local line constraints is not sufficient;
3. the missing correlation exists before gravity scheduling, turn alternation, opponent policy, deadlines or game value;
4. any exact owner-free elimination must retain the higher-order consequence of such cycles rather than Cartesian-recombining local projections.

This witness applies directly to standard `7x6` and nearby `6x7`.

---

## C. Legal colored support is an alternating linear-extension problem

Now fix not merely line-hit masks but the complete owner labeling `q` of a support `h`.

The occupied support poset is

```text
P(h) = disjoint union over columns c of
       (c,0) < (c,1) < ... < (c,h_c-1).
```

Gravity says that every legal move sequence is a linear extension of this poset. Let

```text
n = sum_c h_c
A_n = 0 1 0 1 ...
```

be the length-`n` global player word, because P0 moves first and play alternates.

Let each column word be

```text
w_c = q(c,0) q(c,1) ... q(c,h_c-1).
```

### Theorem

Ignoring first-win stopping, the colored support `(h,q)` is reachable by legal alternating play iff either equivalent condition holds:

1. `P(h)` has a linear extension `e_1,...,e_n` with `q(e_j)=(j-1) mod 2`;
2. `A_n` is a shuffle/interleaving of the column words `w_c`, preserving each word's internal order.

### Proof

A legal gravity-respecting history chooses at each step a currently minimal unplayed event from one column, so its event sequence is a linear extension; alternation fixes the owner at rank `j`, giving condition 1. Reading the chosen column at each rank interleaves the column words without changing their bottom-to-top order, giving condition 2.

Conversely, a shuffle of the column words selects one next bottom-most unused event from the chosen column at each rank. Hence every selected cell is supported, and because the shuffle equals `A_n`, its stored owner equals the legal mover. This is a legal alternating history absent terminal stopping. QED.

### First-win corollary

If the final colored position is nonterminal, the theorem is already sufficient under ordinary first-win stopping. Ownership sets only grow as moves are added. If some proper prefix had contained a winning line, that same owned line would remain in the final position, contradicting nonterminality.

If the final position is terminal, a further order condition is required: there must be an admissible alternating linear extension whose **first** terminal prefix is the full state, with the last event creating the terminal line. Thus first-win identity is correctly kept separate from static/history realizability.

### Minimal count/parity counterexample

Take `W=2,H=2,K=4`, full support `h=(2,2)`, and both bottom-to-top column words

```text
w_0 = 10
w_1 = 10.
```

The state has two P0 and two P1 stones, the globally correct owner counts for four plies. There are no geometric Connect-4 lines, so residual winspace is empty. Nevertheless no legal history exists: the two minimal events are both labeled P1 while the first global event must be P0.

Therefore support, side-to-move/global owner counts, and even trivial residual-winspace information do not determine legal realizability.

---

## D. Lossless join is the correct static-composition term

Let `R` be a feasible relation over complete state coordinates, and let `R_i=pi_{S_i}(R)` be exact projections onto selected scopes. Their natural join

```text
J = join_i R_i
```

always contains every tuple of `R`. The projection decomposition is exact iff

```text
J = R.
```

This is the standard **lossless join** condition; equivalently, `R` satisfies the corresponding join dependency. When `J` strictly contains `R`, `J\\R` are spurious tuples assembled from locally valid projections.

C4-R0061 is a direct Connect-4 example of this phenomenon: all proper two-constraint pieces are realizable, while their three-way recombination is not.

Classical database/CSP theory explains why this distinction is structural rather than Connect-4-specific: acyclic decomposition schemes enjoy strong local-to-global consistency properties, whereas cyclic scopes can require higher-order correlations. This does **not** assert that the complete Connect-4 factor graph has a particular hypertree width; that is an open measurement/theorem question.

Primary literature alignment:

- C. Beeri, R. Fagin, D. Maier, M. Yannakakis, *On the Desirability of Acyclic Database Schemes*, JACM 30(3), 1983, DOI `10.1145/2402.322389`.
- M. Yannakakis, *Algorithms for Acyclic Database Schemes*, VLDB 1981.

For the history layer, the standard objects are linear extensions of posets and shuffles of words. General shuffle-membership results warn against assuming that owner counts alone provide a universal characterization; no complexity claim for this special fixed alternating target is asserted here.

---

## E. Decomposed-invariant / isomorph audit

### E1. Ownership partition -> line-hit pair

1. **Source objects:** owner Boolean for every occupied cell of fixed support.
2. **Target objects:** `(H0,H1)` hit masks over geometric winning lines.
3. **Mapping:** owner-wise OR over each line/support intersection.
4. **Preserved:** which geometric lines have at least one stone of each owner.
5. **Discarded:** which cells witness each hit, hit multiplicity, owner correlations between lines, move order.
6. **Reconstructibility condition:** pinned NAE CSP satisfiable (`C4-R0060`); this proves existence, not unique reconstruction.
7. **Legality guard:** none for the C1 symbolic ownership-partition domain; alternating-history and first-win guards are additional when interpreting a legal game state.
8. **Transition commutation:** the forward OR update on hit masks is exact for a known legal owner placement, but a target-only predecessor/direct recurrence must preserve image membership; this remains C4-R0043's implementation/calculus problem.
9. **Proof/certificate commutation:** not established; equal hit masks do not by themselves identify NDC proof obligations.
10. **Failure case:** odd NAE triangle (`C4-R0061`).

### E2. Colored support -> legal history class

1. **Source objects:** support plus owner label per occupied cell.
2. **Target objects:** ordered column owner words plus global alternating target word.
3. **Mapping:** restrict owner field to each gravity chain.
4. **Preserved:** all within-column precedence and all owner labels.
5. **Discarded:** the chosen inter-column interleaving/history.
6. **Reconstructibility condition:** existence of the prescribed-color linear extension / shuffle (`C4-R0062`).
7. **Legality guard:** first-win stopping for terminal finals.
8. **Transition commutation:** appending the next support event in one column commutes only when its stored owner equals the next alternating mover and no prior terminal blocks play.
9. **Proof/certificate commutation:** not established; different legal histories can converge to the same colored state while carrying different historical proof provenance unless the proof consumer proves that provenance irrelevant.
10. **Failure case:** two `10` columns on the `2x2,K=4` control.

---

## F. Relation to 28, 30 and 61

This packet does **not** derive the distance-sensitive strong-play 28. It instead locates that remaining problem at the correct layer.

Already established elsewhere:

- the target-free standard-board structural core `28` follows symbolically from the empty-board incidence/quotient calculus;
- the distance-sensitive strong-play terminal-line support `28` is an independently qualified finite/oracle result;
- the missing theorem is why strong optimal play selects the relevant center/phase/deadline structure;
- `6x7 -> 30` is currently a support/terminal-horizon upper bound, not that same structural core and not an exact perfect-play census;
- `61` is the coarse W/D/L-only terminal-line union, again a different object.

The new realizability relation cannot justify identifying any of those quantities merely because a cardinality matches. Its contribution is to specify which correlations must survive before a static projection can even be treated as an exact feasible-state relation.

---

## G. Falsifiers and next theorem target

Rework these claims if any of the following occurs:

- a fixed-support line-hit pair satisfies the pinned NAE system but is not induced by its satisfying ownership assignment;
- a physical ownership partition induces line-hit bits that violate the stated CSP translation;
- a colored support admits the required shuffle but cannot be replayed by gravity-respecting alternation before any terminal event;
- a nonterminal final colored support has an earlier winning prefix;
- the odd-triangle coordinates fail to be three valid Connect-4 lines with the stated occupied intersections on a `W>=5,H>=4` board.

The next bounded structural question is:

> Can the pinned NAE image relation be compiled into a compact **owner-free incremental factorization** closed under line-hit move preimages, while retaining the higher-order cycle constraints exposed above?

A secondary question is whether the special Connect-4 scope hypergraph admits a useful bounded-width or separator decomposition under gravity supports. Either result would directly constrain a searchless realization of C4-R0043 without conflating it with the later guarded NDC quantifier lift.
