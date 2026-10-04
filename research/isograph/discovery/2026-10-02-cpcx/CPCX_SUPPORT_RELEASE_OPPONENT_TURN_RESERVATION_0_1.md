# CPCX Opponent-Turn Support-Release Reservation 0.1

**Date:** 2026-10-03  
**Status:** frozen theorem contract before implementation  
**Scope:** experimental CPCX only  
**Parent concept:** `CPCX_SUPPORT_RELEASE_RESPONSE_NEUTRALIZATION_0_1.md`

## Purpose

Factor the existing support-release response theorem at the exact boundary that
occurs **after deterministic controller normalization**.

The existing theorem starts with the controller to move and proves that one
pinned controller event establishes a later response reservation.

The present theorem starts one step later:

```
exact P1-to-move state q
+ latent current-player singleton t at support distance one
=> guarded token
   if current player supplies s, opponent responds t
```

The motivating Class-C use is P1 as the current player and P0 as the proof
controller, but the theorem is player-generic.

## Objects

Let `S` be an exact nonterminal position.

Let:

- `O=S.mover` be the current player / latent-singleton owner;
- `C=O^1` be the response controller;
- `R` be one live O singleton residual;
- `t` be its unique missing target;
- `supportDistance_S(t)=1`;
- `s` be the unique support cell immediately below `t`.

## Premises

1. **Exact nonterminal source.**
2. **Live latent singleton.** `R` is live for O, has exactly one missing cell
   `t`, and its current support distance is one.
3. **Unique release frontier.** `s` is the current legal frontier in t's
   column.
4. **No current O terminal.** O has no currently playable singleton in S.
5. **Current event partition.**
   - `SUPPLY`: O plays s.
   - `EXTERNAL`: O plays any other current legal event.
   Because s is the unique target-column frontier, an EXTERNAL event cannot
   release t through R.
6. **Supply is nonterminal.** Exact O:s is legal and nonterminal.
7. **Unit urgent set after supply.** After O:s, the deduplicated set of
   currently playable O singleton cells is exactly `{t}`.
8. **Reserved response legal.** C:t is current legal after supply.
9. **Reserved response nonterminal.** For this 0.1 theorem C:t must remain
   nonterminal. A separate first-win composition may later relax this if
   needed; this theorem does not.
10. **No transported O singleton.** After C:t, O has no currently playable
    singleton.
11. **Residual killed.** Exact owner-labelled cofactor algebra verifies C:t
    kills R.

## Conclusion

Emit an exact theorem token:

```
SUPPORT_RELEASE_OPPONENT_TURN_RESERVATION
```

with:

```
trigger:  O:s
response: C:t
```

and exact residual provenance.

### SUPPLY class

The named two-event transaction is certified:

```
O:s
C:t
```

It kills R and returns the mover to O with no immediate O singleton.

### EXTERNAL class

Any current O event other than s cannot release t through R.

The theorem does not choose the subsequent C response on the EXTERNAL class.
A surrounding RCIC must do so and must explicitly re-establish a reservation
token if it wishes to carry one forward.

## Relationship to the existing theorem

This is not a relaxation of
`SUPPORT_RELEASE_RESPONSE_NEUTRALIZATION`.

It is the post-pinned boundary form needed when the preceding controller event
was deterministic forced normalization and therefore cannot satisfy the old
theorem's source premise that no opponent singleton was already urgent before
that event.

## Fresh controls

### Positive

Use `4x4, connect-3`, sequence:

```
11221
```

P1 is to move.

P1 has latent singleton:

```
A2-B2-C2
target C2
support C1
```

The prior P0 `A3` stone blocks the competing diagonal.

Required token:

```
P1:C1 -> P0:C2
```

After the response the residual is killed and P1 has no immediate singleton.

### Negative — supply overload

Use `4x4, connect-3`, sequence:

```
11222
```

P1 is to move with the same latent target C2.

P1:C1 creates at least two urgent P1 singleton cells, so the theorem must fail
closed.

### Negative — transported singleton

Use `4x4, connect-3`, sequence:

```
121121
```

P0 is to move with latent P0 target C2.

After:

```
P0:C1
P1:C2
```

a new immediate P0 singleton is transported upward. The theorem must fail
closed.

Additional controls:

- target not support distance one;
- stale/nonlive residual;
- source already has a playable owner singleton;
- solver/oracle/production isolation.

## Complexity

For fixed Connect-K:

- current live-line scan;
- one exact supply event;
- one exact reserved response;
- residual cofactor kill audit.

Polynomial in current live-line count; no recursive legal-move traversal.

## Class-C application boundary

The intended application is deterministic forced normalization such as:

```
P1 event
-> forced P0 block
-> OPEN P1 boundary
-> derive this token from the returned state
```

No Class-C use is permitted until the theorem independently qualifies.
