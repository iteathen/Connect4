# BSFP monotone clause-antichain frontier

**Status:** exact representation candidate with complete small-control qualification; production/runtime form remains open.

**Research direction:** Josh Oshiro.

## Hypothesis

The exact beneficiary-relative Win/Safe regions needed by BSFP can be propagated as a frontier of **monotone CNF proof records** rather than only as minimal ownership conjunctions or realizable line-hit pairs.

For beneficiary player `p`, one record

```text
R = {C1, C2, ..., Cn}
```

means:

```text
p owns at least one cell in C1
AND
p owns at least one cell in C2
AND
...
AND
p owns at least one cell in Cn.
```

A frontier is a disjunction/union of such records.

This representation factors compatibility constraints instead of immediately expanding them to their minimal ownership models.

## Why it is complete

An ordinary positive ownership generator

```text
g = {x1, ..., xm}
```

means beneficiary owns all cells in `g` and is exactly the clause record:

```text
{ {x1}, {x2}, ..., {xm} }.
```

Therefore every current positive ownership-antichain region has a clause-frontier representation.

Conversely, every finite monotone clause record has a finite antichain of minimal transversals. Expanding every record to those minimal transversals and taking their union yields the ordinary minimal positive ownership-generator boundary.

The clause representation is therefore a factorization of the same finite upward-closed ownership semantics, not a new game rule.

## Exact record order

Normalize a record by keeping only subset-minimal clauses.

For normalized records `A` and `B`:

```text
A entails B
```

iff:

```text
for every clause D in B:
    there exists a clause C in A with C subseteq D.
```

This follows because a monotone CNF `A` fails to imply one monotone clause `D` exactly when setting all variables in `D` false and all variables outside `D` true still satisfies every clause of `A`; that is possible iff no clause of `A` is contained in `D`.

For a union frontier, a record is redundant if it entails another retained record whose model set already contains it.

Thus frontier normalization can remain symbolic without enumerating ownership assignments or minimal transversals.

## Exact cell-event cofactor

Let landing cell be `x`.

For beneficiary move:

```text
x = true
```

so every clause containing `x` is satisfied and removed.

For opponent move:

```text
x = false
```

so remove `x` from every clause; if any clause becomes empty, that record is impossible.

These are standard exact Boolean cofactors specialized to positive clauses.

## Exact move composition

For beneficiary to move:

```text
Win_p(parent)
  = union over legal actions Win_p(action).
```

For opponent to move:

```text
Win_p(parent)
  = intersection over legal actions Win_p(action).
```

If each action family is a union of clause records:

```text
(OR_i Ri) AND (OR_j Sj)
  = OR_(i,j) (Ri AND Sj).
```

Record conjunction is normalized clause-set union.

Therefore the clause frontier is closed under the BSFP existential/universal recurrence.

## Exact terminal / first-win boundary

Immediate win prerequisite `q` for mover `p`:

```text
p owns every cell of q.
```

Represent it by singleton clauses for each cell in `q`.

The opponent survives that terminal boundary only if:

```text
opponent owns at least one cell of q,
```

represented by one clause `q` in opponent coordinates.

For multiple terminal-ready lines, include one blocker clause per line.

This gives exact first-win subtraction without converting the blocker disjunction into XOR or enumerating ownership cases.

## Relationship to line-hit realizability

The C4-R0043 direct line-hit gap produced the same object from another direction.

A player-relative line-hit bound `(A,B)` compiles to:

```text
lines excluded from opponent-allowed set B
    -> forced owner cells -> singleton clauses

required own-hit lines A
    -> "own at least one occupied cell" clauses.
```

The minimal-transversal completion experiment expanded that clause family to minimal ownership solutions and mapped them to feasible line-hit pairs.

Clause-frontier BSFP instead keeps the clause family symbolic through the recurrence.

Candidate structural interpretation:

> C4-R0043's missing realizability information is not necessarily a persistent ownership reconstruction. It can be represented as a monotone compatibility/proof clause family whose ordinary BSFP operations are exact Boolean cofactors, conjunction, disjunction and implication normalization.

