# IsoMax Core-0.20 strict primitive IA closure — corrected fixed-point report 0.2

**Status:** STRICT PRIMITIVE-BODY FIXED POINT REACHED  
**Date:** 2026-09-29  
**Research direction:** Joshua Oshiro  
**Work branch:** `research/isomax-core020-ia-closure-20260929`  
**Authority effect:** none  
**Production effect:** none

## Correction to the predecessor report

The earlier `FIXED_POINT_REPORT_0_1.md` claimed 52 exact implicit assertions.

That count is **superseded for Core-0.20 primitive authority**.

The re-audit applied the governing Core-0.20 rule to both sides of every IA:

~~~text
primitive premises
+
primitive assertion body
~~~

rather than checking only that the support cone eventually reached primitive
facts.

Several predecessor IA bodies were written only as high-level JSON prose using
concepts such as:

~~~text
function
non-injective quotient
repair
necessary
sufficient
does not imply
state refinement
model change
~~~

without native primitive expansions of those exact body semantics.

Under Core 0.20 they may remain derived explanatory views, but they do not
qualify as authoritative exact IA leaves.

## Live IsoGraph authority used

During the strict re-audit IsoGraph `main` advanced to:

~~~text
8dc6a0f37babae61d50e9cd5889d2cd1c11220ec
~~~

The advance qualified DP 0.9/0.10 and Experimental Inquiry work, but the
semantic dependencies allowed in this campaign did not change.

Exact pins:

~~~text
Core 0.20
9a619b552a6ef7719e5b4b5f3a9df4a732ff4377b9bc7b86c385ed5c992b88e7

QU 0.1
1f1510b41e4351726e4d9e714eb32ece0d5e69f0964255aabd7b4a6e94eee4cc
~~~

Used:

~~~text
Core 0.17 + 0.18 + 0.19 + 0.20
QU 0.1
~~~

Not used:

~~~text
DP
NEI
DTS
Experimental Inquiry
W/D/L bridge
nimber semantics
~~~

## Strict native kernel

The corrected primitive kernel is:

~~~text
ISOMAX_STRUCTURAL_CONTROL_CORE020_0_2.isg
~~~

The re-audit removed or expanded the remaining reducible leaves.

### Boolean domain

The first packet referenced external Boolean IDs.

The strict kernel now contains a packet-local exact two-value carrier:

~~~text
196900
196901
~~~

and every Boolean quantifier ranges over that represented carrier.

### Route phase

Accumulated route phase is no longer stored as a raw source field.

It is definitionally reconstructed from:

~~~text
edge delta bits
+ exact XOR truth table
+ exact path incidence
~~~

through `196104` / `196105`.

### Transporter sign

Permutation sign is no longer a raw bit.

The strict kernel represents:

1. the complete five-slot transporter mapping;
2. the complete strict order on the five slots;
3. all ten ordered slot pairs;
4. one inversion bit per pair;
5. the XOR fold of all ten inversion bits.

Thus `196117` has no hidden permutation-parity operator.

### Transporter identity

Route transporter difference is no longer inferred from distinct opaque IDs.

The complete maps are represented extensionally.

Route A:

~~~text
[0,1,3,2,4]
~~~

Route B:

~~~text
[1,0,2,3,4]
~~~

Their exact content differs.

### Source-frame action sequences

The route histories are no longer opaque sequence IDs.

Exact ordered content is represented:

~~~text
route A = [1,2]
route B = [0,2]
~~~

### Quantifier domains

All finite domains used by strict definitions have native membership closure.

No binder relies on an English domain description.

### Generalized unknowns

Six generalized seams are represented natively as `QU_UNEXPANDED`.

They are outside the strict exact IA support cone.

They are not called primitive merely because their lower law is unknown.

## A0 correction

The source freeze still contains 31 assertions, but only 21 now qualify as
strict IA premises.

The two sidecar/provenance statements `SC-E022` and `SC-E023` were removed
from IA eligibility.

The eight aggregate carrier/census observations were already non-IA premises.

Therefore:

~~~text
A0 total assertions              31
strict primitive IA premises     21
non-IA source/derived views      10
~~~

## IA body reduction

The strict native IA files are:

~~~text
STRICT_IA_CORE020_0_3.isg
STRICT_IA_ADMISSION_0_3.json
~~~

Every admitted IA has a native `DEFINITION_EXPANDS_TO` root whose complete
truth conditions are primitive-rendered.

The predecessor high-level IA prose is preserved for navigation/history but is
not primitive authority.

~~~text
predecessor high-level IAs superseded    60
strict native IAs admitted               14
~~~

The count 60 includes the original 52 plus eight later transporter
interpretations generated while the primitive re-audit was still unfolding.

## Strict IA closure

Productive strict rounds:

~~~text
round 1     7
round 2     1
round 4     6
round 5     0
~~~

Round 3 was the first strict fixed point, but deeper primitive reduction of the
transporter mappings reopened closure. Round 4 admitted the six new native
mapping/action-sequence bodies. Round 5 added nothing.

Final disposition:

