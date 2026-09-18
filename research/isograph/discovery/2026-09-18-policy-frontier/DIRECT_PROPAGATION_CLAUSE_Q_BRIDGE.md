# Direct rank propagation — clause/q bridge

**Date:** 2026-09-18  
**Status:** derived research result; standard-7x6 root not solved  
**Owner:** research/semantic-quotient  
**Base authority:** Connect4 IsoGraph 1.1  
**Authority mutation:** none

## Result

Direct rank-by-rank propagation now separates three exact carriers:

~~~text
physical ownership boundary
    exact but far too fine

support-local clause/proof boundary
    predecessor-closed and operational

q / residual value boundary
    much smaller semantic/decision carrier
~~~

The data show that the standard-board scaling wall is produced primarily when proof-side universal composition is fully distributed before the result is allowed to collapse back to q/value semantics.

## Exact deadline recurrence

A rank recurrence was implemented for P0 earliest forced terminal ply:

~~~text
P0 turn: existential union / minimum deadline
P1 turn: universal intersection / maximum deadline
one-ply step: exact owner-labelled cofactor
P0 terminal: inject winning prerequisite
P1 terminal: apply first-win blocker
~~~

On complete controls the ownership form reproduced exact state value, exact action value and exact best-move sets with zero mismatches.

Ownership deadline storage included:

~~~text
4x3 c3    10,972 records, max frontier 48
4x4 c4    21,213 records, max frontier 54
5x3 c4    16,218 records, max frontier 19
4x5 c4   153,794 records, max frontier 85
~~~

Collapsing nested thresholds into one valued boundary reduced duplicated storage but retained the same P1/universal product wall.

## Standard 7x6 ownership wall

Exact complete-support publication near the terminal boundary produced:

~~~text
rank 40       174 ownership generators, max 9
rank 39    64,808 ownership generators, max 3,618
rank 38    38,336 ownership generators, max 2,162
~~~

The next universal step did not complete inside the bounded research window.

## q projection proves the wall is representation-induced

The exact ownership boundary was projected to ordinary q identity and then to the P0-favorable abstract residual-Pareto bounds boundary:

~~~text
rank 40:
    ownership 174 -> distinct q-shaped residual signatures 54 -> abstract residual-Pareto bounds 46
    max/support 9 -> 3 -> 2

rank 39:
    ownership 64,808 -> distinct q-shaped residual signatures 626 -> abstract residual-Pareto bounds 192
    max/support 3,618 -> 12 -> 4

rank 38:
    ownership 38,336 -> distinct q-shaped residual signatures 2,740 -> abstract residual-Pareto bounds 1,039
    max/support 2,162 -> 42 -> 10
~~~

At rank 39 this is a 103.53x ownership-to-q collapse and a 337.54x ownership-to-abstract-residual-Pareto collapse.

Therefore the semantic value boundary is small even where the fine ownership representation explodes.

## Existing predecessor-closed bridge

C4-R0073 already supplies the required finite predecessor-closed proof vocabulary:

~~~text
D(S) = occupied-cell singletons
       union nonempty winning-line past intersections
~~~

Every child clause maps exactly to SATISFIED, KILL, or one parent clause under a legal predecessor.

C4-R0074 independently qualified this coverage/cofactor recurrence over six complete geometries with 6,951 supports, 50,856 cofactor maps and zero support mismatches.

This proof carrier is the past/occupied dual of the residual future carrier:

~~~text
winning line
    = past clause part
      disjoint-union
      future residual requirement
~~~

## Deadline-labeled clause frontier

The P0 deadline recurrence was re-expressed over support-local coverage signatures. Persistent records contain only clause coverage plus deadline; physical ownership masks are not retained.

Every reachable state was checked on the first three complete controls:

~~~text
4x3 c3     4,631 states, 0 mismatches, 1,555 records, max 15
4x4 c4   134,289 states, 0 mismatches, 2,246 records, max 13
5x3 c4   147,563 states, 0 mismatches, 1,946 records, max 8
~~~

Larger complete-control frontiers:

~~~text
4x5 c4    13,446 records, max 30
5x4 c4    41,727 records, max 53
~~~

## Standard 7x6 clause propagation

