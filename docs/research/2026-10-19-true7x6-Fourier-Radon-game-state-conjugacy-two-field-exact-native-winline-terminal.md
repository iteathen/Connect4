# Fourier/Radon state-conjugacy on TRUE 7x6 K4: exact no-search game-state evolution with native 69 winline counters

**Date:** 2026-10-19. **Owner broad Fourier/Shor focus:** compare transformations, information invariants, operators and symmetries beyond defensive obligations. **Scope only ORIGINAL W=7,H=6,K=4, first-win-stopped, seven gravity columns, alternating player turns**. **Status:** deductive representation theorem and precommitted source/independent physical falsification. NOT a nonsearch full perfect-play outcome algorithm, no Shor quantum advantage, no authority promotion.

## 1. Two physical fields encode every ordinary ternary board position

A full binary owner coloring suffices only for a *completely filled* board; ordinary legal Connect4 q is ternary per cell (empty,P0,P1). Let
    o∈{0,1}^42: physical OCCUPIED indicator,
    p∈{0,1}^42: physical P0 OWNER indicator (p_e≤o_e),
    P1 physical indicator o−p.

Original gravity says in each literal column c there exists h_c∈{0..6} such that o_(c,r)=1 exactly iff r<h_c. Current player is \`(Σh_c) mod2\`. Actual first win ends the game.

Let original finite **four-window/full-strand measurement** matrix
    F = [A_69 ; B_DC4] ∈ {0,1}^{73×42},
where A_69 contains all 69 ORIGINAL K4 physical 4-point windows and B_DC4 contains the complete original full-strand (DFT zero-frequency) sums of H rows r0,1,2 and rising diagonal c−r=−1 length5.

The previously independent original7x6 result established exact \`rank_Q(F)=42\`; see \`docs/research/2026-10-19-true7x6-unfolded-fourier-radon-seven-strand-DC-syndrome-reconstruction.md\`. Thus the 73 ordinary integer/rational measurements determine an arbitrary real 42-cell physical vector uniquely.

Define the transformed colored-position signature
    \mathcal E(q)=(F o, F p, h)
on actual gravity-legal first-win-free positions. This is an INJECTIVE embedding of original physical colored boards (source histories may collapse into same q_o; do not claim q_o invertible to a particular colored board). A decoder exists by linear inversion of F on its image. A full physical alternating/legal color configuration can be checked from these two fields plus h; no game-tree valuation is required.

## 2. Actual gravity update is a simple COLUMN impulse

Let e_(c,h_c) be the basis indicator of the physical next cell in any legal current original column c. In the original game's p0=first-mover convention, the mover at ply n has \`currentP0 iff n mod2=0\`. On that single true gravity placement:
    o'=o+e,  p'=p+ [mover=P0]e, h'_c=h_c+1.

Because F is linear, the exact spectral/real-space conjugate update is
    F o' = F o + F e,
    F p' = F p + [mover=P0] F e.
The 73-element impulse \`F e\` can be precomputed for each of the 42 ACTUAL physical cells. Updating the transformed game-state signature requires no independent ribbon copies, no rollback, no alternate game successors, no QFT hardware, and no minimax.

This is a **true original legal move representation conjugacy**, not the assertion that gameplay win/loss/draw value is a linear observable. The DFT zero-frequency nature of each B_DC row gives a direct connection to Fourier-after-unfolding; the first 69 A rows are directional finite K4 convolutions.

## 3. K4 first-win termination is NATIVE in transformed coordinates

For every original winning line L, the corresponding first-69 components are:
    n_occupied(L)=(F o)_L,
    n_P0(L)=(F p)_L,
    n_P1(L)=n_occupied(L)-n_P0(L).

After an actual placement, the original player completes a K4 win iff there exists L such that
    mover=P0 and n_P0(L)=4,
or  mover=P1 and n_P1(L)=4.

No decoding to individual cell owner field is needed to test original completion. A full board with no prior K4 line ends DRAW. If a win has occurred, \`step\` must refuse any later move (first-win stopping), even though the linear algebra could hypothetically continue after terminal.

**But evaluating perfect-play WDL at a nonterminal position still involves who can force what against adaptive opponent play. No source theorem makes the value linear merely because the state evolution is a linear impulse map.**

## 4. Non-defensive applications / broader Fourier/Shor similarities

- **Mathematical conjugacy and consistency:** The same original legal game q physical state admits (a) 42-site real grid, (b) 168 linked directional ribbon appearances with M^T M=4I, (c) 73 integer Fourier/Radon measurements per occupancy/owner channel with rank42. Exact commutative diagram of representations and terminal tests, not just defensive obligations.
- **Operator and group/syndrome structure:** The Fourier zero mode supplies exactly four omitted real window-sum degrees; alternative GF2 seven-DC variant recovers binary cell labels and kills window-parity hidden group, showing dependence on arithmetic field.
- **Linear observer versus nonlinear value:** The 69 first rows of F permit *direct* first-win detection even though full game strategy might resist Fourier analysis. Investigate whether other game-level quantities factor through a much smaller invariant subspace; do not assume they do.
- **Signal reconstruction / finite Radon:** A directional window sum and a handful of directional total-line sums form an information-complete finite signal representation. A complete q harmonic observability map is a concrete bridge to generalized discrete tomography without a periodic torus.
- **Possible computation optimization only later:** Incremental F e updates could be implemented cheaply, but the original source already has highly optimized winline detection, so do NOT assert solve-time gains without a new exact game-value result and measured total wall time.

## 5. Precommit independent original physical controls

1. Freeze source \`F\` with 69 real original winline masks + four long full-strand DC masks, initial signature and original turn/gravity/terminal-guarded impulse update.
2. Separately reconstruct genuine W7H6 K4 physical 42-bit occupancy and P0/P1 board from literal actions, generate all 69 K4 lines, and compare BOTH 73-dimensional source integer spectra at EVERY physical move for original legal first-win-free histories \`44444\`,\`444441\`,\`444444\`, full 42-ply DRAW \`123456123456654321654321123456123456777777\`, and REAL frozen P1 winning histories \`44444421122333\`, \`44444411117113333557553553777722\`. Do not continue after the true first winning move.
3. Check exact seven legal original columns at \`44444\`, original center full at \`444444\`, first winner P1 on plies14/32 as known physically, and no premature wins on DRAW.
4. Verify a separately implemented GF103 decoder reconstructs original (o,p) on representative source signatures, original physical ternary states, and resulting original winning-line status. GF103 inverse is used as an exact modular rank/witness for small binary signals; do NOT call it a quantum circuit.
5. Preserve any noncommuting/terminal failure; report SOURCE INCOMPLETE for general perfect-play WDL even if all representation checks PASS.

**Expected scientific conclusion:** exact source physical-game representation with native first-terminal K4 detector and no search FOR EVALUATING ONE GIVEN MOVE. No root future best-move or WDL theorem from representation equivalence.
