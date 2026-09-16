# BSFP support-local monotone-clause dictionary

**Status:** deductive exact representation theorem / production-shape hypothesis.

**Research direction:** Josh Oshiro.

## Purpose

The qualified beneficiary-relative clause-frontier recurrence keeps monotone ownership constraints in factored CNF records. A production implementation needs a finite support-local clause vocabulary that is:

- exact;
- closed under predecessor cofactors;
- geometry-generic;
- compact enough for dense IDs / bitset coverage signatures;
- independent of any solved-game oracle.

The recurrence itself gives such a vocabulary.

## 1. Setup

Let:

```text
Lambda = geometric winning-line family
S      = current occupied support ideal
```

A beneficiary-relative clause `C` denotes:

```text
beneficiary owns at least one cell in C.
```

A clause record is a conjunction of such clauses, and a frontier is a union of clause-record regions.

The exact clause-frontier recurrence uses only:

1. terminal winner injection;
2. first-win exclusion / blocker clauses;
3. owner-labelled one-cell cofactors;
4. record conjunction;
5. frontier union / implication normalization.

## 2. Support-local dictionary theorem

Define:

```text
D(S)
  = unique(
      { {v} | v in S }
      union
      { lambda intersect S | lambda in Lambda,
                             lambda intersect S != empty }
    ).
```

Then every nonempty clause that can occur in the exact beneficiary-relative clause-frontier BSFP at support `S` belongs to `D(S)`.

Thus:

```text
|D(S)| <= |S| + |Lambda|.
```

For a variable-size `W x H`, Connect-`K` geometry, with

```text
a = max(W-K+1, 0)
b = max(H-K+1, 0),
```

the geometric winning-line count is

```text
L(W,H,K) = H*a + W*b + 2*a*b,
```

so:

```text
|D(S)| <= rank(S) + L(W,H,K).
```

This is a semantic bound, not a fixed-width implementation rule. The backend chooses the number of words from the actual dictionary size.

## 3. Why no other clause shape is created

### Terminal winner injection

If mover `p` wins by landing at `x`, the parent prerequisite is:

```text
q = lambda \ {x}
```

with every cell of `q` already in `S`.

The positive own-all region is represented in monotone CNF by singleton ownership units:

```text
{ {v} | v in q }.
```

Every such singleton is in `D(S)`.

### First-win exclusion

For the opponent to remain a possible winner, the opponent must own at least one cell from each ready terminal prerequisite:

```text
q = lambda \ {x}.
```

Because `x` is the next landing and all other cells of the ready line are in the parent support,

```text
q = lambda intersect S.
```

So every terminal blocker clause is a geometric past-part clause in `D(S)`.

### Record conjunction

Universal move composition forms:

```text
clauses(A AND B)
  = normalize(clauses(A) union clauses(B)).
```

It combines existing clauses but never unions their cell sets into a new clause.

### Frontier normalization

Record implication/subsumption only removes redundant clauses or records. It creates no new clause cell set.

Therefore terminal injection is the only source of clause shapes, and cofactors only map those shapes backward as described below.

## 4. Exact one-edge closure

Let legal landing cell `x` extend parent support `S` to child support:

```text
S' = S union {x}.
```

The child dictionary is `D(S')`; the parent dictionary is `D(S)`.

### Singleton clause

For child unit `{v}`:

```text
v != x:
  {v} -> {v}

v == x, beneficiary owns x:
  clause satisfied -> disappears

v == x, opponent owns x:
  clause becomes empty -> whole record impossible.
```

### Geometric past-part clause

For child clause:

```text
C = lambda intersect S'.
```

If `x` is not in `C`, then:

```text
C = lambda intersect S
```

and it maps unchanged.

If `x` is in `C`:

```text
beneficiary owns x:
  C is satisfied -> disappears

opponent owns x:
  C -> C \ {x}
     = lambda intersect S.
```

If the latter is empty, the whole record is impossible. Otherwise the image is again in `D(S)`.

Hence `D(S)` is predecessor-closed under the exact clause recurrence.

## 5. Coverage-signature consequence

Let the local dictionary be partially ordered by cell-set inclusion.

For normalized record `R`, define its dictionary coverage signature:

```text
U_S(R)
  = { d in D(S) | exists c in R with c subseteq d }.
```

This upward-coverage bitset uniquely determines the normalized record relative to `D(S)` and gives:

```text
A implies B
iff
U_S(B) subseteq U_S(A)

U_S(A AND B)
=
U_S(A) union U_S(B).
```

Because every child clause has an exact parent image/satisfied/kill result, the cofactor of a coverage signature is a precomputable Boolean transform between the child and parent dictionaries.

## 6. Cofactor as a precomputed bitset transform

For one support edge and beneficiary relation, precompute for every child dictionary ID either:

```text
SATISFIED
KILL
parentClauseID
```

plus the parent upward-coverage signature of every surviving `parentClauseID`.

Then a record cofactor can be evaluated without reconstructing variable clause arrays:

```text
if input coverage proves a KILL clause:
    record is impossible
else:
    outputCoverage = OR of mapped parent coverage contributions.
```

Equivalently, precompute a Boolean gather map for each parent coverage bit:

```text
parentBit[j] = OR(inputBits intersect preimage[j]).
```

The better scatter/gather device layout is an implementation question; the semantic map is exact.

## 7. Important distinction: dictionary versus record antichain

`D(S)` is a dictionary, not itself a semantic frontier.

Do not delete dictionary entries merely because one clause cell set contains another. Both IDs can be load-bearing in different proof records and in different cofactor histories.

Subset relations are metadata used to construct coverage signatures and normalize records.

This mirrors the earlier support-local residual result:

```text
vocabulary first
antichain / proof formula second.
```

## 8. Relation to support-local residuals

For every geometric winning line:

```text
lambda
  = (lambda intersect S)
    disjoint-union
    (lambda \ S).
```

Thus the clause dictionary and residual dictionary are dual support-conditioned views of the same geometric line family:

```text
past / already occupied proof obligation:
    lambda intersect S

future / still required winning cells:
    lambda \ S.
```

This is a useful Isometric/BSFP synthesis seam: one static line origin induces both the proof-side blocker clause and the future residual requirement without requiring either representation to become the other's state identity.

## 9. Variable-size consequences

No `42`, `69`, `625`, or one-u64 width belongs in the semantic contract.

Backend width is:

```text
coverageWords(S)
  = ceil(|D(S)| / backendWordBits).
```

Examples are profile evidence only.

For 6x5 Connect-4:

```text
L = 39.
```

At rank 23 the theorem gives:

```text
|D(S)| <= 23 + 39 = 62,
```

so every rank-23 support fits one 64-bit coverage signature even before duplicate clause identities are removed.

At full rank the crude bound is 69, so the representation may require a second word. A variable-size engine should select width from the actual support/orbit dictionary rather than hardcode either case.

## 10. Interaction with reflection

Horizontal reflection maps:

```text
singleton {v} -> singleton {R(v)}
lambda intersect S -> R(lambda) intersect R(S).
```

Therefore the dictionary and its inclusion poset transform exactly across a support-reflection orbit.

A representative-support schedule may precompute one clause dictionary plus reflection ID map rather than duplicate mirrored dictionaries.

## 11. Qualification / implementation sequence

1. Enumerate `D(S)` directly from support + geometry on complete variable-size controls.
2. Require every clause emitted by the already-qualified clause-frontier recurrence to belong to `D(S)`.
3. Build child->parent clause-ID maps for every legal support edge and both beneficiary relations.
4. Compare array-clause cofactor against coverage-bitset map for every persistent frontier record.
5. Require exact frontier equality after full recurrence.
6. Compose with horizontal reflection and rank-slice capacity filtering.
7. Only then move the map into the CUDA clause-coverage experiment.
8. Keep rank-slice ownership as independent exact fallback/reference.

## 12. Falsifiers

- any exact recurrence emits a nonempty clause outside `D(S)`;
- a child dictionary clause has no exact satisfied/kill/parent-ID image;
- coverage-map cofactor differs from array-clause cofactor;
- dictionary subset pruning is mistakenly promoted to semantic clause deletion;
- a fixed-width implementation is treated as universal when `|D(S)|` exceeds that width;
- reflected dictionary IDs fail to preserve clause cell sets / subset relations;
- device map overhead erases product savings on the target workload (performance falsifier only).

## Disposition

Promote the support-local clause dictionary as the preferred semantic basis for the experimental coverage-signature BSFP profile.

It converts the remaining variable-array cofactor operation into an exact precomputed support-edge map and gives a geometry-derived variable-width bound. The next decisive experiment is full recurrence equivalence using only local dictionary coverage signatures and precomputed child->parent maps.