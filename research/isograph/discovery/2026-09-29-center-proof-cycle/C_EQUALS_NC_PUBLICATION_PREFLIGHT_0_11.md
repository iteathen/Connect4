# C = NC? publication preflight — revision 0.11

**Status:** publication preflight PASS  
**Date:** 2026-09-29 America/Los_Angeles  
**Paper:** research/publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_11.md  
**Paper blob reviewed:** 2196c1cc055d4ab4202b0a18836c31a4650ccd5b  
**Paper commit:** 66a0e187d9f8a38984cd0f5aadcaa3f69353e6fe  
**Canonical research branch:** research/semantic-quotient

## 1. Revision purpose

Revision 0.11 replaces the over-strict requirement to re-execute every theorem proof during each solve with the sharper distinction between **closed laws**, **unclosed theorems**, and **instance results**.

PASS.

## 2. Closed-law rule

The paper now states:

~~~text
closed law
    -> may be part of the solver's trusted mathematics
    -> need not be re-proved every run

unclosed theorem
    -> remains research evidence
    -> cannot yet serve as solver axiom

instance result
    -> cannot be promoted into a law merely to skip solving that instance
~~~

PASS.

## 3. Closed-form theorem use

A provenance-clean closed-form theorem over a genuine family may be specialized directly to the current W/H/K instance.

This is treated as ordinary mathematics, not opening-book reuse.

PASS.

## 4. Law closure requirements

Solver-law admission requires:

- genuine quantified family;
- proof premises terminating in rules, geometry, logic, or already closed laws;
- all quantified proof obligations discharged;
- no solved tables, best-move labels, oracle values, fitted parameters, or target-instance answers as premises;
- no hidden target fitting;
- conclusion valid for every instance satisfying the declared guards;
- recursively closed dependencies.

PASS.

## 5. Current non-center theorem status

The paper no longer treats the existing 7x6 consequence as automatically solver-admissible.

It records the current work as:

~~~text
strong target-instance result
+ parameterized seven-wide/even-height statement
~~~

and requires a dedicated closure audit before promotion to the solver theorem base.

PASS.

## 6. No forced theorem re-execution

The paper explicitly says that once a general theorem is closed, provenance-audited, and admitted as a law, the solver may use it directly and does not need to regenerate its original proof on every run.

PASS.

## 7. Result firewall

Instance-specific objects remain results:

- W/D/L values;
- best moves;
- root bounds;
- target-instance policies;
- target-instance proof certificates;
- completed target-instance coverage tables;
- persistent TT entries;
- exact search outputs such as 44->444.

They may validate or falsify a law but do not become laws merely because they were produced mathematically.

PASS.

## 8. Promotion boundary

The paper defines:

~~~text
research claim
    ->
general proof
    ->
provenance audit
    ->
closure audit
    ->
qualified closed law
    ->
solver theorem base
~~~

PASS.

## 9. Human-strategy and conclusion consistency

The human-strategy section and conclusion now use the same law/result boundary.

They no longer state that every closed theorem consequence must be recomputed from scratch during each solve.

PASS.

## 10. Publication integrity

~~~text
author Joshua Oshiro:                  PASS
AI assistance disclosed:               PASS
AI not responsible for core findings: PASS
theorem-contamination firewall:        PASS
closed-law/result distinction:         PASS
current non-center law not overclaimed: PASS
references:                            64
reference numbering:                   sequential 1..64
license:                               PASS
~~~

## 11. Final disposition

~~~text
publication disposition:
    READY AS COMPREHENSIVE RESEARCH PREPRINT REVISION 0.11
    WITH CLOSED-LAW / RESULT SOLVER STANDARD
    ON research/semantic-quotient
~~~

No merge to main and no production-solver change is implied.
