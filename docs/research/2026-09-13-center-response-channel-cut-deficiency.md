# Center response-channel cut deficiency

**Date:** 2026-09-13  
**Status:** corrected exact certificate-profile theorem / structural research result; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Correction notice

This note supersedes the earlier unconditioned `2 > 1` interpretation of the center response-channel experiment.

The underlying 511-candidate compatibility experiment, the seven-requirement inclusion-minimal core, and the raw three-channel projection remain valid observations. The earlier proof step was too strong in one place: it treated the residual problem as `U \ {T}` for every certificate solving the pivot requirement `T`.

One Highinverse pivot solves **two** core requirements. Its proper residual is therefore smaller:

```text
S_A = U \ Solves(A),
```

not blindly `U \ {T}`.

With that correction, the weak reusable-pair channel projection closes nine of the ten pivot alternatives. The tenth closes only after preserving the stronger resource contract actually carried by that Highinverse: an **exclusive guarded column interval**, including its no-Claimeven-below guard.

The corrected result is stronger conceptually: response resources must be typed by their contract, not represented only by cell identity.

---

## 1. Scope and anti-leakage

The experiment uses only:

- standard 7x6 connect-4 geometry;
- the two legal positions below;
- mechanically generated P0 winning requirements still live at those positions;
- a qualified local certificate family compiled from Claimeven, Vertical, Baseinverse, Lowinverse, Highinverse, Baseclaim, Before, Aftereven, and Specialbefore consequences;
- the published pairwise compatibility conditions for those certificate kinds, translated into resource predicates;
- mechanical satisfiability checks over the resulting finite certificate system.

It does **not** use:

- a solved terminal-line classification;
- a perfect-play terminal-line witness;
- the suspected final cardinality 28;
- a solved-game database to choose the core;
- the quarantined perfect-play line oracle branch.

`28` remains an output hypothesis only.

A separate exact W/D/L control check labeled both six-ply positions as P0 wins. That label establishes only that the experiment is not obviously on an irrelevant losing detour. It is not a premise of the structural theorem and is not used by the certificate generator or cut proof.

Oddthreat and ThreatCombination are not part of the P1 safety-cover family tested here. In the referenced Victor formulation they are P0/White win-condition guarantors rather than P1/Black defensive certificates.

---

## 2. The two legal center branches

The experiment is run independently on:

```text
451123 = D1 E1 A1 A2 B1 C1
451132 = D1 E1 A1 A2 C1 B1
```

Both positions have 57 surviving geometric P0 winning requirements.

The generated certificate profile is the same size in both states:

```text
Claimeven       16
Vertical        13
Baseinverse      7
Lowinverse      36
Highinverse     36
Baseclaim        8
Before          380
Aftereven        4
Specialbefore   11
------------------
Total          511
```

The 380 Before instances are intentional. The generator follows the recursive variation construction, rather than selecting one deterministic component per empty Before-group cell.

---

## 3. Global compatibility result

No pairwise-compatible certificate set covers all 57 surviving P0 requirements in either position.

Maximum compatible coverage is:

```text
451123: 53 / 57
451132: 54 / 57
```

Greedy deletion with a full satisfiability recheck produces the same inclusion-minimal unsatisfiable seven-requirement core in both states:

```text
U = {
  A3-B3-C3-D3,
  C4-D3-E2-F1,
  A5-B4-C3-D2,
  C5-D4-E3-F2,
  D5-E5-F5-G5,
  D5-E4-F3-G2,
  A6-B5-C4-D3
}
```

Removing any one of those seven makes the other six satisfiable in the declared certificate profile.

This is inclusion-minimality only; no claim is made that seven is the globally minimum unsatisfiable cardinality among every subset of the 57 surviving requirements.

---

## 4. Pivot requirement

Choose:

```text
T = A3-B3-C3-D3.
```

Exactly ten generated certificate instances solve `T`:

```text
3 Highinverse
3 Lowinverse
1 Before
3 Specialbefore
```

The original projection used three lower response pairs:

```text
R_B = B2 -> B3
R_C = C2 -> C3
R_D = D2 -> D3
```

For a certificate `C`, the weak predicate `PreservesLower(C,R_x)` means:

1. `C` does not use either endpoint of the pair; or
2. in that column, `C` uses exactly the same two cells with the same lower-to-upper response relation.

This is a **reusable-pair contract**. It is deliberately weaker than full certificate compatibility.

---

## 5. Raw lower-channel projection

Projecting the ten pivot certificates onto `{R_B,R_C,R_D}` gives the minimal raw demand antichain:

```text
{{R_B,R_C}, {R_B,R_D}, {R_C,R_D}}.
```

Every pivot alternative uses at least two of those lower pairs.

