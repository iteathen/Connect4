# Searchless symbolic backward solver — exact WDL without board-state enumeration

**Date:** 2026-09-09  
**Status:** research prototype/evidence only; maintained source and `main` unchanged.  
**Branch:** `research/low-confidence-survival-2026-09-09`

## Result

The backward-from-winning-positions idea now has a direct implementation that solves complete Connect Four variants **without enumerating physical board states and without recursive minimax**.

The solver operates over support/height skeletons only. For each skeleton it stores a reduced multi-terminal Boolean decision diagram (MTBDD) whose variables are ownership of already-filled cells and whose terminals are W/D/L from P0's perspective.

Potential geometric winning lines are the only terminal-win predicates. The entire game is derived backward from deeper support skeletons toward the empty skeleton.

## Algebra

For one height skeleton `h`, let `V_h` be the symbolic W/D/L function over ownership of already-filled cells.

For a legal move in column `c` landing at cell `x`:

```text
Move_c(h)
  = if placing x completes any geometric winning line
      then terminal outcome for mover
      else V_{h+e_c}[x := mover]
```

The predecessor function is then:

```text
P0 to move: V_h = max_c Move_c(h)
P1 to move: V_h = min_c Move_c(h)
```

where `-1 < 0 < +1`.

This is a bottom-up symbolic dynamic program over the support lattice. It is equivalent to the backward controllable-predecessor fixed point, but it does not materialize colored board positions.

The number of support skeletons is only:

```text
(H + 1)^W
```

for the empty board:

- 4x3: 256 skeletons;
- 4x4: 625;
- 5x3: 1,024;
- 4x5: 1,296;
- standard 7x6: 823,543.

The current generic MTBDD representation, not skeleton count, is the scaling boundary for empty 7x6.

## Complete small-game direct solves

| Game | Physical states in independent control | Support skeletons used by symbolic solver | Root WDL | MTBDD decision nodes | Direct symbolic solve time |
|---|---:|---:|---|---:|---:|
| 4x3 connect-3 | 4,659 | **256** | W | 7,635 | ~30 ms |
| 4x4 connect-4 | 139,625 | **625** | D | 38,438 | ~131 ms |
| 5x3 connect-4 | 152,003 | **1,024** | D | 9,099 | ~31 ms |
| 4x5 connect-4 | 1,385,521 | **1,296** | D | 302,745 | ~1.05 s |

The direct solve itself never builds those physical-state controls.

## Exhaustive qualification against every reachable state

A separate qualification harness enumerated the complete physical games only as an independent oracle and evaluated the symbolic `V_h` function on every reachable state.

Results:

| Game | Reachable states checked | Legal edges in oracle | WDL mismatches |
|---|---:|---:|---:|
| 4x3 c3 | 4,659 | 11,818 | **0** |
| 4x4 c4 | 139,625 | 304,574 | **0** |
| 5x3 c4 | 152,003 | 377,229 | **0** |
| 4x5 c4 | 1,385,521 | 3,175,616 | **0** |

Total:

- **1,681,808 reachable physical states checked**;
- **3,869,237 legal oracle edges**;
- **0 W/D/L disagreements**.

This establishes exact equivalence for the complete tested games, not merely root agreement.

## Full 7x6 geometry — frozen roots

A root-specialized form fixes all already-known root stones at compile time and creates symbolic variables only for genuinely future cells. It then processes only descendant support skeletons:

```text
product_c (H - rootHeight[c] + 1)
```

All eight established frozen 7x6 research roots matched the known exact score signs:

| Sequence | Exact score sign | Symbolic WDL | Support skeletons | MTBDD decision nodes | Time |
|---|---:|---|---:|---:|---:|
| `764353221241721325116531` | - | L | 3,000 | 342,590 | ~1.48 s |
| `5563576621726752473477144213` | + | W | 1,296 | 13,700 | ~54 ms |
| `3253472274311154254412135` | - | L | 2,520 | 25,904 | ~92 ms |
| `24763565123272565531172315` | + | W | 1,728 | 23,370 | ~96 ms |
| `544111352647536626717444135` | - | L | 1,440 | 21,440 | ~87 ms |
| `3412761563244125763551573` | - | L | 4,608 | 103,061 | ~376 ms |
| `1174534625627233274533652316` | - | L | 1,152 | 3,394 | ~31 ms |
| `463141571213634656162165252` | + | W | 864 | 16,727 | ~57 ms |

No descendant physical board-state graph is constructed in these solves.

## Important implementation correction

The first 7x6 symbolic prototype timed out even on a late root because it treated already-known root stones as free Boolean variables and only fixed them at the final root evaluation.

The corrected implementation constant-folds root ownership into the winning-line predicates from the start. This changed the `+2` frozen root from a timeout to approximately 124 ms and is an example of the broader architecture principle:

> representation context should carry facts already known by the root/task rather than redundantly encoding them in every symbolic object.

## What this establishes

### Established on tested games

1. Backward symbolic dependency solving can replace explicit move-state search for exact W/D/L.
2. Geometric winning lines are sufficient terminal axioms.
3. Alternating player choice becomes algebraic `max/min` composition over symbolic predecessor functions.
4. The method is exact on every reachable state of four complete games.
5. It survives standard 7x6 geometry on all eight frozen roots.

### Not yet established

1. The empty standard 7x6 board has not yet completed in the current generic MTBDD representation.
2. Exact distance-to-win/loss is not yet represented; this prototype solves W/D/L.
3. Current BDD variable order and global node retention are naive.
4. U1 parity/response algebra, U2 blocker closure, residual antichains and event-frontier facts are not yet compiled into the symbolic function representation; they are likely routes to much stronger compression.

## Why the empty-board problem is now different

The mathematical correctness problem is substantially resolved for W/D/L. Empty 7x6 is now primarily a **symbolic representation/compaction problem**.

The raw support lattice has 823,543 skeletons, which is not itself prohibitive. The likely bottleneck is MTBDD node growth because the current representation carries generic ownership functions rather than the much smaller strategic dependency algebra already discovered elsewhere in the research.

Promising reductions include:

- variable ordering aligned with support/event precedence;
- constant/context specialization;
- per-ply symbolic garbage collection;
- residual win-space variables instead of raw ownership variables;
- dominance-antichain representation of winning/losing regions;
- U1 parity-response constraints and U2 blocker closure as specialized symbolic operators;
- symmetry/canonicalization across support skeletons.

## Stronger interpretation

The searchless hypothesis is no longer purely hypothetical.

We now have a correct implementation of:

```text
winning-line terminal axioms
    -> backward symbolic predecessor composition
    -> empty-root W/D/L
```

for complete games through 4x5 and for nontrivial standard 7x6 roots.

The remaining research goal is to make the same algebra compact enough to carry the **empty 7x6** root and then, separately, add exact-distance refinement if required by the product contract.
