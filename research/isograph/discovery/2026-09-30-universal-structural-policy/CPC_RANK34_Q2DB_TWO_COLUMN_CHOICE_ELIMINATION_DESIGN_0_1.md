# CPC rank-34 q2db two-column choice elimination 0.1

**Date:** 2026-10-01  
**Status:** frozen exact RLC composition design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume only:

- `CPC_RANK32_Q966_EXTENDED_REPAIR_COMPOSITION_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- the unchanged semantic-q, bounded rank grammar, legacy repair-capacity, q9f, and direct target-reservoir proof library.

Target exact state:

- q: `2db2abcb67d530e0`;
- rank: 34;
- support: `[6,6,3,6,6,6,1]`;
- exact physical representatives:
  - `4444415666662322224255115153113756`;
  - `4444415666662322224255115153113765`;
- live P0 singleton target: G3.

The q966 composition independently reaches this same exact q from E/F exchange-related branches.

## Purpose

Determine whether q2db closes by **choice elimination plus the existing monotone proof library**, without introducing a new evaluator or searching an unrestricted game tree.

At this support only columns C and G are physically nonfull. That fact is derived from exact support, not used as a value premise.

## Exact procedure

1. Reconstruct both physical representatives through the semantic quotient kernel and JSMinSys RBA ingress.
2. Require exact semantic-q / full RBA equality between the two representatives.
3. Enumerate the legal P0 actions from q2db. Require that the exact legal set is C/G.
4. For each P0 action:
   - if it is immediate P0 terminal, accept it;
   - otherwise enumerate every legal P1 reply;
   - if any reply is exact P1 terminal, record that reply as a choice-elimination witness against the P0 action;
   - for each nonterminal reply, query only the existing monotone positive library:
     - immediate P0 terminal;
     - exact q9f handoff;
     - bounded rank-1 / rank-3 grammar;
     - unchanged legacy repair-capacity proof;
     - qualified direct target-reservoir / forced-contraction RCIC.
5. A P0 action is `ACCEPTED` only when every P1 reply is constructively P0-winning.
6. A P0 action is `ELIMINATED` when at least one exact P1 terminal reply exists.
7. Otherwise it remains `UNRESOLVED`.

## Result

- `Q2DB_WIN` if at least one P0 action is accepted;
- `Q2DB_LOSS` if every legal P0 action is eliminated by exact P1 terminal replies;
- `Q2DB_UNRESOLVED` otherwise.

If exactly one action survives elimination but is not yet branch-complete, preserve that action and its smallest unresolved reply as the next obstruction.

## Discovery output

Also record, outcome-free:

- exact residual antichains;
- active/minimal singleton targets;
- CPC baseline/frontier diagnostics;
- remaining-capacity and width-derivative phase vectors;
- exact q IDs after every C/G action and reply.

These diagnostics may localize a new certificate seam, but they are not themselves value premises.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, and BSFP remain unchanged.
