# Connect4 Semantic-Quotient Research Status

**Updated:** 2026-09-11  
**Canonical branch:** `research/semantic-quotient`  
**State:** quotient-native W/D/L negamax exact on complete controls; native physical-economics optimization active

## Mission

Find the smallest exact, efficiently updatable description of the remaining Connect Four game and determine which forward/backward exact reasoning forms exploit it best. This branch owns solver-neutral research into relational state identity, future-behavior equivalence, canonical transitions, cross-solver proof contracts, and comparative solver evidence.

It does **not** own production solver implementation. Current product lanes remain:

- preserved historical `solver/minimax-alpha-beta`;
- `solver/cuda-bsfp`;
- `solver/hybrid-confluence`;
- a future forward solver generation will be based on quotient-native negamax after kernel qualification.

## Qualified relational state

The exact shared state is logically:

```text
q = supportIndex
  + sideToMove
  + normalized P0 residual requirements
  + normalized P1 residual requirements
```

Across **1,681,808** complete-control physical states, SIU-1 produced zero projection, transition, terminal, strong-score, per-action-score, BSFP W/D/L, or reverse-closure mismatches.

For ordinary legal Connect Four, side-to-move is support-rank parity and need not occupy storage in the hot state.

The common algebra is:

```text
forward:  T(q,a) -> q' | terminal
backward: Pre_a(Q) -> exact predecessor set/frontier
hybrid:   exact values / sound proof facts keyed by q
```

Common semantics do not require common physical representation. The existing BSFP ownership-antichain form remains substantially more compressed than explicit `q` enumeration on the 4x5 control.

## Search-method campaign v1

The first solver-method campaign compared relational alpha-beta/negamax, PVS/NegaScout, MTD(f), PN-DAG, and Proof-Set Search over the same precompiled relational DAG.

On the largest 4x5 draw control with relational tactical closure:

```text
alpha-beta: 16,489 expansions
PVS:        15,110
MTD(f):     15,103
PN-DAG:     61,275
PSS:        scale-deferred
```

The result selected **side-to-move negamax as the forward value formulation**, not a final driver. Alpha-beta remains the control/kernel; PVS and MTD(f) remain driver finalists. PN-DAG and PSS remain research-only candidates.

An ideal exact BSFP wall around rank 10 reduced the same 4x5 forward work to roughly 1.3k expansions for the alpha-beta family, establishing a strong confluence leverage ceiling but not an end-to-end hybrid speed claim.

Authority:

- `research/semantic-quotient/state-identity-unification/SEARCH_METHOD_CAMPAIGN_V1_RESULT.md`
- Actions run `34636074995`, job `103384159647`

## Negamax optimization campaign

The precompiled-DAG campaign established semantic/search-control candidates:

```text
side-to-move-relative value
single-perspective exact TT records
fail-soft exact bounds
native relational tactical closure
W/D/L-native default result contract
```

On the precompiled 4x5 graph, W/D/L + ETC reduced expansions from 15,096 to 10,562. Generic history/killer ordering and child-bound ordering without a real cutoff were rejected. Strong-distance envelopes remain optional strong-mode mechanisms.

The important qualification is now explicit: precompiled-DAG search-control economics are not production authority once child quotient construction has real cost.

Authority:

- `research/semantic-quotient/state-identity-unification/NEGAMAX_OPTIMIZATION_CANDIDATES.md`
- `research/semantic-quotient/state-identity-unification/NEGAMAX_OPTIMIZATION_CAMPAIGN_RESULT.md`
- `research/semantic-quotient/state-identity-unification/evidence/2026-09-11-negamax-optimization-campaign.json`
- broad Actions run `34637521061`, job `103388937756`
- refinement Actions run `34637786848`, job `103389801743`

## Quotient-native kernel campaign

The physical implementation target was strengthened from “packed relational objects” to a genuinely quotient-native machine state:

```text
qID -> supportIndex + p0ResidualClassId + p1ResidualClassId
sideToMove = rank(supportIndex) & 1
```

