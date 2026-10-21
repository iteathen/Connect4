# Source-only original7x6 two-repair forcing primitive from the legal opening 445: exactly two firstwin-free response configurations

Date 2026-10-21 Pacific. Canonical iteathen/Connect4 research/semantic-quotient. Research direction Josh Oshiro. **Deductively exact, original source K4-based, chronology-aware P1 defensive-obligation result**, conditional on the genuine firstwin-free literal three-ply source prefix445 (P0 bottom c4,c5; P1 c4 row2). NOT a proof that Player0 wins from EMPTY or even that this three-ply prefix is forced under perfect play. No historical28 line IDs or solved root WDL used.

## Three levels of source obligation

1. From original q3=445, P1's fourth move must be c3 orc6 to avoid an original P0 guaranteed K4 firstwin by ply7, by the *intersection of two fork blocker sets*:
  B_3 = {c2,c3,c6}: to preempt P0 third bottom stone c3 creating two winning endpoints c2/c6.
  B_6 = {c3,c6,c7}: to preempt P0 third bottom stone c6 creating two winning endpoints c3/c7.
  B_3 ∩ B_6 = {c3,c6}.
All other move4 columns let P0 select a still-available third bottom pivot and create two original independently playable winning endpoints at ply5; P1 can claim only one on ply6 and cannot firstwin with fewer than four stones. P0 firstwins on7.

2. Suppose P1 meets the first obligation with c3 on move4. P0 plays c6 bottom on ply5, producing P0 bottom triple c4,c5,c6. Source K4 c4..7 remains active at final target c7 bottom, whereas source K4 c3..6 was blocked by P1 in c3. Therefore P1 move6 MUST be c7 bottom, or P0 firstwins c7 on7.

3. Suppose instead P1 meets first obligation with c6 on move4. P0 plays c3 bottom on ply5, producing bottom triple c3,c4,c5. Source K4 c2..5 remains active at final target c2 bottom, whereas original K4 c3..6 was blocked by P1 in c6. Therefore P1 move6 MUST be c2 bottom, or P0 firstwins c2 on7.

Consequently, if P0 follows this EXPLICIT source policy on plies1,3,5 in the q3 guard and P1 avoids P0 firstwin by move7, the source original defender has EXACTLY TWO possible literal prefixes through move6:
  - 445367, Player1 must own BOTH bottom c3 andc7, and earlier center c4 row2;
  - 445632, Player1 must own BOTH bottom c6 andc2, and earlier center c4 row2.

No other original legal non-firstwinning-six-ply history can arise under this constrained P0 policy. This is a genuine two-iteration ONLINE requirement/repair cost: P1 must expend two distinct bottom-row stones in opposite wings by absolute ply6. Not just one initial wing repair.

## Important limiting test

Recompute ORIGINAL 7x6 all69 K4 owner grade1 andgrade2 source cofactor expressions at the two surviving rank6 states. New source nonrecursive P0 mate-in-three algebra (P0 moves7,P1 moves8,P0 potentially wins9) returns no P0 win-by9 current action at EITHER real state:
  after445367: source P0Mate3 set EMPTY;
  after445632: source P0Mate3 set EMPTY.

An independent TRUE ORIGINAL directional-ray at-most-three-ply physical verifier agrees: zero P0 guaranteed win-by9 actions at both. This is not a general DRAW/LOSE result, merely a falsifier of any claim that the first paired bottom-row obligation immediately forces a second two-target fork without higher-order timing/diagonal interaction.

## Relationship to 6x6

After same true source q3=445, the original6x6 P1 move4 avoidance set for P0 win-by7 is {c2,c3,c6}; on7x6 it contracts to {c3,c6} because the additional original K4 c4..7 upgrades the c6 bottom pivot to a two-ended fork. The new two-repair primitive is thus a concrete WIDTH7 source owner-interference event; it does NOT say W6 cannot have such forks under other nonoptimal histories.

## Research state

We have an EMPTY-reachable, small, source-derived original defensive forcing graph, with one admissible P0 conditional policy and only two possible nonlosing immediate P1 response words through rank6. It can seed the next **higher-grade four-way gravity-support phase overlap research**: determine whether either remaining state has a source-enforced, eventually irreparable collision between already-occupied bottom repair sites and rising/falling/vertical obligations. Need an actual forcing invariant across all future relevant defenses; do NOT recursively enlarge the whole game tree or substitute historical solved outcomes as theorem assumptions. Complete empty-root P0WIN remains OPEN.

Base proofs/controls:
  docs/research/2026-10-21-corrected-original-prefix445-P1-fourth-move-only-three-or-six-under-both-quartic-forks.md
  docs/research/2026-10-21-original7x6-all-rank-P0-mate3-graded-K4-algebra-and-sharp-two-choice-defender-cut.md

Independent Python original physical K4 checks of rank6 two prefixes and all seven P0 rank7 candidate moves confirmed none a forced mate-by9 action; no oracle inputs. Maintained Node26 CI/external proof assistant not run; qualified IsoGraph1.2 and production solvers untouched.
