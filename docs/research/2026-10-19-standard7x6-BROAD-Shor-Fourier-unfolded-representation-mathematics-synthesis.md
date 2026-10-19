# Connect4 quantum/Fourier mathematics BROAD RESEARCH CORRECTION — hidden groups, representation equivalence, complete unfolded observers and geometric operator algebra

**Date:** 2026-10-19. **Owner:** research/semantic-quotient; research direction Josh Oshiro. **User correction:** Defensive obligations are only ONE possible use, not the organizing principle or sole endgame. Seek *broad mathematical similarities* between TRUE standard Connect4 and Shor-style Fourier/hidden subgroup mathematics, including unfolded geometry, representation changes, group symmetries, nonlinear harmonics, geometry/finite differences and any eventual game-theoretic implications. **This work stayed strictly W=7,H=6,K=4**, original gravity and first-win-stopped gameplay. No strange boards or other connection lengths, no original-game solution oracle as a premise, no game-tree WDL search, no production solver changes or IsoGraph1.2 authority promotion.

## 1. A precise hierarchy of differently informative transforms

All relate to the SAME 42 literal physical original cell identities:
- Four-ribbon appearance map \`M_168x42\`: **injective**, \`M^T M=4I42\`, rank42. With independent Fourier per finite strand, \`F_ribbon M\` remains injective and permits reconstruction using all 168 appearances (126 aliases/consistency relations). Original 37 strands, 25 K4-active, all 69 true K4 intervals. Prior result, not newly attributed.
- K4 WINDOW-COUNT \`A_69x42\`, one 1 for every physical site in each of the 69 original four-cell lines: \`rank_Q(A)=38\`, **four-dimensional kernel**. A's 69 integers alone cannot reconstruct every physical cell signal.
- K4 WINDOW-PARITY \`A mod2\`: \`rank_GF2=35\`, **seven-dimensional kernel**, exactly 128 XOR translations invisible to all 69 four-line parities. This is a genuine Abelian HSP *observable* \`g(x)=Ax\`, not a hidden period of the original game or a quantum advantage (matrix A is explicit; classical elimination solves it).
- K4 MONOCHROME (nonlinear) predicates: only identity and ALL-CELL color complement among the 128 parity-period masks preserve the monochromatic K4 property under EVERY complete binary coloring. Thus **126 of the 128 parity-hidden shifts can change actual geometric win detection**, and global complement swaps P0/P1 labels. A parity quotient is NOT sound Connect4 value quotient.
- Real-valued SUM field and binary OWNER field are DISTINCT arithmetic objects. Independently verified four exact integer null modes of A and rational rank38 (prime lower-bound rank38), and one pair of DISTINCT balanced 21/21 physically full-colored arrays with IDENTICAL all69 individual four-window integer sums despite differing at 20 physical cells. Those are STATIC arrays, not established legal completed histories.

**New exact Shor connection:** \`H=ker_GF2(A)\` is an actual translation subgroup, \`g(x⊕t)=g(x)\` iff \`t∈H\`. Fourier on \`GF2^42\` detects annihilator frequencies. Because g is known linear, recovering H classically is easy; no Shor hardware speedup. The existing rank41 owner-affine-hull over all HYPOTHETICAL complete gravity shuffles concerns a different mathematical object and is consistent with this rank35 A-parity map.

Independent true physical kernel packet:
\`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_BROAD_SHOR_HIDDEN_PARITY_KERNEL_C2C2_REFLECTION_0_1.json\`; source and separately frozen checker therein; 8,832 original line-parity period checks, 276 exact integer null-mode window-sum checks, zero mismatches.

## 2. Minimal added binary Pauli/syndrome observables: SIX local correlations + one anchor

The 69 K4 line parities rank35 do not preserve all original binary owner information. SIX explicitly frozen physically adjacent two-cell XOR/Pauli \`Z_a Z_b\` correlations
    (0,1),(1,2),(7,8),(8,9),(0,7),(7,14)
raise the rank consecutively \`35,36,37,38,39,40,41\`, reducing the 128-element hidden subgroup to {0,1^42}. ONE absolute physical owner bit of site0 supplies rank42 and unique reconstruction of ALL42 completed binary owner bits. Rank deficit makes these six relative measurements minimal. Important: they are **physical-cell correlation OBSERVATIONS**, not game moves or an asserted quantum circuit.

Separate independent true7x6 checker verified all 128 periods against six checks, source 76-bit syndrome, 144 full physically supplied binary owner patterns including one genuine first-win-stopped 42-ply DRAW, and 6,048 individual physical bit reconstructions with no errors. The first checker preflight mistakenly used different ORDERING of the 69 line measurements (same set) and was preserved; row-major measurement-label alignment was fixed ONLY in independent checker before the passing controls.

Research note:
\`docs/research/2026-10-19-true7x6-Shor-hidden-subgroup-six-local-Pauli-syndrome-reconstruction.md\`.
Its role is understanding information loss/recovery, NOT classifying a future winner.

## 3. Stronger owner-motivated UNFOLD-FIRST Fourier/Radon result: four REAL or seven BINARY full-strand DC values recover EVERYTHING

Instead of arbitrary local ZZ checks, retain long directional information naturally exposed by four-ribbon unfolding. The exact complete SUM of a finite ordered strand of length ℓ is √ℓ times that strand's zero-frequency DFT coefficient (DC moment), with NO wraparound geometry introduced. Only 25 original strands with length≥4 are used (all are actually capable of hosting a K4 win).

**Over Q:** \`A_69x42\` has rank38; adjoining exactly FOUR real full-strand DC sums from
    H row0,H row1,H row2, R rising diagonal c−r=−1
raises original rank \`[38,39,40,41,42]\`. Therefore any real physical 42-cell signal can be reconstructed from its 69 original legitimate K4 WINDOW sums PLUS these four original long strand sums.

**Over GF2:** original rank35, adjoining exactly SEVEN full-strand DC *parities*
    H row0,H row1,H row2, V col0,V col1,R c−r=−1,R c−r=0
raises rank \`[35,36,37,38,39,40,41,42]\`, reconstructing all42 owner bits WITHOUT any external single-cell owner anchor. The odd-length 7/5 site DC parities break global complement ambiguity. Four/seven are MINIMAL additions from exact rank deficit.

Independent checker regenerated 69 original windows/37 finite directional strands, checked full ranks over mod101 & mod103 and GF2, and reconstructed 214 physical integer/binary signals (8,988 cell values), including a true 42-ply first-win-stopped DRAW, without errors.

Packet:
\`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_UNFOLDED_RADON_DC_FOUR_REAL_SEVEN_BINARY_MINIMAL_INVERSES_0_1.json\`.
Proof:
\`docs/research/2026-10-19-true7x6-unfolded-fourier-radon-seven-strand-DC-syndrome-reconstruction.md\`.

This shows that localized K4 windows + a handful of long-wavelength strand modes are information-complete. It is a mathematically exact Fourier/Radon reconstruction resemblance; it does NOT say K4 moves or WDL are Fourier linear.

## 4. A TRUE game-state representation (not only static coloring)

Let o be the 42-site **OCCUPIED** 0/1 field and p be the 42-site **P0 ownership** 0/1 field, with p≤o, P1=o−p and seven original heights h_c indicating gravity frontiers. Let
    F=[A_69;B_DC4]∈Z^{73×42}, rank_Q F=42.
The original physical game-state maps injectively to \`(F o,F p,h)\`. Given one real legal current move at cell e=(c,h_c), current mover P0 iff sum h EVEN, and source transformed update is EXACT:
    F o' = F o + F e,
    F p' = F p + [P0 moves] F e,
    h'_c=h_c+1.

The FIRST69 components of \`F p\` directly count P0-owned sites on EACH original physical K4 winning line. P1 owns four iff \`(F o - F p)_L=4\`. Thus original first-win terminal detection is NATIVE to the transformed coordinates without reconstructing physical owner cells; a full board with no earlier win is DRAW. This is a **genuine single-action original-game representation CONJUGACY**, not a perfect-play game VALUE oracle.

A second independent actual colored-grid checker verified six original real histories, **105 legal first-win-stopped plies**, both native 73-counter ownership fields on EACH ply (**14,490 K4 counter comparisons**), 8,820 reconstructed original occupancy/P0 physical owner bits via independently computed GF103 inverse; full DRAW and P1-WIN at absolute ply14/32 matched exactly. No errors or source game-tree searches.

Evidence:
\`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_FOURIER_RADON_FULL_REAL_GAME_STATE_CONJUGACY_105_PLY_CHECKS_0_1.json\`.
Proof:
\`docs/research/2026-10-19-true7x6-Fourier-Radon-game-state-conjugacy-two-field-exact-native-winline-terminal.md\`.

The representation has 73 integer measurements per channel vs 42 original bits per physical channel; there is NO automatic physical memory or runtime advantage. It offers algebraic regularity and a new basis for discovery, not a reason to discard optimized original board-state detection.

## 5. Reflection/representation-theory similarity preserves a genuine game symmetry

The TRUE original left-right gravity-preserving action Jx:(c,r)→(6−c,r) is qualified original game q_r reflection; it preserves winner labels, move availability and first-win stop, with transporter one-based action column c→8−c.

Original static 69×42 K4 sum matrix A satisfies the exact INTERTWINER:
    A Jx = Lx A
for Lx the 69-line permutation. Input physical 42-space decomposes under the complex/rational C2 group into EVEN24 and ODD18, output 69-line space into EVEN36 and ODD33. Independent rational ranks of the two maps: 21 and 17, summing rank38; null dimensions 3 even +1 odd.

STATIC top-bottom Jy is also an automorphism of the 69-line geometry, but REVERSES original gravity; it is NOT a game q automorphism. The STATIC C2×C2 character ranks of A are (11,10,9,8) on four 42→69 blocks with input dimensions (12,12,9,9) and output (20,16,18,15). These are actual mathematics of original hypergraph, not claim of a new game strategy symmetry.

**NEW stronger result:** minimal FOUR real and SEVEN GF2 supplementary original long strand DC sets can be CHOSEN Jx-CLOSED without adding ANY measurements:
- four real: H row0,H row1 and mirrored diagonal pair R(c−r=−1), F(c+r=7);
- seven binary: H row0,H row1,H row2, mirror V columns0/6, mirror R−1/F7.
Both preserve exact full rank42 and satisfy
    T Jx = P_(original 69 lines ⊕ selected DCs) T
where output P is a SIMPLE PERMUTATION matrix, so game-valid reflection acts directly on Fourier/Radon observer components. Rational output 73 has five fixed components (three central-column winning windows, two horizontal DCs), hence EVEN39/ODD34 output dims, versus physical image EVEN24/ODD18. This preserves exact reflection without paying additional DC rank overhead.

Independent original physics checked both minimal rank progressions over mod101/103 and GF2, **6,258 exact matrix intertwining entries**, and **31,290 reflected syndrome equalities** across six genuine original histories and their reflected counterparts (105 physical ply snapshots), including mirrored DRAW and P1 WIN stop at same ranks. Zero errors.

Proof:
\`docs/research/2026-10-19-true7x6-minimal-reflection-equivariant-Fourier-Radon-reconstruction.md\`.
Packet:
\`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_MINIMAL_JX_EQUIVARIANT_FOUR_REAL_SEVEN_GF2_FOURIER_RADON_0_1.json\`.

**Qualification:** The game-valid reflection q/value congruence existed before; new result is an information-complete transformed observer which is itself EQUIVARIANT. The GF2 group action remains a permutation; do not claim orthogonal ± eigenspace decomposition over characteristic two.

## 6. Finite diagonal differential geometry: a NONZERO nilpotent boundary curvature

On original physical 42-site cell-signal space, define truncated rightward shift X, upward U and downward D (zero outside finite board). R=XU rising diagonal, F=XD falling diagonal. Exact algebra:
    [U,D]=P_top−P_bottom,
    [R,F]=X²(P_top−P_bottom), rank=10,
    [U,F]=X(P_top−P_bottom), rank=12,
    [X,R]=[X,F]=[U,R]=0.

The diagonal commutator is NONZERO only on original top and bottom ROWS; it is NILPOTENT with rank sequence [10,6,2,0] for powers1..4. Therefore **all its ordinary eigenvalues equal zero although it is not the zero operator**. Eigenphases/eigenvalues alone miss this finite nonnormal geometric obstruction; boundary-aware nilpotent operator algebra may be useful. This directly addresses the owner's earlier desire for a partial-differential/Fourier-like approach without inventing another board.

Independent original checker tested all42 basis site shifts, **10,584 integer matrix entries**, exact GF101 ranks10/12/14 (including [U,D]) and nilpotent powers; ZERO errors. These are geometry-shift commutators, NOT noncommutation of two player GAME choices or an original WDL proof.

Packet:
\`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_BROAD_DIRECTIONAL_FOURIER_OPERATOR_BOUNDARY_CURVATURE_RANK10_0_1.json\`.

## 7. Broad research avenues, none privileged by defensive obligations

The original top-level objective remains **a general algorithmic, non-branching exact Connect4 WDL / useful best-action rule on original 7x6K4**, not a fixed proof architecture. A mathematics framework also merits study independently as long as we separate findings from game-value claims.

**A — Group/representation/harmonic structure.** Extend game-valid C2 Fourier block decomposition to the original oriented q=(h,R0,R1) transition operators. Discover whether another genuinely GAME-preserving group/hidden shift (not the known static top-bottom mirror) exists and can produce exact nonsearch WDL. Test on ONLY real game positions; do not assume all static symmetries are gameplay symmetries.

**B — Information-preserving spectral observers.** Explore minimal DC/bandlimited Fourier/Radon signatures, their exact kernels over specified fields, and whether the two-channel physical game-state conjugacy admits a SMALLER source semantic invariant than full 42-site reconstruction. A full rank observer has no inherent search speedup, but it permits algebraic normal-form comparisons and reconstruction certificates.

**C — Geometric operator algebra / boundary curvature.** Explore nilpotent commutators, exact rank-one/low-rank open-boundary corrections, noncommuting diagonal shift geometry, operator polynomials and shared physical site aliases. Compare unitary QFT bulk with true finite open paths. No claim eigenphase estimates encode winners.

**D — Nonlinear quantum Boolean Fourier.** Already documented 18-bit conditional f12 P1 residual has 102400 nonzero Walsh coefficients, degree16 but large low-order energy and no XOR period; study exact multi-body/phase interactions on real q, not static approximations to game value.

**E — Actual game-value algebra / structural congruence.** Ask whether the transformed original one-move maps have a provable strategy-sufficient quotient/identity eliminating future game branching. A result may arise from symmetry, conserved quantities, finite rank, direct formulas, invariant ideals, or another algebra, **not necessarily a defensive obligation**. Never quietly replace perfect-play WDL with a static code syndrome or solved-book lookup.

**F — Defensive obligation certificates:** remain useful as ONE application, especially for turning a mathematically discovered invariant into a direct valid no-win proof; do not promote this to the only research target. Previous signed/unsigned Fourier P0 response policy first-win counterexamples (ply14/32) remain rejected and preserved.

**G — Engine optimization (separate):** only after exact strategy consequence or demonstrably inexpensive useful feature, test net end-to-end wall-clock savings in IsoMax/BSFP/SUT, not just number of represented states. No solver implementation changes in this broad mathematical cycle.

## 8. What Shor's algorithm does NOT currently provide

Shor's abelian hidden-subgroup/period-finding advantage requires a suitable function and oracle/group access. We found a true hidden XOR group H of an explicitly linear winline-parity observable; **it is NOT a hidden subgroup of exact game value**. It has 128 shifts, but most fail to preserve K4 monochromatic predicates, let alone gravity and first-win. Adding six local ZZ correlations reduces it to global complement; adding one anchor or seven full-strand parity DC values removes that too. Algebraic elimination is simpler than quantum computation here.

Sources:
- Lisa Hales, *The Quantum Fourier Transform and Extensions of the Abelian Hidden Subgroup Problem*, https://arxiv.org/abs/quant-ph/0212002 .
- Moore et al., *The Power of Strong Fourier Sampling*, https://doi.org/10.1137/S0097539705447177 .
- Lund, Drapeau & Webb, *Fourier decompositions of graphs with symmetries and equitable partitions*, https://doi.org/10.1016/j.laa.2021.05.019 .
- Chandra et al., *Exact image representation via a number-theoretic Radon transform*, https://doi.org/10.1049/iet-cvi.2013.0101 .
- Roetteler, *Hidden shifts/quadratic forms and large Gowers norm*, https://arxiv.org/abs/0911.4724 .
The mathematical connections are valid to the extent of the SPECIFIED equivalences; no claim of a quantum hardware speedup or a solved Connect4 game.

**Final qualification:** All new exact source structural ranks/identities underwent separately frozen, independent ORIGINAL W7 H6 K4 physical/algebraic validations. Early measurement-ordering preflight defect for six-local decoder remains separately archived and was corrected only in its checker before passing. No external formal proof assistant qualification run. We did NOT derive a new perfect-play WDL or best original move and did NOT update qualified IsoGraph gameplay1.2, main or production solver.
