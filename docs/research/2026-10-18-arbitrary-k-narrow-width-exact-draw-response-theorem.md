# Exact arbitrary-K empty-board DRAW when width is below connect length

**Date:** 2026-10-18 Pacific. **Owner-directed parameter research:** nested board-width/height/K outcomes. **Status:** deductive generalization of \`docs/research/2026-09-14-thin-board-draw-theorem.md\`'s width<4 case to K arbitrary; explicit first/second-player response strategies; not a new general dimension-to-WDL classifier or a qualified IsoGraph promotion. Primary goal zero strategically alternative future-game valuations.

## Exact theorem

For ANY positive finite W,H and connection length K>=2:

    W<K    =>     perfect-play empty-board outcome = DRAW.

This holds without restriction on H, even when H>=K allows vertical geometric winning lines.

**K=2:** Width W<K means W=1. With only one legal column, owners alternate down that column, so no adjacent two cells share an owner. Thus no K-line appears and the game finishes drawn.

**K>=3:** Because W<K, NO horizontal or diagonal K-line exists: all possible winning lines are vertical intervals of K consecutive cells within one original column. Fix disjoint height-ordered response pairs in every column:

    (row0,row1), (row2,row3), (row4,row5), ...

leaving only the top unmatched row if H odd. Every length-K vertical winning line with K>=3 contains a COMPLETE fixed adjacent pair: among any three consecutive integer rows, one pair (2j,2j+1) lies wholly inside. Hence no owner can complete a line without owning both members of some fixed pair.

For EITHER designated defender D (P0 or P1), use the uniform policy against the other player A:

- D moves first if D=P0: take any currently legal cell. This is a D-owned marker or unmatched row, so it cannot create a pair wholly owned by A.
- On each A move: If A just took the LOWER cell row2j of a previously unoccupied pair, D immediately takes its UPPER mate row2j+1 in the SAME column. The upper mate is now gravity-playable by definition. If A instead played a pair's upper cell, its lower mate must already be D-owned under the maintained invariant; if A played an unmatched top, choose any legal D move.
- On D's discretionary reply, any D-owned pair member is harmless to the invariant. If the board fills on A's last move, no response is necessary.

Induction on successive A-D responses: A cannot own both members of any fixed pair. In particular A cannot complete any vertical K-line, even if A deliberately deviates from a hypothetical drawing script. This gives both P0 a strategy preventing P1's win and P1 a strategy preventing P0's win; each player can guarantee at least DRAW. Zero-sum perfect play therefore yields exact DRAW.

The proof is about on-line adaptive pair responses without exploring a strategic game tree or computing winner timing. It relies on genuine original gravity's immediate legal release of the upper mate, and on K>=3 for every geometric vertical line to contain one complete disjoint pair. If D instead starts lower before A enters a pair, the lower is already D-owned, so A's future upper never completes an A-owned pair.

## Original project relation / scope

The K4 case W<=3 is already contained in the prior total-domain thin-board K4 theorem. The new universal-K formulation is a distinct parameter extension, not an independent claim that "all W<=K" is draw: the borderline W=K may introduce horizontal and diagonal lines. Height H<K is a different family with horizontal-only K-lines and is not silently assumed here for K≠4. For K4 the accepted prior project theorem already treats H<4 too.

Current best exact parameter-law ledger:
- general K>=2, W<K => DRAW (this note);
- standard K4, min(W,H)<4 => DRAW (prior research);
- K>=4, all empty finite dimensions have some legal *COOPERATIVE* DRAW path, yet perfect-play may still be P0/P1 WIN (separate new theorem);
- general K>=3, static balanced no-win coloring always exists (separate no-go theorem).

## Frozen conformance protocol

Derive source pair-response policy as a pure original height-array invariant; separately generate original physical K-lines and adversarial A moves to test actual gravity legal mate at every step. Include both D=0 and D=1, W=1..K-1, H up to 12, K=3..7 and full-column boundary cases. Independent adversarial sampling is a physical falsifier only; mathematical proof is the induction above. No oracle WDL values are inputs, no solver branch modifications, no main/authority promotion.

**Engine applicability:** exact empty root DRAW cutoff on W<K and K>=2 at O(1) dimension cost, outside practical standard K4 board but valuable for generalized Connect-K solvers. Same conditional response policy can certify NO-A-WIN for guarded partial roots whose already-colored pairs remain D-owned/split and whose future pairs have valid release, after independent guard validation. No shortcut may be used if a row pair can be A-owned at input.
