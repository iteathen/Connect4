# Empty 6x6 versus 7x6 four-way junction overlay: exact width-seven defensive phase incompatibility

Research date 2026-10-20 Pacific. Research direction: Josh Oshiro. Canonical iteathen/Connect4 research/semantic-quotient. **Research geometry theorem with exact original K4 source checks; NOT a new empty-root signed WDL theorem.** This study was frozen before independent controls in docs/research/2026-10-20-frozen-empty-6x6-7x6-fourway-Fourier-owner-phase-defensive-boundary.md. Do not inject the historical 28 terminal lines or solved-game values into any source producer.

## 1. Correct actual EMPTY-board four-way Fourier tensor

At every original physical cell e, the H,V,rising,falling ribbon appearances are aliases for ONE actual site, not four individually playable locations. The source actual ownership state s is 0=EMPTY,1=P0,2=P1. Under a NORMALIZED 4-leg ternary/Z3 DFT with ω=exp(2πi/3), the single known-state physical junction tensor transforms to

  Ĉ_s(k_H,k_V,k_R,k_F) = (1/9) ω^[s(k_H+k_V+k_R+k_F)].

(The exponent sign is conventional, fixed throughout a given transform.) **Every one of 81 possible k-tuples is nonzero with amplitude magnitude1/9** for an actually EMPTY physical cell, or for a known P0/P1-owned cell. Placing an actual stone changes the complex phase, not the support, of its individual tensor.

In contrast, the UNWEIGHTED EQUALITY/COPY tensor that sums over ALL THREE possible owner states s=0,1,2 has

  Ĉ_all(k) = sum_s Ĉ_s(k) = (1/3)*1[k_H+k_V+k_R+k_F ≡0 mod3],

so 27 nonzero tuples with amplitude1/3 and54 exact cancellations out of81. This is the previously documented local conservation law, but it is NOT the Fourier transform of the known-EMPTY actual cell. Equating these was an earlier interpretation error. A dynamical phase-change claim therefore requires contracting junctions with the true original H/V/diagonal winning-window constraints, gravity/turn feasibility and opponent response; it cannot follow solely from counting the per-site 27/54.

Independent exact charge-mod3 enumerations and floating-root-of-unity controls on all81 tuples verified local known state amplitude1/9 in all three source states, and potentiality-summed27/54 with max floating error3.47e-17. Both 6x6 and7x6 have the SAME local ternary rule; total physical junction counts are36 versus42.

## 2. Source dimensions and a canonical width extension of nine dependencies

Original 6x6 K4:
  36 physical junctions, 34 finite strands, 144 true strand appearances,22 win-bearing strands.
  54 original K4 windows = H18+V18+rising9+falling9.
  Rational original cell-line incidence rank32, line syzygies22 =12 four-step dipole cycles+10 source base-gluing.
  Binary GF2 incidence rank29 and line syzygies25.
  32 four-step dipoles,16 genuine mod4 residue components,12 dipole cycles.

Original 7x6 K4:
  42 physical junctions, 37 finite strands,168 true appearances,25 win-bearing strands.
  69 original K4 windows = H24+V21+rising12+falling12.
  Rational incidence rank38, line syzygies31 =18 four-step dipole cycles+13 source base-gluing.
  Binary GF2 incidence rank35 and line syzygies34.
  44 four-step dipoles,16 mod4 residue components,18 dipole cycles.

Inclusion of the first six original columns embeds all 54 ORIGINAL 6x6 K4 line coordinate vectors in the true 7x6 69-line system, preserving the rational line-incidence kernel K6 (dimension22) inside K7 (dimension31).

Adding the seventh column adds SIX new original physical sites and FIFTEEN K4 windows: SIX horizontal windows (one per row), THREE vertical, THREE rising and THREE falling. Each of the six new horizontal windows contains a DIFFERENT new-column site, so modulo the original 6x6 physical-cell span they form six independent new directions. Exact rational ranks: original 54-window incidence32, original54+new six H windows rank38, ALL69 rank38. Thus all nine newly introduced V/R/F windows are dependent on the old54 plus the newH6. Their nine original line-coordinate coefficients naturally parameterize K7/K6. In exact sequence terms:

  0 -> K6 (22) -> K7 (31) -> Q^9 (new three V + three R + three F labels) -> 0.

