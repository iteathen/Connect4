# One-pass shared first-action quantifier projection and exact complete optimal-move sets

**Date:** 2026-10-16 (Pacific). **Canonical research owner:** `research/semantic-quotient`.  
**Research direction:** Josh Oshiro.  
**Status:** New exact *first-action sharing* theorem (an elementary quantified-conditioning identity) plus bounded independently reproduced implementation; **general strategic branch elimination remains OPEN**. No gameplay authority revision, new claimed general polynomial complexity, or production merge.

## 1. Research target

The owner's PRIMARY open objective is **eliminating separately evaluated strategic branches**, returning the exact P0-relative W/D/L value and the COMPLETE set of all legal actions tied at the mover's optimal W/D/L. The existing recursive residual-q/cofactor/minimax algorithmic core is already complete but does not meet this stronger target.

A compact, unevaluated all-depth QBF is not a branch-eliminating value algorithm. The preceding source-guarded action-QBF translation generated k37 after `44444`; an exact action-bit Shannon projector with after-bit live compaction still hit 60,000 intermediate nodes at k7. We ask a smaller mathematical question: **can one quantified projection share every future response across ALL possible first actions while yielding action-labelled outputs, rather than separately evaluating one root action at a time?**

Source-only algebra, exact first-win/terminal/legality guards and all alternating action dependencies are unchanged.

## 2. The shared-first-action projection theorem

Let q=(h,R0,R1) be a legal nonterminal first-win-stopped source residual state, L(q) the literal legal column set, and k>=1 a finite horizon at most the remaining cells. Let F_z(a_0,a_1,...,a_{k-1}) be the original *rule-derived*, binary-action-code, guard-complete source-QBF Boolean matrix for each threshold z in {Wlo,Nlo,Whi,Nhi}. Its P0 existential and P1 universal decision quantifiers (including illegal-action neutral guards) are fixed by source rank and move parity.

**Define a single partial projection, leaving the first action free:**

    G_z(a_0) = Q_1 a_1 ... Q_(k-1) a_(k-1) . F_z(a_0,...,a_(k-1)).

The inner Q_i retain their exact chronological scope; no quantifier swap or presumed nonadaptivity occurs. The deterministic Tseitin gates have already been functionally replaced by their unique AND/NOT definitions, as in the previously proved guarded-action-QBF theorem.

**Theorem A (simultaneous action-threshold law).** For every legal literal first action c:

    G_z(c) = value_z^(k)(q, action=c),

where the right side is the exact *finite-horizon* Bellman first-action Boolean threshold, including a first-move win/draw and optimal alternating reactions thereafter.

**Proof.** At any fixed legal a0=c, the source guarded-QBF matrix F_z(c,a1,...) is pointwise equal to the physical source-q depth-k continuation threshold (existing Q1–Q5 theorem). The identity `(Q_x F)(c)=Q_x(F(c))` holds whenever c is a free input distinct from quantified x; prove directly from `exists x H = H[x=0] OR H[x=1]` and `forall x H = H[x=0] AND H[x=1]`, then induct on the ordered inner action bits/blocks. Neither the original quantified prefix nor the dependency of later existential actions on prior universal actions changes. Thus a *single* function G_z retains ALL labelled first-action values. To construct it, project the k-1 inner blocks once per z, retain the outer binary action bits, then evaluate G_z on each legal c; the final lookup is O(W) labelled input assignments, not another future game solve. The implementation explicitly rejects a surviving later-action variable and illegal/duplicate root labels.

The theorem is mathematically exact, but does **NOT** bound the cost of computing G_z; the still-expanded inner alternating decisions may require exponential intermediate cofactors. It is an improvement in **reuse across root actions**, not a general proof of nonbranching minimax.

## 3. Exact WIN/NONLOSS interval reconstruction and complete optimal sets

