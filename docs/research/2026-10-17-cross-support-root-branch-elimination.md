# Exact nongeometric full-future root-action branch elimination from source residual transports

**Date:** 2026-10-17 Pacific. **Canonical research owner:** `research/semantic-quotient`.
**Research direction:** Josh Oshiro. **Status:** Deductive full-future game simulation and scalar-minimum quotient, bounded explicit source-only construction, exhaustive legal small-board independent WDL controls. **NOT** a universal branch-free Connect4 solver, NOT an unrestricted `44444` best-move certificate, NOT a new game-theory authority or merge.

## 1. Research objective and why this is different

The owner explicitly redirected further research to eliminating **independent strategic branching**, not to deeper symbolic BDD/QBF compilation or faster traditional minimax. The exact residual-state/cofactor recursive algorithm is already constructively complete. The historical chronological move7/move8 column-completion transition and finite tactical move8 defensive masks are already proved; their completion is independent of the current arbitrary-depth strategic-value problem.

Previous work produced:
- one shared first-action WIN/NONLOSS action vector from a guarded source-QBF, still expanding correlated adaptive cofactors;
- an exact source-only dual universal-response antichain, but its short-horizon equality cannot be lifted to perfect play: legal 4x3 `111` replies2/3 have identical bounded signatures yet full P0 WDL +1/0, and legal 4x4 `1111222234334` replies3/4 differ -1/0 despite identical short masks;
- a **full-future** favorable-upset comparison for two P1/P0 ownership-swapped continuation diamonds of the SAME column support, but one diamond matches only ONE subsequent P0 response and does not eliminate an entire original P1 move branch.

**New mathematical result:** Compare TWO different legal P1 FIRST-ACTION children directly. A source-derived *column transport*, even one that is NOT a geometric symmetry of the original board, can certify their **complete remaining strategic games** equivalent or weakly value ordered by proving one fixed column permutation matches every future move of either player and preserves first-win/terminal outcomes.

This is a genuine cross-support *entire root-action branch* certificate. It does not require the original q children to have equal h vectors in the original label order; only height/capacity vectors under the proven column transport.

## 2. Fixed-column full-future alternating-simulation theorem

Let q_A=(h_A,R^A_0,R^A_1) and q_B=(h_B,R^B_0,R^B_1) be valid NONTERMINAL residual states on the same W×H gravity board, with the same player to move, rank and remaining capacity. Let π be a permutation of columns such that

    h_A[c] = h_B[π(c)]     for EVERY original column c.

This defines an exact future-cell bijection

    φπ(c,row) = (π(c),row),   for row >= h_A[c].

The height condition makes π a total **future-play transporter**: under ANY legal future action sequence (c0,c1,...), its pointwise image (π(c0),π(c1),...) is legal for exactly the same prefix durations. Gravity, move parity, and full-board draw time agree inductively. Define the P0/P1 completion upsets from the normalized source residual antichains:

    U_i^q(S) = [ exists r in R_i^q : r subseteq S ].

**THEOREM CS-ORDER.** If

    φπ(U_0^{q_A}) ⊆ U_0^{q_B}   and
    U_1^{q_B} ⊆ φπ(U_1^{q_A}),

then

    V_P0(q_A) <= V_P0(q_B)

for the EXACT unrestricted first-win-stopped WIN/DRAW/LOSS game.

**Proof.** The future-cell transport bijection preserves identical legal action choices after relabeling π and preserves player parity. The two upset inclusions make the P0 winning-completion predicate in B at least as easy as in A, and the P1 winning-completion predicate in B no easier than in A. On a legal P0 move, owner-true contraction of P0 completion upsets and opponent-blocker deletion of P1 upsets preserve these inclusion directions when the corresponding same-height landing cells are mapped by π; P1 moves use the symmetric contractions/deletions, preserving the same favorable order. An immediate P0 win in A is also a P0 win in B, and an immediate P1 win in B is a P1 win in A; other first-win terminal mismatches order correctly for P0. A full-board nonwinning draw occurs at the same ply. For nonterminal successor pairs, the theorem assumptions recur. Induct on strictly decreasing unfilled capacity; P0 MAX and P1 MIN over bijectively corresponding legal action labels both preserve pointwise inequality. No future game histories or numerical solved values are premises.

**Exact future PROGRAM isomorphism.** If **both** inclusions hold under the SAME π, then the P0 and P1 upsets coincide under π, and π maps all legal future actions, every terminal outcome and every next residual cofactor exactly. Thus the full future game trees and ALL future WDL-optimal literal action sets correspond under the single π. If two *different* permutations separately prove opposite weak inequalities, only equality of scalar WDL follows; do not infer a single transporter for every future policy.

**Finite source generator test.** `U_X⊆U_Y` iff for every minimal generator x∈X some y∈Y satisfies y⊆x. Proof: necessity at S=x, sufficiency by monotonicity. This permits direct proof from original source residual requirements, with no terminal continuation enumeration.

## 3. Construct first-action comparisons from ONE original source q

