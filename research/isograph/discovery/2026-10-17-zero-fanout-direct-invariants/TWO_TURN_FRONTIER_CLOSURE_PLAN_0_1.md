# Frozen direct no-fanout extension: simultaneous one-move frontier/two-threat closure

**Date:** 2026-10-17 Pacific. **Owner:** research/semantic-quotient. **HEAD at freeze:** `3376e6ad7fb8c5b83f973269ffb6100d37ce5b28`. **Status:** algebraic hypothesis, no completed evidence.

## Objective
Extend the prior exact restricted-domain Z(q)=(unrestricted WDL, ALL tied-optimal first moves) without ever constructing child q or evaluating alternative strategic futures. This is NOT a faster minimax search. Scanning every original playable literal action and source residual is finite source-local algebra, not constructing a strategic game tree.

## Exact source rule for each currently legal c
Let mover p at rank n, landing x=(c,h_c), opponent o=1-p, and L the legal column labels. Source R_p/R_o are normalized minimal future winning requirements.

- If R_p contains singleton {x}, current action c TERMINATES with mover win.
- Otherwise compute **opponent's next playable frontier after c** directly on source heights: for d≠c, y_d=(d,h_d); for d=c, y_c=(c,h_c+1) iff h_c+1<H. Opponent has an immediate winning reply iff some R_o contains singleton {y_d}. P playing x can only delete opponent requirements containing x, never shrink them, so this characterization is necessary and sufficient. If true, action c is a forced loss before mover can play again.
- Otherwise compute mover's own source **post-c singleton threats**. Such a threat at playable y_d arises iff (a) R_p already contains singleton {y_d}, or (b) R_p contains exact two-cell requirement {x,y_d}. These are the only possibilities because owner-true contraction deletes exactly x, and no other requirement changes size. If there are TWO OR MORE DISTINCT resulting playable columns d with these singleton threats, opponent can block at most one in its single move, cannot win immediately by the already failed guard, and mover wins on its next turn. Thus action c has exact full-game winning value.
- If both original source requirement families become empty after c *without an immediate win* (necessarily R_p empty already and x intersects EVERY R_o), every remaining game is a draw. This is an exact outcome for action c with no future calculation.
- Any still-unclassified first action c remains UNKNOWN; no recursive fallback is allowed.

**Complete-root value criterion:** Run all these source-only formulas on the original q in one deterministic label scan, without materializing c-specific game states. If EVERY legal action receives an exact WDL, output exact V(q) via one finite max/min scan and **all** tied-optimal labels. Otherwise return INCOMPLETE and preserve any per-action exact certificates, but never claim the full optimal set.

This extends the two-distinct-opponent singleton law and can prove whole-board unconditional WDL win/loss/draw subsets at earlier ranks without game future search. No guessed value for unclassified continuations.

## Predeclared validation and negatives
- Exhaust ALL 3,734 distinct legal nonterminal 4x3-c3 q and 34,094 4x4-c4 q; classify source before reading any reference values. Compare full action vectors, WDL and best move SET against qualified independent exact recursive q, with all ties. Count new certified q beyond prior direct operator, by rank, mover, two-turn terminal type, and source residual work. Require ZERO candidate child q objects/recursive minimax/BDD/QBF/history enumeration.
- Explicit opponent singleton above the played column is legal only after that lower cell has been filled; singleton on a DIFFERENT upper cell is not immediately playable. Original source R_o requirements containing played x are BLOCKED, not owner-contracted; never invent a new enemy singleton from {x,y}. Simultaneous opponent next win overrides the mover's created double threat (earliest first-win semantics).
- Distinct immediate threats must be in different legal columns. A source two-cell requirement creating a new singleton is valid only if it contains the just-played owner x. No count inflation from multiple residual lines targeting the SAME playable cell. An owner immediate win overrides every later tactical outcome.
- Test real `223`, `111`, historic `44444` and all exact tied-label cases. No standard 7x6 unrestricted game value assumed.
- Existing 60k nodes/300k Boolean operations/10k supports/15s per-source limits are guards, NOT mathematical success metrics. A correct scoped result is not the total zero-branch algorithm.

**Potential next theorem:** Identify source-only conditions that force a *unique compulsory opponent response* through multiple turns without constructing a family of opponent continuations. The present exact two-threat closure would be the finite initial case of such a proof, not a direct solution of every Connect Four position.
