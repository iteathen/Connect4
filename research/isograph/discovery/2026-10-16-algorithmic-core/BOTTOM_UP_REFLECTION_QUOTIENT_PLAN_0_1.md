# Exact horizontal-reflection support orbit as an instrumental algebraic reduction (0.1)

**Date**: 2026-10-16. Canonical owner `research/semantic-quotient`.
**Starting HEAD**: `a5a57c049bf3494abb7243ad58df224a45f83a7c`.
**Authority**: qualified 7x6 q_o orientation-sensitive and q_r reflection transporter; finite 4x3/4x4 geometry analogous and independently tested; no authority promotion.

The nonreflected live/support-DAG WDL Boolean compiler correctly kept **all literal action-specific WIN and NONLOSS roots**, reclaimed last-use child support formulas, and marked/swept all intermediate gates after every support. However, the empty 4x3 Connect-3 compilation **still failed** after 198 of 256 support vectors with 60,000 simultaneously allocated nodes and 58,330 peak post-sweep live nodes (source/evidence `BOTTOM_UP_LIVE_GC_ROOT_NEGATIVE_0_1.json`). Changing resource bounds is prohibited.

## New exact equivalence

For a symmetric root support `h=reverse(h)`, the complete upward support rectangle is invariant under horizontal reflection `J`. Instead of compiling `W(h),N(h)` for both `h` and `J(h)`, compile one canonical representative `minlex(h,J(h))`.

For canonical parent support h and literal parent action column c:
- actual child support `h+e_c` is canonical or reflects to canonical support `j`;
- when child was reflected, map each **canonical child residual shape** r back into actual-child coordinates `J(r)` **before** performing its exact owner-true/false cofactor preimage at parent h;
- use the already compiled child `W,N` *scalar support thresholds* after this shape substitution, but retain the literal parent c label in its action-specific root.

This preserves exact literal action values and mirror transporter while halving many support-subfunction dependencies. It does **not** identify all moves as WDL-equivalent; it does not change ordinary first-win or legality guards, and it does not reduce an adaptive response family to a scalar union.

Child liveness reference counts must be built from **all canonical predecessor action edges**, including distinct c mapping to the same reflected child. Never free until all those edges are consumed. Continue to compact hash-consed live formulas after every canonical support.

## Frozen qualification

Use the SAME previous hard limits: **60,000 simultaneously held nodes**, **300,000 substitution misses**, 15 seconds compile, <=10,000 supports. Primary target empty 4x3 Connect-3, known WDL root P0 WIN with four WDL-optimal openings, but its reference value is consulted **only after** symbolic formula compilation. No policy/oracle/game-tree data in the producer.

Compare at least:
- empty 4x3 root, all literal per-action WDL and optimal-move set;
- selected symmetric 4x3 support [1,1,1,1] and 4x4 [2,2,2,2], within same limits;
- complete legal first-win-stopped small-board q evaluation if compiled formulas can be reused on these supports; otherwise 128 predetermined legal rank-scoped controls from independent physical fixture generator (seed 0x7a16bdbd) after candidate compilation.
- mirrored action-root transport in at least one deliberately asymmetric child-support case.
- negative control: intentionally suppress J on a noncanonical child; validator should detect incorrect action values on an actual legal board if possible, otherwise supply abstract supported antichain mismatch.

Record support-orbit count, compiled canonical supports, absorbed child edges, live/allocated gate cost, substitutions, q states evaluated during construction (must zero), actual value mismatches, and first budget error.

## Decision

If empty 4x3 now closes, this is **symbolic support-orbit WDL compilation** rather than forward game-state search; it still encodes AND/OR fanout, may have substantial support-DAG work, and is not global branch-free complexity proof.

If it fails at same cap, checkpoint exact first failure and remaining live-width obstruction, not an impossible-branching theorem. Do not broaden to 7x6 root or increase budgets to make an artifact pass.
