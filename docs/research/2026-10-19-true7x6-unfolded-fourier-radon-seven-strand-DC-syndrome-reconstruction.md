# Original standard7×6 K4: four-strand Fourier DC repairs real winline kernel, seven strand parities repair hidden subgroup COMPLETELY

**Date:** 2026-10-19. **Research owner:** research/semantic-quotient. **User broad direction:** compare Shor's Fourier, hidden subgroups, directional Radon/unfolded representations and algebraic similarities; do not make defensive obligations the exclusive end goal. **Original geometry locked:** W7 H6 K4, 42 physical cells, 69 finite true K4 windows, 37 linked orientation strands (25 with ≥4 cells), original gravity/alternating player/first-win stopping unchanged. **Status:** frozen deductive source claim with independent original-grid checks PENDING.

## 1. Two exact measurements of the SAME original board

Previous source geometry:
- 37 ordered, open-boundary strands (6 horizontal length7, 7 vertical length6, 12 rising, 12 falling), every original physical cell appears in exactly four strands.
- 25 strands have ≥4 sites, support all 69 true K4 contiguous windows. This experiment uses ONLY those 25 ACTIVE original four-ribbon strands; does NOT rely on 1/2/3-cell diagonal strands or artificial wrap windows.
- Define the ORIGINAL 69×42 integer **four-cell moving-window sum** matrix A, one row per exact finite original K4 winning line, A_{L,x}∈{0,1}. The full owner occupancy/count field v∈R^42 projects to A v. For 0/1 complete owner assignment x∈GF2^42, the parity version is A x mod2. These are DIFFERENT fields and must not be conflated.

The exact source independent pilot previously found:
    rank_Q(A)=38 (nullity4),
    rank_GF2(A)=35 (nullity7).
Thus 69 winline sums alone do NOT reconstruct the 42 physical-cell information.

## 2. Add ONLY the zero-frequency (DC) coefficients of the active strands

For each physical original strand σ containing ℓ≥4 ordered cells, define its genuine full-strand SUM

    d_σ(v)=sum_(x in σ) v_x.

This is sqrt(ℓ) times the DC coefficient of its exact finite, NONPERIODIC data under an ℓ-point DFT; the FFT computation does not assume the game wraps at the ends. For GF2 use the parity of the same sum, the binary group-character analogue rather than complex-valued amplitude.

Let B_active∈{0,1}^{25×42} be the incidence of the 25 full active strands. The source geometry rank calculations on the SAME standard board suggest

    rank_Q([A;B_active]) = 42,
    rank_GF2([A;B_active]) = 42.

**More remarkably:** an explicit FOUR-STRAND subset suffices over Q, while an explicit SEVEN-STRAND subset suffices over GF2, and these numbers are INFORMATION-THEORETICALLY MINIMAL because they fill original deficits 42−38=4 and 42−35=7.

Freeze the following original physical strand labels (all lengths≥4, first sorted by orientation in previous canonical four-ribbon note):

**Four DC sums for exact REAL/rational reconstruction:**
    horizontal r0 length7,
    horizontal r1 length7,
    horizontal r2 length7,
    rising diagonal c−r=−1 length5.

**Seven full-strand PARITIES for exact 42-bit GF2 binary owner reconstruction:**
    horizontal r0 length7,
    horizontal r1 length7,
    horizontal r2 length7,
    vertical c0 length6,
    vertical c1 length6,
    rising diagonal c−r=−1 length5,
    rising diagonal c−r=0 length6.

The source predicts each added DC/parity row strictly raises rank by one, giving exact progressions Q \`[38,39,40,41,42]\` and GF2 \`[35,36,37,38,39,40,41,42]\`.

Thus for real-valued occupancy/color signals, 69 original K4 sliding-window SUM values + FOUR strand DC values determine all 42 site scalars uniquely. For fully assigned physical binary owner fields, 69 K4 line PARITIES + SEVEN strand-parity DC values determine ALL 42 owner bits uniquely **without an external absolute owner anchor**. Some selected length-seven or length-five odd-span strand parity checks are sensitive to global color complement, which the 69 even-size K4 line-parities could not distinguish.

This is an exact, direct mathematical connection between **unfolding, finite Fourier zero-frequency projections, discrete Radon/line integrals, hidden-subgroup annihilation, and information-complete reconstruction** on the unchanged 7×6 K4 board. It is NOT a reduction of the real game to 7 free strategic bits; it is a compact supplementary observation basis for a supplied physical field.

## 3. Why full-strand DC is different from 4-window Fourier bulk

The 69 K4 windows are short localized integrals along the same 25 strands. The 25 full-strand DC integrals are longer geometric Radon-style projections. Their new information can distinguish some patterns in the kernel of the short-window measurement. The exact row-rank gains are not automatic from the full four-ribbon alias lift M, which was already injective; they specifically concern the lossy 69-window count compression.

For the fully binary completed-coloring case, augmented GF2 rank42 implies the linear parity observable \`g_aug(x)=[A;B_7]x\` has TRIVIAL hidden XOR translation subgroup {0}. This removes even global color complement ambiguity because some of the seven added full strand lengths are odd.

The DC sums are measurements of a supplied physical signal, not outcomes of the game; nonterminal original positions are ternary empty/P0/P1, and full gameplay needs physical owner colors, heights, turn and first-win stop. We have not derived WDL or optimal moves, merely one exact new frame/reconstruction equivalence in source geometry.

## 4. Frozen independent original-game falsification

1. Source-freeze actual original69 K4 windows, true 25 active full strands, fixed four and seven labelled strands, matrix ranks over Q (use exact 4 null witnesses + independent nonzero prime-field minor) and GF2 before running checker.
2. Independently regenerate original 42 physical sites, all69 true K4 windows and all25 active finite strands FROM BOUNDARY coordinates without reading source strand IDs, then map the frozen labels by original physical direction and intercept.
3. Test real rank([A;4DC])=42 over several independent small primes and show rank progression 38→42; test GF2([A;7DC])=42 and 35→42. Verify all added rows correspond to real original full strands length≥4, not special invented local probes or wrapped paths.
4. Independently replay a genuine gravity-legal FIRST-WIN-STOPPED 42-move DRAW \`123456123456654321654321123456123456777777\`, encode 69 K4 window parities and seven real full-strand parities, solve all 42 owners by independent GF2 Gaussian elimination, match exact original physical board and quotas. Also test original 42 one-hot binary-color patterns and dozens of seeded static samples, and show the augmented seven-DC syndrome changes under global complement.
5. Independently test real 42-point reconstruction from augmented 69+4 rational sums on a set of basis impulses and sample integer signals. A rational coefficient inverse can be implemented using exact modular or Gaussian elimination; for deterministic integer sources, verify all 42 site values exactly (not approximate WDL).
6. Preserve incorrect numeric/rank source cases or physical first-win discrepancies. Do not import a defensive response claim or look up any WDL oracle values.

**Relevance:** This is a substantially broader isomorphism/reconstruction theorem than a defensive-obligation reduction. It explains which information FOUR-win windows lose and how LONG directional harmonic modes recover it. It is analogous to Fourier-slice/Radon reconstruction and hidden-group syndrome completion but provides no quantum computation advantage, no Shor order-finding of actual game, no optimized game search and no new root game value.
