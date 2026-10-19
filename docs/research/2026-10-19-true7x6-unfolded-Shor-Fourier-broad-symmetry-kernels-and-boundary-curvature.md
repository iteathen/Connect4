# Broad quantum/Fourier mathematics on STANDARD Connect4: unfolded incidence kernels, hidden subgroup, reflection harmonics and directional boundary curvature

**Date:** 2026-10-19. **Owner directive:** do NOT privilege defensive obligations. Search broadly for similarities—not assumed isometries—between unfolded TRUE 7×6, K4 Connect Four and mathematics used in Shor's period-finding, Fourier transforms, group representations, topology, discrete differential operators, and Boolean harmonic analysis. Defensive certificates remain ONE possible later application. Use ORIGINAL W=7,H=6,K=4 ONLY. **Status:** exact symbolic theorems and frozen independent falsifiers, research-only; no new strategic WDL or Level2 best move, no qualified IsoGraph1.2 promotion/solver edits.

## 1. Three distinct mathematical objects — do not conflate their kernels

The existing four-ribbon unfolding has 37 ordered strands, 168 appearances of 42 shared physical sites, and exactly 69 ORIGINAL length-four windows, with original gravity along columns. The alias lift M(168×42) has M^T M=4 I42, hence is injective and has NO physical-cell kernel. A different operator, the unsigned **four-window line-sum map**, is A(69×42):

    A_{L,e} = 1 if physical original cell e belongs to one original K4 geometric line L.

A x has one count per original winline. For a 0/1 indicator of a PARTICULAR P0 ownership field, A x[L]=4 means that P0 owns the entire four-cell line; A x[L]=0 means P1 owns it ONLY IF the board is completely filled. Actual first-win-stopped game semantics require current occupied/unoccupied source q and opponent timing; A x by itself is not strategic game value. This A must never be confused with the 168×42 alias lift M, original signed residual R0/R1, the GF2 edge parity δ graph, or a winning-line monocolor BOOLEAN projector.

## 2. A NONTRIVIAL additive hidden subgroup in the four-window *parity* map

Regard the 69×42 original window-incidence A as a matrix over GF(2). Define

    g : GF(2)^42 -> GF(2)^69,
    g(x)=A x (mod 2).

For any t in kernel(A mod2), g(x XOR t)=g(x) for EVERY physical-cell 42-bit assignment x. Conversely g(x XOR t)=g(x) for all x iff t belongs to this kernel. Thus the parity measurement g has an EXACT **hidden XOR translation subgroup**, of size 2^d where d=42-rank_GF2(A). This is directly analogous mathematically to Abelian hidden-subgroup/Simon/QFT problems, although the matrix A here is explicitly known and Gaussian elimination is already an efficient classical recovery method. **NO quantum speedup is implied.**

Source computation on the REAL 69 original K4 windows indicates

    rank_GF2(A)=35,  kernel dimension=7, subgroup size=128.

This rank7 kernel is a property of the PARITY OF ALL 69 length-four window sums, NOT a theorem of preserving line-completion. Because K4 length is even, the all-cells bit flip t=1^42 belongs to the kernel; it globally exchanges P0/P1 on completed colorings. Nonuniform t in the same kernel generally preserves the parity of four-window sums but can convert a monochromatic K4 line into a 2+2 mixed line. Therefore it does NOT preserve ordinary terminal WIN conditions universally. The kernel thus identifies a **genuine Shor-style hidden-group mathematical resemblance** plus the exact obstruction to calling it a game-theoretic symmetry.

**Frozen validation:** independent original 69 K4 line enumeration, GF2 Gaussian rank, list/verify ALL 128 kernel masks and g-invariance, and find an explicit non-global kernel shift t that breaks a monochromatic four-line while preserving EVERY window parity. No game WDL evaluation.

## 3. Real-valued line-sum operator has a different kernel

