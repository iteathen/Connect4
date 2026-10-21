# All-rank original Connect4 source two-stage danger intersection: exact forced P0 win within four plies at P1-to-move q

Date 2026-10-21 PDT. Canonical iteathen/Connect4 research/semantic-quotient. Research direction: source-derived 7x6 perfect-play WIN proof, no previously solved original game data as premises. STATUS: **NEW source-only sound SUFFICIENT forced-firstwinner certificate at any actual firstwin-free P1-to-move 7x6 position**, plus conditional same-height q19 sample. It is not necessary, not a universal WDL classifier, and does not prove a P0 root win.

Frozen prior to source controls: docs/research/2026-10-21-frozen-original-q19-rise-singleton-vs-P4-higher-H-disjoint-defender-danger-intersection.md and docs/research/2026-10-21-frozen-q18-saturated-row3-P4-owner-conditioned-P1-vertical-countertempo-scan.md.

## 1. First-order certificate from original four-way K4 owner cofactors

Let q be a genuine legal original W7H6K4 firstwin-free position, with P1 to move and true physical gravity. Original 69 H/V/rising/falling 4-cell lines have ONE owner state at every physical four-direction junction. Let U_p(q,e) be true iff e is EMPTY and an original K4 line through e has all its other THREE sites owned by p. Define the PLAYABLE firstwinning-site sets:
  S_p(q)={e in physical legal landings F(q):U_p(q,e)}.

Assume P1 has NO current direct FIRSTWIN landing (S_1(q)=empty), and P0 has EXACTLY one current firstwinning landing S_0(q)={y}. Without checking any future game values, derive the following truth:

- If P1's actual current action is a legal x other than y, x cannot destroy P0's original three-owned line missing y, and y stays physically playable in its own column. P0 therefore FIRSTWINS by taking y on the next turn. Thus any P1 defense avoiding this immediate loss MUST physically claim exactly y.
- P1 claiming y is a legal nonterminal original action by the no-own-firstwin premise. Call the owner/height-updated real source q_y, computed by the exact local K4 projector/column shift; NOT a WDL lookup. If S_0(q_y) is nonempty, P0 FIRSTWINS on its next turn anyway: a block released some other current P0 target.
- Otherwise if there exists a legal current P0 landing z from q_y such that either:
    (a) P0 immediately FIRSTWINS by taking z, OR
    (b) after P0 claims z, P1 has NO immediate FIRSTWIN landing and P0 has at least TWO DISTINCT simultaneously playable firstwinning target sites S_0(q_y+P0 z) (not multiple K4 labels sharing one site),
  then Player0 has a forced FIRSTWIN within its next two turns. In case (b), on its turn P1 can occupy at most one such physical winning cell and cannot FIRSTWIN itself by assumption, leaving at least one P0 winning landing for the next P0 turn.

This is an exact source two-layer defending-capacity/Hall-like contradiction. The only logical operations are:
  S1(q)=empty;
  S0(q)={y};
  S0(q_y) !=empty OR
  EXISTS legal z in F(q_y) with [U0(q_y,z) OR (S1(q_y+z)=empty AND |S0(q_y+z)|>=2)].

Every term can be recomputed from the original true owner grade1/grade2 K4 cofactors and physical gravity current-state updates. No value of any future game position, strong winning-line28 ID, pre-solved root WIN label or earlier game solver query is required. The source resulting WIN guarantee holds against ALL legal P1 moves (including those strategically inferior); no tree of all P1 future mistakes is needed.

This test is sufficient but not necessary: P0 may force a firstwinning result through other motifs even if S0(q) has size0, by second-order diagonal support promotion, or if P0 fork consists of a released rather than two simultaneously playable targets. The certificate is a 4-ply bounded source causal algebra, not a universal complete WDL or an empty-root forcing theorem.

## 2. Exact original 7x6 one-position proof with DISJOINT dangers

True one-based firstwin-free source q18:
  444443152537166724
and P0 c5row3 on ply19. P1 to move20.

From ALL69 original original K4 physical windows:
- P0 has UNIQUE currently playable grade1 original RISING diagonal singleton y=(c5,row4), source line:
  (2,1),(3,2),(4,3),(5,4).
  P0 already owns first three, and P0's c5row3 on19 filled the final support below y. P1 has NO current direct firstwinner on20.
- The ORIGINAL P0 H row3 grade2 cofactor is
  x2*x3 + x3*x6 + x6*x7,
