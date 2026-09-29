# C = NC? publication preflight — revision 0.3

**Status:** publication preflight PASS  
**Date:** 2026-09-29 America/Los_Angeles  
**Paper:** research/publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_3.md  
**Paper blob reviewed:** b5069ab83f7878ac179e266265badccd8d76a6a7  
**Paper commit:** f427dd1954699f69b703214e7466df99e245eea7  
**Canonical research branch:** research/semantic-quotient

## 1. Revision purpose

Revision 0.3 preserves revisions 0.1 and 0.2 and incorporates the later:

- universal/nonterminal frontier blocker results;
- mover final-event cap-parity realizability rule;
- combined residual-realizability closure;
- finite local branch-closure measurements;
- direct structural growth through 4x7 C4 and 5x4 C4;
- exact refinement-partitioned column canonicalizer;
- guarded binary-tie stabilizer theorem and 18-state XOR audit.

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

## 3. Residual realizability closure

The paper reports the exact 4x4 progression:

~~~text
baseline                         10,507 states / 31,669 edges
universal frontier blocker       10,075 states / 30,732 edges
nonterminal frontier blocker      9,951 states / 30,473 edges
final-event cap parity            9,441 states / 29,351 edges
recursive target                  8,242 classes
~~~

All 8,242 recursive classes are preserved.

Gap arithmetic:

~~~text
baseline excess:
    10,507 - 8,242 = 2,265

remaining excess:
     9,441 - 8,242 = 1,199

explained:
    2,265 - 1,199 = 1,066

fraction explained:
    1,066 / 2,265 = 47.06%
~~~

The paper states “about 47%.”

PASS.

## 4. Rule statements

### Nonterminal frontier blocker

For opponent residual R and N equal to the current legal moves that do not immediately win for the mover:

~~~text
N subseteq R
    ->
R is ordinary-future inert
~~~

The paper preserves the first-win guard: legal moves outside R are permitted only when they terminate immediately in a mover win.

PASS.

### Mover final-event cap parity

The paper reports:

~~~text
remaining cells even
AND
cap(non-full columns) subseteq mover residual R
    ->
R is unrealizable for the mover
~~~

The proof correctly uses gravity, no-pass alternation, and the fact that completion requires the final board placement, which belongs to the opponent when the remaining event count is even and the mover acts first.

PASS.

## 5. Local branch closure

The rewritten 4x4 C4 sequence is transcribed exactly:

~~~text
9,441
9,237
8,948
8,629
8,375
8,269
8,250
8,242
~~~

Seven refinement rounds after round 0 reach the exact recursive partition.

The cross-dimension round counts are also correct:

~~~text
3x3 C3  4
4x3 C3  6
3x4 C3  6
4x4 C3 10
4x4 C4  8
~~~

The paper correctly distinguishes:

~~~text
quotient minimization over an existing finite graph
!=
construction size of that graph
~~~

and makes no constant-depth claim.

PASS.

## 6. Direct structural growth

The fixed-width C4 series is correctly reported:

| Board | Direct states | Recursive classes | Direct edges |
|---|---:|---:|---:|
| 4x4 | 9,441 | 8,242 | 29,351 |
| 4x5 | 102,815 | 86,791 | 325,038 |
| 4x6 | 693,284 | 562,550 | 2,197,552 |
| 4x7 | 3,534,913 | 2,747,043 | 11,200,763 |

State-growth factors:

~~~text
102,815 / 9,441   = 10.89x
693,284 / 102,815 =  6.74x
3,534,913 / 693,284 = 5.10x
~~~

Recursive-class factors:

~~~text
86,791 / 8,242       = 10.53x
562,550 / 86,791     =  6.48x
2,747,043 / 562,550  =  4.88x
~~~

The paper explicitly refuses to infer a polynomial asymptotic law from these four heights.

PASS.

## 7. Gravity/support orientation control

The equal-area/equal-line-count comparison is correct:

~~~text
4x5 C4:
    20 cells
    17 winning lines
    102,815 direct states
     86,791 recursive classes

