# BSFP constraint-relative antichain normalization

**Status:** exact logical generalization / performance hypothesis. No production solver change.

**Research direction:** Josh Oshiro.

## Purpose

Current ownership-antichain BSFP normalizes positive generators by raw subset implication:

```text
a subseteq b
=>
Up(b) subseteq Up(a)
=>
b is redundant.
```

This is exact when the ambient ownership domain is the full Boolean cube.

But the root solve and Isometric proof layer often know an exact feasible-state theory `C`:

```text
legal ownership cardinality
fixed ownership facts
affine same/opposite-owner relations
first-win/nonterminal clauses
blocker/guard consequences
support/resource/deadline constraints where they project to ownership feasibility.
```

Relative to `C`, semantic implication can be strictly stronger than raw subset. The candidate is therefore:

> normalize BSFP certificate antichains by **logical implication on the exact feasible family**, not only by syntactic subset on the full cube.

This subsumes legal-slice pruning, fixed-fact filtering and part of the line-hit realizability bridge.

## 1. Feasible-family semantics

Fix support/turn and an exact constraint theory `C` over the ownership variables relevant to the current BSFP boundary.

For beneficiary player `p`, a positive certificate generator `g` denotes

```text
[[g]]_C
  = { assignment A | A satisfies C and p owns every cell in g }.
```

A generator is infeasible when

```text
C AND Own_p(g)
```

is unsatisfiable.

Such a generator denotes the empty feasible set and may be discarded exactly.

## 2. Constraint-relative dominance

For two positive generators `a,b`, define

```text
a <=_C b
iff
C AND Own_p(b) entails Own_p(a).
```

Equivalently:

```text
[[b]]_C subseteq [[a]]_C.
```

Therefore `b` is redundant whenever an already-retained `a` satisfies

```text
a <=_C b.
```

Raw subset is the special case:

```text
a subseteq b
=>
a <=_C b
```

for every `C`.

The relative order may identify additional equivalences or contradictions.

## 3. Simple exact examples

### Fixed owner

If `C` proves

```text
q(x)=P0,
```

then requiring P0 ownership of `x` adds no information:

```text
{x,y} equivalent_C {y}.
```

If `C` proves `q(x)=P1`, every P0 generator containing `x` is infeasible.

### Same-owner affine relation

If

```text
q(x)=q(y)
```

and the generator requires P0 ownership of `x`, then `y` is implied P0-owned as well.

Thus

```text
{x} equivalent_C {x,y} equivalent_C {y}
```

within the anchored component when the owner orientation is fixed by the certificate.

### Opposite-owner affine relation

If

```text
q(x)+q(y)=1,
```

then a positive certificate requiring the same player to own both `x` and `y` is infeasible.

### Legal cardinality

At support rank `r`, if player `p` owns exactly `k_p` stones, every generator with more than `k_p` distinct required `p` cells is infeasible.

This recovers the existing feasible-slice rejection as one exact `C`-satisfiability test.

### Full-line first-win constraint

At a nonterminal support, a fully occupied geometric line cannot be monochromatic.

A positive generator that, together with fixed/cardinality facts, forces one player to own every cell of such a line is infeasible.

## 4. Affine canonical form

Under the current Isometric pairwise affine profile, exact canonicalization is cheap.

A parity-DSU component expresses each owner bit as

```text
q(v) = root(component(v)) + parity(v).
```

A positive conjunction `Own_p(g)` therefore reduces component by component:

- requiring a literal already fixed true adds nothing;
- requiring a literal fixed false makes the generator infeasible;
- multiple compatible literals in one component collapse to one root orientation;
- incompatible same-component requirements make the generator infeasible.

Thus every generator can be mapped to a canonical affine prerequisite without general SAT.

This is the first implementation tier.

## 5. Clause-aware strengthening

Monotone blocker clauses can further strengthen implication after affine normalization.

Examples:

```text
x_u OR x_v = 1
x_u = 0
=> x_v = 1
```

or a clause may become a tautology/conflict under the current affine component assignments.

The Isometric guarded affine-clause closure already defines exact unit propagation and affine feedback for this profile.

Candidate normalization stages:

```text
1. fixed/support/cardinality rejection
2. parity-DSU canonicalization
3. exact clause unit propagation
4. cheap implication/subsumption on the normalized descriptor
5. optional bounded exact feasibility only if measured profitable.
```

Do not introduce an unbounded generic SAT solver into the hot path merely because the logical formulation permits one.

