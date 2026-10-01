# RLC rank-32 forced-obligation loss census 0.1

**Date:** 2026-10-01  
**Status:** frozen loss-only proof-family census before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Sources

Consume only:

- `CPC_RANK20_FORCED_C3_RANK5_LOCAL_GRAMMAR_PROBE_0_1.json`;
- `CPC_RANK20_RANK32_CONSEQUENCE_EXCHANGE_CENSUS_0_1.json`;
- the already-qualified loss-only architecture in
  `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-forced-obligation-loss-propagation.mjs`.

No W/D/L source is allowed.

## Purpose

The bounded positive grammar leaves 36 failed rank-5 action/reply transitions collapsing to 24 exact rank-32 q classes.

Test whether any of those exact q classes are already certifiable as **P0 losses** by the older forced-obligation calculus.

This is a negative/action-elimination route. Unknown is never treated as loss.

## Exact roots

Reconstruct each of the 24 distinct rank-32 q classes from one frozen physical representative and verify:

- rank 32;
- P0 to move;
- support;
- normalized P0 antichain;
- normalized P1 antichain;
- frozen q-class ID.

Every additional occurrence of the same q class must replay to the same exact q identity before sharing a proof result.

## Loss calculus

At an even-rank P0 node:

### Base 0 — P0 terminal available

If P0 has any immediate terminal action:

`UNKNOWN_OR_POSITIVE_ESCAPE`

and do not certify loss.

### Base 1 — multiple enabled P1 singleton obligations

Let `O` be the distinct enabled P1 singleton cells.

If `|O| >= 2`, exhaust every legal P0 action.

The node is a `MULTI_OBLIGATION_CAPACITY_DEFECT` loss only if every legal P0 action is nonterminal for P0 and leaves at least one immediate P1 terminal reply.

Any escaping action falsifies this loss route.

### Recursive single-obligation case

If `|O| = 1`:

1. identify the obligation cell and its column;
2. prove it is genuinely forced:
   - every legal P0 action in another column must be nonterminal for P0 and admit an immediate P1 terminal;
3. execute the unique block;
4. if the block is P0 terminal, reject loss;
5. inspect every legal P1 reply after the block;
6. a single adversarial reply certifies the parent loss if that reply:
   - is immediate P1 terminal; or
   - reaches an even-rank child with no immediate P0 terminal and recursively carries a forced-obligation loss certificate.

If no such adversarial reply is certified, remain unknown.

### Zero obligations

If `|O| = 0`, remain unknown under this calculus.

## Boundedness

Rank strictly increases under recursive propagation, so the game horizon is finite.

Additionally cap each proof at 100,000 visited proof nodes. A cap hit is a resource failure, not a loss or theorem rejection.

Memoization may use exact semantic-quotient state identity inside one kernel.

## Parent-action elimination

Each of the 36 source transitions has the form:

`rank30 P0 leaf --P0 action--> rank31 P1 --P1 reply--> rank32 q`.

If the rank-32 q is certified P0 loss, then that exact P1 reply is an adversarial refutation of the selected rank-30 P0 action.

Combine this with source attempts whose first unresolved result is already `DEFENDER_TERMINAL`.

For each of the 11 rank-30 source leaves report:

- every legal P0 root action tested by the rank-5 census;
- elimination source:
  - `DEFENDER_TERMINAL`;
  - `RANK32_FORCED_OBLIGATION_LOSS`;
  - unresolved;
- surviving root actions.

A rank-30 source leaf is certified P0 loss only if **every** legal P0 action is adversarially eliminated by one of the exact mechanisms above.

Do not infer loss from absence of a positive proof.

## Consequence-class reporting

Report loss results once per exact rank-32 q class, then fan them back to every physical occurrence.

Preserve:

- enabled-obligation count and coordinates;
- proof kind;
- forced block if any;
- adversarial reply;
- compact recursive proof chain;
- visited-node count / max depth;
- all counterexamples for rejected multi-obligation or forcedness premises.

## Success interpretation

Positive evidence can occur at two levels:

1. some rank-32 q classes receive exact old loss certificates;
2. one or more rank-30 source leaves become fully action-eliminated and therefore exact P0-loss states.

Either result is useful route information but is not a proof that the enclosing rank-28 or rank-20 state is winning for P0.

## Boundary

No oracle, solved W/D/L, minimax, unrestricted value search, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout.

Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.

This experiment reuses only an already-qualified structural loss rule and exact legal transitions.
