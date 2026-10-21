# FROZEN source 7x6 ONLINE wing-repair forcing lemma from empty, no solved game or stationary policy assumption

2026-10-21 PDT. Canonical iteathen/Connect4 research/semantic-quotient. Research direction Josh Oshiro. This is a SOURCE-first logically quantified early-game result, not a root WIN proof. Do NOT consult historic28 line labels or solved root WDL.

Theorem candidate on actual original7x6 K4 from EMPTY:
- P0 plays center column4 on absolute ply1, owns (4,1).
- P1's first original ply2 move is arbitrary: physical legal column1..7; if the P1 physical stone is on the LEFT wing bottom {1,2,3}, choose RIGHT wing bottom {5,6,7}; if it is on the RIGHT wing bottom {5,6,7}, choose LEFT wing bottom {1,2,3}; if center c4 row2, choose either wing (fix RIGHT).
- Thus all3 currently empty bottom wing sites are free after P1 move2.
- P0's following source policy: occupy one still-empty actual bottom site of the selected wing on own moves3,5,7, in ascending column order (or stop when P1 has successfully claimed one of these bottom sites). Physical gravity makes each first-entry bottom placement immediately playable.
- If P1 makes no P1-owned bottom placement in THAT selected wing on either of her moves4 or6, then P0 necessarily owns center (4,1) plus all3 wing bottom sites after her third wing placement on ply7, an original horizontal K4. There can be no earlier P1 WIN because P1 has claimed at most3 actual physical cells by ply6 and K=4, and P0's firstwin at ply7 is legal.
- Therefore every P1 response that AVOIDS a P0 move7 win against this source policy must spend at least one genuine lateral FIRST-ENTRY bottom blocker in the selected wing by P1 ply6, no matter what other adaptive legal response choices P1 makes. This is an unconditional online REPAIR OBLIGATION for P1 under one P0 source policy, not restricted to a stationary pair model. P1 can satisfy the repair; hence not a P0 root win proof.

On original6x6, center columns3,4 are both in every four-column K4 span. After P0 c4 bottom, a single P1 initial c3 bottom already intersects every row1 horizontal K4 and the c4..c7 wing does not exist; no forced opposite-wing repair by a similar argument. This is source width7 tactical manifestation of the static row-blocker lower bound2 versus width6=1.

FROZEN independent controls:
1. Regenerate all69 original7x6 unwrapped K4 windows and all54 original6x6; enumerate all seven possible literal P1 first replies after c4. For each generate wing deterministically. Exhaustively enumerate P1 legal moves4 and6 unless a bottom wing repair has occurred; verify P0 always has a legal bottom wing move3,5,7 and if no P1 bottom wing repair then P0 original firstwins no later than7. No Connect4 solver/Oracle; this enumerates at most early legal P1 choices only to verify a fixed already formulated source policy, not to derive root value.
2. Record nonvacuity: some P1 choices DO repair by taking one previously unoccupied wing bottom site, and no early forced P0 win is claimed in those branches. Verify P1 cannot firstwin by move6.
3. Check mirrored explicit original width6 policy failure words one-based 4355667 (P1 p6 plays upper mate at c6 instead of compulsory wing bottom c7) and 4511223 (P1 p6 upper mate at c2 instead of necessary wing c3) physical original firstwinner ray/K4.
4. Prove row K4 static hitting lower bound P1 needs two bottom row sites on original width7 if P0 owns center c4, compared to one on width6, and the six literal minimum W7 pairs.
5. Distinguish this unconditional first repair from the open theorem that P0 can force an irreparable OVERLAP of multiple later repairs and original vertical/diagonal owner K4 obligations. The new wing lemma advances early source CHRONOLOGY but is a weaker claim than the required whole-game P0 WIN.

No qualified logic authority/prod solver modifications; preserve falsifiers. Run separate source checker of early move-response quantifiers.
