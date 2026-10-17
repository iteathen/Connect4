# Exact source-residual alternating-action QBF through full horizon, with verified bilateral path-width upper bounds

**Date:** 2026-10-16. **Canonical research owner:** `research/semantic-quotient`.  
**Research direction:** Josh Oshiro.  
**Status:** Deductive exact construction **conditional on qualified nonterminal source-q semantics**, finite bounded physical falsifiers, and explicit full-horizon structural CNF/path measurements. The quantified full-horizon formula was NOT DECIDED. No new game-theory authority, production solver, or merge.

## Primary question and external mathematical authority

The source-anchored reflected interval BDD for canonical `44444` completes eleven additional symbolic plies with 9,366 support-orbits but retains UNKNOWN [-1,+1]. k12 needs 13,524 reflected support orbits, above the 10k experimental cap. The research question is whether exact alternating adaptive obligations can be represented and ultimately eliminated without generating each intermediate support.

We investigated the **actual** full quantified Boolean formula interface rather than the 37-variable original residual hypergraph. A concrete new exact circuit/CNF translation constructs the ENTIRE 37-ply remaining game from the source residual antichain using a polynomial-size deterministic Boolean circuit. This is a new qualified representation *candidate* in this Connect4 research corpus. It is NOT an evaluated full-game result.

Relevant published theorem: Robert Ganian and Marlene Gründel, *Bilateral Treewidth for QBF: Where Strategies and Resolution Meet*, SAT 2026, Theorem 10, DOI https://doi.org/10.4230/LIPIcs.SAT.2026.16; primary complete proof https://arxiv.org/html/2605.06262v1, Sections 2, 4–5. It states an FPT time `f(k)|Phi||T|` if a sound **permutation dependency poset** and a **trunk-aligned tree decomposition of the actual quantified CNF** of width k are supplied. The function f(k) is NOT claimed practical for k=232. Capelli and Mengel, *Tractable QBF by Knowledge Compilation*, STACS 2019, DOI https://doi.org/10.4230/LIPIcs.STACS.2019.18, supplies the distinct structured-DNNF projection alternative. Neither paper automatically closes a Connect4 value.

## 1. Exact elementary source-q encoder

Let `q=(h,R0,R1)` denote a legal nonterminal first-win-stopped finite gravity game, N=W*H, source rank r=sum_c h_c, remaining cells m=N-r. Fix a horizon 1<=k<=m. The mover of future action t is `p_t=(r+t) mod 2` (P0 is 0). Let action block `a_t` use `ceil(log2 W)` bits. Choices 0..W-1 represent literal columns and all higher binary codes are **invalid**, never independent legal actions.

Let `d_{t,c}=[a_t=c]`. For each column c and nonnegative j define:

    E_{0,c,0}=1; E_{0,c,j>0}=0
    E_{t+1,c,j} =
      (E_{t,c,j} AND NOT d_{t,c}) OR
      (E_{t,c,j-1} AND d_{t,c})       (out-of-range E=0).

**Lemma Q1 (count exactness):** For every (including invalid-coded) proposed action word, E_{t,c,j}=1 iff exactly j of the first t decoded actions name c. Proof by induction splitting on whether a_t names c. This recurrence uses O(kWH) gate work and does not enumerate action words.

For future cell x=(c,h_c+j), 0<=j<H-h_c:

    land_{t,x}=d_{t,c} AND E_{t,c,j};
    valid_t=OR_(future cells x) land_{t,x};
    owner_{p,x,t}=OR_(i<=t, p_i=p) land_{i,x}.

**Lemma Q2 (physical semantics on live prefixes):** Until the first invalid choice or first win/draw, `valid_t` is precisely source gravity legality, `land` names the actual newly occupied cell, and `owner` is exactly the future-cell ownership bit of the given player. It follows from Q1 and the fact that one legal move increments exactly one column height. Later values after a stop are deliberately irrelevant and are absorbed in the suffix formula.

For each source residual requirement `S in R_p`, where all initially occupied opponent cells have already eliminated their lines and minimal-antichain absorption is exact, define:

    win_{p,t} =
       OR_(S in R_p) AND_(x in S) owner_{p,x,t}.

