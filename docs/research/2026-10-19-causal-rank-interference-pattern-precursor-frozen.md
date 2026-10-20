# Frozen test: causal-rank response interference and precursors to forced exposure

**Status:** frozen discovery design; measurements and interpretation NOT available at freeze time. **Scope:** original 7x6 K4, 42 physical cells, 69 original four-cell windows, real gravity, alternating P0/P1, first-win stop. Branch `research/semantic-quotient`. Owner hypothesis: the competing P0/P1 paired-response pattern changes shape before or at terminal selection; search for a mathematically natural source-derived order parameter instead of selecting the historical 28 terminal winning lines as the algorithm input.

## Source-only observables, fixed BEFORE inspecting rank histories

At a genuine first-win-free P1-to-move state `q` at absolute occupied rank `n` (odd, n=1,...,39), let `A(q)` be original currently legal physical *columns*, `x_a=(a,h_a)` each original legal landing, and `y_a=(a,h_a+1)` if in bounds. For owner p let `R_p^{(k)}(q)` denote owner-unblocked original K4 windows with **exactly k remaining empty physical cells**, without adding fake cyclic windows; these are line-labelled witnesses, not necessarily normalized antichain generators. Define `S_p(q)` as the future physical cells completing some genuine original `R_p^{(1)}` line (three p stones and zero opposing stone).

For each legal P1 action a:
```
sigma_a(q) = 1[x_a in S_0(q)]      -- P0 currently playable win
lambda_a(q)= 1[y_a in S_0(q)]      -- P0 latent win directly above P1 landing
omega_a(q) = 1[x_a in S_1(q)]      -- P1 move would immediately terminalize
E_a(q)     = (1-omega_a) * (1 - (1-lambda_a)*prod_(b in A, b!=a)(1-sigma_b)).
```
At rank n<=39 the board cannot fill immediately on P1 move. `E_a=1` iff the legal P1 move a itself does not P1-win AND leaves a P0 immediate winning site on the next turn, by actual P1 nonterminal cofactor + gravity one-above release. This is a local **next-P0-win exposure indicator**; it is not global strategic evaluation and cannot be called exact WDL at n<39.

Freeze for every P1-to-move original state:
```
F_n(q) = (sum_(a legal) E_a)/|A|         -- fraction of P1 current actions that expose immediate P0 win (DESCRIPTIVE, NOT probability)
Z_n(q) = prod_(a legal) E_a             -- universal local forced exposure, exact at n39
B_n(q) = sum_(a legal) sigma_a*lambda_a -- lower block releases upper, width-only spectrum is blind
L_n(q) = sum_(a legal) lambda_a         -- latent next-above P0 winning sites
A_n(q) = |A|                            -- legal action resource count
S_n(q) = sum_(a legal) sigma_a          -- currently playable P0 winning sites
R_n(q) = [ |R_0^(1)|,...,|R_0^(4)|, |R_1^(1)|,...,|R_1^(4)| ]
U_n(q) = sum_c [(6-h_c) mod2]         -- existing CPC paired-response defect count
J_n(q) = sum_c floor((6-h_c)/2)       -- remaining vertical pair count
```
The primary candidate *pattern* is the 8-channel rank-indexed response signal `Q_n=(F,Z,B,L,A,S,U,J)`, augmented by the full `R_n` line residual ranks and the two owner-specific ribbon-projected fields. We will test for changes in this source signature before rank39, without fitting a change point or frequency to the historical target number28.

The discrete non-Hermitian field equation already established for nonterminal P1 action a is `s0(q')-s0(q) = -sigma_a e_(a,h_a) + lambda_a e_(a,h_a+1)`; unfolding and finite strand Fourier produce `Psi' - Psi = T(-sigma e_x+lambda e_y)`, T=(1/2)F_rib M. Zero **width** Fourier difference when sigma=lambda=1 is not true owner-potential cancellation: four-ribbon squared norm =2.

## Frozen tests and negative controls

1. Independently generate all 69 genuine finite K4 lines, physical column heights, original first-win histories and both owner R^(k) by a fresh implementation. Validate actual strong-optimal archived issue41 witness histories (28 line records, 27 distinct words), but select ONE per unique root history before computing rank-distribution measurements. Source observables never receive strong-optimal line ID, strong score or preselected set of 28.
2. On each independently replayed distinct original historical root-strong game, evaluate every odd rank n=1,3,...,39 and ALL currently legal P1 actions *one move* (not claiming post-deviation optimality). Compare source E against independently physically played P1 followed by one available P0 ray-win check.
3. Plot/report by rank: min/median/max of F, number of Z=1, B>0, L>0, current S, U and J, and original two-owner residual counts. Preserve full evidence for EACH history and rank and zero-vs-one legal action categories, not only attractive examples.
4. Independently replay the accepted original full DRAW `123456123456654321654321123456123456777777` and take its n=1,3,...,39 P1 snapshots as **negative matched-rank controls**. It is one nonrepresentative draw sequence; it does NOT estimate typical optimal draw frequencies.
5. Falsify: if F/Z rise only at rank39 simply because board is almost full, or same source signature values occur in draw, retain that negative. A rank-signature correlation is NOT a game-winning selection law. If B_n or latent source coupling appear earlier, test whether they are structural precursors vs merely present on ordinary draws.
6. Propose a nonlinear AND/OR causal-transfer or Boolean-semiring response-gauge operator ONLY where physically source-derived, keeping P0/P1 observations, gravity, first-win absorption and reply `forall/exists` semantics. Do not substitute linear Schrödinger wave propagation, Fourier amplitude cancellation or weighted average for adversarial minimax.

**Evidence class:** source mathematical identities plus bounded original-board physical observations. Genuine strong-optimality of archived 41-ply histories rests on historical database scoring, not independently rerun here. Goal remains purely algebraic non-search exact WDL; keep `INCOMPLETE` for unproved game-value claims. Existing IsoGraph 1.2 authority and production solvers remain untouched.
