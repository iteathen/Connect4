# Disproven selector: static minimum terminal envelope equals Y_cell

**Claim:** C4-R0055

A tempting standard-board observation is

```text
7x6: maximal-delay envelope 38 - rank5 exclusion capacity 10 = 28 = Y_cell.
```

This equality is exact on 7x6 but is not sufficient to characterize the optimal terminal geometry or the standard board.

The finite K=4 family audit supplies the counterexample

```text
8x7: 46 - 6 = 40 = Y_cell.
```

Therefore the missing perfect-play selection rule cannot be a scalar equality of those two counts. It must retain additional timing/control/response structure. This does not falsify either the terminal-envelope calculation or the structural core dimension; it falsifies their proposed sufficiency as a selector.
