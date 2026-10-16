# Exact short-horizon alternating quantifier fusion without game-tree discovery

**Date:** 2026-10-16
**Canonical research owner:** `research/semantic-quotient`
**Research direction:** Josh Oshiro
**Status:** exact mathematical identities under finite gravity/first-win q semantics, with complete independent physical controls on two bounded Connect-K games; **general arbitrary-horizon branch elimination OPEN**. No authority promotion or product adoption.

## Governing correction

The original algorithmic core is already complete and may recurse or branch. The **optional preferred** target is a rule-derived operation that does not discover a winning policy by searching game continuations. Forward searches, existing 46/47-generator proofs, and solved oracles are **validation only**; no winning moves or values from them entered the identities below.

This research builds the operator directly from **support, minimal residual requirements, owner-true/owner-false cofactors and the order of first-win termination**. It does not nominate a policy using forward search.

## 1. One P1 universal reply, closed into three masks

Let q=(h,R0,R1) be legal nonterminal with **P1 to move** on finite width W/height H/Connect K. For every legal column c let x_c=(c,h_c) be its landing, y_c=(c,h_c+1) its next landing when row h_c+1 exists.

Define column masks:

- L: legal P1 columns;
- T: c in L if the singleton {x_c} belongs to normalized P0 residual antichain R0;
- B: c in L if {x_c} belongs to P1 residual antichain R1 (P1 wins immediately by c);
- U: c in L if y_c exists and singleton {y_c} belongs to R0.

These are **rank-local residual queries**, not result labels.

### Lemma — exact opponent reply action mask

For any legal P1 reply b not already winning terminally, the entire set of **immediately winning P0 columns after that reply** is