For legal NONTERMINAL P1-to-move q=(h,R0,R1) and any first reply b, original landing cell x_b=(b,h_b), compute only the *symbolic residual arrays* of the P1 child (no new successor q game object):

    h_b = h+e_b
    R0_b = Min({r∈R0 : x_b notin r})             [P0 blocker delete]
    R1_b = Min({r\{x_b}:r∈R1})                   [P1 owner true].

P1 immediate win and full-board last-move draw are explicit exclusions from this NONTERMINAL theorem. For replies b,c, seek height-preserving π between h_b and h_c; on the mapped source residual antichains apply CS-ORDER in each direction. If one direction holds, P1 reply b is no worse than c for the P1 MIN scalar root calculation; if both, their unrestricted WDL values tie. If BOTH hold under one π, they are exact future-program isomorphisms, with literal subsequent action maps.

The original geometry's reflection is one possible π, but no general geometric winning-line automorphism of the EMPTY board is required. Blocked winning lines are already absent from the source residual families. Consequently an *emergent partial-board symmetry* may exchange columns that are NOT geometric mirror partners, provided the source residual WIN upsets and all future legal capacity events agree.

## 4. Proof search: avoid enumerating every permutation

Frozen research plans: `CROSS_SUPPORT_COLUMN_TRANSPORT_PLAN_0_1.md`, `COLUMN_TRANSPORT_PARTIAL_GENERATOR_PLAN_0_1.md`.

The first source-only implementation exhaustively tested height-compatible column permutations. At canonical `44444` it reached 300,001 counted source bitset checks before completing all 21 unordered P1 root response pairs; only the already known {1,7} reflection was found before cutoff. This negative is preserved in `COLUMN_TRANSPORT_INITIAL_RESULTS_0_1.json`.

The selected `column-transport-partial-generators.mjs` constructs a height-compatible partial injective π. For any source generator g whose column support is fully assigned, φπ(g) is immutable under any extension. If NO target residual generator fits inside its mapped bitset, the respective upset implication is impossible for every extension. For target generators whose target columns are fully assigned, the same necessary check applies under π^{-1}. Track forward and backward weak-order viability separately, and prune a partial column map only when **both** have failed. At a full bijection these tests are the exact generator inclusion criterion. This is sound **constraint propagation over static column matching**, not branching over gameplay continuations.

Canonical `44444` now completes ALL 21 original P1 first-action pairs within unchanged 300k per-source Boolean/bitset operations: **291,518** charged source operations, 596 partial column assignments and 415 provably impossible partial mappings pruned, requiring only three complete final π certificates. It confirms exactly the prior geometric reflection pairs {1,7}, {2,6}, {3,5}, and NOTHING beyond reflection for this source under the restricted fixed-permutation simulation. Six pairs have incompatible column-capacity shapes; twelve have no certificate under this sound but conservative transporter. The latter are **UNKNOWN**, not proved strategically incomparable. The exact WDL of `44444` is still UNKNOWN [-1,+1].

## 5. Exhaustive independent full-game validation: real NEW equivalences

Code:
- source producer `research/isograph/discovery/2026-10-17-dual-obligation-quotient/column-transport-partial-generators.mjs`;
- physically independent exact-q reference `column-transport-physical-control.mjs`;
- independent scalar-min reduction `root-action-dominance-quotient.mjs`;
- root WDL/complete action-reference control `root-action-dominance-physical-control.mjs`;
- generic directed-WDL-graph falsifier `root-action-dominance-generic-control.mjs`.

These sources are exact committed GitHub code, executed in isolated V8 directly from live GitHub blobs. The producer reads **only original source h/R0/R1 and fixed finite column transports**; ALL full-game recursive q evaluation appears ONLY in independent qualification afterward. No Node26 maintained suite or independent third-party proof assistant is claimed.

The physical validator exhaustively visited **4,631** first-win-stopped nonterminal 4x3-c3 states and **134,289** such 4x4-c4 states, and deduplicated by exact residual q BEFORE declaring independent root-action evidence.

| Exhaustive board corpus | Unique P1 source q | First-action pairs | Exact NON-reflection future-program isomorphisms | One-way nonreflection WDL orders | False certificates |
|---|---:|---:|---:|---:|---:|
| 4×3 Connect3 | 1,786 | 4,794 | **86** | **320** | **0** |
| 4×4 Connect4 | 16,950 | 53,130 | **2,280** | **3,760** | **0** |

The independent reference additionally checked all subsequent literal action-value transports under the claimed isomorphisms: 214 mapped action values (4x3) and 6,560 (4x4), zero discrepancies. A one-way weak dominance can be strictly separated in the solved reference or can tie: the source claim is only `<=`, not automatic strictness.

**Concrete NON-GEOMETRIC source certificate:** 4x4 Connect4 legal prefix `1111222`, P1 to move. Columns **3 and 4** lead to fully isomorphic future games via π=[1,2,4,3] (one-based). This exchanges columns 3 and 4 while keeping 1 and 2 fixed; it is NOT the board's horizontal reflection [4,3,2,1]. The independent reference finds both moves draw, but that value was NEVER used to find or establish the equality. All future optimal action labels transport under π.

