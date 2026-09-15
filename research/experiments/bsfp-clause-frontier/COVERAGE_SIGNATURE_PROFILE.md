# Clause-coverage signature profile

**Status:** exact representation derivation plus reference mechanism evidence. CUDA qualification not yet performed.

**Research direction:** Josh Oshiro.

## Purpose

The qualified monotone clause-frontier BSFP reduces product volume substantially on several variable Connect-k geometries, but its first JavaScript realization paid too much for variable clause-array canonicalization and record implication.

This note records the next representation step: factor clause semantic identity from clause occurrence, encode each normalized record by an upward-closure signature over a support-local clause dictionary, and compare that form against the already-qualified legal-rank-slice ownership baseline.

No 42-cell, 69-line, WSL-625, one-u64, or solved-game assumption is part of the semantic claim.

## 1. Support-local clause dictionary

For support `S` and geometric winning-line family `Lambda`, every monotone clause produced by the beneficiary-relative clause recurrence belongs to the support-local dictionary

```text
D(S)
  = occupied singleton cells
    union
    unique nonempty { lambda intersect S | lambda in Lambda }.
```

The recurrence preserves this dictionary form:

- terminal winner prerequisites add singleton clauses;
- first-win exclusion adds an occupied winning-line prerequisite clause;
- beneficiary-true cofactor removes already-satisfied clauses;
- opponent-false cofactor removes the landing cell, mapping the child line intersection to the parent line intersection;
- universal composition only unions clauses already present in the local dictionaries.

Thus a geometry-generic bound is

```text
|D(S)| <= |S| + |Lambda|,
```

before ordinary duplicate collapse.

The dictionary is an identity vocabulary, not itself a proof frontier.

## 2. Upward clause-coverage signature

Let a normalized clause record `R` be the subset-minimal clause family whose models are beneficiary ownership sets hitting every clause.

Assign dense IDs to `D(S)` and define

```text
U_S(R)
  = { d in D(S) | exists c in R with c subseteq d }.
```

`U_S(R)` is the upward closure of the record's minimal clauses in the local clause-poset.

Because `R` is normalized, its clauses are exactly the minimal elements of `U_S(R)`. Therefore the coverage signature is lossless relative to the support-local dictionary.

### Exact implication

For records `A,B`:

```text
Models(A) subseteq Models(B)
iff
U_S(B) subseteq U_S(A).
```

So record implication becomes ordinary fixed-width bitset subset.

### Exact conjunction

Universal/opponent composition conjoins two records. Clause-set conjunction is union followed by clause minimization. Upward closures obey

```text
U_S(A AND B) = U_S(A) union U_S(B).
```

Therefore a universal pair product becomes fixed-width bitwise OR over coverage signatures.

### Frontier normalization

A union frontier is an antichain under model inclusion. In coverage form this becomes an ordinary subset-antichain over the fixed-width signatures, with the reversed implication orientation above.

This is an O3-style factorization:

```text
clause semantic identity
    separate from
clause occurrence in records and products.
```

## 3. Geometry-selected width

The semantic representation is variable-width:

```text
coverageWords(S)
  = ceil(|D(S)| / backendWordBits).
```

A two-u32 reference profile was used only where the tested local dictionary fit within 64 IDs. That is profile evidence, not a universal architecture limit.

A production implementation must select word width from the active geometry/support-orbit dictionary.

## 4. Reference fixed-width mechanism result

The first two-u32 coverage implementation preserved exact clause-frontier semantics on the selected controls.

Compared with the original unsliced ownership reference, warmed diagnostic medians initially showed a clause-coverage win on the larger Connect-4 controls:

```text
4x5 c4:
  coverage ~100.5 ms
  unsliced ownership ~121.0 ms
  ratio ~0.831

5x4 c4:
  coverage ~367.4 ms
  unsliced ownership ~440.3 ms
  ratio ~0.834

4x4 c3:
  coverage ~64.8 ms
  unsliced ownership ~28.7 ms
  ratio ~2.26
```

This was not the correct production comparison because ownership BSFP already has a qualified exact legal-rank-slice reduction.

## 5. Corrected comparison: rank-slice ownership remains faster

After pushing the exact beneficiary stone count into the ownership recurrence, the corrected reference comparison favored rank-slice ownership.

Representative 15-run warmed medians:

```text
4x5 c4:
  rank-slice ownership ~78.3 ms
  unsliced coverage    ~99.1 ms
  coverage/ownership   ~1.27

5x4 c4:
  rank-slice ownership ~262.5 ms
  unsliced coverage    ~391.3 ms
  coverage/ownership   ~1.49

4x4 c3:
  rank-slice ownership ~21.9 ms
  unsliced coverage    ~67.3 ms
  coverage/ownership   ~3.07
```

