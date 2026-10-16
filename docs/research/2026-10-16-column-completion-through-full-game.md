# Column completion at moves 6–8, and residual transition continuity through game completion

**Date:** 2026-10-16
**Research owner:** `research/semantic-quotient`
**Research direction:** Josh Oshiro
**Status:** Exact rank-local/full-fixed-history algebraic transition identity; internally validated across all early move-7/8 paths and complete independent 7x6 games. **Arbitrary-depth nonbranching strategic-value composition remains OPEN.** No qualified semantic-authority change.

## 1. The owner's transition hypothesis and chronological correction

The intuition to test is that the difficult structural change near moves 7 and 8—especially when center column 4 reaches full capacity—is governed by the same underlying operator as earlier and later moves. This is supported, *for legal-state transitions*. That does **not** by itself prove that an algebra can compute exact perfect-play moves at turn 8 without branching.

From canonical prefix `44444` (five pieces in column 4), P1 plays **move 6**, P0 **move 7**, and P1 **move 8**.

There are three distinct legal ways for the center to become full within this window:
- P1 places the sixth center piece on **move 6**: `444444`. P0's move 7 and P1's move 8 must use another column.
- P1 plays a wing on move 6, P0 fills center on **move 7**, for example `4444414`. The center is unavailable on move 8.
- P1 plays a wing on move 6, P0 plays another wing on move 7, and P1 fills center on **move 8**, for example `44444134`.

The earlier exact phase quotient assigns each column `phi_c=(6-h_c) mod 2`, toggled by one legal move. Full columns have `h_c=6` and `phi_c=0`—**but empty columns also have even phase**. Thus phase alone does **not** authorize a move: the full-capacity/legal-action guard is indispensable.

The prior `44444` P1-turn-6 campaign established four strict horizontal-reflection action classes `{1,7},{2,6},{3,5},{4}`, but explicitly left the *eventual* P0-win proof against all seven P1 choices **OPEN**. After `444444`, P0's six available seventh moves form **three mirror pairs**, not one proven full-game value class. Do not conflate reflection and phase equivalence with W/D/L equivalence.

Existing sources: `docs/research/2026-09-13-column-phase-defect-and-zero-phase-core.md` and `docs/research/2026-10-16-turn6-bidirectional-certificate-campaign.md`.

## 2. Exact one-step virtual residual-upset cofactor law

Fix legal nonterminal `q=(h,R0,R1)`. Let

```text
U_i(q,S) = [there exists residual r in Ri(q) with r subseteq S]
```

denote the monotone upset membership of future-cell set S.

For a legal nonterminal move x owned by p and any query S containing only cells still unoccupied *after* x:

```text
U_p(q',S)       = U_p(q, S union {x})
U_(1-p)(q',S)   = U_(1-p)(q, S).
```

The first equation is contraction by the owner's placement; the second is opponent-blocker deletion. They are **exact** under normalized residual antichains and the fresh-cell guard. If the owner's residual becomes empty, first-win terminates before any nonterminal successor is formed. If the resulting board is full without a win, the result is draw.

These equations are unchanged when the occupied cell fills a column. Column completion updates **support capacity and legal landings**; it does not require a new residual-transition type.

Implementation: `research/isograph/discovery/2026-10-16-algorithmic-core/virtual-upset-five-ply.mjs`.

## 3. All-depth fixed-history path-lift theorem

This extends the same cofactor algebra through an arbitrarily long **given legal first-win-stopped sequence** without repeatedly constructing intermediate q objects.

Let q_start be a nonterminal starting state. Let A0, A1 be the sets of **subsequently** placed original future cells owned by P0 and P1 in a legal continuation. Then for i in {0,1}:

```text
Ri_after = Min({ r minus Ai :
                 r in Ri_start AND (r intersect A_(1-i)) is empty })
```

and for a future-only query S:

```text
Ui_after(S) = exists r in Ri_start:
                (r intersect A_(1-i) is empty)
             AND (r subseteq (S union Ai)).
```

**Proof:** At one move of player i, the owner cofactor deletes the played cell from each own requirement; the opponent cofactor discards every opposing requirement containing that cell. These two set operations compose under distinct occupied events and commute with antichain absorption for their resulting upset predicates. Induction on supplied future events gives the closed owner-mask formula. The **order of past cell events** is irrelevant to the residual projection *once the same legally owned cells are fixed*. **Legality and terminal time are order-sensitive**, however, so gravity/alternation and mover first-win-before-draw must be checked after every supplied event. The formula cannot authorize post-terminal histories.

