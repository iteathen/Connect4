# Owner's binary-turn-sequence hypothesis: 7×6 synthesis and exact next mathematical target

**Date:** 2026-10-17 Pacific. **Research owner:** research/semantic-quotient. **Owner insight:** board geometry interacting with turn order produces W/L/D, suggesting a binary structural core with the turn sequence factored by XOR. **Status:** exact scope-limited algebraic decompositions and independently exercised standard7×6 physical controls; TOTAL zero-strategic-branching (V,M*) still OPEN. No change to IsoGraph 1.2 authority; W/H/K kept symbolic for later generalization.

## 1. Verified exact decomposition

There are THREE mathematically distinct objects which together describe the phenomenon:

1. **Gravity event poset** P(h): a disjoint union of W column chains, with cells (c,h_c),...,(c,H-1). Legal chronological placements form one linear extension of this poset.
2. **Binary turn phase**: for any future event (c,r), the absolute owner bit is n XOR (r-h_c) XOR the GF2 parity of all FUTURE predecessors in other columns. Thus color is not primitive to be searched: it follows from placement rank parity, but the unknown cross-column ordering still matters.
3. **Geometric terminal hypergraph**: 69 four-cell original lines on actual7×6. A K-line is completed iff its event ownership bits satisfy K-1 *affine GF2 same-color equations*. The terminal time is the earliest rank of any completed line; winner is the turn parity of THAT completion, not merely the final coloring. In q ontology, normalized surviving residual generators R0,R1 already encode the viable line contracts and blockers.

For a GIVEN legal future column schedule σ and nonterminal source q, define χσ(e)=(n+tσ(e)-1)mod2. An original source R_p generator G completes if

    C_p,G(σ)=PROD_{e∈G}(1 XOR χσ(e) XOR p)=1.

Earliest winner rank is

    t*(q,σ)=min_{p,G∈R_p : C_p,G(σ)=1} max_{e∈G} tσ(e).

If no such G exists, the path draws. Otherwise the winner's binary player is (n+t*-1)mod2. This is a complete **fixed-play payoff algebra from q only**. No old physical coloring need be invented from q, and antichain superset elimination preserves the earliest win.

For PERFECT PLAY with alternating choice, two scalar threshold channels f+=[V=+1], f0=[V>=0] produce two transformed binary bits g_t=f_t XOR (n mod2), both with exactly the same nonterminal NAND equation

    g_t(q)=1 XOR PROD_{a legal(q)} g_t(next(q,a)).

The terminal decisive tags are (0,0); drawn terminal tag is (0,1) on current even-WH standard7x6. Draw indicator d=g0 XOR g+. Player winner bits:
    P0win=g+ XOR (n mod2);
    draw=g0 XOR g+;
    P1win=1 XOR P0win XOR draw.

**Limit:** AND/product over values of DIFFERENT future games has not vanished; XOR factors the phase/quantifier polarity, NOT the unresolved choices. Each completed-line predicate is a conjunction of affine equalities, but the OR of 69 line events, their FIRST completion order and the adversarial legal-choice game is NOT generally XOR-linear. A single GF2 linear system is not established as a whole-game solution.

## 2. EXACT all-optimal-move zero-locus normal form

For every original legal column a, define two unknown child bits and their two zero sets:

    Z_t(q) = { a : g_t(next(q,a))=0 },   t in {+,0}.

These are NOT solved labels at the source and must not be queried separately in a claimed zero-fanout producer.

- P0 to move: Z+⊆Z0. If Z+ nonempty, (V,M*)=(+1,Z+); else if Z0 nonempty, (0,Z0); else (-1,ALL legal).
- P1 to move: Z0⊆Z+. If Z0 nonempty, (V,M*)=(-1,Z0); else if Z+ nonempty, (0,Z+); else (+1,ALL legal).

Thus the requested unrestricted (V,M*) is exactly equivalent to **finding the two COMPLETE nested source action zero loci**, not merely computing a scalar AND/product or one best witness. Direct source derivation of BOTH zero sets over multiple inequivalent actions is still the missing theorem. Mathematically this isolates the precise obstruction left after XOR extraction and is consistent with the owner's zero-branch/tied-label contract.

At canonical history 44444, n=5, P1 to move and 37 cells future. Four true reflection-root action classes remain {1,7},{2,6},{3,5},{4}. The SOURCE unknowns are two nested zero-locus masks constrained by reflection and by the full 7×6 geometric residual hypergraph; their exact membership is NOT known. Therefore unrestricted V(44444) and M*(44444) remain UNKNOWN.

## 3. Executed genuine 7×6 evidence: exact and carefully scoped

A) Frozen event-parity/69-line physical falsifier
   - 19,306 deterministic gravity-legal hypothetical complete 7×6 schedules, including genuine source histories 44444 and 4444442;
   - 782,852 cell-owner XOR checks;
   - 1,332,114 K-line original-monochrome checks;
   - ZERO wrong first-win rank/winner and ZERO adjacent independent-column two-cell XOR-swap contradictions;
   - file: STANDARD7X6_BINARY_EVENT_PHASE_PHYSICAL_RESULTS_0_1.json.

