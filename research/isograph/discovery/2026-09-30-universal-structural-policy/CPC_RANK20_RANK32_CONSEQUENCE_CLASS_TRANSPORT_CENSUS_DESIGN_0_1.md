# RLC rank-32 unresolved consequence-class transport census 0.1

**Date:** 2026-10-01  
**Status:** frozen bounded consequence-quotient census before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Sources

Consume only:

- `CPC_RANK20_FORCED_C3_RANK5_LOCAL_GRAMMAR_PROBE_0_1.json`;
- `CPC_RANK20_FORCED_C3_FIRST_FAILURE_LOCAL_GRAMMAR_PROBE_0_1.json`.

The source establishes:

- 11 distinct exact-q rank-30 leaves;
- zero closure under bounded positive grammar through rank 5;
- repeated rank-32 exact-q identifiers already appear among first unresolved replies.

## Purpose

Do **not** increase grammar depth again.

Instead expose the exact consequence-class transport induced by one complete P0/P1 macro-step from every rank-30 source leaf.

The question is:

> How many recursively distinct exact-q obligations remain after physical branch multiplicity is quotiented out?

This is a structural convergence census, not a value search.

## Enumeration

For each of the 11 rank-30 exact-q source leaves:

1. enumerate every legal P0 root move;
2. if the P0 move is an immediate terminal, record `ROOT_I`;
3. otherwise enumerate every legal P1 reply;
4. classify each reply as:
   - `DEFENDER_TERMINAL` if P1 terminates;
   - `LOWER_I` if the resulting P0 state has an immediate P0 terminal;
   - `LOWER_EO` if it has a rank-1 `E(O)` proof;
   - `LOWER_RANK3` if it has a rank-3 `E(A(...))` proof;
   - `UNRESOLVED_Q` otherwise.

No rank-5 or deeper predicate may be used to classify lower states.

## Exact-q quotient

For every nonterminal lower state, compute its exact semantic q identity from:

- support;
- normalized P0 residual antichain;
- normalized P1 residual antichain.

Group all `UNRESOLVED_Q` transition instances by exact q.

For every unresolved q class report:

- exact-q ID;
- rank/support;
- incoming transition count;
- distinct source q classes;
- distinct source leaf IDs;
- distinct P0 root moves;
- distinct P1 reply moves;
- exact incoming macro labels `(P0 move, P1 reply)`;
- whether the same q class is reached from more than one source leaf;
- whether it is reached through more than one macro label.

## Transport graph

Emit a bipartite transport graph:

```text
rank-30 source q class
    -- (P0 move, P1 reply) -->
rank-32 consequence q class / terminal consequence kind
```

For each source q class report:

- raw physical transition count;
- distinct terminal/proved consequence kinds;
- distinct unresolved exact-q targets;
- quotient arity after exact-q normalization.

## Success interpretation

Useful convergence evidence is:

- unresolved exact-q target count materially smaller than raw unresolved transition count;
- repeated unresolved q classes reached from independent source leaves;
- small quotient arity per source despite larger physical branch multiplicity.

This would justify theorem work on consequence-class transport rather than deeper branch-history grammar.

## Failure interpretation

If nearly every unresolved transition remains a unique q class, then exact-q normalization is not the missing compression at this layer and another structural coordinate/theorem is required.

## Boundary

No oracle, solved W/D/L, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout.

No new proof rule is introduced.

Production CPC, JSMinSys, and BSFP remain unchanged.
