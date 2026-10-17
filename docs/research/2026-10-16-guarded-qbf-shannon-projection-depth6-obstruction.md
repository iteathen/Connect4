# Exact alternating-QBF cofactor projection: bounded success and depth-six retained-node obstruction

**Date:** 2026-10-16. **Canonical research owner:** `research/semantic-quotient`.  
**Status:** Sound generic quantified Boolean projection law; local implementation and independent bounded physical controls PASS; canonical `44444` lower thresholds at k6 BUDGET_EXHAUSTED. Unrestricted game W/D/L remains UNKNOWN. No authority promotion, solver adoption, or merge.

## 1. This experiment closes a different question than formula construction

The preceding full-horizon work established a polynomial-size exact *representation* of the full 37-ply `44444` value problem as a source-only guarded QBF/CNF, with a certified trunk-aligned CNF pathwidth upper bound 232. **Representing** an alternating game in a compact formula does not compute its quantified truth. The next falsifier must perform actual quantified elimination, without independently searching concrete future q states and without uncounted blowup hidden in a circuit.

Freeze before run: `research/isograph/discovery/2026-10-16-algorithmic-core/GUARDED_ACTION_QBF_PROJECTION_PLAN_0_1.md`.
Producer: `guarded-action-qbf-project.mjs`; control: `guarded-action-qbf-projection-control.mjs`; evidence: `GUARDED_ACTION_QBF_PROJECTION_RESULTS_0_1.json` in the same discovery directory. The source QBF is constructed only from source h,R0,R1 and original winning-line residuals; the producer never enumerates move histories, child q states, solved labels or winning policies.

## 2. Exact projection theorem, independent of game solving

Because every source QBF Tseitin auxiliary is uniquely forced by preceding action inputs, substitute the deterministic AND/NOT DAG for the auxiliaries, leaving Boolean matrix `F(x_0,...,x_n)` over the original ordered action bits. At the **innermost** remaining bit x, for either quantified type,

    exists x . F  =  F[x=0] OR F[x=1]
    forall x . F  =  F[x=0] AND F[x=1].

Apply that identity bit by bit **from right to left in the actual action prefix**. Quantification of individual bits inside one action block is legitimate because they have the same quantifier; do NOT commute the P0 and P1 blocks. A complete elimination reduces F to constant 0/1, and its truth is exactly the source-q guarded Bellman threshold established by the full-depth translation theorem. This is a straightforward Shannon/Boole algebra identity, not a novel claim of polynomial QBF elimination.

Implementation uses signed-edge Boolean gates, structural hash-consing, exact action-bit support masks on every gate, and recursive cofactor substitution only through nodes whose Boolean expression still depends on the target input. It tallies visits, constructed AND gates, retained nodes and quantified action bits. This compresses syntactically repeated subexpressions, **not arbitrary semantically equivalent Boolean cofactors**.

**Work model:** maximum 60,000 *retained* source+new AND gates, 300,000 nontrivial cofactor visits and gate constructions, original cap 10,000 support representatives (zero), 15 seconds per query. The program retains old/cofactored nodes and has no garbage collection. A node-budget failure is a concrete implementation limitation, NOT an exact minimum-width bound for the game or proof logic.

## 3. Independent physical falsification and actual results

The separate validator constructs physical gravity boards from legal histories, checks actual K-in-a-row first wins, draw at full board and P0 max/P1 min recursively to the same cutoff. This physical game enumeration occurs **only on the validator side**. The source QBF constructor and its Shannon projection have zero gameplay successor traversals and no solver/oracle labels as inputs.

Node22.16.0 local controlled execution: 30 (source,horizon) cases across 4x3 Connect3, 4x4 Connect4, and standard 7x6 Connect4. Four root thresholds each = **120 exact projection attempts**, of which **118 COMPLETED and matched independent finite-horizon physical value with zero discrepancies**, while two k6 `44444` lower thresholds were explicitly PARTIAL due to the retained-node cap. This is not an external QBF-solver certification or maintained Node26 qualification.

