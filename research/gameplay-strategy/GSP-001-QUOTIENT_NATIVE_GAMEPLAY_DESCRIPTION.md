# GSP-001 — Quotient-native gameplay description

**Status:** rough proposal  
**Purpose:** make the exact future-relevant game description explicit at the boundary between IsoGraph research semantics and executable gameplay.

## Proposal

For ordinary legal Connect Four play, treat the gameplay description consumed by exact solvers as:

~~~text
GameplayState q =
    support
    + normalized P0 residual antichain
    + normalized P1 residual antichain

Action =
    column

Step(q, action) =
    illegal
    | terminal(result)
    | q'
~~~

Side to move is derived from support rank parity under standard alternating no-pass play.

This is not a replacement for the physical board at external/UI boundaries. It is the exact internal gameplay description for the scoped future-behavior semantics supported by the current q-congruence research.

## Why act on it

The high-value lead investigation now provides a direct congruence argument that equal q determines legal actions, landing cells, immediate terminal result, every nonterminal successor q, and therefore the entire ordinary action-labelled future game.

That means physical ownership history should not be carried recursively merely to preserve behavior that q already determines.

## Implementation sketch

Create one Connect4-owned gameplay interface:

~~~text
describe(position) -> q
legalActions(q) -> columns
step(q, column) -> illegal | terminal | q'
classifyTerminal(q, column) -> optional result
~~~

Keep the external move-history/board reconstruction interface separate.

The first implementation should remain transparent rather than maximally packed. The point is to make the semantic ownership boundary exact before optimizing representation.

## Separation rules

Do not attach these to q unless proved derivable from q:

- NDC certificate state;
- path-dependent response reservations;
- proof bounds;
- move-order hints;
- neural outputs;
- evidence/provenance identity;
- winning-line witness identity when only game value is required.

## Qualification

Required controls:

1. existing complete bounded SIU/MQ4 controls;
2. independent physical replay against q transitions;
3. first-win stopping cases;
4. same-q merge cases where available;
5. negative controls showing q is not physical-state or history identity.

## Expected payoff

A single gameplay description can be consumed by Negamax, BSFP, hybrid proof systems, and future solver methods without forcing them to share a physical data structure.
