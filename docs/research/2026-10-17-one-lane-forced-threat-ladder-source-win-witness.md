# Exactly one future lane: source threat-ladder certificate for ONE best winning continuation

**Date:** 2026-10-17 Pacific. **Project owner direction:** compute **one certified best Level-2 continuation** without separately evaluating competing strategic future games. **Canonical branch:** research/semantic-quotient. **Status:** source-only sufficient theorem frozen BEFORE independent real standard7×6 controls; not a general L2 solver or qualified IsoGraph 1.2 promotion. Symbolic width W, height H, connect length K, tests strictly original W=7,H=6,K=4.

## Hypothesis and candidate structure

A legal source q=(h,R0,R1), P0-relative original residual antichains, and player p=sum h mod2 to move. At each turn for p, an original legal column a lands at x=(a,h_a). The candidate SOURCE constructor examines current q masks for local landing/threat relations ONLY; it does NOT value q_after_other_a as a game or inspect its future. The selected column is chosen by a deterministic non-value-based static priority. Only the SELECTED action's q is materialized (one continuation lane).

Define win target immediately after p's chosen nonwinning action a:

    y_d=(d,h_d+[d=a]) where new height < H.
    WIN_p_AFTER_a(d) iff
      {y_d} in R_p(q) OR {x,y_d} in R_p(q).

The first disjunct is an already-present singleton now playable; the second becomes singleton when p owns x. These are direct masks of CURRENT original q, not a recursive post-action game query. Multiple original requirements for the same future landing cell count as ONE distinct legal d.

Define opponent immediate counterwin after a:

    COUNTER_o_AFTER_a(d) iff {y_d} in R_o(q).

An opponent requirement containing x gets BLOCKED by p's first move, never contracts; one of its remaining doubletons cannot become a newly winning opponent singleton. Thus the exact opponent immediate win test is just the current opponent singleton relation at the new playable physical landing cells. The selected initial action could itself be an owner immediate win:

    IMMEDIATE_p(q,a) iff {x} in R_p(q),

and that terminal first-win takes precedence over all counter-win tests.

## Closed forced-threat ladder law

The source constructor chooses one current original legal a (deterministic structural action priority). A positive WIN certificate is valid if one of:

1. **Immediate:** IMMEDIATE_p(q,a) holds. Win now, first terminal.
2. **Two-way fork:** a is nonwinning, COUNTER_o_AFTER_a is false for ALL next playable opponent columns, and |{d:WIN_p_AFTER_a(d)}| >= 2. Opponent has only ONE next move and cannot immediately win; at least one DIFFERENT column's p singleton is unblocked, p wins at its next turn (a standard source fork boundary).
3. **Single forced reply:** same no-opponent-counterwin guard, but exactly ONE distinct playable p immediate winning target b, and the board is not already or about to be full-drawn. Opponent is strategically FORCED to put their next stone in literal column b: otherwise p plays b next and wins, because they cannot win immediately themselves and b remains playable. The one allowed blocking move b is known from original q masks. Apply only q_after_a and then q_after_a,b (one normalized original cofactor each, via qualified q-core), check first-win/draw terminals; if a,b leaves a nonterminal q' with p to move, require a further certificate of this SAME form on q'.

If the selected single threat is blocked and q' has no successful certificate, the parent is INCOMPLETE, not a loss. By backwards induction over the finite number of forced rounds, a successful terminal/fork certificate proves the original first action a is a GUARANTEED WIN for p against EVERY opponent strategy. Every opponent deviation is covered by the primitive p immediate win on their next turn, not by evaluating the value of the deviating child's game. There is no need to inspect the WDL or best-move status of the other currently legal p columns. The returned a therefore belongs to Level2 B_PERFECT(q) because WIN is maximal.

This is an EXACT source-to-game theorem for guarded certificate SUCCESS. It does not claim completeness: an opponent may have multiple ways to answer a threat with a winning move; the counterwin guard prevents unsoundness. A failing ladder gives NO result. Draw-first and full-board stopping are preserved: if the forced blocking reply fills the board without prior p win, no positive win certificate may be emitted.

