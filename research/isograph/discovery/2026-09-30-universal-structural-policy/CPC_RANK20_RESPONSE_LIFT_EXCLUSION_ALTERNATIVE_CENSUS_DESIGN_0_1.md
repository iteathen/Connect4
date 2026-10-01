# Rank-20 response-lift exclusion / alternative census design 0.1

**Date:** 2026-10-01  
**Status:** frozen RLC diagnostic before execution  
**Branch:** `research/universal-structural-policy-20260930`  
**JSMinSys authority:** `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`

## Purpose

The frozen partial-reservoir family contains 13 deterministic policies that all fail by an exact defender terminal. The hazardous-predecessor diagnostic localized the failure to a mapped Player-1 response immediately preceding that terminal. The later CPC-guard diagnostic found no production-CPC forced-column conflict before the exact-loss point.

This experiment tests a more primitive current-state safety fact:

> after the mapped Player-1 response, does the resulting Player-2 state contain an active playable Player-2 residual singleton?

If yes, the mapped response exposes or leaves available an exact one-move opponent completion and is therefore structurally inadmissible as a nonterminal safety response.

This is an RLC response-safety condition. It does not alter CPC.

## Frozen sources

Consume only:

- `CPC_RANK20_C5_REPLY5_PARTIAL_RESERVOIR_EXACT_VALIDATION_PROBE_0_1.json`;
- `CPC_RANK20_C5_REPLY5_HAZARDOUS_RESPONSE_PREDECESSOR_DIAGNOSTIC_0_1.json`;
- pinned read-only JSMinSys RBA/CPC primitives.

No solved W/D/L, minimax, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, or sealed holdout is admissible.

## Part 1 — response-lift exclusion qualification

For each of the 13 frozen failing pairing candidates:

1. reconstruct the exact source RBA state;
2. replay the frozen trigger/response path to the Player-1 state immediately before the hazardous mapped response;
3. independently verify exact state support and mover;
4. apply the mapped response;
5. if it is an immediate Player-1 terminal, mark it terminal-safe;
6. otherwise compute active Player-2 residual singletons whose cells are physically playable in the resulting state.

A **response-lift hazard** is present iff the mapped response is nonterminal and the successor contains at least one playable Player-2 singleton.

Record whether the exposed singleton:
- was already playable before the response;
- became playable because the mapped response lifted support in its column;
- is in the same column as the mapped response or elsewhere.

Qualification target:

```text
every frozen first defender-terminal failure
is preceded by a response-lift hazard
```

If any counterexample exists, reject/narrow the guard immediately.

## Part 2 — one-ply structural alternative census

At each exact hazardous Player-1 predecessor state, enumerate every legal Player-1 column once.

For each legal response record:

- landing cell;
- immediate terminal result;
- resulting support;
- playable Player-2 singleton set after the response;
- whether the response is `SINGLETON_SAFE`:
  - immediate Player-1 terminal, or
  - nonterminal with zero playable Player-2 singletons;
- whether it reaches one of the already-qualified exact known roots used by the current RLC router;
- production CPC baseline/frontier classification at the predecessor, read-only.

This is a one-ply structural response census, not recursive game-tree search.

## Part 3 — reroute disposition

For each frozen candidate classify the hazardous predecessor as:

- `SAFE_ALTERNATIVE_EXISTS`: at least one legal response different from the mapped reservoir response is singleton-safe;
- `NO_SINGLETON_SAFE_ALTERNATIVE`: every legal Player-1 response is immediately losing to a playable Player-2 singleton and none is an immediate P1 win;
- `MAPPED_RESPONSE_ALREADY_SAFE`: falsifier of the proposed exclusion diagnosis.

Preserve all safe alternatives; do not select one preferred move.

## Interpretation

If safe alternatives recur, the next RLC step is a response-capacity/matching re-synthesis with hazardous response edges removed before policy selection.

If no safe alternatives exist at the first hazard, the repair must move earlier in the response circuit; local rerouting at that decision is insufficient.

## Boundaries

- research-side only;
- production `JSMinSys/addons/cpc-connect4.mjs` unchanged;
- JSMinSys repository unchanged;
- target-reservoir production semantics unchanged;
- BSFP unchanged;
- no solved W/D/L premise;
- no ordinary free-branch game-tree search;
- no sealed formula holdout access.