This is an exact **transition mechanism**, not a solution to alternating strategic quantifiers. Supplying the future ownership masks is not the same as finding an optimal sequence of decisions. The qualified recursive q core already solved the semantic state-identity problem; this theorem shows its fixed-word operators can be algebraically fused across arbitrary ranks.

Implementation: `all-depth-owner-mask-lift.mjs`. Validation: `all-depth-owner-mask-control.mjs`.

## 4. Complete early boundary test through move 8

Frozen plan and code:

- `MOVE7_MOVE8_COLUMN_CLOSURE_VIRTUAL_PULLBACK_PLAN_0_1.md`;
- `move7-move8-column-transition-control.mjs`.

From `44444`, the independent geometry/q validator tested all seven P1 move-6 choices, all 48 legal P0 move-7 continuations, and all 324 following legal P1 move-8 continuations. This includes **all** center-full timing cases:

| First center column completion | Number of legal rank-8 histories |
|---|---:|
| move 6 | 36 |
| move 7 | 36 |
| move 8 | 36 |
| not yet full at move 8 | 216 |
| **total** | **324** |

Results:

```text
independent physical and q cofactor edges         384
exact one-ply phase XOR checks                    384
virtual residual upset identities             122,928
source upset lookup operations                 245,856
residual subset comparisons                  9,897,976
rank7 virtual 5ply / materialized cover tests        48
response-cover rows compared                    2,160
rank8 continuations checked                       324
distinct orientation-sensitive q at rank8         219
reflection-equivalent move7 pairs after 444444      3
terminal, cofactor, upset, cover discrepancies       0
```

The rank8 path count is **324 histories, 219 distinct q states**, demonstrating some historical duplication after the capacity transition. This q deduplication is exact ordinary future-behavior congruence; it is **not** proof all 324 positions share the same value.

Complete machine record: `MOVE7_MOVE8_COLUMN_CLOSURE_RESULTS_0_2.json` (the original v0_1 control remains preserved).

## 5. Algorithmically calculated move-8 defensive choices — exact, but horizon-bounded

The five-ply original-q operator determines for each P0 move 7 which P1 move-8 replies avoid handing P0 a forced terminal **within P0's next two own moves**.

At the explicit center-full `444444` parent, P0 chooses one of the six wings on move 7. The algebra generates the following exact **short-horizon** P1 defensive reply sets (columns are one-based):

| P0 move 7 | P1 move 8 choices preventing a P0 win within the next two P0 turns |
|---|---|
| 1 | 1, 2, 3, 5, 6, 7 |
| 2 | 1, 3, 5 |
| 3 | 2, 5 |
| 5 | 3, 6 |
| 6 | 3, 5, 7 |
| 7 | 1, 2, 3, 5, 6, 7 |

All **324** rank8 states from `44444` had their actual q-based next-two-P0-own-move masks checked against the original-q move7-to-move8 response cover; **zero** mismatches. Of these 324 histories, **56** leave P0 with at least one fixed-horizon forced winning first action, involving **66** P0 action occurrences.

These sets are meaningful *bounded* move-8 calculations done without forward game-tree policy search in the algebraic producer. **They are not exact unrestricted perfect-play move-8 choices.** Across all seven move-6 child states, the virtual five-ply source algebra found **zero** P0 first actions that force a win by P0's third subsequent move, consistent with the separately retained bounded P1 delay controls; this does not establish loss, draw or W/D/L equality across move-7 branches.

The symmetric P0 move-7 first actions `1↔7`, `2↔6`, `3↔5` transport their bounded response masks exactly under reflection. They have differing literal q and differing bounded response sets, which prevents replacing them all with a single strict state-equivalence class. Eventual W/D/L outcome equivalence remains unproved by this experiment.

## 6. Testing fixed-history transitions to game completion

Frozen plan: `ALL_DEPTH_OWNER_MASK_PATH_LIFT_PLAN_0_1.md`.
Exact machine evidence: `ALL_DEPTH_OWNER_MASK_RESULTS_0_1.json`.

Independent physical fixture generator supplied **90 complete legal standard7x6 games**, including deliberate column-completion timing fixtures, early first wins by either player, seeded random games, and terminal-avoiding validation-only random fixtures.