\[
\boxed{T_b'=(T\setminus\{b\})\cup(\{b\}\text{ if }b\in U).}
\]

**Proof:** P1's stone at x_b blocks the preexisting P0 singleton {x_b}; it does not block P0 singleton requirements at another column's legal landing. A P1 stone never shortens any P0 residual requirement, so no new P0 singleton arises elsewhere. The only changed legal landing is immediately above x_b, which is a P0 terminal action precisely when {y_b} already belonged to R0 and remained unblocked. This covers every physically legal P1 reply, with gravity and first-win stopping explicit.

The full **favorable opponent reply** bitmask G follows without constructing child q:

\[
G=(L\setminus B)\cap\begin{cases}
L,&|T|\ge2,\\
(L\setminus T)\cup U,&|T|=1,\\
U,&|T|=0.
\end{cases}
\]

G contains every P1 reply after which P0 can immediately win and excludes any immediate P1 terminal. The universal conclusion is **G=L**.

This is an *exact* one-opponent-turn strategic predicate, not merely a sufficient heuristic. If G=L, P0 has a forced next-turn first win. If G != L, that precise next-turn property is false; P0 may still win later.

### Corollary — compact monotone Boolean polynomial

Let T_i, U_i be the Boolean indicator variables for those two kinds of P0 singleton requirements and Y_i the indicator for **no immediate P1 completion** at column i. Then

\[
\boxed{
\Psi_1(q)=
\left(\bigwedge_{i\in L}Y_i\right)
\land
\left[
  \bigvee_{\{i,j\}\subseteq L,,i\neq j}(T_i\land T_j)
  \;\lor\;\bigvee_{i\in L}(T_i\land U_i)
  \;\lor\;\bigwedge_{i\in L}U_i
\right].
}
\]

This is the complete `forall P1 b -> exists immediate P0 winning reply` condition. Why: either there are at least two independently playable threats; or there is one threat whose blocking reply uncovers its upper replacement; or there are no currently playable threats but **every** possible P1 placement exposes an upper immediate P0 win. The P1 first-win guard is mandatory in all cases.

The polynomial needs at most **W(W-1)/2 + W + 1** threat terms, plus W Y-guards, independent of the number of possible game continuations. It is monotone in the P0-favorable residual-upset variables (T, U, Y), under their support-derived implication constraints. The expression is not a complete game-value polynomial.

Sources:
- `universal-one-reply-fusion.mjs` — computes the whole favorable response mask at once;
- `universal-reply-threat-polynomial.mjs` — independently constructs this factored polynomial per support, without referencing the mask implementation.

## 2. Direct OR–AND–OR pullback without intermediate positions

Now take an actual **P0-to-move** q. To determine every P0 first action a that forces a first win immediately or on its **next own turn**, choose symbolic landing x=(a,h_a).

If {x} is in R0, a is an immediate P0 win and first-win termination stops. If playing a fills the board without winning, a is not a qualifying P0 win. Otherwise P1 would be next, and the new legal landing z_c in each column c is determined by **height h+e_a**.

The exact child threat variables can be evaluated **directly in the ORIGINAL parent R0/R1**, without materializing child q:

\[
\begin{aligned}
T^{(a)}_c&=
  [\{z_c\}\in R_0]\lor[\{x,z_c\}\in R_0],\\
U^{(a)}_c&=
  [\{u_c\}\in R_0]\lor[\{x,u_c\}\in R_0],\\
B^{(a)}_c&=
  [\{z_c\}\in R_1].
\end{aligned}
\]

Only valid next upper landings u_c contribute. Note z_c != x in every child column.

**Proof:** P0's owner-true cofactor removes x from any P0 winning requirement, so an immediate child singleton at z_c comes from either parent singleton {z_c} or parent pair {x,z_c}. Likewise for the exposed upper target u_c. P0's move is the **blocker cofactor** for P1 requirements, so a P1 child singleton at z_c can only be the original singleton {z_c}; z_c and x are distinct. These statements require exact minimal-antichain semantics; larger parent residuals cannot reduce to child singleton on one owner-true move. Apply the preceding universal polynomial to these child-threshold variables.

Thus the complete *bounded* P0-winning first action set is

\[
\boxed{
A_{\le2}(q)=
\left\{a:\
[\{x_a\}\in R_0]\ \lor\bigl(\operatorname{nonterminalAfter}(a)
\land\Psi_1(T^{(a)},U^{(a)},\neg B^{(a)})\bigr)
\right\}.
}
\]

This is an exact, fixed-horizon **P0 OR / P1 AND / P0 OR** composition directly from the original q. It scans candidate P0 action *labels* locally but performs **zero independently evaluated P1 continuation states, zero intermediate q materializations and zero recursive game-value calls**. It may return several equally certified first actions as one action set. If the set is empty, there is no P0 win by the end of its second own move, but later wins/draws/losses remain unresolved.

Cost: with hashed residual membership, O(W^2) parent residual lookups per input q, plus one-time residual shape construction. The number of proof-polynomial terms is bounded as above. Do not infer this fixed-horizon bound generalizes unchanged when more alternating turns are composed.

Implementation:
`research/isograph/discovery/2026-10-16-algorithmic-core/direct-two-move-pullback.mjs`.

## 3. Executed independent finite controls

The mathematical derivation was frozen before physical falsification in:

- `UNIVERSAL_ONE_REPLY_COFACTOR_FUSION_PLAN_0_1.md`;
- `TWO_MOVE_DIRECT_COFACTOR_PULLBACK_PLAN_0_1.md`.

The validation-only reference independently builds physical positions from gravity and alternating play, checks Connect-K completion by counting directly adjacent owned stones in four directions, and checks first-win stops. **Its positions, values and policies do not enter the algebraic producer.**

### Universal one-P1 reply layer

| Control | All reachable P1 states | Exact favorable reply-mask mismatches | P0 immediate-forcing states |
|---|---:|---:|---:|
| 4x3 Connect-3 | 2,208 | 0 | 430 |
| 4x4 Connect-4 | 67,992 | 0 | 2,170 |
| Total | **70,200** | **0** | **2,600** |

The independent polynomial form agrees on all 70,200 positions; **zero polynomial mismatches**. Case counts for the 2,600 positive states:

| Algebraic mechanism | 4x3 | 4x4 | Total |
|---|---:|---:|---:|
| two or more current independent P0 immediate threats | 264 | 1,200 | 1,464 |
| one current threat, blocking it exposes an upper P0 terminal | 142 | 290 | 432 |
| no current threat; every legal P1 move exposes an upper P0 terminal | 24 | 680 | 704 |

The final category can arise where only one legal column remains; its significance must not be overstated as broad multi-choice branch reduction. Example input histories/supports and exact masks are preserved in the machine result.

Code: `universal-one-reply-fusion-control.mjs`.
Evidence: `UNIVERSAL_ONE_REPLY_POLYNOMIAL_RESULTS_0_1.json`.

All 2,423 P0 states on 4x3 and 44,437 P0 states on 4x4 also passed the earlier cofactor-created-child bounded-horizon control; the latter was PARTIAL because the declared validation-action cap was reached. Its predecessor run had a four-transition cap overrun; both the initial raw evidence and strict-cap repair remain preserved.

### Direct two-P0-own-move OR–AND–OR pullback

| Control | **Every** legal nonterminal P0 state | Independent physical action-mask mismatches | Mismatches versus exact cofactor/fusion |
|---|---:|---:|---:|
| 4x3 Connect-3 | 2,423 | 0 | 0 |
| 4x4 Connect-4 | 66,297 | 0 | 0 |
| Total | **68,720** | **0** | **0** |

The tests covered **160,554** candidate P0 first actions (6,226 + 154,328). The already verified one-step q-cofactor/fusion path constructed **143,280 intermediate child q objects** over these tests; the direct algebra constructed **zero**. For honesty, the direct algebra still made over 1.4 million constant-time residual membership lookups on these domains, and the independent physical validator explicitly expanded reply moves to falsify the formula. That validation search **is not** part of the proposed algebraic operator.

No arbitrary-horizon solver or branch-free perfect-play claim follows.

Evidence:
`DIRECT_TWO_MOVE_PULLBACK_RESULTS_0_1.json`.
The original partial 4x4 qualification `DIRECT_TWO_MOVE_MUTATION_BUDGET_PARTIAL_0_1.json` remains preserved. That control expended its 300,000-check budget repeatedly running already-falsified negative mutations. The corrected bounded campaign stopped each mutation after its first counterexample **without raising budgets**, and fully covered both finite games.

### Necessary-guard falsifiers

- Removing P1's immediate-win guard makes an otherwise positive response incorrectly claimed favorable. A real 4x3 sequence `111223332` and a 4x4 witness are preserved.
- Omitting the **upper exposed singleton** loses exact positives, such as the 4x3 sequence `111223442` and 4x4 sequence `1111232322344`.
- Omitting source two-cell P0 requirements `{x,z}` from the composed OR–AND–OR pullback falsifies the correct P0 winning-action set on actual physical 4x3 sequence `11122243`, and 4x4 `111122223434`.
- Omitting parent upper singleton/pair threats also falsifies the composed P0 winning-action set on actual 4x3 sequence `11122344`, and 4x4 `111122233233`.

These are failures of mathematically necessary local clauses, not failed attempts to guess a winning policy.

## 4. What has and has not been achieved

**Achieved:** Two exact, geometrically derived *short-horizon* strategic quantifier-composition identities:

1. a one-operation P1 universal response filter for next-turn P0 immediate wins, with an O(W^2) monotone Boolean polynomial instead of P1 continuation exploration;
2. an exact `exists P0 / forall P1 / exists immediate P0` action-set transformer from the **original residual q**, which needs only residual requirements of size at most two and constructs **zero** intermediate q states.

This directly addresses a small piece of the owner's nonbranching research goal: there is actual algebraic quantifier elimination, not merely forward discovery by another name. The complete recursive/branching algorithmic core remains established regardless.

**Still OPEN:** A reusable compact composition law for **unbounded alternating depth**. Repeating exact one/two-turn formulas might introduce higher-order residual relationships and mixed reply covers whose symbolic width grows exponentially. The earlier RBA four-front/antichain-semiring results demonstrate exactly this danger; a fixed-horizon polynomial is not proof of a generalized polynomial solver. Genuine full-game branch elimination, minimality, and recursion elimination are not claimed.

## 5. Next precise vertical research target

Use the new rank-local `A_<=2(q)` operator as a **structural algebraic base case**, not as a precomputed move oracle. Attempt one additional universally quantified P1 layer using the *same source-state residual representation* and fixed-word cofactor/adjoint identities:

\[
\operatorname{Pre}_{P1}^{\forall}(A_{\le2})
\quad\text{as an exact single parent-state descriptor.}
\]

Do not run forward candidate move search. Derive the necessary source-requirement degree and response-correlation guards **before** evaluating states; if a compact normal form fails, record the minimal mixed-reply obstruction. Compare with existing RBA semiring and four-front closures before naming anything new. Validate against the verified recursive q core and physical small-board controls **after** the algebra is frozen.

A successful single next layer would progress toward 3-P0-own-move closure and the empty 4x3 test. It may still require more complex expression structure; no expectation of guaranteed compactness should be embedded in the premise.
