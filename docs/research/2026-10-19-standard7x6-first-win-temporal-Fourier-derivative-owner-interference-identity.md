# Original W7 H6 K4: first-winning player equals the π-Fourier mode of a discrete temporal first-win derivative

**Date:** 2026-10-19. **Owner research direction:** separate two ownership potentiality "wavefunctions" over the ENTIRE game play space, overlay them and extract their canceling intersections (pond/light interference analogy). This is intended as a BROAD mathematical representation, not exclusively defensive obligations. **Strict scope:** original W=7,H=6,K=4; original gravity, alternating ownership and first-win-stopped game. **Status:** exact temporal Fourier/finite-difference mathematical theorem frozen before independent original physical 5040-schedule falsification. No new perfect-play WDL or best move; quantum-style wave amplitudes are formal calculations, not physical quantum dynamics.

## 1. Define original time-dependent winning-line wave, with first-win game rule explicit

Take an ACTUAL first-win-free original state q at absolute rank n and consider a **hypothetical full gravity-compatible future column-label interleaving** \(\pi\) of its N remaining sites, with alternation owner p(t)=(n+t−1) mod2 for one-based local future step t=1..N. Only prefixes up to the earliest win are actual legal original game moves; the complete \(\pi\) itself is a counterfactual algebraic index if it continues beyond first win.

On each hypothetical original occupancy prefix at time t, define a single Boolean indicator

    B_t(π)=1 if AT LEAST ONE original physical K4 line is already completely owned by P0 OR P1,
           0 otherwise.

Because completed monochromatic original stones never change owner, B_t is MONOTONE in t even if we continue the hypothetical label sequence after actual game termination:
    B_(t−1) ≤ B_t, B_0=0 since source q is nonterminal.

Define its discrete first-win *temporal wave impulse*

    f_t(π) = B_t(π)−B_(t−1)(π).

Each f_t is either 0 or1, and over one hypothetical complete column-shuffle history at most ONE t has f_t=1. If no winner ever forms, f_t≡0, and the original game is a filled-board DRAW. If f_τ=1, the ACTUAL first-win-stopped game ends at that unique physical step τ; later hypothetical events are not legal actual game moves.

## 2. Exact Fourier owner separation (not a heuristic)

P0 moves at absolute zero-based original ply n+t−1 EVEN, P1 at ODD. Only the current mover can NEWLY complete a winning line, because all of the opponent's stones were already present one step earlier. Thus the original first-winning PLAYER for the hypothetical schedule \(\pi\) is encoded by the exact alternating phase:

    S(π) = SUM_(t=1..N) (-1)^(n+t−1) f_t(π).

This is the finite temporal Fourier/Walsh transform of f at angular frequency \(\omega=\pi\), with absolute rank phase. It has EXACT values
    +1 iff original P0 completes the FIRST K4 line;
    −1 iff original P1 completes the FIRST K4 line;
     0 iff original game reaches full board DRAW.

No game-tree evaluation is needed to CHECK this identity on one concrete original history; it merely observes actual first-win stopping in a different algebraic form. It does NOT construct the first-winning history or solve opponent-adaptive quantifiers.

For every winner path, \(f_t=\mathbf 1[t=\tau]\) and its COMPLEX temporal Fourier transform is
    \(\widehat f(\omega)=e^{-i\omega\tau}\).
This is an exact unit-modulus phase describing first-win TIME; for a draw \(\widehat f=0\). A number \(\tau\) does not need to be computed to state this identity, although evaluating a particular line path by replay does find it.

## 3. Exact discrete integration-by-parts: first-win difference from the ENTIRE cumulative winner-existence wave

Let \(\epsilon_t=(-1)^{n+t−1}\). Ordinary algebraic summation by parts yields

    S(π)= ε_N B_N(π) + 2 SUM_(t=1..N−1) ε_t B_t(π),

since B_0=0 and ε_(t+1)=−ε_t. This expresses the owner-resolved FIRST-WIN waveform as a signed linear functional of the **CUMULATIVE existence** of ANY original winning line at each time, not as a collection of preassigned defensive obligations.