## Source execution restriction

At each same-player selected turn:
- Inspect at most all CURRENT ORIGINAL legal literal landing cells as static win/fork/singleton proof candidates using the q masks; construct NO game q for these rejected or unchosen columns.
- If any static immediate-win or two-way-fork certificate exists, choose a fixed deterministic member and **STOP** with positive outcome (using only source masks).
- Otherwise, select at most ONE single-threat candidate according to a fixed deterministic structural ranking, and follow only its forced opponent reply; NO alternative single-threat q branches, NO backtracking.
- At the next p turn do the same. If selected lane fails, emit INCOMPLETE. The source may recompute the current local masks in the NEW single forced q, but this is one lane and not parallel future strategy search.
- Explicitly charge all static candidate mask comparisons and every SELECTED q state built; zero game recursive value queries; maximum evaluated strategically distinct future lanes <=1.

This is more general than the source immediate/double threat because the p win may result after TWO or MORE forced rounds. The proof's topological shape resembles a one-lane forcing-line certificate, not minimax. Do NOT confuse a finite forced ladder with a strategy table enumerating competing futures.

## Frozen original-board experiment and falsifiers

1. Implement standalone ESM source constructor with W/H/K symbolic, original q-core single-step cofactors only for selected source lane, and no `solve()`, solved policy lookup, or independent physical board in producer. Freeze it on research branch before running.
2. Run on genuine REAL 7×6 FIRST-WIN-STOPPED physical sources from deterministic non-winning histories, including canon prefixes `44444`, `444444`, and phase/column-completion cases. The independent physical evaluator must be a separately implemented first-win-stopped recursive WDL reference and only used AFTER a producer has certified a starting action. Compare exactly action WDL with P0/P1-relative winner, and verify each forced blocking trace and deviation property on actual physical moves.
3. Separate single-step forks, ≥1 forced reply ladder certificates, deeper forced ladders, and missing future proof outcomes. Any positive source result already covered by the old direct two-turn frontier is a non-novel source WIN but still qualifies for ONE certified continuation; the new marginal contribution requires ≥1 forced-blocked round where no prior single-step fork/instant-win sufficed.
4. Reject spurious success caused by opponent immediate counterwins, gravity-unplayable singleton lines, a forced blocking move filling the entire board for DRAW, or restarting analysis after a first terminal.
5. No inference of arbitrary-source total Level2, no source WDL from failed certificates, no unjustified early canonical `44444` value, no oracle-driven candidate ranking/hidden search. Standalone local V8 control is NOT the maintained Node26 CI or external formal verification.

## Further mathematical target

If positive multi-round certificate examples exist, investigate a **non-recursive source invariant** characterizing existence of such forced chains directly from a column-height/line-release DAG, with the same strong opponent counter-win guards. The objective remains eliminating even the ONE necessary forced-response lane by deriving a closed structural normal form for guarded forcing ladders. Nothing here proves that arbitrary L2 can be solved without search.


## Deterministic one-lane partial winner functional

Define `DirectWin(q)` as the ORIGINAL q source response-cover Boolean theorem that certifies an immediate mover win or winning next mover turn, without future q evaluation. For any q where `DirectWin` is inconclusive, the source scans only its CURRENT literal action masks and chooses a single pair `(a(q), b(q))` satisfying:

- current mover p plays a nonwinning original action `a(q)`;
- o has NO immediately winning next response;
- p has **exactly ONE concurrently playable winning threat** in literal column `b(q)`;
- this threat is NOT already covered by the same-column direct stacked release theorem.

Choose the single candidate by a fixed SOURCE priority: descending number of current original owner residual win generators containing the candidate landing cell; ties by original literal ascending column. Construct only the cofactor after chosen p action a and the one strategically forced blocking opponent reply b. Every other opponent first reply allows p to win immediately at b, as shown by the source threat guard.

