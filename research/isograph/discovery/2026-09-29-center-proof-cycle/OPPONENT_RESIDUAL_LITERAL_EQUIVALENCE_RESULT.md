# Opponent-residual literal-continuation equivalence

**Status:** bounded exact structural discovery evidence  
**Research direction:** Joshua Oshiro  
**Experimental branch:** research/nim-control-parity-algebra-20260929  
**Workflow:** 36592494824 — success  
**Solved W/D/L labels used:** no  
**Gameplay-authority effect:** none  
**Production-solver effect:** none

## Question

The recursive action-unlabelled quotient showed 438 reachable cases on rewritten
4x4 Connect-4 where deleting one opponent residual obligation lands in the same
recursive structural class.

That alone does not say whether the deleted obligation is locally inert.
Recursive equality could in principle arise only after action relabeling or
several rounds of branch transport.

This audit asks a stronger question.

For each class-preserving deletion, compare the source and deletion-target under
the **same literal future column actions**. At every step:

- support is advanced by the same column;
- residual cofactors and blockers are applied directly;
- first-win stopping is respected;
- no column permutation is used;
- no recursive class IDs or W/D/L labels are used to decide equivalence.

The pair is literal-continuation equivalent only if every same-column
continuation produces the same terminal type at the same point, recursively.

## Exact result

~~~text
class-preserving single-opponent-residual deletions   438
literal-continuation equivalent                       427
not literal-continuation equivalent                    11
~~~

Therefore:

~~~text
427 / 438 = ~97.49%
~~~

of the observed deletion equivalences do **not** require action-unlabelled
quotienting to exist. Their extra opponent residual is already invisible to the
complete literal continuation behavior.

## Open-cap family

The result is stronger for exact open-cap obligations.

~~~text
exact open-cap class-preserving deletions             170
literal-continuation equivalent                       170

open-cap deletions unexplained by support-release     143
literal-continuation equivalent                       143
~~~

Thus every exact open-cap deletion equivalence in the current 4x4 control is
already literal-action equivalent.

This changes the interpretation of that family:

~~~text
open-cap residual present
vs
open-cap residual absent
    ->
same literal continuation behavior
~~~

not merely:

~~~text
different literal behavior
    ->
later merged by action-unlabelled recursion
~~~

## Earliest instance

The sole rank-8 class-preserving deletion is class 5950:

~~~text
support: [0,2,2,4]
mover:   P0

P0 residuals:
1792, 4369, 8193, 17408

P1 residuals with cap:
4369, 5120, 8704, 28672

P1 residuals without cap:
4369, 5120, 8704

removed residual:
28672 = all currently open top caps
~~~

The source and target are literal-continuation equivalent.

This is especially significant because the earlier recursive witness audit gave
class 5950 a six-step forward witness and no exact shared child state in any of
its three child classes. The deep witness was therefore not evidence that the
extra cap obligation had strategic effect. It was evidence that the literal
residual **representatives** remained different even though their terminal
behavior was already identical.

## Interpretation

The remaining gap is more specifically a terminal-cause redundancy problem.

For most class-preserving opponent-residual deletions, and for every exact
open-cap case measured here, the deleted residual never creates a distinct
literal first-terminal behavior.

This supports searching for a direct rule of the form:

~~~text
residual R
+ support / turn / competing-obligation structure
    ->
R can never be the unique first terminal cause
    ->
R is behaviorally inert
~~~

Such a rule would be stronger and cheaper than reconstructing recursive
bisimulation after generating both states.

The next audit conditions on legal continuations that actually complete an
open-cap residual and checks whether another residual is forced to terminate no
later. That can distinguish terminal dominance from unexplained accidental
equivalence.

## Non-claims

Literal-continuation equivalence in the bounded graph is not by itself a general
local deletion theorem. The 11 non-literal class-preserving deletions also show
that recursive quotienting still has genuinely stronger equivalences outside
this dominant family.

No W/D/L formula, generalized complexity bound, or production change follows.