| Canonical `44444` future horizon k | Wlo / Nlo projection | Whi / Nhi projection | Peak retained nodes, lower / upper | Nontrivial work, lower / upper |
|---|---|---|---|---|
| 1 | FALSE / FALSE, exact bounded | TRUE / TRUE, exact bounded | 24 / 20 | 46 / 0 |
| 2 | FALSE / FALSE, exact bounded | TRUE / TRUE, exact bounded | 164 / 160 | 268 / 244 |
| 3 | FALSE / FALSE, exact bounded | TRUE / TRUE, exact bounded | 600 / 405 | 1,354 / 649 |
| 4 | FALSE / FALSE, exact bounded | TRUE / TRUE, exact bounded | 2,606 / 1,870 | 7,020 / 4,684 |
| 5 | FALSE / FALSE, exact bounded | TRUE / TRUE, exact bounded | 9,649 / 9,033 | 27,563 / 25,709 |
| **6** | **BUDGET_EXHAUSTED / BUDGET_EXHAUSTED** | **TRUE / TRUE, exact bounded** | **60,000 / 53,920** | **147,262 / 159,492** |

At k6, the two lower thresholds exhaust 60,000 retained nodes after **12 of 18 quantified action bits**. Neither the 300k nontrivial-op ceiling nor the 15s deadline caused the stop (the local lower failure took about 81–83 ms). The k6 upper thresholds completed all 18 action bits and returned TRUE; this is only a finite-horizon **upper** truth and does not certify the unrestricted game value.

At k5 and earlier, `44444` lower/upper still enclose `[-1,+1]`. At k6, no complete lower/upper pair exists. No new standard 7x6 winner or literal-action optimality conclusion is justified.

## 4. Structural interpretation and negative result

An exact quantified-action **formula** for all 37 future moves can be built economically, but naïve right-to-left Shannon DAG projection exhibits rapid blowup in *intermediate retained syntactic obligation size* already at k6. This is a different wall from the old k12 13,524-support orbit ceiling:

- Earlier reflected *source-owner BDD* method: k11 compilation completed with 9,366 supports, 16,511 peak nodes, 268,341 nontrivial operations, value still UNKNOWN.
- New guarded *action-bit QBF* representation: k37 CNF constructed in 12,436 variables, 36,976 clauses, stage-local pathwidth UPPER bound 232, truth not evaluated.
- New *Shannon projection* evaluator: k5 threshold truth complete but still UNKNOWN interval; k6 lower stops at 60k retained AND nodes. Not competitive with the earlier BDD for present bounded value approximation.

This comparison specifically rules out the premise that small structural QBF encoding size, or a 232 certified bilateral-width upper bound, automatically entails cheap global quantifier evaluation. It does **not** refute exact compact elimination using genuine semantic cofactor equality, garbage-collected live DAGs, shared structured decomposable representations, a different ordered variable schedule, or the Ganian–Gründel mixed resolution/strategy-extension algorithm.

## 5. Best justified continuation

**First priority:** measure the **reachable live** post-quantifier DAG at every quantified bit and the quotient of *distinct Boolean future cofactors*, independent of syntactic hash equality. A monotone live-node/garbage-collection correction may remove this particular 60k retained-node wall; however, do not confuse lower retained memory with fewer Boolean operations or with true semantic cofactor compression.

**Second:** compare the existing source-frequency reflected interval BDD with an exact ordered ROBDD / structured-DNNF projection carrying all literal action thresholds; avoid replacing its favorable source-owner variable order with a generic action-bit prefix by assumption. Keep FIRST terminal/illegal guards and original alternating P1 universal scope.

**Third:** attempt Ganian–Gründel P1/P2 resolution/strategy-extension over actual quantified CNF only if the relevant interface can be bounded much more tightly than the current path-width upper bound 232. The theorem's f(k) is still unknown/likely expensive for current k; counting formula clauses is not a solver performance proof.

Any further cutoff experiment must freeze budget, source algebra and falsifiers first. A width/impossibility statement requires a **mathematical lower-bound witness**, not running out of a chosen representation. Retain all `44444` and old negative evidence.

**Final disposition:** Exactly **118 bounded QBF projections passed independent physical WDL threshold controls; 2 k6 lower projections hit the original 60k retained-node cap.** Full unrestricted `44444` WDL remains **UNKNOWN [-1,+1]** and the exact recursive core remains complete.
