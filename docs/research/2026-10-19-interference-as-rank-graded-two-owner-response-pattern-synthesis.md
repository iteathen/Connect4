# Rank-graded two-owner response interference: precursors, exact gravity dipoles, and the required strategic invariant

**2026-10-19. Canonical research owner:** `research/semantic-quotient`. **Owner's hypothesis:** the 28 historical strong-optimal terminal winning-line identities are outward evidence of a *rank-evolving interference pattern* between P0/P1 ownership and their paired legal responses; the board's gravity geometry forces a qualitative transition before those terminal lines are attained. **Status:** exact response-operator mathematics and independently checked bounded original-board evidence; **not** a game-WDL or optimal-line selector. All empirical work in this note is ORIGINAL W=7, H=6, K=4, 42 cells, 69 nonperiodic valid four-windows, 37 physical unfolded strands, 168 appearances glued to exactly 42 shared junctions. No source calculation receives the historical 28 terminal-line IDs.

## 1. Separate three distinct meanings of “interference”

1. **Exact harmonic cancellation in an observable**. The P1-induced original physical winning-threat response \(\Delta s_0=e_y-e_x\) has net zero projection on the column, so all seven width-Fourier modes cancel, while its genuine vertical finite Fourier frequencies are nonzero. This is exact interference of plus/minus contributions to a **classical signed difference field**. Fourier is a change of basis, not an assumption that Connect4 is a quantum system.
2. **Competition between owner-specific nonlinear constraints**. P0 and P1 cannot occupy the same four-way shared physical site. The original K4 monocolor property is a fourth-order Boolean/Pauli projector, not a function of one-body probabilities. A P1 move contracts P1 residual clauses and kills incident P0 clauses, while gravity may *expose* a previously unplayable P0 winning singleton. This is a physical/causal source-sink event in a graded owner-correlation algebra.
3. **Destruction of P1's safe-reply set**. Every possible current P1 response can eventually cease to avoid P0's immediate first win. The AND of all-current-P1 bad-response clauses is the local source order parameter \(Z_n\). It carries **the actual strategic universal quantifier**, whereas taking a Fourier average over possible P1 plays would not.

