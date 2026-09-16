# Center `Before(A2-D2)` local compatibility

**Date:** 2026-09-13  
**Status:** exact local rule/compatibility theorem; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

Test the first composite repair proposed after the response-serialization correction.

On a legal branch such as:

```text
D1 E1 A1 A2 B1 C1
```

P1 has preserved A-even with `A2`, then was forced to occupy `C1` after P0's `B1` bottom-row trigger. The elementary local rules leave odd-row horizontal obligations, including:

```text
A3-B3-C3-D3.
```

The natural race-aware repair is a `Before` whose controller group is the row directly below:

```text
A2-B2-C2-D2.
```

This note checks that repair against the lower D/E inverse relation rather than assuming a conflict.

---

## 1. The Before is structurally valid

The candidate Before group is:

```text
A2-B2-C2-D2.
```

At the representative legal branch:

```text
A2 = P1
B2,C2,D2 = empty.
```

None of its empty cells is on the top row.

Because the cells immediately below the three empty cells are occupied, the relevant Before response components are Verticals:

```text
B2-B3
C2-C3
D2-D3.
```

The successor set of all empty Before-group cells is therefore:

```text
{B3,C3,D3}.
```

The target P0 horizontal:

```text
A3-B3-C3-D3
```

contains all three successors. Hence the formal Before theorem refutes that target: if P0 takes one of the lower group cells, P1 responds at its successor; if P0 does not, P1 can complete the lower group first. In either case P0 cannot make the upper horizontal the first terminal completion.

---

## 2. Compatibility with the lower D/E Lowinverse

The lower D/E inverse uses:

```text
D2-D3
E2-E3.
```

The Before uses:

```text
B2-B3
C2-C3
D2-D3.
```

Allis's exact Before/Lowinverse combination entry is `2&3`:

```text
2: no Claimeven component lies below the inverse;
3: the rule square sets are column-wise disjoint or equal.
```

Both conditions hold here.

### Condition 2

The candidate Before contains no Claimeven components at all; every empty group cell uses a Vertical because its lower support is occupied.

Therefore there is no Claimeven below the inverse.

### Condition 3

Column by column:

```text
B: Before only
C: Before only
D: Before uses exactly {D2,D3}; Lowinverse uses exactly {D2,D3}
E: Lowinverse only
```

Thus every shared column is either disjoint or exactly equal. In D, the two rules literally share the same Vertical response pair.

Therefore:

```text
Compatible(Before(A2-D2), Lowinverse(D2-D3,E2-E3)).
```

---

## 3. Consequence for the defect-lift hypothesis

This falsifies the strong version of the recent row-lift intuition.

The surviving row-3 horizontal is **not** an unavoidable safety defect. A standard contingent race certificate repairs it locally without conflicting with the lower D/E inverse.

So the correct research statement is not:

```text
bottom defect must lift to row 3 and remain there.
```

Instead:

```text
static defects can be repaired by exchanging/adding composite response certificates;
the hard question is whether the complete family of required certificates is globally compatible in time.
```

This aligns with the response-serialization correction: the missing calculus must own complete response windows and resource sharing, not only line/blocker coverage.

---

## 4. Historical alignment

Allis defines `Before` specifically to solve threats that elementary Claimeven/Baseinverse/Vertical reasoning cannot discharge. Its proof is a race theorem: either the controller completes the lower Before group first, or an opponent move in that group is answered at the successor, preventing the upper opponent group.

Allis's rule-interaction chapter then gives exact combination constraints. For Before + Lowinverse, the rule pair is permitted when conditions `2&3` hold. The present configuration is a particularly clean instance because the D-column component is exactly the same Vertical in both certificates.

These historical rules are used here as already-proved strategic lemmas; the research objective remains to anti-unify them into the repository's generic CPC/WSL/NDC response calculus rather than retain nine named rules as the final ontology.

---

## 5. Relation to the symbolic predecessor problem

The current high-level value equation remains:

```text
W = mu X . [ I union PreE(X) union PreA(X) ].
```

The local Before theorem is an example of a symbolic predecessor transformer that combines:

```text
support order
+ a lower live controller requirement
+ contingent successor responses
+ first-win precedence
```

into a refutation of an upper opponent requirement.

But local repair is insufficient. The unresolved problem is now:

> Does there exist one globally compatible, deadline-safe set of such composite certificates covering every surviving P0 requirement after the legal center branch?

If no, identify the minimal incompatible response core and convert that incompatibility into a positive `PreE/PreA` theorem.

That is the next exact seam.

---

## 6. Evidence

Prototype:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/center_before_local_compatibility.mjs
```

The control checks:

- the legal branch occupancy;
- the Before group's empty cells and successor set;
- containment of the successor set in `A3-D3`;
- the exact D-column equality with the lower D/E Lowinverse;
- absence of Claimeven components below the inverse;
- satisfaction of conditions 2 and 3.

## Claim boundary

### Established

- `Before(A2-D2)` is a valid local repair of `A3-D3` on the representative legal branch;
- it is compatible with the lower `D/E` Lowinverse under the exact historical combination constraints;
- therefore the row-3 defect is not itself a universal invariant.

### Not established

- a globally compatible complete P1 safety cover after the center branch;
- compatibility of this Before with every other certificate needed elsewhere;
- whether another repair creates a response-slot collision in a different region;
- a complete symbolic center-win proof;
- any final perfect-play terminal-line membership or cardinality.

## Next seam

Build the full **certificate conflict graph** for the legal branch, beginning with the minimal set of rules actually needed to cover all still-live P0 requirements.

Then isolate a minimal unsatisfiable core:

```text
coverage obligations
+ response-window compatibility
+ CPC parity guards
+ first-win deadlines
```

rather than searching the physical move tree.
