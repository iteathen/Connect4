# CPC q649 dual-safe defender-fork monotone composition 0.1

**Date:** 2026-10-01  
**Status:** frozen exact RLC composition design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume only:

- `CPC_Q2DB_FORCED_TERMINAL_SAFETY_CHAIN_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- unchanged semantic-q kernel;
- all already-qualified positive certificate families admitted by the monotone research library.

Target exact state:

- q: `6496c888c4e2a157`;
- sequence: `4444415666662322224255115153113756777`;
- rank: 37;
- support: `[6,6,3,6,6,6,4]`;
- mover: P1;
- legal P1 actions: C4 and G5.

The source forced-safety chain proves both actions are one-ply terminal-safe and therefore stops here.

## Purpose

Determine whether the rank-37 defender fork is already closed by the monotone positive proof library.

This is not a new proof language. It is a routing/composition test.

## Required monotone library query

For each exact P1 action from q649, reconstruct the rank-38 P0 child and query, without modification:

1. immediate P0 terminal;
2. exact known-q positive handoffs already qualified in this campaign;
3. bounded rank-1 / rank-3 positive grammar;
4. legacy adaptive repair-capacity for every invariant P0 singleton target;
5. generic RCIC routes:
   - exact known-root handoff;
   - direct target-reservoir RCIC;
   - CPC-restricted forced terminal;
   - forced pair contraction into target-reservoir RCIC.

A child is `P0_WIN` only if at least one already-qualified route accepts it.

A child with no accepted route is `UNKNOWN`, not a loss.

## Result

- `Q649_P0_WIN` iff both legal P1 actions produce constructively P0-winning children.
- `Q649_UNRESOLVED` otherwise.

If unresolved, preserve the first exact unknown child and every route attempted.

If closed, record the logical feedback chain:

```text
q649 P0-win
=> q2db forced G,G,G reaches a P0-winning defender fork
=> q2db P0-win
=> both q966 repair candidates E/F lose their only previously unknown reply
```

The experiment does not automatically promote q966 or any ancestor beyond what the cited exact branch composition justifies.

## Boundary

No solved W/D/L, oracle, Pons score, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, and BSFP remain unchanged.
