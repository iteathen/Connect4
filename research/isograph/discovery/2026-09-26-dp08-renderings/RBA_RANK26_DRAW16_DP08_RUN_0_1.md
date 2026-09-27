# DP 0.8 scoped discovery — RBA rank26 draw16 closure — 0.1

**Status:** experimental scoped discovery; no RBA/gameplay authority effect  
**Campaign branch:** `research/dp08-discovery-20260926`  
**Modernization input commit:** `6d386c180d98f4be6dc96b8c72db769a4d75620f`

This run intentionally does **not** ask for “the minimum RBA.”  
It declares one concrete target and a bounded current operator space.

## Frozen inputs

| Artifact | Git blob |
|---|---|
| `CONNECT4_RBA_QU_0_15.md` | `de274da175d501255a3aa34441f8afe4d9134c95` |
| RBA-QU-0015 JSON | `fdd64a3d5341ab20a9e3a915e1a2f94453cc8f54` |
| RBA-QU-0015 native | `d25509208d1204e4c61fbbc397aadc6c566fb6a5` |
| topology placement 0.8 prose | `8c85273719cf81196fed2a8eb1fa996ea79dbace` |
| topology placement 0.8 JSON | `e35442e5605eeb2d8c853dbee35edfa8cfc52111` |
| topology placement 0.8 native | `b293a18ba1fd2e01f15de52a0f3cee5d130bd887` |
| current post-1.1 RBA overlay 0.8 | `84b7ff90a56ba874131eebc6611a825aa2b35b2f` |
| predecessor QU 0.14 | `2377230b0c8ea05ad750009b27cb4e402516d60c` |
| DP 0.8 modernization disposition | `2381669d0531f426c1a83ef297dd5106cbb63a78` |

---

# 1. Declared target

## R26-DRAW16

Establish the **exact rank26 draw16 closure** for the currently selected execution fiber:

```text
support = [3,3,2,0,6,6,6]
rank    = 26
residual shapes = 40
transformed bits = 80
target  = draw16
```

while preserving:

- exact ordinary-value semantics;
- first-win semantics;
- cofactor/preimage semantics;
- realizability and any required guards;
- no substitution of a downstream value theorem for an ungenerated mechanism.

This is an evaluation target, not a claim that the selected support is semantically privileged.

---

# 2. Declared current candidate space

The bounded operator alternatives considered in this pass are only those already represented as exact/current research.

## Product stage

### P0 — retained exact unabsorbed product

The preexisting exact product semantics without C4-R0091 absorption.

### P1 — C4-R0091 core-relative absorption

Exact row/column collapse using a real product witness.

## Preimage/cover stage

### C0 — prior exact per-target `minCover` route

Retained as the differential control referenced by RBA-QU-0015.

### C1 — C4-R0092 shared-target principal-cover DP

Exact uncovered-target recurrence shared across requested coordinate-preimage targets.

## Global antichain normalization

Current exact alternatives documented by the predecessor/current RBA line include:

- retained exact control;
- C4-R0088 block-signature antichain indexing;
- C4-R0090 static dominance-tree normalization.

This pass does not enlarge that set with hypothetical transforms.

## Excluded unknown alternatives

Not admitted into the finite candidate space:

- unspecified transformer fusion;
- hypothetical canonical/minimum presentation;
- unknown proof/value bridge;
- unknown better multi-factor planner;
- unrepresented direct rank26 theorem;
- alternative representation-independent volume law.

Those remain QU rather than being used to manufacture a smaller answer.

---

# 3. Current support cone is not yet closed

The current exact seam names four rank27 draw15 children needed by the present rank26 composition:

```text
[4,3,2,0,6,6,6]   missing
[3,4,2,0,6,6,6]   closed
[3,3,3,0,6,6,6]   missing
[3,3,2,1,6,6,6]   missing
```

Therefore R26-DRAW16 is **not yet an established completed result** on the current execution frontier.

For the present direct factorization, the three missing child boundaries are load-bearing unresolved inputs.

DP 0.8 must stop short of:

```text
rank26 draw16 sufficient support proven
```

until those children are cached/qualified and the composition is completed.

