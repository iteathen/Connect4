# Canonical single-CNF control — exact but rejected as current production form

**Status:** exact representation control / negative performance-shape result.

**Research direction:** Josh Oshiro.

## Question

A player's winner region is monotone in that player's ownership. Therefore it has both:

```text
canonical minimal-DNF form
    = minimal ownership generators

canonical monotone-CNF form
    = subset-minimal prime clauses.
```

Could BSFP replace both the ownership-generator frontier and the partially factored OR-of-CNF clause frontier with **one canonical CNF per player/support**?

## Exact algebra

One CNF is a subset-minimal family of monotone clauses.

```text
FALSE = CNF containing an empty clause
TRUE  = empty clause family
```

Cofactor is exact:

```text
beneficiary owns x:
    remove clauses containing x

opponent owns x:
    remove x from every clause;
    empty clause => FALSE.
```

Opponent/universal action composition is cheap:

```text
CNF1 AND CNF2
    -> clause-set union + subset normalization.
```

But beneficiary/existential composition requires distributivity:

```text
(AND_i Ai) OR (AND_j Bj)
  = AND_(i,j) (Ai OR Bj),
```

so existential composition becomes a pairwise clause-union product.

This is the Boolean dual of the ownership-generator DNF representation, where existential union is cheap and universal intersection is the pair product.

## Correctness

The single-CNF recurrence was expanded to its minimal transversals and compared exactly against the independent positive ownership-generator BSFP.

The tested geometries all produced zero W0/W1 mismatches:

```text
4x3 c3
4x4 c4
5x3 c4
4x4 c3
4x5 c4
5x4 c4
3x5 c3
4x3 c2
```

Thus the representation is exact on the controls.

## Work-shape result

Selected totals:

| Geometry | Ownership DNF records | Single-CNF clauses | Ownership pair products | Single-CNF pair products |
|---|---:|---:|---:|---:|
| 4x3 c3 | 3,004 | 3,152 | 18,955 | 23,972 |
| 4x4 c4 | 6,591 | 12,961 | 46,027 | 192,182 |
| 5x3 c4 | 5,442 | 9,254 | 28,718 | 65,332 |
| 4x4 c3 | 13,728 | 13,963 | 163,873 | 182,548 |
| 4x5 c4 | 40,707 | 66,210 | 692,887 | 2,245,107 |
| 5x4 c4 | 108,266 | 159,355 | 2,613,241 | 8,513,147 |
| 4x3 c2 | 1,459 | 1,446 | 4,986 | 4,918 |

The result is geometry-dependent, but on the larger Connect-4 controls the canonical CNF moves substantially **more** Cartesian work into existential composition.

For comparison, the partially factored clause-frontier experiment required only:

```text
4x4 c4:   14,163 record-pair products
5x3 c4:    6,364
4x5 c4:  129,420
5x4 c4:  570,395
```

so fully distributing the factorization into one canonical CNF destroys much of the useful compression.

## Interpretation

The current ownership antichain and the single-CNF form are opposite canonical normal forms of the same monotone Boolean winner function:

```text
minimal DNF
    versus
prime monotone CNF.
```

Each chooses one move quantifier to make cheap and pushes distributive product work onto the other.

The successful clause frontier sits between them:

```text
OR of normalized monotone CNF records.
```

It preserves useful algebraic factorization instead of fully distributing in either direction.

This is an important constraint on future simplification:

> Do not mistake a mathematically canonical normal form for a computationally minimal proof representation.

The next calculus should preserve factorization / shared proof structure when it reduces work, rather than requiring universal DNF or universal CNF normalization.

## Reference runtime

The simple JavaScript single-CNF control was also slower on most selected workloads. Example single-run measurements:

```text
4x4 c4: ownership ~25 ms, CNF ~66 ms
4x5 c4: ownership ~134 ms, CNF ~487 ms
5x4 c4: ownership ~480 ms, CNF ~1464 ms
```

These are diagnostic timings only.

## Disposition

**Reject the fully distributed single-CNF form as the current production candidate.**

Retain it as:

- an exact semantic duality/control;
- a warning against premature canonical distribution;
- evidence that the partially factored clause frontier is preserving useful proof factorization rather than merely changing notation.