B) Independent true board witness that time CANNOT be erased
   - Two complete 42-event hypothetical standard7×6 schedules with IDENTICAL final per-cell P0/P1 assignment nevertheless first-win differently:
     schedule A first wins P1 on turn 30, line one-based cells (6,2..5);
     schedule B first wins P0 on turn 29, line one-based cells (1,3..6).
   - An independently implemented array-grid/directional win detector confirmed first-win-stopped legal prefixes of both and identical final hypothetical colors. Later moves in the 42-event schedules are explicitly hypothetical, NOT allowed ordinary post-terminal gameplay.
   - file: STANDARD7X6_BINARY_SAME_COLOR_DIFFERENT_WINNER_INDEPENDENT_RESULTS_0_1.json.
   - Consequence: an end-coloring-only XOR quotient is NOT first-win equivalent. Earliest event rank is a necessary part of the core.

C) Exact q-only fixed-event-order payoff
   - Valid legal physical source history is compressed to q=(h,min R0,min R1), then past per-cell color history is discarded by the source payoff evaluator. The physical independent first-win observer still uses its own 7×6 array grid.
   - 22,003 sampled genuine 7×6 gravity schedules/source prefixes; 705,717 event parity checks; 3,313,200 residual-generator phase-cell tests;
   - ZERO wrong first winner, ZERO wrong first terminal rank;
   - canonical exact source antichain controls: 44444 R0/R1=48/42; 444444=42/42; 4444442=39/41.
   - same frozen executable independently rerun from EXACT committed Git blob 874ffe3cceaee69d958606e5ae930acb5afe685b, PASS. Evidence STANDARD7X6_SOURCE_Q_XOR_PAYOFF_RESULTS_0_1.json.

D) Full PERFECT-PLAY logical correctness of two NAND channels and full literal tie extraction, as validation ONLY:
   - 600 genuine nonterminal 7×6 positions with >=2 legal first actions at n>=36, drawn from reproducible nonuniform source sample;
   - 2,126 literal child WDL values, 326 root positions with tied best columns;
   - independent physical recursive min/max and separate terminal-tagged recursive NAND value implementations: ZERO root WDL or all-best-mask errors;
   - exact nested zero-locus theorem itself reconstructed every root (V,M*) from child binary zero membership, 600/600 correct; draw bit g0 XOR g+ correct 600/600;
   - the NAND and zero-locus reference controls **branch recursively**, outside proposed source-only producer. This is a theorem test, NOT proof of zero strategic branching or of 44444 perfect-play outcome.
   - files STANDARD7X6_BINARY_DUAL_NAND_MULTI_CHOICE_RESULTS_0_1.json and STANDARD7X6_BINARY_ZERO_LOCI_COMPLETE_BEST_REFERENCE_RESULTS_0_1.json.

All files under research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/. Standalone isolated V8 and local Node22 research controls, NOT maintained Node26 CI nor external proof-assistant qualification.

## 4. Geometry not factorable away: exact candidate research objective

The board shape determines the true W×H event-chain poset, K-straight original-line hypergraph, overlap/adjacency, release and first-win race. Keep W,H,K in every identity. Research on actual standard7×6 first, generalize only later.

**Next mathematical unknown:** derive both exact action ZERO-LOCUS masks Z+(q),Z0(q) *directly from ONE q's geometry/phase/residual hypergraph*, WITHOUT computing any two inequivalent child g values or hiding future alternatives in policy tables, BDD/QBF, matching over game histories or dynamic state-space enumeration. This is stronger than scalar winner certification and exactly preserves all tied moves.

Possible structural program (hypotheses, NOT proved):
- Treat each surviving K-line equality condition as an AFFINE GF2 obligation conditional on gravity release, time-to-completion and opponent blocker/counter-win guards; distinguish OR/AND conjunction and first-win race from the linear equation itself.
- Look for a source phase/response invariant or guarded cut/subspace that forces a complete set of literal action zero memberships simultaneously, including equivalences, strict value separation and draw-channel support, not simply one existential witness.
- Test source-invariant candidates first on actual standard 7×6 44444 geometry with unknown labels held blind; independently falsify using legal near-terminal 7×6 unrestricted WDL and complete ties only AFTER freezing a candidate formula.
- Preserve all prior 44444 negative results: static perfect-mate failure, unconditional temporal-packing early-race barrier D=32 vs earliest possible opponent win 6, equal bounded response signature ≠ unrestricted child value, and historical absolute moves7/8 structural transition remains scoped and solved.
- If any two inequivalent unresolved future game-value calculations are required, return INCOMPLETE and preserve negative evidence.

A generic affine quantified-constraint class can be tractable, but that does not establish that the union of 69 K-line races with alternating column-choice and earliest-termination lies in that class. Do not import a generic XOR-SAT solution or sum-of-independent-column nimbers without a formally proved sound reduction.

## 5. Research provenance

Mathematical analogy only (not the source of these Connect4 deductions): finite acyclic combinatorial-game N/P kernels and [Berkeley 2026 game-graph notes](https://stat155.berkeley.edu/fall-2026/lectures/lecture-4.html); quantified affine constraints as a special tractable QCSP language in [Hubie Chen, *The Complexity of Quantified Constraint Satisfaction*, 2006](https://arxiv.org/abs/cs/0607106). Neither analogue supplies the missing 7×6 nonbranching source zero-locus theorem.

**Epistemic summary:** exact XOR binary event-ownership clock: PROVED; source-q fixed-schedule first-win score: PROVED; two binary terminal-tagged perfect-play NAND recurrences: PROVED; exact complete optimal-set zero-locus readout: PROVED; independent standard7×6 validation within enumerated scope: PASS; new total standard7×6 zero-strategic-fanout algorithm: NOT DISCOVERED; 44444 unrestricted (V,M*): UNKNOWN. No authority promotion, no merge.
