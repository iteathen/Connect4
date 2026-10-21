# Exact all-rank four-ply P0 forcing Boolean theorem from original 7x6 owner-grade1/grade2 K4 cofactors

Date 2026-10-21 Pacific. Canonical repository iteathen/Connect4, branch research/semantic-quotient. This is a COMPLETE source-only P0-WIN-WITHIN-FOUR-PLIES theorem from ANY genuine firstwin-free P1-to-move original7x6 board q. It is NOT arbitrary-q complete WDL or an independent P0-WIN from EMPTY theorem. Historical strong28 terminal K4 IDs and pre-solved game values never enter the theorem or its producer. Frozen before controls in docs/research/2026-10-21-frozen-complete-any-P1-turn-P0-mate4-original-grade12-cofactor-logic.md.

## Exact physical source definitions

Construct exactly 69 true original H,V,rising/falling K4 windows on 42 actual physical cells; all four directional appearances of a site share one ternary owner. U_p(e)=1 if e is currently EMPTY and some original owner-p K4 has its other THREE sites owned p. V_p(e,f)=1 if both DISTINCT actual sites e,f are EMPTY and some original owner-p K4 has its other TWO sites owned p. The true legal column frontier F(h) consists of physical sites at current column heights, excluding full columns.

From a genuine P1-to-move q, for each legal P1 landing x:

- If U1(x)=1, P1 FIRSTWINS immediately, so P0 does NOT force a firstwin within the next four plies.
- Otherwise U0_after_x(e)=U0(e); V0_after_x(e,f)=V0(e,f), for REMAINING EMPTY sites, while U1_after_x(e)=U1(e) OR V1(x,e), and exactly one physical column height increases.

Then for each legal P0 landing z under the updated heights:

- If U0_after_x(z)=1, P0 FIRSTWINS on its first physical turn.
- Otherwise U0_after_x,z(e)=U0_after_x(e) OR V0_after_x(z,e), U1_after_x,z(e)=U1_after_x(e), again only for remaining empty sites. Increase the one physical column height at z.

These are mathematically exact current-board cofactor transport identities: own physical one-cell acquisition promotes precisely original two-missing K4 sources into one-missing sources at their other empty site, and opposing physical acquisition does not create any own-stone winning-line cofactor except by gravity exposure. The source producer need not construct future owner boards or retrieve game values.

## Eliminate the last opponent-and-owner turns by the original singleton ladder

At the resulting P1-to-move owner cofactor field (U0',U1') and physical heights, set s_c=1 if P0 has a genuine one-missing K4 at the current playable cell in column c; l_c=1 if P0 has a genuine one-missing K4 one cell ABOVE that playable cell; e_c=1 if P1 has a direct firstwinning K4 at the playable cell.

The exact one-round P0 defensive-incompatibility Boolean I is:
  I(h,U0',U1') =
    (EVERY legal e_c is FALSE)
    AND
    ( |{c:s_c}|>=2
      OR (|{c:s_c}|=1 and l_c=1 for the unique c)
      OR (|{c:s_c}|=0 and l_c=1 for EVERY legal c) ).

This is the proven all-rank shift-and-truncate original owner K4 source theorem, with P1 FIRSTWIN precedence. It tests whether any P1 next response leaves P0 an immediately playable original K4 on its own next turn, without stepping through future owner-valued game nodes.

Now the COMPLETE source WIN-within-four result for actual P1-to-move q is precisely

  P0_WIN4(q)
   = AND_(x in F(h))
       [ NOT U1(x)
         AND OR_(z in F(h_after_x))
          ( U0_after_x(z)
            OR I(h_after_xz,U0_after_xz,U1_after_xz)
          )
       ].

The outer P1 turn x is universally quantified, P0 answer z existentially quantified, and the last two plies have been analytically ELIMINATED into a constant-size original source Boolean response-capacity condition. This is NOT an unbounded no-branching perfect-root theorem: iterating the same pattern through the entire 42-ply game without further invariant compression would simply restate minimax.

The formula is NECESSARY AND SUFFICIENT for this bounded firstwin assertion at every genuine P1-to-move original7x6 firstwinfree q. The finite four-ply proof is a literal case analysis of P1/P0/P1/P0 moves with correct immediate firstwinner, support shifts and column gravity; no learned/ad hoc calibration constants and no historical solved labels appear.

