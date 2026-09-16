# Response/control decomposition for Connect-4

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Continue the decomposition-first program from geometry into strategic response/control semantics.

The objective is not to preserve historical rule names. It is to isolate the smallest relations their valid consequences require, then determine whether those relations are already derived from support, derivative geometry, GF(2) parity and deadlines.

This note distinguishes **consequence shape** from **certificate shape**. Two rules may certify the same blocker relation by different support/resource/deadline mechanisms.

## 1. Fundamental event/support object

After a prefix with column heights `h_c`, future events in each column form a chain

```text
(c,h_c) < (c,h_c+1) < ... < (c,H-1).
```

A response fragment `F` consumes some finite number `n_c(F)` of those events in each column.

The support frontier update is not a new strategic axiom. It is the direct chain action

```text
h'_c = h_c + n_c(F).
```

Define the total consumed rank and the mod-2 column transport by

```text
|F|   = sum_c n_c(F)
tau(F)= sum_c (n_c(F) mod 2) e_c  in F2^W.
```

These are two projections of the same consumption vector.

## 2. CPC and phase are projections of response transport

For a fixed future target in the basic zero-reservation CPC reservoir,

```text
N(t)=(W-1)H-ply+r+1.
```

After consuming `F`,

```text
ply' = ply + |F|,
```

so the target event-rank parity changes by

```text
|F| mod 2.
```

This is the generic even-release condition.

The distribution of the same consumed events across columns is `tau(F)`.

Examples:

```text
same-column two-event response:
  n_c=2
  |F|=2
  tau=0

cross-column pair in a,b:
  n_a=n_b=1
  |F|=2
  tau=e_a+e_b.
```

Thus an even response can preserve global CPC parity while still moving the line-side phase boundary. The two effects are not competing calculi; they are different projections of one support-consumption vector.

## 3. Column-path lift

The width phase quotient is canonically the boundary space of the column path

```text
0--1--2--...--(W-1).
```

For a cross-column pair,

```text
tau=e_a+e_b
```

has a unique path lift: the interval of adjacent column edges between `a` and `b`.

Therefore the previously qualified phase transport length

```text
lambda(a,b)=|a-b|
```

is the path length of the support-consumption boundary.

A same-column response is the zero path.

This relationship is derived and survives arbitrary board width.

## 4. Consequence module: blockers

At the blocker/requirement layer, a certified pair blocker has incidence

```text
b = e_u + e_v.
```

As an abstract GF(2) consequence, every two-event blocker is a boundary of a path joining its endpoints in an appropriate typed event graph.

This observation does **not** mean the path edges individually inherit the blocker certificate. The certificate may be nonlocal. It means only that pair-blocker consequence shape belongs to one boundary module.

Singleton blockers are anchored ownership consequences rather than unanchored pair boundaries.

Larger blocker sets remain ordinary WSL/residual subsets; no claim is made here that every larger blocker is a graph boundary.

## 5. Elementary named rules after decomposition

Using the already-preserved U1/U2 semantics:

### Claimeven

- resource/certificate shape: trigger lower support event -> response upper event in one column;
- consumption transport: same-column two-event fragment, so `tau=0` and even global release;
- blocker consequence: guaranteed upper-event singleton.

Its geometry is a first vertical derivative/support edge plus an anchored ownership consequence.

### Baseinverse

- resource/certificate shape: two appropriately playable frontier events in different columns;
- transport: `tau=e_a+e_b`, with unique column-path lift;
- blocker consequence: the opponent cannot own both endpoints.

Its consequence is a pair boundary; its validity still requires the Baseinverse playability/resource premise.

### Vertical

- resource/certificate shape: same-column support response;
- transport: zero phase transport;
- blocker consequence: two-event blocker.

### Lowinverse / Highinverse / Baseclaim

The previously preserved strategic algebra reduces their useful consequences to several pair blockers (vertical pairs and cross-pairs). At consequence level these all live in the same pair-boundary module.

What distinguishes the rule families is therefore not a new blocker universe. It is the **certificate topology**:

```text
which response resources are shared
which events must be playable
which support predecessors are required
which releases occur before another obligation
which pair consequences are simultaneously valid.
```

No new geometric primitive is justified merely by the historical rule name.

## 6. Deadline rules

Aftereven, Before and Specialbefore contain an additional load-bearing fact: an own requirement completes before an opponent can acquire a specified blocker set.

Their generic shape is

```text
response/support resources
+ certified own progress path
+ event precedence
+ completion horizon
-> blocker before deadline.
```

This is not reducible to a static pair boundary alone. But the extra primitive is already present in C4-0007/NDC as a first-class **completion-before-deadline relation**.

Therefore, at the current level of decomposition, these named rules do not require a new geometric object. They require the existing NDC temporal relation to be composed with the derivative/support resource module.

## 7. Response-support transfer law

The earlier strong-distance investigation exposed an apparent missing mechanism: a defensive response may block one opponent requirement while simultaneously making a higher opponent event accessible.

In the decomposed representation this is not an independent exception. It is the frontier update

```text
h'_c=h_c+n_c(F)
```

followed by regeneration of currently playable successors and residual requirements.

Thus the exact feedback loop is

```text
response fragment F
-> blocker consequence
-> support frontier transport n(F)
-> newly accessible successor events
-> changed residual/support obligations
-> new CPC/deadline facts
-> ...
```

This is the concrete support-state component of NDC feedback. Dropping `n(F)` while keeping only the blocker is unsound.

## 8. Candidate canonical strategic descriptor

A response/certificate fragment should be compared across boards by a descriptor containing at least

```text
blocker consequence
consumption vector n(F), or a lossless equivalent
phase transport tau(F)
global release parity |F| mod 2
support prerequisites / trigger-response edges
resource exclusions / sharing
precedence constraints
completion horizon / deadline when material.
```

Some fields are derived from others (`tau` and release parity from `n`) and need not be stored redundantly in an implementation. They are listed separately here to expose the invariants.

This descriptor is a better target for neighborhood-preserving isomorphism than a named strategic rule or a raw cell mask.

## 9. Relation to the derivative geometry

The geometry and response sides now share one hierarchy:

```text
partial_d^3                 geometric Connect-4 window
partial_d / path boundary   local pair-response incidence
support chain action n(F)   causal legality / frontier release
|F| mod 2                   CPC event-rank effect
tau(F)                      phase-path effect
NDC deadline                completion-before-response effect.
```

The next question is whether every useful known strategy template, including infinite-board paving patterns, can be represented entirely in this hierarchy.

If a valid template cannot, isolate the smallest missing relation. Do not preserve its historical name as an axiom by default.

## 10. Infinite-board comparison boundary

Published descriptions of Infinite Connect-Four state that the non-losing strategies are combinations of reusable paving patterns such as follow-up and follow-in-CUP, with rearrangements also handling semi-infinite variants.

The available abstract-level sources establish that periodic/local response templates are central, but do not expose enough cell-level pattern detail here to reconstruct CUP/GLASS certificates safely. Do not invent those shapes.

The justified hypothesis is therefore only:

```text
infinite/semi-infinite proof
= periodic bulk response templates
+ boundary rearrangement.
```

The next source-complete analysis should decompose the actual paving templates into the descriptor above, then ask whether finite-board W/D/L differences are boundary defects of the same bulk response system.

## Proof boundary

Sections 1-3 are exact consequences of support-chain consumption, CPC, and the qualified phase-path construction. Sections 4-7 decompose already-preserved strategic consequence semantics while retaining their original resource/deadline guards. Section 8 is a proposed canonical descriptor. Section 10 is a research hypothesis constrained by the level of source detail currently available.
