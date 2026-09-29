# C = NC? publication preflight — revision 0.8

**Status:** publication preflight PASS  
**Date:** 2026-09-29 America/Los_Angeles  
**Paper:** research/publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_8.md  
**Paper blob reviewed:** 3f71e995d99c66c4091c651a60b69cf23ea56f85  
**Initial 0.8 commit:** 3b7f97030fd982e1f62fdf13bff8c9802aa81c58  
**Comprehensive synthesis/bibliography commit:** 5d6054dc294047c3429da73e742d3ef54663aa39  
**Canonical research branch:** research/semantic-quotient  
**Supporting audit:** research/publications/2026-09-29/C_EQUALS_NC_RESEARCH_AUDIT_0_1.md

## 1. Audit scope

Revision 0.8 was checked against the current Connect4 1.2 authority/claim inventory rather than only the recent control-parity branch.

The normalized successor claim inventory reports:

~~~text
total claims:       93
retained:           65
strengthened:        4
historical-only:    17
open:                7
uncovered:           0
~~~

The paper does not reproduce every historical implementation experiment. It includes the findings that materially alter Connect4 semantics, exact geometry/control algebra, opening proofs, perfect-play output semantics, proof normalization, realizability/strategy complexity, residual-boundary/value algebra, exact action selection, or current IsoMax interpretation/whole-solve economics.

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
~~~

PASS.

## 3. Exact q semantics

Revision 0.8 includes the exact ordinary future-behavior carrier:

~~~text
q_o =
    support
    + normalized P0 residual antichain
    + normalized P1 residual antichain
~~~

and the qualified q-congruence consequence:

~~~text
equal q_o
    -> equal legal actions
    -> equal terminal token per action
    -> equal successor q_o
    -> same complete literal-action-labelled ordinary future game.
~~~

The reflection quotient q_r is distinguished from q_o and requires explicit action transport.

The paper preserves:

~~~text
gameplay identity
    !=
proof identity
    !=
history identity
    !=
terminal-output provenance identity.
~~~

PASS.

## 4. Solver-method emergence

The paper records that ordinary exact Connect4 semantics define one finite rank-well-founded alternating value dependency.

IsoMax, BSFP and possible SUT methods are presented as different demand/supply/materialization policies over that relation rather than independent game semantics.

PASS.

## 5. Finite-difference and control-potential algebra

The paper records:

~~~text
S_K(T) finite-difference multiplicity:
    nu(K) = 2^(v2(K)) - 1

K=4:
    S_4(T) = (1+T)^3

axis algebra:
    X^3 = 0
    Y^3 = 0
    XY = YX

diagonal relations:
    XY^2 + X^2Y = 0
    X^2Y^2 = 0
~~~

and the regular seven-mode incidence code.

It also records the CPC absolute-owner cancellation:

~~~text
q0(c,r) = ((W-1)H + r) mod 2
~~~

plus the guarded correction potential rho and its phase/seam derivatives.

No game-value theorem is inferred from these identities alone.

PASS.

## 6. Non-center opening theorem

The paper prominently includes the exact rule-derived theorem that every non-center P0 first move on standard 7x6 admits a P1 safety policy preventing P0 from winning.

The standard-board proof mechanically closes all 69 P0 winning lines by singleton blocker, same-component forbidden pair, or support-shadow preemption.

The paper correctly concludes only:

~~~text
all six non-center openings <= draw for P0
~~~

and therefore:

~~~text
any self-contained P0 forced-win proof
must begin in center.
~~~

It does not claim that this proves the center opening wins.

PASS.

## 7. Center-positive boundary and 44 -> 4

The paper distinguishes:

- structural exclusion of all non-center openings;
- the still-missing positive center-win theorem;
- the separately established oracle-blind exact-search result 44 -> 4.

The 44 -> 4 result is treated as two-engine rule-only computational validation rather than the compact structural theorem required for production hard-coding under the strict provenance standard.

PASS.

## 8. Perfect-play output algebra and tie convention

Revision 0.8 includes the exact set-valued terminal-line algebra G(s), where nonempty G exactly represents a P0 W/D/L win and membership represents possible P0 terminal-line identity under W/D/L perfection.

It preserves winning-region/output-provenance factorization.

The paper distinguishes:

~~~text
W/D/L-only perfect-play support:
    61 P0 terminal line identities

distance-sensitive strong convention:
    28 P0 terminal line identities
~~~

Both counts are treated as solved-result evidence, not blind theorem premises.

PASS.

## 9. Structural 28 quarantine

The paper includes the exact project-local structural-28 findings but states:

- equal cardinality does not imply identity with the solved strong-play 28-line set;
- the repository already found the two objects structurally different;
- because the discovery program knew the target value 28, production use is quarantined pending blind re-derivation or a satisfactory provenance audit.

PASS.

## 10. Proof algebra

The paper includes the recursive proof-frontier antichain theorem and the bounded standard-7x6 I/O/E/A proof-grammar compression:

