# Full original7x6 K4-free terminal-coloring partition: exact global 4-column-factor tensor contraction

Date 2026-10-21 Pacific. Canonical iteathen/Connect4@research/semantic-quotient, owner research direction WHOLE game-state Fourier / transfer / controlled source-proof, not chains of individual moves. This is a **globally exact STATIC source-K4 geometric partition function** over the complete 42-cell 7x6 owner-coloring space, computed by a short-range tensor/transfer contraction. It is NOT the number of actual alternating legal drawn histories and NOT an independent P0 perfect-play WIN proof from EMPTY. The historical28/root solved game values are excluded from generator.

Frozen before experiment:
docs/research/2026-10-21-frozen-global-original7x6-static-draw-partition-width3-tensor-transfer.md

## The exact finite-range global source tensor

Represent one FULL original height6 column of physical cells by a six-bit owner word x∈{0,...,63}, e.g. bit1=P1 and bit0=P0. An ORIGINAL vertical K4 on that column is monochromatic if four consecutive row bits are all0 or all1. Of64 possible fully colored source columns, exactly48 contain NO vertical K4 for either owner; call this source column alphabet A of48.

For four consecutive real physical columns a,b,c,d define K(a,b,c,d) to be1 iff all TWELVE source win windows beginning in the leftmost column are nonmonochromatic:
 - six ORIGINAL horizontal K4s, one at each row1..6;
 - three ORIGINAL rising K4s beginning at row1..3;
 - three ORIGINAL falling K4s beginning at row4..6.

Original K4 geometry has exactly three vertical windows for each physical column and twelve H/R/F windows for each contiguous group of four columns. Thus on W7 the source is precisely 7×3+4×12=69 true original K4 constraints. No wraparound, phantom four-way aliases or external game solver data.

The exact FULL K4-free owner-coloring polynomial of width W is

  **Z_W(z) = Σ_(b1..bW∈A) [Π_(j=1..W−3)K(b_j,b_(j+1),b_(j+2),b_(j+3))]
                    z^[Σ_j(6−popcount(b_j))].**

Its coefficient of z^k counts all fully filled original physical W×6 boards with exactly k Player0 stones, the remaining ones Player1-owned, in which NEITHER player has ANY four-in-a-row. Because every original K4 line spans at most FOUR CONSECUTIVE COLUMNS, the partition contracts exactly as a finite tensor with boundary memory only the LAST THREE physical column owner words. At most64^3=262144 possible boundary codes, and only48^3=110592 vertical-valid triples before cross-column pruning. Maintain one coefficient vector for total P0 owner count k=0..6W; no iteration over2^(6W) entire full boards needed.

## Exact original W7H6 global results

The C++ source program in research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/verify-global-full7x6-K4free-owner-partition-width3-column-transfer.cpp computes:

  Z_7(1) = **3,152,419,330** completely filled original 7x6 K4-free binary owner colorings.
  [z^21] Z_7 = **713,305,820** balanced 21-P0/21-P1 original full-board K4-free colorings.

This is a true exact full-board source partition, but does NOT say all713 million balanced static positions admit a physically legal alternating firstwinner-free move history. The distinction is essential: source gravity is automatic for any COMPLETE colored board, whereas alternating OWNER CHRONOLOGY is a separate constraint, and a guaranteed P1 draw under adversarial perfect P0 is stronger still.

The complete polynomial has exact owner-exchange palindromic symmetry:
  [z^k] Z_7=[z^(42−k)] Z_7.
Its support is EXACTLY k=11..31, with [z^11]=[z^31]=8 and zero terms outside. Thus a full two-color K4-free original7x6 board contains AT LEAST11 stones of EACH owner, regardless of chronology. This global geometric blocker/resource fact follows from the exact width3 tensor transfer; it is not itself a winning-strategy theorem. The central coefficient is713,305,820; total unfiltered fully colored source boards 2^42=4,398,046,511,104. Only about0.07168% of all raw full owner colorings contain no original K4 for either player, but even such scarcity is NOT a worst-case player0 strategy proof.

Control board computations (not goal of generalizing the root theorem):
  W4,H6: Z_4(1)=930,014; balanced [z^12]=264,442.
  W6,H6: Z_6(1)=206,014,204; balanced [z^18]=49,986,108.
The original W4 result was INDEPENDENTLY enumerated by a second literal original H/V/R/F source window generator over 48^4=5,308,416 vertical-valid four-column strings, rather than trusting the specialized12-window quartet predicate. Every coefficient and the full total agree with the tensor transfer exactly. Owner-swap symmetry holds for all tested widths. All arithmetic is exact unsigned64-bit integer without numerical approximation.

## Why this is relevant to the global field

The source constraint graph is FINITE RANGE in COLUMN SPACE. One may represent the geometry of K4-free terminal configurations as a transfer-matrix/tensor network carrying only three boundary column states, instead of a full 42-site state enumeration. This demonstrates substantive source compression from the actual four-direction physical K4 structure, and complements the previous exact Euler-interval one-step WIN absorber factorization (438 original local orientation subset observables, formal multilinear degree16).

The remaining perfect-play goal is not a static coloring count. Original gameplay includes time, individual gravity FRONTIER, one actual owner choice each turn, immediate firstwinner absorber, and P0 existential/P1 universal policy quantifiers. A global policy-conditioned field or a robust Fourier/tensor invariant must preserve those TEMPORAL and ADVERSARIAL constraints; neither the high number of K4-free balanced boards nor any uniform random terminal coloring frequency determines the empty-root game outcome. In particular, computing static source Z_7 is not a surrogate for minimax, and importing known P0 root WIN as premise remains forbidden.

## Source and qualification

Frozen preregistration: docs/research/2026-10-21-frozen-global-original7x6-static-draw-partition-width3-tensor-transfer.md.
Standalone C++ original geometry generator and short-range transfer: research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/verify-global-full7x6-K4free-owner-partition-width3-column-transfer.cpp.
Machine coefficient packet in same directory.

A locally compiled equivalent C++ source on g++14.2 -O3 ran exact DP with width4 independent original literal source brute crosscheck in 1.39s and measured memory peak about178MB, asserting palindromic coefficients. Checked-in exact GitHub code has NOT been separately run under maintained CI or external formal qualification; qualified IsoGraph1.2, production solver and mainline unchanged. Root original7x6 P0 independent nonsearch forced WIN remains OPEN.
