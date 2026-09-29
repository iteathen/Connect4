# C = NC? publication preflight — revision 0.9

**Status:** publication preflight PASS  
**Date:** 2026-09-29 America/Los_Angeles  
**Paper:** research/publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_9.md  
**Paper blob reviewed:** 0e2d3a12539dc2c67558923d8dbe1cb0f893ec1f  
**Paper commit:** dd50cd81321705bc36741286e3f9d0d5611ef319  
**Canonical research branch:** research/semantic-quotient

## 1. Revision purpose

Revision 0.9 preserves revisions 0.1 through 0.8 and adds a practical human-board-strategy section.

The new section translates the structural research into ordinary move-selection questions without weakening the theorem-contamination firewall.

PASS.

## 2. Evidence classes

The human section explicitly separates four classes:

~~~text
THEOREM
RULE-DERIVED HEURISTIC
COMPUTATIONALLY EXACT
SOLVED-PLAY FACT
~~~

The same move may have more than one justification, but the paper does not merge their provenance.

PASS.

## 3. Opening advice

The paper states the exact non-center theorem:

~~~text
all six non-center first moves
admit P1 safety policies preventing P0 win.
~~~

Human consequence:

~~~text
a P0 player seeking a forced win
must begin in column 4.
~~~

The section separately labels the independently solved center win as a solved-play fact.

It does not claim that the non-center theorem alone proves center is winning.

PASS.

## 4. No universal centerline rule

The paper explicitly rejects the inference:

~~~text
center is the correct empty-board opening
    therefore
always play the most central legal move.
~~~

Middle-game guidance instead uses live winning requirements, support, accessibility, response resources, and timing.

PASS.

## 5. Human residual-state translation

The section translates exact q semantics into:

~~~text
column support/heights
+
your surviving winning recipes
+
opponent surviving winning recipes.
~~~

Human move questions include:

- which own live fours are shortened;
- which opponent live fours are killed;
- which short residuals become playable;
- which supports are exposed;
- which route can complete first.

PASS.

## 6. Exact tactical hierarchy

The section correctly states:

~~~text
legal immediate win
    -> take it

one distinct playable opponent completion
    -> forced reply unless winning first

two distinct playable opponent completions
+ no immediate win
    -> forced loss.
~~~

The section distinguishes playable completion cells from visually apparent three-in-a-row patterns.

PASS.

## 7. Support and preemption

The section gives the practical support rule:

> Before a nonterminal move, inspect what cell becomes playable above the landing cell.

It also translates support-shadow preemption from the non-center proof into a human warning that an upper-row target may lose to an earlier lower support-line completion.

PASS.

## 8. Response resources

The section translates paired-response structures into the broader human principle that threats consume response resources.

It does not present the local direct-above response component as a universal strategy.

The exact two-playable-completion fork remains distinguished from longer-horizon overload heuristics.

PASS.

## 9. Parity scope

The section gives the standard-board zero-reservation CPC baseline in human row numbering:

~~~text
P0 baseline rows: 1,3,5
P1 baseline rows: 2,4,6
~~~

It explicitly states that this is conditional, not a context-free odd/even theorem.

Support order, strategic correction events, resources, and deadlines remain required.

PASS.

## 10. Live-line versus center-distance evaluation

The section presents live-line evaluation as rule-derived heuristic unless an exact value implication is separately proved.

It explicitly notes that cross-support residual comparison can fail, so raw line counts are not promoted to a universal numerical score.

No fitted numeric weights are introduced.

PASS.

## 11. Concrete examples

The section gives:

~~~text
empty board:
    move 4
    theorem-backed as the only opening not structurally excluded
    plus independently solved as winning

position 44:
    move 4
    computationally exact through the independent exact-search controls
    not yet a compact structural theorem.
~~~

This preserves the production-proof distinction.

PASS.

## 12. Human checklist

The section provides a ten-step over-the-board scan:

1. immediate win;
2. opponent immediate completion cells;
3. surviving live recipes;
4. playability/support;
5. support exposed to opponent;
6. response overload;
7. first-win/support-shadow race;
8. parity/control;
9. symmetry/behavioral equivalence;
10. positional heuristics only afterward.

This is practical guidance, not an assertion that the checklist itself is an exact solver.

PASS.

## 13. Publication integrity

~~~text
author Joshua Oshiro:                  PASS
AI assistance disclosed:               PASS
AI not responsible for core findings: PASS
theorem-contamination firewall:        PASS
human advice provenance labels:        PASS
no fitted solved-answer weights:       PASS
top-level numbered sections:           22
references:                            64
reference numbering:                   sequential 1..64
license:                               PASS
~~~

## 14. Final disposition

~~~text
publication disposition:
    READY AS COMPREHENSIVE RESEARCH PREPRINT REVISION 0.9
    WITH PRACTICAL HUMAN-STRATEGY TRANSLATION
    ON research/semantic-quotient
~~~

No merge to main and no production-solver change is implied.