The six additional four-step cycle relations and three additional base-gluing relations account for all nine, with a separate rational 18-cycle projection to those nine new V/R/F label coordinates having rank6, and rank2 on each three-label orientation block V, rising, falling. This is a TRUE source geometry boundary/coupling, not a coincidence involving the solved terminal 28.

## 3. The actual four-way directional coincidence collapses to TWO parity tests

A precise, physically grounded RESTRICTED ownership potentiality subspace assumes every completed column alternates P0/P1 from bottom to top. Let ε_c∈{+1,-1} be the bottom owner phase of column c. All four orientation appearances of each actual cell carry SAME owner sign

  s(c,r) = (-1)^r ε_c.

This must be identified as a hypothetical complete coloring/defense family, not a claim that all legal/perfect games have this form.

Vertical K4 predicates are automatically nonmonochromatic. Consider any four-consecutive-column span j,j+1,j+2,j+3. Under the physical four-way equality, an original horizontal four-line on this span is monochromatic exactly when its ε pattern is UNIFORM; a rising/falling original diagonal four-line on this span is monochromatic exactly when the same ε pattern is ALTERNATING. Thus there is a vulnerable source directional window exactly when either of the four ε patterns 0000,1111,0101,1010 occurs.

But these four patterns are precisely the solutions of two independent phase equations ε_j=ε_(j+2) AND ε_(j+1)=ε_(j+3). Define a_i=ε_i ε_(i+2). The exact Boolean/Walsh factorization is:

  Bad_j = (1+a_j)(1+a_(j+1))/4
        = (1+ε_j ε_(j+2))(1+ε_(j+1) ε_(j+3))/4.

Its FOUR nonzero Walsh coefficients on the four ε bits are all 1/4, for the empty subset, the two distance-two pairs (j,j+2) and (j+1,j+3), and their fourfold product. All other12 Walsh coefficients are exactly zero.

On an actual six-row board there are precisely twelve original H/R/F K4 lines over each such four-column span: six horizontal plus three rising plus three falling. If Bad_j=1 due to a UNIFORM pattern, all six horizontal windows are monochromatic; if due to an ALTERNATING pattern, all three rising AND all three falling diagonal windows are monochromatic. Thus EXACTLY SIX actual geometric K4 windows become monochromatic per vulnerable span in this full-occupancy potentiality model; no double-counting of line identities, no cyclic wrap. This is a direct six-row physical consequence of FOUR-WAY OWNER GLUING across directional systems, not three independent ribbon owner models.

Independent original 54/69 window enumeration against every 2^6=64 and 2^7=128 possible complete ε-assignments verified this factorization over 192 and512 span comparisons with ZERO errors; the counts of globally monochrome-K4-free phase profiles were respectively32 and52. Hence width7 has STATIC SAFE colorings despite the defense-class obstruction below.

## 4. Source exact defense cut: width6 is satisfiable, width7 is MINIMALLY unsatisfiable

To protect against ANY orientation of the defender's phase commitments, allow an opposite-phase pair of physical columns at distance2. Let m_i∈{0,1} mean columns i,i+2 (zero based) are committed as opposite-ownership pair. A commitment makes a_i=-1, forcing Bad_j=0 for any four-column window j that contains selected pair m_j OR m_(j+1).

**Each source four-column span imposes its obligation:**
  m_j OR m_(j+1) = 1.

**Actual PHYSICAL column reuse forbids two commitments with overlapping endpoint cells:**
  m_i*m_(i+2)=0.

This is a small exact Boolean factor graph induced by the four-way shared-cell/column overlay. Under its guard it is a stationary universal blocker certificate, not all arbitrary adaptive defender replies.

For width6, m_0..m_3 exist and there are three span obligations j=0,1,2 and two reuse exclusions i=0,1. There is exactly ONE satisfying assignment:

  (m_0,m_1,m_2,m_3)=(0,1,1,0),

i.e. one-based physical protective column pairs (2,4) and (3,5). For the16 possible phase assignments obeying these two opposite-pair commitments, ZERO yield ANY monochromatic original K4 in the entire six-row restricted column-alternating model.

For width7, m_0..m_4 exist, FOUR span obligations and THREE reuse exclusions. This seven-constraint Boolean system is UNSAT. A two-case HUMAN PROOF:

