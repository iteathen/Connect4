# RLC recurring rank-32 exact-q generic RCIC route audit 0.1

**Date:** 2026-10-01  
**Status:** frozen monotone proof-library audit before execution  
**Branch:** `research/universal-structural-policy-20260930`  
**JSMinSys authority:** `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`

## Sources

Consume only:

- `CPC_RANK20_RANK32_CONSEQUENCE_CLASS_TRANSPORT_CENSUS_0_1.json`;
- `CPC_RANK20_FORCED_C3_RANK5_LOCAL_GRAMMAR_PROBE_0_1.json`;
- the already-qualified generic RCIC route grammar from
  `run-cpc-rank20-generic-rcic-route-matcher-discovery.mjs`;
- pinned read-only JSMinSys RBA/CPC primitives.

The transport source contains 34 unresolved rank-32 exact-q classes with more than one incoming physical transition.

## Purpose

Before declaring the recurring rank-32 consequence hubs a new theorem family, query the existing generic RLC/RCIC route grammar.

This is the monotone proof-library rule:

```text
before new obstruction/theorem work
-> query every already-qualified route family
```

## Part 1 — semantic-q / JSMinSys exact-state bridge

For every repeated semantic q class:

1. reconstruct every incoming physical sequence:
   `rank-30 source leaf sequence + P0 move + P1 reply`;
2. verify the semantic quotient replay lands at the frozen exact-q class;
3. reconstruct every sequence in pinned JSMinSys RBA;
4. require all incoming sequences in the class to be exact-equal RBA states before sharing one route audit.

If semantic-q equality does not imply exact RBA equality for a class, mark:

`CROSS_REPRESENTATION_BRIDGE_FAIL`

and audit every physical representative separately. Never merge by support alone.

## Part 2 — existing generic RCIC route grammar

For each exact RBA representative, apply only the already-existing route grammar:

For every legal Player-1 move:

1. immediate Player-1 terminal;
2. exact known-root handoff if exact RBA equality holds;
3. direct active-minimal-singleton target-reservoir RCIC:
   - target projects to Player 1 under CPC;
   - no playable Player-2 singleton;
   - complete target-reservoir pairing synthesized;
   - exhaustive exact validation passes;
4. if baseline and frontier CPC agree on one forced defender column:
   - apply that defender move;
   - exact known-root handoff if exact;
   - for every legal P1 follow-up:
     - immediate P1 terminal, or
     - aligned minimal pair contracts to a live singleton whose target-reservoir RCIC validates exhaustively.

No new route primitive is admitted.

## Output per repeated q class

Record:

- exact-q ID;
- incoming physical transition count;
- source leaf IDs and macro labels;
- semantic replay agreement;
- JSMinSys exact-RBA bridge result;
- number of physical representatives audited;
- accepted existing routes;
- route kinds;
- whether the class is closed by existing grammar;
- smallest unresolved witness if unclosed.

## Summary

Report:

- repeated q classes audited;
- cross-representation bridge-pass/fail counts;
- classes closed by existing grammar;
- closure by route kind;
- remaining unresolved classes;
- incoming physical transitions covered by closed classes.

## Interpretation

If existing RCIC closes recurring hubs, integrate that route capability into the unified router rather than inventing another theorem.

If it closes none or very few, the exchange/transport structure is genuinely beyond the present RCIC grammar and can be studied as a new consequence-transport theorem target.

## Boundary

No oracle, solved W/D/L, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout.

Production CPC, JSMinSys, and BSFP remain unchanged.
