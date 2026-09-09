# Win-space search representation — candidate research direction

**Date:** 2026-09-09  
**Status:** discussion-derived research hypothesis; not implemented or qualified

## Core idea

Keep legal Connect Four moves as the transition rule, but do not assume the full colored board must remain the primary recursive search identity.

Instead represent the *remaining game* primarily through the winning structures that can still produce a win for either player, plus the minimum legal-placement skeleton needed to expand moves.

A candidate state shape is:

```text
remaining winning requirements for player 0
+ remaining winning requirements for player 1
+ column frontiers/heights
+ side to move
(+ move count if not derivable cheaply)
```

Each winning line keeps stable board-cell addresses so a legal column move can map to the landing cell and update every winning requirement incident to that cell.

The board remains useful as an external/user representation and as an independent oracle, but recursive search may not need to carry every historical stone-color distinction if its consequences are already represented in the remaining winning structure.

## Structural interpretation

For each player, the winning condition is an OR of remaining line requirements; each line requirement is an AND of the cells that player must still claim.

A move at addressed cell `x`:

- satisfies `x` in the mover's surviving requirements;
- destroys every opponent requirement containing `x`;
- advances the legal frontier for the chosen column;
- consumes one move/turn;
- yields a win if one mover requirement becomes empty.

Winning lines may share cell identities. The implementation should therefore allow the same cell to affect many requirements without duplicating its semantic identity. A compact fixed-ID / mask representation is preferred over pointer-heavy objects in performance-sensitive code.

## Exact simplifications suggested by the representation

For one player:

1. Identical remaining requirements are equivalent and can be merged.
2. If requirement A is a strict subset of requirement B, B is logically redundant for terminal-winning semantics because completing B necessarily completes A no later.
3. A winning line blocked by both players is permanently removed.
4. Different physical histories may become search-equivalent when they have the same legal frontiers, side to move, and reduced remaining winning requirements for both players.

These claims apply to exact win/terminal structure. They must not silently replace custom heuristic-evaluator semantics that intentionally value multiplicity or other board history.

## Draw treatment

The proposal does not create a separate draw search space.

- If a player has a completed requirement, that player has won.
- If neither player has any surviving winning requirement, no future placement can produce a four-in-a-row and the position is an exact draw even if legal filler moves remain.
- Other optimal-play draws can still contain surviving winning requirements; negamax must resolve their interaction. The point is that draw need not be represented as an independent constructive goal space.

Thus the search is over win-relevant structure while draw emerges as the residual exact result when neither side can force completion.

## Legal-move skeleton remains necessary

Column heights/frontiers preserve:

- the legal landing cell in each column;
- support/gravity;
- remaining capacity;
- turn consumption / tempo;
- the move count needed for distance-sensitive scoring.

A cell outside all current winning requirements may still matter through support or tempo. Such cells cannot simply be deleted unless a stronger equivalence proof preserves those effects. A later abstraction may compress certified neutral moves, but that is separate from the base win-space representation.

## Main hypothesis

The board describes where the game happened; the reduced winning-requirement network may describe what game remains.

If that representation is exact and materially smaller, negamax could continue to use legal moves while searching fewer strategically distinct states, because irrelevant historical stone distinctions and exhausted draw-only continuation regions would no longer receive separate identities.

## Candidate implementation path

A fair first prototype should:

1. compile a legal board into fixed-width winning-line requirement masks and column frontiers;
2. update/restore those masks directly under legal moves;
3. keep the exact distance-sensitive scoring contract;
4. use a canonical key derived from the reduced win-space state, not the original board, only after equivalence is independently proven;
5. compare against the unchanged two-word negamax baseline at equal TT bytes and identical move-order policy;
6. separately measure representation-update cost, state-count reduction, node-count reduction, TT reuse, and end-to-end solve time;
7. include ordinary positions as well as positions where many winning lines have already collapsed;
8. retain an independent full-board oracle for correctness.

The first test should not combine this with new TT partitioning, worker scheduling, or move-order changes.

## Open questions

- What is the smallest exact encoding of the reduced requirement network?
- Can line subsumption/merging be maintained cheaply enough inside recursion, or should reduction occur only at selected boundaries?
- How much state-equivalence collapse appears in representative 7x6 positions?
- Does the representation remain smaller early in the game, when most winning lines are live?
- Can the current fast bit operations be reused to compile/update the win-space without a high-level graph structure?
- Which historical board distinctions remain necessary solely for support/tempo rather than winning identity?

This note records the candidate direction only. No performance or correctness claim is made yet.
