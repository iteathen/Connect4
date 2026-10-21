# FROZEN global ORIGINAL7x6 K4-free FULL-BOARD partition function by width-4 transfer tensor (no game tree)

2026-10-21 Pacific. Canonical iteathen/Connect4 research/semantic-quotient; owner directed whole STATE-SPACE Fourier/tensor work, not isolated move chains and not importing solved7x6 game-value labels/strong28 terminal K4s.

After exact Euler interval K4 firstwin local factorization, derive a STATIC geometrical K4-avoiding full-board owner partition function:
  Z_7(z)=SUM over ALL 2^42 completely filled original7x6 binary owner colorings q
          [no original H/V/R/F K4 monochromatic for EITHER player] z^(#P0 cells).
This count disregards ALTERNATING CHRONOLOGICAL REACHABILITY and perfect-play strategy by design. It is the global density of terminal draw COLORINGS, not the number of real drawn game histories or the game theoretic value. A balanced coefficient [z^21] is only a necessary static owner-count control for potential drawn games.

All original V K4s are within one height6 column; all H/R/F K4s involve EXACTLY four CONSECUTIVE physical columns (source original unwrapped board, K4 length4). Therefore Z is computed EXACTLY with a width-3 interface TRANSFER T on whole-column 6-bit owner words. The local alphabet of FULL columns is64 colorings; disallow vertically monochromatic 4-in-a-row windows within each column. For every four consecutive column words (a,b,c,d) test the 6 original H +3 rising +3 falling K4 lines whose leftmost column is a. Transfer adds d if and only if all12 horizontal/diagonal source windows avoid both-color monochromatic K4. This is the true geometric cluster/tensor factorization, NOT a selected path solution. Dimension bound: at most 64^3=262144 three-column boundary codes with polynomial owner-number coefficient tracking0..42. No 2^42 enumeration is needed.

Before running:
1. Independent ORIGINAL unwrapped69 K4 generator must agree with local transfer factor mapping: 7*3=21 vertical plus4*(6 H+3R+3F)=48 oriented cross-column windows, total69.
2. Build literal C++ deterministic 64-alphabet exact integer transfer and compute all coefficients of Z_7(z), its palindromic owner-swap symmetry, absolute full-board K4-free coloring count Z_7(1), balanced coefficient [z^21], number of eligible vertical-only local column types, transfer edge density, number of reachable boundary codes. Compare 6x6 as a NEGATIVE control only if useful, but user wants original7x6 result.
3. Cross-check smaller board widths W4 and W5 via independent naive enumeration 2^(6W) if computationally feasible (W4 2^24~16m, W5 2^30~1b not feasible) or restricted fixed initial columns, and transfer count parity/symmetry. An independent Python formulation with dynamically deduplicated valid triples could verify full7 result if cost permits; do not claim independence unless executed.
4. Show static fully colored draw configurations exist abundantly, but owner-balanced K4-free full coloring may or may not be reachable by alternating/gravity real move order; the partition function alone is NOT an original K4 game DRAW theorem.
5. Identify boundary transfer contraction as a true FINITE-RANGE whole-space constraint tensor. The NONSTATIC game-state owner policy P0/P1 and chronological turn order remain a global control layer not eliminated by this static transfer. A new SOURCE strategy invariant / Fourier cone must preserve an adversarial quantifier, not count random colorings.
6. Commit exact solver-free source, counts, any negative results and graph map. No solver Oracle, historical28, qualified IsoGraph1.2/production mutations, or maintained CI/formal verification claims.

This global geometrical tensor construction is exploratory infrastructure for source compressed full state-space analysis and DOES NOT automatically solve user root winning theorem.
