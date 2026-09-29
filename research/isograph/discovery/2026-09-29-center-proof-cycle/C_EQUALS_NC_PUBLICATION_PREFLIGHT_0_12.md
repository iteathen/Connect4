# C = NC? publication preflight — revision 0.12

**Status:** publication preflight PASS  
**Date:** 2026-09-29 America/Los_Angeles  
**Paper:** research/publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_12.md  
**Paper blob reviewed:** 74fff1b45028992a2b8bbd96638ca3d32f716332  
**Paper commit:** 01041416b4bfc8ab762bb97ba78bb3a0c82a5f72  
**Canonical research branch:** research/semantic-quotient

## 1. Revision purpose

Revision 0.12 adds an explicit heuristic-domain firewall.

The paper now states:

~~~text
heuristic
    -> ordering / prioritization / estimation

closed law or exact search consequence
    -> proof-domain reduction
~~~

PASS.

## 2. Core heuristic rule

The governing statement is:

> A heuristic may decide what the solver examines first; it may not decide what the solver is allowed not to prove.

PASS.

## 3. Long-prefix protection

A heuristic principal variation may be followed for arbitrarily many plies.

However, siblings not eliminated by exact search or qualified closed laws remain in the root proof obligation.

Repeated heuristic choices therefore cannot become a disguised opening book.

PASS.

## 4. Rule-derived versus oracle-informed heuristics

The paper now distinguishes:

~~~text
rule-derived heuristic
    -> admissible search guidance

oracle-informed heuristic
    -> may preserve exact-search correctness
    -> not admissible evidence for blind structural performance
       unless explicitly separated and disclosed
~~~

PASS.

## 5. Centerline evaluation

Mechanically derived geometric centerline evaluation is admissible for:

- move ordering;
- branch priority;
- non-authoritative evaluation.

It does not establish exact optimality or permit sibling removal without a closed law.

PASS.

## 6. Live-line evaluation

Current-position live-line evaluation is admissible for search guidance when derived from surviving geometry, support, residuals, and accessibility.

A higher live-line score is not treated as an exact value ordering unless a corresponding closed theorem is established.

PASS.

## 7. Proof-domain invariant

The paper requires that every legal alternative omitted from explicit recursive search be covered by at least one of:

- exact bound;
- exact equivalence;
- terminal rule;
- qualified closed law.

Heuristic preference alone is insufficient.

PASS.

## 8. Closed-law standard preserved

Revision 0.12 retains the revision-0.11 distinction:

~~~text
closed law
    -> may be used directly by solver

unclosed theorem
    -> research side only

instance result
    -> cannot be promoted into solver law merely to skip solving
~~~

PASS.

## 9. Formatting repair

Malformed display-math escapes inherited in revision 0.11 were corrected in revision 0.12.

PASS.

## 10. Publication integrity

~~~text
author Joshua Oshiro:                   PASS
AI assistance disclosed:                PASS
AI not responsible for core findings:  PASS
theorem-contamination firewall:         PASS
closed-law/result distinction:          PASS
heuristic-domain firewall:              PASS
centerline/live-line distinction:       PASS
references:                             64
reference numbering:                    sequential 1..64
license:                                PASS
~~~

## 11. Final disposition

~~~text
publication disposition:
    READY AS COMPREHENSIVE RESEARCH PREPRINT REVISION 0.12
    WITH HEURISTIC-DOMAIN FIREWALL
    ON research/semantic-quotient
~~~

No merge to main and no production-solver change is implied.
