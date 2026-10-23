# Frozen exact local source theorem: adjacent horizontal three-run threats reflect under a gravity-guarded blocking move

**Date:** 2026-10-23 Pacific. **Canonical:** research/semantic-quotient. **Research direction:** Josh Oshiro. **Pretest HEAD:** ab48b014264282abbca38579d5c0d827307678cb. **Epistemic status:** elementary Boolean/true physical gravity theorem FROZEN after the exploratory q13→q17 observation, before a separate original69 checker. Not a root WLD theorem or a generic unguarded static heuristic.

## Proposed universal source rule on ORIGINAL 7x6 H/V/R/F geometry

Take any original horizontal four-column K4 \(I=[s,s+3]\), starts s=1..4. Take physical row \(r\in\{2,3,4,5\}\), so both same-interval original H K4s at row r and r+1 exist. Let A be the player to move in a LIVE original7x6 state q (other player D next). Let the LEFTMOST column s have actual occupied height \(h_s=r-2\), so the next three gravity cells at that column, in chronological order, are \(a=(s,r-1)\) (currently playable), \(d=(s,r)\), \(u=(s,r+1)\). These are real distinct, currently empty physical cells.

Assume A already physically owns THREE right cells \((s+1,r),(s+2,r),(s+3,r)\) of the lower original H K4, while D physically owns THREE right cells \((s+1,r+1),(s+2,r+1),(s+3,r+1)\) of the adjacent upper original H K4. The full site occupancy of q must be physically legal (gravity, alternation, firstwinner-stopping); this theorem asserts a conditional algebraic operation only, not that all such q exist.

**Frozen local threat-transfer law**:
1. A plays \(a=(s,r-1)\), not itself completing an original K4 elsewhere. The lower original A K4 now has exactly ONE unowned cell \(d=(s,r)\), and d is the *next playable cell* of column s on D's turn.
2. If D does NOT firstwin immediately elsewhere and does NOT claim d, A can next play d to FIRSTWIN the lower original H K4 (unless D somehow blocks another site, impossible because its remaining three are irrevocably A-owned).
3. If D instead claims d (the mandatory blocking choice to prevent THAT H win) without D terminal firstwin, then the upper original D K4 has exactly ONE empty cell u=(s,r+1), which is now the next playable site in column s on A's turn. Thus \(t_{D,s}=1\): if A fails to FIRSTWIN first or occupy u now, D may claim u next and FIRSTWIN the upper H K4.
4. Hence with no competing immediate terminal winner from A or D, the forced local response ladder is A(s,r-1), D(s,r), A(s,r+1): a lower-row A immediate threat becomes an upper-row D immediate threat under D's blocking action, and A's counterblocking move is the physical site one more row up. The last A move blocks the D upper line but does NOT itself certify A winning.

Exact Boolean form with original site variables \(x_{A,c,r}\), \(x_{D,c,r+1}\):
\[
\Theta_{A\to D}(q;s,r)=
[h_s=r-2]\prod_{j=1}^3 x_{A,s+j,r}\,x_{D,s+j,r+1}
\,[\mathrm{LIVE,\ mover}=A].
\]
Under this guard, the historical source Shannon/K4 singleton cofactor conditions are \(t_{A,s}(T_{A,a}q)=1\) and \(t_{D,s}(T_{D,d}T_{A,a}q)=1\). This is exact local firstwin-THREAT transformation, not a perfect-play value. The correct short course is conditional on stopping immediately at any competing actual firstwinner and on legality of all prescribed moves.

**Original real source control:** actual legal firstwinner-free rank13 \`4214254422333\` has A=P0 H3 lower row3 c2,c3,c4 P0, D=P1 upper H3 row4 c2,c3,c4 P1 **AFTER** D c3r4 at rank14. The source q14 is \`42142544223333\`, with h_c1=1. Set (s,r)=(1,3). Then A=P0 c1r2 at ply15 forces D=P1 c1r3 at ply16 to block P0 immediate row3 firstwin; this creates P1 immediate row4 firstwin c1r4, so A=P0 c1r4 at ply17 blocks. Check true 69 original K4/rays/column height and absence of competing immediately winning site for the relevant player at each source turn.

**Negative/future guard:** At subsequent rank17 \`42142544223333111\`, parity becomes eligible (one P0 trap C=c5, B odd nontrap none), BUT P1 H4 row5 c1..4 remains matroid-independent and unshadowed by P0 row4, and upper P0 r6 responses arrive TOO LATE if P1 targets row5: an exact nonwinning-policy counterexample, NOT a strong WLD result. This shows \(\Theta\) alone is a local *threat reflection* and does not produce an unbounded forcing source invariant.

## Independent gates

- Independently build all 69 true physical H/V/R/F K4 and an original directional ray; verify source real ranks13..17 and the two exact adjacent horizontal lines, source mover/landings and singleton-next-frontier updates.
- Check simple algebra for every original 4 horizontal starts ×4 eligible row pairs: the same three-right owner factors + h_s=r-2 imply the two sequential playable completion cells after local A then D blocking. These 16 checks are original true board coordinate geometry, NOT complete legal game position construction.
- Preserve exact competing immediate win guards and record no game-WLD inference.
- Retain prior q17 P1 lower-row/ P0 upper-row losing POLICY falsifier, not overstate that the responder A wins or loses the actual unrestricted original source q17.
