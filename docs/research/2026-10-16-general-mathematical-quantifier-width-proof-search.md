# General mathematical proof search: quantifier locality, Boolean rank, cofactor width

**Date:** 2026-10-16  
**Research owner:** research/semantic-quotient  
**Research direction:** Josh Oshiro  
**Status:** Literature-supported candidate mathematical theorems and one direct structural diagnostic. No new unrestricted WDL solution, game-theory authority promotion, or proven arbitrary-depth nonbranching algorithm.

## Scope and search discipline

Per owner instruction: **Search general mathematics and mathematical logic proofs. Do not search Connect Four literature, and do not choose candidates merely by analogies to another application.**

Current abstract problem: given an exact finite Boolean game-value algebra with P0 existential (OR) and P1 universal (AND) choice operators, owner-true/false source cofactors, first-win/draw guards, and action-labelled adaptive responses, derive a representation whose alternations compose *without independently evaluating a separate continuation for each move*. The exact recursive/branching algorithmic core is already mathematically complete; avoiding branching is an optional stronger goal.

Research bottleneck: at canonical standard7x6 source `44444`, source-anchored WIN/NLOSS lower/upper ROBDD, exact reflection quotient, and source-residual-frequency owner-variable ordering complete eleven further plies under unchanged 60,000 node / 300,000 Boolean operation / 10,000 canonical support / 15-second compile limits, with 9,366 support orbits and 268,341 operations. The root AND all literal action intervals still equal [-1,+1]. The next raw support cone has 13,524 mirror orbits and exceeds the previous 10,000-support ceiling. The 10k cutoff is an experimental limit, NOT a mathematical impossibility theorem.

## Mathematically derived candidate A: dependency-qualified quantifier localization

**Sources:**

- Ge-Ernst, Scholl, Síč, Wimmer, *Solving Dependency Quantified Boolean Formulas Using Quantifier Localization* (Theoretical Computer Science 2022): https://doi.org/10.1016/j.tcs.2022.03.029 ; https://arxiv.org/abs/1905.04755
- Beyersdorff, Blinkhorn, Chew, Schmidt, Suda, *Reinterpreting Dependency Schemes: Soundness Meets Incompleteness in DQBF* (Journal of Automated Reasoning, 2019): https://link.springer.com/article/10.1007/s10817-018-9482-4
- Choudhury, Mahajan, *Dependency Schemes in CDCL-Based QBF Solving: A Proof-Theoretic Study* (Journal of Automated Reasoning 2024): https://link.springer.com/article/10.1007/s10817-024-09707-4
- Abo Khamis, Ngo, Rudra, *FAQ: Questions Asked Frequently* (PODS 2016): https://arxiv.org/abs/1504.04044

**An exact elementary factor-localization lemma (derived here, not claimed as a new published theorem):** Let u and v be disjoint quantified variable sets, s be free boundary variables, and

    F(u,v,s) = A(u,s) OP B(v,s)

where OP is AND or OR, and A has no v variables and B has no u variables. For either Q_u,Q_v in {FORALL,EXISTS}, with their original quantifier scopes,

    Q_u u . Q_v v . F(u,v,s)
        = (Q_u u . A(u,s)) OP (Q_v v . B(v,s)).

This follows by twice moving a quantified subformula past an independent Boolean factor. It is valid pointwise for each assignment to s. It is an exact sufficient criterion for removing a quantifier interaction without enumerating game continuations. It is NOT valid without the required variable support separation.

More generally, a factorized Boolean formula conditional on boundary variables s can eliminate independent quantified blocks inside their own factors, preserving s for later elimination. The DQBF proof literature confirms that removing dependencies requires a *sound* dependency scheme; the FAQ paper mathematically characterizes permissible aggregate/variable elimination reorderings. A hidden dependency via gravity, mover chronology, first-win, deadline or action label invalidates the shortcut.

**Concrete next candidate:** represent each strategic threshold as a factored Boolean expression with an explicit *dependency support* for each factor. At a quantifier boundary, push quantification into any factor proved independent of that choice variable, condition shared factors on a small separator S, and preserve the resulting action-labelled residual-factor family. This is different from swapping FORALL and EXISTS and different from searching a winning action. It may fail if the relevant factor boundary is large; count the real interface width.

