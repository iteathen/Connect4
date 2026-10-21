# All-rank original 7×6 source three-ply P0 forcing certificate from four-way grade2 promotion and opponent grade1 shift

Date 2026-10-21 Pacific. Research direction Josh Oshiro. Canonical iteathen/Connect4 research/semantic-quotient. **New exact, nonrecursive P0 WINS-WITHIN-ITS-NEXT-TWO-TURNS source K4 certificate at ANY physically legal original 7x6 P0-to-move q**, with W6 H6 independent original controls. Not an empty-root WIN proof, not arbitrary-q complete WDL. No solved root game values or historically selected 28 terminal line IDs are formula inputs. Frozen before test: docs/research/2026-10-21-frozen-all-rank-original7x6-P0-mate3-Fourway-grade2-promotion-and-P1-shift-polynomial.md.

## 1. One current board's four-way grade1 and grade2 owner cofactors suffice

From all69 true original K4 H/V/rising/falling unwrapped physical windows, one owner flag per real four-way physical cell, define:
  U_p(e)=1 iff EMPTY site e is the unique missing cell of a true original K4 with all three other cells player p owned;
  V_0(x,e)=1 iff DISTINCT currently empty sites x,e are precisely the two missing cells of a true original K4 with its other two cells P0 owned.

Let F(q) be actual gravity playable physical landing sites and P0 the current mover. For a candidate present P0 action x:
- If U0(x)=1, P0 completes K4 NOW. FIRSTWIN stops; x is a true source winning move.
- Otherwise, under literal original owner acquisition of x, for EVERY remaining currently empty site e, the next owner grade1 cofactor is
  **U0^x(e)=U0(e) OR V0(x,e)**.
  Player1's one-missing cofactor U1^x(e)=U1(e) for every remaining e; her previously possible win at x, if any, is BLOCKED by P0 owning x. Update only one physical gravity column height h^x.

These are purely current-q ORIGINAL K4 cofactor identities: no future board valuations, game solver, or historical terminal subset.

## 2. Eliminate Player1's next response as exact finite Boolean source polynomial

At the source-formally updated gravity frontier F^x define the P0 active target bits
  s_d^x=U0^x((d,h_d^x)),
and directly-next-above original P0 latent bits
  l_d^x=U0^x((d,h_d^x+1)), or0 if column top.
Define P1 direct firstwinner bits
  e_d^x=U1^x((d,h_d^x)).
Every expression uses the original CURRENT pre-x owner K4 cofactor coefficients U0,U1,V0 and physical heights only.

Under an actual P1 drop in column a:
- If e_a^x=1, P1 FIRSTWINS on the second ply and P0 has not forced a win.
- Otherwise P0 can FIRSTWIN on the third ply iff at least one original P0 s_d^x remains with d!=a or an original P0 latent l_a^x shifts into the newly playable front cell above a.

The all-rank P1 defensive compatibility theorem proves the exact fixed Boolean source expression:
  b_x = U0(x) OR [
     PRODUCT_{a in legal F^x}(1-e_a^x)
     *
     PRODUCT_{a in legal F^x}
       (1-(1-l_a^x) PRODUCT_{d in legal F^x, d!=a}(1-s_d^x))
  ].

Therefore
  **P0_FORCES_FIRSTWIN_WITHIN_NEXT_TWO_OWN_TURNS(q) = OR_{x in F(q)} b_x.**

This is one bounded source Boolean current-action disjunction (at most seven literal physical P0 columns) and one algebraically eliminated P1 defense conjunction, never recursing into future game values. The output can optionally be the *set* of present P0 actions x for which b_x=1, retaining all equivalent mate-within-three winning actions without strategically branching into full continuations. It does not classify a position when this short WIN guard is false; P0 may still WIN later, DRAW or LOSE.

This expression naturally handles turn precedence, upper-frontier gravity release, multiple original source line IDs sharing one physical site and opponent P1 immediate-firstwin preemption. It also handles positions near a full board where no later P0 move can exist: the relevant one-step support bit is0 and the safe-P1 formula does not falsely promise a nonexistent additional move.

## 3. A sharper EMPTY-derived 7x6 defensive cut at ply4 than previously known

At true legal original prefix445 (P0 bottom c4,c5; P1 c4 row2), original P1 must choose its ply4 response. Source P0 winning physical endpoint options derive from ORIGINAL quartic K4 third cofactors:
- P0 next c3 bottom makes triple c3,c4,c5; the two winning landing endpoints are c2 andc6.
- P0 next c6 bottom makes triple c4,c5,c6; the two winning landing endpoints are c3 andc7 (on W7 only).
P1 can only claim ONE bottom cell by move4. Claiming c7 does NOT stop the c3 triple, and claiming c2 does NOT stop the c6 triple. To prevent a P0 forced firstwin by move7, the only defensive move4 physical sites are **c3 orc6**, preempting a triple's pivotal third stone.

Exact true source table of P1 move4 -> P0 move5 choices guaranteeing P0 WIN by7:
  Original W7: c1->[c3,c6], c2->[c6], c3->[], c4->[c3,c6], c5->[c3,c6], c6->[], c7->[c3].
  Original W6: c1->[c3], c2->[], c3->[], c4->[c3], c5->[c3], c6->[].

