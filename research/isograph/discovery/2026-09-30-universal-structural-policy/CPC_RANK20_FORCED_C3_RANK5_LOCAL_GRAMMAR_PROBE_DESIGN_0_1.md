# RLC forced-c3 rank-5 local proof-grammar probe 0.1

**Date:** 2026-10-01  
**Status:** frozen bounded composition probe before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume only:

- `CPC_RANK20_FORCED_C3_FIRST_FAILURE_LOCAL_GRAMMAR_PROBE_0_1.json`;
- `CPC_RANK20_FORCED_C3_LEGACY_PROOF_FAMILY_MATRIX_0_1.json`.

The source establishes:

- 11 exact first-failure leaves;
- 11 distinct exact-q classes;
- zero closure under the previously qualified bounded forms `E(O)` and `E(A(I|E(O)))`;
- no legacy proof-family closure and no resource failure.

## Purpose

Test one additional bounded recursive-composition layer using the same positive proof grammar already present in the repository.

Do not add a game-specific theorem or new local predicate.

## Allowed lower proof forms

At any Player-0 state, lower closure may be:

1. `I` — an immediate Player-0 terminal move exists;
2. `E(O)` — one Player-0 action reaches an overload leaf;
3. a previously qualified rank-3 form `E(A(S))`, where each defender reply is discharged by `I` or `E(O)`.

## Rank-5 candidate

For an unresolved Player-0 leaf `q`, a rank-5 proof exists iff there is one legal Player-0 action `a` such that for **every** legal Player-1 reply `b`, the resulting Player-0 state `q·a·b` has one of the allowed lower proof forms above.

Record the exact lower expression for every defender reply.

This is a bounded constructive proof:

```text
E(
  A(
    I
    | E(O)
    | E(A(I|E(O)))
  )
)
```

where the actual consequence set is whatever exact lower expressions occur.

## No recursive expansion beyond rank 5

The implementation may call the existing rank-1 and rank-3 predicates on lower states.

It must not recursively call the rank-5 predicate.

No deeper grammar, minimax value, solved oracle, or free-branch recursion is allowed.

## Exact consequence classes

For each universal reply preserve:

- defender column;
- exact lower q class;
- lower proof expression;
- lower proof witness.

Report both:

- raw defender reply count;
- number of distinct exact lower-q classes;
- number of distinct lower proof-expression classes.

Exact q identity may normalize reporting but may not discharge an unproved reply.

## Output

For each of the 11 source leaves report:

- exact source q class/rank/support;
- rank-5 proved/unproved;
- root witness move if proved;
- raw defender reply count;
- normalized lower q-class count;
- normalized lower expression count;
- lower consequence rows;
- first unresolved defender reply for each rejected root move.

Also report:

- rank-5 proved count;
- cumulative bounded-grammar closure count over rank 1/3/5;
- unresolved exact-q classes.

## Interpretation

A positive result means the obstruction is compositional: scalar legacy measures and shallow local grammar fail, but the existing recursive consequence grammar closes at one additional finite layer.

A negative result means the obstruction survives all existing legacy theorem families plus bounded local grammar through rank 5. The next experiment should then inspect the unresolved consequence-class transport itself rather than merely increasing grammar depth blindly.

## Boundary

No oracle, solved W/D/L, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout.

Production CPC, JSMinSys, and BSFP remain unchanged.
