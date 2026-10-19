# Exact unmatched-column parity spill debt: why naive two-sided horizontal mirror proofs break

**Date:** 2026-10-19 Pacific. **Research owner:** research/semantic-quotient, owner-directed nested width/height/K parity program. **Status:** deductive obstruction to SPECIFIED column-pair online response schema, not impossibility of a different legal strategy and not an exact WDL theorem. Current qualified IsoGraph gameplay 1.2 unchanged. Historical pairing scope/audit: docs/research/2026-10-19-k4-thin-height-dual-pair-proof-obligation-audit.md.

## Definitions

Partition width W columns into disjoint 2-column mirror blocks P, plus one or more unpaired tempo/spare columns U. An **unaugmented mirror responder** insists that after every adversary move inside any paired block, the responder plays the same row of its mate, preserving block column heights equal, and otherwise replies inside U. This schema has no certified pending-half-pair/cross-release debt resource; intruding into P after an unmatched move is explicitly NOT an allowed silent operation.

Define S as the number of originally empty physical cells in U, and o as the number of responder-owned initially claimed U cells (including first move if defender is P0). If all other moves prior to the critical episode occur in paired blocks as complete mirror response pairs, a sequence of attacker/responder U moves consumes 2 cells per full response; the residual unmatched capacity before an attacker action is

    R_U = S - o - 2j.

If R_U is odd and positive, the attacker may take the LAST remaining U cell on its turn, leaving the responder with zero available reply inside U. Unless the board is terminal at that point, the unaugmented mirror scheme cannot continue with its own resource contract.

## Lemma A: odd-width, odd-height P1 defender

For W=2m+1 and H odd, pair the first 2m columns and leave one height-H unpaired column u. The P1 responder has not claimed any initial U stone (o=0), so residual capacity is R_U=H-2j, which is always odd. A P0 opponent can choose to play solely in u on each of its next turns (while P1 follows its prescribed U-only responses); at the last positive residual capacity R_U=1, P0 plays the topmost U cell and P1 has NO U reply. All 2m paired columns remain unchanged and available, so this is not necessarily a full-board terminal. Example original K4 W5 H3:
    ply1 P0 col5 row0,
    ply2 P1 col5 row1,
    ply3 P0 col5 row2 (spare column full),
    ply4 P1 cannot reply inside spare, paired columns all still empty.
This is a mathematical FAILURE of an unsupported full-board even-column pairing policy, not a proof of a P0 or P1 win.

## Lemma B: even-width P0 defender with two boundary spare columns

For W=2m even, suppose P0 wishes to keep all mirrored *interior* pairs pristine before P1 turns and thus chooses its own first move in a spare boundary column. One geometrically useful partition, when W>=4, is pairs (1,2),(3,4),...,(W-3,W-2) (zero-based) with the two ends {0,W-1} unmatched. There are S=2H unmatched cells initially. P0 first claims one (o=1), leaving R_U=2H-1 odd. P1 may similarly exhaust the final spare U cell on its turn, leaving P0 requiring a response outside U while the mirrored interior is not necessarily full. For W4 H2, P0 starts c0, leaving 3 spare cells. P1 plays c3; P0 replies c0 top (or c3 bottom depending prior play), then P1 fills the remaining spare and P0 has no unpaired-cell response. Without typed spill absorption, mirror completeness has not been proved.

Even simpler, if P0 opens inside one of the original full paired blocks, its own first move makes the two column heights UNEQUAL immediately before the next opponent turn, directly invalidating the historical equal-preheight premise.

## Exact consequence for dimension-to-WDL

The geometric statement "every length-K horizontal run includes a complete adjacent column pair" is sound for K>=3 with standard adjacent-pair placements (with boundary guards). It is NOT the same proposition as "either player can always maintain a split pair under gravity". The parity debt exactly explains why odd W/odd H and first-mover opening cases need nonlocal reserve management.

Potential next theorem: define a finite **pending half-pair contract** with owned blocking cell, gravity-release direction, one mandatory mate liability, and a parity-reserve counter; show every spill can be legally absorbed while preserving prevention of every opponent K-win. The previous 2026-10-17 odd cross-pair theorem was refuted for crossPairPrefixLength>1, so any new policy MUST obey actual co-release and next-gravity-mate guards rather than infer capacity from parity alone.

Do not modify historically frozen failed documents. Source arithmetic above may be consumed as a precise negative invariant/reason for INCOMPLETE, not a WDL node cutoff. No solver changes or authority promotion authorized.
