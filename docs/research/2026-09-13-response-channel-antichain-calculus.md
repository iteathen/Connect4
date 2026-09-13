# Response-channel antichain calculus

**Date:** 2026-09-13  
**Status:** generic research formalization derived from the center response-channel experiment; not yet an accepted specification  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and synthesis:** OpenAI ChatGPT

## Purpose

Abstract the center response-channel cut result away from historical Connect Four rule names.

The center experiment showed that a large certificate graph can collapse to two small set systems:

1. the response-channel sets that a certificate for one distinguished requirement may demand;
2. the response-channel sets that a compatible cover of the residual requirements can preserve.

The important observation is that the second family is downward closed. Therefore its complete information can be represented by its maximal antichain. The first family can be reduced to its minimal antichain for an impossibility proof.

This yields a generic NDC-compatible cut theorem that is strictly more informative than the scalar inequality `minimum demand > preservation capacity`.

---

## 1. Generic certificate interface

Let `U` be a finite set of unresolved requirements.

A proof certificate `C` has, at minimum:

```text
Solves(C)        subset of U
Resources(C)     finite resource/reservation footprint
Guards(C)        prerequisites under which the certificate is valid
Responses(C)     response obligations / event relations
Deadlines(C)     timing constraints when present
```

`Compatible(C1,C2)` means the two certificates can coexist without invalidating either certificate's guards, response obligations, reservations, or deadlines.

This relation must not be inferred from blocker coverage alone.

---

## 2. Response channels

A response channel is an abstract local interface:

```text
r = (Footprint(r), Contract(r)).
```

The footprint names the events/cells/reservoir slots reserved by the channel. The contract names the response relation or local guarantee that the reservation must retain.

For the center example:

```text
R_B = B2 -> B3
R_C = C2 -> C3
R_D = D2 -> D3
```

but the calculus does not require a channel to be a two-cell vertical relation. A channel may represent any bounded response resource whose preservation can be certified.

Define:

```text
Preserves(C,r)
```

iff `C` can coexist with the standalone contract of channel `r` without weakening that contract or adding an unstated prerequisite.

This is the semantic definition. A concrete subsystem may implement it with a cheaper local test.

In the center prototype the local test is:

```text
C is disjoint from the channel endpoints
OR
C reuses exactly the same response pair in that column.
```

That implementation was separately checked against the qualified compatibility graph before being used as a projection.

---

## 3. Channel demand

For a certificate `A`, let:

```text
Demand(A,R) subseteq R
```

be the channels from a selected finite channel universe `R` that `A` consumes as part of its proof interface.

`Demand` is not merely geometric overlap. It must be justified by the certificate's response/resource semantics.

The crucial projection condition for a distinguished certificate `A` is:

```text
r in Demand(A,R)
and Compatible(A,C)
    => Preserves(C,r).
```

Call this the **compatibility projection property**.

It says that once `A` reserves a channel as part of its proof, every other certificate admitted into the same proof family must leave that channel's contract intact.

The center prototype checks this property exhaustively for the projected channels and reports zero violations.

---

## 4. Residual feasible-preservation family

Choose a distinguished requirement `T in U` and a finite channel universe `R`.

Let the residual requirements be:

```text
S = U \ {T}.
```

Define the feasible-preservation family:

```text
F(S,R) = {
    P subseteq R
    |
    there exists a pairwise-compatible certificate family Gamma
    such that Gamma covers every requirement in S
    and every C in Gamma preserves every r in P
}.
```

### Downward-closure theorem

`F(S,R)` is downward closed under set inclusion.

Proof: if `P in F(S,R)`, there is a witness family `Gamma` preserving every channel in `P`. The same `Gamma` preserves every channel in every subset `P' subseteq P`. Therefore every subset of a feasible preservation set is also feasible. QED.

Consequently, the entire preservation family can be represented by its inclusion-maximal elements:

```text
P_max(S,R) = MaxSubsetAntichain(F(S,R)).
```

Every feasible preservation set is a subset of at least one member of `P_max`.

---

## 5. Demand antichain

