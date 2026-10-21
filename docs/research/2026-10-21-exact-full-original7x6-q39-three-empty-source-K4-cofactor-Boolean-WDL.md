# Exact original 7×6 signed WDL from 3 remaining physical cells: nonrecursive four-way K4 cofactor Boolean theorem

Research date 2026-10-21 Pacific. Research direction Josh Oshiro. Canonical Connect4 research/semantic-quotient. **Proved nonrecursive source-only FULL signed WDL for any genuine firstwin-free standard 7×6 q at rank39, P1 to move; DOES NOT solve EMPTY-root P0 WIN.** Original 69 physical K4 winning windows, actual four-way shared owner sites, column gravity, alternating owner turns and firstwin stopping. The HISTORICAL strong28 labels, solved root WDL, firstfive/ply41 hypotheses are NOT used by any of the formulas. Historical q39 snapshots are independent test witnesses only.

## 1. Two original H/V/rising/falling owner-specific Fourier cofactors suffice

For physical site e currently EMPTY in source q, define exact single missing K4 projector:
  U_p(e;q) = OR_(L in all69 original K4, e in L)
                 PRODUCT_(v in L except e) n_p(v;q),
where n_p(v;q)=1 iff the ONE true physical four-way junction v belongs to p. Thus U_p=1 iff owner p has a genuine three-owned, one-missing original K4 at e. It may be gravity playable or latent; do not discard the latter.

For two DISTINCT EMPTY physical cells e,f, define the two-missing K4 projector:
  V_p(e,f;q) = OR_(L containing both e,f)
                  PRODUCT_(v in L except{e,f}) n_p(v;q).
This equals1 iff p already owns the other two original K4 sites, and both remaining cells e,f are empty. Original 4-way ownership Fourier inverse n_p(s)=(1+omega^(s-(p+1))+omega^(2(s-(p+1))))/3, p0 actual label1 p1 actual label2, provides exact algebraic expression of each coefficient. Physical column gravity and stop-at-firstwinner remain separate necessary temporal guards.

At genuine nonterminal absolute rank39 exactly THREE actual physical cells remain, and P1 acts on move40, P0 move41, P1 move42. The column-capacity multiset is necessarily exactly one of [3], [2,1], [1,1,1]. Every original K4 completed at a future move is detected by ORIGINAL U_p or V_p: a future P1 completion may use the two P1-owned future sites move40 and42, while P0 can win only by owning one additional site on41 (it has one remaining move). A P1 original K4 missing three future cells cannot be completed because P0 owns the middle future cell.

All formulas below evaluate ONLY these owner-projector cofactor indicators at CURRENT q. There are no future game nodes, recursive values, historical line masks, or oracle queries in their producer.

## 2. [3] one remaining column

Empty sites are x,y,z from bottom upward; forced legal order P1 x,P0 y,P1 z. Define (Boolean operators and=∧, or=∨, not=¬):
  P0WIN = ¬U1(x) ∧ U0(y).
  P1WIN = U1(x) ∨ [¬U0(y) ∧ (U1(z) ∨ V1(x,z))].
  DRAW = ¬(P0WIN ∨ P1WIN).
Here U1(x) is immediate P1 firstwinner (move40), taking precedence over any P0 threat on y. If P1 does not win40, P0 wins41 exactly if U0(y); otherwise P1 wins42 exactly if the original P1 K4 still needed only z or exactly both P1 future sites {x,z}. No game search or discretionary move exists.

## 3. [2,1] a two-high column plus a single top site in another column

Let x be currently playable lower site of two-high column, y directly above x, and z the sole empty top site of the other column. Define:
  B_xz=U1(z) ∨ V1(x,z),
  B_xy=U1(y) ∨ V1(x,y),
  B_zy=U1(y) ∨ V1(z,y).
Then exact signed WDL is:

  P0WIN = ¬U1(x) ∧ ¬U1(z) ∧ U0(x) ∧ (U0(y) ∨ U0(z)).

  P1WIN = U1(x) ∨ U1(z)
          ∨ [¬U0(y) ∧ B_xz ∧ ¬U0(z) ∧ B_xy]
          ∨ [¬U0(x) ∧ B_zy].

  DRAW = ¬(P0WIN ∨ P1WIN).

Proof: P1 initial legal move can be x or z. If P1 takes z, P0 must take x, releasing P1's top y on42; P1 immediately firstwins on40 if U1(z), else P1 wins42 iff P0 did not firstwin on x and B_zy. If P1 instead takes x, P0 may take either newly released y or pre-existing z; for P1 to force an ultimate win both P0 choices must fail to firstwin and subsequently permit P1 last move on z or y respectively. The indicated two conjunctions are precisely those cases. For P0 to force a WIN, neither direct P1 move can firstwin; P1 z choice leaves only P0 x (requiring U0(x)), while P1 x choice leaves P0 choice y or z (requiring U0(y)∨U0(z)). Thus formulas are logical eliminations of the fixed physical two-column grammar, not an iterative game search.

