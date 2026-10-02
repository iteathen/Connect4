# CPC rank-32 q966 extended repair composition 0.1

**Date:** 2026-10-01  
**Status:** frozen exact composition design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume only:

- `CPC_RANK30_D1_A_UNKNOWN_CHILD_STRUCTURAL_DIFFERENTIAL_0_1.json`;
- `CPC_RANK30_D1_A_MU1_COUPLED_TARGET_OBLIGATION_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- unchanged semantic-q / legacy repair-capacity machinery.

Target exact state:

- q: `966e6353e06e4d41`;
- rank: 32;
- support: `[6,6,3,6,5,5,1]`;
- live invariant P0 singleton target: G3;
- repair measure: `mu=2`.

The unchanged legacy repair engine rejects both candidate actions E and F at their first P1:C4 reply because the resulting `mu=1` child was previously outside the repair schema.

Those exact children are now independently qualified P0 wins:

- E -> C4 -> `8fed7b5f375c7093`;
- F -> C4 -> `2bb8598461e3e623`;

by the forced-C5 coupled composition in `CPC_RANK30_D1_A_MU1_COUPLED_TARGET_OBLIGATION_0_1.json`.

## Purpose

Re-evaluate the E and F repair actions branch-completely, admitting the two newly qualified exact child certificates as proof-library handoffs.

Do not modify the repair engine.

## Candidate action proof

For each candidate action E and F:

1. reconstruct q966 by exact semantic identity;
2. verify the action is a legacy repair candidate and strictly decreases `mu` from 2 to 1;
3. enumerate every legal P1 reply after the action;
4. classify each nonterminal reply using the monotone existing proof library:
   - immediate P0 terminal;
   - exact handoff to either newly qualified mu=1 composed q;
   - exact q9f handoff if encountered;
   - bounded rank-1 / rank-3 grammar;
   - unchanged legacy repair-capacity proof for G3 or any invariant-compatible P0 singleton target;
   - qualified direct target-reservoir RCIC if its exact premises hold;
5. do not stop at the first failed reply.

The action is accepted only if every P1 reply closes.

## Result

- `Q966_WIN` if at least one of E/F is branch-complete;
- `Q966_COUNTEREXAMPLE` if both actions contain an exact P1 terminal reply;
- `Q966_UNRESOLVED` otherwise.

If both E and F close, preserve both as equivalent proof witnesses.

## Monotonicity requirement

The newly qualified mu=1 children are exact theorem-library additions. They may be used only by exact q identity.

No older proof route is removed or replaced.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.