Let:

```text
Cert(T) = { A | T in Solves(A) }.
```

The raw demand family is:

```text
D(T,R) = { Demand(A,R) | A in Cert(T) }.
```

For an impossibility proof, supersets are redundant. If a demand set `D1` is already impossible to preserve, any `D2` with `D1 subset D2` is also impossible.

Therefore normalize to the inclusion-minimal demand antichain:

```text
D_min(T,R) = MinSubsetAntichain(D(T,R)).
```

Every raw certificate demand contains at least one member of `D_min`.

This is the same antichain-normalization principle already used for residual requirements and blockers, now applied to response-resource demand.

---

## 6. Antichain cut theorem

Assume:

1. every certificate `A` solving `T` has a certified demand set `Demand(A,R)`;
2. the compatibility projection property holds for every such `A`;
3. `P_max(S,R)` exactly represents the residual feasible-preservation family;
4. for every `D in D_min(T,R)` and every `P in P_max(S,R)`:

```text
D is not a subset of P.
```

Then no compatible certificate family covers all of `U`.

### Proof

Assume a complete compatible cover `Gamma*` exists.

Some certificate `A in Gamma*` solves the distinguished requirement `T`.

Let:

```text
D_A = Demand(A,R).
```

By the compatibility projection property, every other certificate in `Gamma*` preserves every channel in `D_A`.

After removing `A`, the remaining certificates still cover the residual requirement set `S` (possibly with `A` also covering some residual requirements; retaining `A` as a passive compatible certificate only strengthens the preservation argument). Thus `D_A` must be a feasible preservation set for the residual proof context.

Because `F(S,R)` is downward closed and represented by `P_max`, there exists some `P in P_max(S,R)` with:

```text
D_A subseteq P.
```

Every raw demand contains some minimal demand `D in D_min(T,R)`:

```text
D subseteq D_A subseteq P.
```

This contradicts assumption 4.

Therefore no complete compatible cover exists. QED.

### Conservative formulation note

If a selected certificate for `T` also solves residual requirements, the implementation may define `S_A = U \ Solves(A)` and compute preservation feasibility against `S_A` rather than `U \ {T}`. The fixed-residual form above is sound when the residual feasibility test permits the pivot certificate to remain selected or when its extra solved requirements are explicitly accounted for. Implementations should preserve this distinction rather than silently dropping pivot coverage.

---

## 7. Scalar capacity as a corollary

Define:

```text
MinDemandCardinality(T,R)
    = min |D| over D in D_min(T,R)

PreservationCapacity(S,R)
    = max |P| over P in P_max(S,R).
```

If:

```text
MinDemandCardinality(T,R)
    > PreservationCapacity(S,R),
```

then the antichain cut condition follows immediately.

This is a useful cheap sufficient test, but it discards structure.

For example, equal cardinalities can still be incompatible when the actual channel identities differ. The antichain relation is therefore the primary theorem; the scalar capacity comparison is only a corollary.

---

## 8. Center instance

For both legal center branches:

```text
451123 = D1 E1 A1 A2 B1 C1
451132 = D1 E1 A1 A2 C1 B1
```

the distinguished requirement is:

```text
T = A3-B3-C3-D3.
```

The channel universe is:

```text
R = {R_B,R_C,R_D}.
```

Ten historical certificate instances solve `T`, but after demand normalization they collapse to only three alternatives:

```text
D_min(T,R) = {
    {R_B,R_C},
    {R_B,R_D},
    {R_C,R_D}
}.
```

The residual six requirements have maximal feasible preservation antichain:

```text
P_max(S,R) = {
    {R_B},
    {R_C},
    {R_D}
}.
```

No demand pair is contained in any preservation singleton.

Therefore the seven-requirement core is incompatible.

In bitmask form, with `R_B=001`, `R_C=010`, `R_D=100`:

```text
D_min = {011,101,110}
P_max = {001,010,100}
```

The final proof check is only:

```text
for every D in D_min:
    for every P in P_max:
        assert((D & ~P) != 0)
```

