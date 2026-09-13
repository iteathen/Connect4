# Center response-channel cut deficiency

**Date:** 2026-09-13  
**Status:** exact certificate-profile theorem / structural research result; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

Replace the earlier informal “moving defect” picture with a compact, falsifiable capacity theorem.

The immediate question is not whether one particular Connect Four line is statically coverable. It is whether a family of blocker/response certificates can be selected **simultaneously**, while preserving the response resources that made each certificate valid.

This note records a concrete center-position example in which a 511-candidate qualified certificate family reduces to a seven-requirement incompatibility core and then to a three-channel cut with a one-unit capacity deficiency.

The result is important because the final proof no longer depends on the names of the classical Connect Four rules. The named rules are used here as a rich regression profile from which generic response-resource predicates are extracted.

---

## 1. Scope and anti-leakage

The experiment uses only:

- standard 7x6 connect-4 geometry;
- the legal positions named below;
- mechanically generated P0 winning requirements still live at those positions;
- a qualified local certificate family compiled from Claimeven, Vertical, Baseinverse, Lowinverse, Highinverse, Baseclaim, Before, Aftereven, and Specialbefore consequences;
- the published pairwise compatibility conditions for those certificate kinds, translated into resource predicates.

It does **not** use:

- a solved terminal-line classification;
- a perfect-play witness sequence for any target line;
- the suspected final cardinality 28;
- a solved-game database to choose the seven-line core;
- the quarantined perfect-play line oracle branch.

`28` remains an output hypothesis only.

A separate exact W/D/L control check labeled both six-ply positions below as P0 wins. That control result is useful only to establish experimental relevance. It is **not** a premise of the certificate theorem and is not used by the prototype.

Oddthreat and ThreatCombination are not part of the P1 safety-cover family tested here. In the referenced Victor formulation they are White/P0 win-condition guarantors, rather than Black/P1 defensive certificates. This exclusion therefore does not remove a P1 blocker family from the declared profile.

---

## 2. The two legal center branches

The experiment is run independently on these legal six-ply positions:

```text
451123 = D1 E1 A1 A2 B1 C1
451132 = D1 E1 A1 A2 C1 B1
```

In the first position:

```text
P0: D1 A1 B1
P1: E1 A2 C1
P0 to move
```

In the sibling position:

```text
P0: D1 A1 C1
P1: E1 A2 B1
P0 to move
```

Both positions have 57 surviving geometric P0 winning requirements.

The candidate generator produces the same 511 certificates in both positions:

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

The large Before count is intentional. The prototype follows the reference recursive variation construction rather than choosing one deterministic component for each empty Before-group cell.

---

## 3. Global compatibility result

No pairwise-compatible certificate set covers all 57 surviving P0 requirements in either position.

The maximum compatible coverage is:

```text
451123: 53 / 57
451132: 54 / 57
```

Greedy deletion with full satisfiability rechecks produces the same inclusion-minimal unsatisfiable seven-requirement core in both positions:

```text
1. A3-B3-C3-D3
2. C4-D3-E2-F1
3. A5-B4-C3-D2
4. C5-D4-E3-F2
5. D5-E5-F5-G5
6. D5-E4-F3-G2
7. A6-B5-C4-D3
```

“Inclusion-minimal” means that removing any one of these seven makes the remaining six satisfiable in the declared certificate profile. It does not claim this is the globally minimum-cardinality unsatisfiable set among every possible subset of the 57 requirements.

The seven-line list is evidence. The more useful result is the quotient below.

---

## 4. Three lower response channels

Define three response channels across the row-2/row-3 cut:

```text
R_B = B2 -> B3
R_C = C2 -> C3
R_D = D2 -> D3
```

The arrow means a reserved trigger/response relation, not merely ownership of two cells.

For a certificate `C`, define `Preserves(C, R_x)` as follows.

`C` preserves `R_x` if either:

1. `C` does not consume either endpoint of that channel; or
2. in column `x`, `C` uses exactly the two channel cells and carries the same lower-to-upper response edge.

Thus exact reuse of the same response pair is allowed, while partial overlap, reversed use, or extension of that column resource into a different local certificate does not count as preservation in this projection.

This predicate deliberately forgets the historical rule name. It retains only the response resource needed at the cut.

---

## 5. Lower-horizontal channel demand

Consider the first core requirement:

```text
H = A3-B3-C3-D3.
```

There are exactly ten certificates in the declared profile that can cover `H` in either sibling position.

They consist of:

- 3 Highinverse choices;
- 3 Lowinverse choices;
- 1 Before choice using all three lower Verticals;
- 3 Specialbefore choices, each replacing one internal lower response with the external A3 Baseinverse relation.

Project each such certificate onto `{R_B,R_C,R_D}`.

Every one consumes at least two channels:

```text
Highinverse / Lowinverse:
  {R_B,R_C}, {R_B,R_D}, or {R_C,R_D}

Before:
  {R_B,R_C,R_D}

Specialbefore:
  exactly two of {R_B,R_C,R_D}
```

Therefore:

```text
minimum_channel_demand(H) = 2.
```

This is an exact enumeration fact for the qualified profile, not an inferred heuristic.

---

## 6. Compatibility projection lemma

The prototype then checks every pair:

```text
A = a certificate covering H
C = any other candidate certificate
```

For every channel `R` consumed by `A`, it verifies:

```text
Compatible(A,C)  =>  Preserves(C,R).
```

Across both sibling positions the number of violations is:

```text
0.
```