## Frozen-face 322 true original physical controls: all earlier14 missing cases resolved

Independent q18 source sampling seeded20261021 generated160 unique legal firstwinfree 7x6 saturated center-five positions with heights [2,2,2,6,2,2,2], plus one separately preserved legal source control, for161 genuine colored q18. P0 next took either column3 or column5 on move19. All322 resulting P1-to-move q19 boards were checked using a separately implemented ORIGINAL four-directional physical ray firstwinner evaluator over only the fixed P1/P0/P1/P0 response window.

The current-only owner-cofactor Boolean says98 P0 force FIRSTWIN by23 and224 not guaranteed. The independently physical bounded evaluator agrees 322/322, ZERO mismatches. Prior source two-stage danger-intersection certificate identified84 of those98 winners and missed14. Every one of those14 has NO immediately playable owner0 or owner1 firstwinning site at q19. The complete four-ply source equation recovers all14 using grade2 to grade1 P0 source promotion and/or P1 donation of physical gravity support.

For these14 q19 samples there are exactly84 legal first P1 reply actions in aggregate (six nonfull columns each). Using the FIRST certified P0 answer in ascending current column order as the witness tie-breaker:
  - 9 of84: P1 move20 fills support below an existing LATENT original P0 grade1 K4, so P0 FIRSTWINS on21.
  - 56 of84: P0 move21 promotes a grade2 K4 owner cofactor into at least TWO distinct CURRENTLY PLAYABLE original P0 grade1 K4 sites; P1 cannot block both on22 and P0 firstwins23.
  - 19 of84: P0 move21 creates exactly ONE playable owner-P0 grade1 source with a distinct original latent one-missing K4 directly above; P1 forced block22 releases it and P0 firstwins23.
These witness categories are counted for the first selected proving P0 answer, not an exclusive partition of all possible equivalent winning P0 strategies. Sum 9+56+19=84. One explicit missing-class genuine q18 word is 444443251621356477 followed by P0 c3 on19: both current immediate owner0/owner1 winning-site sets are EMPTY and all P1 initial replies still lose by23 under the source cofactor formula.

## Independent all-rank original physical controls

A second random source campaign seeded 0x16210 generated 2000 physically real alternating gravity firstwinner-stopped ORIGINAL games, with20871 firstwinfree P1-to-move state VISITS across many ranks (not claimed unique board positions). On exactly1275 of those current q, source says P0 forces FIRSTWIN within next four plies, and the independent literal true directional-ray bounded evaluator agrees on EVERY state: ZERO disagreements.

Combined independently compared local state visits: **21193**, source P0WIN4 YES **1373**, source versus physical firstwin-race mismatches **ZERO**. A separate targeted original full-DRAW word 444443333337777774111111222222555555666666 was replayed through rank39 and41; both P1-to-move nonterminal prefixes were independently checked and the source formula correctly gave NO forced P0 winner, respecting the full-board deadline and firstwin stopping.

These samples falsify implementation mistakes but are not the universal proof's basis; exact K4 cofactor ownership transport, support ladder and finite legal-turn quantifier elimination prove the theorem.

## Limits / canonical source

The root7x6 game result is independently known externally, but its ORIGINAL EMPTY perfect-play WIN has NOT been rederived by this four-way method. In particular a TRUE source theorem must still prove that P0 can FORCE entry into some incompatible defense configuration despite every optimal adaptive P1 strategy, and without assuming historical five-center /28 terminal results as axioms. The four-ply formula solves only a bounded tactical frontier and still uses a small current-action Boolean AND/OR.

Frozen pre-registration: docs/research/2026-10-21-frozen-complete-any-P1-turn-P0-mate4-original-grade12-cofactor-logic.md.
Reproducible source and separated true ray checker: research/isograph/discovery/2026-10-21-q18-highrow-P4-crossing/verify-original7x6-P1-current-mate4-full-grade12-cofactor-and-physical-rays.py.
Machine outcome packet stored in same directory. The local equivalent Python verifier WAS executed with the above numbers. Exact committed GitHub source bytes have NOT been independently executed under maintained Node26 CI. External formal proof assistant NOT run. No production solvers, qualified IsoGraph1.2 or mainline files modified.
