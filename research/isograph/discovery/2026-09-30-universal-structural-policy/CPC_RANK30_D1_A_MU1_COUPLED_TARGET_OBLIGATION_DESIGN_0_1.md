# CPC rank-30 D1 A mu=1 coupled target/obligation composition 0.1

**Date:** 2026-10-01  
**Status:** frozen exact composition design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume only:

- `CPC_RANK30_D1_A_UNKNOWN_CHILD_STRUCTURAL_DIFFERENTIAL_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- unchanged semantic-q and legacy repair-capacity research machinery.

The source c7 sibling is exact q:

`966e6353e06e4d41`

and its G3 repair target fails only after two repair actions:

1. E, followed by P1:C4 -> q `8fed7b5f375c7093`;
2. F, followed by P1:C4 -> q `2bb8598461e3e623`.

Both children are rank 34, P0 to move, with:

- live P0 singleton G3;
- target support distance 1;
- repair measure `mu=1`;
- enabled playable P1 singleton C5;
- no immediate P0 terminal already recorded.

## Purpose

Determine whether the old repair-capacity rejection can be composed with the newly exposed forced C5 blocking obligation rather than treating that obligation as terminal failure of the repair schema.

This is a composition of existing RLC primitives, not a new CPC rule.

## Part 1 — forced-block proof

For each exact rank-34 child:

1. reconstruct exact semantic q and JSMinSys RBA equality;
2. verify P1:C5 is an enabled playable singleton;
3. exhaust every legal P0 action;
4. a non-C5 action is eliminated only if:
   - it is not immediate P0 terminal; and
   - P1:C5 is then exact terminal;
5. verify P0:C5 itself is legal and nonterminal.

If any non-C5 nonterminal action avoids exact P1:C5 terminal, forced-block composition fails and that action is preserved as a counterexample.

## Part 2 — post-block reply closure

After forced P0:C5, enumerate every legal P1 reply.

For each reply:

- if P1 is terminal, the candidate composition fails;
- otherwise record exact q/support and query only already-qualified P0 certificate families:
  - immediate P0 terminal;
  - exact q9f handoff;
  - bounded rank-1 / rank-3 grammar;
  - unchanged legacy repair-capacity induction for every invariant-compatible P0 singleton target;
  - direct target-reservoir RCIC where its exact premises hold.

No unrestricted recursive value search is allowed.

A reply is closed iff at least one existing certificate succeeds.

## Part 3 — composition result

For each rank-34 source child:

- `COMPOSED_WIN` iff C5 is forced and every post-block P1 reply is closed;
- `COUNTEREXAMPLE` iff forced blocking is false or a post-block P1 terminal exists;
- `UNRESOLVED` otherwise.

If either E-branch or F-branch receives `COMPOSED_WIN`, then that corresponding rank-32 c7 repair action becomes an admissible witness under:

```text
repair step
-> P1:C4
-> forced P0:C5 block
-> branch-complete existing positive closure
```

If both close, report both; do not choose one by preference.

## Part 4 — relation between the two mu=1 children

Compare the two exact post-C4 children and all post-C5 reply q classes.

Report whether E/F are related by exact E<->F column exchange after preserving all other residual context.

Do not infer equality from support alone.

## Success condition

The preferred positive outcome is exact branch-complete closure using only existing certificate families.

A useful negative result is one smallest post-C5 P1 reply outside every existing family.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.
