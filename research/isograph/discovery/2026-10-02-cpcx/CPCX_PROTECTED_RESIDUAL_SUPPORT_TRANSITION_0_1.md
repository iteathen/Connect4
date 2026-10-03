# CPCX Protected-Residual Support Transition 0.1

**Status:** frozen theorem contract; implementation/qualification pending
**Scope:** experimental CPCX only
**Observation:** exact support-state transition of one pinned live residual under one non-target event

## Purpose

Package residual cofactor identity and gravity support transport into one exact rank-local theorem.

Let S be an exact nonterminal position, R one pinned live residual for player P with missing cells T, and e one current legal frontier event.

## Premises

1. S is exact and nonterminal.
2. R is live and pinned by player/line ancestry.
3. e is the current legal frontier event in its column.
4. e is not one of R's missing cells.
5. Apply e with exact first-win stopping; a terminal event stops the theorem and produces no nonterminal transport.

## Exact nonterminal transition

Because e is not a missing cell of R, owner-labelled residual cofactor algebra leaves the protected residual unchanged: same player, same line ancestry, same missing-cell set.

For each protected missing target t:

- if column(t) = column(e), supportDistance(t) decreases by exactly 1;
- otherwise supportDistance(t) is unchanged.

Therefore protected support debt D_R = sum supportDistance(t) changes by -m_e, where m_e is the number of protected missing cells in the event column.

If m_e = 0, the event is a support-state stutter for R.

## Event-phase gauge

Every protected target remains empty. The qualified global event-phase gauge therefore applies: one physical event complements all absolute target event parities, while the relative event-phase signature is unchanged.

## Conclusion

For a nonterminal event emit PROTECTED_RESIDUAL_SUPPORT_TRANSITION containing:

- unchanged protected residual ancestry and missing-cell set;
- exact before/after support-distance vectors;
- exact support-debt delta;
- touched target-column count;
- relative event-phase invariance;
- whether the event is an external support stutter.

No W/D/L or eventual-completion conclusion is implied.

## First-win discipline

If e terminally wins for either player, first-win stopping ends the transition. A nonterminal support transition does not imply future events are safe.

## Complexity

O(liveLineCount + K) for protected residual cardinality K<=4. No recursive reply traversal.

## Required qualification controls

1. Fresh one-target-column support advance.
2. Fresh external support stutter.
3. Vertical residual where one support event decreases multiple protected support distances in the same column.
4. Rejection when the event is itself a protected target.
5. Exact terminal stopping.
6. Event-phase relative-signature preservation.
7. Production-CPC / solver / oracle / recursion isolation.

## Turn-6 application boundary

For the qualified universal diagonal carrier A6-B5-C4-D3 with missing cells {A6,B5,C4}, the missing targets occupy distinct columns.

Thus every nonterminal A/B/C frontier event below its target decreases diagonal support debt by exactly one, while every nonterminal event outside A/B/C is a support-state stutter.

This does not prove strategic safety, delete opponent residuals, or prove Best(44444).