# BSFP horizontal-reflection orbit qualification

**Status:** completed reference semantic qualification; CUDA integration not yet attempted.

**Research direction:** Josh Oshiro.

**Target:** `BSFP_REFLECTION_ORBIT_SCHEDULE.md` (unregistered hypothesis; no canonical claim ID yet).

## Question

Can an empty-root BSFP solve store and evaluate only one support from each horizontal-reflection orbit, lifting canonical child frontiers through an orientation bit when needed, without changing any exact frontier semantics?

## Method

For each complete small-board support lattice, run:

1. an unquotiented ownership-antichain BSFP solve over every support;
2. a quotient solve over lexicographically canonical horizontal-reflection representatives only.

For a representative parent support and legal action:

```text
childRaw = parent + action
childCanonical, reflected = canonicalize(childRaw)
```

The quotient solver loads the canonical child frontier and reflects every ownership mask back to `childRaw` coordinates when `reflected` is true before applying the ordinary cofactor / terminal / aggregation recurrence.

After the solve, every raw support frontier is reconstructed from its canonical representative and compared exactly with the unquotiented frontier set.

Reflection-fixed supports are separately checked for frontier-set invariance.

## Oracle / authority

The authority is the same exact ownership-antichain BSFP recurrence evaluated without the symmetry quotient. This is differential property evidence, not an independent solver oracle.

No solved database, minimax/Negamax result, or opening knowledge is consumed.

## Results

| Board | Raw supports | Reflection-orbit supports | Support reduction | Full pair candidates | Quotient pair candidates | Pair reduction | Frontier mismatches | Fixed-support invariance failures |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 4x3 c3 | 256 | 136 | 46.88% | 10,147 | 5,550 | 45.30% | 0 | 0 |
| 4x4 c4 | 625 | 325 | 48.00% | 20,251 | 11,202 | 44.68% | 0 | 0 |
| 5x3 c4 | 1,024 | 544 | 46.88% | 15,744 | 8,313 | 47.20% | 0 | 0 |

Reflection-fixed support counts in the controls were 16, 25, and 64 respectively; every one had a frontier set closed under reflection.

## Standard 7x6 exact census

A support is a seven-column height vector with each height in `0..6`:

```text
raw supports = 7^7 = 823,543
```

A support is reflection-fixed iff:

```text
h0=h6
h1=h5
h2=h4
```

with `h3` free, so:

```text
fixed supports = 7^4 = 2,401
```

Burnside gives:

```text
support orbits
= (823,543 + 2,401) / 2
= 412,972
```

This removes 410,571 duplicated support occurrences, a 49.854% exact schedule reduction.

The raw directed support graph has:

```text
7 columns * 6 non-full heights * 7^6 other-height choices
= 4,941,258 directed legal support transitions.
```

A directed support edge is reflection-fixed only when the support is fixed and the action is in the center column. There are:

```text
6 center heights below full * 7^3 mirrored-pair choices
= 2,058 fixed directed edges.
```

Therefore:

```text
directed edge orbits
= (4,941,258 + 2,058) / 2
= 2,471,658.
```

That is a 49.980% exact reduction in support-transition occurrences before any frontier compression.

At the static geometric line level, 7x6 has 69 winning lines and only the three center-column vertical lines are reflection-fixed, giving 36 geometric line orbits. This does **not** mean every asymmetric representative support may process only 36 lines internally; line equivalence is generally between a support occurrence and its mirrored support occurrence. Internal line-pair reuse is automatically valid only where the support/context itself is reflection-fixed or the selected operation is explicitly canonicalized across the orbit.

## Reassessment

The symmetry candidate has moved beyond a generic "halve the board" observation.

The exact object to quotient is:

```text
support occurrence + orientation
```

not individual columns or lines in isolation.

The resulting rule is:

```text
solve canonical support representative once
store exact orientation metadata
reflect masks/actions when crossing an orbit boundary
```

This retains physical output provenance while avoiding duplicated semantic work.

## Interaction with feasible-slice pruning

Horizontal reflection preserves:

```text
support rank
side to move
P0 stone count
ownership cardinality
subset order
terminal incidence
```

so it commutes with the exact rank-slice reduction qualified separately in `../bsfp-feasible-slice-recurrence/RESULT.md`.

These reductions attack different multiplicities:

```text
reflection quotient:
    duplicate support occurrences

rank-slice quotient:
    impossible ownership records inside each occurrence
```

They should therefore be tested together rather than treated as competing representations.

## CUDA relevance

A CUDA schedule needs, per canonical support/action edge, only enough orientation information to locate and lift the canonical child:

```text
canonical child ID
reflection flag
physical/canonical landing-column mapping
```

The mask reflection itself is a fixed bit permutation and can be precomputed/mapped by cell, line, and residual IDs.

Do not duplicate the reflected support as a second solved item merely to avoid the transformation.

## Falsifiers retained

- any reconstructed raw-support frontier differs from the unquotiented authority;
- a reflection-fixed support's exact frontier is not setwise reflection-invariant;
- action/terminal provenance required by the output contract cannot be reconstructed from representative + orientation;
- an asymmetric root constraint is quotient-canonicalized without including its transformed constraint context;
- CUDA orientation overhead erases the workload saving (performance-only falsifier).

## Reproduction

Run:

```text
node research/experiments/bsfp-reflection-orbit-schedule/reference-orbit-qualification.mjs
```

A semantic mismatch sets a failing exit code.

## Disposition

**Supports** horizontal-reflection support-orbit quotienting strongly enough to advance to a combined reflection + rank-slice BSFP qualification and then a CUDA schedule experiment.