The 511-candidate graph is needed to qualify the antichains in this experiment, but it is not needed to carry the resulting proof certificate forward.

---

## 9. Monotonicity properties

The antichain formulation has useful monotonic behavior.

### More residual requirements

If `S subseteq S'`, any cover of `S'` is also a cover of `S`.

Therefore:

```text
F(S',R) subseteq F(S,R).
```

Adding residual obligations cannot increase preservation feasibility.

### Stronger compatibility/resource constraints

If closure discovers additional valid conflicts, deadlines, or reservation requirements, feasible preservation sets can only disappear.

Thus the preservation family again shrinks monotonically.

### Additional residual certificate alternatives

Adding a newly proved certificate may enlarge `F(S,R)`.

This is intentionally falsification-friendly: a previously claimed capacity contradiction must be rechecked if the proof system learns a genuinely new compatible alternative.

### Additional pivot alternatives

Adding a new certificate for `T` may introduce a smaller demand set and move `D_min` downward.

That can destroy a cut proof, which is also correct: an impossibility theorem must not survive the discovery of a cheaper valid way to solve the pivot requirement.

---

## 10. Suggested NDC predicates

The following are sufficient conceptual predicates; exact representation remains an implementation choice:

```text
Channel(r)
ChannelFootprint(r,X)
ChannelContract(r,Phi)

Solves(C,T)
CertificateResource(C,x)
CertificateResponse(C,e1,e2)
CertificateGuard(C,g)
CertificateDeadline(C,h)

Demands(C,r)
Preserves(C,r)
Compatible(C1,C2)
ProjectionSafe(C,r)

PreservationFeasible(S,P)
MaxPreservationSet(S,P)
MinDemandSet(T,D)
NoCompatibleCover(U)
```

A compiled cut certificate can contain:

```text
ResponseCutCertificate {
    requirements: U,
    pivot: T,
    channels: R,
    minimalDemandAntichain: D_min,
    maximalPreservationAntichain: P_max,
    projectionWitnesses,
    premiseGuards,
    provenance
}
```

The verifier does not need to know whether a demand set originally came from a Lowinverse, Highinverse, Before, Specialbefore, or a future rule family. It needs only the generic channel contracts and the witnesses establishing the two antichains.

---

## 11. Relation to the larger algebra

This construction links three pieces of the developing framework:

1. **order / response algebra** supplies the channel contracts and deadlines;
2. **hypergraph / set algebra** supplies requirement coverage, demand sets, preservation families, and antichain normalization;
3. **NDC monotone closure** propagates compatibility/resource facts until the cut becomes certifiable.

GF(2) parity can enter by changing which channels exist or which certificates preserve them, but parity is not a separate primitive in the final cut theorem.

This is evidence that some apparently game-specific strategic rules can be compiled into a smaller generic algebra of bounded response resources plus set closure.

---

## 12. Remaining proof obligations

The center antichain theorem is exact only for its declared certificate profile. Before promoting this calculus from research to accepted solver semantics, the following still need qualification:

1. derive channel contracts directly from generic event/response semantics rather than historical named rules;
2. prove `Demand` extraction sound for generic certificates;
3. prove `Preserves` composition with deadlines and CPC reservoirs, not only local resource footprints;
4. define how pivot certificates that solve multiple residual requirements are normalized in the preservation-family computation;
5. test antichain cuts on unrelated positions and on deliberately adversarial certificate families;
6. verify that introducing more general NDC/race certificates does not dissolve the center cut;
7. establish how antichain certificates participate in predecessor closure without importing solved-game line classifications.

No claim about the final perfect-play terminal-line subset follows yet.

---

## 13. Durable result

The center experiment has now compressed through three levels:

```text
511 named certificate instances
    -> 7-requirement incompatibility core
    -> 3-channel demand/preservation antichain cut
```

The final structural certificate is:

```text
D_min = {{B,C},{B,D},{C,D}}
P_max = {{B},{C},{D}}
```

with a separately verified compatibility projection.

That is the current candidate primitive for the next NDC layer: **response-channel antichain cut deficiency**.
