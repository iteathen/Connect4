# All-rank true four-way Connect4 singleton ladder: universal P1 defensive compatibility and nonvertical latent threats

2026-10-21 Pacific; canonical iteathen/Connect4 research/semantic-quotient. Research direction Josh Oshiro. **New source-only theorem:** exact Player1-defender *immediate next-P0-move* win certificate for ALL genuine original7x6 firstwin-free P1-to-move positions, with independent original6x6 cross-check. No solved oracle/strong28 line labels in theorem producer. This is not independent empty-root P0 WIN or arbitrary-q complete signed WDL.

## Exact physical one-missing K4 polynomial and OPPONENT shift

Regenerate original actual 69 open H/V/rising/falling physical K4 windows for W7 H6; one ternary owner per physical shared four-way site, no extra cells for copies.

For actual firstwin-free q, owner p and EMPTY physical site (c,r), let A_(p,c,r)(q) be the set of original K4 lines containing (c,r) where ALL three other physical sites are already owned by p. A line may be LATENT if its missing site is not yet gravity playable. Define the site-line multiplicity coefficient a_(p,c,r)=|A_(p,c,r)|, and the height-relative original one-missing source column polynomial

  G_(p,c)(q;z)= SUM_(r=h_c(q)..H-1) a_(p,c,r) z^(r-h_c(q)).

Coefficient at z^0 is the original P0/P1 true CURRENT playable one-missing K4 count; z^1 is the number immediately above the current landing site. DISTINCT source line labels through the same playable physical cell count as ONE possible independent defensive target site, not multiple independent moves.

When the OPPONENT of p takes a genuine currently playable physical x=(c,h_c), and does not FIRSTWIN there, the original physical cofactor at every OTHER remaining empty site stays unchanged: the opponent never creates a p-owned stone, and any original three-owned line missing a different physical e cannot contain previously empty x among its three p-owned stones. Only physical singleton lines missing exactly x are permanently blocked. Original column h_c increases by1. Therefore EXACT line multiplicity shift, for every true original source K4:

  **G_(p,c)(after opponent at c;z) = [G_(p,c)(before;z)-a_(p,c,h_c)]/z.**
  **G_(p,d)(after opponent at c;z) = G_(p,d)(before;z), for all d!=c.**

This is an actual physical 7-component finite nilpotent shift-and-truncate operator, not a game-value transition. Its current-playable Boolean effect is an exact single-coordinate overwrite:
  s'_c = l_c; s'_d=s_d for all d!=c,
where s_c=[coeff0 G_(P0,c)>0] and l_c=[coeff1 G_(P0,c)>0] BEFORE P1's move.

## Strong all-rank VERTICAL exclusion and cross-orientation interpretation

At ANY actual original gravity board, any live owner-p VERTICAL K4 with at least one occupied p stone has its p stones as the lower prefix and its still empty cells as the upper suffix of that vertical four-cell window. In particular the lowest missing cell is the current gravity landing. Its source gravity-support debt d=0. Thus ANY owner-p genuine VERTICAL three-owned original K4 with one missing site has that missing cell as its TOP original K4 cell AND it is CURRENTLY PLAYABLE. A latent positive-support-degree one-missing original K4 can ONLY belong to HORIZONTAL/RISING/FALLING, at ANY legal ply, not only late rank39. This strengthens the previous row5/6 no-vertical-release observation into a UNIVERSAL theorem.

## UNIVERSAL exact P1 defensive compatibility without looking at P1 future game values

At ANY genuine firstwin-free q with P1 to move, let actual legal columns be C. Set
  s_c = 1[current playable P0 original one-missing K4 at column c],
  l_c = 1[P0 one-missing original K4 immediately ABOVE current landing c],
  e_c = 1[Player1 can itself FIRSTWIN immediately by a current legal drop c].
All three are computed from original owner-specific one-missing K4 cofactors of CURRENT q only.

If ANY e_c=1, P1 can FIRSTWIN right now and the game stops. Otherwise after any actual legal P1 defense c the exact next-turn P0 playable winning columns are those s_d where d!=c, plus column c precisely if l_c=1. Therefore P1 current move c avoids immediate next P0 FIRSTWIN iff the following one-step source Boolean identity holds:

  Safe(c) = (1-l_c) PRODUCT_(d in C, d!=c)(1-s_d) =1.

With NO current P1 immediate FIRSTWIN, P0 FIRSTWINS on its next turn regardless of P1's current move iff ALL such Safe(c) are false. This is an exact, fixed-size Boolean product formula, without recursively evaluating a successor or enumerating inferior P1 continuations.

