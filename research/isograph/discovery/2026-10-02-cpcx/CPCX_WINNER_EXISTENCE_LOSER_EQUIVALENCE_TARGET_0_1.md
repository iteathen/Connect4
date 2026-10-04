# CPCX Winner-Existence / Loser-Equivalence Target 0.1

**Status:** active research target  
**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Scope:** experimental CPCX only  
**Production CPC / production solver:** unchanged

## Target change

CPCX no longer attempts to rank outcome-equivalent losing moves by terminal
distance or "longest survival".

The research target is now claim-relative and asymmetric:

1. **winning player to move:** prove at least one legal move preserves a
   theorem-certified first win for that player;
2. **losing player to move:** prove every legal move is equivalent with respect
   to the eventual winner.

No claim is required about:

- fastest win;
- longest loss;
- equal mate/remoteness depth;
- equal continuation geometry;
- equal proof trace;
- equal search cost.

Two losing-player moves may have different terminal distances and still be
equivalent for this target.

## Formal action semantics

Let `S` be an exact nonterminal position, `L(S)` its legal actions, and
`W` the player whose first win is being structurally certified.

### Winner turn

When `S.mover = W`, CPCX needs an existential witness:

```text
there exists a in L(S)
such that
  S --a--> S'
  and CPCX certifies first win for W from S'
```

Equivalently:

```text
EXISTS_WINNING_ACTION(W)
```

CPCX does not need to prove every legal `W` action wins, and it does not need
to order multiple winning actions by win distance.

### Losing-player turn

When `S.mover = W^1`, CPCX needs a universal outcome-equivalence certificate:

```text
for every a in L(S)
  S --a--> S_a
  and CPCX certifies first win for W from S_a
```

Therefore all legal losing-player actions are equivalent under the quotient:

```text
a ~_outcome b
iff
  winner(S_a) = winner(S_b) = W
```

The quotient intentionally forgets remoteness.

It does **not** identify the physical states, proof paths, residual geometry, or
number of moves until terminal completion.

## Turn-6 specialization

At the canonical prefix:

```text
44444
```

P1 is the current mover and the CPCX campaign's designated first-win claimant
is P0.

The turn-6 target is therefore:

```text
for every legal sixth action a in {1,2,3,4,5,6,7}
  certify P0 first win after 44444,a
```

If this succeeds, CPCX may conclude:

```text
all legal P1 sixth moves are outcome-equivalent losses
```

without making any statement about which sixth move survives longest.

The desired conclusion is claim-relative:

```text
OUTCOME_EQUIVALENT_LOSER_ACTIONS(P1, {1,2,3,4,5,6,7}, winner=P0)
```

It is not:

```text
equal remoteness
equal terminal depth
equal continuation tree
```

## Proof quantifiers inside the recurrence

This target gives the recurrence the natural alternating proof shape.

### P0/controller boundary

Only one qualified controller action is required.

A deterministic structural selector or theorem witness may choose a single
legal P0 action/macro when that action:

- gives an immediate P0 terminal; or
- enters an already-qualified P0 first-win certificate class; or
- strictly decreases the admitted well-founded CPCX descriptor while
  preserving the P0 first-win claim.

There is no requirement to prove sibling P0 actions equivalent.

### P1/opponent boundary

Every current legal P1 action must be covered.

Each current P1 event must:

- terminate first for P0; or
- normalize deterministically into a certified P0 first-win class; or
- enter a strictly smaller admitted descriptor in the same P0-winning
  recurrence.

This is exactly where current-frontier response-total theorems remain
necessary.

## Relationship to existing CPCX work

The current protected-diagonal opponent-response descent machinery already has
the correct universal shape at opponent boundaries:

```text
one current free opponent event
-> exact transport / deterministic normalization
-> controller progress
-> P0 first win or strict descriptor descent
```

The controller-saturation and local first-win theorems already have the correct
existential shape at controller boundaries: CPCX may use one mechanically
selected qualified progress witness.

Therefore this target change does not discard the current theorem stack. It
removes an unnecessary secondary objective: ordering already-losing opponent
actions by terminal distance.

The latest latent-singleton pair-hub and forced-normalization theorems remain
valid first-win terminal classes and may be used as recurrence endpoints.

## Required proof result

For a state claimed to be P0-winning, the complete CPCX certificate may be
viewed as an AND/OR structural proof:

```text
P0 turn: OR node
  one certified child is sufficient

P1 turn: AND node
  every legal current action must be certified
```

This is proof semantics, not permission to perform recursive game-tree search.

CPCX must still derive the OR witness and compress/cover the AND frontier using
qualified rank-local structural rules, bounded polynomial operators,
deterministic forced normalization, and well-founded descriptor descent.

## Search prohibition

The target change does not relax the anti-search constraints.

Still forbidden as theorem premises or hidden implementation mechanisms:

- solved tables;
- opening books;
- prior best-move labels;
- minimax / negamax / alpha-beta;
- DFS/BFS over future legal-move trees;
- recursive arbitrary reply enumeration;
- oracle W/D/L labels;
- remoteness labels used to select among losing actions.

Current legal frontier quantification is allowed when a theorem must prove that
**every current losing-player action** belongs to the same outcome class.

Deterministic forced response closure is allowed under the existing exact CPCX
rules.

## Fail-closed rules

A loser-equivalence claim fails if even one legal losing-player action is not
covered by the P0 first-win recurrence.

A winner-action claim fails if CPCX cannot produce at least one qualified
winning action.

`NO_CERTIFICATE` remains epistemic only:

```text
NO_CERTIFICATE != draw
NO_CERTIFICATE != loss
NO_CERTIFICATE != counterexample
```

## Current turn-6 proof boundary

As of live branch head `8b04c9f88fd47f89f783a8badb80b83cad3a5552` before
this target update:

- protected-diagonal controller saturation covers 42/42 controller classes;
- protected-diagonal opponent-response descent covers 45/45 P1 boundary
  classes and 304/304 current opponent events by immediate P0 win or strict
  local descent;
- latent-singleton pair-hub overload and its deterministic normalization
  handoff provide additional exact P0 first-win endpoint classes;
- global recurrence closure is still open because the smaller endpoints have
  not yet been proved to remain inside one finite admitted response-total
  descriptor band or terminate.

Under the new target, the next theorem does **not** need a remoteness ordering.
It needs only enough recurrence closure to establish:

```text
all seven sixth actions -> P0 first-win class
```

with existential P0 progress and universal P1 outcome equivalence.

## Acceptance criterion

The turn-6 research target is closed when a finite, well-founded CPCX proof
establishes both:

```text
1. P0 controller states:
   at least one certified P0 winning action exists.

2. P1 opponent states:
   every legal P1 action remains in the P0 first-win class.
```

Applied at `44444`, this yields proof of losing-player sixth-move equivalence
without any requirement to identify the longest-surviving P1 move.
