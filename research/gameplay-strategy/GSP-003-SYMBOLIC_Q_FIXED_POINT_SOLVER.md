# GSP-003 — Symbolic q fixed-point solver

**Status:** rough proposal  
**Goal:** exploit q without ordinary recursive game-tree search.

## Proposal

Solve over sets of quotient states using backward fixed-point semantics:

~~~text
terminal q regions
    -> symbolic predecessor over q
    -> Win/Loss/Draw closure
    -> empty-root classification
~~~

This is the gameplay-facing continuation of CUDA-BSFP once q is accepted as the ordinary future-behavior state.

## Key design point

Do not enumerate every q merely because q is exact.

The previous BSFP work already showed symbolic frontiers can be substantially smaller than explicit q-state enumeration on bounded controls.

The desired primitive is therefore:

~~~text
Pre_a(Qset)
~~~

over symbolic regions of q, not a giant reverse adjacency table.

## Implementation ideas

- represent support ranks separately from residual-family frontiers;
- reuse packed residual cofactor algebra;
- build predecessor constraints symbolically;
- use rank-local or rolling-rank execution;
- retain exact terminal injection and first-win semantics;
- exploit support-local dictionaries where qualified;
- move to GPU only after the symbolic representation is bounded and exact.

## Qualification

Compare explicit q dynamic programming, symbolic q fixed point, and the current BSFP representation.

Measure frontier size, generated candidates, normalization work, retained memory, root time-to-proof, and exact agreement.

## Strategic value

This is the clearest current route to an exact solver that avoids ordinary recursive minimax while still using the q reduction.