**Lemma Q3 (first-win guard):** On every live legally advancing prefix when p moves at t, `win_{p,t}` is true exactly when that move completes a winning line. No move by the other player can newly complete p's line. No source line is already complete; every future win must complete some remaining residual requirement, and strict supersets are redundant under subset satisfaction. Existing 1.2 q authority supplies the qualified residual meaning.

## 2. Exact Boolean guarded Bellman fold and quantifier scope

For one of the four P0-relative threshold queries `z` in `Wlo,Nlo,Whi,Nhi`, let `C_z=(0,0,1,1)` at a nonterminal horizon cutoff. When the board is filled without a win, draw threshold is `D_z=(0,1,0,1)`.

Define the literal *matrix* recursively backward, with `F_{k,z}=C_z`. At t=k-1 ... 0:

    tail_{t,z} = D_z                    if r+t+1=N
                 F_{t+1,z}             otherwise

    F_{t,z} = valid_t AND (win_{0,t} OR tail_{t,z})
               if p_t=P0

    F_{t,z} = NOT(valid_t) OR (NOT(win_{1,t}) AND tail_{t,z})
               if p_t=P1.

**Lemma Q4 (adaptive truth-preserving guard):** At an existential P0 turn, an illegal move contributes FALSE; at a universal P1 turn, an illegal move contributes TRUE. Those are the correct OR/AND identities. An immediate P0 win returns TRUE and an immediate P1 win FALSE, independently of all later proposed codes. At a last nonwinning legal move `D_z` applies. Thus

    Q_0(a_0) Q_1(a_1) ... Q_(k-1)(a_(k-1)) . F_{0,z}

equals the qualified source-q depth-k alternating Bellman threshold, with Q=EXISTS for P0 and FORALL for P1, **even though every binary action block quantifies invalid encodings**. This follows by backward induction on t using Q1–Q3 and the OR/AND neutral guards; it is not a quantifier reorder. Four such truth values provide sound W/D/L intervals. At k=m the cutoff is unreachable on any live path: the **truth** of WIN and NONLOSS is exact unrestricted ordinary game WDL, after evaluating the QBF, NOT before.

To query a fixed **legal first action c**, replace the outer matrix with `[a0=c] AND F_{0,z}` when the mover is P0, or `NOT[a0=c] OR F_{0,z}` when the mover is P1, keeping the original quantifier prefix. These two different neutral guards retain literal action-labelled information. They MUST NOT be swapped. The legal 4x3 `223` adaptive response relation remains a counterexample to `forall b exists a = exists a forall b`.

## 3. Definitional Tseitin CNF and stage-local auxiliaries

Hash-cons all binary AND gates, implementing OR by De Morgan and negations as literal signs; no move history is enumerated by the producer. For each gate `g=a AND b` add three clauses:

    (NOT g OR a) AND (NOT g OR b) AND (g OR NOT a OR NOT b).

Assert the selected output literal as the final clause. Every gate value is uniquely determined by the action inputs. Hence under any input assignment the definitional clauses have exactly one gate assignment, and satisfying the unit output is equivalent to the original Boolean matrix. A final existential gate block is an always-sound conservative encoding.

Define `stage(g)` as the maximum action index among its transitive literal dependencies. Direct decision bits of t have stage t; a gate's stage is the maximum of its inputs' stages. Insert deterministic existential variables of stage t immediately **after** action block t and earlier stage-gate dependencies, rather than at the final block.

**Lemma Q5 (sound prefix localization):** Because every derived gate is a total uniquely determined function of choices at stages <=t, one may quantify its existential variable immediately after action block t. Given any earlier quantified input assignment, its necessary gate witness has a unique value independent of ALL later choices. A backward induction over remaining QBF quantifiers and a topological induction over the AND DAG prove truth preservation; no nontrivial arbitrary DQBF dependency reduction is assumed. Therefore both postfix and stage-local QBFs have exactly the same truth under each threshold/fixed-first-action query. A generic undisclosed Tseitin variable may NOT be moved earlier without this support check.

