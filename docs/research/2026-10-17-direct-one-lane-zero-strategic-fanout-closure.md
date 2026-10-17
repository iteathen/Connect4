# Direct structural W/D/L and all optimal moves with ZERO strategic branching: exact restricted-domain closure

**Date:** 2026-10-17 Pacific. **Canonical research owner:** `research/semantic-quotient`.  
**Research direction and zero-branching success criterion:** Josh Oshiro.  
**Status:** Four elementary exact source invariants, an exact two-turn source frontier certificate, one strictly nonforking continuation law, full-future equivalent-action grouping, and WDL interval best-set separation. All of these preserve first-win gravity semantics and return exact unrestricted `(V(q), ALL optimal literal actions)` on a **restricted but nontrivial subset of legal positions**. **The universal zero-branch Connect Four algorithm remains OPEN.** No authority promotion or merge.

## 1. Owner requirement and what is not a solution

**BRANCHING elimination**, not faster game-tree search, fewer search branches, BDD/QBF node compression, scalar action-query pruning, or solved policy lookup. At every game-semantic evaluation step there may be **at most ONE independent unresolved future game state**. An equivalence set of multiple moves counts as one logical outcome only when the source proves the requisite WDL equality, and using a single successor as a representative requires full future-behavior congruence. Any two inequivalent unresolved future alternatives force an **INCOMPLETE** result, not trial and error.

The already qualified recursive exact residual-q solver is constructively complete. It branches. It is the independent reference for these experiments, NOT a component of the proposed zero-branch evaluator.

The desired result is exactly `Z(q)=(unrestricted P0-relative W/D/L value, complete mover-optimal literal move set)`. **Exact numeric values for provably inferior actions are NOT necessary** when their strict inferiority is already established.

## 2. Source-only first-win / short-threat equations that certify COMPLETE unrestricted action outcomes

Let q=(h,R0,R1) be normalized, legal and nonterminal. Player p to move is the parity of `sum(h)`, opponent o=1-p, and current gravity-playable cell in legal column c is `x_c=(c,h_c)`.

Source-local predicates inspect q and literal legal columns, never construct successor q, game futures or solved value labels.

**A. Immediate owner win:** If `R_p` contains singleton `{x_c}`, moving c wins immediately (P0-relative +1 for P0, -1 for P1), before any opponent can reply.

**B. Opponent immediate win after a nonwinning move c:** Let y_d be each opponent's NEXT gravity-playable cell, with next row in c and same row elsewhere. If some source `R_o` contains exact singleton `{y_d}`, opponent can win on its next turn. That threat is not erased by p's placement x_c because y_d is distinct from x_c. Thus action c's exact unrestricted WDL is opponent win. The source checks all legal next playable cells but does NOT evaluate those opponent continuations.

**C. Double immediate threat created by mover c:** Suppose A has not already won, B proves opponent cannot immediately win, and after p occupies x_c at least two **distinct** currently playable next-turn cells y_d are source-certified P0/P1 singleton targets. One of these arises if the original owner residual has `{y_d}` or `{x_c,y_d}`: exact owner-true contraction removes only x_c. Opponent has one stone and can cover only one of TWO distinct columns; without an immediate counter-win the mover completes an uncontested first win on the next turn. Thus c's exact unrestricted WDL is mover win.

**D. Both future winline families become empty:** If `R_p` is empty initially and every original opponent requirement contains x_c, p's nonwinning move blocks every opponent line while owner still has none. Subsequent contractions/deletions can never introduce a new completion requirement: the entire future game must draw. Action c's exact unrestricted WDL is 0.

If EACH legal action c is covered by A–D or an earlier permitted exact source rule, its complete WDL action vector and the root min/max and ALL tied-optimal labels follow from ONE finite source-local scan with **no future q object at all**. First-win event precedence is crucial: A overrides B, B overrides C, and an actual full-board nonwinning last move is a DRAW.

Additional qualified direct source rules: both `R0=R1=empty` implies all legal actions lead to DRAW; when one column remains playable, all future owners are fixed by rank/row parity, so the earliest source residual completion determines the unique WDL without simulating moves; a first-player residual blocked by a gravity-safe fixed matching of remaining vertical/horizontal future-cell pairs together with no P1 winline implies DRAW and all P0 first moves tie.

**Proof boundary:** All these are sufficient source patterns, not yet a complete normal form for arbitrary Connect Four.

## 3. Single-lane theorem: structural exact values + ONE unresolved future class