## 6. Push normalization inside Cartesian products

This candidate matters most before materialization.

Current upward intersection forms

```text
u = a OR b
```

for every pair.

Instead compute:

```text
u_raw = a OR b
u = Canonicalize_C(u_raw)
```

and then:

```text
if infeasible(u):
    discard before candidate storage
else:
    emit canonical u
```

Canonical equality may also collapse many raw pair results before the ordinary dominance scan.

The same idea applies to:

```text
terminal-subtraction products
positive dual P1 winner frontiers
interval Safe frontiers
claim-relative proof prerequisites.
```

This directly targets the measured BSFP candidate/normalization wall.

## 7. Relative antichain versus quotient identity

Two generators equivalent under `C` are equivalent **for the selected claim on the selected feasible family**.

This does not imply their underlying physical states, histories, terminal-line provenance or broader theorem contexts are identical.

The implementation must record which constraint theory and observation justify the normalization.

This is precisely the Isometric claim-relative principle applied to BSFP frontier records.

## 8. Dynamic constraints and guard scope

Static exact constraints may be compiled per support.

Examples:

```text
stone-count slice
support occupancy
fully occupied nonterminal-line clauses
reflection canonicalization.
```

Runtime-earned or Isometric-derived constraints may be narrower:

```text
fixed future owner under a guarded certificate
response-resource commitment
specific deadline-conditioned blocker fact.
```

Such a fact may only participate in antichain normalization where its guard is included in the frontier/proof context.

Do not use a conditional theorem as an unconditional global quotient.

## 9. Dual positive-certificate integration

Under `BSFP_DUAL_POSITIVE_CERTIFICATE_FRONTIERS.md`, all `W0/S0/W1/S1` boundaries are positive certificate antichains relative to their beneficiary player's ownership.

The same `Canonicalize_C` operation can therefore normalize all four families after translating `C` into the beneficiary-relative literals.

This is another reason the dual-positive representation may be a better long-term integration surface than mixed minimal/maximal P0 coordinates.

## 10. Support-local residual integration

The support-local residual basis provides small local proof/certificate IDs, especially in high ranks.

A fixed-support constraint descriptor can therefore combine:

```text
local residual membership
local blocker coverage
parity-DSU components
cardinality
nonterminal full-line clauses
small resource/deadline state.
```

The candidate is to derive a compact canonical constraint ID per support/proof context and use it for both:

```text
frontier generator canonicalization
claim-relative operation reuse.
```

## 11. First qualification experiment

Start on complete small-game controls with no strategic rules.

### Tier A — cardinality only

Require exact root equality while canonicalizing/rejecting generators relative to the legal ownership slice.

### Tier B — cardinality + nonterminal full-line clauses

Add exact NAE clauses for every fully occupied line at each nonterminal support.

### Tier C — exact affine facts from accepted structural certificates

Only after a certificate's guard can be represented explicitly in the test state.

For each tier measure:

```text
raw pair candidates
infeasible candidates rejected before storage
canonical-equivalent duplicates
post-canonical dominance checks
frontier widths
wall time
constraint-normalization cost
root W/D/L.
```

Also compare the generated feasible family directly with exhaustive assignments on small controls.

## 12. Strong falsifiers

- a discarded generator covers any feasible assignment needed by the exact frontier;
- `a <=_C b` is accepted when a feasible counterexample satisfies `b` but not `a`;
- a guard-conditioned relation is applied outside its guard;
- clause OR is silently strengthened to XOR;
- cardinality-only normalization is treated as full legal reachability;
- claim-relative generator equivalence is promoted to full state identity;
- constraint normalization costs more than the candidate/dominance work it removes on the target workload.

## 13. Relation to the calculus gap

This is not merely a faster dominance test.

Current BSFP says:

```text
proof prerequisites are compared syntactically as ownership subsets.
```

Isometric says:

```text
proof prerequisites should be compared by the exact structural consequences that hold under their guarded context.
```

Constraint-relative antichains make those two statements meet:

```text
syntactic subset antichain
-> exact guarded implication antichain.
```

If successful, every new proved Isometric invariant can automatically strengthen BSFP normalization without requiring a special-case pruning rule.

## Disposition

Promote **constraint-relative antichain normalization** to the top experimental tier alongside support-local residuals and legal-slice filtering.

The first implementation must remain intentionally weak: cardinality, fixed facts and affine canonicalization only. Add nonlinear clause reasoning only when its measured elimination justifies the cost.