For a chosen fixed weight distribution w(π) on the hypothetical full gravity-shuffles, expectation is linear:

    E_w[S] = E_w[1(P0 first)] − E_w[1(P1 first)]
           = SUM_t ε_t E_w[f_t].

With **uniform** all complete gravity-shuffle interleavings, this is an exact parity-Fourier amplitude of a classical counting measure, NOT an actual quantum interference probability and NOT an adversarial perfect-play value. Strategy choices generally change weights and are quantified by alternating players; do not call E_w[S] a source perfect-play WDL.

The phase \(\epsilon_t\) is NOT arbitrary: it comes from the actual game rule that P0/P1 alternate turns, so it is the natural character at frequency π. Still, summing signed path amplitudes after discarding history identity produces cancellations as an ABSTRACT Fourier observable, not literal destructive interference of distinguishable physical quantum paths.

## 4. Original 7×6 K4 fixed 5040-history physical falsifier

Freeze a TRUE original first-win-free rank32 source q: first 32 moves of the independently validated first-win-stopped legal 42-ply full DRAW
    123456123456654321654321123456123456777777.

Its remaining original heights (number of future sites in columns0..6) are \`[0,0,1,1,1,1,6]\`; there are \(\frac{10!}{6!}=5040\) full gravity-compatible hypothetical suffix permutations. Existing independent original physical checker computed first-winner category along every one:
- P0 FIRST WIN for exactly **1350** sequences;
- P1 FIRST WIN for exactly **564**;
- DRAW for **3126**;
- 1548 of the 5040 completed hypothetical suffixes would have hit original first-winner terminal *before* the 42nd physical placement.

New independent physical checker must reconstruct B_t from scratch using all ORIGINAL 69 K4 lines on every one of the 5040 actual firstwin-free prefix traces, compute each f_t and exact Fourier S, verify each S agrees with actual original first winner and is in {-1,0,1}, and verify independent cumulative B_t expectations/histogram.

**Source expected absolute first winning ply histogram** from the prior original physical control (the checker must reconstruct, not accept this as authority):
    37:480, 38:42, 39:522, 40:156, 41:348, 42:366.
Therefore signed owner π-Fourier numerator over 5040 source completed schedules is
    480 − 42 + 522 − 156 + 348 − 366 = **786**.
Exact normalized parity-wave amplitude is \(\frac{786}{5040}=\frac{131}{840}\), approximately 0.15595238. The total FIRST winning count is 1914, rest3126 DRAW.

This is one selected true original position's **combinatorial first-win-existence ensemble**, NOT q-root minimax and NOT a universal Fourier game-value formula. The full original 42 root potentiality space remains much larger; do not extrapolate branch probabilities or "first win time" as a search requirement.

## 5. Why this is relevant to the owner's wave-overlap picture

Two owner line wavefields from previous research count final completed K4 monochrome lines in hypothetical full gravity-shuffle configurations. An original coloring can contain BOTH a P0 and P1 line after a counterfactual continuation, even though only the EARLIEST completing line determines actual winner. The temporal **discrete derivative f_t** distinguishes the first appearance of a winner. Its frequency-π Fourier mode gives the difference of P0-first versus P1-first without assuming ownership waves cancel whenever their final potentials match.

A promising broader mathematical direction is to express the **time-dependent expectation E[B_t]** using spectral/geometric correlation/inclusion-exclusion identities on the four-ribbon shared-cell lattice, perhaps avoiding explicit histories. Then E[S] follows by a linear transform. HOWEVER even an exact uniform-history first-winner Fourier amplitude is NOT game-theoretic WDL unless strategic alternating quantifier semantics can also be expressed and proven source-sufficient.

This mechanism is a genuine discrete wave/finite-differential identity, separate from defensive obligations and static ranking. An eventual source theorem might exploit absorbing projector algebra, chronological cancellations, group characters, or a nonlinear phase representation; none is currently proved as an exact nonbranching perfect-play solver.

**Qualification:** source deduced and frozen, physically independent tests PENDING; original game-authority1.2 and solvers unchanged; no other W/H/K.