The ownership legal-slice profile also removed large amounts of impossible product work:

```text
4x5 c4:
  raw pair products       645,234
  materialized            278,319
  legal-slice rejected    366,915
  persistent records       35,827

5x4 c4:
  raw pair products     2,427,785
  materialized            930,268
  legal-slice rejected  1,497,517
  persistent records       97,866

4x4 c3:
  raw pair products       150,214
  materialized             79,675
  legal-slice rejected     70,539
  persistent records       12,135
```

**Current conclusion:** do not replace rank-slice ownership BSFP on CPU/reference evidence. Clause coverage remains an alternate exact profile whose smaller symbolic work shape may fit device execution better.

## 6. Exact clause legal-slice condition

For a beneficiary clause record `R` on a support where that player owns exactly `k` stones, let `tau(R)` be the minimum hitting-set size of the clause family.

Then exactly:

```text
R intersects the legal k-stone slice
iff
tau(R) <= k.
```

An exact branch/memoized `tau` filter was tested as a semantic control. It reduced records/products but was rejected as the hot-path implementation form because the hitting-set computation dominated runtime.

Representative diagnostics:

```text
4x5 c4:
  clause products        ~111,042
  records                 ~18,003
  tau computations        ~82,560
  tau-filter clause       ~404 ms
  rank-slice ownership    ~76.8 ms

5x4 c4:
  clause products        ~499,201
  records                 ~53,495
  tau computations       ~306,687
  tau-filter clause      ~1541 ms
  rank-slice ownership    ~263 ms
```

Do not introduce generic minimum-hitting-set solving into the normal BSFP path from this result.

## 7. Most exact slice rejections have tiny residual capacity

Let `f` be the number of distinct singleton clauses forced by a record and define

```text
slack = k - f.
```

Exact `tau`-rejection distributions showed that almost all rejected clause records on the tested larger Connect-4 controls are explained by slack at most one.

### 4x5 c4

```text
exact rejected: 38,417
f > k:          26,166
slack 0:        10,290
slack 1:         1,757
slack 2:           202
slack 3:             2
```

The first three classes explain about 99.47% of exact rejections.

### 5x4 c4

```text
exact rejected: 176,462
f > k:          118,591
slack 0:         48,423
slack 1:          8,569
slack 2:            878
slack 3:              1
```

Again about 99.5% are explained by `f>k`, slack 0, or slack 1.

Dense 4x4 c3 was less favorable but still had about 96% of exact rejected records in these classes.

This makes a bounded-capacity fixed-width guard much more attractive than general `tau`.

## 8. Cheap exact bounded-capacity guards

The following cases are exact.

### Forced singleton overflow

```text
f > k
=> infeasible.
```

This is a masked popcount over singleton clause IDs.

### Zero remaining capacity

If `f == k`, every non-singleton residual clause must already be satisfied by the forced singleton cells. If an unsatisfied clause remains, the record is infeasible.

### One remaining stone

If `f == k-1`, the record is feasible iff there exists one nonforced physical cell that belongs to every still-unsatisfied clause.

This can be tested without reconstructing minimal clauses.

Precompute, for each physical cell `x`, the local clause-ID coverage bitset

```text
Contains_S[x]
  = { d in D(S) | x in d }.
```

Let `extra` be the record coverage IDs not already satisfied by the forced cells. One free stone is sufficient exactly when

```text
exists x not forced:
  extra subseteq Contains_S[x].
```

Thus the capacity-1 guard is fixed-width subset logic, not a transversal search.

## 9. Current bounded-capacity performance result

A full capacity-1 filter captured nearly all of the exact `tau` pruning but checking it on every normalization site still cost too much in the JavaScript reference.

A better variant applies:

- only the cheap forced-singleton check on ordinary cofactor/union normalization;
- the stronger slack-0/slack-1 guard only to universal Cartesian products before materialization.

Representative 15-run medians:

```text
4x5 c4:
  rank-slice ownership ~74.2 ms
  product-cap coverage ~86.6 ms
  ratio                ~1.17

5x4 c4:
  rank-slice ownership ~259.4 ms
  product-cap coverage ~340.2 ms
  ratio                ~1.31

4x4 c3:
  rank-slice ownership ~21.8 ms
  product-cap coverage ~55.8 ms
  ratio                ~2.56
```

Work shape for the same product-cap profile:

```text
4x5 c4:
  raw products       111,813
  materialized        65,009
  product rejects     46,804
  subset checks      568,539
  records             18,108

5x4 c4:
  raw products       503,917
  materialized       268,052
  product rejects    235,865
  subset checks    2,538,768
  records             53,961

4x4 c3:
  raw products        86,835
  materialized        51,538
  product rejects     35,297
  subset checks      488,841
  records             12,360
```

The clause profile therefore carries materially less product and persistent-state volume than rank-slice ownership on the larger Connect-4 controls, but the current CPU/JavaScript realization remains slower.

This is exactly the kind of case that warrants a narrow CUDA mechanism qualification rather than a production rewrite.

## 10. Factorization has history

Ownership generators can always be embedded exactly as clause records of singleton clauses, but that does not recreate the factorization accumulated by running the clause recurrence from the terminal boundary.

On several `K>=3` controls the first difference between an ownership-DNF embedding and the native clause frontier appeared already at rank `N-2`.

For example, 5x4 c4 showed:

```text
rank 19: embedded 17, clause 17
rank 18: embedded 514, clause 112
rank 17: embedded 1439, clause 439
```

A hybrid that used clause recurrence from rank 18 downward retained the full-clause work shape because the ranks above were still trivial. Delaying the switch to rank 16 increased clause pair products from about 570k to about 839k and subset checks from about 3.64M to about 6.07M.

Therefore an adaptive solver cannot assume it may run ownership for most of the solve and switch to clause form only after the ownership frontier becomes expensive. The proof factorization may already have been distributed away.

Possible responses:

1. admit the clause profile from a thin terminal band where both profiles are cheap;
2. define and qualify a separate exact refactorization operation;
3. keep ownership as the profile for geometries where clause admission is not justified.

## 11. CUDA-facing profile contract

For a support or support-orbit representative, the experimental device profile should carry:

```text
local clause dictionary D(S)
coverage width in u32 lanes
singleton-ID mask
Contains_S[cell] coverage bitsets
parent/child clause-ID cofactor maps
terminal clause IDs / terminal singleton coverage
beneficiary-specific exact stone count k
```

Hot operations become:

```text
record conjunction:
  coverage = left OR right

record implication / frontier dominance:
  fixed-width subset

cheap slice rejection:
  forced-singleton popcount and bounded slack guards

cofactor:
  precomputed child-ID -> parent coverage contribution / impossible marker

terminal injection/exclusion:
  precompiled coverage signatures
```

The device implementation must choose lane count from the active dictionary width. A two-u32 specialization is an optimization profile, not the semantic contract.

## 12. Interaction with reflection and Isometric

Horizontal reflection quotienting is already independently qualified. Clause dictionaries, coverage IDs and cofactor maps should therefore be generated per canonical support orbit with explicit orientation transforms rather than duplicated for mirror supports.

For Isometric integration, the shared boundary remains a guarded proof region, not the coverage bitset itself. Coverage IDs are an internal BSFP execution representation.

Isometric may emit beneficiary-relative guarded clauses/certificates; BSFP may compile accepted claim-local consequences into the support-local clause dictionary without requiring IsoMax/Isometric to adopt BSFP state identity.

## 13. Current disposition

- **Retain rank-slice ownership as the fastest qualified reference/fallback profile.**
- **Retain clause coverage as a serious alternate execution profile**, especially for geometries/ranks with large product-volume reduction.
- Reject generic hot-path exact `tau` computation.
- Retain the fixed-width forced/slack-0/slack-1 guards as the preferred legal-slice approximation tier because they are exact for the cases they decide and explain nearly all observed exact rejections on the tested larger Connect-4 controls.
- Do not claim a clause runtime win until a device-native packed profile is compared directly with equally optimized rank-slice ownership.
- Preserve the clause factorization from near the terminal boundary if the profile is admitted; do not assume late conversion from ownership recovers it.

## Next experiment

Build a **separate CUDA/CUDA-JS packed coverage qualifier** rather than mutating production BSFP.

The decisive A/B is:

```text
rank-slice packed ownership
versus
packed clause-coverage + cheap exact capacity guards
```

on identical support/rank workloads and device/runtime conditions.

Measure independently:

```text
raw universal pairs
pairs rejected before materialization
materialized records
wordwise subset checks
cofactor-map work
terminal work
bytes retained / scratch bytes
kernel/epoch time
whole qualified slice time
exact frontier equality after decoding
```

The representation should be admitted only if the measured device work reduction repays the additional dictionary/cofactor indirection on the target geometry.
