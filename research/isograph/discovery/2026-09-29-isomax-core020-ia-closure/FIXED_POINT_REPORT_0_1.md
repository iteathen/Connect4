# IsoMax Core-0.20 structural-control recursive IA closure — fixed-point report 0.1

**Status:** OPERATIONAL FIXED POINT REACHED  
**Date:** 2026-09-29  
**Research direction:** Joshua Oshiro  
**Work branch:** research/isomax-core020-ia-closure-20260929  
**Owner:** research/semantic-quotient  
**Gameplay-authority effect:** none  
**Production-solver effect:** none  
**DP used:** no  
**NEI used:** no  
**DTS used:** no

## 1. Live pins at finalization

~~~text
IsoGraph main
b859fe5e280378ac15f06f0c6b62e1279b701e0b

Connect4 canonical research
77701467d269be45f480d4e9a8b390d644faf064

structural-control experimental source
4bfe1c6507c6b2edd93bbd1dabd74b0efe5343f7
~~~

Qualified semantic dependencies used by this campaign:

~~~text
Core 0.17
+ qualified Core 0.18
+ qualified Core 0.19 Implicit Assertions
+ qualified Core 0.20 primitive-logic closure
+ qualified QU 0.1
~~~

Core 0.20 SHA-256:

~~~text
9a619b552a6ef7719e5b4b5f3a9df4a732ff4377b9bc7b86c385ed5c992b88e7
~~~

QU 0.1 SHA-256:

~~~text
1f1510b41e4351726e4d9e714eb32ece0d5e69f0964255aabd7b4a6e94eee4cc
~~~

No Discovery Protocol, Natural Entropic Identity, or DTS semantic result was used.

## 2. Predecessor continuity

This is a successor to the earlier IsoMax Core-0.20 primitive kernel and its
recursive IA closure. The historical predecessor remains unchanged:

- ISOMAX_CORE020_PRIMITIVE_SEMANTICS_0_1.md;
- ISOMAX_CORE020_RAW_DOMAIN_0_1.isg;
- ISOMAX_CORE020_PRIMITIVE_GAME_0_1.isg;
- ISOMAX_CORE020_PRIMITIVE_EXECUTION_0_1.isg;
- ISOMAX_CORE020_PRIMITIVE_ORDERING_0_1.isg;
- 2026-09-27-isomax-core020-implicit-closure/FIXED_POINT_REPORT_0_1.md.

That predecessor had reached an operational fixed point over its then-current
70 source assertions. The present campaign reopens IA closure only because the
2026-09-29 structural-control research adds new exact source facts.

## 3. Core-0.20 integration

New successor packet:

~~~text
research/isograph/discovery/2026-09-29-isomax-core020-ia-closure/
~~~

The compact primitive kernel is:

~~~text
ISOMAX_STRUCTURAL_CONTROL_CORE020_0_1.isg
~~~

It directly primitive-renders only the semantics needed for the new exact IA
claims:

- Boolean XOR as a four-row truth table;
- concrete binary-continuation edge incidences;
- concrete path incidences;
- quotient-membership incidences;
- support identity on the shortest 5x4 witness;
- residual-membership bits on source/final fine states;
- route phase/sign/transporter/action-history source observations;
- the exact two-bit binary-tie relation;
- the concrete 4x4 flat reconvergence witness;
- the concrete shortest 5x4 contradictory reconvergence witness.

The following remain derived views, not authoritative leaves:

~~~text
residual-orbit graph
recursive action-labelled class
recursive action-unlabelled class
deeper continuation phase
GF(2) cocycle
cycle rank
syndrome census
global phase potential
transporter group
vector space / stabilizer
polynomial identity space
W/D/L
nimber
~~~

Large carrier census results are pinned and integrated for
provenance/navigation, but they are not used as exact IA proof leaves unless
their lower semantics are represented in the compact packet.

## 4. Source assertion freeze

A0_EXPLICIT_ASSERTIONS_0_1.json contains:

~~~text
source assertions                     31
primitive-eligible IA premises        23
derived-view-only observations         8
~~~

The derived-view-only observations include the full 4x4/4x5/5x4 carrier
censuses, direct quotient counts, response-incidence algebra, and branch/delta
space controls.

