# Typed response-contract antichain calculus

**Date:** 2026-09-13  
**Status:** corrected generic research formalization; not yet an accepted specification  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and synthesis:** OpenAI ChatGPT

## Correction notice

The first version of this note compressed the center experiment too aggressively into three raw lower response-pair channels and one fixed residual set.

A per-pivot audit found the exact failure:

- nine pivot certificates solve only the distinguished requirement and are refuted by the weak reusable-pair projection;
- one Highinverse pivot also solves a second core requirement;
- its proper residual is therefore smaller;
- raw response-pair identity loses the stronger exclusivity/guard contract carried by the Highinverse columns.

The generic calculus must therefore be stated over **typed resource contracts** and **proper per-pivot residuals**, not over untyped cell pairs alone.

The falsifier strengthened the theory rather than weakening the underlying capacity idea.

---

## 1. Generic certificate interface

Let `U` be a finite set of unresolved requirements.

A proof certificate `C` has, at minimum:

```text
Solves(C)        subset of U
Prerequisites(C)
Resources(C)
Responses(C)
Guards(C)
Deadlines(C)
Consequence(C)
```

`Compatible(C1,C2)` means the two certificates can coexist without invalidating either certificate's prerequisites, reservations, response obligations, sharing semantics, guards, parity commitments, or deadlines.

Blocker coverage alone is not compatibility.

---

## 2. Resource contracts

A resource contract is not just a set of cells.

Conceptually:

```text
ResourceContract r = {
  footprint,
  response_relation?,
  sharing_policy,
  forbidden_reservations?,
  guards?,
  deadline_or_horizon?,
  parity_or_CPC_commitment?
}
```

Examples include:

### Reusable response pair

```text
footprint: {D2,D3}
response: D2 -> D3
sharing: exact reuse allowed
```

### Exclusive guarded interval

```text
footprint: {D2,D3,D4}
sharing: exclusive
guard: no Claimeven-bottom obligation in D at or below row 4
```

The two contracts touch the same lower cells but are not equivalent proof resources.

A future calculus may discover still richer contract kinds. The theorem below does not depend on historical rule names.

---

## 3. Preservation

Define:

```text
Preserves(C,r)
```

iff certificate `C` can coexist with standalone resource contract `r` without weakening its response relation, sharing policy, guards, deadline, or parity meaning.

This is semantic preservation.

A concrete implementation may use a cheaper sufficient local predicate, provided it proves the projection property needed by the cut theorem.

---

## 4. Per-pivot demand projection

Choose a distinguished unresolved requirement:

```text
T in U.
```

Let:

```text
Cert(T) = { A | T in Solves(A) }.
```

For each pivot certificate `A`, select a finite contract set:

```text
Demand(A) = D_A.
```

`D_A` need not include every semantic detail of `A`. It is a projection chosen for the proof.

It must satisfy the **projection-safety condition**:

```text
Compatible(A,C)
  => Preserves(C,r)
for every r in D_A.
```

The projection may be weaker than exact compatibility. That is desirable: if the residual is impossible even under the weaker preservation condition, the contradiction is stronger.

---

## 5. Proper residual

A pivot certificate may solve more than the distinguished requirement.

Therefore its residual obligation set is:

```text
S_A = U \ Solves(A).
```

This is mandatory.

Using a fixed residual `U \ {T}` for every pivot is sound only when every pivot solves no other obligation in `U`, or when the proof explicitly retains/account for the pivot's additional solved obligations.

The center experiment contained one multi-solve Highinverse pivot and exposed this exact distinction.

---

## 6. Feasible preservation family

For a fixed residual `S` and a finite set of typed resource contracts `R`, define:

```text
F(S,R) = {
    P subseteq R
    |
    there exists a pairwise-compatible certificate family Gamma
    covering every requirement in S
    such that every C in Gamma preserves every r in P
}.
```

### Downward-closure theorem

`F(S,R)` is downward closed.

If a witness family preserves all contracts in `P`, it also preserves every subset of `P`.

Therefore the family can be represented exactly by its inclusion-maximal antichain:

```text
P_max(S,R) = MaxSubsetAntichain(F(S,R)).
```

This result is independent of Connect Four.

---

## 7. Per-pivot cut theorem

Let `U` be unresolved requirements and `T in U` a pivot requirement.

For every pivot certificate `A in Cert(T)`, suppose:

1. its proper residual is

```text
S_A = U \ Solves(A);
```

2. a finite typed contract projection `D_A` is supplied;
3. projection safety is proved:

```text
Compatible(A,C)
  => Preserves(C,r)
for every r in D_A;
```

4. there is **no** pairwise-compatible certificate family that covers `S_A` while preserving every contract in `D_A`.

Then no pairwise-compatible certificate family covers all of `U`.

### Proof

Assume a complete compatible cover `Gamma` of `U` exists.

Because `T` is covered, choose a pivot certificate:

```text
A in Gamma
with T in Solves(A).
```

Every requirement in:

```text
S_A = U \ Solves(A)
```

must be solved by certificates compatible with `A`.

By projection safety, every such certificate preserves every contract in `D_A`.

Thus those residual certificates form a compatible cover of `S_A` preserving `D_A`, contradicting premise 4.

Since the contradiction holds for every possible pivot `A`, no complete cover exists. QED.

---

## 8. Antichain optimization inside one contract profile

When several pivots share the same residual set `S` and their resource contracts all belong to one finite contract universe `R`, their demands can be normalized.

Let:

```text
D = { D_A | A in some pivot class }.
```

For impossibility, supersets are redundant. Define:

```text
D_min = MinSubsetAntichain(D).
```

Compute:

```text
P_max(S,R).
```

If:

```text
for every D in D_min
for every P in P_max(S,R):
    D not subseteq P,
```

then every pivot in that class is refuted at once.

This is the correct antichain form of the earlier capacity intuition.

The scalar inequality:

```text
min |D| > max |P|
```

is only a sufficient corollary and may lose important contract identity.

---

## 9. Center instance: ordinary pivot class

For the two legal sibling states:

```text
451123 = D1 E1 A1 A2 B1 C1
451132 = D1 E1 A1 A2 C1 B1
```

the qualified 511-candidate certificate profile yields the same seven-requirement inclusion-minimal unsatisfiable core.

Take:

```text
T = A3-B3-C3-D3.
```

Nine of the ten pivot certificates solve only `T` inside that core.

For those nine, use reusable response-pair contracts:

```text
R_B = B2 -> B3
R_C = C2 -> C3
R_D = D2 -> D3
```

Their minimal demand antichain is:

```text
D_min = {
  {R_B,R_C},
  {R_B,R_D},
  {R_C,R_D}
}.
```

The common six-requirement residual has maximal feasible-preservation antichain:

```text
P_max = {
  {R_B},
  {R_C},
  {R_D}
}.
```

The compatibility projection has zero violations in the generated profile.

Therefore all nine ordinary pivot alternatives are refuted by the antichain cut.

The familiar scalar summary is:

```text
minimum reusable-pair demand = 2
residual reusable-pair capacity = 1
```

but the antichain identity is the stronger statement.

---

## 10. Center instance: exceptional multi-solve pivot

The tenth pivot is:

```text
Highinverse(B2:B4,D2:D4).
```

It solves both:

```text
A3-B3-C3-D3
A5-B4-C3-D2.
```

Therefore its proper residual has only five requirements.

The weak reusable-pair demand `{R_B,R_D}` is not sufficient to refute that smaller residual.

This is the falsifier that forced typed contracts.

The stronger generic resource projection is an exclusive guarded interval such as:

```text
HI_D = {
  footprint: {D2,D3,D4},
  sharing: exclusive,
  guard: no Claimeven bottom in D at or below row 4
}.
```

The profile audit establishes:

```text
Compatible(Highinverse(B2:B4,D2:D4), C)
    => Preserves(C,HI_D)
```

with zero observed projection violations.

The five-requirement proper residual has no compatible cover even under the relaxed condition that every selected residual certificate merely preserve `HI_D`.

Thus the exceptional pivot is refuted without retaining the historical rule name in the resulting cut certificate.

---

## 11. Solver-independent proof object

A compiled cut certificate can be represented as:

```text
ResourceCutCertificate {
  requirements: U,
  pivotRequirement: T,
  alternatives: [
    {
      pivotCertificateIdentity,
      solvedRequirements,
      properResidual,
      demandedContracts,
      projectionProof,
      residualNoCoverProof
    }, ...
  ],
  rankOrHorizon,
  provenance
}
```

Once compiled, the verifier does not need to know whether a demanded contract originated from a Lowinverse, Highinverse, Before, Specialbefore, or a future rule family.

It needs only:

- what the pivot solves;
- which generic contracts exact compatibility implies;
- why the proper residual has no cover preserving those contracts.

---

## 12. NDC integration

Suggested conceptual predicates:

```text
ResourceContract(r)
ContractFootprint(r,X)
ContractResponse(r,e1,e2)
ContractSharing(r,policy)
ContractGuard(r,g)
ContractDeadline(r,h)

Solves(C,T)
Demands(C,r)
Preserves(C,r)
ProjectionSafe(C,r)
Compatible(C1,C2)

ProperResidual(U,C,S)
PreservationFeasible(S,P)
NoCoverPreserving(S,D)
NoCompatibleCover(U)
```

The generic inference is:

```text
for every A solving pivot T:
    ProperResidual(U,A,S_A)
    ProjectionSafe(A,D_A)
    NoCoverPreserving(S_A,D_A)
------------------------------------------------
NoCompatibleCover(U)
```

This is a candidate first-class capacity rule for NDC.

---

## 13. Why this matters for the missing calculus

The central missing operation was previously described as strategic alternative resolution.

The typed cut theorem gives one concrete algebraic alternative eliminator:

```text
many incompatible certificate choices
    -> project each pivot to generic resource contracts
    -> solve residual preservation feasibility
    -> eliminate whole alternative classes without legal-move recursion
```

This is not yet completeness, but it is exactly the kind of operation the searchless hypothesis requires.

---

## 14. Monotonicity and falsification

The formulation is intentionally easy to falsify.

A cut proof must be recomputed or invalidated when:

- a new pivot certificate solves `T`;
- a known pivot is found to solve more requirements than recorded;
- a weaker valid demand projection is found;
- a new residual certificate makes `NoCoverPreserving` false;
- a projection-safety counterexample is found;
- a deadline/CPC distinction changes contract equivalence.

Conversely, adding stronger exact conflicts or guards can only reduce preservation feasibility.

This makes the calculus compatible with incremental NDC closure rather than requiring a once-for-all tactical taxonomy.

---

## 15. Remaining obligations

Before specification promotion:

1. make typed `ResourceContract` an explicit prototype object rather than an audit-side predicate;
2. derive contracts directly from generic event/order/CPC semantics;
3. qualify projection safety beyond the historical certificate profile;
4. test cuts on unrelated positions and complete small games;
5. map the same cut object into both forward Negamax discharge and backward BSFP predecessor closure;
6. determine whether repeated cut closure can produce the positive/progress side of the root proof, rather than only no-cover facts;
7. keep terminal-line provenance separate from W/D/L proof until the winning region is established.

No claim about the final perfect-play terminal-line subset or its cardinality follows yet.