the P4 path with literal original physical vertices (2,3,6,7) in row3.
- To stop P0 winning the RISING diagonal on21, P1 MUST occupy physical c5row4 on20. This is a single physical reply D_R={c5row4}.
- After that block, P0 chooses z=(c3,row3) on21. Its original H row3 grade2 cofactor promotes to TWO distinct currently gravity-playable original P0 grade1 K4 completion sites c2row3 and c6row3. Both are EMPTY, and the P1 current source owner U1 contains NO immediately winning landing on22. P1 can block only ONE; P0 FIRSTWINS the other on23. A second true P0 pivot c6row3 would similarly give completion sites c3row3 and c7row3.

The preemptive H fork pivot-defense reply set on P1's move20 is D_H={c3row3,c6row3}; it is disjoint from the unique forced original rising diagonal block D_R={c5row4}. Therefore no one legal P1 stone on20 can satisfy BOTH defensive obligations, and the source temporal trap is PROVED without looking up a game solution or requiring search over poor P1 play. If P1 takes any other c on20, P0 R diagonal FIRSTWINS on21; if P1 c5row4, P0 H double fork wins23.

This is a physically signed four-way **H/R danger intersection EMPTY** certificate with exact gravity and firstwinning priority, not merely Fourier numerical cancellation. The same source P0 H P4 q19 in a different same-height state 444446526337114725 has NO P0 immediate R singleton and P1 can create a c7 vertical response-necessity on20/22; its P0 FIRSTWIN-by23 guard fails. This demonstrates why owner-specific different-orientation cofactors matter.

## 3. Frozen sampled source sufficiency check and incompleteness

An independent local Python source owner-cofactor checker on 161 actual legal firstwin-free colored q18 capacity-face states (random seed20261021 plus one preserved true source word) examined P0 third-row c3 orc5 on move19: 322 actual q19 states, all with the expected original H row3 P4 residual graph. A separately coded original physical bounded P1/P0/P1/P0 firstwinner verifier found98 q19 where P0 FORCES a firstwin no later than23.

Using ONLY source U0/U1 at current q19, the compulsory P1 blocking move, the P0 current candidate pivot, the next actual owner cofactor two-site fork and P1 own firstwinner guard, the two-stage certificate was TRUE on84 of the98 genuine win-by23 states. **ZERO false positive certifications** among322. The remaining14 actual positive states have other mechanisms; no claim the sufficient condition detects them. One of84 is the explicit disjoint R/H q19 proof above.

A separate true original 69-window plus directional-ray JS implementation independently confirmed the EXACT short-horizon outcomes in8 q19 situations from4 literal q18 controls; source sample frequencies are not complete perfect-play q18 outcomes and cannot be interpreted as chances of optimal play.

## 4. Related mathematical framework: danger intersections, with nontransferable hypotheses

Independent contemporary mathematics studies structure, not brute enumeration of all bad moves, by identifying families of urgent defense obligations ("dangers") and their intersections. For example Galliot, Gravier, Sivignon, "Maker-Breaker is solved in polynomial time on hypergraphs of rank 3", arXiv:2209.12819v4 (revised July2026), https://arxiv.org/html/2209.12819v4, proves a danger-intersection characterization for FREE-CHOICE Maker–Breaker rank3 hypergraphs. This is related in PROOF STYLE to our explicit source answer-set incompatibility, but the theorem absolutely cannot be imported as a Connect4 outcome theorem: Connect4 has original K4 rank4, gravity-restricted legal vertices, symmetric firstwinner opportunities for both players, and draws. Thus only the general structural danger-collection methodology is adopted, NOT its completeness or polynomial-time result.

## 5. Remaining OPEN root-only obstacle

To get an independent P0 WIN from EMPTY on original7x6, source first-order algebra must establish that correct P0 play can FORCE progress from initial symmetry and defensive-repair stages into some irreparable danger intersection despite ALL legal perfectly responding P1 repairs, while preventing P1 from firstwinning earlier. The original hist28/27 conditional endgame is a held-back check. Nothing in one q19 certificate or the 84/98 bounded hit rate proves global inevitability.

Repro source+machine evidence in research/isograph/discovery/2026-10-21-q18-highrow-P4-crossing/. Maintained Node26 CI / external formal proof assistant not run, qualified IsoGraph1.2 and production solver unchanged.
