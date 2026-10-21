# Source-only 7x6 proof search using the historical 28 as holdout: seven-line packing, unique eight-blocker core, and residual Fourier mode

Date 2026-10-20 Pacific. Canonical Connect4 research/semantic-quotient. Research direction Josh Oshiro. Status: EXACT CONDITIONAL source geometry and independent original legal-path falsifiers, NOT a new proof that Player0 forces a win from EMPTY.

## Why the historical 28 may be used without circularity

The external historic 28 original P0 terminal K4 line identities arose from DISTANCE-SENSITIVE strong perfect play (P0 fastest win, P1 longest resistance). An earlier WDL-only tie relation produces61 line identities. Neither 28 nor firstfive CENTER and ply41 firstwinner may be postulated as NECESSARY consequences of original geometry if attempting a new, solver-independent root WDL proof. They are useful targets for conjecture discovery and independent validation. The final certificate must be created and proven from original 69 K4 windows, actual shared-cell four-way H/V/R/F owner gluing, gravity, turn order and firstwinner without solved labels.

## Conditional source terminal geometry T28

Take only two clearly stated historical output guards: original first five moves in center column4 with P0/P1/P0/P1/P0 ownership, and first P0 win on absolute ply41. P1 center physical cells (4,2),(4,4) block any P0 K4 containing them; eligible last landing set F13 consists of physical top row6 all seven columns plus row5 all columns except center (4,5), already P0-owned. Independently enumerate original all69 unwrapped K4 windows, keep those avoiding fixed P1 center sites and intersecting F13: exactly28 original K4 windows. This agrees with the historical 28 label list only when checked AFTER the source calculation.

## Seven disjoint original K4s require at least seven blocker sites, and seven suffice

Explicit pairwise DISJOINT original candidate K4s: six vertical K4s in columns1,2,3,5,6,7 (rows2..5 except column7 rows3..6), plus horizontal row6 columns2..5. They occupy28 distinct physical cells. Consequently ANY static P1 site transversal hitting all28 needs at least seven cells. A seven-cell original transversal exists:
  (1,3),(3,4),(5,4),(2,5),(6,5),(7,5),(4,6).
Every one of the28 T windows intersects this set. Therefore the unrestricted STATIC transversal number is exactly7. This is a constructive original geometric hypergraph duality certificate, not a strategic response guarantee.

## Unique eight-site core if blockers are restricted to potential FINAL landing sites

For the F13-restricted static blocker variables X_e, define for each candidate T28 window L the source clause OR_(e in L intersection F13) X_e. The AND of these28 clauses simplifies EXACTLY as a Boolean polynomial to the product of the eight variables at

  C8={(1,5),(2,5),(3,5),(5,5),(6,5),(7,5),(3,6),(5,6)}.

The six noncenter vertical K4 windows running rows2..5 each contain exactly ONE F13 site (c,5), forcing all six row5 cells. Two diagonals [(2,3),(3,4),(4,5),(5,6)] and [(3,6),(4,5),(5,4),(6,3)] each contain exactly one F13 site, forcing (5,6),(3,6). Every remaining T28 window contains at least one of these C8 sites, so all other clauses become REDUNDANT once those eight are selected.

Independent brute force of only2^13=8192 STATIC F13 subsets finds exactly32 hitting subsets; counts by size8..13 are1,5,10,10,5,1, the binomial coefficients for five independent OPTIONAL sites. So the eight core is uniquely mandatory for this specific F-only static defense. This is NOT a theorem that P1 must occupy these eight particular cells in actual game play; it can block K4 lines by occupying sites OUTSIDE F13 much earlier, or firstwin itself.

## Stronger exact interference mode relation: 28=18+8+2 and 27=18+8+1

Independently generate the original full69 rational signed line-syzygy kernel31, source18 four-step physical dipole cycles, and historic-condition source T28 label projection. Let C_T be the projection of original source cycle18 onto the 28 line coordinates; rank18. Let J_C8 be the 8-by-28 physical line-incidence star matrix of the UNIQUE C8 mandatory late sites; rank8. They intersect trivially in rational line-coordinate space. Thus rank[C_T;J_C8]=26. The physical star signals of the other five optional F13 sites increase the joined rank by only TWO, to28:

  28 =18 source-cycle directions +8 compulsory late-blocker site-star directions +2 residual optional-site quotient directions.

