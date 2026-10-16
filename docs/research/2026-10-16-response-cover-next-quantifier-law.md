# Exact source-state response-cover composition and the first quantifier-scope obstruction

**Date:** 2026-10-16
**Canonical owner:** `research/semantic-quotient`
**Research direction:** Josh Oshiro
**Status:** Exact **bounded four-ply** rule-derived algebra, independently controlled on all 4×3/4×4 P1 states against already-qualified local cofactors, and physical validation under declared limits. **Global nonbranching Connect Four solver still OPEN.** No gameplay authority change.

## 1. What we are actually trying to discover

The complete residual-q/first-win/alternating-value Connect Four **algorithmic core already exists**, even though its ordinary realization branches and recurses. Recursion and branching do not disqualify it. The optional preferred result is a composition operator handling strategic alternatives without independently solving each continuation.

The earlier 46/47-generator winning certificates were **produced by search** and are strictly validation artifacts. No searched winning policy, solved WDL value or future-board oracle is consulted by any algebraic producer in this work. Physical continuation enumeration appears in **validation only**.

The immediately previous result eliminated the fixed P0 OR / P1 AND / P0 immediate-win OR horizon via exact parent-R0 requirements of degree at most two. We now prepend **one more P1 universal turn** and determine the exact P0-adaptive response cover without creating any successor q states.

Predeclared plan (frozen before tests):
`research/isograph/discovery/2026-10-16-algorithmic-core/UNIVERSAL_PREIMAGE_RESPONSE_COVER_PLAN_0_1.md`.

## 2. Four-ply original-q algebra

Take a valid nonterminal **P1-to-move** source

\[
q=(h,R_0,R_1).
\]

The precisely bounded property is:

\[
\boxed{
\forall b\in\mathcal A(q)\;\exists a\;\forall d\;\exists e:
\text{P0 completes its first win by its second subsequent placement},
}
\]

with the qualification that P0 may already have won on its first placement and P1 may win or draw *before* the final turn. These first-win guards are part of the formula, not postprocessing.

For legal P1 first landing \(x_b=(b,h_b)\), the adaptive first P0 landing is \(y_a=(a,h_a+[a=b])\). If both are nonterminal, the legal next P1 landing in column c is \(z_c=(c,h_c+[c=b]+[c=a])\), and \(u_c\) is the cell immediately above it, if it exists.

The four locations are determined by **original support arithmetic**. There is no need to compute either intermediate board or residual q.

Let the notation \([S\in R]\) denote exact membership of the normalized source residual antichain. For a legal pair (b,a), define:

\[
\begin{aligned}
I_b &=[\{x_b\}\in R_1]\qquad\text{(P1 first win)},\\
P_{b,a} &=[\{y_a\}\in R_0]\qquad\text{(P0 first win)},\\
T_{b,a,c}
 &=[\{z_c\}\in R_0]\lor[\{y_a,z_c\}\in R_0],\\
U_{b,a,c}
 &=[\{u_c\}\in R_0]\lor[\{y_a,u_c\}\in R_0],\\
B_{b,a,c}
 &=[\{z_c\}\in R_1]\lor[\{x_b,z_c\}\in R_1].
\end{aligned}
\]

Undefined u_c contributes false. Each singleton/pair residual is looked up in the **source**, never in a generated child q.

**Cofactor derivation:** P1's move b first applies owner-true contraction to R1 and blocker deletion to R0; P0's adaptive move a next contracts R0 and blocks R1. The cells x_b, y_a and z_c are distinct, even when their columns coincide. Thus after both moves a P0 immediate terminal requirement at z_c came from either source {z_c} or {y_a,z_c}, and a P1 immediate terminal at z_c came from either source {z_c} or {x_b,z_c}. The same reasoning gives upper-latent P0 threat U. A source P1 singleton {x_b} makes b itself terminal and must be rejected first. A source P0 singleton {y_a} makes a terminal P0 win and must be accepted before considering further replies.

At the position after b,a, let L_{ba} be its **legal next P1 columns**. Treat T,U,B as the corresponding column masks. The exact prior one-reply polynomial gives:

\[
\begin{split}
Q_{ba} ={}& (B_{ba}=\varnothing)\ \land\
\bigl[
  |T_{ba}|\ge 2 \\
&\quad\lor\ (|T_{ba}|=1\ \land\ T_{ba}\cap U_{ba}\ne\varnothing)\\
&\quad\lor\ (T_{ba}=\varnothing\ \land\ U_{ba}=L_{ba})
\bigr].
\end{split}
\]

A legal (b,a) pair is **successful** if the initial P1 action b does not terminate with P1 win/draw and either P0 wins immediately on a or both placements are nonterminal and Q_{ba} holds. If a fills the board without a win it is a draw, never a P0 success. The last P1 reply's first-win/full-board guard is handled by Q_{ba} exactly as in the preceding lemma.