~~~text
rank 40       174 records, max 9
rank 39     1,760 records, max 53
rank 38     3,186 records, max 58
rank 37    33,566 records, max 403
rank 36    50,176 records, max 321
~~~

The clause carrier therefore removes most of the fine ownership blowup while remaining predecessor-closed.

## Rank-35 localization

Rank 35 has 1,709 supports. Computing all move frontiers while deliberately skipping their universal conjunction completes; only a minority of supports are pathological.

Examples:

~~~text
support [5,5,5,2,6,6,6]
move widths 74,170,210,217
naive full product 573,270,600

support [5,5,2,5,6,6,6]
move widths 43,89,119,129
naive full product 58,748,277

balanced support [5,5,5,5,5,5,5]
move widths 12,13,13,13,13,13,13
computes quickly
~~~

So rank 35 is not intrinsically broad. A small family of universal conjunctions causes the wall.

## Exact reductions already falsified as sufficient

The following were tested without changing semantics:

- exact/conservative legal-cardinality filtering;
- smallest-frontier-first conjunction ordering;
- deadline-streaming Pareto reduction;
- direct multiway branch-and-bound Pareto product;
- conditioning on the known root-center P0 anchor;
- a non-distributed monotone formula DAG.

All preserved correctness on their controls. None removed the standard rank-35 wall. The formula DAG grew worse than the clause antichain carrier.

An implementation cleanup removing BigInt-to-decimal-string round trips sped rank 37 from roughly 8 seconds to roughly 2 seconds, but rank 35 still exceeded the bounded run. The remaining wall is therefore not serialization overhead.

## Structural interpretation

The missing method is now localized:

~~~text
predecessor-closed proof carrier
        -> compact controllable predecessor
        -> q / residual value boundary
~~~

The current implementation instead does:

~~~text
predecessor-closed proof carrier
        -> fully distribute universal proof alternatives
        -> normalize
        -> only later collapse semantically
~~~

This directly connects C4-R0043 and C4-R0069. The experiment suggests they are two descriptions of the same missing seam: a compact realizability-preserving controllable predecessor that projects proof-side structure to the much smaller q/value boundary before distributed proof alternatives explode.

## Solver consequence

CUDA-BSFP should construct the proof/predecessor boundary but publish a compact semantic/value projection as early as soundness permits.

IsoMax should consume q/action-value boundary facts directly and recurse only when those facts do not separate the actions.

SUT therefore looks less like a bridge between two solver semantics and more like two evaluation directions over one typed proof/value correspondence.

## Current stopping point

The empty standard 7x6 root has not been solved by this new direct propagation path.

Exact complete-support publication currently reaches rank 36. Rank 35 is the first unclosed rank because universal proof composition expands before q/value collapse.

That negative result is retained as the next research seam rather than hidden by a larger timeout or buffer.

## Confirmation and IsoGraph recording

The representation/composition-wall finding was independently reviewed after this experiment.

Confirmation:

- `DIRECT_PROPAGATION_CONFIRMATION.md`
- `DIRECT_PROPAGATION_CONFIRMATION.json`

Post-authority Connect4 IsoGraph successor overlay:

- `research/isograph/successor/CONNECT4_POST_1_1_DIRECT_PROPAGATION_OVERLAY_0_1.md`
- `research/isograph/successor/CONNECT4_POST_1_1_DIRECT_PROPAGATION_OVERLAY_0_1.json`
- `research/isograph/successor/CONNECT4_POST_1_1_DIRECT_PROPAGATION_OVERLAY_0_1.isg`

Recorded claims:

~~~text
C4-R0075
    confirmed scoped finding:
    distributed universal proof composition causes the observed
    rank-35 direct-propagation wall before semantic collapse

C4-R0076
    missing law:
    compact realizability-preserving clause-to-value
    controllable predecessor before distributed universal expansion
~~~

The overlay does not mutate frozen authority 1.1.

## Disposition

~~~text
direct rank recurrence             exact on complete controls
ownership carrier                 exact but too fine
support-local clause carrier       predecessor-closed and strongly supported
q/value projection                 very large exact high-rank collapse
rank-35 wall                       distributed universal proof expansion
generic reducer tuning             insufficient
next seam                          compact clause-to-q controllable predecessor
empty root solved                  NO
authority 1.1 mutated              NO
~~~