More transparently, set S={c in C | s_c=1}, n=|S|. Source immediate P0 defender insolvency holds iff exactly one of:
  (1) n>=2: MULTI-physical-site fork.
  (2) n==1, with unique c and l_c=1: P1 must block the original immediate source but the same drop RELEASES a new original H/R/F winning singleton one physical row above.
  (3) n==0 and ALL legal c have l_c=1: P1 is forced to release a win wherever she plays.

This is the earlier rank39 10 fork/13 blocker-release/16 compulsory-release classification expressed now as an exact *any rank* source operator, with P1 direct firstwinner precedence.

## Early root geometry and historical late boundary unified

One-based original true firstwin-free source word 44516 gives P0 bottom consecutive owned c4,c5,c6, P1 to move:
  W6x6 S={c3}, P1 can take c3, so no P0 guaranteed immediate next win.
  W7x6 S={c3,c7}, P1 cannot block both with one move, giving source P0 FIRSTWIN on move7 regardless P1 next reply. The original quartic third cofactor of the K4 monomial sum explains the difference: x3 vs x3+x7.

Historic q39 one-based 444443333636613412225777255525666717751 (ONLY held-back validation), P1 to move: S={c1}, l(c1)=1 from a latent FALLING P0 K4 through (1,6). P1 must take c1 to stop two original currently playable V/H K4s at physical (1,5), but this drop shifts the FALLING singleton into playable source constant coefficient. Thus P0 guarantees firstwin on41; no historical winning-line ID enters the criterion.

Independent legal C8-defensive q37 one-based 4444431617112121323232535355657576667 has P0 immediate c7 but l(c7)=0, so P1 c7 blocks existing VERTICAL singleton(s) without releasing a later vertical singleton; this q also has a P1 direct immediate firstwinning alternative at c2, so precedence must be respected. This is a conditional legal trajectory, not presumed perfect from EMPTY.

## Independent true original physical falsification

After freezing the result, a separate pure-Python independent actual H/V/R/F K4 checker (distinct from committed Node source) generated 1,200 firstwin-stopped original W7H6 random legal games and 800 original W6H6 games, seed 20261021, plus the above real original source control words. Each physically real P1-to-move position had ALL legal P1 moves checked, with independent new-board literal K4 original rays and current-owner singleton line polynomials. Quantitative results:

  W7: 10,021 actual P1-to-move firstwinfree states, 68,710 legal P1 moves, 467,278 exact column shift checks, 66,754 independent next-P0 ray probes, ZERO mismatches. 2,238 live VERTICAL singleton K4s and51,741 live partially occupied VERTICAL K4s (no latency/support-debt counterexamples). 376 P0 immediate forced WIN sites: 308 forks,68 single block-release cases; no compulsory-release in this random sample.
  W6: 6,051 P1 states,35,557 legal P1 moves,207,522 exact shifts,34,587 next-P0 ray probes, ZERO mismatches. 1,144 vertical singleton and27,345 live partial vertical K4s, no latency violations. 164 local P0 immediate forced wins on arbitrary nonperfect histories (146 forks,18 single block/release); not a contradiction to P1's known perfect root 6x6 value.

TOTAL independent checks: **16,072 physical P1 states,104,267 legal P1 moves,674,800 exact polynomial-column shifts,101,341 direct original next-P0 ray probes,3,382 vertical singleton and79,086 partially occupied vertical windows, zero mismatches**. These tests are independent validation; the all-rank shift/vertical and compatibility equations are deductive original K4/owner/gravity consequences.

## Root proof limitation and next step

The universal source tactical theorem is exact, and unifies the early x3+x7 fork with the later nonvertical block-and-release and compulsory-release three-way boundary. It does NOT prove ORIGINAL 7x6 Player0 can inevitably force the local incompatibility from EMPTY against a perfectly adapting Player1. To do that, one further source strategy-control/gravity deadline invariant must force s/l to cross the incompatibility threshold despite all legal defensive repairs; we do not reintroduce solved 28 line IDs or oracle WIN as premises. This is the remaining 7x6 source-WDL theorem.

Frozen preregistration: docs/research/2026-10-21-frozen-all-rank-original-seven-fourway-singleton-ladder-shift-nonvertical-latency-universal-defender-incompatibility.md.
Committed standalone source: research/isograph/discovery/2026-10-21-universal-singleton-ladder/verify-all-ranks-opponent-singleton-ladder-and-P1-defender-compatibility.mjs.
Independent physical/checker controls run locally; their aggregate structured evidence is saved under the same directory. Maintained Node26 CI and external proof assistant NOT run. Qualified IsoGraph1.2 and production solvers unchanged.
