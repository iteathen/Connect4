# Connect4 NEI post-application reassessment — standard 7x6 q identity

**Date:** 2026-09-18  
**Historical result:** `NEI-C4-0007 = INCOMPLETE_UNQUALIFIED`  
**Historical result mutated:** no  
**New evidence:** `research/isograph/discovery/2026-09-18-high-value-leads/STANDARD_7X6_Q_CONGRUENCE.md`

## Reason for reassessment

The original NEI application correctly failed closed because SIU-1 itself supplied only complete bounded controls and explicitly did not claim standard-7x6 exhaustive sufficiency.

The later high-value-lead investigation derived a direct transition-congruence proof from the residual semantics.

Therefore the reason for incompleteness has changed.

## Current interpretation

Under the old pinned evidence revision:

~~~text
NEI-C4-0007
    = INCOMPLETE_UNQUALIFIED
~~~

remains historically correct.

Under the new research evidence:

~~~text
q(s)=q(t)
~~~

for legal nonterminal standard-7x6 states appears sufficient to prove:

~~~text
future-behavior identity SAME
~~~

because q determines the complete action-labelled future transition system.

## Why the result is not silently rewritten now

The new proof has not yet undergone an independent successor qualification/authority cycle.

NEI claims remain tied to their exact profile/evidence revision.

Therefore:

~~~text
historical NEI result:
    preserved

new candidate result:
    SAME under P-C4-FUTURE-BEHAVIOR-STATE-7X6
    pending independent qualification
~~~

## Required next step

A successor NEI evidence revision should:

1. independently review the q-congruence proof;
2. verify the first-win/minimal-antichain lemma;
3. include negative scope controls showing q does **not** preserve physical identity, move history, winning-line provenance, or non-q proof context;
4. if those checks pass, promote the standard-7x6 future-behavior identity result from incomplete to SAME under the declared profile.

**NEI_7X6_REASSESSMENT = CANDIDATE_SAME_PENDING_QUALIFICATION**
