# Support-local clause vocabulary qualification

**Status:** deductive recurrence invariant with complete differential-style control census.

**Research direction:** Josh Oshiro.

## Result

For the beneficiary-relative monotone-clause BSFP recurrence, every persistent clause at fixed support `S` belongs to the support-local dictionary

```text
D(S)
  = { {v} | v is occupied in S }
    union
    unique { lambda intersect S | lambda is a geometric winning line,
                                  lambda intersect S != empty }.
```

Therefore

```text
|D(S)| <= rank(S) + L(W,H,K),
```

where `L(W,H,K)` is the geometric winning-line count for the active variable geometry.

This is a semantic vocabulary bound. It does **not** require a fixed 42-cell board, 69-line universe, WSL-625 universe, or one-u64 implementation.

## Why it is closed under the recurrence

The recurrence introduces only two clause forms.

### Terminal winner prerequisite

If mover `p` wins by landing at `x`, the pre-existing requirement `q` is represented as singleton clauses:

```text
{ {v} | v in q }.
```

Every `v` is already occupied in parent support `S`, so each clause belongs to the singleton part of `D(S)`.

### First-win exclusion / blocker

The opponent may remain a possible winner only by owning at least one cell of each terminal-ready prerequisite `q`.

For a terminal-ready line `lambda`, all cells except landing cell `x` are already occupied, so

```text
q = lambda \ {x} = lambda intersect S.
```

Thus each blocker clause belongs to the geometric-intersection part of `D(S)`.

### Cofactor closure

Let child support be

```text
S' = S union {x}.
```

If beneficiary owns `x`, every clause containing `x` is satisfied and disappears; all other clauses are unchanged.

If opponent owns `x`, `x` is removed from every clause; an empty result kills that record.

For singleton clauses this yields either another parent singleton or disappearance/conflict.

For a geometric clause:

```text
(lambda intersect S') \ {x}
  = lambda intersect S
```

when `x` is on the line, and it is unchanged otherwise.

Thus cofactor maps `D(S')` back into `D(S)`.

### Move composition

Frontier union does not create clauses.

Universal/opponent composition conjoins clause records by taking the union of their clause sets. It also creates no new cell-set clause.

Normalization only removes duplicate or superseded clauses.

Therefore the dictionary invariant follows inductively over the complete backward recurrence.

## Qualification

Harness:

```text
research/experiments/bsfp-clause-vocabulary/qualify.mjs
```

The qualifier independently reruns the clause-frontier recurrence and fails on the first persistent clause not present in `D(S)`.

The following variable geometries were checked completely:

| Geometry | Supports | Winning lines | Persistent records | Clause occurrences | Max `|D(S)|` | Bound `WH + L` | Violations |
|---|---:|---:|---:|---:|---:|---:|---:|
| 3x3 c3 | 64 | 8 | 283 | 642 | 17 | 17 | 0 |
| 3x4 c3 | 125 | 14 | 1,088 | 3,231 | 26 | 26 | 0 |
| 3x5 c3 | 216 | 20 | 3,031 | 11,172 | 35 | 35 | 0 |
| 4x3 c2 | 256 | 29 | 1,459 | 2,400 | 41 | 41 | 0 |
| 4x3 c3 | 256 | 14 | 2,730 | 8,545 | 26 | 26 | 0 |
| 4x4 c3 | 625 | 24 | 14,410 | 62,594 | 40 | 40 | 0 |
| 4x4 c4 | 625 | 10 | 4,486 | 17,550 | 26 | 26 | 0 |
| 4x5 c4 | 1,296 | 17 | 21,474 | 101,009 | 37 | 37 | 0 |
| 5x3 c4 | 1,024 | 6 | 3,062 | 11,685 | 21 | 21 | 0 |
| 5x4 c4 | 3,125 | 17 | 60,657 | 284,515 | 37 | 37 | 0 |

Totals:

```text
supports checked:          7,612
persistent clause uses:  503,343
vocabulary violations:         0
```

The census is qualification evidence; the closure argument above is the reason the invariant generalizes beyond the tested controls.

## Execution consequences

### 1. Geometry-selected coverage width

A support-local clause coverage signature needs

```text
ceil(|D(S)| / backendWordBits)
```

words.

This may be one or two words on many supports/geometries, but that is a profile property, not solver semantics.

### 2. Precomputed clause poset

Because `D(S)` is support-fixed, precompute once per support/orbit:

```text
clause ID -> cell mask
clause ID -> upward-coverage signature
clause subset relation
cell -> clauses containing cell
```

The exact coverage representation then gives:

```text
record implication:
    A => B iff U(B) subseteq U(A)

record conjunction:
    U(A AND B) = U(A) union U(B).
```

### 3. Edge cofactor map

For every legal support edge `S -> S union {x}`, the child dictionary maps back into the parent dictionary under the exact clause cofactor.

A production profile may therefore precompute edge-local clause transformations rather than reconstruct variable cell sets in the hot recurrence.

The mapping must preserve the distinction between:

```text
beneficiary owns x:
    containing clauses are satisfied/deleted

opponent owns x:
    x is removed; singleton {x} kills the record.
```

### 4. Reflection composition

Horizontal reflection maps occupied singletons to occupied singletons and line intersections to reflected line intersections, so the clause dictionary is equivariant under the already-qualified reflection support quotient.

Dictionary IDs may therefore be canonicalized per support orbit while retaining orientation metadata.

## Important representation boundary

The dictionary itself is **not** the proof frontier and is not automatically an antichain.

Keep every unique clause identity required by `D(S)` even when one dictionary clause contains another. Clause-subset relations are metadata used to encode normalized records and coverage signatures.

This mirrors the earlier support-local residual correction:

```text
dictionary first
antichain / proof normalization second.
```

## Disposition

Promote `D(S)` as the exact support-local clause vocabulary for the clause-coverage BSFP profile.

Use it to design variable-width coverage storage, edge cofactor tables, reflection-orbit dictionaries and real-frontier CUDA fixtures.

Do not promote the current fixed-two-u32 CUDA qualifier into the semantic contract; it is only the first device profile of this variable-width construction.
