# Audit: 27 optimal witness games versus 28 distinct terminal winning lines

Date: 2026-10-20. Owner: research/semantic-quotient. Scope: true original 7x6 K4, P0 first, strict gravity, alternating play, FIRST-WIN stopping. Historical 28 line tags are DATA VALIDATION, not source-only algorithm inputs. Strong optimal move scores remain the historical issue41 premise, not newly rerun here.

## Exact answer to whether the set is 27 rather than 28

There is no independently established alternative 27-element optimal first-terminal WINNING-LINE set in the inspected historical claim. The number 27 counts distinct FULL 41-ply game-history words used as witnesses. The history fixture contains 28 per-winning-LINE records but only 27 distinct words because line IDs 41 and 56 are assigned the SAME 41-ply move sequence.

If one arbitrarily deduplicates by history and retains the FIRST witness line ID, the resulting 27-label list omits line 56. If retaining the LAST, it omits line 41. Neither is genuinely eliminated by the game or by perfect-play semantics. Correctly taking the union of EVERY original K4 line completed on the last move of all 27 game words produces exactly 28 distinct line IDs, all matching the 28 historical witness labels.

## The exact repeated optimal-history word and four simultaneous physical K4 lines

Identical zero-based literal 41-move word attached to BOTH line 41 and 56:

    33333321544441211565616661222020440000655

P0 last move is zero-based physical cell (column5,row4), i.e. one-based column6,row5. Independent original 69-window reconstruction verified 41 gravity-legal alternating placements, no P0/P1 firstwin in moves1-40, and FOUR simultaneous P0 K4 lines on move41:

- L35: diagonal c3r2,c4r3,c5r4,c6r5 (one-based).
- L41: horizontal c3r5,c4r5,c5r5,c6r5.
- L53: diagonal c4r3,c5r4,c6r5,c7r6.
- L56: horizontal c4r5,c5r5,c6r5,c7r5.

The horizontal L41 and L56 are physically different quartets, overlapping at one-based columns4,5,6 in row5. The last move at c6r5 completes both. L35 and L53 also complete on the SAME move. The other two line identities (35,53) have additional distinct historical witness histories, explaining why the per-line archive only needs duplicate history tags for 41/56.

Final board after move41 (X=P0, O=P1, dot=unoccupied; one-based axes):

     c1 c2 c3 c4 c5 c6 c7
r6    O  O  X  O  O  .  X
r5    X  O  X  X  X  X  X
r4    O  X  O  O  X  O  O
r3    X  O  X  X  O  O  X
r2    O  O  X  O  X  O  X
r1    O  O  X  X  O  X  X

## Independent original physical audit of all 27 distinct histories

- Source: issue41 historical 28 per-line witness records, 27 distinct literal 41-move game words. These are a selected witness population, NOT a complete enumeration of ALL optimal terminal games.
- Independently regenerated all 69 real noncyclic K4 windows and replayed every unique path with original gravity/alternation/firstwin.
- Each historical game firstwins for P0 exactly on move41, zero earlier winner.
- Simultaneous physical winning-line counts: 19 histories complete 1 line, 5 complete 2 lines, 2 complete 3 lines, 1 completes 4 lines. Thus 39 (not 27 or 28) per-history line completion OCCURRENCES, while the union has exactly 28 DISTINCT ORIGINAL K4 winning-line identities.
- All 28 original line IDs in the union match the archive's 28 line-coordinate keys; no missing or additional physical line.
- There are 27 distinct actual end-board colorings WITHIN THIS SELECTED WITNESS SAMPLE. Do not generalize this to total count of all strong-optimal terminal positions.

## Independent conditional geometric upper bound

Regenerated 69 true K4 windows, with the historical STRONG-score predicates treated only as externally established assumptions: the first five moves are the center column alternately, and P0 firstwins at move41. At move40, only 2 cells remain empty, so P0 last move may only land in one of the top two rows. There are 38 geometric K4 windows containing a top-two-row site; 30 avoid the historically P1-owned center cells (zero-based c3r1,c3r3); 28 also admit a physically available terminal top-row landing other than the previously P0-owned center site zero-based c3r4. The remaining 28 K4 line coordinate keys match the recorded historical 28 exactly (including BOTH 41 and 56).

Important separation: This is a CONDITIONAL structural upper bound. No fresh source-only proof from the empty board that selects five center plays or turn41 firstwin is implied. The prior historical strong solver archive scores at each of 28 witness entries' 41 plies and independently checked endgames (issue41). Current analysis reverified physical firstwin, not strong scores.

Research conclusion: retain both typed counts. The correct previously qualified claim is 28 distinct geometric P0 first-winning-line IDs across strong distance-sensitive optimal historical paths; 27 counts the distinct archive witness move histories. Deducing a missing 'surviving line' from the 27 path count is an object-type counting mistake. The 28-target should remain held back as validation for any nonsearch WDL theorem. No gameplay authority or solver changes.

Historical source: https://github.com/iteathen/Connect4/issues/41
Historical fixture: research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json