5x4 C4:
    20 cells
    17 winning lines
    289,852 direct states
    251,222 recursive classes
~~~

Ratios:

~~~text
direct states:
    289,852 / 102,815 = 2.82x

recursive classes:
    251,222 / 86,791 = 2.89x
~~~

The paper draws only the supported conclusion that area plus raw winning-line count is insufficient and that gravity/support orientation is structurally load-bearing.

PASS.

## 8. Column canonicalization

The first-order refinement audit is transcribed correctly:

~~~text
audited nonterminal states  9,430
search-free states           9,412
fallback states                  18
search-free fraction        99.8091%
canonical collisions             0
~~~

Arithmetic:

~~~text
9,412 / 9,430 = 99.8091%
~~~

The paper also correctly records that ordered-pair refinement resolves 0 of the 18 remaining fallbacks.

The exact partitioned method retains exhaustive search inside unresolved tie classes and therefore does not assume refinement completeness.

PASS.

## 9. Matched 5x4 canonicalization economics

The paper reports:

~~~text
full 120-permutation canonicalizer:
    208.76 s

refinement-partitioned exact canonicalizer:
     27.26 s

speedup:
    208.76 / 27.26 = 7.66x
~~~

The exact semantic graph is preserved:

~~~text
289,852 states
1,079,881 edges
28,827 duplicate edges
251,222 recursive classes
0 W/D/L splits
root draw
earliest merge rank 9
~~~

The paper correctly treats this as implementation/canonicalization economics, not a state-count reduction or polynomial theorem.

PASS.

## 10. Guarded binary-tie XOR theorem

For unresolved color classes of size two, the paper states:

~~~text
G = (Z2)^m = GF(2)^m
H_s = {x in G : x(s)=s}
H_s <= G
H_s is therefore a vector subspace
H_s = ker(A_s)
~~~

This follows from standard stabilizer/subgroup closure and the fact that every subgroup of the elementary abelian 2-group GF(2)^m is a vector subspace.

For the complete audited 18-state family:

~~~text
m = 2
dim(H_s) = 1
H_s = {(0,0),(1,1)}
x1 xor x2 = 0
~~~

The exhaustive permutation audit confirms:

- identity preserves each state;
- simultaneous swap of both tied pairs preserves each state;
- either individual pair swap changes the state.

The paper accurately labels this as an exact XOR law for the guarded orientation-stabilizer layer.

It explicitly does **not** promote it to a W/D/L XOR formula.

PASS.

## 11. Complexity firewall

Revision 0.3 preserves all current open burdens:

- residual/control graph size may still be exponential;
- falling observed growth factors do not establish polynomial asymptotics;
- refinement-partitioned canonicalization can still encounter factorial search inside large tie classes;
- existence of A_s does not prove polynomial-time construction of A_s;
- tie classes larger than two generally involve non-abelian symmetric groups;
- local branch-closure depth is not proved constant or polynomially bounded independently of graph size;
- no standard-7x6 closed form is established.

PASS.

## 12. References and structure

~~~text
top-level numbered sections: 20
reference definitions:        37
reference numbering:          sequential 1..37
new references:               30..37
~~~

New references point to the canonical research artifacts for:

- universal frontier blocker;
- residual realizability closure;
- local branch closure;
- direct 4x5, 4x6, 4x7, and 5x4 growth;
- column canonicalization and XOR stabilizer.

PASS.

## 13. Final disposition

~~~text
authorship/provenance:                  PASS
AI-assistance disclosure:              PASS
core-findings attribution:             PASS
revision-history preservation:         PASS
realizability rules:                   PASS
47% gap arithmetic:                    PASS
local closure:                         PASS
direct growth transcription:           PASS
gravity-orientation control:           PASS
canonicalization audit:                PASS
5x4 speedup arithmetic:                PASS
guarded XOR theorem:                   PASS
complexity/nonclaim firewall:          PASS
reference sequence 1..37:              PASS
license:                               PASS

publication disposition:
    READY AS RESEARCH PREPRINT REVISION 0.3
    ON research/semantic-quotient
~~~

No merge to main and no production-solver change is implied.
