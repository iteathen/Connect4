# C = NC? publication preflight — revision 0.4

**Status:** publication preflight PASS  
**Date:** 2026-09-29 America/Los_Angeles  
**Paper:** research/publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_4.md  
**Paper blob reviewed:** d4d266f4236a163aa94ccc4e4d4301a2dfd92180  
**Paper commit:** 0eaf8e42bab96f9bda881c7b2c9ad21647879d00  
**Canonical research branch:** research/semantic-quotient  
**Recent-result source branch:** research/nim-control-parity-algebra-20260929

## 1. Revision purpose

Revision 0.4 preserves revisions 0.1 through 0.3 and adds:

- constructive recovery of the binary-tie stabilizer from residual incidence;
- exact affine binary-tie canonicalization without a 2^m orientation sweep;
- the matched 5x4 affine negative runtime control;
- the full 6x4 ten-minute structural-growth wall;
- exact 6x4 structural prefixes through ranks 10 and 11.

PASS.

## 2. Authorship and provenance

~~~text
author:
    Joshua Oshiro
    PASS

IsoGraph designed by Joshua Oshiro:
    explicit
    PASS

AI-agent assistance:
    explicit
    PASS

AI agent responsible for core findings:
    NO
    explicit
    PASS

core conceptual findings and research direction:
    Joshua Oshiro
    explicit
    PASS
~~~

PASS.

## 3. Constructive binary stabilizer

The prior guarded theorem established that, when all unresolved refinement classes are binary,

~~~text
G = GF(2)^m
H_s <= G
H_s = ker(A_s)
~~~

Revision 0.4 adds the constructive result:

- residual requirements are grouped by player and orbit-invariant row-pattern data;
- asymmetric pair orientations supply explicit GF(2) coordinates;
- block translation stabilizers are intersected by GF(2) elimination;
- no full 2^m binary orientation sweep is required.

On all 18 audited 4x4 fallbacks:

~~~text
fallback states                 18
pair-count set                 [2]
stabilizer dimensions          [1]
parity-check sets             [11_2]
exact orientation sets        [{00,11}]
constructive matches exact     true
unrepresented exact autos         0
~~~

Thus the constructive method independently recovers:

~~~text
H_s = {(0,0),(1,1)}
x1 xor x2 = 0
~~~

PASS.

## 4. Exact affine binary-tie canonicalization

Under the guard that every unresolved refinement class has size at most two, the paper states that exact canonical orientation can be computed using affine GF(2) constraints and blockwise row reduction rather than enumerating all 2^m orientations.

The generalized claim is intentionally scoped to:

~~~text
explicit residual representation
+
binary unresolved refinement classes only
~~~

If any unresolved class has size greater than two, the implementation falls back to the qualified partitioned exact permutation method.

The paper does not claim a polynomial solution for arbitrary nonbinary symmetric-group cases.

PASS.

## 5. Matched 5x4 affine control

The affine method exactly reproduces the prior 5x4 semantic graph:

~~~text
direct states          289,852
edges                 1,079,881
duplicate edges          28,827
recursive classes       251,222
W/D/L splits                  0
root                         draw
earliest merge rank             9
~~~

Canonicalization work:

~~~text
partitioned permutation candidates      1,934,011
affine nonbinary fallback candidates      517,038
candidate reduction                        73.27%

binary affine canonicalizations           928,658
nonbinary fallback canonicalizations       80,680
binary share                               92.01%
binary block-translation candidates     2,353,268
maximum block candidates/call                  34
~~~

Runtime/memory:

~~~text
partitioned elapsed   27.2599 s
affine elapsed        38.3523 s
wall-time change       +40.69%

partitioned RSS       283,312,128 bytes
affine RSS            388,780,032 bytes
RSS change              +37.23%

partitioned heap       92,294,720 bytes
affine heap           100,626,544 bytes
heap change              +9.03%
~~~

The paper correctly interprets this as negative performance evidence:

~~~text
polynomial guarded representation
!=
current runtime improvement
~~~

PASS.

## 6. Full 6x4 wall

