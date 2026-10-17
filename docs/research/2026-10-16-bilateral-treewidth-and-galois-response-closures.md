# Mathematical proof continuation: bilateral QBF width and closed action-response rectangles

**Date:** 2026-10-16  
**Canonical research owner:** `research/semantic-quotient`  
**Research direction:** Josh Oshiro  
**Status:** (i) exact standalone Galois finite-relation lemma and bounded algebraic tests; (ii) negative evidence against all-maximal-concepts as a compression normal form; (iii) *conditional* external QBF-width theorem candidate. Not an unrestricted Connect Four value theorem, new IsoGraph claim, or solver integration.

## 1. Abstract quantified object, independent of the game

Let `A` be a finite set of claimant action labels, `B` be a finite set of adversary reply labels, and `s` be a shared source/interface assignment. The relation `P_s subseteq A x B` asserts that a *specific labelled claimant response* meets a specified bounded property against a *specific labelled adversary move*, with all legality, first-win, mover and resource conditions included in `P_s` or explicit preconditions. It is **not** a strategic game-tree continuation or unrestricted WDL value.

The asymmetric formulas are

    U(s) = forall b in B_legal(s) . exists a in A_legal(s,b) . P_s(a,b)
    E(s) = exists a in A_legal(s) . forall b in B_legal(s,a) . P_s(a,b).

These are not interchangeable. In the fixed source-independent action alphabet, illegal (a,b) pairs must be FALSE in P and the scope of universal quantification must be separately restricted to legal replies. For an earlier P0 action, legality may depend on a: that must be represented as a guard or a different relation, NOT silently assumed away. For mixed plies, the exact prefix and Skolem dependency of each action must be retained.

The aim is to compute intermediate *functions of s and remaining variables* without enumerating all action-histories, not to relabel already-enumerated histories as a circuit.

## 2. Galois closure lemma: exact but not optimally compact

Fix a finite binary relation `P subseteq A x B`. For `X subseteq A`, let

    X' = { b in B : forall a in X, P(a,b) }.

For `Y subseteq B`, let

    Y' = { a in A : forall b in Y, P(a,b) }.

(These prime operators are antitone and satisfy `X subseteq Y' iff Y subseteq X'`.) A **formal concept** is a closed pair `(X,Y)` with `X=Y'` and `Y=X'`. For `X,Y` both nonempty, it is precisely an inclusion-maximal all-one rectangle.

**Lemma R-GC (finite exact relation recovery).** The Boolean union of all nonempty closed rectangles is the original relation:

    P(a,b)  iff  OR_(X,Y closed, nonempty) (a in X AND b in Y).

**Proof.** Each output rectangle is all-one by its definition, hence no zero pair can be introduced. Conversely, take an arbitrary `P(a,b)=1`. The seed `{a}` has nonempty extent `{a}'` containing b. Closing it gives `X={a}''` and `Y={a}'`, with `a in X` and `b in Y`, and `X'=Y`, `Y'=X`. Thus the pair is in at least one output rectangle. This proves both inclusions for every finite relation, with no solved-game oracle.

**Corollary R-Q.** Given the same legal reply set L for every action and action-dependent illegal pairs encoded as false,

    forall b in L . exists a . P(a,b)
       iff L subseteq UNION_(X,Y closed) Y.

Moreover,

    exists a . forall b in L . P(a,b)
       iff exists action a, L subseteq UNION_(X,Y closed, a in X) Y.

The existential scope is inside the first universal and outside the second; no quantifier commute was used. The empty L case is vacuous. For a nonempty action alphabet, the second formula also holds vacuously when L is empty. For scopes conditional on an earlier action, first curry the relation on that action and perform the quantifier composition with the original order.

