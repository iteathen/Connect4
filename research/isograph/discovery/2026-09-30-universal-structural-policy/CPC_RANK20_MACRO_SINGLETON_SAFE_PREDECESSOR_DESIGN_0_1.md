# Rank-20 one-macro-step singleton-safe controllable predecessor design 0.1

**Date:** 2026-10-01  
**Status:** frozen RLC predecessor diagnostic before execution  
**Branch:** `research/universal-structural-policy-20260930`  
**JSMinSys authority:** `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`

## Purpose

The qualified response-lift census established on all 13 frozen partial-reservoir failures:

- the final mapped Player-1 response is structurally hazardous;
- no legal Player-1 move at that final predecessor is singleton-safe.

Therefore local rerouting at the final decision is impossible.

This experiment moves exactly one response macro-step earlier and asks a bounded controllable-predecessor question.

## Local safety predicate

For a Player-1 state `Q`, a legal Player-1 move `a` is **one-macro singleton-safe** iff:

1. `a` is an immediate Player-1 terminal; or
2. after `a`, for **every** legal Player-2 trigger `b`:
   - `b` is not an immediate Player-2 terminal; and
   - if `b` is nonterminal, there exists at least one legal Player-1 response `c` such that:
     - `c` is an immediate Player-1 terminal, or
     - after `c` the resulting Player-2 state contains zero active playable Player-2 residual singletons.

Formally:

```text
MacroSafe1(Q,a)
  := P1Terminal(Q·a)
     OR
     forall legal b:
       not P2Terminal(Q·a·b)
       AND
       exists legal c:
         P1Terminal(Q·a·b·c)
         OR noPlayableP2Singleton(Q·a·b·c)
```

This is a bounded `forall trigger / exists safe response` structural predecessor test. It does not recurse beyond one defender trigger and one response.

## Frozen inputs

Consume only:

- `CPC_RANK20_C5_REPLY5_HAZARDOUS_RESPONSE_PREDECESSOR_DIAGNOSTIC_0_1.json`;
- `CPC_RANK20_RESPONSE_LIFT_EXCLUSION_ALTERNATIVE_CENSUS_0_1.json`;
- pinned read-only JSMinSys RBA/CPC primitives.

For each frozen pairing candidate, reconstruct the Player-1 decision immediately before the final hazardous trigger/response macro-step: after the penultimate defender trigger and before the penultimate Player-1 response.

## Outputs

For every candidate record:

- exact predecessor rank/support;
- frozen mapped response at that predecessor;
- every legal P1 candidate move;
- for each candidate move:
  - immediate terminal result;
  - every legal P2 trigger;
  - whether the trigger is immediately terminal;
  - all singleton-safe P1 responses after that trigger;
  - exact failure witnesses when no safe response exists;
- all one-macro singleton-safe P1 moves.

Preserve all safe moves; do not select a preferred move.

## Disposition

- `MACRO_SAFE_ALTERNATIVE_EXISTS`: some legal move different from the frozen mapped response is one-macro singleton-safe.
- `ONLY_MAPPED_MOVE_MACRO_SAFE`: the frozen mapped move alone is one-macro singleton-safe.
- `NO_MACRO_SAFE_MOVE`: no legal move survives the one-macro predecessor condition.

If alternatives exist, the next experiment should re-synthesize the response-capacity policy at this predecessor.

If none exist, the repair must move another macro-step earlier.

## Boundaries

No oracle, solved W/D/L, minimax value, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.

This is bounded local structural predecessor analysis only.

Production CPC, JSMinSys, target-reservoir production semantics, and BSFP remain unchanged.
