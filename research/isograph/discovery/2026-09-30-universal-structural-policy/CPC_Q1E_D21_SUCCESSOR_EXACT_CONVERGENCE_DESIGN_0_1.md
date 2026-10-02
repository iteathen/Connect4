# CPC q1e forced-block / d21 successor exact-convergence design 0.1

**Date:** 2026-10-01  
**Status:** frozen exact-q convergence and interval back-propagation design  
**Branch:** `research/universal-structural-policy-20260930`

## Source states

### q1e obstruction

- q `1e8601e86599ef24`
- sequence `444441566666232222425511515331`
- rank 30
- support `[5,6,3,6,5,5,0]`
- P0 to move.

The frozen structural differential establishes:

- P1 has an enabled singleton A6;
- CPC baseline and frontier both restrict P0 to column A;
- every non-A P0 action permits an immediate P1:A6 terminal;
- P0:A6 is the only terminal-safe action.

### d21 qualified nonwin state

- q `d21a89605c399aca`
- sequence `444441566666232222425511515311`
- rank 30
- support `[6,6,2,6,5,5,0]`.

The qualified rank-30 backprop establishes d21 as
`P0_NONWIN [-1,0]`. Its P0:C action has a P1:G reply to exact q966, also
`P0_NONWIN [-1,0]`.

## Frozen exact-convergence hypothesis

Compare these rank-31 states:

```
Q_A = cofactor(q1e, P0:A6)
Q_C = cofactor(d21, P0:C3)
```

Both have support:

```
[6,6,3,6,5,5,0].
```

Their physical histories differ in A5/A6 ownership order. Do **not** infer
equality from support or from the qualified neutral-token quotient.

Test exact semantic identity directly:

```
support(Q_A) = support(Q_C)
R0(Q_A) = R0(Q_C)
R1(Q_A) = R1(Q_C).
```

If and only if all three hold, record `Q_A = Q_C`.

## Consequence if exact convergence holds

Independently cofactor P1:G from both rank-31 states and require both to reach
the same exact q966:

`966e6353e06e4d41`.

Then:

- q1e:A6 has an adversarial P1:G reply into q966 `[-1,0]`;
- all non-A q1e actions are already exact losses by P1:A6 terminal;
- therefore q1e is `P0_NONWIN [-1,0]`.

This is interval propagation through exact q equality, not a new theorem.

## If exact convergence fails

Do not generalize from support equality.

Record the exact residual difference between `Q_A` and `Q_C`, the q class
of q1e:A6;P1:G, and leave q1e unresolved for the next experiment.

## Acceptance

The audit must record:

- exact bridges for q1e and d21;
- exact q keys/classes of both rank-31 successors;
- support/P0 residual/P1 residual equality checks;
- whether exact convergence holds;
- exact q after P1:G from each successor;
- q966 handoff only if exact q equality is verified;
- q1e root action intervals;
- q1e classification/interval when justified;
- zero resource failures.

## Boundary

No oracle, solved W/D/L, minimax, unrestricted game-tree value search,
opening book, best-move table, BSFP solved frontier, support-only equality,
or sealed holdout is used.

The neutral-token principle motivates the test but is not used to assume the
result. Production CPC, JSMinSys and BSFP remain unchanged.