**Bounded construction.** Enumerate nonempty subsets of the *action alphabet* `A`, derive `X'` by intersection of row masks, close by `X''`, deduplicate nonempty concepts. This needs at most `2^|A|-1` seed inspections and `O(|A|^2 2^|A|)` incidence/set operations before output charging (fixed `|A|<=7` in the current bounded local experiment). It enumerates neither arbitrary game continuations nor `2^(|A||B|)` candidate response relations. **But** at most `2^|A|-1` does not establish a cheap compositional normal form as |A| or alternations grow. A family of all maximal rectangles is a canonical *complete* cover, not a minimum-cardinality biclique cover.

## 3. Bounded falsification and negative compression result

**Producer:** `research/isograph/discovery/2026-10-16-algorithmic-core/adaptive-galois-factor.mjs`.  
**Executable standalone control:** `adaptive-galois-factor-control.mjs` in the same directory.  
**Machine evidence:** `ADAPTIVE_GALOIS_FACTOR_RESULTS_0_1.json`.

Original physically verified legal 4x3 Connect-3 prefix `223` (P1 b, P0 a) has source-q response row masks, by P0 action,

    [0xe, 0x4, 0xe, 0x7].

The distinct **row types** number three. All maximal Galois rectangles number **four** (zero-based masks):

    (A=0x5, B=0xe)
    (A=0x8, B=0x7)
    (A=0xd, B=0x6)
    (A=0xf, B=0x4).

They exactly reconstruct `[0xe,0x4,0xe,0x7]`; `forall b exists a` is TRUE and `exists a forall b` is FALSE. Prior research displayed an *optimal* Boolean-rank-three (not necessarily maximal/closed) rectangle cover with a three-element fooling-set lower bound. The FOUR maximal concepts therefore must **not** be reported as Boolean rank four. This distinction is central.

An isolated V8 exhaustive control checked **all 65,536 binary 4x4 action/reply matrices** and all **16 legal reply-universe masks** per matrix, i.e. **1,048,576** predicate-scope comparisons, with zero reconstruction or quantifier-order discrepancies. Counted producer work summed to **8,076,084** Boolean/subset/incidence/rebuild work units over those *separate* compiles; maximum **175** for any single 4-action matrix, well below the 300,000-per-compile limit. Source `223` used 169 counted units.

Concept count compared to distinct action-row types:

    fewer:  8,071
    equal: 24,549
    MORE:  32,916

Maximum observed on a 4x4 relation: **14 maximal concepts**. Among 100 deterministic seeded 7x7 relation checks, the largest closed basis had **29 concepts** for only seven original action rows. Thus even a local canonical concept basis can increase rather than reduce stored obligations. This is a genuine **negative result for the representation choice**, not a refutation of Boolean-rank minimization or conditional factorization.

The user-supplied source-anchored fixed four-ply `223` relation is previously independently validated against physical gameplay in `UNIVERSAL_RESPONSE_COVER_RESULTS_0_1.json`; this experiment does not requalify that physical source. The 65,536 matrix control is independent finite-relation mathematics, NOT 65,536 game-state validations. The standalone Node control is committed for repeatability, but the stated evidence was executed within an isolated V8 JavaScript research session; no maintained Node26 full-suite or external reproduction is claimed. No restricted WDL oracle calls or searched policy inputs occurred.

**Disposition:** R-GC/R-Q are exact mathematical identities for finite guarded relations. Canonical *maximal* concepts are not recommended as a recursive compression carrier. A smaller noncanonical rectangle cover or mixed factor/BDD carrier remains possible but must count the cost of obtaining the cover and composing it through further alternations.

## 4. New primary-source candidate: bilateral treewidth for quantified Boolean formulas

Robert Ganian and Marlene Gründel, **Bilateral Treewidth for QBF: Where Strategies and Resolution Meet**, SAT 2026, published July 16, 2026. Primary: https://doi.org/10.4230/LIPIcs.SAT.2026.16 ; author-hosted preprint HTML: https://arxiv.org/html/2605.06262v1 .

Their Theorem 10 gives a QBF-truth algorithm running in

    f(k) * |Phi| * |T|,

