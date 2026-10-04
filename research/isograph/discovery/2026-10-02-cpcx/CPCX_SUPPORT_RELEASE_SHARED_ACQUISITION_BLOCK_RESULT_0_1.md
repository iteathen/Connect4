# CPCX Support-Release Shared Acquisition/Block Result 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** qualified generic structural theorem  
**Workflow:** `Research CPCX shared acquisition-block theorem`  
**Run:** `37171239091` — SUCCESS

## Qualified theorem

`certifyCpcxSupportReleaseSharedAcquisitionBlock`

certifies the guarded transition:

```
C:d
O:s
C:t
```

when:

- `t` is a protected controller target at support distance one;
- `d` preserves that protected residual and does not supply it;
- `O:s` is the unique support release;
- after supply the unique urgent opponent singleton cell is exactly `t`;
- `C:t` contracts/completes the protected controller residual;
- the same `C:t` kills every urgent opponent singleton on `t`;
- first-terminal precedence is respected;
- if nonterminal, no immediate opponent singleton remains.

The result is an exact guarded transition edge, not a standalone global
first-win certificate.

## Qualification

All six frozen controls passed:

1. fresh 4x4 connect-3 terminal shared discharge;
2. fresh 4x4 connect-3 nonterminal contraction shared discharge;
3. preserved transported-singleton falsifier from the rejected 0.1 fixture;
4. distinct-urgent-cell negative;
5. pinned-action-supplies-target negative;
6. production/solver/oracle/search-isolation audit.

The nonterminal positive uses:

```
source: 1122
protected P0 line: B1-C2-D3
target: C2
pinned P0 event: A3
supply: P1 C1
shared response: P0 C2
```

The pinned `A3` event blocks the otherwise transported
`A3-B2-C1` P1 singleton, so after the shared response no P1 immediate
singleton remains.

## Preserved falsifier

The earlier `215112` fixture is not a positive. Its shared response releases
a new P1 `C3` singleton and is correctly rejected as:

```
POST_SHARED_DISCHARGE_P1_SINGLETON
```

This guard remains load-bearing.

## Scope

Established:

- the shared acquire-and-block event is a real generic CPCX theorem class;
- simultaneous progress/discharge on one physical cell can be certified
  without solved values or future move search.

Not established:

- that every locally safe Class-C diagnostic row instantiates the theorem;
- that adding this edge closes the Class-C RCIC;
- turn-6 outcome equivalence.

## Boundary

No solved values, oracle, minimax, remoteness, opening book, prior best-move
label, production CPC mutation, production solver mutation, or recursive
game-tree traversal.