## Mathematically derived candidate B: Boolean-rank/rectangle factor of adaptive response relations

**Sources:**

- Gregory, Pullman, Jones, Lundgren, *Biclique coverings of regular bigraphs and minimum semiring ranks of regular matrices* (J. Combinatorial Theory B, 1991): https://doi.org/10.1016/0095-8956(91)90006-6
- *A study of the binary and Boolean rank of matrices with small constant real rank* (Discrete Applied Mathematics 2026): https://www.sciencedirect.com/science/article/pii/S0166218X26000909
- Dirk Oliver Theis, *On some lower bounds on the number of bicliques needed to cover a bipartite graph* (2007): https://arxiv.org/abs/0708.1174

For the exact successful-response relation P(b,a) between an earlier opponent reply b and a later adaptive claimant action a, seek a factorization

    P(b,a) = OR_{j=1..r} [ U_j(b) AND V_j(a) ].

The minimum r is the Boolean rank (all-ones rectangle cover number) of the binary relation. This preserves **which actions cover which replies**, unlike a union of reply masks. A single exact quantifier step then obeys

    FORALL b EXISTS a P(b,a)
       = FORALL b OR_j [ U_j(b) AND EXISTS a V_j(a) ].

Proof: existential quantification distributes through a disjunction and V_j is independent of b, U_j independent of a. No adaptive quantifier order is reversed. A preceding EXISTS a FORALL b query must still be evaluated with the original action-factor relation, not with the scalar union of U_j.

**Small worked example from established independent physical control:** legal 4x3 source `223` has P0 action-indexed masks [0xe,0x4,0xe,0x7] for four possible P1 earlier replies. This relation equals the union of THREE all-true rectangles (P0 action rows x P1 reply columns):

    A_1={1,3}, B_1={2,3,4}
    A_2={2},   B_2={3}
    A_3={4},   B_3={1,2,3}

This is a genuine Boolean rank **exactly 3**: rectangle cover of size 3 is displayed; the three 1-entries (action1,reply4), (action2,reply3), (action4,reply1) form a fooling set, so no all-true rectangle can contain two of them and at least 3 rectangles are necessary. The familiar result FORALL reply EXISTS action is true, but EXISTS one action FORALL replies is false. Both truths are recoverable from the factorization because action/reply labels are retained.

This tiny example is only a proof of *conceptual exactness*, not an important performance improvement by itself (four original rows versus three rectangles). The research target is **constructing a low-rank rectangle factorization algebraically from source residual constraints, BEFORE materializing a potentially exponential response relation**. For deeper alternating blocks, measure factored r and whether rectangle rank multiplies or explodes under composition. Fooling-set lower bounds give a falsifiable obstruction when simple factorization cannot be compact.

## Candidate C: minimal OBDD level width as DISTINCT source cofactors

**Sources:**

- Sieling & Wegener, *Reduction of OBDDs in linear time* (1993): https://doi.org/10.1016/0020-0190(93)90256-9
- Meer & Rautenbach, *Representation of graphs by OBDDs* (2009), Theorem 10 states the subfunction characterization of reduced OBDD layers, crediting Sieling/Wegener: https://doi.org/10.1016/j.dam.2008.02.012
- Capelli & Mengel, *Tractable QBF by Knowledge Compilation* (STACS 2019): https://doi.org/10.4230/LIPIcs.STACS.2019.18 ; https://arxiv.org/abs/1807.04263
- Amarilli, Monet, Senellart, *Connecting Width and Structure in Knowledge Compilation* (ICDT 2018): https://doi.org/10.4230/LIPIcs.ICDT.2018.6

For a Boolean function f and FIXED variable order pi, two assignments to the already-processed prefix are equivalent if they yield the same Boolean **cofactor function on all remaining variables**. The reduced OBDD's layer labelled by the next variable contains exactly the distinct nonconstant prefix cofactors that essentially depend on that variable. This is an exact quotient of partial assignments by future-function equality, NOT simply geometric symmetry or matching local immediate threats.