where `Phi=Q.phi` is a **QBF with CNF matrix**, a **sound permutation dependency poset D** is supplied, and `T` is a **trunk-aligned tree decomposition** of `(Phi,D)` with bilateral width `k`. `f` is a computable parameter function, not a claim of polynomial uniform cost in k. The theorem *assumes the qualifying decomposition is available*, and the proof does employ bounded strategy-branching.

The precise local structural alternative at a forgotten variable u is:

- **P1:** all variables depending on u avoid the bag at `forget(u)`; safe local Q-resolution/universal reduction.
- **P2:** `forget(u)` lies on a designated leaf-to-root **trunk**, and every variable that u depends on has appeared in the subtree below `forget(u)`; bounded strategy-extension step.

Their Section 5 carries a family of families of quantified CNF matrices through elimination, using guarded Q-resolution, universal reduction and localized strategy extension while controlling the interface by the *full* decomposition width. This joins two formerly incomparable derivation methods rather than incorrectly commuting `forall` with `exists`. The authors explicitly distinguish ordinary graph treewidth, for which general QBF may remain PSPACE-complete at constant width, from this prefix/dependency-aware parameter.

**Exact formal correspondence (conditional, not yet a Connect Four theorem):** An alternating action-choice predicate with a deterministic, guard-complete transition/outcome matrix is a QBF after an exact Boolean action encoding. Action choices become alternating prefix blocks; a particular existential action is a Skolem choice over precisely its allowed earlier universal moves. First-win, gravity, legal alternatives, terminal draw and literal action labels must be encoded into the CNF matrix without adding illegal strategies. If auxiliary Tseitin variables encode deterministic gates, they must be existentially introduced only at a scope where all relevant input choices are visible (e.g. after all game-choice blocks for a closed truth predicate). The equivalence of *that encoding* requires a separate proof. The theorem then applies ONLY after verifying a sound dependency poset and trunk-aligned tree decomposition for the **full CNF matrix**.

The previously measured original-source residual hypergraph at `44444` (37 future cell variables, 90 residual requirements, 198 primal edges, connected, greedy min-fill width-15 **upper bound**) is NOT this QBF matrix and does not meet these hypotheses. It excludes only the naive disconnected-source-factor argument. Likewise the theorem's `f(k)` may be impractically large, and constructing/checking the decomposition costs real work. Therefore **there is no licensed inference of efficient k12 compilation or a new value at `44444`.**

## 5. Other primary results and theorem boundaries

1. **Capelli and Mengel**, *Tractable QBF by Knowledge Compilation*, STACS 2019, https://doi.org/10.4230/LIPIcs.STACS.2019.18 . Structured DNNF quantifier projection has a size blowup controlled by representational width rather than total circuit size. Source-q BDD support count is not that width. Full factor dependencies and threshold cofactors must be measured.
2. **Ge-Ernst, Scholl, Síč and Wimmer**, *Solving Dependency Quantified Boolean Formulas Using Quantifier Localization*, TCS 2022, https://doi.org/10.1016/j.tcs.2022.03.029 . Localizing an existential must follow proven dependency scope; arbitrary syntactic independence or a quantifier swap can be unsound.
3. **Abo Khamis, Ngo and Rudra**, *FAQ: Questions Asked Frequently*, PODS 2016, https://doi.org/10.1145/2902251.2902280 . Valid aggregate-elimination reordering depends on algebraic aggregation type and quantifier scope; a generic elimination heuristic does not justify mixed max/min reordering.
4. **Theis**, *On some lower bounds on the number of bicliques needed to cover a bipartite graph*, https://arxiv.org/abs/0708.1174 . Fooling-set size lower-bounds minimum Boolean rectangle cover; it is NOT the number of all maximal bicliques.
5. **Fichte, Hecher and Pfandler**, *Lower Bounds for QBFs of Bounded Treewidth*, LICS 2020, https://doi.org/10.1145/3373718.3394756 . Under ETH, unrestricted alternating QBFs admit strong tower-type lower bounds indexed by alternation depth and treewidth; no transfer to this particular gravity-game family has been proved.