## 6. Actual exact root-action minimax obligation removal

For each source q with P1 to move, form a directed graph over legal first actions; include certified edge b→c only when the source simulator proves unrestricted `V_P0(q after b)<=V_P0(q after c)`. This orientation is correct for P1's MIN of P0-relative WDL.

**THEOREM SCALAR-MIN-QUOTIENT.** Directed paths compose certified weak inequalities. Every directed strongly connected component (SCC) is an exact **scalar** WDL-equivalence class. The condensation DAG's components with no incoming edges are sufficient for P1's scalar minimum: for every excluded component there is a source SCC reaching it by a certified weak-order path. Thus

    min_(all legal b) V_P0(q[b])
      = min_(one representative of EACH source SCC) V_P0(q[b]).

Proof: path monotonicity establishes the RHS <= each removed value; RHS already considers a subset of all values and so cannot be strictly below the LHS. Both inequalities prove equality, for **every assignment of unknown WDL values respecting the certified order**. The corresponding source-only operator retains all original move labels, full WDL-equivalence SCC groups, and a proof path for each omitted scalar first-action evaluation. Weakly dominated replies might TIE the minimum: the producer therefore does **NOT** invent an exact complete optimal-move set or remove any potential tie labels.

**Independent generic algebraic falsifier:** all **4,096** directed graphs on four labelled actions, with **331,776** possible three-valued assignments inspected. For all **33,792 assignments** satisfying the graph's certified weak inequalities, the scalar minimum on selected representatives equalled the minimum over all four; every SCC group had equal WDL, every omitted proof path preserved ≤, and a reversed-edge mutation was correctly rejected.

**FULL independent small-board scalar-root validation:**

| Corpus (unique exact P1-q states) | Original legal first-action value obligations | Value obligations still necessary | Eliminated source-only | Reduction |
|---|---:|---:|---:|---:|
| 4×3 Connect3 | 4,872 | 4,502 | **370** | **7.594%** |
| 4×4 Connect4 | 50,034 | 44,480 | **5,554** | **11.100%** |

All 1,786 / 16,950 distinct source P1-q root minimum calculations agreed with the separately qualified exact q reference, zero wrong value minima, no falsely equated WDL classes or erroneous omitted-action order proofs. **All 370 / 5,554** eliminations are beyond the geometric reflection-only comparison on these odd-rank sources; ordinary global reflection does not supply the new certified matches. Source generator/column-mapping/graph proof work totals **408,967** counted bitset+graph operations over the 4x3 corpus and **3,476,170** over the 4x4 corpus; these are NOT free, and no end-to-end CPU speedup has been measured.

**Important:** These counts are *independent root scalar WDL proof obligations which need not be requested*, NOT independently verified savings of 370 / 5,554 full future recursive q descendants. The qualified recursion may share memo states and sometimes already avoid duplicate subproblems. The structural relation truly avoids those root-value requests in principle, but a matched real solver savings benchmark is still open.

For `1111222`, the source simulator groups P1 labels {3,4} as equal and retains scalar evaluation representatives {2,3}, omitting column 4's separate value calculation. The external exact-q verifier later confirms root DRAW and all three P1 actions {2,3,4} tie; the producer proved only equality of 3 and 4 and the scalar min reduction, not the final draw/best set.

## 7. What remains to solve

This is substantially closer to the owner's branch-elimination goal than a larger unevaluated QBF or another fixed-depth BDD: the new certificates operate on **full remaining WDL futures** and can delete original P1 **first-action scalar value obligations**, including nongeometric cases.

Nevertheless it is not yet an exact nonbranching WDL solver, because (1) many root actions have no comparable transported future game; (2) fixed bijective columns cannot relate P1 moves with incompatible remaining-capacity multisets (notably center-fill vs wings from `44444`); (3) scalar-min pruning does not identify every WDL tie or strict loser and cannot independently output the **complete** optimal move set; and (4) remaining representatives still need a value theorem.

**Next mathematically justified target:** derive a guard-complete **nonbijective/dynamic alternating response transporter** between different-capacity supports, or a conditional source-fiber simulation that matches EVERY downstream player choice without recursively exploring future games. Prove its own cofactor/first-win stability and source-only resource semantics BEFORE numerical game-value comparison. Separately seek a source-derived **strict WDL or exact-equivalence** certificate so every tied-optimal literal label can be decided without separately solving dominated branches.

The explicit unfixed-certificate test at `44444` remains four mirror equivalence classes, no nonreflection P1 first-action dominance certificate and unrestricted root WDL and optimal set **UNKNOWN [-1,+1]**. All historic 4x3 `111`, 4x4 `1111222234334`, legal `223` adaptive quantifier-order and original move7/turn8 transition falsifiers remain mandatory.

**No game-theory authority promotion, no merge, no solver policy adoption.**
