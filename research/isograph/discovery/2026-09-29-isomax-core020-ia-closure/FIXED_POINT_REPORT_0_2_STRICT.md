# IsoMax Core-0.20 structural-control strict primitive fixed-point report 0.2

**Status:** STRICT OPERATIONAL FIXED POINT REACHED  
**Research direction:** Joshua Oshiro  
**Current native kernel:** `ISOMAX_STRUCTURAL_CONTROL_CORE020_0_2.isg`  
**Supersedes for current routing:** `FIXED_POINT_REPORT_0_1.md`  
**Gameplay-authority effect:** none  
**Production-solver effect:** none  
**DP used:** no  
**NEI used:** no  
**DTS used:** no

## Correction to the first report

The earlier 0.1 report correctly described the Boolean witness logic but
overstated primitive completeness.

Strict Core-0.20 re-audit found that several support details were still
reducible:

- externally assumed Boolean IDs;
- raw accumulated route phase;
- raw permutation-sign bit;
- opaque transporter/action-sequence content;
- incomplete finite carrier closure;
- provenance-only assertions incorrectly marked IA-eligible;
- generalized QU references incorrectly recorded as IA dependencies.

Those defects are preserved in `STRICT_PRIMITIVE_REAUDIT_0_1.md` and corrected
in the 0.2 successor.

## Strict primitive closure

Every load-bearing exact IA path now bottoms out in:

- Core logical operators;
- exact equality/disequality;
- explicit quantification over finite carriers;
- packet-local raw Boolean values;
- complete raw extensional tuples;
- explicit finite carrier membership.

The following are definitionally expanded rather than accepted as leaves:

- route phase -> XOR of represented edge deltas;
- transporter -> total/function/injective/surjective five-slot map;
- permutation sign -> inversion bits -> XOR parity;
- action history -> ordered action-slot tuple;
- relative transporter -> pointwise composition of the two represented maps.

Six generalized unresolved seams are explicitly marked `QU_UNEXPANDED`.

## Exact support census

~~~text
explicit source assertions                 31
strict IA-eligible explicit assertions     21
derived/provenance-only explicit views     10

admitted exact implicit assertions          60
additional implicit support paths            3
QU refinements                              12

strict final pass new assertions             0
strict final pass support refinements        0
strict final pass QU refinements             0
~~~

The strict fixed point is `ROUND_14_STRICT_FIXED_POINT_0_2.json`.

## New IAs exposed only after full reduction

Reducing transporter semantics generated eight additional exact IAs beyond the
earlier 52.

Most important:

~~~text
route A total map = [0,1,3,2,4]
  -> odd involution

route B total map = [1,0,2,3,4]
  -> odd involution

relative map B after A = [1,0,3,2,4]
  -> two inversions
  -> even
~~~

but:

~~~text
route-phase difference = 1
relative-transporter parity = 0
~~~

Therefore ordinary parity of the exact **relative** transporter is also
insufficient to explain the shortest phase difference.

The two action sequences are:

~~~text
route A: [1,2]
route B: [0,2]
~~~

so they share the second source-frame action and absolute transporter parity
while still carrying different route phases.

## Local residual correction remains exact

The strict re-audit does not remove the earlier local correction theorem.

For the shortest 5x4 contradictory pair:

~~~text
route A phase = 0
route A final distinguished residual bit = 0

route B phase = 1
route B final distinguished residual bit = 1
~~~

Hence on this exact two-route family:

~~~text
route_phase = final_residual_bit
~~~

and after target refinement:

~~~text
target_phase XOR source_phase = final_residual_bit.
~~~

The coarse target merge has 0 scalar Boolean assignments.

Splitting only the target by the represented residual bit gives exactly 2
assignments, related by global complement.

This remains a local theorem only.

## Derived-view firewall

The following recent research remains integrated as source/provenance views but
is **not** admitted as a primitive semantic leaf in this compact packet:

- full 4x4 cocycle census;
- full 4x5 cocycle census;
- full 5x4 cocycle census;
- direct residual-orbit aggregate counts;
- generic action-parity aggregate audit;
- deeper-continuation aggregate census;
- response-incidence rank/nullity and polynomial census;
- perfect-play branch/delta aggregate controls.

These are marked `DERIVED_VIEW_NOT_PRIMITIVE_LEAF` and are IA-ineligible.

No exact IA depends on them.

## Strict verification

Workflow run:

~~~text
36623768951
job 109595425878
~~~

Result:

~~~text
packet verifier     PASS
research integrity PASS
~~~

The verifier independently confirms:

- balanced native structure;
- no external Boolean IDs;
- exact finite carrier sizes;
- complete transporter permutations;
- route-A inversion count 1;
- route-B inversion count 1;
- relative transporter inversion count 2;
- route phases 0 and 1 reconstructed from edge deltas;
- coarse 5x4 solutions = 0;
- refined 5x4 solutions = 2;
- flat 4x4 solutions = 2;
- all 60 IA dependency cones terminate only in strict IA-eligible primitive
  roots;
- no exact IA has a load-bearing QU dependency;
- no DP, NEI, DTS, or W/D/L bridge is used.

## Final disposition

Under the exact scope of the compact IA-supporting successor:

~~~text
if reducible -> expanded
if unresolved -> QU_UNEXPANDED
if aggregate/high-level -> derived view, not primitive leaf
if exact IA premise -> dependency-closed to primitive support
~~~

Round 14 adds nothing further.

The campaign therefore stops at the requested boundary.

No DP follows.
No NEI follows.
No DTS follows.
No implementation follows.
