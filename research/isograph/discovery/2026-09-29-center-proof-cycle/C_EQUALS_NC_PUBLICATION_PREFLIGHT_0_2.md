# C = NC? publication preflight — revision 0.2

**Status:** publication preflight PASS  
**Date:** 2026-09-29 America/Los_Angeles  
**Paper:** research/publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_2.md  
**Paper blob reviewed:** bc98dbb2a664e30bd2364cbb7e06c3d0faac8b24  
**Paper commit:** 1d9560cfa76e64ad21053d73f8d93b7820899f7e  
**Canonical research branch:** research/semantic-quotient  
**Recent-result source branch:** research/nim-control-parity-algebra-20260929

## 1. Revision purpose

Revision 0.2 preserves revision 0.1 and adds the later bounded research results:

- recursive action-unlabeled quotient on exhaustive 4x4;
- cross-dimension quotient controls;
- residual-q column-orbit carrier;
- direct residual-orbit graph reconstruction without physical-board-state enumeration;
- sibling partial-squared / GF(2) delta-space falsifier.

No historical 0.1 claim is silently rewritten.

PASS.

## 2. Authorship and provenance

- Author: Joshua Oshiro — PASS.
- IsoGraph system designed by Joshua Oshiro — explicit.
- AI-agent assistance — explicit.
- AI agent not responsible for the core findings — explicit.
- Core conceptual findings and research direction attributed to Joshua Oshiro — explicit.
- Agent contribution is limited to experimentation, computation, analysis, verification, literature research, synthesis, drafting, and repository work.

PASS.

## 3. Existing bounded results retained

Revision 0.2 retains the previously checked results:

- 4 / 444 / 44444 common 2,108-state unresolved boundary;
- 4,096 endpoint support family = 1,987 immediate-win + 2,108 unresolved + 1 full-board draw;
- 20 response-pair generators, GF(2) rank 19, nullity 1;
- unmatched center-top event raises the rank to 20;
- no degree-1 or degree-2 vanishing polynomial on the declared 12-bit boundary encoding;
- two independent cubic identities;
- 43 identities by degree four;
- degree <= 4 separates all 1,987 immediate-win comparison states;
- blind width/height single-defect matrix;
- post-hoc 7x4 / 7x6 / 7x8 falsifier for the coarse one-relation/one-defect W/D/L interpretation;
- exhaustive 4x4 branch-and-collapse counts.

PASS.

## 4. Recursive unlabeled quotient

The new paper reports, from the frozen 4x4 quotient artifact:

~~~text
physical states                              161,029
physical legal successor edges               304,574
all-legal recursive classes                    8,242
optimal recursive classes                      1,130
states with duplicate equivalent moves        39,231
duplicate equivalent legal edges erased       46,002
duplicate equivalent optimal edges erased     73,201
root legal moves                                   4
root distinct all-legal child classes              2
root optimal moves                                 4
root distinct optimal child classes                1
~~~

The paper correctly states that zero mover-relative W/D/L splits follow by backward induction from the recursive quotient definition and are not independent evidence for a new value theorem.

PASS.

## 5. Cross-dimension quotient matrix

The paper reproduces the bounded matrix:

| Board | Physical states | Legal edges | Recursive classes |
|---|---:|---:|---:|
| 3x3 C3 | 694 | 966 | 130 |
| 4x3 C3 | 7,157 | 11,818 | 1,002 |
| 3x4 C3 | 2,715 | 3,714 | 406 |
| 4x4 C3 | 41,750 | 65,756 | 4,384 |
| 4x4 C4 | 161,029 | 304,574 | 8,242 |

The paper preserves the correct interpretation:

- branch-equivalence compression survives the tested width/height/K perturbations;
- equal board area plus equal raw winning-line count is insufficient;
- gravity/support orientation is load-bearing;
- changing Connect-K changes early stopping and future obligation structure.

No generalized growth theorem is claimed.

PASS.

## 6. Residual-q column orbit carrier

The paper reports:

~~~text
orientation-sensitive residual-q classes     34,105
column-permutation residual-q orbits          10,507
recursive action-unlabeled classes             8,242

orbit signatures spanning >1 recursive class     0
states in a split orbit signature                 0
recursive classes containing >1 orbit         1,050
maximum orbit signatures in one class             30
~~~

Therefore the bounded implication

~~~text
equal column-orbit residual-q signature
    -> equal recursive action-unlabeled class
~~~

has zero counterexamples on exhaustive 4x4.