For every legal c, use the four Boolean outputs `Wlo_c, Nlo_c, Whi_c, Nhi_c`, preserving consistency `Wlo<=Nlo`, `Whi<=Nhi`, `Wlo<=Whi`, and `Nlo<=Nhi`. Define P0-relative scalar bounds:

    low_c =  +1 if Wlo_c, 0 if Nlo_c, else -1
    high_c = +1 if Whi_c, 0 if Nhi_c, else -1.

Then the root interval is

    [max_c low_c, max_c high_c]  if P0 to move,
    [min_c low_c, min_c high_c]  if P1 to move.

If every action's lower and upper bounds coincide, its exact WDL is known. Let V= mover-relative max/min of those exact P0-relative action values. The **complete** WDL-optimal literal set is

    M*(q) = { c in L(q) : low_c = high_c = V }.

**Proof of set completeness:** Every legal c has one exact action value by the bounded-Bellman/guard theorem. The mover's max/min over the *entire* legal label set is exact. The equality predicate includes every and only those labels with this value; no tie-breaking, remoteness or survival-time ordering enters. At k=remaining cells, every legal path terminates by first win or full-board draw, so lower=upper for every action. At a shorter horizon, an interval may remain open; the prototype correctly returns an **UNKNOWN optimal set**, never inventing that all bounded-tied moves are full-game-equal.

This is an action-mask operation from one shared future function rather than one separate value-proof per first action. General deep branching is still visible in the quantification of G.

## 4. Frozen controls and exact local evidence

Plan frozen BEFORE producer/control: `research/isograph/discovery/2026-10-16-algorithmic-core/SHARED_FIRST_ACTION_QUANTIFIER_PROJECTION_PLAN_0_1.md`.

Reproducible source-only producer:
`guarded-action-qbf-first-action-vector.mjs` (Git blob `e09d12a5764879289c96b3ee0d9db5f424adcce7`).

Independent physical-first-win reference harness:
`first-action-vector-control.mjs` (Git blob `370b1c14d8603b43f5d82bf0ff3668a4f3668040`).

These share **NO** physical game-continuation enumerator on the candidate side. The independent validator enumerates physical legal moves with terminal checks to establish the expected action thresholds and optimal sets. Tested locally with Node.js v22.16.0; source Git blob identity confirmed. The full local harness-output SHA256 is `736a57439520faf060dee40a4ae296ca1a68c29128d2ed35dd8922b207d23a54`. Machine result (all selected controls and 5 matched comparisons):
`SHARED_FIRST_ACTION_QUANTIFIER_PROJECTION_RESULTS_0_1.json`.

**Results:**

| Independent test scope | Measurement |
|---|---:|
| (source,horizon) pairs | **47** |
| Shared threshold QBF constructions/projections | **188** |
| Per-action Boolean threshold comparisons with physical reference | **672, zero mismatches** |
| Independently searched physical validation transitions | 532,956, **validator only** |
| Full-game, exact W/D/L-optimal-action-set positions | **24/24 correct** |
| Of those, uniquely best move | **13** |
| Of those, 2 or more best moves | **11** |

Full-game suffix fixture selection: deterministic lexicographic DFS, independent of move value, to pick the first **four distinct nonterminal physical positions with >=2 legal columns** at ranks N-5, N-4, N-3 for both 4x3 Connect3 and 4x4 Connect4 (24 total). The harness records every chosen history, its rank, and the complete action values; it rejects already-terminal prefixes. There are P0/P1 root turns, WIN/DRAW/LOSS outcomes, both ties and unique best actions. No perfect-play or solved-game policy guided fixture selection.

Illustrative independent controls, **1-based** literal columns:
- 4x4 Connect4 `11112222333` (P1 to move): action column 3 gives P0 +1, column 4 gives 0. Root P0-relative DRAW, unique P1-optimal set `{4}`.
- 4x4 Connect4 `111122223434` (P0 to move): column 3 yields +1, column 4 yields 0. Root P0 WIN, unique optimal set `{3}`.
- 4x4 Connect4 `111122223443` (P0 to move): both columns 3 and 4 yield DRAW. Root DRAW, exact best set `{3,4}`.
The last example is an explicit counterexample to forcing a singleton when multiple actions tie.