The trivial TOTAL ORDER of the actually emitted quantifier prefix is a polynomial-time computable **sound permutation dependency poset** in Ganian–Gründel's precise sense: it has one linear extension, the unmodified prefix. We do not claim a reduced dependency scheme.

## 4. Real CNF primal graph and explicit trunk-aligned PATH decompositions

For each matrix CNF, connect two variables iff they occur together in one real clause. Let `p(v)` be any injective forget order on all QBF variables. Give each variable the contiguous path-bag interval:

    intro(v)=min({p(v)} UNION {p(w): {v,w} is a primal edge})
    occur(v)=[intro(v), p(v)].

At bag index `p(u)`, variable u occurs, and for every primal edge `{u,v}`, BOTH endpoints occur at `min(p(u),p(v))`. Thus every clause-primal edge is covered (T1), and every variable has a connected bag interval (T2). Add empty start/end bags and subdivide introductions/forgets into singleton operations without increasing the maximum bag cardinality to get a **nice** path decomposition satisfying T3/T4.

Two different forget orders of the same **full quantified CNF** are certified:
- **Forward emitted prefix order:** every dependency predecessor is forgotten below the current variable on the one leaf-to-root trunk. This satisfies the paper's P2 for every variable.
- **Reverse emitted prefix order:** all variables depending on u are already forgotten before u, hence cannot appear in the bag where u is forgotten. This satisfies P1 for every variable.

The path is itself the trunk. Therefore both are trunk-aligned by explicit construction, and their max bag cardinalities minus one are honest **upper bounds on bilateral treewidth** for the chosen *trivial total-order dependency poset*. This does not claim optimal width, a nontrivial decomposition algorithm, a small theorem function f, an efficient QBF decision algorithm, or any new value. It does constitute a complete verification of the structural *hypotheses* of the Ganian–Gründel theorem for the constructed formulas.

## 5. Independent bounded controls and source-code identity

Frozen plan: `research/isograph/discovery/2026-10-16-algorithmic-core/GUARDED_ACTION_QBF_PLAN_0_1.md`.
Code/harness:
- `guarded-action-qbf.mjs` (constructed only from source R0/R1 and h);
- `guarded-action-qbf-control.mjs` (independent physical finite-horizon validator);
- `guarded-action-qbf-width-probe.mjs` (independent rule-only `44444` source derivation, all-depth CNF width);
- `guarded-action-qbf-full-prefix-control.mjs` (full-depth gate topological/prefix checks and sampled physical first-win falsifier).

Node.js 22.16.0 direct local run; source files match committed Git blob IDs. Across 4x3 Connect3, 4x4 Connect4 and standard 7x6 Connect4 source histories including `223`, `44444`, filled `444444`, and immediate P0 winning `1212`/ `121212`:

| Bounded check | Count | Mismatches |
|---|---:|---:|
| Compiler constructions / distinct control cases | 78 | 0 |
| QBF-threshold-CNF variants generated | 624 | 0 |
| Every decoded move-word physically replayed (the **validator only**) | 24,804 | 0 |
| Physical Boolean threshold comparisons | 99,216 | 0 |
| Independent physical alternating-quantifier root comparisons | 312 | 0 |
| Deterministic CNF clause truth checks | 108,888,000 | 0 |
| Extra sampled 37-ply physical paths | 1,024 | 0 |
| Full-horizon aux causal-order checks | 12,325 per prefix mode | 0 |

The full-horizon sampled falsifier included P0 terminal paths (29), P1 terminal paths (22), illegal P0 first-violations (452) and illegal P1 first-violations (521). It is **not** an exhaustive test of 37-ply assignments. The deductive Q1–Q5 identities, not the finite sample, are the full-horizon soundness argument. No maintained Node26 suite, independent QBF solver, or external reproduction claimed.

## 6. Exact measured full-horizon representation (UNKNOWN value)

`44444` contains 37 empty cells, h=[0,0,0,5,0,0,0], |R0|=48 and |R1|=42. Full W=7/H=6/K=4 game QBF, k=37:

| Scope | Result |
|---|---:|
| Binary quantified action bits | 111 |
| Deterministic existential auxiliaries | 12,325 |
| Total QBF variables | 12,436 |
| Definitional CNF clauses (one threshold) | 36,976 |
| Real primal-CNF edges | 35,473 |
| Stage-local forward-P2 path width | 453 |
| Stage-local reverse-P1 path width | **232** |
| Postfix-aux forward-P2 path width | 4,023 |
| Postfix-aux reverse-P1 path width | 1,335 |
| Counted Boolean-gate calls / CNF insertion work | 54,320 |
| Support representatives | **0** |
| Local end-to-end probe time (Node22, not comparative solver performance) | 89 ms |

At k=12 (the previously blocked support cone), the equivalent CNF contains only 3,270 variables, 9,703 clauses and stage-local verified path width upper bound 184. **Neither k12 nor k37 quantified truth was decided.** The 37-ply *formula* is exact and full depth, but not a cheap standalone solver: quantified Boolean truth could require intractable strategy reasoning. Calling this an evaluated unrestricted WDL would be a serious semantic error.

**Cost accounting qualification:** The figure 54,320 counts Boolean AND/OR calls and planned Tseitin clauses; it is not all CPU work. At k37, the *current*, deliberately simple stage-prefix builder rescans its 12,325 derived gate records over 37 stages (456,025 equality checks), in addition to 86,276 clause literal visits, 61,625 raw clause-pair examinations, and full path-decomposition adjacency/edge verifications. These scans are NOT hidden strategy enumeration, but must be charged separately in any implementation performance comparison. The numerical 300,000 cap is the established **nontrivial Boolean-operation** limit, not a license to claim all-work <300,000. This representation met 60,000 retained-node and 15s compile limits; Node22 execution was far below 15s.

## 7. What was and was not mathematically proved

**Proved conditional on qualified source-q meaning:**
1. An explicit polynomial-size, game-rule-only action-labelled alternating circuit for all four interval thresholds and any finite horizon.
2. Exact source QBF truth = corresponding finite-horizon alternating Bellman threshold, with FIRST invalid/terminal guard and literal action specificity; full k=m QBF truth equals unrestricted ordinary WDL threshold.
3. Gate-unique postfix Tseitin and dependency-safe staged Tseitin prefixes are equivalent in quantified truth.
4. The two constructed true-CNF trunk-aligned path decompositions are valid, giving certified bilateral-treewidth **upper** bounds (232 at k37 staged for one threshold).

**Finite experimental evidence:** 78 bounded physical controls, exact uniform CNF guards and dependency placement, source anchored full-depth representation sizing and 1,024 full-horizon word falsifiers.

**Not proved:** A QBF truth decision at `44444`; the equality of full-game WDL after all move6 replies; an effective bound on the Ganian–Gründel function f(232); a polynomial quantified-elimination algorithm; practical branch elimination; an automatically minimal decomposition; or a general conditional-separator quotient with bounded width through all alternations.

## 8. Ranked next proof program

A. **Decision/evaluation at fixed resource envelope.** Build a *small* exact quantified-frontier eliminator for the staged QBF, applying the Ganian–Gründel P1/P2 steps on a certified path or a structured-DNNF quantifier projection. Measure retained quantified residual functions, strategy extension count, and total Boolean work before trying `44444` k12. A compact CNF with UNKNOWN truth is not enough.

B. **Improve sound dependencies / decomposition.** A proven nontrivial permutation-dependency reduction or branching trunk-aligned **tree** rather than a path may lower width below 232. Verify every removed dependency and every bag guard. The legal `223` `forall b exists a` / `exists a forall b` counterexample remains mandatory.

C. **Lower bounds.** If a concrete family or the actual target exhibits an exact cofactor/fooling-set/width obstruction, record it without extrapolating generic QBF ETH hardness directly to Connect4.

The user-authorized resource ceiling and remaining UNKNOWN status are unchanged; no authority promotion, merge or solver deployment.
