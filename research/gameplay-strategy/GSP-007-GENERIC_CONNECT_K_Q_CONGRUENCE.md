# GSP-007 — Generic finite-gravity Connect-K q congruence

**Status:** rough proposal / theorem-generalization qualification  
**Origin:** standard-7x6 q-congruence proof

## Proposal

Qualify the broader theorem suggested by the 7x6 derivation:

> On any fixed finite gravity Connect-K geometry with alternating no-pass play and first-win stopping, equal support plus equal exact normalized residual antichains determines the complete ordinary labelled future game.

## Why investigate

The proof currently does not use the specific values 7, 6, or K=4.

If the generalization survives, q becomes a reusable gameplay-description pattern for an entire Connect-K family rather than a standard-board artifact.

## Qualification matrix

Include at least:

- thin boards with no possible K-line;
- W<K and/or H<K;
- K=3 controls;
- standard K=4 neighboring geometries;
- tall/narrow and wide/short geometries;
- full-board draw endings;
- immediate first-win cases;
- antichain dominance cases.

## Implementation consequence

Parameterize geometry, winning-set family, support encoding, and residual universe while keeping the gameplay contract:

~~~text
q + action -> terminal | q'
~~~

unchanged.

## Non-claim

This does not imply one fixed 625-element residual universe outside standard 7x6. Each geometry has its own residual universe.
