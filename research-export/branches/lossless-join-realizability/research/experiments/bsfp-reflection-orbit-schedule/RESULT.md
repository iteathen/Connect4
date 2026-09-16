# BSFP horizontal-reflection orbit qualification

**Status:** completed reference semantic qualification; CUDA integration not yet attempted.

**Research direction:** Josh Oshiro.

**Target:** `BSFP_REFLECTION_ORBIT_SCHEDULE.md` (unregistered hypothesis; no canonical claim ID yet).

## Scope

This is a variable-geometry result. The engine is parameterized by board width `W`, height `H`, and connect target `K`; 7x6 connect-4 is only one profile used for concrete census examples.

Horizontal reflection is an automorphism of every rectangular `W x H` Connect-K geometry. Nothing in the semantic theorem depends on 42 cells, 69 lines, or Connect-4 specifically.

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

After the solve, every raw-support frontier is reconstructed from its canonical representative and compared exactly with the unquotiented frontier set.

Reflection-fixed supports are separately checked for frontier-set invariance.

## Oracle / authority

The authority is the same exact ownership-antichain BSFP recurrence evaluated without the symmetry quotient. This is differential property evidence, not an independent solver oracle.

No solved database, minimax/Negamax result, or opening knowledge is consumed.

## Results

The pair-product counters below were independently rechecked after the first draft of this note; the original draft understated them. The semantic result was unchanged.

| Board | Raw supports | Reflection-orbit supports | Support reduction | Full pair candidates | Quotient pair candidates | Pair reduction | Frontier mismatches | Fixed-support invariance failures |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 4x3 c3 | 256 | 136 | 46.88% | 11,697 | 6,284 | 46.28% | 0 | 0 |
| 4x4 c4 | 625 | 325 | 48.00% | 33,427 | 17,884 | 46.50% | 0 | 0 |
| 5x3 c4 | 1,024 | 544 | 46.88% | 21,014 | 11,187 | 46.76% | 0 | 0 |

Reflection-fixed support counts in the controls were 16, 25, and 64 respectively; every one had a frontier set closed under reflection.

## Generic support-orbit formula

A support is a width-`W` vector of column heights in `0..H`, so:

```text
raw supports N = (H + 1)^W
```

A support is reflection-fixed exactly when mirrored column heights agree. Therefore the number of free height coordinates is `ceil(W/2)`:

```text
fixed supports F = (H + 1)^ceil(W/2)
```

Burnside for the two-element reflection group gives:

```text
support orbits O = (N + F) / 2
```

This formula applies to both odd and even widths.

## Generic directed-edge formula

A directed support edge chooses:

- one action column;
- a non-full height `0..H-1` for that column;
- arbitrary heights for the remaining columns.

Therefore:

```text
raw directed support edges E = W * H * (H + 1)^(W - 1)
```

A directed edge can be reflection-fixed only when the action column itself is fixed by reflection.

Thus:

```text
if W is even:
    fixed directed edges = 0

if W is odd:
    fixed directed edges = H * (H + 1)^floor(W/2)
```

and:

```text
directed edge orbits = (raw edges + fixed edges) / 2
```

This is an exact schedule reduction independent of game value.

## Standard 7x6 example

For `W=7`, `H=6`:

```text
raw supports = 7^7 = 823,543
fixed supports = 7^4 = 2,401
support orbits = 412,972
```

This removes 410,571 duplicated support occurrences, a 49.854% exact schedule reduction.

For directed support transitions:

```text
raw edges = 7 * 6 * 7^6 = 4,941,258
fixed edges = 6 * 7^3 = 2,058
edge orbits = 2,471,658
```

That is a 49.980% exact reduction in support-transition occurrences before any frontier compression.

The static 69-line / 36-line-orbit count is specific to this geometry and must not be treated as a universal engine constant.

## Line and residual symmetry

Winning lines and support-local residual terms should be transformed by the geometry's precomputed reflection permutation, not by hardcoded standard-board IDs.

For a variable-size engine, derive per geometry:

```text
cell reflection map
winning-line reflection map
support-local residual reflection map
optional global residual/WSL reflection map
```

A reflected support has a bijectively reflected residual vocabulary.

For a reflection-fixed support, an additional internal quotient of line/residual/frontier record orbits may be possible, but that is a separate reduction. One must not infer that every asymmetric representative support can simply process half of its lines internally.

## Reassessment

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
player stone counts
ownership cardinality
subset order
terminal incidence
```

so it commutes with the exact rank-slice reduction qualified separately in `../bsfp-feasible-slice-recurrence/RESULT.md` for any rectangular geometry.

These reductions attack different multiplicities:

```text
reflection quotient:
    duplicate support occurrences

rank-slice quotient:
    impossible ownership records inside each occurrence
```

They should therefore be tested together rather than treated as competing representations.

## CUDA relevance

The current `packed42` CUDA path is one representation profile, not the semantic engine boundary.

A geometry-generic CUDA schedule needs, per canonical support/action edge, only enough orientation information to locate and lift the canonical child:

```text
canonical child ID
reflection flag
physical/canonical landing-column mapping
```

The ownership mask representation may use one, two, or more machine words depending on `W*H`; reflection remains a fixed bit permutation for the selected geometry.

Do not duplicate the reflected support as a second solved item merely to avoid the transformation.

## Falsifiers retained

- any reconstructed raw-support frontier differs from the unquotiented authority;
- a reflection-fixed support's exact frontier is not setwise reflection-invariant;
- action/terminal provenance required by the output contract cannot be reconstructed from representative + orientation;
- an asymmetric root constraint is quotient-canonicalized without including its transformed constraint context;
- a geometry-specific packed representation is accidentally promoted to universal solver semantics;
- CUDA orientation overhead erases the workload saving (performance-only falsifier).

## Reproduction

Run:

```text
node research/experiments/bsfp-reflection-orbit-schedule/reference-orbit-qualification.mjs
```

A semantic mismatch sets a failing exit code.

## Disposition

**Supports** horizontal-reflection support-orbit quotienting strongly enough to advance to a combined reflection + rank-slice BSFP qualification and then a geometry-generic CUDA schedule experiment.