The timed search kernel now carries numeric quotient IDs only. Residual masks use two `u32` lanes; there is no recursive colored-board state, BigInt residual state, string key, residual object reconstruction, or precompiled game DAG in the timed kernel.

### Exactness

The quotient-native representation reproduced the exact SIU-1 reachable quotient census:

| Geometry | reachable q states |
| --- | ---: |
| 4x3 c3 | 3,735 |
| 4x4 c4 | 34,095 |
| 5x3 c4 | 11,317 |
| 4x5 c4 | 294,593 |

Root and every legal root-action W/D/L matched the independent BSFP oracle. On 4x5 alone, 190,826 own-placement class transitions, 223,828 opponent-block transitions, and 14,158 terminal reductions were checked against the qualified BigInt residual algebra with zero mismatches.

Authority:

- `research/semantic-quotient/state-identity-unification/QUOTIENT_NATIVE_NEGAMAX_RESULT.md`
- `research/semantic-quotient/state-identity-unification/evidence/2026-09-11-quotient-native-negamax.json`
- qualification Actions run `34646025717`, job `103416896894`
- refinement Actions run `34646180590`, job `103417404214`

### Native ETC result supersedes the precompiled default

ETC still reduces proof work, but forcing child quotient construction merely to probe a bound is expensive.

4x5:

```text
no-edge / no-ETC:  15,054 expansions, 18.539 ms, 1,844,704 typed bytes
forcing ETC:       10,530 expansions, 24.471 ms, 3,991,008 typed bytes
```

Forcing ETC reduced expansions by about 30.1% but was about 32.0% slower and created substantially more quotient states/classes. Therefore **speculative quotient construction for ETC is rejected as a current default**.

A cached-edge-only ETC variant avoids speculative state growth and helped the 4x4 control, but its edge-cache/scanning cost still lost on 5x3 and 4x5. ETC is now a conditional physical tuning mechanism, not a structural baseline requirement.

### Per-state quotient-edge cache

The edge cache itself did not earn its cost on the larger control:

```text
4x5 edge-cache/no-ETC: 26.300 ms, 2,106,848 typed bytes
4x5 no-edge/no-ETC:    18.539 ms, 1,844,704 typed bytes
```

So the current larger-control baseline carries no per-state quotient-edge table.

### Current strongest native baseline

```text
quotient-native qID
+ rank-derived side-to-move
+ two-u32 residual substrate
+ lazy exact residual-class transitions
+ quotient-native immediate-win / forced-response / double-threat closure
+ W/D/L-native fail-soft negamax
+ dense exact W/D/L bounds indexed directly by qID
+ no per-state quotient-edge cache
+ no forcing ETC
```

This is the strongest qualified native quotient kernel, not yet a production-performance claim.

## Current next seam

The largest remaining structural waste is now the residual-class transition cache.

On 4x5 the current baseline found 7,470 residual classes, while the dense transition arrays reserve:

```text
8192 class slots × 20 cells × 2 modes = 327,680 entries
populated entries                         = 22,039
occupancy                                 ≈ 6.73%
reserved typed bytes                      = 1,310,720
```

That cache dominates the current typed-memory footprint. The next evidence unit is therefore **compact/sparse exact residual-class transition storage**, preserving exact transition semantics while reducing footprint and improving locality if possible.

After that representation stabilizes:

1. run equal-byte comparison against the physical/incumbent control;
2. compare full-window alpha-beta, PVS/NegaScout, MTD(f), and W/D/L threshold over the same native quotient kernel;
3. test reflection/residual automorphism;
4. add compiled local proof masks and Connect4-specific proof-cost ordering;
5. only then add coarse parallelism;
6. replace ideal BSFP walls with actual BSFP construction/publication/query cost before hybrid speed claims.

## Hard non-claims

- no standard 7x6 production performance claim;
- no equal-byte incumbent speedup claim yet;
- typed-array memory reporting is not complete JavaScript heap accounting;
- no end-to-end hybrid speedup claim;
- no final PVS vs MTD(f) vs threshold driver selection;
- no default ETC claim on the native kernel;
- no safety claim for null-move, futility, razoring, heuristic LMR, or other selective pruning not independently proven exact.
