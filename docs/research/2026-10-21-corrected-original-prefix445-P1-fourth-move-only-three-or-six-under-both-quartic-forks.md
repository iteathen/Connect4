# Stronger original 7x6 four-way quartic fork: after literal 445, P1 can avert P0 win-by7 only by column3 or6

Date 2026-10-21 Pacific. Research direction Josh Oshiro. Canonical iteathen/Connect4 research/semantic-quotient. **New original-source exact early deadline/defensive constraint theorem.** No historic28 winning-line IDs, solved game outcomes or root oracle used. This refines, without erasing, previous theorem that c3,c6,c7 are necessary to stop one SPECIFIC P0 c6 extension after 445: c7 does NOT stop P0's ALTERNATIVE c3 extension.

The true ORIGINAL legal firstwin-free one-based prefix is:
  ply1 P0 c4 bottom, ply2 P1 c4 row2, ply3 P0 c5 bottom.
P1 moves on ply4. P0 owns bottom c4,c5, and P1 already owns center c4 row2.

Source physical K4 hypergraph contains TWO overlapping double-ended forks available if P1 has not blocked their pivotal or final sites:
  A. P0 takes c3 bottom on ply5, giving original P0 bottom triple c3,c4,c5. Original horizontal K4s c2..c5 and c3..c6 yield independent immediately playable P0 completion sites c2 bottom and c6 bottom.
  B. P0 takes c6 bottom on ply5, giving original P0 bottom triple c4,c5,c6. Original horizontal K4s c3..c6 and c4..c7 yield distinct completion sites c3 bottom and c7 bottom.

Player1's single ply4 stone cannot permanently preempt BOTH potential forks merely by taking one of outer endpoints c2 orc7. In particular c7 preempts only B's outer endpoint, but P0 can switch to A (c3), with both c2 andc6 still empty. Symmetric c2 fails against B (c6). If P1 instead plays c1 bottom, c4 above, or c5 above, both A/B source connectors and respective endpoints remain physically possible, so P0 may choose either. P1 cannot FIRSTWIN by ply6 because it then has at most three stones.

The only P1 ply4 replies that prevent ALL P0 firstwins by original ply7, assuming P0 chooses its BEST move5, are **c3 or c6**. They claim one of the two P0 fork-connector cells in advance, and any remaining original three-stone P0 bottom run has at most ONE playable K4 target which P1 can block at ply6. They are necessary and sufficient to avert P0's forced WIN *BY MOVE7*, not sufficient to defend the entire original game.

Exact literal source table (one-based P1 column4 -> P0 columns5 guaranteeing win by7):
  P1 c1: P0 c3,c6;
  P1 c2: P0 c6;
  P1 c3: NONE;
  P1 c4: P0 c3,c6;
  P1 c5: P0 c3,c6;
  P1 c6: NONE;
  P1 c7: P0 c3.

Contrast original W6,H6 after SAME legal prefix445:
  c1 -> P0 c3 forces win by7;
  c2 -> none;
  c3 -> none;
  c4 -> P0 c3;
  c5 -> P0 c3;
  c6 -> none.
Therefore exact safe P1 first repair choices for preventing P0 WIN by7 are {c2,c3,c6} on W6 versus {c3,c6} on W7. The extra original seventh column REMOVES c2 from the viable immediate defensive-repair choices because c4..c7 supplies the second fork endpoint. Note a badly defended W6 can ALSO have a two-ended fork; this is NOT a claim width6 lacks forks universally, but a typed width6-versus-width7 original source *response-set shrink for this precise history*.

The result was independently validated by actual original physical K4 playing only from empty through this guard, separate source CURRENT-owner grade1/2 Boolean cofactor mate3 formula, and separately written literal all original legal P1 ply6/P0 ply7 winning-ray checker. This is a local original-game theorem, not a full root game solution.

Proof structure:
  1. On P1 fourth move in {1,2,4,5,7}, the table explicitly exhibits an available true P0 fifth-move fork with TWO different currently playable bottom K4 targets; a single P1 sixth-move stone can block at most one, and cannot itself firstwin with only three stones.
  2. On P1 fourth move in {3,6}, every original P0 fifth move was checked algebraically against the all-original69 literal K4 quartic degree-three cofactors, with no double-threat, and the independent three-ply physical verifier confirms no P0 forced firstwin by7. A double-threat cannot come from three P0 stones in an original diagonal/vertical line because P0 owns only row1 stones during this five-move prefix; hence the horizontal source enumeration is logically exhaustive.
  3. This is a stronger, necessary SECONDARY local defensive repair law and reduces the early P1 legal 7 current columns to TWO timely compatible replies in the selected q3; it does not show P0 can ultimately defeat both repairs after ply7.

The general source mate-in-three algebra used to generate the table is separately frozen in docs/research/2026-10-21-frozen-all-rank-original7x6-P0-mate3-Fourway-grade2-promotion-and-P1-shift-polynomial.md and is being qualified with original independent physical controls. Prior theorem c3/c6/c7 for preventing only P0-c6 extension remains valid but weaker; this note supersedes the broader interpretation of that result. No production solver/qualified IsoGraph1.2 mutation, no maintained Node26 CI or external proof assistant claim.