Could an alternative factorization bypass one or more children? The current represented candidate space does not establish one.

**Disposition:** present-factorization necessity is supported; global necessity remains QU.

---

# 4. C4-R0091 — exact support elimination inside the product

For row element `a` and product family `B`, let:

```text
envB = OR(B)
```

If some real `b0 in B` contains `a AND envB`, then:

```text
a AND b0 = a AND envB
```

and that real row product dominates every other `a AND b` in the row.

Therefore, for the exact subset-maximal meet product target:

```text
all other row-pair materializations
    -> no additional maximal output support
```

once the exact witness condition holds.

DP 0.8 classification:

```text
dominated row/column pair evaluations
    = NONESSENTIAL_FOR_SUFFICIENCY
      under the exact absorber witness guard
```

This is an exact support result, not merely a timing heuristic.

Current evidence on the qualified rank27 win15 final step:

```text
81.40% of raw pairs removed before local projection
exact 306,617-generator stream reproduced
```

That is strong structural/volume evidence, but it does not by itself supply a universal runtime valuation law.

---

# 5. C4-R0092 — shared uncovered-target state removes repeated exact subproblems

For one cofactor edge, parent principal `i` has parent upset `P_i` and child image upset `I_i`.

For target `T`, selecting any `b in T` gives the exact recurrence:

```text
MC(0) = {0}

MC(T)
  =
Min(
  union over i with b in I_i
    { P_i union U | U in MC(T \ I_i) }
)
```

The semantic state of the recurrence is the uncovered child target.

Therefore two requested preimage targets that reach the same uncovered-target subproblem do not need independent recomputation.

DP 0.8 classification:

```text
same edge
+ same uncovered-target state
+ exact memoized MC result
    ->
recomputing that subproblem per outer target
        = NONESSENTIAL_FOR_SUFFICIENCY
```

This is exact common-subproblem support, not NEI identity.

Validation/evidence:

```text
6 rank26 predecessor edges
x 2 modes
x 48 sampled targets
= 576 differentials
mismatches = 0
```

and complete target-family examples:

```text
89,032-target ownGE family  ~142 ms
117,692-target oppGE family ~95 ms
```

The deductive recurrence supplies the exactness claim; the differential/timing data are scoped corroboration and valuation evidence, not its source.

---

# 6. Shared-target DP versus prior exact minCover

Because both C0 and C1 target the same exact minimal parent-cover frontier:

```text
prior exact per-target minCover
    and
shared-target uncovered-state DP
```

are alternative sufficient evaluator topologies for that operator role.

Therefore neither implementation is uniquely necessary for exact predecessor semantics.

The new DP does **not** conclude that C1 is globally minimum-cost:

- target sharing may vary by support/fiber;
- earlier-rank scaling remains O12;
- hard restricted-image evaluation remains O11;
- total application cost includes other operator stages.

**Disposition:** exact alternative support established; universal valuation remains QU.

---

# 7. Global normalization alternatives are also non-unique support

The predecessor/current RBA research records exact normalization alternatives:

- retained exact control;
- block-signature indexing;
- static dominance-tree normalization.

The 0.14 campaign found exact matching output streams between tested normalizers and explicitly allowed the global normalization choice to be deferred until local execution exposes occurrence/distinct volumes.

Therefore:

```text
one particular global normalizer
    !=
uniquely necessary support
```

for exact antichain normalization.

A sufficient route needs an exact normalizer, not every exact normalizer.

No global winner is selected without the local volume/cost context.

---

# 8. Core-relative absorption is correctness-optional, structurally valuable

C4-R0091 is an exact pre-materialization reduction.

If the unabsorbed exact product path remains available, then the absorption transform itself is not required for correctness:

```text
P0 unabsorbed exact product
    -> sufficient

P1 exact absorber-pruned product
    -> also sufficient
```

So:

```text
absorption transform
    = NONESSENTIAL_FOR CORRECTNESS SUFFICIENCY
```

while the individual dominated pair computations are nonessential **inside the P1 route** once the witness is established.

This distinction matters:

```text
optimization transform optional
    !=
its internal proof guard optional
```

The absorber witness is load-bearing for safely skipping those products.

---