So original W7 safe P1 move4 choices to survive beyond7 are {c3,c6} while original W6 choices are {c2,c3,c6}. This is a **strict defense-choice loss of ONE option caused by the extra seventh-column K4 window**. It refines the prior conditional necessary c3/c6/c7 set, which considered only P0 next c6 and missed P0's alternative c3 double-ended fork. It does not imply c3 orc6 can preserve a full-game draw under optimally controlling P0.

A strong negative control: W6 can ALSO develop double-ended forks if P1 makes other bad choices; for legal W6 q4 word4451, P0 can force WIN by move7 with P0 c3, making endpoints c2/c6, even though W6 original perfect-play value at EMPTY favors P1. Thus this early source result is about one precise live geometric opening interface, not a universal statement that W6 has no forks.

## 4. Independent actual original game controls

Before comparison the source fixed Boolean grade1/2 expressions and P1 singleton shift were frozen. Independently written Python original physical source and literal directional-ray checker, with 54/69 ORIGINAL H/V/rising/falling windows, original gravity, alternating owners and FIRSTWIN stop:

- W7: 540 deterministic seeded REAL firstwin-stopped legal games, 4,365 actual firstwin-free P0-to-move current positions, 29,846 candidate legal P0 actions, 1,191 positions with certified firstwin within P0's next two turns, 2,511 actual winning candidate actions, including 1,240 currently immediate P0 FIRSTWIN actions. 28,606 independent original U0 grade2→grade1 and P1 U1 remaining-site cofactor promotion checks. ZERO mismatches versus an independently coded literal physical at-most-three-ply firstwinner race evaluator.
- W6: 310 seeded original games, 2,325 actual P0 positions, 13,605 candidate physical P0 actions, 575 mate-within-three positions, 1,130 winning present P0 actions and 601 immediate-firstwinning moves, 13,004 independent source cofactor promotion checks. ZERO independent physical WDL-short-horizon discrepancies.
- TOTAL: **6,690 actual positions,43,451 present legal P0 actions,41,610 exact independently recomputed K4 grade2-promotion controls, ZERO short-horizon firstwinner mismatches.** Earlier slower separate independent Python source implementation already checked673 positions and 4,366 literal P0 actions with identical conclusions.

Grounded source guards: empty7x6 returns NO firstwin within 3 plies, same for empty6x6. Source q4 prefix4451 on W7 returns current P0 mate-three actions [c3,c6]; same q4 on W6 returns only[c3]. The entire original prefix445 seven-response table above was checked with a separate at-most-three-ply literal true physical ray verifier, not imported from solved-game knowledge.

One independent physical control initially failed due a testing error that incorrectly expected U1(x) to persist at the cell x just taken by P0. U1 is conserved ONLY ON REMAINING EMPTY cells; U1(x) itself is extinguished as a possible final winning landing. This was corrected and all controls rerun. Preserve this distinction in future full-proof inductions; do not silently apply the cofactor identity at already occupied sites.

## 5. Why this is progress and what is still OPEN

Combining actual all-rank P0 owner grade2→grade1 promotion and P1 one-column nilpotent gravity-support shift produces a precise two-turn SOURCE forcing predicate from any q. The shrinking P1 ply4 response set on the actual7x6 empty-derived prefix is a concrete strategic resource bottleneck already revealed by these current-state K4 polynomials, not by the solved root value. This is a broadly available exact pruning/certificate opportunity for any solver, but no solver modification has been authorized.

A direct, uncompressed iteration of such 3-ply source polynomials through all42 moves would simply encode the alternating minimax strategy quantifiers. Our target is STILL an **independent nonbranching algebraic P0 WIN proof from the EMPTY original7x6 board**, which needs a further conserved source invariant or Hall-like adaptive repair overload showing P0 can force these defects repeatedly across all P1 optimal defenses. The user does not ask for a general other-board rule, imperfect-play analysis or a full optimal-move search. Historical strong28 and terminal timing remain held-back validation signals.

## Durability, qualification

Frozen before the source mate3 controls:
  docs/research/2026-10-21-frozen-all-rank-original7x6-P0-mate3-Fourway-grade2-promotion-and-P1-shift-polynomial.md
New corrected prefix445 theorem:
  docs/research/2026-10-21-corrected-original-prefix445-P1-fourth-move-only-three-or-six-under-both-quartic-forks.md
Committed Node standalone reproducer:
  research/isograph/discovery/2026-10-21-universal-singleton-ladder/verify-current-q-P0-mate3-original-grade2-promotion-and-P1-shift.mjs
Machine evidence packet:
  research/isograph/discovery/2026-10-21-universal-singleton-ladder/ORIGINAL7X6_ALL_RANK_P0_MATE3_COFACTOR_6690_STATES_AND_PREFIX445_STRICT_P1_C3_OR_C6_0_1.json

Independent source and physical original controls executed locally; standalone Node runner not yet executed as exact committed bytes under maintained Node26 CI, no external formal proof assistant, qualified IsoGraph1.2 or production solver modifications. No new root WDL theorem is claimed.