## 3. The new algebraic object: action-labelled response covers

For each P0 answer column a, define a **bitmask of first P1 replies**:

\[
\boxed{
K_a(q)=\{b\in\mathcal A(q):\text{P0's action a is a successful response to b}\}.
}
\]

The bounded strategic conclusion is precisely

\[
\boxed{
\Psi_2(q)=
\Bigl[\bigcup_{a=1}^W K_a(q)=\mathcal A(q)\Bigr].
}
\]

This is a **source-only response-cover matrix** of at most W response masks and W² bits of output. The implementation computes each K_a by locally scanning at most W² possible (b,a) incidence pairs and W later landing labels, costing O(W³) hashed residual membership tests per q (plus input residual indexing). It does **not** build child q states, recursively descend into game continuations, enumerate terminal game histories, or read searched action values.

This is a genuine fixed-horizon universal-preimage composition, not a full-game WDL decision or a general polynomial root solver. The local finite action-label incidence is real work and is explicitly reported; a single output object is not asserted to have zero cost.

Source implementation:
`research/isograph/discovery/2026-10-16-algorithmic-core/universal-response-cover-operator.mjs`.

## 4. A general bounded-horizon residual-degree observation

A future first win for claimant P0 that occurs after at most k additional P0 placements must complete a source P0 residual requirement of size at most k. Similarly, a P1 first win before at most l additional P1 placements must complete a source P1 residual requirement of size at most l.

The reason is elementary: the claimant can own at most k previously unfilled cells in that horizon; the other player's moves cannot reduce claimant's residual requirement, only block it. Therefore source residual requirements longer than that player's remaining placement budget cannot participate in a terminal within the horizon. First-win precedence and support determine *which* shorter requirements are realizable and when.

Here **P0 has at most two subsequent placements and P1 at most two**, hence source requirements of size at most **two for each player** suffice to determine this four-ply bounded predicate. In particular, *prepending an opponent turn does not automatically increase the source claimant residual degree*. It increases the need to retain **adaptive response correlations**. This observation is about fixed-horizon first-win predicates, not general WDL.

## 5. Why one union mask is insufficient at the next composition

Careful quantifier scope is load-bearing:

\[
\forall b\;\exists a\;P(b,a)
\iff \bigcup_a K_a=L
\]

but

\[
\exists a\;\forall b\;P(b,a)
\iff \exists a:\ K_a=L.
\]

These properties are **not interchangeable**. Collapsing the response-cover family into its union makes the second property unsound.

An independently physically checked **legal 4×3 Connect-3** example occurs after prefix `223`, at support `[0,2,1,0]` (P1 to move):

```text
Initial P1 legal mask L=0xf
P0 action columns 1..4:
    K = [0xe, 0x4, 0xe, 0x7]

OR all K = 0xf                  -> FORALL P1 EXISTS P0: TRUE
Any single K == 0xf ? NO       -> EXISTS ONE P0 FORALL P1: FALSE
```

The validator independently replayed **99 legal physical actions** for this counterexample. The correct theorem must preserve which P0 action covers which P1 reply.

For a **single response layer**, we can safely replace the raw mask family with its inclusion-maximal nonempty antichain \(\mathcal K=\operatorname{Max}_{\subseteq}\{K_a\}\), retaining action-to-mask transporter metadata when particular moves must be returned. This preserves both the union-cover test and whether *some* K_a is the whole legal mask. It does not erase the strategic dependency itself.

A response-mask antichain over W columns has at most \(\binom{W}{\lfloor W/2\rfloor}\) members (Sperner) and at most W in the present one-mask-per-P0-column implementation. **This bound is for ONE P1 response index set**, not a polynomial bound for arbitrary-depth policy spaces.

Complete validation-only small-board census:

| Domain | P1 states | Adaptive-only cases (union full, no individual K full) | Nonzero response masks | Inclusion-maximal nonzero masks |
|---|---:|---:|---:|---:|
| 4×3 Connect-3 | 2,208 | 274 | 3,178 | 2,038 |
| 4×4 Connect-4 | 67,992 | 2,310 | 27,362 | 23,408 |
| Total | **70,200** | **2,584** | **30,540** | **25,446** |

There were **zero** differences in the two preserved coverage predicates after antichain reduction. The maximum witnessed maximal-antichain width was **three** on both boards. These figures do not count removing empty masks as a meaningful winning-policy compression; the nonzero-to-maximal comparison is the relevant one.

Machine file: `RESPONSE_COVER_QUANTIFIER_SCOPE_RESULTS_0_1.json`.

## 6. Qualification: exact local correctness, bounded physical reproduction

The response-cover operator was constructed from the algebra **before** independent validation. The checker enumerated the physical game tree only as an offline falsifier; its outcomes did not enter source-q candidate construction.

Frozen run and code:
- `UNIVERSAL_PREIMAGE_RESPONSE_COVER_PLAN_0_1.md`;
- `universal-response-cover-operator.mjs`;
- `universal-response-cover-control.mjs`;
- `UNIVERSAL_RESPONSE_COVER_RESULTS_0_1.json`.

| Domain | Every P1 q algebraic row set checked | (b,a) rows | Exact child-q cofactor comparison mismatches | Independent physical positions checked |
|---|---:|---:|---:|---:|
| 4×3 Connect-3 | 2,208 / 2,208 | 10,970 | 0 | 2,208 / 2,208 |
| 4×4 Connect-4 | 67,992 / 67,992 | 299,150 | 0 | 31,501 / 67,992 |
| **Total** | **70,200 / 70,200** | **310,120** | **0** | **33,709** |

No physical response-mask or universal-status mismatches in the **33,709** physically validated positions. The 4×4 direct physical subset is **PARTIAL** because of the predeclared 800,000 physical-move cap, and must not be misrepresented as exhaustive independent physical validation. The full 4×4 source-q comparison **was exhaustive** against the separately qualified two-P0-turn direct pullback applied to physically computed one-P1-move q successors.

Across the two domains, the q-child comparator constructed **133,392** nonterminal one-step child q states; the source operator constructed **zero**. The source operator did perform **3,438,998** residual-membership probes across 310,120 response rows. These are not like-for-like instruction costs; no blanket runtime speedup is claimed.

The physically invalid mutations of the source requirements were explicitly detected:
- omit P0 size-two antecedent {y_a,z_c}: 4×3 legal prefix `2`, 4×4 `1121122`;
- omit P1 size-two antecedent {x_b,z_c}: 4×3 legal prefix `121`, 4×4 `1224343`.

Both produce wrong response-cover masks. The initial P1 first-win guard is also required by the derivation and prior direct physical checks.

### Standard 7×6 rule-only controls

Separate predeclared 7×6 fixture campaign:
- `universal-response-cover-7x6-control.mjs`;
- `UNIVERSAL_RESPONSE_COVER_7X6_RESULTS_0_1.json`.

Thirteen exact legal P1 states (literal `44444` plus **12** independently generated seed `0x4c2a2028` rank-35 positions) passed source-q vs child-cofactor vs explicit physical bounded response checks, including horizontal reflection:

```text
P1 source states                       13
(b,a) response rows                   118
P1 literal initial reply actions       46
P1 second-turn moves                  111
physical-rule validation moves       3,642
independent q-child comparator states    32
source operator child q states          0
mask/universal/reflection mismatches    0
positive fixed-horizon P1 states        2
```

At `44444`, initial P1 legal mask was `0x7f` but its bounded response-covered mask was `0x00`: **the special four-ply P0-win predicate is false**, consistent with the already established minimum of three new P0 placements for any win. This says nothing about P0's eventual perfect-play outcome.

## 7. Result and next missing law

**Established for the declared bounded pattern:**
- exact original-q `P1 universal / P0 existential / P1 universal / P0 terminal` response-cover operator with only low-degree residual source predicates;
- no intermediate child-q construction or recursively searched game continuations in the algebraic producer;
- complete 4×3/4×4 source-q cofactor comparisons, substantial independent bounded physical validation, 7×6 spot checks;
- exact real-world quantifier-scope obstruction: a single union cover is **not** a sufficient reusable higher-level strategic descriptor; retain action-labelled maximal response covers/antichains.

**Still OPEN:** A compact **arbitrary-depth** strategy transformer. Adding an earlier P0 choice would increase P0's placement budget to three and permit source degree-three requirements. More significantly, repeated compositions may generate **correlated mixed reply-cover families**; the elementary one-layer Sperner bound does not establish globally compact recurrence. The previously established RBA distributive lattice/antichain semiring captures the logical semantics, but output-sensitive, bounded-size cross-depth composition remains unresolved.

**Next tightly scoped question:** Pull this **full response-cover family**, not merely its union, backward through one preceding P0 true cofactor. Derive an exact virtual upset/antichain substitution on the original q (with possible source P0 degree three), retain terminal and adaptive-response action correlation, and qualify the one-step lift against the already proven recursive q core. If width or construction cost explodes, preserve the first structural mixed-cover obstruction rather than falling back to forward policy-search.

The exact branching/recursive algorithmic core remains established regardless of this optional improvement. No proof of general nonbranching, no minimality theorem, no ordinary full-game WDL/root solve, and no promotion to game-theory authority are claimed.