# 9. Selected rank26 support is execution placement, not a semantic minimum

The current support:

```text
[3,3,2,0,6,6,6]
```

was selected because it had the smallest measured interfaces under two independent immediate-predecessor probes despite not minimizing representation width.

That is a useful planning result.

It is not:

- a natural identity statement;
- a minimum RBA representation;
- a globally minimum support fiber;
- a universal cost law.

DP 0.8 therefore retains:

```text
current execution placement
    !=
semantic relation
```

and does not convert “smallest measured among immediate controls” into O1 closure.

---

# 10. Minimal / minimum status for R26-DRAW16

## What can be said

Within individual exact operator roles, the current research proves several support eliminations/substitutions:

- dominated product pairs under C4-R0091 guard are unnecessary;
- repeated identical uncovered-target subproblems under C4-R0092 are unnecessary;
- multiple exact normalizers can substitute for one another;
- shared-target DP can substitute for per-target exact minCover.

## What cannot yet be said

A minimum end-to-end support for R26-DRAW16 is not established because:

1. the actual rank26 draw16 target is not closed yet;
2. three direct-factorization child inputs are missing;
3. O1 minimal/canonical presentation is explicitly OPEN;
4. O4 transformer fusion is OPEN;
5. O8 multi-factor planning is OPEN;
6. O12 earlier-support shared-target scaling is OPEN;
7. alternative exact factorizations are not exhaustively enumerated.

Thus even this concrete run ends with:

```text
R26-DRAW16 global minimum support = QU
```

rather than inventing a minimum.

---

# 11. Proof/value boundary

R26-DRAW16 is an exact ordinary-value/evaluation target.

It does not close the separate missing relation:

```text
support-local predecessor-closed proof/clause carrier
    -> compact realizability-preserving q/value bound
```

RBA exact value closure does not establish proof/certificate identity or automatically transport:

- deadlines;
- response resources;
- provenance;
- proof guards.

O6 remains OPEN.

No downstream exact value theorem is postulated as a substitute for its generating operator support.

---

# 12. Valuation status

There are scoped measurements and exact size observations:

- 81.40% raw-pair elimination in one rank27 final product;
- sub-second complete target-family shared-DP examples;
- selected rank26 immediate-predecessor interface sizes;
- max principal-cover frontier 2 for the selected control.

These are not a complete R26-DRAW16 application valuation profile.

No universal preference among:

- memory;
- wall time;
- total cycles;
- temporary volume;
- representation width;
- planner complexity

is supplied.

Therefore no minimum-cost RBA realization is claimed.

---

# 13. QU / DTS / NEI

- **QU:** O1-O12 remain as recorded; especially minimum/canonical basis, fusion, proof/value bridge, planner, hard restricted-image evaluation, and earlier-support shared-target scaling.
- **DTS:** becomes load-bearing if a fused/planned route changes when child boundaries, guards, or exact predecessor facts become available.
- **NEI:** not invoked. Equal uncovered-target recurrence state is an exact algorithmic subproblem key, not a natural-object identity conclusion.
- **Valuation:** only scoped evidence above; no invented global cost profile.

---

# 14. Next exact discovery/qualification hinge

The current seam itself dictates the next bounded unit:

```text
cache + qualify:
    [4,3,2,0,6,6,6] draw15
    [3,3,3,0,6,6,6] draw15
    [3,3,2,1,6,6,6] draw15

then:
    compose selected rank26 draw16

then:
    rerun DP 0.8 on the now-closed target
    before descending to rank25
```

Only after R26-DRAW16 closes can an end-to-end sufficiency/minimality audit over this declared operator space be completed without substituting unknown child support.

## Disposition

This scoped RBA pass finds real nonessential support inside exact operators, but correctly refuses the larger minimum claim.

The strongest exact DP 0.8 results are:

1. absorber-dominated pair computations are unnecessary under the C4-R0091 witness;
2. repeated identical uncovered-target preimage subproblems are unnecessary under C4-R0092 memoization;
3. exact normalizer and preimage implementations are alternative sufficient supports;
4. current rank26 execution placement is not semantic minimality;
5. the rank26 draw16 end target remains QU until its three missing rank27 draw15 inputs close.
