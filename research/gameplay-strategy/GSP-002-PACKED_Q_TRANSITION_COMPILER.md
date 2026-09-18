# GSP-002 — Packed q transition compiler

**Status:** rough proposal  
**Depends on:** GSP-001

## Proposal

Compile the quotient-native gameplay description into a fixed-width or densely interned transition kernel:

~~~text
qID + column
    -> terminal token
       | qID'
~~~

The semantic q remains authoritative for equality. A packed ID is only a representation of that exact content.

## Why act on it

q is directly maintainable from one move by advancing one support column, applying mover residual cofactors, deleting opponent residuals containing the move, and minimal-antichain normalization.

The standard 7x6 residual universe is finite and small enough to support precomputed residual operations.

## Implementation ideas

1. Transparent packed record: support code plus exact sorted residual IDs for both players.
2. Precomputed residual cofactors for each residual ID and cell.
3. Precomputed or accelerated dominance/subset masks for antichain normalization where memory-effective.
4. Dense q interning where hashes only select candidate slots and full-record equality remains authority.
5. Transition caching only after qID equality is exact.

## Qualification

Measure separately:

- q construction cost;
- transition cost;
- antichain normalization cost;
- interning cost;
- memory per q;
- TT/cache hit change;
- total time-to-proof.

Do not infer value from the packed identity itself.
