# P1 universal preimage of bounded P0 winning region — precommitted plan 0.1

**Date:** 2026-10-16. **Canonical research branch:** `research/semantic-quotient`. **Starting verified head:** `84266f19a59a66101665590d0068ea672e8a8cd6`.
**Primary objective:** derive the next exact algebraic one-descriptor alternating-quantifier composition; forward game-tree policy discovery, search-generated 46/47-node winning certificates and WDL labels are VALIDATION ONLY.
**Authority:** qualified q_o state/cofactor and first-win semantics; no promotion or production implementation.

## Frozen theorem candidate (pre-test)

Start with a legal *P1-to-move* nonterminal residual state q=(h,R0,R1).
The precise horizon predicate is

```text
For EACH legal P1 first action b,
  P1 does not win immediately,
  and there EXISTS one P0 response a such that:
    P0 immediately wins,
    OR for EVERY P1 next action d,
         P1 does not win first, and P0 has an immediate terminal answer.
```

This is a **P1 universal / P0 existential / P1 universal / P0 existential** bounded P0-win condition. It does not assert an eventual P0 win or all optimal moves.

For source P1 landing `x_b=(b,h_b)` and legal adaptive P0 reply landing
`y_a=(a,h_a+[a=b])`, define the later potential P1 landing
`z_c=(c,h_c+[c=b]+[c=a])`, and `u_c` immediately above z_c when it exists.
Columns have enough capacity iff the corresponding row lies within H.

All these are **deterministic support arithmetic**; do not generate child
q states, apply recursive game-value evaluation or enumerate move histories.

Use only normalized residuals from the ORIGINAL q:

```text
P1FirstWin(b)     = ({x_b} in R1)
P0WinNow(b,a)     = ({y_a} in R0)
P0Threat(b,a,c)   = ({z_c} in R0) OR ({y_a,z_c} in R0)
P0Upper(b,a,c)    = ({u_c} in R0) OR ({y_a,u_c} in R0)
P1SecondWin(b,a,c)= ({z_c} in R1) OR ({x_b,z_c} in R1)
```

These formulas follow exactly from P1 owner-true, P0 false, then P0 owner-true, P1 false cofactor order. The landing x_b,y_a,z_c are distinct, and the source P0 requirements blocked by x_b cannot contribute to singleton or pair completions after P0's one move. Source P1 requirements blocked by y_a cannot contribute to the next P1 singleton. Zero-size terminal requirements are checked first.

For each (b,a), let L_{b,a} be all legal c after the two placements.
Let T_{b,a}, U_{b,a}, B_{b,a} be the column masks arising from these
source predicates. Then the previously qualified algebra gives

```text
ExactTwoMoveResponseSuccess(b,a)
 = P0WinNow(b,a)
   OR (
      nonterminalAfter(b,a)
      AND B_{b,a}==0
      AND (
           popcount(T_{b,a})>=2
        OR (popcount(T_{b,a})==1 AND ((T_{b,a}&U_{b,a})!=0))
        OR (T_{b,a}==0 AND U_{b,a}==L_{b,a})
      )
   )
```

Apply P1 first-win guard to every b.

**Response-cover matrix:** instead of building P1 child game positions,
for each P0 action column a, construct one **P1 b-mask** K_a containing
exactly the first P1 replies b against which a is a bounded P0-win
answer. If a is not legal after b, b is absent from K_a.

```text
CoveredP1Replies(q) = OR_a K_a
UniversalP0TwoOwnMoveWin(q) = (CoveredP1Replies(q) == L_initial)
```

This is a single symbolic cover object returning the coverage masks and
adaptive P0 response choices **without recursively evaluating separate
game continuations**. The producer may enumerate a bounded W×W
action-incidence matrix and scan later P1 *landing labels* in O(W³)
source-residual tests. This does not claim zero local work or no finite
label enumeration, and does not automatically prove a compact
arbitrary-depth representation.

**Unexpected degree bound to test:** Source P0 residuals of size at most 2
suffice for this entire 4-ply bounded pattern because P0 adds at most two
stones before its terminal. Source P1 residuals of size at most 2 suffice
to detect either P1 terminal. Prepending P1 turns increases alternating
response correlation but not the maximal source residual degree for a
*fixed number of claimant placements*. Degree growth should therefore
be separated from mixed-reply/quantifier width growth.

## Independent executable qualification

1. Commit an implementation of these source-state formulas **before**
   any physical validation.
2. Compare with a separately authored physical first-win/Connect-K
   move-checker on all reachable legal P1 states in **4×3 Connect-3**
   (2,208 states) and all 4×4 Connect-4 P1 states if budget permits
   (67,992 states). The validator may physically scan P1 b, P0 a,
   P1 d and P0 immediate finish, but the candidate **must not**.
3. Also compare each (b,a) matrix cell with the previously established
   `direct-two-move-pullback.mjs` applied to an actual q child **in
   validation only**. This comparison is a separate exact-algebra crosscheck
   and cannot supply candidate values.
4. Include a representative seeded 7×6 late-rank fixture set and
   `44444` if within budget, no oracle/full-root solving.
5. Record first-win guards, P0 reply masks by P1 b, distinct covers,
   matrix-cell checking work, root bounds, first positive physical
   examples, and failure witnesses.
6. Mutation controls must delete source R1 two-cell antecedent
   `{x_b,z_c}` or P0 source `{y_a,z_c}`; reject if actual physical
   cases falsify them. Record if no natural physical witness occurs.
7. Commit evidence and doc/continuation routing regardless of result.

**Caps (unchanged prior ballpark, predeclared):** maximum 200,000
validation reachable states, 800,000 physical validation transitions,
300,000 local producer (b,a) row evaluations, and 30 seconds **per
board**. Stop before overruns; declare PARTIAL rather than inflate
resources. Source membership probes may be substantially more than row
evaluations; count separately. The 7×6 control is limited to 12 seeded
late P1 states, 4,000 legal fixture attempts, 30 seconds/30,000
physical checks, seed `0x4c2a2028`. No 7×6 empty-root WDL search.

## Success criteria and epistemic boundary

Exactness: the two-source-residual response-cover matrix matches
independent bounded physical outcomes for all validated cells, and its
aggregate universal mask matches the physical quantifier, including
draw and P1-first-win guards.

Computational claim: **one more bounded alternating P1 quantifier
is eliminated as a separate game-state construction**, with source
degree 2 and polynomial local label work. Do not assert generally
branch-free solution, polynomial root solver, minimized core or all
WDL/strong scores. Existing qualified recursive/branching core is
not demoted by negative results.
