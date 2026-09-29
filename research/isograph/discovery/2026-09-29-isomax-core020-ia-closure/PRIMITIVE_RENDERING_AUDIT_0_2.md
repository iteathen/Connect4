# IsoMax structural-control Core-0.20 strict primitive rendering audit 0.2

**Status:** strict successor audit candidate  
**Research direction:** Joshua Oshiro  
**Native successor:** `ISOMAX_STRUCTURAL_CONTROL_CORE020_0_2.isg`  
**Predecessor retained:** `ISOMAX_STRUCTURAL_CONTROL_CORE020_0_1.isg`

## Disposition

The 0.1 packet was too permissive in several support details. The strict
successor removes those leaves rather than treating them as primitive.

### Closed corrections

- Boolean values are now packet-local raw values in an explicitly enumerated
  two-value carrier.
- Every finite carrier quantified by the native formulas has its members
  represented directly using the carrier predicate, matching IsoGraph's own
  primitive-data pattern.
- Route phase is no longer stored as a raw route field; it is derived from
  edge-delta bits through the exact four-row XOR relation.
- The two accumulated transporters are represented by complete five-slot maps.
- Slot order and all ten i<j pairs are represented extensionally.
- Inversion bits are definitionally expanded from transporter maps and slot
  order.
- Permutation-sign parity is definitionally expanded as XOR of the ten
  inversion bits.
- Source-frame action sequences are represented as ordered two-slot tuples.
- Different transporter/action-history claims therefore rest on content, not
  SI spelling.
- The shortest 5x4 scalar obstruction is narrowed to the primitive-supported
  four-edge unsatisfiable system. The full-carrier census remains a separate
  derived source observation.
- Provenance-only SC-E022/SC-E023 are no longer IA-eligible.
- Exact local IAs carry generalized QUs only as `related_qu`, not as
  load-bearing support dependencies.
- Six generalized open seams are marked natively as `QU_UNEXPANDED`.

## Primitive stopping points

After this correction, load-bearing exact IA paths terminate only at:

- Core primitive Boolean/logical operators;
- raw finite carrier/value identities;
- complete raw extensional observation tuples;
- explicit finite carrier membership;
- exact equality/disequality;
- exact quantification over represented finite carriers.

No load-bearing exact IA stops at:

```text
phase
permutation sign
transporter identity
action-history identity
quotient
cocycle
cycle rank
GF(2) vector space
W/D/L
nimber
DP
NEI
DTS
```

Those names may remain human/derived views, but deleting the names does not
disconnect the exact support graph.

## Aggregate research views

The full carrier counts, cycle ranks, response-matrix rank/nullity,
polynomial-identity census, and branch-collapse aggregate controls are retained
for provenance and navigation only.

They are explicitly classified:

```text
DERIVED_VIEW_NOT_PRIMITIVE_LEAF
IA-eligible = false
```

This compact successor does not claim those aggregate views themselves are
complete Core-0.20 native renderings.

## QU boundary

Generalized claims remain unresolved rather than promoted:

- invariant correction across all 5x4 obstructions;
- width-4 theorem;
- W/D/L or nimber bridge;
- transition-orientation requirement outside the shortest witness;
- corrected generalized phase codomain;
- generic-confluence explanation.

Each is marked `QU_UNEXPANDED` natively and none is an exact IA premise.

## Qualification target

The corrected packet qualifies only if mechanical verification confirms:

1. balanced native syntax;
2. no external Boolean IDs;
3. exact finite carrier membership;
4. transporter maps are complete permutations;
5. independently recomputed transporter parity is odd for both shortest routes;
6. action sequences differ extensionally;
7. route phases recomputed from edge deltas are 0 and 1;
8. coarse 5x4 scalar system has 0 assignments;
9. residual-target refinement has exactly 2 assignments;
10. concrete 4x4 flat system has exactly 2 assignments;
11. all 52 admitted IA dependency cones resolve to strict primitive-eligible
    A0 premises;
12. no exact IA has a load-bearing QU dependency;
13. DP/NEI/DTS/WDL bridges remain absent;
14. a fresh complete inference-family pass adds nothing material.