These sources support a representation/dependency-based program and sharp limits. None directly yields an exact compact multi-block representation for standard Connect Four.

## 6. Project reasoning hierarchy and candidate selection

Hard gates: original qualified q_o/q_r semantics; sound first-win/draw and gravity guards; original alternating choice order and action labels; no oracle-generated policy; account ALL work; unchanged 60k nodes / 300k operations / 10k support reps / 15 seconds per compile; preserve historic unknowns and no unapproved authority/merge.

| Candidate | Mathematical qualification | Resource/interface prospect | Decision |
|---|---|---|---|
| A. Source-factored structured d-DNNF + sound DQBF localization | Published positive width theorem; must prove factor supports and dependencies | Strong if quantified interface width small; not yet measured | **Retain first-tier hybrid** |
| B. Enumerate all Galois maximal bicliques per action/reply block | **Exact finite lemma R-GC and exhaustive 4x4 control** | Can be strictly worse than row basis; no arbitrary-depth compression | **Reject all-maximal-concept normal form**; keep local falsifier |
| C. Bilateral QBF treewidth (resolution + strategy extension) | **Published conditional FPT theorem** with CNF, sound dependency poset, trunk-aligned decomposition | More expressive than simple source-primal separators; can still incur huge f(k), strategy branching | **Select for next conditional-width proof study**, combined with A |
| D. Split residual graph at full center column | Simple factorization if truly disconnected | 44444 and 444444 raw source residual hypergraphs connected | **Existing negative baseline**, does not disprove conditional factors |

Selection: **A+C** as the strongest mathematically justified multi-block investigation, with R-GC as an exact unit-level semantic control and its negative compression disposition preserved. This is not a declaration that A+C are efficient on the target.

## 7. Next falsifiable theorem/experiment

**Conditional lemma to establish before compiling k12:** If a bounded source-q action-threshold circuit admits (i) a value-preserving guard-complete translation to a CNF QBF `Phi`, (ii) a sound dependency poset preserving action Skolem scopes, and (iii) a trunk-aligned decomposition of measured bilateral width k, then the Ganian–Gründel algorithm applies with `f(k)|Phi||T|` resource bound. Under an exact input/output translator, the truth of the compiled predicate equals the source bounded threshold. This is a *conditional reduction* from an existing published theorem and exact translation obligation, not a statement that the prerequisites exist efficiently for `44444`.

**Priority tests in order:**
1. Build a small, **symbolically generated** bounded-horizon QBF from source residuals with explicit action labels, legal-move totalization, first-win absorption, mover parity and full-board draws. Record the formal translation proof, formula size and Tseitin dependencies. Do not derive a winning policy from a search.
2. On already qualified small-board positions and `223`, falsify both the translation and every claimed commuting/quantifier relocation identity independently. Specifically reassert `forall b exists a != exists a forall b`.
3. Instrument a sound dependency poset, primal CNF graph, trunk-aligned decomposition and **actual** bilateral interface width; measure strategy-extension obligations and Q-resolution work. Do not equate original residual hypergraph min-fill width with k.
4. If the bounded new operator produces an exact result under 60k/300k/10k/15s, compare action-labelled WDL intervals with independently qualified q/physical reference. Only then test canonical `44444` without altering limits.
5. If no bounded trunk-aligned decomposition exists within the envelope, record it as a scoped practical obstruction, NOT an impossibility theorem for all representations.

**Unchanged frontier:** canonical `44444` after turn 5 remains P1-to-move and unrestricted root/all actions `UNKNOWN [-1,+1]`. Completed symbolic 11-ply cone: 9,366 reflected support orbits, 16,511 peak BDD nodes, 268,341 operations. Next raw cone 13,524 reflected supports exceeds 10,000 cap. Original recursive exact WDL/optimal-action core remains constructively complete. The new local relation theorem and the published QBF theorem do not assign a winner, certify move 7/8, or lift that support bound.