The paper correctly retains the remaining 2,265-class static-to-recursive gap and interprets it as evidence for branch-local action correspondence rather than one global symmetry.

PASS.

## 7. Direct residual-orbit reconstruction

The strongest new result is transcribed correctly:

~~~text
physical board states constructed by producer:  no

direct residual-orbit states                10,507
direct residual-orbit action edges          31,669
duplicate equivalent action edges            1,169
direct recursive classes                     8,242
~~~

These exactly match the independent physical-state orbit and recursive-quotient counts.

The paper also reproduces the cross-dimension direct reconstruction:

| Board | Physical states | Direct residual-orbit states | Direct action edges | Recursive classes |
|---|---:|---:|---:|---:|
| 3x3 C3 | 694 | 197 | 404 | 130 |
| 4x3 C3 | 7,157 | 1,656 | 4,603 | 1,002 |
| 3x4 C3 | 2,715 | 690 | 1,528 | 406 |
| 4x4 C3 | 41,750 | 8,898 | 26,400 | 4,384 |
| 4x4 C4 | 161,029 | 10,507 | 31,669 | 8,242 |

For all five controls, the direct recursive class count equals the independently enumerated physical recursive class count.

The paper correctly upgrades the bounded conclusion from:

~~~text
a smaller quotient exists after physical enumeration
~~~

to:

~~~text
the same finite quotient can be reconstructed
from residual transition structure without
enumerating physical board states
~~~

for the tested controls only.

PASS.

## 8. Complexity firewall

Revision 0.2 explicitly preserves:

~~~text
physical graph avoided
    !=
polynomial generalized construction
~~~

The current action canonicalizer enumerates W! column permutations, and no polynomial bound has been established for residual-orbit state growth.

The paper therefore does not claim:

- polynomial generalized Connect Four;
- standard-7x6 closed form;
- polynomial action canonicalization;
- polynomial residual-graph size;
- XOR W/D/L formula.

PASS.

## 9. Linear move-coordinate gauge falsifier

The updated paper records:

~~~text
same-terminal-set optimal sibling pairs       98,702
different-terminal-set optimal sibling pairs  18,484
distinct optimal partial2 deltas                  176
optimal delta-space rank                            22

all legal sibling pairs                     246,704
distinct legal partial2 deltas                   176
legal delta-space rank                            22
legal deltas outside optimal span                  0
optimal delta set == legal delta set            true
~~~

The conclusion is correctly negative: this linear sibling-delta space is ordinary geometric move-choice structure and cannot by itself select perfect play.

The paper uses this falsifier to move the possible location of any surviving GF(2)-like law toward guarded residual/control objects after action identity is quotiented.

PASS.

## 10. Reference audit

Revision 0.2 contains 29 sequential references.

New research references:

- [26] UNLABELED_BRANCH_QUOTIENT_RESULT.md
- [27] UNLABELED_QUOTIENT_DIMENSION_RESULT.md
- [28] RESIDUAL_Q_COLUMN_ORBIT_RESULT.md
- [29] DIRECT_RESIDUAL_ORBIT_GRAPH_RESULT.md

Reference [16] is updated to the current branch-collapse artifact containing the sibling quotient and delta-space follow-ups.

Reference numbering is sequential 1..29.

PASS.

## 11. Claim-scope gate

Revision 0.2 does not claim:

- that the recursive quotient itself is a new value theorem;
- that W/D/L homogeneity of recursive classes is surprising or independent evidence;
- that static column-orbit equivalence is the final quotient;
- that direct residual reconstruction is polynomial;
- that factorial column canonicalization is acceptable asymptotically;
- that the 4x4 or small-board class counts extrapolate to standard 7x6;
- that GF(2) composition has been proved at the final quotient level;
- that a production IsoMax change follows.

PASS.

## 12. Final disposition

~~~text
authorship/provenance:                    PASS
AI-assistance disclosure:                PASS
core-findings attribution:               PASS
revision-history preservation:           PASS
existing bounded results:                PASS
recursive quotient transcription:        PASS
cross-dimension matrix:                  PASS
residual-q orbit carrier:                PASS
direct residual reconstruction:          PASS
complexity firewall:                     PASS
linear-gauge falsifier:                  PASS
reference sequence 1..29:                PASS
claim-scope restraint:                   PASS
license:                                 PASS

publication disposition:
    READY AS RESEARCH PREPRINT REVISION 0.2
    ON research/semantic-quotient
~~~

No merge to main and no production-solver change is implied.
