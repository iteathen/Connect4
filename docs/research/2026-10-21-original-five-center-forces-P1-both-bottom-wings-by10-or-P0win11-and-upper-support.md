# After five center drops on original7x6, P0 can force two P1 wing repairs by move10 or FIRSTWIN11; both repairs advance higher-row gravity supports

Research date 2026-10-21 Pacific. Canonical iteathen/Connect4 research/semantic-quotient. Research direction Josh Oshiro. Status: NEW, conditional original-geometry, firstwin-correct ONLINE P0 forcing theorem plus EXACT four-way physical row1 BLOCK versus row3/5 SUPPORT transfer. Not a solver-independent root P0 WIN result. The five-center source word 44444 is a legitimate firstwin-free board position selected as a candidate, not independently proved inevitable under perfect play. The historical strong28 and published root game value are NOT theorem inputs.

## 1. True physical owner K4 geometry and a protected early deadline

Original standard W7,H6,K4: all69 true H,V,rising/falling original K4s, actual single owner per physical four-orientation crossing. After five original legal center drops word 44444, P0 owns center c4 at rows1,3,5 and P1 owns center at rows2,4. The current next owner is P1 on move6.

The original current-owner winning-line polynomial consists of 24 live P0 grade3 (three additional P0 stones needed),24 live P0 grade4 lines, and18 live P1 grade3,24 live P1 grade4 lines. For the three-missing P1 lines, EVERY source requires at least THREE extra gravity support cells not among its required owner cells. This gives exact k+d>=6 (after rank5) for P1 grade3 lines. In contrast P0 has FOUR current live grade3 H row1 windows requiring ZERO other gravity support cells. By ply10 only five further physical cells could have been filled; P1 cannot complete any grade3 K4 with k+d>=6 or any grade4 K4 with only three future P1 moves6,8,10. Thus P1 CANNOT FIRSTWIN before absolute ply12, independent of P0 actions. P0 may firstwin as early as11 after moves7,9,11, but it is NOT automatically guaranteed.

This is the turn-precedence guard for the forcing theorem below. True literal original FIRSTWIN-free witnesses show earliest existential owner completions at moves11 P0 and12 P1. The same earliest times occur after the analogous 6x6 center-five prefix, so owner-tempo advantage ALONE is not a winning-value theorem.

## 2. The source P0 adaptive policy forces BOTH wing repairs or firstwinning11

Define bottom left wing L={c1,c2,c3}, right R={c5,c6,c7}. Each wing together with P0 center c4 bottom is a genuine original horizontal K4. Use physical current wing occupancy, not a fictional independent orientation copy.

Case A. On ply6 P1 takes a BOTTOM site of one wing, either left or right. Then an opposite full three-site wing is untouched. P0 chooses that opposite wing and occupies its three physical bottom cells on plies7,9,11 unless P1 first occupies one of its bottom physical cells on move8 or10. Original gravity makes these P0 bottom drops legal. If P1 does not repair opposite wing in time, P0 firstwins on/before11 and P1 cannot preempt with own K4 on8/10 by the source support/time lemma. If P1 does repair the opposite wing, P1 has already taken bottom stones in BOTH wings by10.

Case B. On ply6 P1 instead fills the center column4 at row6. No wing has any P1 bottom blocker. P0 claims c5 bottom on move7. The original true K4 quartic second owner cofactor is now the three-edge path graph on physical bottom cells x2--x3--x6--x7, with residual P0 K4s x2*x3 + x3*x6 + x6*x7. P1 can avert the two-ended horizontal third-stone fork by move11 only if P1 on move8 plays c3 orc6. If P1 plays c3, P0 takes c6 on9 and P1 must take c7 on10; if P1 plays c6, P0 takes c3 on9 and P1 must take c2 on10. Otherwise P0 chooses an available third pivot and forms two DISTINCT playable original K4 final landing cells, one P1 stone on10 cannot block both, so P0 firstwins on11. Thus surviving non-firstwinning responses from this branch all give one P1 physical bottom blocker in each wing by10.

Combining A/B establishes an exact conditional ALL-P1-legal-response law:

  **From real firstwin-free q5=44444, there EXISTS a simple legal P0 source policy such that EVERY P1 replies6/8/10 lead to either P0 FIRSTWIN by11 or P1 owning at least ONE original bottom physical site in EACH wing by move10.**