This theorem points to a measurable mathematical width: the number of distinct future **action-labelled threshold-function tuples** crossing a quantifier or support-interface cut. That is a stronger metric than (a) the raw number of support configurations, (b) final number of root BDD nodes (often only terminal constants), or (c) current physical board occupancies.

Capelli/Mengel prove methods to eliminate quantified variable blocks in structured DNNF/OBDD-like representations where blowup is controlled by representation **width**, not just total size; repeated alternations may cause exponential/tower growth in width. Amarilli/Monet/Senellart give constructive width-linked circuit compilation upper/lower bounds: ordinary path-ordered OBDDs can have exponentially larger representations than structured decomposable circuits even for graph-structured families.

**Candidate:** construct a shared multi-output Boolean carrier of all literal action WIN/NLOSS lower/upper functions, instrument the number of distinct cofactors *before and after each alternation*, and compare ordinary OBDD width to a structured/decomposable representation sharing source residual factors. The research question is whether this quantified INTERFACE width remains small even when the support-orbit count exceeds 10k. Do NOT call cofactor equality an efficiently discoverable new support quotient without a construction-cost proof: finding it may itself require building large functions.

## Candidate D: abstraction completeness and game-preserving congruence

**Sources:**

- Giacobazzi, Ranzato, Scozzari, *Making abstract interpretations complete* (J. ACM 2000): https://www.research.unipd.it/handle/11577/1365861
- Cranen, Keiren, Willemse, *Parity game reductions* (Acta Informatica 2018): https://link.springer.com/article/10.1007/s00236-017-0301-x

For a proposed quotient alpha of concrete structural/value descriptors and a proposed reduced transfer operator Fhat, the **commuting diagram** requirement is

    alpha(F(x)) = Fhat(alpha(x))

for all inputs where the qualified action/value transfer F applies, with correct player, capacity, terminal, action transporter and ranks. When this holds throughout finite-rank induction, abstract evaluation preserves the required result without needing oracle labels. An interval approximation is allowed to be incomplete; equality of certified lower/upper bounds already proves exact WDL.

The abstract-interpretation completeness literature supplies formal machinery for refining an abstract domain toward transfer completeness. Bisimulation-style quotient theorems similarly require true successor/terminal correspondence and can preserve game winners. But exact cofactor equivalence across supports may require expensive symbolic proof; do not define a circular quotient by the already-unknown WDL values.

This is a **qualification criterion** for a new quotient, not evidence that a compact quotient exists at `44444`. A structural cofactor signature could be tested for local closure before it is permitted to replace several action-labelled supports.

## Conditional lower bounds and explicit limitations

**Sources:**

- Lampis & Mitsou, *Treewidth with a Quantifier Alternation Revisited* (IPEC 2017): https://doi.org/10.4230/LIPIcs.IPEC.2017.26
- Fichte, Hecher, Pfandler, *Lower Bounds for QBFs of Bounded Treewidth* (LICS 2020): https://doi.org/10.1145/3373718.3394756
- *On the dualization in distributive lattices and related problems* (2021): https://doi.org/10.1016/j.dam.2021.04.018

Under the Exponential Time Hypothesis, even general QBF with just one existential/universal alternation has conditional double-exponential treewidth lower bounds; greater quantifier rank can cause towers of exponentials. Thus **bounded unquantified primal-graph width alone does not imply uniformly cheap arbitrary quantifier alternation**. These results concern general QBF and **DO NOT PROVE** that gravity Connect Four itself is intractable or requires such a tower.

Antichain/monotone Boolean-function representations can also have massive dual frontiers: repeated exact dualization may force output growth. Do not attempt to enumerate all minimal response-cover families unless a structural restriction or output-sensitive bound has been proved. Prefer a factored Boolean carrier with explicit source dependencies and an exact notion of width.

## One independent local structural diagnostic (NOT a game-value search)

Implementation:
`research/isograph/discovery/2026-10-16-algorithmic-core/residual-dependency-width-probe.mjs`.
Evidence:
`RESIDUAL_DEPENDENCY_WIDTH_PROBE_0_1.json`.