Thus the partial Boolean winner certificate satisfies the sound implication

    C_p(q) :=
       DirectWin_p(q) OR
       (ChosenForcedThreat(q) AND
        C_p( T_{b(q)}(T_{a(q)}(q)) )).

Only ONE q-successor lane of length two is instantiated per forcing round. If that lane never reaches `DirectWin`, return INCOMPLETE, not loss or an alternate policy exploration. Remaining W*H-n strictly decreases by two on every selected forced block, providing a well-founded finite recursion and proof by backward induction. This is a STRATEGY-CERTIFICATE path, not a traditional game-tree search or complete q-value recurrence.

**Important complexity accounting:** scanning all CURRENT original legal action masks to select one p forcing action is source proof construction, not alternative future-game valuation. Explicit source counts include all local candidate static tests and future q cofactors on the ONE selected forcing lane. No backtracking, no BDD/QBF/strategy-graph construction, no future values of unselected actions.

## Executed original standard7x6 independent conformance

Frozen source `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-source-single-forced-threat-ladder.mjs`, independent physical checker `standard7x6-one-forced-lane-independent-physical-control.mjs`, and machine results `STANDARD7X6_SINGLE_FORCED_THREAT_LADDER_VALID_CONTINUATION_RESULTS_0_1.json`.

**1700 deterministic nonwinning FIRST-WIN-STOPPED actual7×6 physical game trajectories, 56,712 unique original legal source q:**

| Certificate forced opponent-block rounds | Source-proved winning original root continuations |
| --- | ---: |
| 0 (already direct winner) | 32,614 |
| 1 | 338 |
| 2 | 201 |
| 3 | 96 |
| 4 | 29 |
| 5 | 5 |
| 6 | 2 |
| **At least 1; direct source previously inconclusive** | **671** |
| **All winning root continuations certified** | **33,285** |

An additional **7,137** source evaluations selected a forced lane but failed to finish a winner certificate: they were correctly marked **INCOMPLETE**, with NO alternate source game lane tried. The source materialized 22,702 total q cofactors along selected forced lanes across the sampled roots and never valued a competing future game (maximum strategically live lane fanout **ONE**).

The independent original7x6 physical validator checked **6,627** off-threat opponent deviations (all allowed mover immediate first-win), **1,181** on-threat forced opponent blocking responses, and **59,529** direct final-stage opponent replies (each admitted mover physical first-win before any reply could win/draw). No discrepancy with original first-win game semantics, and **75** independently branching full physical perfect-WDL reference checks for late successful selected actions confirmed mover WIN exactly.

**Concrete new early source witness, original history `243766762437135` (rank 15, P1 to move):** deterministic SOURCE selects column 4, generating exactly one immediate P1 threat in column 4. P0 must block 4; any other P0 move permits P1's immediate win on 4. After that single forced reply, source's direct gravity-release theorem certifies P1 winning action 7 using stacked targets in column 5; EVERY intervening original physical reply was independently checked. The old direct source response-cover root returned INCOMPLETE. This is an exact **Level2 best winning continuation certificate** without independently valuing any alternative future game.

**At least two actual standard7x6 source positions required SIX selected forcing-block rounds** before the source direct winner. Those chains can be much longer than the 3-ply closed response-cover; this finding is about source **winning guarantee**, not Level3 shortest-win timing. Canonical `44444` remains INCOMPLETE.

**Qualification:** This is a restricted-domain total-return-on-success procedure, not arbitrary 7x6 full L2. The source construction examines several CURRENT literal actions' static residual masks but builds one strategically forced future q lane. No alternate strategic future WDL is evaluated, not even after a chosen lane fails. Complete optimal move set is not returned. Tests are deterministic, nonuniform original board histories, local isolated V8 execution; external formal peer proof and maintained Node26 CI not run. Qualified game-theory IsoGraph authority 1.2 unchanged.