~~~text
105 raw universal branches
-> 30 proof-consequence branches
= 71.4286% reduction
~~~

It notes that an all-legal-action rerun removed oracle witness-selection bias.

PASS.

## 11. Historical strategy normalization

The paper includes bounded generated evidence that generic blocker/upward-closure semantics reproduced the tested solved-group behavior of 331,955 generated A1-A9 historical-rule instances with zero mismatches.

It scopes this as empirical validation of generic structural language, not discovery of the historical rules or proof of every compatibility case.

PASS.

## 12. Realizability and strategy complexity

Revision 0.8 includes:

- fixed-support line-hit realizability as a pinned NAE hypergraph CSP;
- a higher-order counterexample showing pairwise compatibility is insufficient;
- legal pre-terminal colored-history realizability as alternating linear-extension/constrained-shuffle realizability;
- the variable-width NP-hard constrained-shuffle boundary;
- failure of parity-window + unit-capacity matching without precedence;
- observation-based strategy uniformity as the projection-factorization condition;
- bounded QBF/DQBF/Skolem dependency representation.

The paper does not infer NP-hardness for fixed-width 7 or for the full generalized Connect Four value problem.

PASS.

## 13. RBA / partial-value algebra

The paper includes:

- exact board-fiber value-algebra transport;
- Bellman U/W/D/L information refinement and resolution-ordinal interpretation on complete controls;
- the exact four-front representation of six contiguous W/D/L intervals;
- monotone lattice-polynomial block composition;
- failure of simple join/meet homomorphism due mixed reply covers;
- exact skyline/dominance/absorption/shared-cover evaluation laws.

The open boundary remains compact symbolic mixed-reply-cover / realizability-preserving controllable-predecessor composition.

PASS.

## 14. Support-local action-value frontiers

The paper includes the candidate same-support favorable residual order and its action-value isotony consequence.

It correctly labels the theorem as a candidate.

Bounded evidence includes:

~~~text
complete controls:
    6,300,753 comparable q-state pairs
    18,076,405 comparable fixed-action pairs
    0 W/D/L violations
    0 strong-distance violations

sampled 7x6:
    64,644 held-out q states
    257,007 held-out legal actions
    40,855 exact best moves proved
    0 false best-move claims
~~~

It retains the negative result that direct best-action regions are not upward-closed.

PASS.

## 15. Recent control-parity/direct-structural campaign

The previous material remains intact, including the 2,108-state common boundary, response-pair GF(2) relation, guarded polynomial identities, branch collapse, recursive action-unlabelled quotient, direct residual graph, local closures, binary stabilizer, affine canonicalization, and the 6x4 structural-frontier diagnosis.

PASS.

## 16. IsoMax / JSMinSys consequence scope

The paper includes only scoped execution findings that materially support the structural thesis.

### Local zero bounds

~~~text
process cycles  -56.26%
nodes           -75.33%
~~~

### Dense residual cofactor

~~~text
wall            -11.38%
CPU              -8.68%
process cycles   -8.72%
~~~

These are scoped workload results, not universal performance claims.

PASS.

## 17. Major negative results preserved

The paper preserves the principal falsifiers constraining future theory, including support-free residual insufficiency, cardinality-summary insufficiency, higher-order realizability, precedence requirements, race-free ownership unsoundness, coarse-GF(2) W/D/L failure, literal sibling-delta failure, structural-28/solved-28 non-identity, best-action non-monotonicity, Bellman non-homomorphism, binary-canonicalizer runtime regression, and the structural-frontier scale wall.

PASS.

## 18. Novelty language

Revision 0.8 describes the broad section as a **project-significance audit**.

It does not claim that every exact result is externally novel relative to all prior mathematical/game-theory literature.

External priority/novelty claims remain a separate literature-review burden.

PASS.

## 19. References and structure

~~~text
top-level numbered sections: 21
reference definitions:        63
reference numbering:          sequential 1..63
comprehensive audit source:   present
authority/claim source:       present
44 exact proof source:        present
~~~

PASS.

## 20. Final disposition

~~~text
authorship/provenance:                       PASS
AI-assistance disclosure:                   PASS
core-findings attribution:                  PASS
full authority/claim audit:                 PASS
q semantics:                                PASS
geometry/control algebra:                   PASS
non-center opening theorem:                 PASS
perfect-play output semantics:              PASS
structural-28 quarantine:                   PASS
proof algebra:                              PASS
realizability/complexity:                   PASS
RBA/value-frontier synthesis:               PASS
action-value frontier synthesis:            PASS
recent control-parity research:             PASS
IsoMax scoped consequences:                 PASS
major falsifiers:                           PASS
external-novelty restraint:                 PASS
reference sequence 1..63:                   PASS
license:                                    PASS

publication disposition:
    READY AS COMPREHENSIVE RESEARCH PREPRINT REVISION 0.8
    ON research/semantic-quotient
~~~

No merge to main and no production-solver change is implied.
