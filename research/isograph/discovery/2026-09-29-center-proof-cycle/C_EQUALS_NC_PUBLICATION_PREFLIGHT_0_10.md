# C = NC? publication preflight — revision 0.10

**Status:** publication preflight PASS  
**Date:** 2026-09-29 America/Los_Angeles  
**Paper:** research/publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_10.md  
**Paper blob reviewed:** dc431e4d404e2658da289d53f71c4cdd24acd09a  
**Initial paper commit:** 129a1a70c08c15ea5a916087ffc095f489405848  
**Rendering follow-up:** 6314d8d816be090426cebba90cd16602ddff060c  
**Canonical research branch:** research/semantic-quotient

## 1. Revision purpose

Revision 0.10 closes the remaining solve-engine provenance loophole.

A theorem may be mathematically correct while a previously derived target-instance consequence remains prior solved knowledge for a later engine run.

PASS.

## 2. Theorem schema versus theorem instance

The paper now distinguishes:

~~~text
generic theorem schema / derivation algorithm
    -> admissible solver machinery

previously derived target-instance theorem consequence
    -> prior solved-instance knowledge

previously generated target-instance certificate
    -> prior solved-instance proof artifact
~~~

A solve engine must derive the target-instance consequence during the current run.

PASS.

## 3. Stored theorem conclusions are not fresh solves

The paper explicitly rejects a solver implementation equivalent to:

~~~text
if standard 7x6:
    non-center openings <= DRAW
    search center only
~~~

when the bound is merely stored from prior research.

Replacing an opening-book table with source code encoding the same prior conclusion does not change its provenance.

PASS.

## 4. Proof verifier versus solver

The paper now distinguishes:

~~~text
old certificate + checker
    -> proof verifier

current-run certificate generation + checker
    -> certificate-producing solver

preloaded move/value
    -> lookup/opening-book system

generic theorem machinery
+ current-run instantiation
+ unresolved exact search
    -> structural solve engine
~~~

All may be useful, but they are different computational claims.

PASS.

## 5. Fresh-solve admissible inputs

The current standard permits:

- game rules;
- instance parameters W,H,K;
- generic geometry/support construction;
- generic symmetry;
- generic residual/cofactor/antichain laws;
- generic parity/blocker/resource/deadline theorem schemas;
- generic certificate/policy construction algorithms;
- generic certificate verification.

It does not permit target-instance conclusions generated during earlier solves.

PASS.

## 6. Cold-solve deletion test

Before a claimed fresh solve, delete:

~~~text
opening books
solved tables
prior W/D/L caches
persisted TT contents
target-instance proof certificates
precomputed root/prefix bounds
known best-move tables
development-time answer annotations
~~~

Retain only generic solving machinery, rules, and W/H/K.

A fresh solve passes only if all search-eliminating instance consequences are reconstructed before use.

PASS.

## 7. Non-center opening theorem consequence

The existing non-center theorem remains a valid mathematical theorem.

For fresh IsoMax use, however, the engine or initialization layer must reconstruct and verify the target-instance non-center certificates from generic geometry/rule machinery during that run.

Shipping the already-derived 7x6 bound would be theorem-shaped caching, not a fresh solve.

PASS.

## 8. Recursive provenance

The freshness rule applies recursively.

If a top-level runtime theorem is recomputed but depends on a target-instance supporting lemma or certificate shipped from an earlier solve, the solve does not become fresh merely because the final inference was rerun.

PASS.

## 9. Existing publication integrity

~~~text
author Joshua Oshiro:                  PASS
AI assistance disclosed:               PASS
AI not responsible for core findings: PASS
theorem-contamination firewall:        PASS
28-realization contamination example: PASS
human-strategy provenance labels:      PASS
references:                            64
reference numbering:                   sequential 1..64
license:                               PASS
~~~

## 10. Final disposition

~~~text
publication disposition:
    READY AS COMPREHENSIVE RESEARCH PREPRINT REVISION 0.10
    WITH FRESH-SOLVE / NO-REPLAY STANDARD
    ON research/semantic-quotient
~~~

No merge to main and no production-solver change is implied.