## 5. Honest work and baseline qualification

A matched *naive separate-root* baseline recompiles the guarded QBF with `fixedFirstAction=c` and fully quantifies the result once per legal action and Boolean threshold. The shared method compiles once per threshold, quantifies the later action blocks once, and looks up all legal labels. Identical source semantics, test inputs and resource limits; exact threshold equality is checked against both physical reference and the fixed-first baseline.

| Fixed source, horizon | Legal actions | Separate Boolean work | Shared Boolean work | Saved |
|---|---:|---:|---:|---:|
| 4x3 `223`, k3 | 4 | 12,012 | 2,590 | 78.44% |
| 4x3 `223`, k4 | 4 | 31,536 | 6,460 | 79.52% |
| 4x4 `223`, k4 | 4 | 22,356 | 5,254 | 76.50% |
| 7x6 `44444`, k3 | 7 | 44,366 | 6,072 | 86.31% |
| 7x6 `44444`, k4 | 7 | 135,856 | 18,049 | 86.71% |

The Boolean work counts charge the source QBF compiler's existing Boolean operation metric **plus** the projector's nontrivial cofactor/gate operations. *Additional* GC/traversal/equivalence-check units are separately recorded in the machine evidence. When combining the instrumented Boolean and GC units, observed savings range **68.11%–81.67%**. CNF primal graph construction, JS memory allocation, and interpreter overhead are not completely normalized into these units. Hence these are **scoped work-sharing** measurements, not verified end-to-end clock-speed multipliers.

**Baseline limitation:** The separate-root comparator intentionally does not reuse any inter-action compilation/projected inner function. An optimally cached recursive solver or source-owner ROBDD may reuse equivalent work and close the gap; the current **reflected source-owner BDD k11** is already much stronger at bounded-value depth. Do NOT advertise these percentages as superiority over that algorithm or as a universal complexity improvement.

The candidate still performs bounded bitwise Shannon branching over nested future action quantifiers. The output is one function G, but its construction is not proven nonbranching in the stronger owner-required computational sense.

## 6. Canonical 44444 and next mathematical seam

For `44444` with P1 to move on turn 6, the candidate completes all four shared depth6 threshold *action vectors* within unchanged research limits, and each of the seven legal actions retains bounds `[-1,+1]`. Therefore the unrestricted root remains **UNKNOWN [-1,+1]**, and neither optimal P1 action sets nor full-game equal-value classes can be asserted from these short-horizon coincidences.

At k7, **all four candidate threshold projections** again hit the unchanged 60,000-node limit after only **12 of the 18 inner quantified bits**. Lower-case work to partial = 207,236 Boolean operations; upper-case = 237,668. Thus leaving the first action free does **NOT** solve the deeper within-bit cofactor-product width bottleneck.

**Next mathematically serious target:** fuse existential/universal quantification into **guard-qualified subcircuits before constructing both full Shannon cofactors**, and/or calculate essential future-function equivalence classes with explicit distinguishing-assignment proofs. Maintain the free-root-action vector throughout. Compare the resulting genuinely shared multi-output carrier against the existing source-owner ROBDD, not just the naive repeated-fixed-action comparator. The relevant literature on quantified structured decision diagrams and projection (Capelli–Mengel 2018/2019, https://arxiv.org/abs/1807.04263; Bryant et al., *Certifying Projected Knowledge Compilation*, SAT 2025, https://doi.org/10.4230/LIPIcs.SAT.2025.8) explains the output-projection formalism and the need for independently checkable equivalence, but neither theorem gives a guaranteed cheap Connect Four k7 compiler.

**Conclusion:** A new **exact, proved, and scoped** one-pass, full first-action WDL-optimal-set operation exists. It eliminates redundant independent root-action projection on qualified finite-horizon and complete-game suffix controls. **It does not yet eliminate the internal exponential alternation**, so the owner's stronger full-game branch-elimination success criterion remains OPEN. The complete recursive core and game-theory authority are unchanged; no merge.
