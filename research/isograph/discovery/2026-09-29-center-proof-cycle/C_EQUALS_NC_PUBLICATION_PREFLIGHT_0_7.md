# C = NC? publication preflight — revision 0.7

**Status:** publication preflight PASS  
**Date:** 2026-09-29 America/Los_Angeles  
**Paper:** research/publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_7.md  
**Paper blob reviewed:** 0b3a2b6d4bfba60f55030346e886eed1082af493  
**Initial paper commit:** 31803d8b79b50e774c0e558397998145a4ed4504  
**Rendering fix commit:** 1b2690c553da209bbbd7733277d3b8c1bd2625b6  
**Canonical research branch:** research/semantic-quotient

## 1. Revision purpose

Revision 0.7 preserves revisions 0.1 through 0.6 and adds the canonical 28-realization theorem-contamination example.

PASS.

## 2. Canonical contamination example

The paper distinguishes two provenance chains.

Contaminated:

~~~text
solved perfect-play corpus
    -> observe 28 terminal winning-line realizations
    -> search for a geometric formula that evaluates to 28
    -> accept that formula because it matches 28
    -> use the formula to prune or certify play
~~~

Clean:

~~~text
board geometry + game rules
    -> independently derive theorem T
    -> freeze T and its proof dependencies
    -> evaluate T on 7x6
    -> obtain value N

only afterward:
    compare N with the solved perfect-play observation 28
~~~

PASS.

## 3. Hidden-target contamination

The paper explicitly states that contamination can persist even when the literal constant 28 never appears in production code.

Possible contaminated influences include:

- variable selection;
- geometric decomposition choice;
- retained/discarded cases;
- threshold selection;
- significance criteria;
- stopping/completion criteria.

PASS.

## 4. Independent derivation boundary

The paper states:

~~~text
28 from solved perfect play
    -> validation / falsification evidence only

28 independently derived from geometry and rules
    -> admissible theorem consequence
~~~

The number 28 becomes admissible theorem authority only if its proof can be reconstructed without using the solved perfect-play count in the theorem's construction, support, or selection.

PASS.

## 5. Discovery-path provenance

Revision 0.7 strengthens the theorem-contamination rule by requiring provenance of the theorem's discovery/selection path, not merely the final formal statement.

A theorem may be extensionally correct and still fail the blind-production standard if its form was fitted to a known solved answer.

PASS.

## 6. Existing publication gates

~~~text
author Joshua Oshiro:                  PASS
AI assistance disclosed:               PASS
AI not responsible for core findings: PASS
IsoGraph designed by Joshua Oshiro:    PASS
technical references preserved:       PASS
reference sequence 1..41:              PASS
license:                               PASS
~~~

Revision 0.7 adds methodology/provenance discipline only and makes no new game-theoretic result claim.

## 7. Final disposition

~~~text
publication disposition:
    READY AS RESEARCH PREPRINT REVISION 0.7
    ON research/semantic-quotient
~~~

No merge to main and no production-solver change is implied.
