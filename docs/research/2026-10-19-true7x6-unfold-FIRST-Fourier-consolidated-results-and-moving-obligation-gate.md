# Connect4 standard 7×6, K4 — unfold FIRST, apply Fourier SECOND: qualified results and strict next algebraic gate

**Date:** 2026-10-19. **Research owner:** \`research/semantic-quotient\`, direction Josh Oshiro. **Specific owner interjection:** "It seems to me it might be useful to unfold the board's geometry before you try applying Shor's or Fourier transforms to it." Owner explicitly wanted the idea preserved **without interrupting continuation of the prior quantum-math research**. **Scope remained the genuine original W=7, H=6, K=4 game only throughout; no unusual board sizes, other connect lengths, changed gravity, or fictitious cyclic game tests.** The invalid periodic boundary transform was examined only as a NEGATIVE ALGORITHM CONTROL on the unchanged real board. Qualified IsoGraph1.2 and production solvers untouched.

## 1. Main positive result — a genuinely more faithful spectral normal form

The existing 2026-10-17 *four-ribbon unfolding theorem* already represents the 42 true physical cells by 37 ordered strands (6 horizontal, 7 gravity-vertical, 12 rising diagonal, 12 falling diagonal), with 168 total appearances referring through alias constraints to only 42 physical identities. Exactly 25 strands are long enough to support four-in-a-row, giving 69 original valid contiguous four-point windows (24/21/12/12 by direction). The OTHER 12 shorter diagonal strands contain NO Connect4 K4 win interval. Prior author/designer provenance retained.

**NEW EXACT Fourier frame:** Let \`M ∈ {0,1}^{168×42}\` map each real physical cell to four ribbon appearances, and \`F=⊕_strand F_(strand-length)\` be the per-strand unitary DFT. Then

    M^T M=4I_42,
    \widehat v=F M v,
    \widehat P_phys=(1/4)(F M)(F M)†,
    rank(\widehat P_phys)=42, nullity=126,
    v=(1/4)M^T F†\widehat v.

The 126 missing degrees represent the requirement that a physical cell's four directional descriptions are GLUED; transforming four independent disjoint strands and playing stones independently there would be an INVALID game. Local Fourier wavefunctions are a *new geometric representation*, not 168 independent physical qubits or 168 legal winner conditions.

**Finite K4 win detector:** for each genuine strand of length ℓ>=4, original valid 4-cell window sums \`W_ℓ=Q_ℓ C_ℓ\` where C_ℓ is a periodic 4-tap sum diagonalized by \`F_ℓ\` and Q_ℓ deletes the last three cyclic starting positions. Thus

    W_ℓ = C_ℓ-(I−Q_ℓ)C_ℓ,
    [F_ℓ C_ℓ F_ℓ†]_kk=Σ_(j=0..3)exp(−2πi k j/ℓ),
    rank((I−Q_ℓ)C_ℓ)≤3.

Across 25 active standard-board strands the exact total discarded-circular-boundary rank is **67**. A separate finite open-path SINE eigenbasis diagonalizes symmetric 1D path adjacency without cyclic wrapping, though neither sine nor Fourier alone diagonalizes the actual nonlinear opponent strategy.

**Independent original-only physical checks:** 37 strands, 168 appearances, all 42 fourfold aliases, exact 69 winning intervals, rank42/nullity126, 25 active strands/144 active appearances; 854 integer cyclic-mask K4 convolution tests, 854 DFT matrix element tests, 1,820 open-path sine tests, 7,056 Fourier impulse coefficients, 1,764 original site reconstruction checks, maximum numerical error <3.1e−15. Independently checked one genuine 42-move FIRST-WIN-STOPPED full DRAW. **PASS / ZERO errors.**

Frozen theorem plus appendices \`docs/research/2026-10-19-standard7x6-four-ribbon-first-Fourier-directional-convolution-and-cell-gluing.md\`; machine packet
\`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_UNFOLD_FIRST_37_RIBBONS_FOURIER_ALIAS_FRAME_BOUNDARY67_0_1.json\`.

## 2. Critical negative that makes unfolding consequential (not visual)

A naive flat PERIODIC 7×6 DFT geometry would generate 42 candidate 4-point *cyclic* windows in EACH of the four orientations: 168 pseudo-winlines, whereas the finite original game has 69. Exactly **99 fake wrapped lines** (H18,V21,rising30,falling30) MUST be removed by source correct boundary guards. The number 168 here is **TOROIDAL WINDOW COUNT**, entirely different from the earlier coincidentally equal 168 ribbon APPEARANCES.

The independent original real-game checker replayed original literal gravity alternating legal full DRAW:

    123456123456654321654321123456123456777777.

This is a genuine real 42-move game with NO win before or at filling. The INVALID periodic-window detector incorrectly reports **8 nonexisting monochromatic fours**: six vertical crossing real top/bottom (three P0/three P1) plus two falling-diagonal (one each). A concrete fake P0 line is physical original zero-based IDs [28,35,0,7], which illegally identifies row5 with row0. The original game remains DRAW; cyclic terminal detection is unequivocally WRONG. No other game geometry was used.

Frozen proof \`docs/research/2026-10-19-true7x6-flat-QFT-periodization-99-spurious-windows-falsifier.md\`; packet
\`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_FLAT_PERIODIC_QFT_99_SPURIOUS_LINES_8_FALSE_WINS_ON_REAL_DRAW_0_1.json\`. Do NOT conclude every flat Fourier transform is unusable: zero-padded/boundary-masked flat transforms can be mathematically correct. The unfolded-first method simply has a particularly natural, exact way to handle the game's FOUR directional OPEN PATHS.

## 3. Continued the active quantum-informed source response attempt, did not stop at visualization

Previous real canonical \`44444\` q (rank5 P1 mover) was frozen, plus the specific observed actual P1 center move to original \`444444\` (center FULL, P0 next). The 18 outer vertically anti-aligned Pauli pair conditions can be physically enforced by a deterministic one-pending P0-lower pair responder on center-complete branches, but these constraints do NOT suffice to exclude twelve signed cubic P1 diagonal/horizontal winning requirements.

**UNSIGNED** exact Walsh bit-flip-influence responder: chose initial pending P0 lower literal column2. Independent actual original P1 first win at absolute move14 on rising diagonal [0,8,16,24], history

    44444421122333.

Physical verification saw 38 true pre-P1 physical states, 224 P1 attacker choices, 223 P0 source replies, ZERO illegal gravity mates or pending-pair invariant failures. Hence rejected this single source defender policy. Source/harness argument mismatch before valid run was durably preserved as INVALID preflight and repaired only in independent checker.

**SIGNED** exact Walsh conditional-mean derivative responder: choose playable virgin lower with smallest \`W_j = Σ_x f12(x)(-1)^{x_j}\`. The signed statistical formula is exact: \`E[f12|lower=P0]-E[f12|lower=P1]=2 W_j/2^18\`, a difference unsigned influence forgets. It chose initial P0 lower literal column1. Frozen source and separate true original P1-branching physical checker found genuine first P1 rising diagonal at absolute move32, physical original [8,16,24,32], history

    44444411117113333557553553777722.

Independent checker covered 30,854 true pre-P1 physical states, 138,439 P1 alternatives and 138,438 actual legal P0 deterministic replies, ZERO response illegality or pair-invariant violation. BOTH full histories were independently replayed against their frozen SOURCE response algorithms and full physical first-win stop, each reproduced exactly with correct P1 diagonal on the FINAL move. These are COUNTEREXAMPLES to **two fixed heuristic policies**, NOT evidence of a forced P1 win or a strategic comparison of move14 versus move32.

Packets: \`STANDARD7X6_444444_FOURIER_WEIGHTED_P0_PAIR_POLICY_PHYSICAL_REJECTED_0_1.json\`, \`STANDARD7X6_444444_SIGNED_WALSH_P0_PAIR_POLICY_PHYSICAL_REJECTED_0_1.json\`, and independent \`STANDARD7X6_UNFOLD_FOURIER_TWO_P0_POLICY_FAILURES_INDEPENDENT_FIRSTWIN_REPLAY_0_1.json\` under the same \`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/\`.

## 4. Precise missing theorem after this cycle

The owner geometry intuition is AFFIRMED as a mathematically useful order of operations: **unfold 42 physical cells into four ordered finite directional fibers → preserve cell-alias gluing → transform fibers by boundary-corrected Fourier/sine basis → represent signed original source winning generators → seek online adaptive response preservation.**

Current OPEN step is not the Fourier spectrum itself. An actual ORIGINAL P1 winning line may be completed when P1 enters the LOWER cell of a virgin vertical pair, **before P0 can respond**, even though P0's reply would leave the final pair split. Marginal Fourier magnitude and signed conditional expectation cannot establish opponent-universal first-win exclusion.

The next potential source-only online closure proof must track, for every active P1 signed original residual generator, its four-ribbon contiguous physical cell sites and gravity release order, plus the number and placement of remaining P0 response resources. After each observed P1 action, one legally released P0 response must preserve a no-P1-FIRST-WIN invariant or prove earlier P0 victory, without evaluating strategically inequivalent future-game WDL states or hiding AND/OR choices in a tensor contraction. Previously known support-mirror/first-touch/nonbijective proofs must be compared on SAME genuine q to separate novel strategic coverage from spectral relabelling.

**STATUS:** spectral geometry is exact and independently PASS; both P0 ranking policies are physically REJECTED; no new ordinary standard7x6 source scalar WDL, best original literal move, Shor period or production search cutoff. Qualified IsoGraph game theory 1.2 unchanged; no solver/main edits; no tests on other board sizes/K.
