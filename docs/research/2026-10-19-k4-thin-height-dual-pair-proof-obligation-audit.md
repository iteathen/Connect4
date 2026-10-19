# Historical K4 thin-height draw assertion: defective proposed two-sided pairing proof and corrected source use

**Date:** 2026-10-19 Pacific. **Canonical owner:** research/semantic-quotient. **Status:** exact negative audit of one HISTORICAL proof mechanism, not a counterexample to actual K4 small-height DRAW WDL. Source claims remain research-only until correct guarded strategies are independently established. Authoritative IsoGraph1.2 unchanged.

Historical target: docs/research/2026-09-14-thin-board-draw-theorem.md, "Case 2: H<4." The source asserts for ANY width, on a board with no vertical/diagonal K4 windows, pair columns (0,1),(2,3),... and "maintain equal filled heights immediately before an opponent move" and then "same strategy is available to either player." The claimed universal empty-board conclusion might be true, but the supplied response proof does NOT establish it for either designated defender over the claimed domain.

## Two explicit opening-prefix violations

**Case A: P0 defender, even W.** Take empty (W=4,H=2,K=4). Fixed pairs (0,1),(2,3) initially have equal heights. P0 is obliged to MAKE A FIRST MOVE without an opponent move to mirror. Suppose it opens column0. Now before P1's first move, heights in pair (0,1) are (1,0), NOT EQUAL. If P1 chooses column1 bottom row0, the historical prescribed immediate SAME-ROW reply in mate column0 is impossible: original column0 row0 is ALREADY occupied. The old proof has neither a justified P0 opener restoring both pair height invariants nor a valid fallback for this ordinary opponent choice. The existence of a different P0 drawing strategy is NOT disproved.

**Case B: unmatched column, odd W.** Take (W=5,H=3,K=4). Pair (0,1),(2,3) and leave column4 unmatched. If the adversary drops into original c4 on a legal turn, there is NO fixed same-row mate column and the historical response map is undefined. The proof gives no spare-column policy, pending horizontal-pair resource, or legal release guard. This affects BOTH players' claimed universal no-win policies. A formal pairing strategy must be total on each legal opponent action until first-win stop.

The assertion "every horizontal K4 line contains one paired adjacent column block" IS a correct GEOMETRIC lemma. The inference "therefore either player can always realize that pairing under gravity" DOES NOT follow without initial and spare-turn handling.

## Research consequence / classifier correction

Do NOT globally consume
    K=4 AND H<4 => exact DRAW
as a newly qualified source result relying SOLELY on the historical two-sided equal-height paragraph.

Safe replacements already independently established:
- W<K (for K4 W<=3): exact DRAW, true two-player vertical pair defensive proof.
- H=1, K>=3: exact DRAW, explicit both-player no-win source strategies with 216 independent all-attacker fixtures.
- H<K, K<=W<=2K-1 and WH even: exact DRAW from TWO source policy certificates, independent P0 top-support mirror and P1 horizontal paired response, 65 plus 73 physical fixtures.
- H<K, WH odd: P0 can guarantee at least DRAW via odd-width, odd-height spare-column/mirror policy (58 physical fixtures); exact DRAW still requires P1 no-win proof.
- H<K, WH even in OTHER widths: P1 can guarantee DRAW, V<=0, but no exact sign absent other theorem.

K4 H2/H3 width families that were published as DRAW may remain empirically solved. This audit DOES NOT assert P0 or P1 win in any of them or refute independent completed solves. It changes only which source implication is currently certified mathematically without game-tree search.

Preserve old note as HISTORICAL evidence with this explicit linked qualification correction; do not silently rewrite legacy research or mint a new official claim ID absent a successor IsoGraph authority transaction.

## Next mathematical gate

Repair the P1 and P0 horizontal-column response contracts under (a) P0 opening imbalance, (b) optional unmatched-column free moves and (c) gravity-equal-height restoration, without searching for future game values. One possible approach is typed pending-half-pair / reserve-debt proof (2026-09-13 response-channel antichain calculus; 2026-10-17 odd-pair repair), not an unguarded "same strategy for both" assumption.

Cost/engine disposition: the prior alleged exact thin-height cutoff must NOT be used in a new solver from this proof alone. Retain proven narrow and composite families; return source bound or INCOMPLETE on the other cases. No production solver changes.


## Physical replay checkpoint (after proof-gap freeze)

A separately frozen actual original-gravity first-win-stopped checker independently replayed these specific 1-based column prefixes and regenerated all valid physical K4 winlines:
- \`4x2 K4 12\`: after P0 col1 and P1 col2, prescribed P0 same-row mate in col1 row1 is **NOT playable**, because P0 already occupies that physical cell; pairs had unequal heights immediately after P0 opening.
- \`5x3 K4 555\`: P1 to move with all four paired columns untouched and unmatched c5 FULL.
- \`4x2 K4 1414\`: P0 to move with both boundary reserve columns FULL and internal paired columns untouched.

All are legal, nonterminal original prefix boards; all four checked structural obstruction assertions passed. No scalar root WDL was calculated or inferred. Immutable producer \`research/isograph/discovery/2026-10-18-board-dimension-outcomes/independent-legacy-thin-pair-spill-physical-prefix-controls.mjs\` (blob \`f46648df9ac09f0a8cb7f0e03f004217bb5a5044\`); durable machine packet \`research/isograph/discovery/2026-10-18-board-dimension-outcomes/HISTORICAL_K4_THIN_PAIR_PARITY_SPILL_3_ORIGINAL_PHYSICAL_GAP_CONTROLS_0_1.json\`.

Disposition unchanged: insufficient *old* proof contract, **not** a game-outcome theorem refutation.
