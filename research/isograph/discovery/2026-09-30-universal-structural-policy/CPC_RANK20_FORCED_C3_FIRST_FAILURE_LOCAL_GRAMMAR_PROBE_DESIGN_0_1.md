# RLC forced-c3 first-failure local proof-grammar probe 0.1

**Date:** 2026-10-01  
**Status:** frozen bounded composition probe before execution

## Source

`CPC_RANK20_FORCED_C3_LEGACY_PROOF_FAMILY_MATRIX_0_1.json`.

Use the LAMBDA top-level rejection list as the canonical first-failure leaf source. THETA reports the same top-level counterreply pattern and is not duplicated.

For every rejected root action:

- reconstruct exact leaf sequence = forced-c3 child sequence + P0 action + recorded P1 reply;
- verify rank/support by replay;
- do not consume any W/D/L label.

## Existing proof grammar

Test only the previously used bounded positive forms:

1. `E(O)`:
   - one P0 action reaches an overload leaf;
   - at the resulting P1 node, every legal P1 reply gives P0 an immediate terminal.

2. `E(A(I|E(O)))`:
   - one P0 root action;
   - every legal P1 reply reaches either:
     - an immediate P0 terminal state `I`; or
     - a state where one P0 action reaches an overload leaf `E(O)`.

No recursion beyond this bounded grammar rank is allowed.

## Deduplication

Exact duplicate q states among first-failure leaves may share one proof result only after exact semantic state identity is verified in the semantic-quotient kernel. Sequence equality is sufficient as a locator; q equality must be checked for distinct sequences before merging.

## Output

For every leaf:

- source state/action/reply;
- exact sequence/rank/support;
- proof form if any;
- root witness action;
- universal raw reply count;
- normalized consequence kinds;
- response witnesses;
- exact-q class ID among tested leaves.

Report:

- unique physical leaves;
- unique exact-q leaves;
- E(O) count;
- rank-3 grammar count;
- unresolved count.

## Boundary

No oracle, solved W/D/L, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, or sealed holdout.

Production CPC, JSMinSys, and BSFP remain unchanged.
