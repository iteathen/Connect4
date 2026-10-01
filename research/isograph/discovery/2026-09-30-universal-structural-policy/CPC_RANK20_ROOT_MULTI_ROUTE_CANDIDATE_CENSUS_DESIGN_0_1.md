# CPC rank-20 root multi-route candidate census 0.1

**Date:** 2026-10-01  
**Status:** frozen structural discovery design before execution  
**Branch:** `research/universal-structural-policy-20260930`  
**Superclass:** `RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md`

## Source state

Exact rank-20 root:

`44444156666623222242`

Required state:

- rank 20;
- Player 1 to move;
- support `[1,6,1,6,1,5,0]`.

The currently investigated candidate `P1:c3` already has one exact rank-22 theorem-root handoff but requires increasingly branch-specific routing on its remaining defender replies.

## Purpose

Test whether another legal Player-1 move at the same exact rank-20 root admits a cheaper proof using only the already-qualified RLC route grammar.

This is a candidate-route census, not move selection by solved value.

## Candidate set

Enumerate every legal Player-1 move from the exact rank-20 root.

For each candidate:

1. execute the exact cofactor;
2. enumerate every legal Player-2 reply;
3. reconstruct the exact rank-22 child;
4. attempt only the already-qualified route grammar below.

No candidate is privileged in advance.

## Allowed route grammar for each rank-22 child

### A — exact theorem-root handoff

Compare full exact RBA state against the current qualified theorem-root catalog.

Support equality alone is insufficient.

At minimum include the exact qualified rank-22 routed-win root.

### B — one-move direct target-reservoir RCIC

For every legal Player-1 move from the rank-22 child:

1. execute the exact cofactor;
2. if Player 1 wins immediately, accept;
3. otherwise inspect every active minimal Player-1 singleton;
4. require CPC target projection to Player 1;
5. require no currently playable Player-2 singleton;
6. synthesize the existing truncated target-reservoir pairing;
7. exhaustively validate it under first-win precedence.

### C — one CPC-forced macro + pair contraction + RCIC

For every nonterminal Player-1 child:

1. evaluate production CPC baseline and frontier-response modes;
2. proceed only if both agree on one `CPC_RESTRICT` defender column;
3. execute that exact defender move;
4. test exact theorem-root handoff;
5. otherwise test every legal Player-1 follow-up that consumes one endpoint of a current aligned minimal size-2 Player-1 residual;
6. require contraction to an active singleton at the other endpoint;
7. require Player-1 CPC target ownership;
8. synthesize and exhaustively validate the existing target-reservoir RCIC.

## Candidate disposition

For each root candidate record:

- legal defender reply set;
- closed reply count;
- unclosed reply set;
- accepted route for each closed reply;
- smallest exact structural witness for each unclosed reply.

A root candidate is **fully routed** only if every legal defender reply is closed.

If no candidate is fully routed, rank candidates only by the descriptive count of unresolved defender replies for discovery prioritization. That count is not a game value and does not establish move quality.

## Boundedness

The probe performs no ordinary recursive game-tree search.

Per defender reply it allows at most:

- one Player-1 route move;
- one production-CPC-forced Player-2 move;
- one deterministic Player-1 pair-endpoint consumption;
- finite target-reservoir RCIC validation.

## Success criterion

Useful positive evidence is either:

- at least one legal root move has every defender reply closed by the existing route grammar; or
- a non-c3 root move leaves fewer/simpler unresolved structural witnesses than c3.

Useful negative evidence is that c3 remains the uniquely best-routed root candidate under the existing theorem library.

## Boundary

No oracle, Pons score, solved W/D/L, minimax, ordinary game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.

This is discovery evidence only and does not by itself certify the rank-20 root.
