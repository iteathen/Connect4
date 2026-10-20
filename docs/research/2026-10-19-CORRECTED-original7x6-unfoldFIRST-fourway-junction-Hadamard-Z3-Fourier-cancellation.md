# A stronger unfold-FIRST interference law: physical four-way junction ownership exclusion becomes a low-rank Fourier defect

**Date:** 2026-10-19. **Owner direction:** construct P0/P1 wave potentialities on the **unfolded** 37-strand/42-junction original 7×6 K4 geometry FIRST, then Fourier transform, searching broad wave cancellation/intersection patterns (NOT reducing work to defensive obligations). Research branch \`research/semantic-quotient\`. **Status:** symbolic algebra frozen before independent local 42-site tests. No new perfect-play WDL / best move. No nonstandard board sizes.

## 1. BEFORE spectral projection, the original 42 physical sites are four-way copy/equality tensors

The exact original unfolded 7×6 geometry has 37 ordered finite strands, 42 PHYSICAL junctions, one occurrence per H,V,R,F orientation, 168 total appearances; shared ownership at four appearances is identical because they refer to ONE real cell.

At every junction e, define **two separate binary owner flags** a_e=1 if owned by P0, b_e=1 if owned by P1. Original physical ternary ownership allows precisely
    (a,b)∈{(0,0) EMPTY, (1,0) P0, (0,1) P1};
the fourth logical binary pair (1,1) is FORBIDDEN by actual single-owner rules.

For each of four orientation copies o∈{H,V,R,F}, carry a local pair (a_o,b_o). The exact ORIGINAL junction copy tensor is
    J({a_o,b_o}) =
       SUM_{(a,b)∈{00,10,01}}
         PRODUCT_o [a_o=a][b_o=b].
It has exactly THREE entries equal to1 in the full eight-binary-leg tensor of size2^8=256: all four copies empty, all four P0 or all four P1. No game-theory strategy, wave probability or defense assumption occurs in its definition.

This is the correct order of operations: physical junction alias gluing + mutually exclusive owners are DEFINED FIRST, then transformed. If one first assigned independent owner wave intensities to all 168 appearances, one would have created phantom states with different owners on the same physical site.

## 2. Apply the exact unitary Walsh/Hadamard Fourier transform to EIGHT local owner bits

For each of eight binary legs use the normalized 2×2 Hadamard \`H[k,x]=(-1)^{k x}/sqrt(2)\`. Let k_{o,0},k_{o,1} be the Fourier frequencies for the P0 and P1 bits on orientation o. Define two total binary Fourier charges
    S0 = XOR_o k_{o,0} ∈{0,1},
    S1 = XOR_o k_{o,1} ∈{0,1}.

The exact transformed junction tensor is
    J_hat({k}) =
       1/16 [1 + (-1)^S0 + (-1)^S1].

It depends ONLY on the two total parity charges, not on arbitrary source game histories. Its four charge sectors have amplitudes:

| (S0,S1) | J_hat |
| (even,even) | +3/16 |
| (odd,even) | +1/16 |
| (even,odd) | +1/16 |
| (odd,odd) | **−1/16** |

All256 complex/sign-valued Fourier entries are therefore EXACTLY nonzero, but the both-odd sector has a NEGATIVE amplitude from physical owner exclusivity. This is a genuine algebraic phase inversion (not a physical quantum probability of a bad state). Norm is preserved: 64*(9+1+1+1)/256=3 equals the 3 unit entries of original J.

## 3. Owner-separation reveals a striking rank-one forbidden-state correction

If the two player-bit copy tensors were falsely treated as INDEPENDENT, the junction would admit all FOUR pairs {00,10,01,11}. Its 8-leg Walsh transform would be
    J_hat_independent = 1/4*[S0=0]*[S1=0].

Physical exclusivity removes EXACTLY the all-four-copies "P0 AND P1 jointly own site" assignment (1,1), giving

    J_hat = J_hat_independent − (1/16)(−1)^(S0+S1).

The correction is an EXACT OUTER PRODUCT (rank ONE) across the 16 P0-frequency configurations versus the 16 P1-frequency configurations. The full 16×16 Fourier-transformed junction coupling has rank exactly TWO, not rank one, because both the independent even-even term and the forbidden-state defect are linearly independent.

This resembles the earlier true gravity Fourier identity \`S_real=S_cyclic−|0><6|\`: a simple idealized periodic/independent operator plus one low-rank term enforcing the actual physical boundary/ownership restriction. The resemblance is a mathematical representation/defect technique, not a source game-value theorem.

**Key interpretation:** The negative both-odd component is the exact wave correction from mutually EXCLUSIVE player ownership at a four-way physical crossing. It is NOT an automatic canceled defensive obligation or a winning continuation eliminated by quantum destructive interference. This is nevertheless closer to the owner's requested wave-cancellation picture than the earlier post-hoc per-line DFT.

## 4. Alternative single ternary owner-label Fourier transform: Z3 junction charge conservation

Instead label a cell with ONE of three basis states s∈Z3 (0 empty,1 P0,2 P1). The copy tensor
    C_{s_H,s_V,s_R,s_F}=1 iff all four labels equal,
has exactly three nonzero entries. Under independent normalized 3-point DFTs on the FOUR appearance legs,

    C_hat(k_H,k_V,k_R,k_F)
       = (1/3) * [ (k_H+k_V+k_R+k_F) mod3 =0 ].

Hence among 3^4=81 local Fourier frequency tuples, exactly **27 are nonzero** of amplitude 1/3 and **54 cancel identically**, through the geometric root-of-unity relation 1+ω^q+ω^(2q)=0 for q≠0 mod3. Across 42 original physical junctions, this gives 42*54=2268 local canceled ternary-frequency tensor entries out of42*81=3402 tested entries.

This is an exact kind of phase cancellation structurally reminiscent of Fourier selection rules, Shor's finite Abelian characters, spin-network charge conservation and GHZ/copy tensors. **It does NOT assert a game-valid cyclic symmetry swapping EMPTY,P0,P1**: labeling the three allowed values by Z3 is a choice of Fourier BASIS only; actual first-win/gameplay is not invariant under cyclic permutation of those states.

## 5. Overlay of uncertain two-owner potentials is DIFFERENT again

After choosing a history distribution \(\rho\), site e might have owner probabilities (p_empty,p0,p1) summing1. Fourier transforming the **weighted** owner junction gives
    J_hat_rho(k)=(1/16)[p_empty +p0(-1)^S0+p1(-1)^S1].

If the mathematical potentiality model has p_empty=0, p0=p1=1/2, the (odd,even) and (even,odd) sectors vanish EXACTLY even though both owner probabilities are positive. This is a legitimate signed phase cancellation over the CHOSEN distribution; it does not imply the cell is unusable or neither player can win. On a SINGLE known actual board, exactly one p is1 and no potential uncertainty remains.

Unfold-FIRST operator \(\bar K_p=Tdiag(p_p)T†\) and its variance slack \(\Gamma\) from the companion corrected note capture that same distinction globally across all 37 ordered strands.

## 6. Frozen independent original7×6 controls and research consequence

- Build original four-way physical incidence junctions independently from 37 finite geometric strands; verify every e has exactly four distinct orientation appearances and 42 independent tensor copies with shared identity (not 168 playable cells).
- Independently enumerate all 256 eight-owner-frequency assignments and compute Hadamard transform DIRECTLY from the three actual allowed original owner flags, comparing the derived 3/16,+1/16,−1/16 formula; check exact squared norm3 and rank of 16×16 P0-vs-P1 frequency matrix equals2. Independently verify rank ONE of the forbidden-state correction.
- Independently enumerate all81 four-leg ternary Fourier tuples, direct complex original three-state tensor evaluation, verify 27 amplitude1/3 and54 exact zero and norm3; test on each of 42 true four-way junctions (3,402 local transformed entries), not a different board geometry.
- Separately test chosen weighted owner distributions (balanced two-owner, known physical P0-only, P1-only, empty) to distinguish coherent mathematical amplitude cancellation and ordinary mixed-state probabilities.
- Assert NONE of these local junction selection rules implies an exact true 7×6 perfect-play WDL or optimal action. Building the complete owner-and-history quantum-style tensor for 69 winning-line monomials and the seven gravity column chains is a NEXT stage, not already solved.

**Research value:** The user's unfold-FIRST wave idea has yielded TWO complementary, exact representation-level interference laws at physical intersections: an original two-binary-owner Fourier rank-one exclusivity defect and a ternary owner Fourier charge-conservation selection rule. They apply to the full original 37-strand network, not merely to a precomputed list of possible K4 winning lines. They are independent of adopting a defensive-obligation explanation.