If the residual is incorrectly fixed to `U \ {T}` for all pivots, then its maximal feasible weak-preservation antichain is:

```text
{{R_B}, {R_C}, {R_D}}.
```

Equivalently, that six-requirement residual can preserve any one lower pair, but no pair of lower pairs.

The compatibility projection itself is valid:

```text
Compatible(A,C)
  => PreservesLower(C,r)
```

for every weak lower pair `r` attributed to every pivot `A`.

The exhaustive check found zero violations.

What was wrong was **not** the projection relation. The error was using the same six-requirement residual for a pivot that itself solves another core requirement.

---

## 6. Proper residual audit

For each pivot certificate `A`, the correct residual is:

```text
S_A = U \ Solves(A).
```

Nine of the ten pivot alternatives solve only `T` inside the seven-line core.

For all nine:

```text
S_A = U \ {T},
```

and preserving the pivot's weak lower-pair demand makes `S_A` unsatisfiable.

So the original reusable-pair cut is already sufficient for nine alternatives.

Exactly one pivot is different:

```text
A* = Highinverse(B2:B4, D2:D4).
```

Within the seven-line core it solves:

```text
A3-B3-C3-D3
A5-B4-C3-D2
```

Therefore:

```text
S_A* = {
  C4-D3-E2-F1,
  C5-D4-E3-F2,
  D5-E5-F5-G5,
  D5-E4-F3-G2,
  A6-B5-C4-D3
}.
```

The weak reusable-pair projection `{R_B,R_D}` does **not** refute that five-requirement residual. A relaxed residual cover exists while preserving those raw pairs.

This falsifies the unconditioned three-channel antichain theorem as a complete proof of the seven-line core.

---

## 7. Why the weak projection fails for the Highinverse pivot

The counterexample does not reveal a new geometric blocker. It reveals missing **resource type information**.

A Lowinverse or Before may legitimately share an identical response pair such as:

```text
D2 -> D3.
```

The exceptional Highinverse does not expose that same resource under the same sharing semantics.

Its B and D columns are guarded three-cell structures:

```text
B2-B3-B4
D2-D3-D4
```

and its qualified compatibility conditions require more than retaining `B2->B3` and `D2->D3` as abstract pairs.

The relevant generic contract for one such column is:

```text
HIColumn(c,2,4) = {
  footprint: {c2,c3,c4},
  sharing: exclusive,
  guard: no Claimeven-bottom obligation in column c at or below row 4
}.
```

The exact historical rule name is not part of the contract. The contract records the resource semantics that make the certificate valid.

---

## 8. Typed-contract projection

Define:

```text
PreservesHIColumn(C,c,2,4)
```

in the experiment by the following relaxed sufficient condition:

```text
C uses no resource cell c2,c3,c4
and
C has no Claimeven bottom in column c at row <= 4.
```

This intentionally forbids reuse. It is a generic **exclusive guarded interval** contract.

For the exceptional pivot:

```text
A* = Highinverse(B2:B4, D2:D4),
```

the experiment checks:

```text
Compatible(A*,C)
  => PreservesHIColumn(C,B,2,4)
     and PreservesHIColumn(C,D,2,4).
```

Across all 511 generated candidates, on both sibling positions:

```text
projection violations = 0.
```

Thus the typed contract is a sound relaxation of exact compatibility for this pivot profile.

---

## 9. Exceptional pivot residual

Now discard the historical Highinverse compatibility predicate and retain only the generic typed contracts.

Ask whether the five proper residual requirements `S_A*` admit a pairwise-compatible cover while every selected residual certificate preserves both exclusive guarded intervals:

```text
HIColumn(B,2,4)
HIColumn(D,2,4).
```

For both sibling states:

```text
residual satisfiable = false.
```

A stronger diagnostic is also reproducible:

```text
preserve neither HI interval: yes
preserve B interval only:     yes
preserve D interval only:     no
preserve B and D intervals:   no
```

So the D-column typed contract alone is already sufficient to destroy residual feasibility. The pivot itself demands both columns, but the impossibility proof can project to the smaller sufficient contract `{HIColumn(D,2,4)}`.

This gives a cleaner minimal proof interface for the exceptional pivot.

---

## 10. Corrected center theorem

Let `Cert(T)` be the ten certificates solving the pivot requirement `T`.

For each `A in Cert(T)` define:

```text
S_A = U \ Solves(A)
```

and choose a typed contract projection `D_A` satisfying:

```text
Compatible(A,C)
  => every contract in D_A is preserved by C.
```

The experiment establishes:

### Nine ordinary pivots

For nine pivots, `D_A` can be expressed using reusable lower response-pair contracts drawn from:

```text
{R_B,R_C,R_D}.
```

Each proper residual is unsatisfiable under preservation of the pivot's projected lower-pair demand.

### One exceptional Highinverse pivot

