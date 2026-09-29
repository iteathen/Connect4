# Open-cap first-terminal dominance

**Status:** guarded deductive principle + bounded exact structural evidence  
**Research direction:** Joshua Oshiro  
**Experimental branch:** research/nim-control-parity-algebra-20260929  
**Workflow:** 36592801151 — success  
**Solved W/D/L labels used:** no  
**Gameplay-authority effect:** none  
**Production-solver effect:** none

## First-terminal dominance lemma

Let R be one residual winning obligation owned by player P in a structural state.

If every legal continuation in which P completes R also completes some other existing residual Q no later than R, then R can never be the unique first terminal cause.

~~~text
forall continuations completing R:
    exists Q != R with completion(Q) <= completion(R)
        ->
R is behaviorally redundant
~~~

Deleting R therefore does not change literal first-terminal behavior. This statement does not use minimax values, solved outcomes, recursive quotient classes, or action relabeling.

## Complete 4x4 open-cap deletion family

The earlier structural audit found 170 exact open-cap class-preserving deletions.

Existing support-release capacity already proves 27 of those cap residuals unrealizable. The remaining 143 feasible cases were audited by enumerating every legal support continuation in which the cap owner actually completes the cap residual.

~~~text
feasible open-cap deletion cases             143
terminal-dominated cases                    143

conditioned cap-completing schedules         523
covered schedules                           523
uncovered schedules                           0
~~~

Thus every exact open-cap deletion equivalence in the current 4x4 family now has a direct rule-derived explanation: the cap residual is either support/turn unrealizable or it is never the unique first terminal cause.

The independent literal-continuation audit also found all 170 source/target pairs identical under the same future column actions.

## Earliest rank-8 instance: class 5950

~~~text
support = [0,2,2,4]
mover   = P0

P0 residuals:
1792, 4369, 8193, 17408

P1 residuals:
4369, 5120, 8704, 28672
~~~

The removable residual 28672 is exactly the three currently open top caps.

P1 has four remaining moves. Completing the three caps consumes three of them, so P1 can own exactly one non-cap support event.

The exact support audit found 36 legal cap-completing interleavings. Every one is covered by another terminal obligation:

~~~text
P0 residual 1792 completes at ply 7   22 schedules
P1 residual 5120 completes at ply 6    1 schedule
P1 residual 5120 completes at ply 8    6 schedules
P1 residual 8704 completes at ply 4    4 schedules
P1 residual 8704 completes at ply 6    3 schedules
                                             --
                                             36
~~~

The cap residual itself always completes at ply 8 in those continuations, so it is never the unique first terminal cause.

Conditioned on P1 owning all three caps, the only feasible single P1-owned lower support cells are column 0 row 0, column 0 row 1, column 1 row 2, and column 2 row 2.

If P1 owns column 0 row 0 or row 1, P0 owns all three row-2 cells in columns 0,1,2 and completes residual 1792 before the final cap event. If P1 owns column 1 row 2, P1 completes residual 8704. If P1 owns column 2 row 2, P1 completes residual 5120.

P1 cannot use its sole lower-support move on column 0 row 2 while also owning all three caps: the prerequisite support service consumes the earlier opponent turns so that P1 has no legal assigned event on an intermediate turn.

## Interpretation

The open-cap family is not fundamentally an action-symmetry problem. It is a first-terminal obligation-dominance problem.

~~~text
residual realizability
    !=
residual strategic relevance

realizable residual R
+ competing obligations / support service
    ->
R may still be terminal-dominated
~~~

This explains why simple realizability closures plateaued near half of the 4x4 static-to-recursive gap: many remaining residuals are possible to complete but cannot create a new first terminal event.

## Constructive complexity

The current bounded proof procedure enumerates legal support interleavings conditioned on cap completion. That is exact and outcome-free, but it is not yet a polynomial generalized detector.

The next target is to compress the same proof into a support/resource/deadline coverage law:

~~~text
cap ownership
+ remaining-turn budget
+ support-service obligations
+ competing residual coverage
    ->
terminal dominance
~~~

Class 5950 supplies a minimal concrete instance for deriving that law.

## Non-claims

This result does not say every open-cap residual in arbitrary Connect-K is redundant. It does not establish a polynomial dominance detector, polynomial structural graph growth, or an XOR W/D/L formula.

It does establish that all 170 exact open-cap deletion equivalences observed in the exhaustive 4x4 structural control now have direct rule-derived explanations.
