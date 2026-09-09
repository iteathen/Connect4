# BSFP — searchless symbolic backward solver for exact WDL

**Date:** 2026-09-09  
**Author / conceptual origin:** Josh Oshiro  
**Status:** research prototype/evidence only; maintained source and `main` unchanged.  
**Branch:** `research/low-confidence-survival-2026-09-09`

## Attribution and prior work

This document describes the solver architecture I now call **BSFP — Backward Symbolic Fixed-Point** and the algorithmic idea I call **NDC — Nested Dependency Closure**.

The conceptual path began with my earlier Connect Four evaluator, which used a future-control parity calculation to reason about who would control strategically relevant future squares without explicitly playing every intervening move. I now call that mathematical shape **CPC — Control Parity Calculus**. I later proposed reasoning over surviving winning positions rather than carrying the full colored board as the primary representation, nesting the resulting dependencies, and then running that nested dependency system backward from potential winning positions. Those steps produced the BSFP direction tested here.

I developed that path independently. I did **not** derive my evaluator, CPC, the winspace-over-board direction, NDC, or BSFP from Victor Allis's work, and I did not use his thesis to formulate those ideas.

After this conceptual direction was already present, I compared it against earlier Connect Four theory, including **Victor Allis's** 1988 master's thesis, *A Knowledge-based Approach of Connect-Four: The Game is Solved: White Wins*. That comparison revealed meaningful overlap and common structural features. Allis's publication predates my work, so I cite him wherever his earlier results or named strategic rules overlap with the territory discussed here.

I credit Allis with his published treatment of **Control of Zugzwang**, VICTOR's knowledge-based approach, the nine named strategic rules associated with that system—Claimeven, Baseinverse, Vertical, Aftereven, Lowinverse, Highinverse, Baseclaim, Before, and Specialbefore—and their rule-interaction framework.

The provenance distinction is important:

> **My CPC → WSL-625 → NDC → BSFP line was independently developed. Allis's work is earlier published related work with which I later discovered overlap.**

When I later reduce an Allis rule into a common blocker, parity, response, WSL-625, or dependency form, that is a new transformation of credited prior work. It does not mean those rules were inputs from which I derived CPC, NDC, or BSFP. Likewise, the fact that Allis published on Control of Zugzwang earlier means his work should be acknowledged as relevant prior publication; it does not mean I obtained my specific future-event parity calculation from him.

**Reference:** Victor Allis, *A Knowledge-based Approach of Connect-Four: The Game is Solved: White Wins*, M.Sc. thesis, Vrije Universiteit Amsterdam, October 1988, Report IR-163.

## Result

My backward-from-winning-positions idea now has a direct implementation that solves complete Connect Four variants **without enumerating physical board states and without recursive minimax**.

The prototype operates over support/height skeletons only. For each skeleton it stores a reduced multi-terminal Boolean decision diagram (MTBDD) whose variables are ownership of already-filled cells and whose terminals are W/D/L from P0's perspective.

Potential geometric winning lines are the only terminal-win predicates. The entire game is derived backward from deeper support skeletons toward the empty skeleton.

## Terminology used in this paper

- **CPC — Control Parity Calculus:** the future-control parity mathematics originating in my earlier evaluator.
- **WSL-625 — Winspace Lattice 625:** the fixed 625-element residual requirement/blocker universe derived during this research from my winspace-over-board direction.
- **NDC — Nested Dependency Closure:** my algorithmic idea of recursively nesting terminal/prerequisite/adversarial dependencies until closure.
- **BSFP — Backward Symbolic Fixed-Point:** the solver architecture that executes the closure backward from terminal outcomes.

Historical references to `BSF` in earlier research artifacts refer to the same solver lineage before I finalized the name BSFP.

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

This is a bottom-up symbolic dynamic program over the support lattice. It is equivalent to a backward controllable-predecessor fixed point, but it does not materialize colored board positions.

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

The corrected implementation constant-folds root ownership into the winning-line predicates from the start. This changed the `+2` frozen root from a timeout to approximately 124 ms and illustrates a broader architecture principle:

> representation context should carry facts already known by the root/task rather than redundantly encoding them in every symbolic object.

## What this establishes

### Established on tested games

1. Backward symbolic dependency solving can replace explicit move-state search for exact W/D/L.
2. Geometric winning lines are sufficient terminal axioms for the tested recurrence.
3. Alternating player choice becomes algebraic `max/min` composition over symbolic predecessor functions.
4. The method is exact on every reachable state of four complete games.
5. It survives standard 7x6 geometry on all eight frozen roots.

### Not yet established

1. The empty standard 7x6 board has not yet completed in the current generic MTBDD representation.
2. Exact distance-to-win/loss is not yet represented; this prototype solves W/D/L.
3. The current BDD variable order and global node-retention strategy are not final.
4. CPC parity/response algebra, WSL-625 blocker closure, residual antichains, and event-frontier facts are not yet fully compiled into the symbolic representation; they are likely routes to much stronger compression.
5. The CUDA-JS GPU-batched implementation remains to be qualified.

## Why the empty-board problem is now different

The mathematical correctness problem is substantially resolved for W/D/L on the tested domains. Empty 7x6 is now primarily a **symbolic representation/compaction problem**.

The raw support lattice has 823,543 skeletons, which is not itself prohibitive. The likely bottleneck is MTBDD node growth because the current representation carries generic ownership functions rather than the much smaller strategic dependency algebra discovered elsewhere in the research.

Promising reductions include:

- variable ordering aligned with support/event precedence;
- constant/context specialization;
- per-ply symbolic garbage collection;
- WSL-625 residual winspace variables instead of raw ownership variables;
- dominance-antichain representation of winning/losing regions;
- CPC parity/response/race constraints and WSL-625 blocker closure as specialized symbolic operators;
- symmetry/canonicalization across support skeletons;
- bounded out-of-core GPU batching through CUDA-JS so VRAM determines batch size rather than total solvable graph size.

## Stronger interpretation

The searchless hypothesis is no longer purely hypothetical.

The project now has a correct tested implementation of:

```text
winning-line terminal axioms
    -> NDC backward dependency composition
    -> BSFP symbolic fixed point
    -> root W/D/L
```

for complete games through 4x5 and for nontrivial standard 7x6 roots.

The remaining research goal is to make the same algebra compact and batchable enough to carry the **empty 7x6** root, then determine whether exact-distance refinement can also be expressed inside the same framework.

## Attribution boundary for publication

For any paper derived from this work, I want the provenance stated plainly:

- I, **Josh Oshiro**, independently developed CPC from my original evaluator, the shift toward winspace rather than full-board representation, the nested-dependency idea, the backward-from-potential-wins direction, NDC, and the BSFP conceptual architecture.
- **Victor Allis** receives credit for his earlier published 1988 Connect Four work, including Control of Zugzwang, VICTOR's nine named strategic rules, and their interaction framework.
- The relationship between these lines is **later-recognized overlap**, not derivation. Where my analysis reproduces, maps onto, or structurally corresponds to an Allis result, the paper should cite his earlier publication while also stating that my approach was independently developed.
- Algebraic mappings from Allis's rules into CPC/WSL-625/NDC forms are later comparative transformations of credited prior work, not sources of my original method.
- Implementation, benchmarking, oracle qualification, falsification, and GPU engineering are evidence and engineering work supporting the theory; they should not be used to blur conceptual provenance.

This wording is intended to avoid both false impressions: that I borrowed the core method from Allis, or that earlier published overlapping work does not exist.
