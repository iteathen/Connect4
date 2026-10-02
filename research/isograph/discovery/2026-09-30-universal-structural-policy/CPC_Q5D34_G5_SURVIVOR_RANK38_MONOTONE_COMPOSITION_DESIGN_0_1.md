# CPC q5d34 G5-survivor rank-38 monotone consequence composition design 0.1

**Date:** 2026-10-01  
**Branch:** `research/universal-structural-policy-20260930`  
**Recovered head before design:** `b288f64ea96dd38649a0a727ca63fcf2f7218a93`  
**Pinned JSMinSys authority:** `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`

## Purpose

Continue RLC from the first exact obstruction that remains after the global
proof-library monotonicity repair.

The exact q5d34 root remains `UNKNOWN` after the repaired catalog. The added
legacy target engines do not reject by resource exhaustion; they are simply
inapplicable at q5d34 because the exact rank-34 state has no P0 singleton
target claims.

The latest G4 archaeology leaves two exact rank-37 P1-to-move states after
the candidate P0:G5 continuation:

- q `5992c0c8965586f2`, sequence
  `4444415666662322224255115153113777757`, support
  `[6,6,3,6,6,5,5]`;
- q `7cac0ef80f3901f7`, sequence
  `4444415666662322224255115153113777767`, support
  `[6,6,3,6,5,6,5]`.

Both have several terminal-safe P1 replies. A P0 win through G5 therefore
requires a universal reply composition, not a certificate on the rank-37
state itself.

## Frozen hypothesis

At least one of the following will occur when every exact rank-38 consequence
is queried against the repaired monotone RLC proof library:

1. **All replies close P0-winning** for a rank-37 survivor. Then that survivor
   is a qualified universal consequence composition and the preceding G5
   continuation is closed.
2. **A reply closes P0-losing** under the unchanged exact forced-obligation
   calculus. Then G5 fails for that predecessor.
3. **One or more replies remain UNKNOWN** after every applicable retained
   certificate family is queried. The lexicographically first such exact q is
   the next structural obstruction.

No absence-of-proof result may be converted into loss.

## Exact-state reduction

Physical histories may be merged only when their complete semantic q is equal:

```
q = support
  + normalized P0 residual antichain
  + normalized P1 residual antichain
```

The expected E/F commutation merge at q `e7eb0902f1f7984c` must be accepted
only after exact semantic-q equality is verified. Shared support is not enough.

## Input family

Consume only:

`CPC_Q5D34_G4_EF_REPLY_G5_SURVIVOR_0_1.json`

The source already freezes the two rank-37 states and their terminal-safe P1
actions:

- q5992: P1 columns C/F/G;
- q7cac: P1 columns C/E/G.

Each nonterminal child is rank 38 with P0 to move.

## Positive route catalog

For every unique rank-38 exact q, query all applicable existing routes before
declaring it new:

- immediate P0 terminal;
- exact qualified-q handoff;
- bounded rank-1 and rank-3 forced-completion certificates;
- adaptive repair-capacity induction;
- the shared legacy-target adapter:
  - `LAMBDA`;
  - `THETA`;
  - distance-2 target-support re-entry;
  - distance-1 resolved-tail capacity;
- direct target-reservoir RCIC;
- exact CPC forced-restriction -> contraction -> reservoir RCIC;
- exact known routed roots.

The legacy target adapter must enumerate every exact current P0 singleton
target and must preserve logical rejection, inapplicability, and resource
failure separately.

## Negative route

Run the unchanged forced-obligation P0-loss calculus independently.

A rank-38 state is:

- `P0_WIN` iff at least one sound positive certificate route accepts;
- `P0_LOSS` iff no positive route accepts and the unchanged loss calculus
  returns an exact loss certificate;
- otherwise `UNKNOWN`.

A positive/loss collision is a hard failure.

## Composition

For each rank-37 survivor:

- `P0_WIN_ALL_REPLIES` iff every legal terminal-safe P1 reply reaches a
  rank-38 `P0_WIN` q;
- `P0_FAILS_LOSS_REPLY` iff any reply reaches `P0_LOSS`;
- otherwise `UNKNOWN`.

For each rank-36 predecessor whose only remaining candidate is P0:G5, inherit
the same disposition of its associated rank-37 survivor.

The experiment does not automatically claim q5d34 solved. It reports only the
newly justified composition and the exact next obstruction, if any.

## Acceptance

The result must record:

- all six physical reply histories;
- exact-q merge groups and unique class count;
- exact bridge checks for every unique rank-38 q;
- every positive route attempt;
- all shared legacy-target engine attempts for every applicable target;
- independent loss certificate;
- resource-failure count;
- per-survivor universal composition disposition;
- first unresolved exact q, including sequence, support, route kinds tried,
  legacy target applicability, and forced-loss boundary.

Expected structural controls:

- 6 physical histories;
- 5 unique q classes if and only if the expected E/F commutation class is
  exactly equal;
- zero support-only merges;
- no production CPC, JSMinSys, or BSFP modifications.

## Falsifiers / stopping rules

- exact bridge mismatch;
- q hash equality without full semantic-key equality;
- any resource failure presented as theorem rejection;
- any `UNKNOWN` presented as loss;
- any positive/loss collision;
- any use of solved W/D/L, oracle, minimax, unrestricted ordinary game-tree
  value, opening book, best-move table, or BSFP solved frontier;
- any production CPC or BSFP modification.

If the five expected unique q classes do not materialize, retain the observed
exact partition; do not force the expected merge count.
