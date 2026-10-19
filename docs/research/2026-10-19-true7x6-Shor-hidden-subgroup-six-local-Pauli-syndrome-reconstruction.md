# Exact Shor-style hidden-group syndrome completion from original 69 Connect4 line parities: just SIX local two-cell probes

**Date:** 2026-10-19. **Owner:** research/semantic-quotient, direction Josh Oshiro. **Scope:** ONLY original 7×6, K4 physical board. Pure source linear algebra / Fourier/quantum stabilizer syndrome analogy; not defensive obligation, not ordinary WDL search, not a quantum speedup, no nonstandard boards, no official IsoGraph authority promotion. **Status:** exact theorem with frozen independent original physical reconstruction falsifier pending.

## 1. Background: window parity has a 7D hidden subgroup

Let \`A∈GF2^{69×42}\` be original physical winning-line incidence, where a row corresponds to one of exactly 69 true length-four line windows. On any supplied COMPLETE binary owner field \`x∈GF2^42\`, the measured parity vector \`A x\` has rank35 over GF2 and therefore the equality class \`x+ker A\` has \`2^(42−35)=128\` members.

This is a mathematically valid Abelian hidden subgroup:
    H=ker(A),  g(x)=A x,  g(x+h)=g(x) for all h∈H.
But the map A is KNOWN and classically eliminable; no oracle advantage is implied. Also most hidden parity shifts change K4 monochromatic winning predicates, so H is NOT a Connect4 gameplay automorphism group.

## 2. New exact six-syndrome reconstruction theorem

Freeze SIX additional physically ADJACENT two-cell XOR measurements \`z_i=x_{a_i} XOR x_{b_i}\` on these ZERO-BASED original physical site IDs (row-major 7 columns):
    (0,1), (1,2), (7,8), (8,9), (0,7), (7,14).

They live inside the tiny bottom-left 3×3 physical patch: bottom two horizontal edges, the same two on row1, and two vertical edges in column0. Every pair is an actual adjacent physical-cell pair, not an invented K4 winline and not a move. The six are exactly the \`Z_a Z_b\` Pauli two-body correlation signs in the quantum-owner basis, or \`x_a XOR x_b\` in binary notation.

Let \`E∈GF2^{6×42}\` contain those six pair-incidence rows; let \`M=[A; E]\`. Source calculation on ORIGINAL 7×6 finds

    rank_GF2 A=35,
    rank_GF2 [A; E_first_i]=35+i for i=0,1,2,3,4,5,6,
    rank_GF2 [A;E]=41.

Therefore the common kernel of all 75 original parity/syndrome measurements has dimension **1** and equals the span of the all-one mask:
    ker([A; E])={0^42, 1^42}.

The global complement 1^42 remains invisible because all line/parity checks here have EVEN support (K4 or two cells). Adding ONE absolute physical-cell owner anchor \`x_0\`, e.g. owner of the bottom-left original cell, raises rank to42 and uniquely reconstructs the ENTIRE 42-bit physical binary owner field.

**Minimality:** rank A=35 so at least 6 ADDITIONAL independent linear binary observations are required to reach rank41, regardless of where measured. Thus this particular six-local-probe construction is *information-theoretically minimal* among all one-bit linear measurements if all we require is ambiguity up to global color complement. One seventh absolute owner bit is necessary to distinguish the P0/P1 swapped versions. The six probes and absolute owner anchor are NOT necessarily six physical game moves; they are algebraic measurements of a supplied complete binary coloring.

## 3. Exact decoding without game search

To reconstruct a supplied physical-color vector:
1. Compute the 69 original physical K4-window parities (not boolean WIN labels), six original two-cell parity checks, and one absolute owner bit.
2. Form 76 equations over GF2 in the 42 original unknown physical owner bits.
3. Run ordinary XOR Gaussian elimination once (precompute pivots/inverse from fixed original geometry), then solve by row combinations. The coefficient map has full column rank 42, so the solution is unique. No strategic future-game branching, no unknown WDL, no quantum hardware, no QBF game policy tensor is involved.

This is a true *representation-to-reconstruction equivalence* under the stated measurements, not a claim that 69 original K4-line WIN/LOSS predicates by themselves encode all 69 line parity measurements. A yes/no monochromatic check loses more information than \`Ax\`.

## 4. Genuine original game boundary

Original Connect4 positions are ternary \`empty/P0/P1\`, not simply 42 supplied binary owner bits; a complete board does have a binary owner field, but a nonterminal q needs a separate original physical occupancy mask and gravity heights, and a FIRST-WIN-STOPPED game outcome also depends on adversarial play. Unique reconstruction of a completed coloring under 76 linear observations does not classify root WDL, move priority, or ensure the coloring is from a legal alternating history.

The result identifies **which information the hidden subgroup measurement discards** and how to supply it with a MINIMAL LOCAL correlation completion. It is directly related to stabilizer quantum error-correcting syndrome measurement and to group-character/Fourier reconstruction. It is complementary to the earlier exact 168→42 full four-ribbon Fourier isometry (which never lost physical information), the real 69-window sum's four null directions and the rank10 directional-shift boundary curvature.

## 5. Freeze independent original-only falsification BEFORE reporting as qualified

- Independently reconstruct all 69 ORIGINAL K4 winning-line incidence rows and verify GF2 rank35.
- Verify each of six frozen actual nearest-neighbor two-site rows raises rank by EXACTLY1, ending at41; verify adding site0 absolute anchor makes 42.
- Verify all128 original hidden period masks satisfy ALL 69 original parity equations; after six constraints exactly two periods remain, 0 and all42 ones; after anchor only zero remains.
- Independently replay one REAL 42-ply gravity-legal first-win-stopped DRAW \`123456123456654321654321123456123456777777\` and construct 69+6+1 measurement syndrome. Decode physical 42 owner bits via separately written GF2 Gaussian elimination, exactly match original owner coloring with no mismatches.
- Test 42 one-hot bitvectors and multiple independently seeded supplied static 42-bit patterns with same decoder (not other board shapes), and confirm P0/P1 absolute anchor necessity by global complement collision.
- Preserve any failed measurement, rank or real game reconstruction. No new WDL/terminal-bonus claim; source theorem remains a mathematical geometry/measurement result.

**Current status:** frozen deductive theorem and physical controls PENDING. Exact strategy-free linear reconstruction is broader than defensive obligations and should be researched alongside representation theory, hidden subgroup and nilpotent boundary operators.
