# Connect4 RBA Quantifiable Unknown — 0.3 board-fiber refinement

**Record ID:** RBA-QU-0003  
**Refines:** RBA-QU-0002  
**Date:** 2026-09-18  
**State:** OPEN  
**Authority effect:** post-1.1 research refinement only  
**Research direction:** Josh Oshiro

## Refinement

This revision narrows the RBA unknown after G2/G3/G4 board-geometry tests.

### No longer broadly open

1. The support-conditioned future-cell gravity/frontier + residual-line incidence fiber determines the residual lattice and one-step cofactor neighborhood up to exact isomorphism.
2. That exact fiber isomorphism transports the complete abstract ordinary strong-value algebra:
   - q-state order,
   - legal actions,
   - exact action values,
   - exact state values,
   - best-move sets,
   - exact threshold boundaries.
3. Concrete 7x6 coordinate embedding is therefore not load-bearing for the abstract ordinary-value algebra once the exact board fiber is fixed.
4. The residual lattice should be treated as derived from board geometry, not as an independent primitive.
5. Raw cofactor-transformer typing exists, but adds only modest compression beyond the board-fiber quotient at ranks 34–35.

## G3 qualification

~~~text
non-reflection fiber pairs        15
complete q pairs           1,592,642
mapped action cases        3,929,368

state mismatches                   0
action mismatches                  0
best-move mismatches               0

direct threshold boundaries       53
boundary mismatches                 0
~~~

G3 also follows by induction from G2 because the fiber isomorphism preserves legal frontier actions, residual cofactors, terminal events, and the induced child fiber.

Guard:

~~~text
abstract ordinary-value fiber isomorphism
    !=
physical/history realizability isomorphism
~~~

## G4 measurement

Ranks 34–35:

~~~text
concrete supports                 4,663
concrete legal support edges     18,382

source fiber types                1,971
representative fiber actions      8,043
action-rooted fiber types         7,924
residual cofactor transformer
types                             7,836
~~~

So the board-fiber quotient gives a real exact transfer alphabet, but raw geometric/cofactor transformer reuse is not the main compression law.

## Refined RBA location

~~~text
concrete support
    ↓ exact board-fiber quotient
board structural fiber
    ↓
residual lattice + cofactor/adjoint family
    ↓
near-information-preserving transition interface
    ↓
          OPEN RBA CORE
    alternating value/order
    threshold pullback
    action aggregation
    closed dual/blocker
    compact normalization/composition
    ↓
small exact value-behavior quotient
~~~

## Remaining high-value unknowns

- O1 minimal complete basis
- O2 compactness law
- O3 compact value-transformer composition
- O4 compact direct-root normal form
- O5 minimal exact value carrier
- O6 proof/value correspondence
- O7 family generalization
- O8 canonical transformer normal form
- O9 law explaining the large transition-to-value collapse

## Current conclusion

The next useful target is no longer another board-symmetry or raw transition quotient.

It is:

> derive a compact composition law for exact monotone strong-score boundary transformers over board-fiber transitions.

That is now the narrowest unresolved RBA seam.

## Reconnect

Evidence:

- `RBA_BOARD_FIBER_G2_RESULTS_0_1.json`
- `RBA_BOARD_FIBER_G2_CHECKPOINT_0_1.md`
- `RBA_BOARD_FIBER_G3_RESULTS_0_1.json`
- `RBA_BOARD_FIBER_G3_CHECKPOINT_0_1.md`
- `RBA_BOARD_FIBER_G4_RESULTS_0_1.json`
- `CONNECT4_RBA_QU_0_3.json`

