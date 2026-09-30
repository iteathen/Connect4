# IsoMax OOO Pair-Delta Coordinate Ladder — Research Interpretation 0.1

**Status:** EW-RS-070 complete; DELTA_SIGN_TRIANGLE selected by the frozen candidate order  
**Date:** 2026-09-30  
**Scope:** 6x3-k3, 4x5-k4, 6x3-k4 discovery carriers  
**Holdouts:** EW-RS-059 PRIMARY 3x6-k4 and BACKUP 5x3-k4 remain sealed.

## Evidence

Workflow run 36749062911 completed successfully through:

1. pair-delta unit semantics;
2. three-carrier structural/scalar audit;
3. independent result verification;
4. Research Integrity;
5. evidence publication.

Frozen evidence:

- `EXPERIMENTAL_WARRANT_RS_070.json`
- `ooo-exchange-circuit-lib.mjs`
- `ooo-exchange-circuit-lib.test.mjs`
- `OOO_PAIR_DELTA_COORDINATE_LADDER_0_1.json`
- `OOO_PAIR_DELTA_COORDINATE_LADDER_RESULT_VERIFY_0_1.json`

## Selected common coordinate

The frozen order was:

1. DELTA_SUPPORT_TRIANGLE
2. DELTA_PARITY_TRIANGLE
3. DELTA_SIGN_TRIANGLE
4. DELTA_ABS_MAG_TRIANGLE
5. DELTA_SIGNED_PARITY_TRIANGLE
6. DELTA_SIGNED_CLIPPED_MAG_TRIANGLE
7. DELTA_EXACT_TRIANGLE

The first candidate exact on every declared hard carrier is

[
oxed{	ext{DELTA_SIGN_TRIANGLE}.}
]

For every unordered pair among the three selected motif vertices:

- retain which token coordinates changed;
- retain the sign of each change;
- discard exact magnitude.

The triple key is the sorted multiset of the three signed-support pair signatures.

## Results

| carrier | exact-delta rank | signed-support rank | scalar image dim | contradictions |
| --- | ---: | ---: | ---: | ---: |
| 6x3-k3 | 75 | 70 | 1 | 0 |
| 4x5-k4 | 283 | 283 | 2 | 0 |
| 6x3-k4 | 16 | 16 | 2 | 0 |

Thus exact signed magnitudes are not required by the tested scalar map.

### 6x3-k3

All frozen candidates are scalar-exact.

The selected sign carrier reduces structural rank from 75 to 70.

Support alone is already sufficient here, but this does not transfer to 4x5-k4.

### 4x5-k4

This carrier is the discriminator.

- support only: rank 245, 9 contradictions;
- parity only: rank 244, 9 contradictions;
- sign only: rank 283, 0 contradictions;
- unsigned absolute magnitude: rank 245, 9 contradictions;
- signed parity: rank 282, 0 contradictions;
- signed clipped magnitude: rank 283, 0 contradictions;
- exact signed magnitude: rank 283, 0 contradictions.

Therefore neither changed-coordinate support, parity, nor unsigned magnitude carries the two-bit scalar image on this carrier.

The direction/sign of structural exchange is load-bearing.

### 6x3-k4

All frozen candidates are scalar-exact, including support-only.

This is important because the carrier is horizontal-only under EW-RS-071. The same signed-exchange vocabulary remains valid without V or D winning-line channels.

## Exact and bounded deductions

### Bounded common factorization

[
oxed{
	ext{OOO scalar residue factors through signed coordinate support of the pair-delta triangle on all three hard carriers.}
}
]

### Magnitude non-necessity in the tested corpus

Because DELTA_SIGN_TRIANGLE is obtained from exact signed deltas by deleting magnitude and remains exact:

[
oxed{
	ext{exact pair-delta magnitude is scalar-redundant in the declared discovery corpus.}
}
]

This is bounded evidence, not a universal theorem.

### Sign versus magnitude

4x5-k4 supplies the sharp separation:

[
	ext{ABS_MAG fails},qquad 	ext{SIGN passes}.
]

So the scalar query distinguishes structural exchange direction that is erased by unsigned magnitude.

### Signed parity clue

DELTA_SIGNED_PARITY_TRIANGLE is also exact on every carrier, with ranks 73, 282, 14.

This is not selected under the predeclared order, but it shows that the exact sign carrier contains further redundancy and that even-magnitude changed coordinates can be omitted under this alternative realization.

Because SIGN and SIGNED_PARITY are not ordered by a single information lattice in the frozen experiment, no global minimality conclusion follows.

## Relation to the orientation detour

EW-RS-071 rejected H/V/D as the common source of OOO.

EW-RS-070 now identifies a common carrier that survives both:

- mixed-orientation carriers; and
- horizontal-only 6x3-k4.

The stronger current structural lead is therefore:

[
oxed{
	ext{directional support/release exchange}
}
]

rather than winning-line orientation class.

## Open questions

1. Which signed token families are actually load-bearing: width W, role-capacity coordinates C_i, owner-0 depth coordinates D0_d, owner-1 depth coordinates D1_d?
2. Can exact role/depth indices be reduced to family, parity, or relative-order information without scalar loss?
3. Why is signed parity exact even where unsigned parity is not?
4. Can the signed exchange carrier be reduced outcome-independently to a compact structural quotient whose scalar image has the known dimensions 1/2/2?
5. Can that quotient yield two closed structural syndromes before any EW-RS-059 holdout is unsealed?

## Interpretation guard

No individual signed-delta key or coefficient is promoted as an invariant law.

No Q-A/Q-F, standard-7x6, universal cubic, or center-opening claim follows.

EW-RS-059 remains sealed.