## 4. [1,1,1] three different columns with one empty top cell each

Let current physically playable sites be a,b,c. Define
  P0WIN = [¬U1(a)∧¬U1(b)∧¬U1(c)] ∧
          [(U0(a)∧U0(b))∨(U0(a)∧U0(c))∨(U0(b)∧U0(c))].

For Player1:
  P1WIN = U1(a)∨U1(b)∨U1(c)
          ∨ ⋁_(x∈{a,b,c})
             ⋀_(y∈{a,b,c}\\{x}) [
               ¬U0(y) ∧ (U1(z)∨V1(x,z))
             ],
where z is the unique third site other than x,y. This is a fixed three-term degree-small Boolean polynomial on CURRENT source cofactor bits; it can be expanded into six conjunctions. If P1 cannot firstwin immediately, she wins only if there exists one first choice x such that BOTH possible P0 responses y fail to win and leave a final P1 K4 at the remaining z. Otherwise DRAW if P0 cannot force a WIN either.

This is the exact source generalized dual of the immediate two-target P0 fork criterion.

## 5. Independent physically legal validation and why grade2 matters

Replayed true original 7×6 column heights, ownership and all69 unwrapped K4 windows for:
- 27 independently archived root-strong 41-ply representative histories truncated before rank39; outcome from q39 P0WIN on all27;
- 285 genuinely gravity-legal, firstwin-free modified q39 histories made by swapping consecutive opposite-player different-column moves in those archives, with source-current-state optimal outcomes175 P0WIN,63 DRAW,47 P1WIN;
- 26 independently source-generated original center-five firstwinning-free full-DRAW histories, truncated to rank39; all26 q39 perfect-continuation values DRAW (25 are [3], one is [2,1]).

TOTAL 338 genuine q39 tests. Derived source Boolean normal forms coincide with a separately implemented real directional-ray original legal at-most-three-ply terminal game-value validator for all observed cases; ZERO WDL mismatches. The 26 independently generated source-DRAW q39 checks were also computed directly through the formula and tiny original game evaluator. Breakdown:
  shape[3] 122: P0WIN72,DRAW31,P1WIN19;
  shape[2,1]183: P0WIN111,DRAW48,P1WIN24;
  shape[1,1,1]33: P0WIN19,DRAW10,P1WIN4;
  TOTAL P0WIN202,DRAW89,P1WIN47.

Among47 P1-winning modified q39,45 have immediately playable original P1 U1 targets on40, but TWO do not and nonetheless P1 wins on42: one uses original grade2 V1(z,y) and the other uses a latent grade1 U1(z). Therefore a formula based ONLY on immediately playable three-owned K4s would be false. Source grade2 and gravity are genuinely essential to full WDL.

The theorem's proof is an exhaustive ORIGINAL GRAVITY CAPACITY SHAPE analysis, not an empirical correlation in these338 samples or an inference from solved-game data. The 338 tests validate the algebra independently; they are not its logical basis.

## 6. Consequence and open ROOT proof

This is a real nonrecursive exact *WIN/LOSS/DRAW DETERMINATOR* at an independently specified boundary class on the original7x6 board. It validates the broader user's idea that the four-way owner K4 junction/cross-direction obligations, plus forced support-release timing, can yield true game value without recursively solving a game tree.

But it applies only when exactly THREE cells are empty. It does NOT show that P0 from EMPTY can force q into the P0-winning subset, nor does it generalize automatically to earlier ranks. A future rank38 source algebraic predecessor must transport U0,U1,V1 through legal one-step cofactor promotion/blocking; a FULL empty-board proof additionally needs a source invariant that compresses the alternating strategic quantifiers rather than hiding minimax in repeated algebra.

No qualified IsoGraph1.2 promotion, maintained Node26 CI or independent third-party formal assistant performed; actual reproducible Node source committed but not separately run as its exact repository bytes.

## Durability

Frozen BEFORE tests:
  docs/research/2026-10-21-frozen-complete-q39-signed-WDL-source-fourway-K4-grade1-grade2-Boolean.md
  docs/research/2026-10-21-frozen-universal-original-q39-three-capacity-Fourier-cofactor-Boolean-force-WIN.md

Reproducer:
  research/isograph/discovery/2026-10-21-q39-exact-boolean/verify-complete-q39-WDL-from-original-owner1-owner2-K4-cofactors.mjs

New machine evidence packet under same directory, plus frozen crossdirection q39 vs C8 q37 control.