No game solver or history-dependent optimal-move scores are used. The source P0 policy only checks the actual P1 prior landing and reacts by choosing the untouched original wing or one of the already derived two-ended cofactor pivots. This law forces two DEFENSIVE WORK UNITS, but is not proof these two repairs inevitably fail later.

## 3. Exact four-way role-conflict: defensive blocker becomes future gravity support

For c in either noncenter wing, let a_c be the number of true original row1 H K4 spans containing BOTH center c4 and that physical column c:
  a_1=1,a_2=2,a_3=3,a_5=3,a_6=2,a_7=1.

At q5 P0 has precisely four LIVE row1 H winning windows containing center P0 c4 row1, four corresponding LIVE H windows through P0 center row3 and four through P0 center row5. If P1 first claims bottom physical site x=(c,row1):
  - x is a REQUIRED owner-P0 site on exactly a_c original row1 K4 windows, so those windows are permanently BLOCKED, killing a_c source grade3 line contributions.
  - x is NOT a target of original H row3 or row5 K4, but is instead a presently EMPTY GRAVITY PREREQUISITE in exactly a_c original live H row3 K4s and a_c original live H row5 K4s through center. Therefore the same P1 physical drop lowers each such winning-line gravity support debt by exactly ONE without adding a P0 stone or killing those lines.
  - Additional P0 diagonals may be advanced, but these are not necessary for the specified minimum theorem.

Thus per required P1 bottom source repair there is an exact physical BLOCK-versus-ENABLE transfer with coefficient a_c=(1,2,3,3,2,1), supported by direct all69 original directional line reconstruction and unchanged P0 upper-row grade3 source viability.

With P1 compelled to take at least one bottom cell in EACH wing, the two EXTREME physical H four-column spans cols1..4 and cols4..7 each receive P1-provided lower support in upper row3 and row5: four DISTINCT original P0 live higher-row winning-line windows have their gravity support partially improved, while the lower-row K4 window containing the specific P1 stone is blocked.

This source role conflict is a precise candidate for the requested four-way interference transition, but a support debt decreasing by1 is NOT the same thing as an immediately winning P0 K4 or a guaranteed later collision. A proof of WIN still needs P0 to force remaining owner stones and deadlines under perfect P1 responses.

## 4. Independent original physical controls

The theorem was frozen in docs/research/2026-10-21-frozen-five-center-P0-forces-both-P1-bottom-wing-repairs-by10-or-win11-support-transfer.md before independent verification. The source-controlled pure Python tool rebuilds all69 original H/V/R/F win windows, independently cross-checks firstwinner events against direct directional rays, and tests the PREDEFINED P0 source policy for every eligible P1 short response.

  - Seven legal P1 first replies on ply6 checked; source CENTER branch tests 36 p8/p10 pairs; WING branch tests42 p8 reply choices and up to204 p10 responses.
  - 12 wing-branch P1 responses satisfy both wings already by ply8; 38 more do so at move10 (30 wing branch,8 center branch).
  - Across the remaining202 tested reply patterns P1 has NOT completed both bottom wing defenses on move10 and P0 has a genuine original FIRSTWIN on move11.
  - Zero exceptions to the two-wing-defense OR immediate P0 FIRSTWIN law, zero P1 firstwinner before move11.
  - The six original bottom wing c values have physical original H row1 source blocking and H row3/H row5 support gains exactly 1,2,3,3,2,1 each. These are algebraic per-K4 directional site incidence results, not empirical outcome estimates.

The early policies are conditional on q44444. A one-sided firstwinner or a cooperative drawn alternative does not establish full signed q WDL. The original 7x6 root P0 WIN is externally known but not independently established through this theorem.

## 5. Reproducibility and next source-only gate

Original true source script:
  research/isograph/discovery/2026-10-21-center-five-dualwing/verify-original7x6-center-five-two-wing-repairs-and-upper-H-support.py

Frozen + current evidence packet under the same directory:
  ORIGINAL7X6_CENTER5_TWO_FORCED_WING_BLOCKS_BY10_OR_P0WIN11_UPPER_K4_SUPPORT_DONATION_0_1.json

Next goal: measure whether the P0 source upper-row K4s improved by P1 obligatory bottom repairs produce a NEW unavoidable owner-completion/latent winning-site incompatibility after the repairs, and whether the two special center-branch P1 responses differ in eventual source deadlining. This requires simultaneous H/V/R/F support-debt and live original owner-grade2/3 cofactor evolution with correct firstwinner precedence. No historical28 firstwinner list, solved root WDL, full minimax, production solver or qualified IsoGraph promotion. CI and external proof assistant not run.
