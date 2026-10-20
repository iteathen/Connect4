# Frozen universal dimension-dependent fixed-pair phase-cover deficiency on K4 column intervals

Date 2026-10-20. Canonical research owner research/semantic-quotient. Source scope: regular K4 W,H>=5, original nonwrapped 4-direction K4 lines, true gravity and two-owner turn considerations separately qualified. This new combinatorial theorem concerns a CLASS OF STATIONARY COLUMN-START PHASE PAIRING defenses, NOT all adaptive Connect4 strategies or exact WDL.

Existing frozen phase language states that in a columnwise alternating complete owner coloring, epsilon_c is 0/1 depending on who owns bottom cell. A four-column window is conflict-free for BOTH players iff its four phase bits are not all constant and not strictly alternating. The allowed edge-gradient has no 000 or111 length3 run. For W>=4,H>=5 there are exactly 4*F_W static valid phase strings; odd H needs additional number-of-P0-first-column balance.

Now let M be ANY graph matching (disjoint pairs of distinct WIDTH columns), with the guarantee each matched pair will have OPPOSITE binary starter phase, as if defender can always claim the other column in the pair when first player claims one. Ignore unmatched columns. Guarantee that EVERY four-column K4 span avoids BOTH uniform and alternating phase patterns for ALL phase orientations consistent with M. The frozen theorem to prove/test is:

  A length4 consecutive-column span S is guaranteed valid under opposite phase on each pair of M iff S CONTAINS AT LEAST ONE MATCHED PAIR of SAME column-index parity, i.e. the only possible separation within four cells is EXACTLY TWO.

Proof sufficiency: bits at columns distance2 would be equal in BOTH a uniform and a strictly alternating length4 word; an opposite-phase promise on this pair forbids either. Proof necessity: without any distance2 matched pair inside S, orient all matching pairs consistently with an ALTERNATING word 0101 (or 1010) on S. Any other internal matching pair connects opposite column parity, so an alternating word already makes its bits opposite; external matching endpoints can simply take complementary bit. Thus at least one matching-consistent full phase word violates S. This makes the source pair covering condition EXACT for this fixed-opposite-phase matching certificate family.

Let E_i=(i,i+2) for i=0..W-3. Edge E_i of the DISTANCE-TWO column graph lies in up to two consecutive four-cell intervals. Choose a matching M subset of E_i and count uncovered FOUR-COLUMN start positions s=0..W-4 which contain NO edge of M. Freeze the proposed dimension-wide MINIMUM uncovered obligation formula:

  U_K4(W) = max(0, ceil((W-6)/4)) for EVERY integer W>=4.

7-column obstruction proof target: four original 4-column spans start s=0,1,2,3. The first requires edge(0,2) or(1,3). If edge(0,2), second cannot use(2,4) and must use(1,3); then third cannot use(2,4) or(3,5), contradiction. If edge(1,3), the third must use(2,4) since(3,5) collides with(1,3); then fourth cannot use(3,5) or(4,6), contradiction. Hence any disjoint matching leaves >=1 uncovered span in EVERY seven-consecutive-column block.

General lower bound: take physical seven-column blocks starting at positions0,4,8,... provided start+6<W. Their associated four-window sets have disjoint START indices, so each independent seven-block obstruction demands at least one distinct uncovered four-span. This gives ceil((W-6)/4) when W>=7.

Constructive upper bound: for every j>=0 select valid edges (4j+1,4j+3) and(4j+2,4j+4) whenever endpoints<W. All selected edges are vertex-disjoint. They cover window start positions 4j,4j+1,4j+2 if those spans exist, leaving ONLY positions 4j+3. The number uncovered up to last start W-4 exactly ceil((W-6)/4) when W>=7, zero W<=6. Therefore U_K4(W) exact. W6 pairs one-based (2,4) and(3,5) cover all three spans, with one disjoint filler pair (1,6); W7 four spans cannot be fully covered.

Frozen falsifiers: independently enumerate all disjoint subsets of distance2 edges for W4..20, compute exact min uncovered four-spans and compare to U_K4(W). For W5 and W6, also enumerate ALL phases consistent with explicit complementary matching, proving none of their original valid stationary colorings has K4. For W7 construct a matching with exactly one uncovered span, then explicitly orient endpoint phases to realize forbidden alternating four-bit run inside that span, and check a real original K4 horizontal/diagonal WIN on the static complete owner coloring (not necessarily a legal firstwinning chronological game).

Qualify the boundary: U_K4(W)=0 through W6 and first becomes1 exactly W7. THIS DOES NOT YET prove P1 loses the actual 7x6 original game: a defender can use nonstationary pairings, dynamic role switches, diagonal counterthreats, or other strategies. W7H5 is DRAW under published perfect play although U=1; W8H6 is P1 WIN despite U=1. Conversely W6H6 P1 WIN while U=0 (a fixed safe pairing prevents P0 winning but does not force P1 to win). These are intentional decisive WDL falsifiers, not mistakes to repair by fitting parameters.

Potential broader source invariant: define a causal BARRIER of defense-cover pair edges and their support/release deadlines, not just abstract M. A real zugzwang proof needs to show all possible defender online response systems—including those not representable by fixed complement matchings—eventually violate a source-forced owner-correct mandatory K4 obligation or expose early terminal win, and needs an independent condition to distinguish H5 vs H6 and W8 secondary defensive modes.

No next-turn source move replay proof constitutes total signed WDL; no production solver or qualified IsoGraph1.2 authority modification, no teacher-set28 as input.
