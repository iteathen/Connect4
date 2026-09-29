# C = NC? publication preflight — revision 0.5

**Status:** publication preflight PASS  
**Date:** 2026-09-29 America/Los_Angeles  
**Paper:** research/publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_5.md  
**Paper commit:** e17cf7c5f59d0d4ec4ce7fb1fa0e8c06d583424a  
**Canonical research branch:** research/semantic-quotient

## 1. Revision purpose

Revision 0.5 preserves revisions 0.1 through 0.4 and adds an explicit heuristic-provenance firewall.

The new section distinguishes:

~~~text
rule-derived heuristic
unproved heuristic prior
solved-knowledge-contaminated preference
~~~

and separately distinguishes move ordering from theorem-backed search elimination.

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

## 3. Exact-search correctness versus research admissibility

The paper correctly states that a guessed move-ordering preference does not by itself invalidate exact alpha-beta/minimax correctness when all pruning still follows from sound exact bounds.

It also correctly states that this is weaker than the paper's rule-only research standard.

Therefore:

~~~text
harmless move ordering
    !=
rule-derived structural evidence
~~~

PASS.

## 4. Rule-derived heuristic class

The paper permits heuristics whose definitions are mechanically reconstructible from:

- current position;
- board geometry;
- Connect-K winning-line incidence;
- gravity/support;
- ownership;
- alternation;
- proven parity/deadline consequences.

It explicitly includes live-line evaluation under this condition and allows static center incidence only when the center preference is actually derived from geometry rather than imported from solved knowledge.

The paper correctly preserves:

~~~text
rule-derived heuristic
    !=
exact value theorem
~~~

PASS.

## 5. Unproved heuristic prior

The paper allows an explicitly disclosed intuition such as "center probably matters" to affect search ordering without treating it as structural evidence.

It forbids using the unproved prior to eliminate alternatives or to support a theorem claim.

PASS.

## 6. Solved-knowledge contamination

The paper excludes from the blind producer:

- center preference chosen because solved play says center is best;
- starting from 444 because an opening database says it is optimal;
- weights selected to reproduce known solved W/D/L labels.

Such material remains admissible only as post-hoc validation/falsification evidence after the producer result is frozen.

PASS.

## 7. Centerline versus live-line distinction

The paper explicitly notes that an identical numerical center-first ordering may have different epistemic status depending on provenance:

~~~text
mechanically derived center incidence
    -> rule-derived

human intuition
    -> unproved prior

known solved result
    -> contaminated
~~~

It does not claim that all external Connect Four engines use center ordering for the same reason.

Live-line evaluation is characterized as epistemically cleaner when mechanically computed from current surviving winning-line geometry, while still not being promoted to an exact value oracle.

PASS.

## 8. Opening-prefix theorem boundary

The paper now states the target as:

~~~text
Connect Four rules + 7x6 geometry
    proves
empty -> 4 -> 44 -> 444
~~~

and requires every implication to remain valid after removing:

- solved tables;
- opening books;
- precomputed W/D/L data;
- oracle conclusions.

An oracle may verify or falsify the theorem after construction but may not supply a premise.

The paper correctly distinguishes a theorem-backed prefix reduction from an opening-book axiom.

PASS.

## 9. Existing technical results and references

Revision 0.5 makes no new game-theoretic or algebraic result claim. It adds methodology/provenance discipline only.

The existing 41 sequential references and all revision 0.4 technical claims are preserved.

PASS.

## 10. Final disposition

~~~text
authorship/provenance:                 PASS
AI-assistance disclosure:             PASS
core-findings attribution:            PASS
heuristic-provenance firewall:        PASS
move-ordering distinction:            PASS
centerline classification:            PASS
live-line classification:             PASS
opening-prefix theorem boundary:      PASS
no new unsupported result claim:      PASS
references preserved:                 PASS
license:                              PASS

publication disposition:
    READY AS RESEARCH PREPRINT REVISION 0.5
    ON research/semantic-quotient
~~~

No merge to main and no production-solver change is implied.