Over the real/rational numbers A can have a DIFFERENT rank than mod2. Exact source modular-Gaussian rank lower bound and a four-vector integer nullspace witness indicate

    rank_Q(A)=38,  real kernel dimension=4.

Use an independent prime-field rank>=38 and FOUR linearly independent integer vectors v1...v4 satisfying all 69 A v_i=0, then rank_Q(A)≥38 and ≤38, establishing equality without relying on numerical tolerance. These are nontrivial exact **linear-sum-preserving physical-signal transformations**, which could carry useful transformation-invariant features through unfolded Fourier or Radon representations. They are NOT automatic transformations between binary legal game positions: changing a 0/1 occupancy vector by a real kernel vector may leave the binary domain or turn quota, gravity or first-win conditions.

The contrast real nullity4 vs GF2 nullity7 is meaningful arithmetic dependence of the game's length-four incidence; do not explain it as a mysterious quantum effect. A transform must explicitly specify its field, group and observable. Note the earlier unconditional owner-parity stabilizer rank41 on COMPLETE hypothetical gravity shuffles concerned a DIFFERENT data set (all source owner labels), and does NOT contradict the present parity-winline kernel.

## 4. Explicit game-preserving vs static-only symmetry and C2 Fourier blocks

On literal ORIGINAL columns/rows, define \`J_x(c,r)=(6-c,r)\` (left-right reflection). It preserves BOTH the original gravity order and all 69 winning lines; it is a genuine source q game-value symmetry with transporter literal column c→6−c (qualified q_r reflection).

Define \`J_y(c,r)=(c,5-r)\` (top-bottom reflection). It preserves the SET of static original 69 straight K4 geometric lines but REVERSES gravity, so is NOT a genuine game-state isomorphism. Together J_x, J_y generate four explicit STATIC rectangle automorphisms C2×C2 (including 180-degree rotation). This is directly reminiscent of group representation/Fourier splitting; only subgroup {identity,J_x} is currently game-valid.

The original 42 physical-cell representation under legitimate J_x splits into EVEN and ODD reflection eigenspaces of dimensions 24 and 18. The 69 winline-output representation splits into dimensions 36 and 33: precisely THREE of the 69 K4 winning lines are fixed as sets under J_x (center c3 vertical intervals at rows0..3,1..4,2..5). Define permuters R_X on 42 physical cells and L_X on 69 line indices. Exact expected INTERTWINING identity

    A R_X = L_X A.

Hence the line-sum operator splits as reflection-even 36×24 and reflection-odd 33×18 maps. Source rank calculations indicate rational ranks **21 and 17**, respectively, totaling 38; kernels split dimensions **3 even +1 odd**. Need independent exact rank checks.

For geometric-only FOUR-way x/y reflections, simultaneous character dimensions of the C2×C2 representation are expected:
- 42-cell input blocks (++),(+−),(−+),(−−) = (12,12,9,9);
- 69-line output blocks = (20,16,18,15).
Intertwining extends to J_y at the STATIC A level but NOT to actual gravity strategy. These explicit spectral decomposition opportunities are broader than defensive obligations; they apply to line incidence, drawing signal reconstruction, physics-like phase signatures and comparison of equivalent representation layers.

**Frozen tests:** generate independent physical reflection of all69 windows, verify exact original J_x/J_y line permutations, count fixed windows, character spaces, and block ranks. Reconstruct ordinary original gravity source prefixes and explicitly show J_x preserves legal frontiers while J_y of an ordinarily valid prefix is NOT gravity legal, preventing false promotion of geometric group to game-theory hidden subgroup.

## 5. NEW exact directional *boundary curvature* from noncommuting diagonals

On the 42-dimensional physical-cell function space define truncated RIGHT shift X, UP shift U and DOWN shift D. Use tensor-product meaning X acts in the real seven-column coordinate, U,D on the six-row coordinate, all with ZERO past original board edges (NO torus).

The two directional DIAGONAL shifts are R=XU (rising) and F=XD (falling). Right X COMMUTES with U and D because they act on different physical coordinates. Vertical U,D do NOT commute:

    U D = I - P_bottom,
    D U = I - P_top,
    [U,D] = P_top - P_bottom.

These are exact operator identities on the original six-row finite path. Therefore

    [R,F] = R F - F R = X^2 (P_top - P_bottom).

On true W7, rank(X^2)=5; on true H6, rank(P_top-P_bottom)=2, hence

    rank([R,F]) = 5 * 2 = 10.

Likewise [U,F]=X(P_top-P_bottom) has rank6*2=12, while [X,R]=[X,F]=[U,R]=0. These commutators vanish away from the original physical top/bottom boundary and exactly encode the FAILURE of applying different diagonal steps in opposite orders. This is a concrete mathematical link to discrete differential geometry/operator algebra and to the user's idea that a third/orientation dimension may simplify diagonal intersections.

**This is NOT a commutator of original alternating P0/P1 GAME MOVES**, and its matrix rank10 does not classify winning moves. It is the geometry-only finite-shift operator, but it gives a separate broad foundational algebra where unfolded diagonals, finite boundaries and Fourier representations are directly comparable.

**Frozen independent test:** build real original 42×42 truncated step matrices, verify all 42 basis actions of the commutators, exact ten nonzero rank directions, no illegal wrapped move. Compare Fourier-diagonal cyclic counterparts only as invalid boundary controls.

## 6. Research branches now genuinely broad (NOT all about defense)

A. **Hidden subgroup/parity projection:** exact kernel subgroup of 69 K4 line parity measurements. Identify its invariants and what survives genuine game rules. Does some nontrivial subgroup act as game-state symmetry when additional guards are imposed?

B. **Harmonic symmetry/representation decomposition:** reflection-even/odd blocks, game-preserving vs static-only group actions, and whether transformed q signatures admit strategy congruence (not assumed).

C. **Operator curvature/finite boundaries:** diagonal shift commutators, low-rank boundary defects, non-circulant vs circling Fourier, unfolding/ribbon gluing.

D. **Fourier/Radon geometry and reconstruction:** analyze information preserved/lost by line sums, 37-ribbon alias lift, per-strand DFT, 69-win hypergraph; assess exact injectivity and distinct measurement gauges.

E. **Nonlinear Boolean harmonics/phase topology:** Walsh spectra and derivatives of actual winning-line source clauses, higher-order interactions, possible hidden shifts OTHER than XOR, relation to intrinsic source turn parity.

F. **Game outcome algebra and defensive obligations:** OPTIONAL APPLICATION only after a structure yields a provably strategy-sufficient invariant. It does NOT own or define the overall research objective.

No one path has yet produced universal exact no-strategic-branching WDL or one new certified best move. The primary success criterion remains an exact algorithmic identity that derives relevant outcomes on the **actual 7×6 K4** game, but mathematical intermediate results are independently valuable and should not be forced into a defensive framework.

## 7. Attribution and scientific limits

The Shor hidden-subgroup analogy is about exact periodicity/translation in a SPECIFIED observable g, not a claim that Shor's algorithm solves Connect Four. In the hidden-subgroup problem the group law and promise oracle matter. Sources: Lisa Hales, *The Quantum Fourier Transform and Extensions of the Abelian Hidden Subgroup Problem* (2002), https://arxiv.org/abs/quant-ph/0212002; Moore et al., *The Power of Strong Fourier Sampling* https://doi.org/10.1137/S0097539705447177; Lund/Drapeau/Webb, *Fourier decompositions of graphs with symmetries and equitable partitions* https://doi.org/10.1016/j.laa.2021.05.019; Chandra et al., discrete Fourier slice on finite periodic images, https://doi.org/10.1049/iet-cvi.2013.0101. All are mathematical analogies, not game WDL authority.

**Status:** SOURCE DEDUCTION/FROZEN HYPOTHESES pending independent validation on true original 7×6, K4. No new C4-R authority IDs, production code, new gameplay theorem or performance claim.