The paper records the exact disposition of the full 6x4 C4 attempt:

~~~text
board            6x4 C4
cells            24
winning lines    24
canonicalizer    refinement-partitioned exact
workflow         36555332049
result           cancelled by 10-minute job timeout
OOM observed     no
final graph      unavailable
~~~

No final state/edge/class count is invented.

The comparison

~~~text
600 s / 27.26 s > 22x
~~~

is correctly described only as an execution-economics lower bound, not a state-growth ratio.

PASS.

## 7. Exact 6x4 prefix through rank 10

The paper transcribes:

~~~text
cumulative states              286,356
rank-10 frontier               167,629
edges through rank 9           655,811
duplicate edges                    777

canonicalization calls         642,849
permutation candidates         677,916
average candidates/call          1.05455
maximum candidates/call              8
nonbinary tie calls                  0
~~~

Runtime:

~~~text
40.4225 s
~~~

Comparative statements are correct:

~~~text
rank-10 frontier:
    6x4 / 5x4 = ~4.64x
    6x4 / 4x6 = ~9.34x

cumulative through rank 10:
    6x4 / 5x4 = ~3.99x
    6x4 / 4x6 = ~8.82x
~~~

The paper correctly treats the absence of nonbinary ties and maximum candidate count 8 as evidence against large permutation search being the early width-wall cause.

PASS.

## 8. Exact 6x4 prefix through rank 11

The paper transcribes:

~~~text
cumulative states             616,710
rank-11 frontier              330,354
edges through rank 10       1,542,137
duplicate edges                 3,543

canonicalization calls       1,491,559
permutation candidates       1,651,326
average candidates/call         1.10711
maximum candidates/call               8
nonbinary tie calls                   16
~~~

Transition rank 10 -> 11:

~~~text
literal action edges                886,326
canonicalization calls              848,710
partitioned candidates              973,410
distinct produced states            330,354

no-tie calls                        724,888
binary-tie calls                    123,806
nonbinary-tie calls                      16
~~~

Residual-size comparison:

~~~text
rank 10 average residual requirements   16.4772
rank 11 average residual requirements   14.4469
change                                  -12.32%
~~~

Frontier growth:

~~~text
330,354 / 167,629 = 1.9707x
~~~

The paper's diagnosis is appropriately bounded: the visible width wall is dominated by structural frontier cardinality under the current closure, rather than visibly by large canonicalization search or increasing residual-antichain size per state.

It does not claim asymptotic causality beyond the measured prefix.

PASS.

## 9. Complexity firewall

Revision 0.4 continues to reject all unsupported conclusions:

- no full 6x4 structural count is claimed;
- no exponential or polynomial generalized-growth law is claimed;
- binary affine canonicalization does not solve nonbinary tie classes;
- polynomial binary orientation handling does not bound structural-graph size;
- falling residual size does not imply falling state complexity;
- no W/D/L XOR formula is claimed;
- no production IsoMax optimization is implied.

PASS.

## 10. References and structure

~~~text
top-level numbered sections: 20
reference definitions:        41
reference numbering:          sequential 1..41
new references:               38..41
~~~

New references identify exact blob and workflow provenance for:

- expanded column canonicalization / affine binary construction;
- 6x4 timeout wall;
- 6x4 prefix through rank 10;
- 6x4 prefix through rank 11.

PASS.

## 11. Final disposition

~~~text
authorship/provenance:                PASS
AI-assistance disclosure:            PASS
core-findings attribution:           PASS
revision-history preservation:       PASS
constructive XOR stabilizer:         PASS
affine exact binary canonicalizer:    PASS
5x4 negative runtime control:         PASS
6x4 timeout scope:                    PASS
rank-10 prefix transcription:         PASS
rank-11 prefix transcription:         PASS
structural-frontier diagnosis:        PASS
complexity/nonclaim firewall:         PASS
reference sequence 1..41:             PASS
license:                              PASS

publication disposition:
    READY AS RESEARCH PREPRINT REVISION 0.4
    ON research/semantic-quotient
~~~

No merge to main and no production-solver change is implied.