The old [issue #41](https://github.com/iteathen/Connect4/issues/41) verified **28 different *winning-line identities* across selected 41-move, empty-root distance-sensitive strong-optimal games**, not “28 moves” or a 28-line set available at every position. Those 28 are a HELD-BACK validation target, not the source-domain definition.

## 2. The mathematically natural state is a line-tagged rank-graded two-owner constraint field

First construct the exact original 37 open finite strands and 42 physically shared four-way equality junctions. Every original winning line \(\ell\in\Lambda\), \(|\Lambda|=69\), is one contiguous four-site interval on ONE of these strands, but its four cells remain linked to their other strand copies.

For an actual nonterminal source q at rank n, define \(\mathsf E_n\) = original EMPTY cell set, \(O_{p,n}\) = actual cells owned by p, and introduce 69 formally independent labels \(t_\ell\). Use the **FULL**, not prefiltered, owner-specific polynomial
\[
\boxed{\;
 \Phi_{p,n}(\mathbf z,\mathbf t)
   =\sum_{\ell\in\Lambda:\,\ell\cap O_{1-p,n}=\varnothing}
       t_\ell \prod_{e\in\ell\cap\mathsf E_n} z_e .
\;}
\]
All products are on ONE true physical cell variable e per four-way junction, not four independent ribbon appearances. Keeping the line tags also preserves distinct terminal-line identities when multiple K4 lines finish in one actual move. Split by degree k in the remaining physical z variables (\(k=1,2,3,4\)), making \(\Phi_{p,n}^{(k)}\) a rank-graded two-owner source. On an actual legal move in physical cell x by owner p:
\[
\Phi_{p,n+1}=\Phi_{p,n}|_{z_x=1},\qquad
\Phi_{1-p,n+1}=\Phi_{1-p,n}|_{z_x=0}.
\]
A new degree-zero term is an ORIGINAL player-p first-winning line: stop immediately in an absorbing terminal state. If nonwinning full original board, stop DRAW. These are exactly the earlier qualified q residual **owner contraction/opponent deletion** rules in a multilinear labelled representation. It is an exact fixed-action update, NOT a computation of which owner/player should choose future actions.

A rank-indexed paired response with actual P1 current action a and P0 observed response b is
\[
\Phi_{n+2}^{(a,b)}
    =\mathcal C_{0,b}^{\,n+1}\,
     \mathcal C_{1,a}^{\,n}\,\Phi_n ,
\]
provided original gravity and first-terminal guards allow both moves. This is a **nonunitary, guarded, choice-conditioned causal propagator**, more faithful than a free/linear Hermitian Schrödinger equation. P0/P1 operator order does not generally commute: prior independent 21/21 source action-swap checks at real `44444` found different R0/R1 despite equal post-two column heights. Fourier/Pauli/Hadamard transforms are tools for exposing invariant factors and cancellations **within** the operator, not permission to linearly average adversarial choices.

## 3. An exact response-interference Boolean polynomial and a measurable source order parameter

For any actual first-win-free P1-to-move q at odd rank \(1\le n\le39\), let \(\mathcal A(q)\) be its current LEGAL original columns and let \(x_a=(a,h_a)\), \(y_a=(a,h_a+1)\) if physical. Define from the FULL 69-line original *P0/P1 degree-one* source:
\[
 \sigma_a=\mathbf1[x_a\text{ is presently an accessible P0 one-cell K4 win}],\quad
 \lambda_a=\mathbf1[y_a\text{ is a P0 one-cell K4 win, currently latent}],\quad
 \omega_a=\mathbf1[x_a\text{ is P1's immediate K4 win}].
\]
The exact local one-P1-action exposure formula is
\[
\boxed{E_a(q) =
(1-\omega_a)
\left[1-(1-\lambda_a)
             \prod_{\substack{b\in\mathcal A(q)\\b\ne a}}(1-\sigma_b)\right].}
\]
Its factors mean: P1 did not already first-win; after P1 places at a, P0 can either play a previously accessible immediate winning cell in a DIFFERENT column, or play a newly released upper winning cell in a. No recursive game-valuing is used; all are original CURRENT source/landing facts, and independent physical one-step replay validates the identity.

Useful rank-indexed source observables:
\[
F_n(q)=\frac1{|\mathcal A(q)|}\sum_{a\in\mathcal A(q)}E_a(q),
\qquad Z_n(q)=\prod_{a\in\mathcal A(q)}E_a(q),
\qquad B_n(q)=\sum_{a\in\mathcal A(q)}\sigma_a\lambda_a.
\]
- \(F_n\) is the FRACTION of current P1 actions that expose immediate P0 firstwin on the next move; it is **not** probability, perfect value or a heuristic with statistical authority.
- \(Z_n=1\) exactly means EVERY currently legal P1 action fails to P1-win and leaves P0 an immediate next-move firstwin. At n=39 this is the rank39 compulsory-exposure property; at earlier odd n it is a strict two-ply local winning certificate, not all-depth WDL.
- \(B_n\) detects a gravity source/sink **dipole**: P1 blocking the present lower P0 winning cell releases a different immediately playable upper one in the same column.

This is the candidate “response interference pattern” as an EXACT Boolean constraint structure, including the correct universal P1 quantifier, embedded in a rank-graded dynamically changing geometry. The next challenge is an exact earlier-rank invariant \(\mathcal I_n\) guaranteeing that the source response calculus must eventually yield a P0 win or enter \(Z_{39}=1\), rather than merely measuring \(Z_{39}\) after-the-fact.

## 4. Frozen rank scan: precursors begin long before the terminal obstruction, without monotonicity

Frozen experimental design:
`docs/research/2026-10-19-causal-rank-interference-pattern-precursor-frozen.md`.
Reproducible original Node source (committed; maintained Node26 CI not run):
`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/standard7x6-causal-rank-response-interference-timeline.mjs`.
Exact internal evidence with original 69-source residual counts, per-game rank1..39 data, de-duplicated prefix statistics, and known legal 42-move draw:
`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_CAUSAL_RANK_RESPONSE_INTERFERENCE_PRECURSOR_TIMELINE_0_1.json`.

The selected historical strong-optimal 28 per-line witnesses contain **27 unique full 41-ply game words**. Distinct physical move PREFIXES are counted once per rank to avoid bias from the many witnesses sharing the canonical first-five-center beginning. At each odd P1-to-move rank n=1,3,...,39, the source-only observer scans all69 physical K4 lines and classifies current P1 legal replies by the E_a formula. A separately implemented literal one-P1 then possible one-P0 directional-ray checker validated **2,867 one-step P1 alternatives** over these 27 histories with zero disagreements. Each P1 deviation beyond a historical perfect-play prefix is only a ONE-STEP physical control; it is NOT claimed to be another perfect-play path.

Important examples from the full rank scan (F means MEAN of F_n over DISTINCT prefix positions at that rank; not a statistical sample of games):
| odd occupied rank n | distinct sampled prefixes | mean immediate exposure F | source pattern |
|---:|---:|---:|---|
| 1–7 | 1–5 | 0 | no immediate-risk alternatives observed |
| 9 | 6 | 0.278 | some P1 alternatives already cause immediate P0 next-turn firstwin |
| 11 | 10 | 0.029 | first genuinely LATENT upper P0 singleton sites appear |
| 27 | 23 | 0.286 | many suboptimal P1 alternatives expose P0 wins; historical selected P1 replies do not |
| 35 | 26 | 0.317 | source latent cells present on 16 distinct prefixes |
| 37 | 27 | 0.463 | 20 distinct prefixes have a latent upper cell; ZERO has universal Z |
| **39** | **27** | **1.000** | **ALL have universal Z=1**; 9 have B>0 block/release dipoles |

F is **not monotone**: it oscillates as obligations contract, blockers delete lines and gravity moves frontier heights. It is not a physical wave amplitude, and these handpicked histories are highly correlated. On every chosen historically strong P1 move at ranks n<=37, E for that exact action is0 (otherwise P0 could have firstwon two plies later, contrary to the historically preserved strong-distance path); at n39, selected P1 has no safe action. This is an observation of those source-validated witnessed paths, not a new game-theoretic proof of strong 41-ply remoteness.

The genuine empty-root legal 42-move **DRAW** `123456123456654321654321123456123456777777` has \(F_n=Z_n=B_n=0\) at every tested odd rank in this one control history. It has the SAME pair resource counts (J,U)=(1,1) at rank39 as many P0-win witnesses. This falsifies “pair-capacity exhaustion alone implies Zugzwang” and shows the critical role of owner-specific line correlations, not only parity, Fourier frequencies, late rank or low open-cell count.

**Consequence:** In the observed strong-optimal histories, nonlinear owner threat *potentiality* and dangerous opponent choices begin much earlier than 41, but the specific lower-block/upper-release paired response \(\sigma=\lambda=1\) appears first at rank39 **among the sampled odd P1-turn states**. The final rank39 universal failure is an abrupt Boolean threshold reached through a nonmonotone earlier source evolution.

## 5. The precise “interference” wavelet is a discrete gravity dipole

At a genuine P1 choice x=(c,r) with upper y=(c,r+1), the previously proved P0 PHYSICAL 42-site presently playable singleton winning-threat source obeys, under nonterminal action:
\[
s_0(q')-s_0(q)=-\sigma_a e_x+\lambda_a e_y.
\]
When \(\sigma=\lambda=1\),
\[
\boxed{\Delta s_0=e_y-e_x=(U-I)e_x},
\]
where \(U\) is the actual nilpotent upward shift along an original H6 column. This is a finite SPATIAL DIFFERENCE or dipole (zero net column support), not a periodic game move. The seven-column projection (and EVERY width-DFT mode) sees zero because x and y share column c.

But in the real four-way glued unfolding, \(T=(1/2)F_{\mathrm{ribbon}}M\), \(T^\dagger T=I_{42}\). Its finite-VERTICAL-strand component is
\[
\widehat{\Delta}_{V,c}(k)
=\frac{\exp(-2\pi i k(r+1)/6)-\exp(-2\pi i kr/6)}
       {2\sqrt6},\quad k=0,...,5,
\]
with the exact squared powers
\[
\boxed{\left[\,0,\quad\frac1{24},\quad\frac18,\quad\frac16,\quad\frac18,\quad\frac1{24}\,\right]}.
\]
The vertical **DC mode vanishes**, while nonzero higher harmonics retain the displaced original winning threat; the vertical energy sums to1/2 and the four original orientation families each supply1/2, total \(\|\Delta\Psi\|^2=2\). These values are exact for any genuine adjacent-cell source/sink dipole in H6, independent of row r except for complex phases. The finite DFT is a valid basis on the OPEN finite strand; no invalid wrapped K4 windows are used.

**Independent control:** original 69-line singleton producer, true 42-cell gravity/firstwin replay, independent physical directional ray detector and exact finite six-frequency transform confirm **all nine** selected historical late lower-block/upper-release dipoles, zero source deviations, max numerical per-mode squared-power discrepancy \(1.39\times10^{-16}\). Data:
`docs/research/2026-10-19-causal-gravity-response-dipole-finite-fourier-frozen.md`;
`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_CAUSAL_RESPONSE_DIPOLE_EXACT_FINITE_VERTICAL_SPECTRUM_0_1.json`.
Earlier independently checked 50×168 four-ribbon spectral modes in
`STANDARD7X6_FOUR_RIBBON_RANK_STEP_NINE_HIDDEN_WIDTH_FOURIER_0_1.json`.

The 28 terminal witness entries show three physical rank39 ways P1 loses the last safe response:
- **9** with no currently playable P0 win, where the sole legal P1 drop RELEASES a latent upper P0 firstwin;
- **9** with one P0 already-playable win, where P1 either plays elsewhere and leaves it or blocks it and RELEASES the upper P0 winning singleton, creating the exact dipole;
- **10** with two already playable distinct P0 winning sites, which P1 cannot both block with one stone.

These are **9+9+10 witness records** chosen for line-set lower-bound coverage, NOT separate dimensions, not 28 moves, not a general frequency claim, and NOT a proof that every strong-perfect game has a last-step dipole.

## 6. Exploratory cross-track association, explicitly *not* a proof

The two old signed incidence-syzygy “charges” previously discovered using the HISTORICAL selected 28 line IDs are NOT allowed inputs to a new source selector. An exploratory post-hoc comparison of these previously defined charges against the three rank39 response classes finds nonzero terminal charge in:
- 2/9 no-preexisting-win forced-release entries;
- 6/9 one-threat block/release dipole entries;
- 3/10 two-visible-win fork entries.

This is a suggestive **finite selected-witness association**, not a preregistered test or unbiased sample, and no inference that a charge `causes` a paired response is warranted. The charges themselves are conditioned on the known optimal28 coordinate selection. It does, however, give a concrete experimental target: seek a **FULL-original-69-line**, not oracle28-conditioned, source-derived joint charge/causal transfer that explains this difference BEFORE asking whether it predicts the 28 external line identities.

Packet:
`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/EXPLORATORY_RANK39_RESPONSE_DIPOLE_VS_28_SYZYGY_CHARGE_OVERLAP_0_1.json`.

## 7. The next proof, not another visual analogy

Aim to construct a **rank-graded physically first-win-stopped P0/P1 response-invariant cone** \(\mathcal I_n\) from full 69-line clause sources. A successful theorem from a SOURCE-qualified P0 opening must show:
\[
\forall\, a\in\mathcal A_{\rm P1}(q_n),\quad
\exists\,b(a)\in\mathcal A_{\rm P0}(q_{n+1}):
\quad
  \bigl[q_{n+2}\in\mathcal I_{n+2}\bigr]
   \ \mathrm{or}\ \bigl[P0\text{ has already firstwon}\bigr],
\]
with no P1 firstwin allowed before b, and a well-founded advancing rank. The b(a) must be mechanically certified from source constraints or a proven equivalence class, **not** obtained by recursively valuing distinct future games or fitting historical best moves. A robust \(\mathcal I_n\) must retain actual source support, explicit no-pass gravity, owner-specific four-body correlations and **both** firstwinner terminal sinks. At rank39 it could imply \(Z_{39}=1\); earlier terminal P0 wins are also allowed. The exact transition cocycle/response dipole and observed rank timeline suggest candidates for a local rank certificate, but do not provide \(\mathcal I_n\) yet.

For a stronger claim that the exact external **28 first-terminal winning-line IDs** emerge under **distance-sensitive strong-optimal** games, independently prove from the empty root the source selection of P0/P1 strong-optimal openings and maximal terminal horizon; WDL-only root P0-win does not establish the strong 28-vs-historical weaker 61 split. Only AFTER freezing that theorem compare any derived terminal-line support against issue41.

**Strongest current finding:** There IS an exact rank-evolving response pattern over original geometry, with a real signed spatial interference/dipole spectrum that simple column Fourier erases, and a source Boolean universal-response failure at the final rank of selected strong-optimal games. **Unproved:** that these observable facts constitute a global invariant, that they force all original perfect games to reach the same signature, or that the game can already be solved without strategic branching. No solver changes, IsoGraph1.2 authority edits or external formal proof-assistant qualification.
