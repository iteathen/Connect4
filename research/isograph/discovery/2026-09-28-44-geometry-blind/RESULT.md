# Position 44 — oracle-blind exact next-move proof

Date: 2026-09-28

## Claim

For standard 7x6 Connect Four, after one-based move prefix `44`, the unique
W/D/L-optimal move for P0 is column **4**.

This result was calculated from game rules by fresh exact solves. It does not
consume the repository solved-action corpus, opening books, external BDDs, or a
preloaded perfect-play map.

## Symmetry reduction

Horizontal reflection fixes the `44` position and maps legal P0 moves as:

```
1 <-> 7
2 <-> 6
3 <-> 5
4 <-> 4
```

Therefore four fresh child classifications are sufficient.

## Fixed exact solver

JSMinSys source:

`6bbba7c71c60afb1018a22b6d5c03f495f5d2c9e`

Solver path:
- exact RBA Connect4 semantics;
- CPC exact/bound/restriction closure;
- alpha-beta exact search;
- Lazy SMP;
- shared exact TT;
- no solved-position preload.

Run configuration:
- 4 workers;
- root frontier enabled;
- one wide + remaining deep topology inherited from source;
- sharedSampleMask = 0;
- shared cache capacity = 134,217,728;
- local cache capacity = 8,388,608 per worker;
- 600,000 ms ceiling.

Workflow:

`36498668544`

## Fresh exact results

| Child | Absolute P0 W/D/L | Elapsed ms | Total nodes | Artifact | Digest |
|---|---:|---:|---:|---:|---|
| 441 | -1 | 61,036 | 55,674,711 | 11004840920 | sha256:2dcf0de18b84de71fe7caa1cf712deebef133d7c3b7c62664e2536de401f6375 |
| 442 | -1 | 48,399 | 40,267,592 | 11004227676 | sha256:a824265ae57b905e27e563f449e64336ee4d2155a5164528a305b014ddd0349d |
| 443 | -1 | 43,014 | 37,661,797 | 11004721296 | sha256:9fe26a605945f3a0cc27ff50c856ecd58fbf15d2e6bc353ea10e0d92cce16fbc |
| 444 | +1 | 149,250 | 135,020,780 | 11004721577 | sha256:7d7a7cd3628581954b3e669209ad67ca4e91f23822c18dbb84e68726d9048922 |

All four runs:
- status = EXACT;
- errorCode = 0;
- all 4 workers exited;
- host cleanup = true.

## Result orientation

The fixed solver's `solveConnect4RbaAlphaBeta` returns absolute W/D/L code
1/2/3 through `relativeToAbs(relative,mover)`. The Lazy-SMP worker publishes
that absolute code, and the host reports:

```
rootWdl = absoluteCode - 2
```

Hence the table above is absolute P0 orientation:

```
-1 = P0 loss
 0 = draw
+1 = P0 win
```

It is not a side-to-move reinterpretation.

## Exhaustion of all seven actions

Reflection gives:

```
V(447) = V(441) = -1
V(446) = V(442) = -1
V(445) = V(443) = -1
V(444) = +1
```

Therefore:

```
argmax_{c in {1..7}} V(44c) = {4}.
```

Column 4 is not merely preferred by a heuristic. It is the only legal move that
preserves a P0 forced win.

## Structural discovery lane

A separate oracle-blind geometry experiment (workflow `36497902432`, artifact
`11004695026`, digest
`sha256:d4ac9898f03bc262439dedf94b2600d8ae225c6aeefd523ef2057f1db76bd20a`)
found that the center child also dominates all three noncenter symmetry classes
in a residual-line relaxation before and after each one-ply reply.

That observation remains classified as:

`STRUCTURAL_LEAD_NOT_GAME_THEOREM`.

It is not used as proof of the result above.

## Remaining research target

The exact result is now established without prior solve knowledge.

What remains is the stronger *searchless formulation* problem:

derive a small geometry/rule certificate that proves the same unique selection
without recursively solving the descendants.

Current evidence says a valid certificate must retain more than residual
cardinality. Support location, alternating predecessor quantifiers,
response resources, first-win timing and deadlines are load-bearing.

The solved map remains unnecessary for this proof and should be used only as a
post-hoc external control if desired.