This exact result holds over Q as well as GF2 and prime finite fields1009 and1013. Horizontal reflection decomposes source C_T as8 even+10 odd, C8 site-star as4 even+4 odd, their direct-sum26 as12 even+14 odd, and whole terminal28 as14 even+14 odd. Both remaining terminal modes are REFLECTION EVEN. The terminal line-graph difference eliminates one UNIFORM even line coordinate that does NOT lie in the first26, leaving exactly ONE nontrivial even relative coordinate:

  27 =18 source-cycle directions +8 compulsory late-blocker site directions +1 reflection-even nonuniform relative remainder.

The last remaining scalar is a useful algebraic HYPOTHESIS for dynamic perfect-play incompatibility, not an established WDL index or forcing law. Full source 31=18+13 original base-gluing quotient is a DIFFERENT decomposition: never conflate the C8 eight defensive stars with unrelated earlier eight-dimensional additive-source modes, or identify similarly sized spaces without a proven map.

## Exact negative control: even five CENTER moves do not prevent legal draws

The original source geometry admits TWENTY-SIX distinct vertically alternating owner phase patterns with P0 at center bottom, each yielding a PHYSICALLY LEGAL, firstwin-free full42-move DRAW with initial moves 44444 (one-based physical columns). Concrete witness:

  444443333337777774111111222222555555666666

Proof independent of any Connect Four game solver: choose one of the26 original K4-free vertically alternating full column owner colorings with center bottom P0 (for the witness, bottom phase pattern 0010001, 0=P0,1=P1). Play the first five center moves; fill all six-cell P1-bottom columns one column at a time, giving six alternating legal moves per column; then take the final center cell as P1; finally fill the other six-cell P0-bottom columns. Every prefix of a final K4-free owner coloring is K4-free, so every move respects original firstwinning stop. A pure Python original full69 physical checker independently replayed every one of26 words and all42 moves.

Thus the static 28 K4 set is NOT unavoidable under every legal continuation, even with firstfive-center prefix; Player0 can choose inferior continuations that draw. That does not contradict published perfect Player0 WIN. It shows why the sought theorem must be a perfect-control/adaptive opponent constraint, not static prohibition of all draw colorings.

## The exact remaining solver-independent proof obligation

Derive from the actual EMPTY original board a sound ONLINE defensive-capacity invariant from four-way junction owner-phases, original K4 residual grade2/1 constraint hyperedges, gravity/turn parity and firstwinner. Prove that P0 can force its adaptive violation without relying on externally solved optimal move lists or the T28 support as a premise. The known 28 and conditional C8/one residual-even-mode structure can guide the search but must serve as held-back tests of any putative self-standing certificate.

Relevant outside formal methods (not as solved-game input): original mathematical odd/even threat and paired response rules in Victor Allis, A Knowledge-Based Approach of Connect-Four (1988), and modern strong positional-game pairing/Hall-style hypergraph theorems, potentially symbolic Boolean/polynomial fixed-point certificate systems. Allis established exact local rules but its complete 7x6 conclusion also used search, so its actual game-solved value cannot be reintroduced to claim a new source proof.

## Files and qualification

Pre-experiment frozen scope: docs/research/2026-10-20-frozen-root7x6-independent-certificate-T28-holdout-constructive-draw-and-owner-hypergraph.md
Source-only Node reproducer: research/isograph/discovery/2026-10-20-root7x6-proof-without-oracle/verify-conditional28-static-hitting8-and-center5-legal-draw26.mjs
Machine evidence: research/isograph/discovery/2026-10-20-root7x6-proof-without-oracle/CONDITIONAL28_MIN_BLOCK7_FORCED_LANDING8_SOURCE18_PLUS8_PLUS2_CENTER5_26_LEGAL_DRAWS_0_1.json

Checks: independently executed pure-Python original K4 26 complete legal draw witnesses, all8192 restricted F subsets, exact7 line packing and static7 transversal, SciPy MILP static blocker crosschecks, original four-step cycle 18 basis and exact SymPy rank plus GF2/prime field checks. Committed Node source not run as exact checked-in bytes under maintained Node26 CI; external formal proof assistant not run. Qualified IsoGraph1.2 and production solvers unchanged. Root solver-independent P0-WIN certificate remains OPEN.
