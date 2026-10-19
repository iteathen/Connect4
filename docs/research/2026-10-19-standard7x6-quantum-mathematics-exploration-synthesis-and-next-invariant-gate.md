# STANDARD 7x6 K4 only: quantum-inspired Pauli/ZH research synthesis, exact limits, and next original-q invariant gate

**Date:** 2026-10-19. **Explicit latest owner restriction:** do NOT run mathematical discovery or tests on unusual W,H,K; all CURRENT primary investigations and comparisons use ORIGINAL Connect Four **W=7,H=6,K=4**, 42 physical original cells, 69 original four-in-a-row winning windows, strict gravity, alternating P0/P1, first-win stopping. Generalized-board and K≠4 research is a PARKED historical track until the owner lifts the restriction AFTER an algorithmic breakthrough on standard rules. **Canonical research branch:** \`research/semantic-quotient\`. **Governing game semantics:** qualified IsoGraph 1.2, unchanged. **Source WDL target:** exact no-strategic-game-fanout Level 1 original q and/or source ONE provably best original move (Level2) on ordinary 7x6. No lookahead game values disguised as QBF/BDD/tensor contraction. Actual P0 first-win at empty board known from external solved authority, **not derived by this pilot**.

## 1. Literature framing, correctly attributed

Use classical exact symbolic Pauli algebra, stabilizer/gauge projections and ZH diagrammatic nonlinearity, NOT brute classical simulation of a general 42+-qubit quantum state vector. A dense 42-qubit complex128 pure state alone requires 64 TiB, and full physical game occupancy needs more degrees of freedom. The legitimate inspiration is Backens & Kissinger, *ZH: A Complete Graphical Calculus for Quantum Computations Involving Classical Non-linearity* (2019), https://doi.org/10.4204/EPTCS.287.2; Aaronson & Gottesman stabilizer tableau techniques (2004), https://doi.org/10.1103/PhysRevA.70.052328. Their mathematical formalism does NOT prove a quantum computational advantage for Connect4, and cannot automatically turn an alternated OR/AND minimax into a linear amplitude-sum.

Original research precursor:
\`docs/research/2026-10-19-quantum-inspired-operator-algebra-and-strategy-invariant-candidate.md\`.
Scope-correct mathematical pilot:
\`docs/research/2026-10-19-true7x6-quantum-pauli-owner-affine-hull-and-nonlinear-operator-pilot.md\`.

## 2. Exact 42-cell affine owner-parity no-go (first test)

The 42 hypothetical complete owner-bit vectors from all full gravity-column-chain shuffles have P0=21, P1=21. They are ALGEBRAIC full words with first-win stop SUSPENDED (not legal completed games after any earlier win). For each pair of physical cells from distinct columns we can make the two events adjacent in a gravity linear extension and then swap them; exactly their two owner bits flip.

All such pairs: \`C(7,2)*6*6=756\`. The original cell-pair exchange graph is a connected complete seven-partite graph of 42 vertices, so its edge XOR vectors span the entire even-weight subspace of GF(2)^42 of rank **41**. Thus the only unconditional LINEAR Pauli-Z owner stabilizer shared by ALL full hypothetical original gravity shuffles is the total owner parity \`PRODUCT(Z_e)=(-1)^21=-1\`; 21/21 exact owner quota is a stronger NONLINEAR Hamming-weight condition. This does NOT bar additional parity under chosen first-win-compatible online defensive policies.

The exact four-site monochrome line Pauli projector is
\`P_L=(I+Σ_(e<f∈L) Z_e Z_f+∏_(e∈L)Z_e)/8\`.
The 69 true source lines expand into exactly 352 distinct commuting Z monomials: 1 identity, 282 distinct ZZ pairs and 69 length-four ZZZZ terms, with total integer coefficient sums (69,414,69) at denominator 8. This changes REPRESENTATION, not WDL. A genuine original 42-move legal COOPERATIVE DRAW gives static energy zero while ordinary standard7x6 P0 can force a win against imperfect defenses; so no STATIC Hamiltonian minimum-WDL equivalence.

Source and independent evidence:
\`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_PAULI_756_AFFINE_SWAPS_352_PROJECTORS_INDEPENDENT_0_1.json\`.
Original 7x6 physical checker completed **1,512 hypothetical gravity words, 104,328 individual line-projector evaluations, 52,164 source cross-column exchange incidence checks**, zero mismatches, and independently verified one genuine FIRST-WIN-STOPPED full cooperative 42-move DRAW.

## 3. Canonical real 44444 conditioned Pauli split-gauge experiment

ACTUAL P0/P1 5-move prefix center \`44444\`: P0 owns center r0,r2,r4; P1 owns center r1,r3; P1 to move; 37 future cells; original normalized R0=48, R1=42. Hypothetically split every vertically adjacent future pair in the SIX other original columns: 18 independent checks \`Z_lower Z_upper=-1\` on 36 sites. The 21/21 full hypothetical quota then implies sole unfilled center top has owner P1, leaving exactly 18 free lower pair-owner bits.

This is a CONDITIONALLY STABILIZED COMPLETED-COLORING space, **NOT** a P0 online strategy. Under this gauge:
- Original P0 R0: 18 orthogonal to a complete pair, 6 incompatible with center-top P1, 24 nonzero signed cubics.
- Original P1 R1: 18 orthogonal to a pair, 24 nonzero signed cubics.
- Both families each stay at 24 distinct cubics under signed literal absorption.
- A direct *genuine original q* one-step Boolean/Pauli cofactor source reproduces all SEVEN independent P1 legal next root actions against a separately reconstructed true original 69-line colored checker. No source WDL values were queried.

Independent 4,096 static 18-pair gauge assignments / 282,624 physical K4 line checks / 8,192 signed DNF tests and independent source q checks all PASS. First checker had an invalid row-major index for c3,r5 (used index26 instead of38), archived BEFORE fixing; only the corrected physical checker qualifies the result. Evidence:
\`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_CANONICAL44444_18_PAULI_SPLIT_7_TRUE_Q_COFACTORS_0_1.json\`.

## 4. New automatic operator proof decomposition: 18/12/12 and restricted four-check lower bound

Of the 24 P0 and 24 P1 conditional signed cubic source projectors, EXACTLY **12 projected monomials are identical signed functions**, although they correspond to DISTINCT original player-owned K4 lines. Physical original same-column gravity precedence \`G0 ≺_g G1\` holds for ALL 12: each P0 required source cell has a higher same-column P1 required cell. Thus if a completed hypothetical source coloring under these split constraints realizes the paired P1 clause, the corresponding P0 K4 line must have finished earlier in any same-column gravity shuffle. This is a quantum-style automatic derivation of the SAME 12 previously known support-mirror/first-win vetoes—not NEW source WDL coverage.

Exactly 12 P1-only cubic clauses remain: TEN use three original remaining cells; TWO use four including center top, which the projected quota sets P1. The intersection of their 18-variable support sets is EMPTY. Hence no ONE additional nontrivial fixed-eigenvalue Pauli-Z string can contradict all 12 at once, if its contradiction must be logically witnessed solely by literals fixed by each clause.

For NEW additional ONE-BODY Pauli Z checks \`x_j=v\` only, static exact 12-clause coverage requires MINIMUM **four** fixed pair variables. One conditional witness: \`x0=0,x4=1,x10=0,x11=0\`. The independent second checker tested ALL 7,177 possible partial assignments fixing 0,1,2,3 variables (1+36+612+6528), none covers all; the four-check witness annihilates every remaining signed cubic. It also checked 49,152 direct physical matched P0/P1 projector equalities in 4,096 conditional static assignments, zero mismatches. **This minimum is only a static restricted stabilizer-certificate lower bound, NOT a player-move count, defender resources, minimum of general multi-body stabilizer sets or general gameplay WDL.**

Evidence:
\`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_CANONICAL44444_12_MATCHED_PAULI_DUALS_4CHECK_7177_STATIC_0_1.json\`.

## 5. Decisive actual game online nonclosure (negative physical test)

The chosen conditional four-check witness requires lower cell (c0,r0) owner P0. Genuine standard first-win-free canonical \`44444\` has P1 to move and original literal column1 empty; P1 may legally make ply6 action col1, giving true original first-win-free prefix \`444441\` and permanently owning c0,r0. Source requirement \`x0=0\` is then impossible under ALL subsequent continuations; no P0 legal reply can repair it. This refutes THIS static certificate as an opponent-universal defended class without refuting other future conditional stabilizer rewrites. Physically confirmed on all 69 original geometric lines with strict stopping.

Evidence:
\`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_CANONICAL44444_FOUR_PAULI_STATIC_ONLINE_CLOSURE_FALSE_0_1.json\`.

## 6. Exact verdict / boundaries

**New rigorously derived (scoped) mathematical structure:** no hidden unconditional LINEAR owner stabilizer over complete original 42 gravity shuffles; exact Pauli 69-line decomposition; exact conditional 18-check rank reduction; exact 12 identical signed-cubic duals with original P0-before-P1 gravity precedence; restricted four-onebody static stabilizer certificate complexity. ALL tested ONLY W7,H6,K4. These are algebraic and geometric results, with independently corroborated original physical controls, not an original unrestricted perfect-play outcome theorem.

**Historical mechanism reproduced, not new strategic coverage:** 18 direct split blocker + 12 same-projector, causally vetoed P1 lines + 12 remaining, reflecting preexisting original support-mirror research. No source proof of canonical \`44444\` WDL, no source best literal action, no new empty-root WDL classifier, no claim of quantum speedup and no new exact search-engine node cutoff. Original 7x6 first-win stopping is never replaced by an arbitrary completed-owner coloring.

## 7. Next owner-scoped mathematical experiment

Do NOT generalize to strange board sizes or connection lengths. Focus ONLY on ORIGINAL rank5 \`44444\` and additional genuine first-win-free original7x6 q:

1. Seek an **observation-conditioned MOVING stabilizer / ZH diagram normal form**: after each legal P1 attacker action a, source algebra rewrites a small set of candidate guarded source parity/ownership constraints into new legal conditions that P0 can ENFORCE using one actual move response b, with all original antichain R0/R1 cofactor guards and any previous first-win terminals. Do not require untenable fixed owner signs on currently opponent-playable cells.
2. The formal desired operator-safety identity is \`(I-P_I) T_(D,R(q,a)) T_(A,a) P_I =0\` for all legal observed a, interpreted on proper original q and guarded terminals, with a source-defined \`P_I\` and response rule. It is INCOMPLETE until one invariant class is proved inductive for unrestricted future original adversarial play. No QBF/BDD/policy-tensor game-tree contraction disguised as a source certificate.
3. Begin by identifying **which of the 12 remaining signed cubic original P1 obligations can be eliminated by ONE new *legal guarded response* mechanism**, rather than fixing a future cell's owner statically. Freeze mathematical source before physical tests and compare exact same original q with the strongest existing support-mirror/nonbijective source. A novel WDL or best-action certificate beyond prior source would be a genuine advance; representation equivalence alone is not.
4. If this fails, preserve the exact original observer move, required stabilizer sign, physical response illegality, and missing resource; report INCOMPLETE. Continue building falsifiable theorems, not extending dimension scope to simplify the problem.

**Engine optimization secondary:** 352 Pauli terms and 12 projected cubic clauses can encode cheap symbolic metadata, but their value is in possible guarded proof derivation. Until a novel original7x6 mathematically certified node bound/action appears, no solver performance claim or code integration is authorized.

**Project governance:** write canonical research only to \`research/semantic-quotient\`, keep qualified IsoGraph1.2 and production solvers unmodified; maintain external-formal-verifier NOT RUN and candidate-vs-authority distinction.