~~~text
strict native IA bodies      14
new bodies in final pass      0
support refinements           0
QU refinements                0
~~~

This is the operational fixed point for the frozen strict native packet.

## Strict native results

### 1. Two-bit orientation relation

The represented two-bit allowed-orientation relation is exactly Boolean
equality.

No group/vector-space label is required by the native assertion body.

### 2. Concrete 4x4 flat system

The six-variable zero-delta system has exactly:

~~~text
000000
111111
~~~

as solutions.

### 3. Target-split 5x4 Boolean system

The five-variable target-split system has exactly:

~~~text
00001
11110
~~~

as solutions.

This is a theorem of the represented Boolean constraint system.

It is **not** promoted to a theorem that this split is the faithful generalized
Connect-Four carrier.

That generalization remains QU.

### 4. Residual-bit / route-phase equality

On the two represented shortest 5x4 routes, the route-phase relation equals the
final-state P0 residual-token-197700 membership-bit relation.

The literal token remains frozen-representative data. No coordinate-independent
generalization is asserted.

### 5. Relative endpoint equation

Every satisfying target-split assignment obeys the primitive relation:

~~~text
target XOR source = represented final residual bit
~~~

on each route.

### 6. Boolean complement invariance

XOR output is invariant when both inputs are simultaneously complemented.

This is a truth-table theorem, not a named algebraic assumption.

### 7. Route phase parity

The two shortest 5x4 route phases XOR to 1.

The explicit 4x4 route phases XOR to 0.

### 8. Transporter reduction

The complete route transporters are both odd involutions:

~~~text
A = [0,1,3,2,4]   parity 1
B = [1,0,2,3,4]   parity 1
~~~

The definitionally composed relative transporter is:

~~~text
B o A = [1,0,3,2,4]
~~~

with parity:

~~~text
0
~~~

So the shortest route phase difference is odd while the exact relative
transporter parity is even.

This is stronger than the earlier raw-sign falsifier and is now primitively
represented.

### 9. Action-history reduction

The represented source-frame action sequences are:

~~~text
A = [1,2]
B = [0,2]
~~~

They share their second action and differ at the first.

The native packet does not assign additional high-level causal meaning to that
fact.

## QU state after strict audit

Current strict QU ledger:

~~~text
QU_LEDGER_STRICT_0_4.json
~~~

The strict rounds add **zero exact QU refinements**.

That is intentional.

Earlier QU exclusions based on unexpanded concepts such as “necessary repair”
or “full history is not necessary” are preserved historically but are not
carried forward as strict exact refinements.

The major unknowns remain:

1. a relabeling-invariant generalized residual/incidence correction;
2. a width-4 flatness theorem;
3. any W/D/L or nimber bridge;
4. transporter/orientation relevance outside the shortest witness;
5. the corrected full-carrier phase codomain;
6. the role of generic transition/cofactor confluence.

## Primitive closure ledger

Current strict ledger:

~~~text
PRIMITIVE_CLOSURE_LEDGER_STRICT_0_4.json
~~~

It distinguishes:

~~~text
CLOSED_PRIMITIVE
exact RAW_EXTENSION
QU_UNEXPANDED
DERIVED_VIEW_NOT_PRIMITIVE_AUTHORITY
~~~

Raw extensional relations are retained only when their entire semantic
contribution to the exact claim is the represented finite incidence/value.

No hidden behavior is licensed by their names.

## Verification

Strict verifier:

~~~text
verify-strict-primitive-closure.mjs
~~~

It checks:

- native delimiter integrity;
- local Boolean-domain closure;
- absence of the old external Boolean IDs;
- all 14 native IA roots;
- strict IA dependency order;
- exact 4x4 and target-split 5x4 solution sets;
- full transporter maps;
- transporter involution;
- inversion-parity signs;
- definitionally composed relative transporter;
- relative transporter parity;
- exact action-sequence content;
- 5x4 route-phase XOR;
- 4x4 route-phase XOR;
- QU count/status;
- exclusion of DP/NEI/DTS/EI.

The strict packet verifier and repository research-integrity both pass on the
current strict-verifier workflow.

## Core-0.20 conclusion

After the strict re-audit, the correct statement is:

> Within the narrowed exact scope of the structural-control successor packet,
> every authoritative source premise used for IA, every admitted implicit
> assertion body, and every load-bearing relation in their dependency cones
> terminates in Core primitive logic or exact finite raw carrier/incidence data.
> Generalized unresolved seams remain QU_UNEXPANDED and aggregate census views
> remain non-authoritative derived views.

Therefore the packet now satisfies the Core-0.20 primitive-closure rule for its
declared exact scope.

It does **not** claim primitive closure for the complete aggregate 4x5/5x4
carrier enumerations.

It does **not** promote this successor to Connect4 logic authority 1.2.

It does **not** run DP, NEI, DTS, EI, or production implementation work.

## Stop disposition

~~~text
strict primitive source support closed
+
strict native IA bodies closed
+
deeper transporter reduction closed
+
strict IA fixed point reached
+
generalized seams preserved as QU
=
PAUSE
~~~
