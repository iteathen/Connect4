# Monotone clause-frontier BSFP qualification

**Status:** exact differential qualification on ten variable geometries; reference implementation is not performance-qualified.

**Research direction:** Josh Oshiro.

## Question

Can BSFP keep ownership compatibility symbolic as beneficiary-relative monotone clauses instead of expanding every proof region to its minimal ownership generators or repeatedly computing line-hit realizability completions?

A **clause record** is a normalized finite family of nonempty cell sets:

```text
R = {C1, C2, ..., Cn}
```

for beneficiary player `p`.

It denotes the ownership region:

```text
Models(R)
  = { P_p | for every Ci in R, P_p intersects Ci }.
```

A frontier is a union of clause-record regions.

This is a factored representation of an upward-closed ownership family. Every ordinary positive ownership generator `g` is the special clause record:

```text
{ {x} | x in g }.
```

Therefore the clause language is complete for the existing positive winner semantics while permitting one record to represent many ownership generators.

## Exact record normalization

Within one record, if clauses satisfy:

```text
C1 subseteq C2
```

then `C2` is redundant because hitting `C1` already hits `C2`.

So a normalized record keeps only subset-minimal clauses.

For two normalized monotone-CNF records `A` and `B`:

```text
Models(A) subseteq Models(B)
```

iff every clause `D` in `B` contains at least one clause `C` in `A`:

```text
for every D in B:
    exists C in A such that C subseteq D.
```

This gives an exact record-implication test without expanding minimal transversals.

For a union frontier, a narrower record is redundant whenever it implies another retained broader record.

## Exact predecessor algebra

For landing cell `x`, beneficiary `p`, and mover `m`:

### Beneficiary claims x

Set `x=true` in the monotone CNF:

```text
m == p:
    every clause containing x is satisfied and disappears;
    all other clauses remain.
```

### Opponent claims x

Set `x=false`:

```text
m != p:
    remove x from every clause;
    if any clause becomes empty, the record is impossible and disappears.
```

### Existential move composition

When beneficiary is the mover:

```text
parent frontier = union of action frontiers.
```

### Universal move composition

When the opponent is the mover:

```text
(OR_i Ri) AND (OR_j Sj)
  = OR_(i,j) (Ri AND Sj).
```

Record conjunction is simply:

```text
clauses(Ri AND Sj)
  = normalize(clauses(Ri) union clauses(Sj)).
```

Thus the universal product remains clause-set union followed by exact record/frontier normalization.

## Exact terminal boundary

Suppose mover `p` wins immediately by landing at `x` when every pre-existing cell in requirement `q` already belongs to `p`.

The terminal region `Own_p(q)` is represented by one clause record containing singleton clauses:

```text
{ {v} | v in q }.
```

The opponent can remain a possible winner only outside that immediate terminal region. In opponent ownership coordinates the exact complement is:

```text
opponent owns at least one cell of q
```

represented by the one-clause record:

```text
{ q }.
```

If several terminal-ready lines exist simultaneously, the opponent must hit every prerequisite set, so the blocker record contains one clause per ready line.

This preserves first-win stopping directly.

## Authority / falsifier

The qualifier solves every geometry twice:

1. independent dual-positive ownership-generator BSFP;
2. monotone clause-frontier BSFP.

For exact comparison, every final clause record is expanded only in the **qualification path** to its minimal transversals. The union of those minimal models is normalized and compared exactly with the authority's minimal ownership-generator frontier at every support for both players.

Any support-level difference is a falsifier.

No minimax/Negamax result, solved database, opening knowledge, or externally searched game value is consumed.

## Variable-geometry results

All rerun controls produced zero W0/W1 frontier mismatches.

| Geometry | Supports | Ownership records | Clause records | Record change | Ownership product pairs | Clause product pairs | Pair reduction |
|---|---:|---:|---:|---:|---:|---:|---:|
| 3x3 c3 | 64 | 303 | 283 | -6.60% | 823 | 510 | 38.03% |
| 3x4 c3 | 125 | 1,260 | 1,088 | -13.65% | 5,904 | 3,001 | 49.17% |
| 3x5 c3 | 216 | 3,438 | 3,031 | -11.84% | 23,180 | 11,090 | 52.16% |
| 4x3 c2 | 256 | 1,459 | 1,459 | 0.00% | 4,986 | 3,704 | 25.71% |
| 4x3 c3 | 256 | 3,004 | 2,730 | -9.12% | 18,955 | 11,222 | 40.80% |
| 4x4 c3 | 625 | 13,728 | 14,410 | **+4.97%** | 163,873 | 103,589 | 36.79% |
| 4x4 c4 | 625 | 6,591 | 4,486 | -31.94% | 46,027 | 14,163 | 69.23% |
| 4x5 c4 | 1,296 | 40,707 | 21,474 | -47.25% | 692,887 | 129,420 | 81.32% |
| 5x3 c4 | 1,024 | 5,442 | 3,062 | -43.73% | 28,718 | 6,364 | 77.84% |
| 5x4 c4 | 3,125 | 108,266 | 60,657 | -43.97% | 2,613,241 | 570,395 | 78.17% |

The dense 4x4 connect-3 case is intentionally retained: clause records were about 5% more numerous than ownership generators even though pair products were still about 37% lower. Clause-frontier compression is therefore **not** a universal record-count theorem.

## Clause payload sizes

Selected exact totals:

```text
4x3 c3:
    records:  2,730
    clauses:  8,545
    literals: 10,738
    max records/support: 26
    max clauses/record:   8

4x4 c4:
    records:  4,486
    clauses: 17,550
    literals:19,750
    max records/support: 19
    max clauses/record:   8

5x3 c4:
    records:  3,062
    clauses: 11,685
    literals:14,911
    max records/support: 13
    max clauses/record:   8

4x5 c4:
    records:   21,474
    clauses:  101,009
    literals: 126,460
    max records/support: 39
    max clauses/record:   9

5x4 c4:
    records:   60,657
    clauses:  284,515
    literals: 367,054
    max records/support: 62
    max clauses/record:  11
```

A production memory comparison must therefore account for **record indirection + clause identity + clause occurrence**, not just record count.

## Reference runtime result

Single-process JavaScript reference timing favored the ownership representation despite the clause frontier's smaller product volume.

Representative rerun ratios:

```text
3x3 c3: clause solve ~3.74x ownership
3x4 c3:            ~4.10x
3x5 c3:            ~5.13x
4x3 c2:            ~2.28x
4x3 c3:            ~4.23x
4x4 c3:           ~10.37x
4x4 c4:            ~4.30x
4x5 c4:            ~4.15x
5x3 c4:            ~2.77x
5x4 c4:            ~4.96x
```

These are mechanism diagnostics, not benchmark-quality performance evidence. They are retained because they locate the immediate implementation problem:

> semantic candidate/product volume fell, but generic JavaScript clause canonicalization and record-implication work cost more than the eliminated ownership work.

Do not claim a runtime win from the representation result.

## Relationship to R0043 / direct line-hit completion

The direct line-hit realizability study derived an upper-completion request `(A,B)` as:

```text
forced beneficiary-owned cells
+
positive hitting clauses over occupied line intersections.
```

Minimal-transversal completion expanded this clause system into minimal ownership solutions and then mapped those solutions back to realizable line-hit pairs.

The clause frontier keeps the **constraint system itself** as the persistent proof record instead of expanding its minimal transversals.

Thus:

```text
line-hit realizability completion
    -> monotone clause family
    -> minimal transversals
```

and clause-frontier BSFP stops in the middle:

```text
line-hit / proof constraint
    -> monotone clause family
    -> exact symbolic recurrence directly on clauses.
```

This appears to explain why the expensive realizability-completion branch can disappear while exactness remains.

It does not yet prove that R0043 should be retired universally; that requires independent derivation review and geometry-generic production qualification.

## Relationship to Isometric

The representation is unusually well aligned with the existing Isometric proof language:

```text
ownership unit            -> singleton clause
blocker "at least one"    -> ordinary clause
affine/split fact          -> proof-side guard or compiled clause consequence
resource/timing obligation -> typed guard until discharged
completed Win/Safe region  -> clause-frontier record(s)
```

This does **not** require Isometric to adopt BSFP state identity or to put all clause information in its universal WSL key.

The shared object is the guarded monotone proof region, not the operational state representation.

## Variable-size status

The semantics depend only on finite cell sets and are geometry-generic.

A production implementation must choose representations from the active geometry:

```text
cell bitset width = ceil(W*H / backendWordBits)
clause identity width = sized from support-local clause vocabulary
record width = variable number of clause IDs
```

No 42-cell, 69-line, 625-WSL, or one-u64 assumption belongs in the semantic contract.

## Immediate optimization seam

The reference implementation repeatedly compares variable clause arrays. The first production-oriented representation candidate is:

```text
support/orbit-local clause dictionary
    clause cell-mask -> dense clause ID

precomputed clause subset relation
    ID -> clauses it subsumes / is subsumed by

record
    sorted/interned set of clause IDs

record implication
    bitset/ID coverage rather than repeated cell-subset scans
```

This is another O3-style factorization:

```text
clause semantic identity
    separate from
clause occurrence inside many frontier records.
```

Reflection can canonicalize clause IDs per support orbit, and beneficiary cofactors can use precomputed parent->child clause-ID maps.

## Next qualification steps

1. Build a support/orbit-local clause dictionary and require exact round-trip equality.
2. Precompute cell-event cofactor maps for clause IDs.
3. Replace array-based record implication with exact dense-ID/bitset implication.
4. Measure whether the pair-count reduction survives without generic-JS normalization overhead.
5. Add exact rank-slice feasibility in clause form only after its cost is understood. A record intersects the exact `k`-stone slice iff its minimum hitting-set size is `<= k`; computing that value exactly is a separate resource/capacity problem.
6. Compose with the already-qualified horizontal-reflection support quotient.
7. Probe the 6x5 high-rank CUDA wall as one variable-geometry profile; do not hardcode that board into the calculus.

## Reproduction

Examples:

```text
node research/experiments/bsfp-clause-frontier/clause-frontier-equivalence.mjs 4 4 4
node research/experiments/bsfp-clause-frontier/clause-frontier-equivalence.mjs 4 4 3
node research/experiments/bsfp-clause-frontier/clause-frontier-equivalence.mjs 5 4 4
```

Any support-level W0/W1 mismatch sets a failing exit code.

## Disposition

**Strongly supports** beneficiary-relative monotone clause frontiers as an exact, geometry-generic BSFP representation candidate.

The representation is currently a semantic/compression win and a reference-runtime loss. Advance the next work toward clause identity interning and exact bitset implication; do not move the naive JavaScript form into production.
