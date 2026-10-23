# Frozen: earliest physically possible P0 odd-capacity online trap on original 7x6 P1 turn, and rank-9 Gamma test

**Date:** 2026-10-22 Pacific. **Pretest HEAD:** eed155117ee29492311f283912be1823aa47b45d. **Research direction:** Josh Oshiro. **Status:** exact source geometry lower-bound hypothesis and two genuine constructed prospective rank9 source words; their *complete* October20 matroid Gamma outcomes are UNKNOWN before checking. No solved outcomes used.

## H1 compulsory odd trap parity for P0 as October20 respondent

On original W7H6 even42 source at every P1 turn rank n odd, \(\sum_c(H-h_c)\equiv n\pmod2\), so the total number of odd remaining-capacity columns is ODD. The already-established legal online A=P0 / D=P1 responder policy needs a nonempty trap set C and an EVEN number of unmatched ODD nontrap capacity bases B to pair in rank-one Q blocks. Therefore \(|C_{\mathrm{odd}}|\equiv1\pmod2\): **at least one current P0 FIRSTWIN trap must lie in an ODD remaining-capacity column.** This is a NECESSARY condition for that specific existing responder theorem on a P1-turn position; not a necessary condition for P0 to win under other strategies.

An A=P0 current immediate trap in column c is an actual P0-owned original H/V/R/F K4 line with a single still-empty required cell y=(c,h_c+2), exactly one row above the currently empty playable frontier x=(c,h_c+1), t_c=H-h_c>=2, with every other three line cells P0-owned. If t_c is odd on H6 even, h_c is odd, so physical y must be row3 or row5, not row2 or row4.

## H2 universal original-board rank lower bound

Consider any such genuine source K4 line L with target y in physical row3/5 (zero-based row r=2/4), x immediately below y empty. Vertical K4 cannot supply this trap: if it uses x then x is not P0-owned; if L starts at y and uses sites above y those cannot be occupied while y remains empty, by gravity. For horizontal K4 with target y at zero-based row r, the other three P0-owned same-row sites require three fully occupied columns of heights ≥r+1; the target column has h_c=r-1 occupied support sites, so **at least 4r+2 occupied cells** are mandatory; for odd trap r≥2 this is ≥10.

For rising/falling diagonal four-site K4, let its four vertical rows be s,s+1,s+2,s+3 (s≥0, s≤2). Three other P0-owned sites require occupied prefixes of heights row+1 in their respective columns. The target column has h_c=r-1 occupied support below empty x, so the number of compulsory occupied cells is exactly **4s+8**, at least8. Thus NO odd-capacity P0 trap can occur before rank8, and on a P1 turn (odd ply n) its earliest possible rank is **9**. This bound uses only original physical line geometry+gravity; no enumerated board positions or game values.

## H3 physical rank9 firstwinner-free existence

Two candidate actual 9-ply alternating source histories derived by hand, before source verification:
- \`143224454\`: P0 owns diagonal c1r1,c2r2,c4r4, with P0 support at c3r1 and c4r3; P1 c4r1,c2r1,c4r2,c5r1. Heights predicted \`[1,2,1,4,1,0,0]\`. Original P0 rising K4 c1r1,c2r2,c3r3,c4r4 has only empty y=c3r3, directly above playable x=c3r2. Trap c3 has h=1, residual cap5 ODD.
- \`122454434\`: P0 same required diagonal, with P0 extra c5r1 and c4r3; P1 supplies c2r1,c4r1,c4r2,c3r1. Same heights \`[1,2,1,4,1,0,0]\`; owner depth differs. Trap P0 c3 remains odd-capacity.

Verify all9 source prefixes legal/firstwinner-free with true original69/rays; maximal source P0 trap set C, unmatched nontrap odd bases B, canonical Q, original P1 WSL and \(\Gamma_Q=\min_G(|G|-\rho_Q(G))\), all with zero child WDL evaluation.

**Essential source-Gamma falsifier:** These positions are not claimed to give \(\Gamma>0\). If Γ=0, extract the explicit truly original Player1 minimal WSL requirement G that is independent under the candidate matroid, specifying the lower support cell(s) and causal role. This would identify the next **source** obstruction for forming a guarded P0 respondent certificate earlier, instead of naively treating trap availability as enough.

## Boundary

The rank9 bound applies only to a P0 trap with *odd residual column capacity* of the existing October20 even-Q pairing policy, not to all win mechanisms or all possible traps. The source candidate words are legal alternative histories from empty, NOT proof P0 can force either from empty. Qualified 1.2 gameplay authority unchanged; no smaller Connect4 board generalizations and no solved-game oracle premise.