Let E(q) be the source-certified exact action-value labels and U(q) their complement. If U is empty, direct output. If U has one label, take its ONE exact q cofactor and recursively apply the SAME source-only algebra. No other game's value is evaluated. If U has two or more labels, reduce them only by **proven full-future behavioral equivalence** (source horizontal reflection, original-source P0/P1 winning-upset equality under one fixed height-compatible action transporter, or dynamic inert-column neutral-token bisimulation). A full-future class is ONE semantic unresolved future; choose one representative from that class, carry its exact WDL to every class label. If two or more inequivalent unresolved classes remain, return INCOMPLETE.

**Formal proof by decreasing rank:** Every source-certified value is exact by Section 2. Future-equivalent children have identical WDL under full game automorphism/bisimulation. If a unique chosen child is resolved by the inductive hypothesis, its scalar value propagates to exactly its certified class; every other action already has an exact source consequence. One max/min over all literal labels gives unrestricted WDL and EVERY optimal move. At any stage there is at most ONE game-semantic descendant. Terminal-first and gravity guards are inherited from the qualified q core. This proves a *restricted-domain zero-fanout evaluator*, not a total Connect Four solver.

**Important safety distinction:** Merely equal short-horizon `S_b` response masks are insufficient to group unknown actions: legal 4×3 `111` replies2/3 have equal bounded signature and different full WDL +1/0. Also a weak scalar WDL order does not establish full-future program equivalence.

## 4. Source W/D/L order algebra without game futures

The three-valued WDL lattice is `−1 < 0 < +1`. Source full-future P0-relative dominance `V(a)≤V(b)` creates exact interval implications:

    lower(b) >= lower(a)
    upper(a) <= upper(b).

Initialize `[lo,hi]=[-1,+1]` for unknown actions; source-certified WDL values are exact anchor points. Repeated interval propagation is monotone and stabilizes in finitely many steps in the three-point lattice. These implications concern the **entire future game**, not bounded response masks. Convergence to a singleton makes the action's unrestricted numeric WDL exact without evaluating any future.

A source WDL preorder may also select ONE extremal still-unknown behavioral class under the mover's correct max/min ordering; evaluate ONE class representative, propagate its exact value, and STOP if any other action value or optimal-set membership remains unproved. Do NOT continue with a second class.

Independent generic order falsifier: **4,096 directed four-action weak-order graphs**, **331,776** three-valued assignments considered, **33,792** satisfying their certified edges, each with 16 source-anchor subsets (**540,672** propagation experiments). Across **2,162,688** resulting action intervals, 1,519,304 certified singleton action values matched their source-compatible assignments. No false bounds, false exact WDL or overlooked contradictory source-anchor mutation.

## 5. Stronger result: exact optimal sets without computing inferior numeric WDL

Earlier implementations required the exact WDL of EVERY action. The actual user output contract requires ONLY the exact root WDL **and** exact set of tied optimal labels. This permits a stronger zero-branch source theorem.

Suppose all action values are soundly bounded by `[lo_c,hi_c]`. Define `rootLow=max lo_c`, `rootHigh=max hi_c` for P0 MAX; for P1 MIN use min for both. If `rootLow=rootHigh=V`, unrestricted root WDL is exactly V.

**P0 MAX:** c is certified tied-optimal if `lo_c=V`; c is certified strictly inferior if `hi_c<V`.  
**P1 MIN:** c is certified tied-optimal if `hi_c=V`; c is certified strictly inferior if `lo_c>V`.

If every original legal label satisfies one of those predicates, the output `(V,M*)` is exact even if some inferior action remains bounded by e.g. `[-1,0]` instead of a known numeric result. If any label is neither optimal-certified nor strictly-inferior-certified, the complete best set remains UNKNOWN; do not invent ties or exclude possible ties.

**Proof:** Suppose P0 root upper bound is V; then every `hi_c<=V`. If `lo_c=V`, interval forces true value V. If `hi_c<V`, true value is strictly inferior. For P1, the dual conclusion follows from `lo_c>=V`. The min/max soundness of intervals certifies root V, and the two exclusive label cases certify the entire exact optimal set.

This is an algebraic point relevant to **zero branching**, not a solver speed argument: we no longer ask strategically unnecessary questions about the precise values of already-proven inferior moves.