For:

```text
A* = Highinverse(B2:B4,D2:D4),
```

raw lower pairs are insufficient because `A*` also solves another core requirement.

A sound stronger projection is:

```text
D_A* = { HIColumn(D,2,4) }
```

or conservatively both B and D HI-column contracts.

The proper five-requirement residual is unsatisfiable while preserving that typed contract, and exact compatibility implies preservation with zero observed violations.

Therefore every possible pivot certificate is structurally incompatible with a complete cover of its own proper residual.

Hence the seven-requirement core has no complete compatible cover in the declared 511-candidate profile.

---

## 11. Generic per-pivot cut rule

The corrected reusable theorem is not a single global `2 > 1` inequality.

For unresolved requirements `U`, pivot requirement `T`, and each pivot certificate `A` solving `T`:

1. compute the **proper residual**

```text
S_A = U \ Solves(A);
```

2. extract a finite set of typed resource contracts `D_A`;
3. prove the projection property

```text
Compatible(A,C) => Preserves(C,d)
for every d in D_A;
```

4. test the relaxed residual system:

```text
exists a compatible cover of S_A
whose certificates preserve every d in D_A?
```

If the answer is no for every pivot `A`, then no complete compatible cover of `U` exists.

This is sound because any complete cover must select at least one pivot certificate. Every other certificate in that cover would have to preserve the pivot's projected contracts, yet those preserved contracts make the proper residual impossible.

The residual test is deliberately **relaxed**: it does not require residual certificates to be exactly compatible with the pivot, only to preserve the pivot's generic projected contracts. Failure under the relaxation is therefore sufficient.

---

## 12. Contract shape

The center falsifier shows that a response channel cannot generally be represented as a cell pair alone.

A useful generic contract type is:

```text
ResourceContract {
  footprint,
  response_relation?,
  sharing_policy,
  forbidden_reservations?,
  guards?,
  deadline_or_horizon?,
  parity_or_CPC_commitment?
}
```

Examples from this experiment:

### Reusable response pair

```text
footprint: {D2,D3}
response: D2 -> D3
sharing: exact-reuse allowed
```

### Exclusive guarded interval

```text
footprint: {D2,D3,D4}
sharing: exclusive
guard: no Claimeven bottom in D at row <= 4
```

They touch the same lower cells but are not interchangeable proof resources.

---

## 13. Relation to NDC

The result now fits the intended NDC semantics more naturally than the raw scalar cut did.

A compiled NDC proof state needs to preserve not only:

```text
SolvedRequirements
```

but also the resource contracts that certified those solved requirements:

```text
ReservedResources
ResponseRelations
SharingPolicies
Guards
Deadlines
CPC / parity commitments
```

The center theorem is therefore a concrete demonstration of the C4-0007 principle that local blocker truth is insufficient if the reservations and response resources that produced it are discarded.

The generic inference target becomes:

```text
For every pivot certificate A solving T:
    ProperResidual(A) = U \ Solves(A)
    ProjectionSafe(A,D_A)
    NoCoverPreserving(ProperResidual(A),D_A)
-------------------------------------------------
NoCompatibleCover(U)
```

This is a candidate first-class NDC capacity rule.

---

## 14. What remains unproved

This note does **not** prove:

- completeness of the 511-candidate historical certificate profile for arbitrary Connect Four defensive reasoning;
- that no future generic NDC/race certificate can dissolve this profile-specific core;
- that either six-ply position is itself a complete predecessor theorem for the root winning region;
- any perfect-play terminal-line membership;
- cardinality 28.

The exact result is profile-relative:

1. the declared 511-candidate system is globally unsatisfiable on both sibling states;
2. both produce the same seven-requirement inclusion-minimal core;
3. nine pivot alternatives are refuted by weak reusable-pair projections on their proper residuals;
4. the one multi-solve Highinverse alternative is refuted by a typed exclusive guarded interval projection;
5. all tested compatibility-to-contract projection checks have zero violations.

The research hypothesis is that this **typed per-pivot resource-cut calculus** can replace a substantial amount of named-rule reasoning once the contracts are derived directly from event/order/CPC semantics.

---

## 15. Reproducer state

The base compatibility experiment remains in:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/
  center_certificate_compatibility_core.mjs
```

That prototype reproduces the 511-candidate system, global CSP, seven-line core, and raw channel diagnostics.

A subsequent pivot audit detected the multi-solve exception described here. The durable corrected readout records, for each of the ten pivot alternatives:

```text
Solves(A) intersect U
proper residual status under weak lower-pair projection
whether a stricter typed contract was required
projection-violation count
proper residual status under the stricter projection
```

The next implementation step is to make typed `ResourceContract` values first-class in the prototype rather than treating the Highinverse contract as an exceptional audit predicate.