```text
complete first-win-stopped games                     90
terminal P0 wins                                    49
terminal P1 wins                                    33
complete rank-42 draws                               8
distinct ranks reached                             1..42 (all)
physical move checks incl. fixture generation    18,589
checked individual game-play transitions           2,639
normalized q-versus-physical comparisons           2,549
nonempty-prefix-anchor lift comparisons            3,901
virtual source-upset query comparisons             10,812
residual source subset comparisons                657,732
full-column completion events                        291
GF(2) phase toggle checks                         2,639
mismatches                                            0
```

A first larger run was correctly bounded at 20,000 physical validation calls after **97** games, with no semantic disagreement; this incomplete run is retained as `ALL_DEPTH_OWNER_MASK_BUDGET_PARTIAL_0_1.json`. Repeating a smaller fixed corpus **within the original caps** completed successfully; no resource limits were raised.

One preserved validation draw path from the actual column-full center `444444` proceeds through all 42 moves:

```text
444444727657361755133372267161256533265112
```

The source owner-mask formula recognized the terminal draw without any special final-rank transition operator. The actual physical rule model stopped at the same terminal event.

Independent negative controls:
`ALL_DEPTH_TRANSITION_NEGATIVE_RESULTS_0_1.json`.

They reject:
- dropping the opponent-blocker guard (legal prefix `12`, causing three extra false P0 residual generators);
- using even column phase alone as legality (after `444444`, column 4 is FULL with even phase, while empty wings also have even phase);
- inferring strict future-game equivalence from the same phase weight (distinct rank7 q after `4444441` and `4444442`).

## 7. Exact falsifier of full strategic-value completion

**The owner-mask cofactor mechanism is complete for supplied paths, but the bounded alternating-value algebra is not a complete nonbranching W/D/L solver.**

Frozen test: `SHORT_HORIZON_VS_FULL_WDL_GAP_PLAN_0_1.md`.
Evidence: `SHORT_HORIZON_VS_FULL_WDL_GAP_RESULTS_0_1.json`.

At the **empty 4x3 Connect-3** root:

| Computation | Result |
|---|---|
| Search-free original-q five-ply formula, P0 first/second/third own moves | No forced P0 win for any of columns 1–4 |
| Separately written physical first-win ≤3-own-move validator | Confirms no such forced win (183 physically replayed test moves) |
| Complete unrestricted exact recursive q W/D/L reference (used only after algebraic result) | P0 wins; all four opening columns W/D/L-optimal |

There is **no contradiction**. The short-horizon algorithm answers a strictly narrower question than full perfect-play W/D/L. This control proves we cannot treat a fixed-depth composition or merely reusing the correct transition law as completion of the strategic-value problem.

## 8. Research verdict and continuation boundary

**Established:**
- one exact residual/owner-mask state-transition mechanism valid across both turn-7/turn-8 full-column boundaries and every legal first-win-stopped fixed continuation, including rank42;
- no new local residual-transition primitive at column closure;
- an independently checked virtual upset/cofactor method that calculates **bounded** turn8 defensive sets and short-horizon value constraints without materializing successor q states;
- explicit move7/move8 phase/capacity guards, reflection transport and q deduplication.

**Not established:**
- exact unrestricted optimal move at turn 8 or proof all move7 moves are W/D/L-equivalent;
- compact composition of arbitrary-length alternating quantified *adaptive* action-cover families;
- polynomial complexity, global branch elimination, a new full-root 7x6 WDL proof, or representation minimality.

**Next exact structural target:** algebraically pull back the full **action-labelled maximal response-cover antichain** through an earlier legal move while preserving the order of `exists/forall` decisions and their terminal guards. The new owner-mask upset law supplies the direct source substitution for **arbitrary fixed move words**, so there is no need to rediscover path transition dynamics. The remaining proof issue is the **mixed adaptive response-cover width**, not another column-completion state rule. If widening factorization fails, record an exact minimal cover-family obstruction rather than adding deeper forward policy search.

All research code/checks here ran in isolated JavaScript V8 against committed source with minimal Node import shims, not the maintained Node26 environment. The sampled full-game controls are implementation validation; the all-depth fixed-history identity is supported separately by cofactor induction. No GitHub merge, solver implementation or IsoGraph game-theory authority promotion occurred.