Generic falsifier: the same **4,096** four-action weak-order graphs and **540,672** source-compatible anchor configurations were tested for BOTH possible mover parities, **1,081,344** optimum-membership checks. Exactly **435,728** returned complete WDL and all-best-label certificates, of which **20,352** left one or more inferior actions' numerical WDL open. **Zero wrong root values or tie sets.** Those are abstract finite relation tests, not a frequency prediction for legal Connect Four.

## 6. Independent game conformance and incremental proven domain

All exact small-board legal q states were generated independently using the qualified recursive q core; no solved values, winning policy table or future continuation labels entered the source-only producer. The candidate was executed on each q **before** its WDL and optimal actions were compared with the independent reference. Source-algebra modules and reference are separate. The two full board reference corpora also have independent physical reconstruction controls from earlier checkpoints.

| Source-only / single-lane qualified stage | All 4×3-c3 q states (3,734) | All 4×4-c4 q states (34,094) |
|---|---:|---:|
| Initial direct source certificates | 925 | 1,202 |
| Source frontier full first-action short-threat closure | 2,019 | 2,866 |
| Exactly one unresolved continuation | 2,881 | 5,978 |
| Full-future equivalent unknown action SET as one continuation | 2,908 | 6,521 |
| Source full-future WDL lattice implication | 2,910 | 6,581 |
| **Exact complete optimum without inferior numeric value** | **2,914** | **6,725** |

For the last row:
- every returned unrestricted root WDL and **complete tied-optimal move set** passed independent reference: **2,914/2,914** and **6,725/6,725**;
- zero falsely optimal or excluded literal moves;
- maximum strategic game evaluation fanout **ONE**, including deep single-lane recursion;
- **4** and **142** of the completed results respectively leave at least one provably inferior action's exact numeric WDL unresolved, while proving the correct complete best-move set;
- the earlier direct/frontier exact ACTION VECTOR controls verified every action numeric outcome in 2,019 and 2,866 cases, and the later strict best-set controls independently verified all returned action intervals against exact WDL when provided.

All tests ran by isolated V8 execution from exact fetched/committed GitHub sources, with reproducible executable controls and machine results in `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/`. This is NOT a maintained Node26 all-suite or an externally peer-certified proof.

## 7. Canonical `44444`, chronological moves 7/8, and remaining mathematical obstruction

The source-only candidate was explicitly tested on real standard 7×6 Connect4 prefixes:

| Source prefix | Historical mover next | Zero-fanout result |
|---|---|---|
| `44444` | P1 on absolute move 6 | **INCOMPLETE** |
| `444444` | P0 on absolute move 7 | **INCOMPLETE** |
| `4444442` | P1 on absolute move 8 | **INCOMPLETE** |

This does NOT undo the earlier PROVED structural move7/move8 column-completion transition and bounded defensive action sets. It correctly declines to promote those bounded structures to unrestricted WDL/complete optimal labels.

On the legal 4×3-c3 source `223`, the direct zero-fanout producer DOES certify exact P0 WIN with **ALL FOUR P1 move labels tied**. Independent qualified q reference confirms it. The legal 4×3 `111` and 4×4 `1111222` still return INCOMPLETE under these direct rules, even though their full game values can be independently computed. This is the required honest falsifier of the claim that the proposed structural invariant is total.

**The truly missing theorem** is a source-residual **long-range strategic winner/value invariant** that classifies positions with competing, non-equivalent and not-yet-locally-forced future actions **without** evaluating two or more of their futures. Short one-/two-turn threat and response-capacity laws, complete future-program equivalence groups and finite WDL weak-order implication currently leave those positions unresolved.

Possible next law to seek: a rank-independent guarded **obligation saturation / resource-feasibility** invariant (parity-controlled support deadlines, Hall deficiency with shared blockers, source residual threat reservoirs) that decides the complete WDL and action membership at once. Candidate proof must preserve first-win, column release/height, opponent counter-wins and true `forall b exists a` adaptivity; constructing exponentially many hidden game continuations inside a matrix/graph is not a valid solution. Any proposed new certificate should be derived from source q and falsified on `111`, `223`, `44444`, all small-board exact best sets, and chronological move7/8 support closure.

**Conclusion:** We now have a MATHEMATICALLY SOUND and independently tested nonbranching evaluator on substantial restricted state sets. The requested **total zero-branch exact Connect Four algorithm has NOT been found.** Search time and branching-factor reductions are not the success criteria; the experimental numeric caps remain safety controls, not theorem gates. No game-theory authority or solver merge.
