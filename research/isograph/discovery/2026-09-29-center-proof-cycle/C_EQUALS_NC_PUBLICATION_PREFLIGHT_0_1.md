# C = NC? publication preflight — revision 0.1

**Status:** publication preflight PASS  
**Date:** 2026-09-29 America/Los_Angeles  
**Paper:** research/publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_1.md  
**Paper blob reviewed:** 4ff0a22fe4403fec2b6423f3d88af3b321d13267  
**Paper commit:** 89377361b76b25d071b6894c574c51b4bc88e98a  
**Research branch:** research/nim-control-parity-algebra-20260929

## 1. Authorship and provenance gate

~~~text
author:
    Joshua Oshiro
    PASS

IsoGraph attribution:
    present
    PASS

IsoGraph designed by Joshua Oshiro:
    explicit
    PASS

AI-agent assistance disclosure:
    explicit
    PASS

AI agent not responsible for core findings:
    explicit
    PASS

core conceptual findings/research direction:
    attributed to Joshua Oshiro
    PASS

external sources:
    separately attributed
    PASS

CC BY 4.0:
    present
    PASS
~~~

The paper explicitly states that an AI agent was used in the research while distinguishing agent assistance in experimentation, analysis, verification, literature review, drafting, and repository operations from Joshua Oshiro's authorship and origination of the core conceptual findings.

## 2. Claim-scope gate

The paper explicitly does **not** claim:

~~~text
a polynomial-time perfect-play algorithm
a generalized polynomial Connect Four solution
ordinary Sprague-Grundy applicability to Connect Four
a scalar nimber for a Connect Four position
a W/D/L XOR formula
a degree-four polynomial for perfect-play value
a general theorem for arbitrary board dimensions
a production IsoMax replacement
a proof that the coarse GF(2) skeleton determines game outcome
a formal complexity-class identity C = NC
~~~

The question mark in the title is load-bearing. "C = NC?" is identified as a playful research label, with C meaning Connect Four, not a formal complexity-class statement.

PASS.

## 3. Core bounded results

### 3.1 Common boundary

The paper reports the rule-only 7x6 endpoint partition:

~~~text
4096 total endpoints
1987 immediate legal P0 wins
2108 no-immediate-threat unresolved endpoints
1 full-board no-winner endpoint
~~~

Arithmetic check:

~~~text
1987 + 2108 + 1 = 4096
~~~

PASS.

The stronger opportunistic policy reports the exact same 2,108 unresolved endpoint set from starts 4, 444, and 44444. The paper states element-by-element equality, not merely equal cardinality, matching the frozen research artifact.

PASS.

### 3.2 GF(2) response relation

The paper reports:

~~~text
20 response-pair generators
rank 19
nullity 1
rank 20 after unmatched top event
~~~

and the unique recovered dependency:

~~~text
T1 xor T3 xor T5 xor T7 = 0
~~~

The paper correctly states that the unmatched center-top event lies outside the paired-response span.

It does not infer W/D/L from this relation.

PASS.

### 3.3 Polynomial boundary identities

For 12 Boolean variables, the number of monomials through each degree is:

~~~text
degree <= 1:
    C(12,0)+C(12,1)
    = 1+12
    = 13

degree <= 2:
    13+C(12,2)
    = 13+66
    = 79

degree <= 3:
    79+C(12,3)
    = 79+220
    = 299

degree <= 4:
    299+C(12,4)
    = 299+495
    = 794
~~~

These exactly match the paper table.

The reported unresolved-family ranks/nullities are:

~~~text
degree <= 1: rank 13,  nullity 0
degree <= 2: rank 79,  nullity 0
degree <= 3: rank 297, nullity 2
degree <= 4: rank 751, nullity 43
~~~

The two cubic identities are reproduced as in the result artifact and interpreted only as finite-family geometry/support identities.

PASS.

### 3.4 Blind dimension perturbation

The paper preserves the tested scope:

~~~text
Connect-K fixed at 4
widths 4..10
even heights 4, 6, 8
~~~

It reports the observed safe-defect matrix and the finite-matrix formulas:

~~~text
responsePairs = W*H/2 - 1
responsePairRank = responsePairs - 1
safe defect count = max(0,8-W)
~~~

These are explicitly labeled bounded observations rather than promoted general theorems.

PASS.

### 3.5 Post-hoc outcome falsifier

The structural measurements were frozen before board outcomes were consulted.

The paper correctly uses:

~~~text
7x4 = draw
7x6 = first-player win
7x8 = first-player win
~~~

to falsify the over-strong claim that the common one-relation / one-unmatched-defect skeleton determines W/D/L.

It does not use those outcome labels as producer inputs.

PASS.

### 3.6 Exhaustive 4x4 branch-and-collapse control

The paper reproduces the frozen exact audit:

