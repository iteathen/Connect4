# CPCX Support-Release Shared Acquisition/Block Edge 0.1

**Date:** 2026-10-03  
**Status:** frozen theorem contract before implementation  
**Scope:** experimental CPCX only  
**Parent:** `CPCX_CLASS_C_SHARED_ACQUISITION_BLOCK_DISCHARGE_DIAGNOSTIC_RESULT_0_1.md`

## Purpose

Certify one narrow support-release transaction in which the controller's
already-selected acquisition cell is also the unique response required to kill
an opponent singleton released by the same support event.

This theorem does **not** weaken
`SUPPORT_RELEASE_ACQUISITION_EDGE`.

It handles only the exact shared-cell case:

```
controller protected target = t
opponent supply event releases t
opponent's unique newly urgent singleton = t
controller:t
  acquires/contracts or completes the protected controller residual
  AND
  kills the opponent singleton on t
```

## Objects

Let `S` be an exact nonterminal position with controller `C=S.mover` and
opponent `O=C^1`.

Let:

- `R` be one live controller residual;
- `t` be one missing cell of `R` at support distance exactly one;
- `s` be the unique support cell immediately below `t`;
- `d` be one pinned current controller event.

The theorem does not choose `d`; it audits one already-selected structural
controller event.

## Premises

1. `S` is exact and nonterminal.
2. `R` is live for `C` and contains `t`.
3. `supportDistance_S(t)=1`.
4. `s` is the current legal frontier below `t`.
5. `d` is current legal, nonterminal, outside the target column, and does not
   occupy any missing cell of `R`.
6. After `C:d`, `O` has no current playable singleton.
7. The exact protected residual `R` is unchanged by `C:d`.
8. Every current external opponent event other than `s` is outside the target
   column and outside the missing set of `R`; the theorem makes no claim that
   those external events are winning, only that they do not perform the named
   supply/acquisition transaction.
9. `O:s` is legal and nonterminal.
10. The protected controller residual remains unchanged through `O:s`.
11. After `O:s`, the deduplicated set of current playable opponent singleton
    cells is exactly:

```
{t}
```

12. `C:t` is legal.
13. Exact `C:t` respects first-terminal stopping:
    - a terminal is accepted only if the terminal player is `C`;
    - otherwise `R` must contract or complete specifically through `t`.
14. Every opponent singleton whose missing cell is `t` after the supply is
    killed by `C:t`.
15. If the result is nonterminal, the opponent has no current playable
    singleton afterward.

## Conclusion

Emit:

```
SUPPORT_RELEASE_SHARED_ACQUISITION_BLOCK_EDGE
```

with an exact theorem token containing:

- supply trigger `s`;
- shared acquisition/block response `t`;
- protected controller residual provenance;
- opponent singleton line provenance discharged at `t`;
- whether the controller residual contracted, completed, or terminally won.

The theorem is a guarded transition edge, not a global first-win certificate.

## External-class semantics

For any current opponent event other than `s`, this theorem provides only the
same set-wise structural fact used by ordinary support-release acquisition:

- `t` is not released by that event;
- the protected residual is not directly killed by that event.

A surrounding RCIC must independently choose its next controller action and
re-establish any theorem state it needs.

## Fresh qualification controls

### Positive A — terminal shared discharge

Use `4x4, connect-3`:

```
sequence: 24414112
controller: P0
protected line: B1-C2-D3
target: C2
pinned controller action: B3
```

The opponent already has the latent singleton `A2-B2-C2`.

The named supply is `P1:C1`.

After supply, `C2` must be the unique urgent P1 singleton, and `P0:C2`
must simultaneously block that singleton and terminally complete
`B1-C2-D3`.

### Positive B — nonterminal contraction

Use `5x4, connect-3`:

```
sequence: 215112
controller: P0
protected line: B1-C2-D3
target: C2
pinned controller action: E2
```

Again the opponent has latent `A2-B2-C2`.

After `P1:C1`, `P0:C2` must kill the opponent singleton and contract the
controller residual from two missing cells to one without leaving another
immediate P1 singleton.

### Negative — urgent cell differs

Reuse the existing ordinary-acquisition guard fixture:

```
7x3, connect-3
sequence: 322531
protected line: B2-C2-D2
target: D2
pinned action: G1
```

The supply creates an opponent singleton on a different physical cell. The
shared theorem must fail closed.

Additional negatives:

- supply creates more than one urgent opponent singleton;
- pinned action alters the protected residual;
- supply alters the protected residual;
- shared response leaves another immediate opponent singleton;
- non-controller terminal on the shared response;
- stale residual/target input.

## Complexity and search boundary

The theorem executes only:

```
C:d
O:s
C:t
```

plus exact current residual/singleton scans.

It does not enumerate a later free opponent frontier.

Complexity is polynomial in live-line count for fixed Connect-K.

No solved data, oracle, minimax, remoteness, opening book, prior best-move
label, production CPC mutation, or recursive game-tree traversal is permitted.

## Class-C application boundary

The prior Class-C diagnostic found:

```
620 shared-cell candidates
38 locally safe exact instances
```

The broad relaxation was falsified.

Only instances satisfying this frozen theorem may be admitted into the
Class-C recurrence.
