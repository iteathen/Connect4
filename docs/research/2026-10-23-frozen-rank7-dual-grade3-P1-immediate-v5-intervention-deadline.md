# Frozen dual-source grade3 race: P1 c5,c5 makes an immediate win threat while P0 tries to form a c3 trap

**Date:** 2026-10-23 Pacific. **Canonical branch:** research/semantic-quotient. **Pretest HEAD:** 784cc64fe2769544215b97061ad26a7262bac6e3. **Research direction:** Josh Oshiro. **Epistemic scope:** sourced rank-local deadline candidate derived AFTER exploratory inspection of the seven INCOMPLETE online proof frames; frozen before independent original69 source-field recheck. No whole game WLD result, no solved oracle, no <5 Connect4 board.

Start from actual center-first rank7 q7 \`4214254\` with P1 D to move, P0 A. Previously proved P0 source WSL has grade2:1 unique \`{c3r3,c4r4}\`, grade3:14 and grade4:33. P1 source WSL has one grade2 \`{c3r3,c2r4}\`, five grade3, and35 grade4. One of P1's grade3 masks is the true original physical **vertical** K4 c5r1..c5r4 missing \`{c5r2,c5r3,c5r4}\` (P1 owns c5r1 at q7).

Fix the bounded source P0 response policy to first b1≠4: P0 c4r4 at rank9. Freeze expected **exact rank10 immediate opponent threat detector**, after arbitrary P1 first b1 and second b2 but before P0 second move:

\[
\boxed{
\mathrm{P1ImmediatelyPlayableWIN}(q_{10})
=[b_1=5][b_2=5],
\qquad \mathrm{winningCell}=(c5,r4).
}
\]

The reason is graded source cofactor: P1 owns exactly two NEW stones D1/D2 by rank10, so a fresh P1 singleton must derive from initial source grade≤3. The one grade2 requires physical c3r3/c2r4 and at least five new gravity prefix cells; impossible in two D placements with P0 only supporting c4r4. The other four grade3 source masks cannot supply a playable singleton with just two P1 claims under original current source heights. The c5 vertical grade3 is unique: D moves c5r2 then c5r3, leaving c5r4 immediately playable and completing the original P1 vertical H4 c5r1..4 on its next opportunity.

The fixed P0 two-turn trap policy would, when b1=b2=5, choose P0 second a2=c3r1 to self-support P0 ready trap c3r3. But that leaves P1 c5r4 immediately winning at rank12 BEFORE P0 can exploit its trap c3r3. Hence this source path should NOT be claimed P0-WIN even though P0 has formed a true terminal trap.

**Competing mandatory P0 action claims at rank10:** P0 has NO immediate firstwin itself from q10 (its sole source grade2 y=c3r3 cannot be reached physically after two P1 c5-only support placements). Thus to avoid P1 FIRSTWIN at rank12, the ONLY current P0 legal move is c5r4 (claim the opponent's immediate frontier), not c3r1. These are distinct same-turn physical resource obligations:
- P0 desired trap-support = c3r1;
- P0 required opponent FIRSTWIN interception = c5r4.

They cannot both be fulfilled by one P0 move, so the fixed trap-by-rank11 proof frame fails at this one P1 double-c5 support class. This does NOT prove P0 loses from q10: P0 may take c5r4, blocking the P1 vertical, and later form some other winning mechanism; nor does it prove P0 could not select an alternative rank9 response to the first P1 c5.

**Frozen exact tests:**
1. Independently enumerate all 69 original K4 and physically replay q7 with P1 b1!=4, P0 first c4r4, P1 arbitrary b2; compute exact next-playable P1 winning singleton WSL masks and physical direct ray K4 for the potential c5r4.
2. Require the exact iff \`b1=b2=5\`, all other41 D pair labels having no P1 immediate winning move at source q10.
3. For b1=b2=5, P0 c3r1 forms P0 ready trap but P1 c5r4 FIRSTWINS physically on its subsequent turn; P0 c5r4 prevents that immediate P1 firstwin but does NOT produce the c3 ready trap, using source degree2/3 gravity envelope bounds.
4. Derive a universal source **urgent-defense overriding attack-formation condition**: if P1 has a nonshadowed currently playable singleton firstwin T and P0 has none, a legal P0 reply that does not occupy T loses on the immediately following P1 turn; this does not infer what happens if P0 blocks T.
5. Keep the 34 already-certified rank11 P0WIN cases separate from the seven source INCOMPLETE matroid/shadow results. A losing specific P0 policy path does not classify original rank7 game WLD or full optimality. No recursive search/child WLD, no unqualified authority promotion.

Potential next law: a min-plus D future-ownership deficit and max-plus A firstwin precedence together need an extra **immediate-deadline resource-interception** priority guard; local A can only fill one of trap-formation and opponent immediate-win denial. Find an algebraic operator carrying BOTH graded player fields at once, not a player0-only trap count.