Construct every source residual R0/R1 requirement directly from the 69 original standard7x6 winning lines under legally replayed `44444`, with first-win guards and antichain normalization. Build a PRIMAL graph over the unoccupied future cells; connect two variables iff they occur together in some normalized residual requirement (of either player). Use a deterministic greedy MIN-FILL elimination order. This is only a graph structural diagnostic, NOT the quantified Boolean WDL interaction graph and NOT a minimal-treewidth calculation.

| Source | Future cells | (R0,R1) minimal generators | Primal graph edges | Connected-component sizes | Greedy min-fill width upper bound |
|---|---:|---:|---:|---|---:|
| `44444` | 37 | (48,42) | 198 | [37] | 15 |
| `444444` | 36 | (42,42) | 186 | [36] | 17 |
| `4444414` | 35 | (46,34) | 178 | [35] | 14 |

For `44444`, cutting columns 1–3 versus 4–7 leaves **44 crossing primal edges involving 27 distinct future-cell endpoints**. These are direct structural counts, not a proof that no cleverly factored logical expression exists. Connectedness rules out *the immediate disconnected-component decomposition of the displayed residual hypergraph*, but not algebraically equivalent factorizations or smaller CONDITIONAL separators. It also does not provide a lower bound on the full quantified Bellman interface width. The center becoming full does NOT decouple the source residual requirements into two independent wings.

## Ranked next proof program (no solved-label inputs)

**Priority 1 — dependency-conditioned factoring / Boolean rank.** First formalize an action-labelled source-q threshold as a composition of **factor supports and quantified dependencies**. Search for sufficient local exact separation conditions; try to factor the earliest two alternating response blocks into Boolean rectangles **before** constructing each (reply,action) pair. Preserve terminal, gravity, mover parity and legal-support guards as boundary dependencies. The exact factor lemma above is the admissibility rule; the physically checked `223` response relation is a unit test. Measure rectangle factor count and falsify with fooling sets when necessary. If the source residual hypergraph cannot be usefully separated, preserve that negative result.

**Priority 2 — quantified cofactor interface WIDTH.** Add instrumentation to the currently qualified source-anchored multi-output Bellman BDD for per-variable-cut numbers of distinct cofactors, support-level active interface variables, and width **before/after each quantified predecessor**. Compare source-frequency linear OBDD ordering with a factored decomposable structure informed by a width decomposition. This is the direct route indicated by Capelli/Mengel and Amarilli/Monet/Senellart; compare actual construction work, not final root constants.

**Priority 3 — sound support/obligation quotient.** If a new grouping rule emerges from source factorization, prove a transfer-commuting diagram on legal source q, with explicit action transporter, all P0/P1 quantified choices and first-win/draw boundaries. Local equality or conditional-separator completeness must be proved without appealing to unknown eventual WDL labels. Use the qualified small-board and `44444` bounds only as independent post-derivation falsifiers.

**Stop/failure controls:** reject any rewriting equating FORALL b EXISTS a with EXISTS a FORALL b (legal `223` is counterexample); reject quotienting by symmetric heights without mirror-invariant full R0/R1 (legal `1234` counterexample); reject terminal or full-column legality guard omission. Maintain the existing 60k node, 300k Boolean operations, 10k support and 15-second per-compile research envelope until a separate instrumented decision authorizes changes. Merely wrapping exhaustive alternatives into one matrix/BDD object is not computational branch elimination.

**Main conclusion:** The mathematics suggests a better target than searching for more geometric support symmetries: **dependency-qualified quantifier locality and exact bounded cofactor-interface width**. Boolean-rank factorization offers a concrete mathematical representation of adaptive response covers; structured width theory explains both potential compression and rigorous limitations. There is no sourced theorem that immediately proves Connect Four branch-free or assigns an eventual winner after `44444`.

This document is a LITERATURE AND THEOREM RESEARCH CHECKPOINT, not a new qualified Connect Four solving theorem. No GitHub Actions or full-game search was used.