## 5. Recursive IA history

Selected exact inference families:

~~~text
B  finite Boolean closure
I  finite incidence conjunction
F  functional non-determination witness
Q  quotient/coarsening witness
C  cross-support composition
R  necessary repair condition
U  QU refinement by exact exclusion
S  scope/non-implication firewall
~~~

| Round | New exact IAs |
|---:|---:|
| 1 | 11 |
| 2 | 8 |
| 3 | 5 |
| 4 | 3 |
| 5 | 4 |
| 6 | 4 |
| 7 | 6 |
| 8 | 6 |
| 9 | 3 |
| 10 | 2 |
| 11 | **0** |

Final accounting:

~~~text
explicit assertions                    31
IA-eligible explicit assertions        23
admitted new exact IAs                 52
additional implicit support paths       2
QU refinements                         10
rejected overreach candidates          21
final-pass new assertions               0
final-pass support refinements          0
final-pass QU refinements               0
~~~

Round 11 is the operational fixed point for this frozen packet. This is not a
universal theorem-proving completeness claim.

## 6. Strongest new result: the shortest 5x4 obstruction is quotient-sensitive

The primitive-expanded shortest 5x4 system is:

~~~text
source a

route A:
a xor b = 0
b xor d = 0

route B:
a xor c = 0
c xor d = 1
~~~

where the same target variable d is imposed by the current quotient.

Exhaustive Boolean evaluation gives:

~~~text
coarse quotient solutions = 0
~~~

This independently supports the source-explicit 5x4 scalar obstruction without
using the high-level word cocycle as a semantic leaf.

## 7. New local correction law

The two exact fine final states merged into the target quotient differ in the
represented P0 residual-membership bit for frozen residual token 197700.

In the frozen representative:

~~~text
route A final residual bit = 0
route A observed phase     = 0

route B final residual bit = 1
route B observed phase     = 1
~~~

Therefore, on exactly this two-route family:

~~~text
route_phase = final_residual_bit
route_phase xor final_residual_bit = 0
~~~

This is an Exact Implicit Assertion, not a generalized source claim.

The literal raw residual-token identity is not promoted to a
coordinate-independent theorem. The source canonicalization can relabel
columns, so the generalized relabeling-invariant formulation remains QU.

## 8. Target refinement repairs the shortest contradiction

Refine only the merged target, preserving the source node, both intermediate
nodes, the four edge deltas, and the scalar Boolean phase codomain.

~~~text
route A target d0
route B target d1

a xor b  = 0
b xor d0 = 0
a xor c  = 0
c xor d1 = 1
~~~

Exact solutions:

~~~text
(a,b,c,d0,d1) = (0,0,0,0,1)
(a,b,c,d0,d1) = (1,1,1,1,0)
~~~

Thus:

~~~text
refined solutions = 2
~~~

and they differ only by simultaneous global complement.

Consequences established recursively:

1. target separation is necessary for any state-refinement-only scalar repair
   that preserves these routes and deltas;
2. the represented residual bit supplies a sufficient two-target split;
3. source refinement is not necessary for this local repair;
4. full transporter history is not necessary for this local repair;
5. the shortest obstruction alone does not prove that the corrected algebra
   needs more than one Boolean phase coordinate.

These conclusions are strictly local to the primitive-expanded shortest
witness.

## 9. Gauge-independent endpoint relation

In every satisfying refined assignment:

~~~text
target_phase xor source_phase = final_residual_bit
~~~

Simultaneously complementing every node phase leaves the left side unchanged.

Therefore this relative equation is invariant under the only absolute phase
freedom of the refined witness.

## 10. Target/source asymmetry

Both source sheets in the shortest obstruction already have the same represented
support but different residual membership.

However:

~~~text
source residual split     not necessary for local repair
target residual split     necessary for state-refinement-only local repair
~~~

under the frozen routes, edge deltas, and scalar Boolean codomain.

So the first exact local correction exposed by IA closure is target-side /
post-transition residual structure, not support height and not accumulated
permutation sign.

This is not yet a theorem that all 5x4 obstructions are target-side.

## 11. Transporter/sign disposition

The two shortest routes have:

~~~text
same accumulated permutation sign
different observed route phase
different full transporters
different source-frame action histories
~~~

Ordinary permutation sign alone remains falsified as the missing phase
coordinate.

The new IA closure additionally establishes that a state-local relative
residual-phase relation survives those observed transporter/history differences
on this two-route family. Full history may still be load-bearing elsewhere;
that remains QU.

## 12. 4x4 positive control

The explicit 4x4 reconvergence contains two three-edge routes with every delta
bit equal to zero.

Its six-node constraint system has exactly two satisfying assignments:

~~~text
all node phases = 0
all node phases = 1
~~~

Fixing the source phase uniquely fixes the entire witness.

The locally repaired shortest 5x4 witness likewise has exactly two
global-complement-related assignments.

This comparison does not make the two carriers isomorphic and does not
generalize width-4 integrability.

## 13. Binary-tie XOR layer remains separate

The exact guarded binary-tie relation is represented by:

~~~text
(0,0)
(1,1)
~~~

which is exactly Boolean equality and exactly XOR-zero in the primitive truth
table.

The 5x4 continuation obstruction does not negate this separate relation.
Conversely:

~~~text
binary-tie XOR exactness
does not imply
continuation-phase scalar integrability
~~~

so the different XOR appearances in the research corpus remain distinct.

## 14. What the IA closure did not establish

The following remain unproved:

~~~text
the residual-token-197700 rule repairs all 25 nonzero 5x4 syndromes
one coordinate repairs the complete 5x4 carrier
the complete corrected 5x4 carrier is scalar GF(2)
the correct generalized codomain is GF(2)^2
the correct generalized codomain is non-abelian
width 4 is the exact flatness guard
all transporter/orientation structure is irrelevant
the structural phase equals W/D/L
the structural phase is a nimber
the carrier has a polynomial generalized construction
~~~

## 15. Final QU state

The final QU ledger is QU_LEDGER_FINAL_0_3.json.

Highest-value unresolved structures:

- **QU-SC-001:** whether a relabeling-invariant residual/incidence predicate
  generalizes the local endpoint correction to all 25 nonzero 5x4 syndromes;
- **QU-SC-002:** whether measured 4x4/4x5 flatness extends to a width-4 theorem;
- **QU-SC-003:** whether any exact bridge exists from structural phase to W/D/L
  or a nimber;
- **QU-SC-004:** whether transition orientation remains necessary on other
  obstruction components;
- **QU-SC-005:** whether the complete corrected carrier is scalar on a better
  quotient or requires a larger/non-binary/non-commutative codomain;
- **QU-SC-006:** whether positive width-4 cycles are explained entirely by
  generic transition/cofactor confluence.

No probability distribution was attached to any QU and no preferred open
realization was selected.

## 16. Mechanical verification

Dedicated workflow:

~~~text
IsoMax Core020 IA closure
run 36619508023
job 109581000910
~~~

Result: **PASS**.

Verifier summary:

~~~text
explicit assertions             31
IA-eligible explicit            23
admitted implicit assertions    52
support refinements              2
QU refinements                  10
fixed-point round               11

coarse 5x4 solutions             0
refined 5x4 solutions            2
flat 4x4 solutions               2

native parenthesis balance       0
native bracket balance           0

DP support                       false
NEI support                      false
DTS support                      false
W/D/L bridge support             false
~~~

Repository research-integrity also passed in the same job.

Earlier run 36619444932 failed only because the verifier compared the same two
satisfying assignments in a fixed array order. The research packet was
unchanged; the verifier was corrected to compare canonicalized assignment
sets. The corrected rerun passed.

## 17. Stop disposition

The campaign stop rule was:

~~~text
one complete B/I/F/Q/C/R/U/S pass
adds
0 new normalized material assertion bodies
+
0 material support refinements
+
0 QU refinements
~~~

Round 11 satisfies that rule.

Therefore:

~~~text
Core-0.20 successor rendering integrated
+
recent structural-control evidence pinned
+
primitive witness support closed
+
recursive exact IA closure reached
+
QU refined without guessing
=
PAUSE
~~~

No DP pass follows.

No NEI pass follows.

No DTS pass follows.

No production implementation follows.