This establishes the key projection property: once a particular blocker for `H` is selected, every other certificate in the same compatible proof family must preserve every lower response channel that blocker requires.

The full named-rule compatibility graph can therefore be soundly projected onto the three channel-preservation bits for this proof.

---

## 7. Residual preservation capacity

Remove `H` and ask whether the other six core requirements can be covered while requiring selected certificates to preserve specified subsets of the three lower channels.

For **both** sibling positions, the result is identical:

```text
Required preserved channels    residual six satisfiable?
---------------------------------------------------------
{}                              yes
{R_B}                           yes
{R_C}                           yes
{R_D}                           yes
{R_B,R_C}                       no
{R_B,R_D}                       no
{R_C,R_D}                       no
{R_B,R_C,R_D}                   no
```

Hence the residual certificate system has preservation capacity:

```text
preservation_capacity(residual six) = 1.
```

The exact identity of the preserved singleton channel does not matter. Any one can survive; no pair can.

---

## 8. Response-channel cut theorem

The complete incompatibility now follows without inspecting 511 named certificates individually.

Assume a complete compatible cover of the seven-requirement core exists.

It must contain some certificate `A` that covers:

```text
A3-B3-C3-D3.
```

From Section 5:

```text
|Demand(A)| >= 2.
```

From the compatibility projection lemma, every other certificate in the cover must preserve every channel in `Demand(A)`.

Therefore the residual six requirements would need a compatible cover preserving at least two lower channels.

But Section 7 proves:

```text
preservation_capacity(residual six) = 1.
```

Contradiction.

So no complete compatible cover exists.

The deficiency is exactly one channel at this cut:

```text
demand = 2
capacity = 1
shortfall = 1
```

This is the first compact capacity certificate obtained from the corrected center-response investigation.

---

## 9. Generic form

The useful result is not specific to `A3-B3-C3-D3`.

Let:

- `U` be a set of unresolved requirements;
- `T in U` be one distinguished requirement;
- `R` be a finite response-channel set;
- `Cert(T)` be the certificates capable of solving `T`;
- `Demand(A) subseteq R` be the channels consumed by certificate `A`;
- `Preserves(C,r)` mean certificate `C` can coexist with channel `r` unchanged;
- `Cap(U\{T})` be the maximum number of channels that can be required preserved while the residual requirements still admit a compatible cover.

If:

```text
for every A in Cert(T):
    |Demand(A)| >= d

and

Compatible(A,C) =>
    Preserves(C,r) for every r in Demand(A)

and

Cap(U\{T}) = p < d,
```

then `U` has no complete compatible certificate cover.

Equivalently:

```text
minimum demand > residual preservation capacity
    => incompatibility.
```

This is a generic response-capacity cut rule suitable for NDC.

It is structurally closer to Hall deficiency / cut capacity than to a Connect Four tactical pattern: one side of the cut requires a minimum number of response channels; the other side cannot preserve that many channels while satisfying its own obligations.

---

## 10. NDC interpretation

This result clarifies the missing algebra identified by the earlier scheduling correction.

Static blocker coverage alone is insufficient. A blocker certificate carries a resource footprint, and selecting it constrains the response channels available to all other certificates.

A useful NDC state therefore needs at least:

```text
SolvedRequirements
ReservedResponseChannels
PreservedResponseChannels
CertificateCompatibility
Deadline / precedence guards
```

A monotone inference rule can then be added in the form:

```text
MinDemand(T,R) = d
ResidualPreservationCapacity(U\{T},R) = p
p < d
----------------------------------------
NoCompatibleCover(U)
```

The named classical rules can remain compiler inputs or regression tests. The closure theorem itself is stated over generic channel demand and capacity predicates.

---

## 11. What this does not prove

This note does **not** yet prove:

- that the 511-candidate Victor-derived profile is complete for arbitrary Connect Four defensive reasoning;
- that no more general conditional/race certificate outside that profile can solve the same seven requirements;
- that either six-ply position is itself a predecessor theorem for the complete perfect-play winning region;
- that any particular geometric line belongs or does not belong to the final perfect-play terminal-line subset;
- that the final subset has cardinality 28.

Pairwise Victor compatibility is used here as a qualified reference profile. The generic NDC calculus may ultimately permit combinations that the historical profile does not express, or reject historical combinations for stronger deadline reasons.

The theorem therefore has two layers:

1. **Exact profile theorem:** the declared 511-candidate certificate system has the seven-line incompatibility and the `2 > 1` response-channel cut on both sibling branches.
2. **Research hypothesis:** response-channel cut deficiency is a reusable rule-independent predicate that can replace a substantial fraction of named strategic-rule reasoning in the self-proving perfect-play calculus.

Only layer 1 is established here.

---

## 12. Reproducer

The exact experiment is preserved at:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/
  center_certificate_compatibility_core.mjs
```

It asserts:

- 69 geometric lines;
- both six-ply sibling states;
- 57 surviving P0 requirements per state;
- 511 generated candidate certificates per state;
- no complete compatible cover;
- the same seven-line inclusion-minimal core;
- all ten blockers of `A3-B3-C3-D3` consume at least two lower response channels;
- residual singleton-channel preservation is satisfiable;
- residual pair-channel preservation is unsatisfiable for every pair;
- compatibility-projection violations are zero;
- therefore channel demand `2` exceeds residual preservation capacity `1` on both branches.

This is the durable checkpoint for the next step: derive the channel-demand/capacity predicates directly from generic response obligations, rather than from the names of the historical Connect Four rules.