~~~text
legal states                              161,029
optimal edges                             219,010
states with >1 optimal move                56,763
mover-winning states with >1 optimal move   5,695
maximum optimal branching                       4
optimal transposition merge states          65,507
maximum optimal indegree                         4
explicit three-ply optimal diamonds          67,292
winning states with >1 terminal line         13,951
maximum terminal winning lines                    6
~~~

The paper correctly treats this as bounded exact evidence for non-unique perfect-play branching and physical reconvergence, not as proof of the standard-board terminal-line count or proof that the current GF(2) carrier is the value quotient.

PASS.

## 4. Research-construction firewall

The paper preserves the distinction between:

~~~text
geometry/rules producer
    versus
solved W/D/L validation

structural identity
    versus
game-value theorem

polynomial verification
    versus
polynomial construction

finite-family identity
    versus
generalized theorem

algebraic cancellation
    versus
ordinary Sprague-Grundy applicability
~~~

PASS.

## 5. IsoGraph and IsoMax attribution gate

The paper cites the relevant IsoGraph authority stack and research artifacts, including:

- qualified module manifest;
- Core 0.19 implicit assertions;
- Core 0.20 primitive-logic closure;
- QU 0.1;
- DP 0.8;
- DTS 0.1.

It also cites the Connect4 IsoMax post-IA DP/DTS research and the JSMinSys/Connect4 Lazy SMP implementation lineage, including selected IsoMax and Phase-2 artifacts.

The paper distinguishes:

~~~text
IsoGraph structural research
    != game-value authority

IsoMax exact solver
    != premise for the rule-only algebra producer
~~~

PASS.

## 6. Experimental-methodology boundary

The paper records the later Experimental Warrant/open-world inquiry proposal only as a methodological consequence of how the discovery process unfolded.

It explicitly does not use that later proposal as evidence for the earlier control-algebra findings.

PASS.

## 7. Bibliographic verification

External bibliographic metadata was checked against publisher or primary-source records where available.

### Allis

Verified:

~~~text
Victor Allis
A Knowledge-based Approach of Connect-Four
1988
Vrije Universiteit Amsterdam
ICGA Journal publication lineage
DOI 10.3233/ICG-1988-11410
~~~

### Tromp

Verified:

~~~text
John Tromp
Solving Connect-4 on Medium Board Sizes
ICGA Journal 31(2)
2008
pp. 110-112
DOI 10.3233/ICG-2008-31205
~~~

The board-size comparison also cites Tromp's public Connect Four Playground/outcome table.

### Sprague

Verified against the Tohoku Mathematical Journal/J-STAGE record:

~~~text
Roland Sprague
Über mathematische Kampfspiele
Volume 41
pp. 438-444
1935
~~~

### Grundy

The paper cites the standard bibliographic record:

~~~text
P. M. Grundy
Mathematics and Games
Eureka 2
1939
pp. 6-8
reprinted 1964
~~~

PASS.

## 8. Reference and rendering audit

Paper references:

~~~text
reference definitions:      25
unique cited references:    25
missing definitions:         0
uncited definitions:         0
~~~

Internal IsoGraph authority citations include exact repository baseline and blob provenance where load-bearing.

Connect4 research citations include exact blob identities for the central result artifacts.

GitHub-supported dollar math delimiters are used for display equations.

Fenced text blocks are balanced.

PASS.

## 9. Novelty restraint

The paper does not claim external novelty for:

- XOR itself;
- Sprague-Grundy theory;
- solved standard Connect Four;
- board-size outcome computation;
- transpositions;
- Boolean polynomial algebra;
- GF(2) linear algebra.

The project-local contribution is stated at the level actually supported by the evidence:

- a rule-derived response cancellation relation in the declared Connect Four family;
- an independent unmatched control defect in that representation;
- a shared 2,108-state boundary collapse across distinct center-stack histories;
- low-degree guarded polynomial structure on that boundary;
- exact small-board optimal branch/reconvergence evidence;
- a resulting research program for a latent guarded control quotient.

Whether the full combination is externally novel remains a separate review question.

PASS.

## 10. Final disposition

~~~text
authorship/provenance:                 PASS
AI-assistance disclosure:             PASS
core-findings attribution:            PASS
external attribution:                 PASS
claim-scope restraint:                PASS
rule-only/validation firewall:        PASS
common-boundary arithmetic:           PASS
GF(2) result transcription:           PASS
polynomial monomial arithmetic:       PASS
dimension-perturbation scope:         PASS
post-hoc falsifier interpretation:    PASS
4x4 branch-collapse transcription:    PASS
IsoGraph references:                  PASS
IsoMax references:                    PASS
citation completeness:                PASS
rendering structure:                  PASS
license:                              PASS

publication disposition:
    READY AS RESEARCH PREPRINT ON THE RESEARCH BRANCH
~~~

No merge to main is implied by this preflight.
