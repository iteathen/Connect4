# CPC rank-20 singleton-contraction RCIC re-entry probe 0.1

**Date:** 2026-10-01  
**Status:** frozen current-state RCIC reuse probe before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source state

Exact rank-20 root:

`44444156666623222242`

Consumed candidate:

`P1:c3`.

The prior proof-routing discovery established five legal defender replies `{c1,c3,c5,c6,c7}`, with defender `c3` already closing by exact handoff to the qualified rank-22 routed theorem.

This probe addresses only the remaining nonterminal children.

## Purpose

Test whether the existing target-reservoir RCIC can close additional branches through exact contraction of a current P1-aligned size-2 residual to a singleton.

No new tactical primitive is proposed.

## Frozen route grammar

For each unresolved defender child:

### Direct contraction route

For every legal P1 move:

1. reconstruct all current minimal P1 residuals by exact cell attachment;
2. identify every aligned size-2 residual containing the exact landing event;
3. execute the P1 move;
4. require that the other endpoint becomes an active P1 singleton;
5. require CPC target-owner projection of the singleton to Player 1;
6. freshly synthesize a truncated target-reservoir pairing for that exact singleton state;
7. exhaustively validate the pairing under first-win precedence.

### One forced-macro contraction route

If a legal P1 move produces the same one-column `CPC_RESTRICT` result in baseline and frontier-response modes:

1. execute that exact forced defender move;
2. for every legal P1 follow-up, test the same exact pair-to-singleton contraction condition;
3. synthesize and validate a target-reservoir RCIC on the exact contracted child.

The probe stops there.

## Required evidence

Every accepted route must preserve:

- pre-move residual pair cells;
- consumed endpoint;
- singleton target endpoint;
- exact support before/after;
- CPC projected owner;
- target-reservoir capacity and synchronized pairs;
- complete defender-residual coverage;
- exhaustive template traversal with no defender-first terminal.

## Negative evidence

Preserve branches where:

- no aligned pair endpoint is playable;
- contraction fails to produce a singleton;
- target owner is not P1;
- no target-reservoir template exists;
- exhaustive validation fails;
- no one-column CPC restriction exists.

## Boundary

This is structural route-discovery evidence, not a rank-20 value theorem.

No oracle, Pons score, solved W/D/L, minimax, ordinary game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.