This remains a hypothesis about the best universal calculus even though the tested recurrence is exact on the qualified controls.

## Relationship to Isometric

The representation matches Isometric's blocker/NDC proof vocabulary more directly than raw ownership generators:

```text
unit owner fact       -> singleton clause
blocker disjunction   -> clause
compatible blocker set -> clause record
completed proof alternatives -> frontier of records
```

Affine, temporal, resource and realizability guards remain typed sidecar conditions until they can be discharged into a sound monotone clause consequence.

Do not turn every Isometric distinction into BSFP clause state, and do not turn every BSFP clause into universal Isometric state identity.

The shared object is a guarded proof region.

## Relationship to rank-slice feasibility

At support rank `r`, beneficiary player `p` has an exact legal stone count `k_p`.

A monotone clause record intersects that exact ownership slice iff it has some hitting set of size at most `k_p`, because any smaller satisfying ownership can be extended monotonically to exactly `k_p` cells inside support.

Thus exact slice feasibility is:

```text
minimum transversal size tau(R) <= k_p.
```

This is a clean bridge from the already-qualified feasible-slice theorem to the clause calculus, but `tau(R)` is a combinatorial resource quantity and should not be computed expensively on the hot path without qualification.

Possible future exact forms:

```text
precomputed support-local record class -> tau
bounded clause-family DP
component factorization
runtime certificate for lower/upper bounds
```

Cheap lower bounds may be advisory filters only unless they prove infeasibility.

## Geometry-generic representation

Semantic objects are variable-size:

```text
cell bitset
clause = cell subset
record = normalized set of clauses
frontier = normalized set of records
```

Backend profiles may represent these using:

```text
dense support-local clause IDs
fixed-width cell bitsets derived from W*H
record ID sets / bitsets sized from local vocabulary
```

No packed42/69-line/625-WSL constant is universal.

## Production representation candidate

The naive reference repeatedly stores raw cell masks in every record and compares all clause subsets during implication tests.

Prefer an O3-style factorization:

```text
support/reflection-orbit local clause dictionary
    semantic clause mask -> dense clause ID

precomputed clause-subsumption tables
    for each clause ID, exact weaker/stronger clause-ID masks

cofactor map per legal landing event
    beneficiary=true  -> clause satisfied/drop
    opponent=false    -> clause child-ID or impossible

record
    canonical set of clause IDs
```

Then record implication can be implemented as fixed-width coverage over precomputed subsumption rather than repeated multiword cell-mask comparisons.

This is the first implementation target; the generic JavaScript record-array form is explicitly not the production target.

## Qualified evidence

`research/experiments/bsfp-clause-frontier/RESULT.md` reports zero support-level W0/W1 mismatches against an independent positive ownership-generator BSFP on ten variable geometries:

```text
3x3 c3
3x4 c3
3x5 c3
4x3 c2
4x3 c3
4x4 c3
4x4 c4
4x5 c4
5x3 c4
5x4 c4
```

The clause representation reduced product-pair volume on every listed control, but one dense Connect-3 geometry had more persistent clause records than ownership generators and the naive JavaScript implementation was slower on every measured control.

## Strong falsifiers

- expanded clause frontier differs from the exact ownership-generator frontier;
- record implication criterion removes a model not covered by a retained record;
- cofactor semantics differ from direct cell assignment;
- terminal blocker clause is silently strengthened to XOR or conjunction;
- clause normalization depends on a fixed board width;
- runtime performance claims are inferred from lower pair counts without measurement;
- a typed Isometric guard is dropped when compiling a guarded proof into a clause record;
- minimum-transversal/cardinality reasoning is approximated and then treated as exact.

## Disposition

Promote **monotone clause-antichain BSFP** to the highest-priority representation experiment alongside the already-qualified reflection and feasible-slice reductions.

The next question is whether dense clause identity/subsumption tables make the exact calculus cheap enough for CUDA-BSFP. If they do not, preserve the clause calculus as a proof/certificate sidecar rather than forcing it into the production recurrence.