- If m_2=0, span obligations (m_1 OR m_2) and (m_2 OR m_3) force m_1=m_3=1. But these pairs share physical column3 and violate m_1*m_3=0.
- If m_2=1, nonreuse forces m_0=m_4=0. First and last span obligations then force m_1=m_3=1, again violating m_1*m_3=0.

An independent full truth-table check over32 possible m assignments verified UNSAT, AND found that deleting ANY of its four span constraints or three reuse exclusions restores at least one solution: the entire seven-constraint set is a MINIMAL UNSAT CORE. For width4/5/6 the numbers of fully covering disjoint matching selections are3/3/1, and for EVERY width>=7 zero because the 7-column unsatisfiable subgraph remains embedded.

If we optimally choose a maximal width7 disjoint matching m=(1,1,0,0,1), actual pairs one-based (1,3),(2,4),(5,7), exactly one four-column span remains unguarded. Of the16 phase assignments satisfying these three pairs, 12 avoid all original K4; FOUR violate the uncovered span and produce exactly SIX original monochromatic K4 windows. This is an exact failure of a UNIVERSAL defense guarantee, not a claim that all completions inevitably lose.

## 5. A SECOND simultaneous and source-proved width-six/seven boundary

The intersection of ALL original K4 four-column spans on width6 is the TWO center columns {3,4} one-based; on width7 it shrinks to the SINGLE center column {4}. General width-K common guard core size is max(0,2K-W) when K<=W<=2K. This same width7 transition invalidates a real online P1 source defensive strategy (Allis 1988), not just a static potentiality matching.

For K4 even six-row boards and width<=6, Allis's original P1 reply policy uses two common central columns and same-column upper mates outside, with a migration move at the central top. It is legal against EVERY P0 original action and prevents ALL P0 K4s; hence it provides an exact EMPTY-root source theorem P0 cannot force a win on6x6. This prior-art theorem is documented and its K-generalization proved in docs/research/2026-10-18-allis-central-two-column-general-k-even-height-nonwin.md. The two-center source policy does NOT extend to width7 since no center pair occurs in every horizontal/diagonal winning span. Absence of this particular defense is NOT proof all other adaptive P1 strategies fail.

As held-back solved-game cross-check only, independently published board outcomes give standard 6x6 a SECOND-player win on last move36, and standard 7x6 a FIRST-player win on move41. Source: ChristopheSteininger/c4 README board-size solved outcome and game length tables, https://github.com/ChristopheSteininger/c4 . The static pairing UNSAT boundary and loss of the two-center policy coincide with the change in solved outcome, but cannot claim to prove exact signed WDL: 7x5 is a DRAW and8x6 is P1 WIN despite the same or larger width7 static matching deficit.

## 6. What this genuinely establishes and what comes next

The user's suspected boundary has a precise, source-generated mathematical manifestation. A seventh column creates:
  - one extra four-column H/R/F obligation (three spans→four);
  - a seven-clause MINIMAL UNSAT subnetwork for an exact orientation-robust disjoint distance-two defender pairing family;
  - loss of two-common-center-column online P1 nonloss guarantee;
  - six physical new four-way junctions, fifteen original new winning windows, nine new signed source incidence relations (=six new four-step cycles+three base-gluing).

This is a meaningful FOUR-WAY INTERFERENCE GEOMETRY transition, despite every local junction continuing to obey the same ternary Fourier rules. It does not yet establish a universal source-only WDL determinator, because adaptive defensive response, actual gravity, turn parity, deadlines and FIRSTWIN can change outcomes even at the same width. A next nonsearch theorem must upgrade the static seven-constraint obstruction into a source proof that EVERY online actual P1 defense becomes unsatisfiable in original7x6 under perfectly played P0, or characterize a different source response invariant for boards such as6x6 P1 win and7x5 draw. Historic 28 P0 firstwinner lines remain held-back validation rather than source inputs.

Evidence scope: original source geometry symbolic proofs and independent exact modular/rational controls plus exhaustive restricted phase assignments, disjoint matchings, and minimal UNSAT core. The eight-owner-bit Hadamard junction rank-two correction is a separate equivalent Fourier basis; this test used the exact ternary basis and physical owner restriction, then the induced 4-bit Walsh phase sector. This is not a quantum dynamics theorem. Maintained Node26 CI and external proof assistant have not run; no qualified IsoGraph1.2 or production solver changes.
