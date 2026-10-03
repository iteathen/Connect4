# CPCX Protected Diagonal Opponent-Response Descent 0.1

**Status:** frozen theorem contract before implementation  
**Scope:** experimental CPCX only  
**Observation:** one complete current opponent frontier followed by deterministic controller closure

## Purpose

Compose the existing protected-diagonal transport machinery into one current-rank
response theorem.

The source is an exact nonterminal position with opponent `D` to move and one
live protected diagonal residual owned by controller `A=D^1`.

For each **current legal D event only**, CPCX:

1. transports the protected residual exactly;
2. applies only deterministic forced normalization;
3. applies deterministic protected-diagonal controller saturation;
4. requires either controller first win or strict descent of a well-founded
   protected measure.

No second free opponent layer is consumed.

## Protected measure

For exact position `S` and protected residual `R`, define

```text
nu(S,R) = (
  missingCount(R),
  supportDebt(R),
  remainingPhysicalCapacity(S)
)
```

with lexicographic order.

The third coordinate is required because anchor-pivot transfer may preserve the
first two coordinates while one physical opponent event still consumes one
board cell.

## Premises

1. `S` is exact and nonterminal.
2. `D=S.mover`; protected residual `R` belongs to `A=D^1`.
3. `R` is a current live diagonal residual.
4. Current immediate classification is `NO_IMMEDIATE_OBLIGATION`.
   Therefore the current opponent has no first-terminal move and no higher
   precedence forced response is being bypassed.
5. Every current legal opponent event is audited by the event rule below.

## Event rule

For one current legal opponent event `e`:

### Protected-target occupation

If `e` is one of the missing cells of `R`, try in order:

1. qualified same-track diagonal transfer;
2. qualified unique-anchor opposite-diagonal pivot.

The selected replacement residual must be exact. Same-track transfer strictly
decreases the protected tuple; anchor pivot strictly decreases `nu`.

### External event

If `e` is not a missing protected target, use the qualified protected-residual
support-transition theorem.

The event must be nonterminal for the opponent. The protected cofactor remains
identical and support debt is nonincreasing.

### Deterministic controller closure

After the one opponent event, `A` is to move.

If an exact forced response has precedence, apply protected-residual forced
normalization. It may:

- certify `A` first win;
- return directly to an open `D` boundary;
- return control to `A`.

If control remains with `A`, apply protected-diagonal controller saturation.

No arbitrary controller action is selected.

## Event conclusion

One event is certified iff it ends in either:

```text
CERTIFIED_FIRST_WIN(A)
```

or an exact open opponent boundary `(S',R')` with:

```text
nu(S',R') < nu(S,R).
```

## Current-frontier conclusion

If every current legal opponent event is certified, emit:

```text
PROTECTED_DIAGONAL_OPPONENT_RESPONSE_DESCENT
```

containing one exact witness row per current event.

This proves response-total strict progress for **this current state**.

It does not assert that every smaller-measure endpoint automatically satisfies
the same theorem.

## Complexity

For width `W`, live-line count `L`, fixed residual cardinality `K<=4`,
and remaining board capacity `C`:

```text
current frontier audit:
  O(W * poly(L,K,C))
```

Each row contains one physical opponent event followed only by deterministic
normalization/saturation.

There is no recursive legal-move traversal.

## Required qualification controls

1. fresh hidden-target source where every current opponent event is external;
2. fresh same-track protected-target block event;
3. fresh anchor-pivot protected-target block event;
4. rejection of an opponent terminal event;
5. rejection when source immediate precedence is not open;
6. production-CPC / solver / oracle / recursion isolation.

## Turn-6 application boundary

The qualified move-6 normalized P1-band diagnostic at run `37146074722`
contains:

```text
45 exact P1 boundary states
304 current legal P1 events
304 exact theorem-stack closures
304 strict descents or controller wins
0 P1 terminal responses
0 failures
```

That consumed census motivates qualification but is not a theorem premise.

The theorem remains one-layer and does not by itself prove
`Best(44444)=LegalActions(44444)`.
