# MQ5 semantic-residual alpha-beta — frozen-anchor results

**Status:** research qualification. Exact scores and proof-work effects are established on the two frozen anchors. This is not yet a maintained-solver promotion or an equal-total-memory benchmark.

## Objective

MQ5 asks whether the solver-neutral residual state discovered by the semantic-quotient program improves **alpha-beta proof work** when search policy is held as constant as practical.

Candidate state:

```text
support / column heights
+ minimal current-player residual winning requirements
+ minimal opponent residual winning requirements
```

The fixed-width control is the 512K-entry compact decision-state + intrinsic-rank-bank solver.

Held aligned:

- exact distance-sensitive score;
- null-window convergence;
- center-first tie ordering;
- immediate threat and forced-block semantics;
- winning-cell-count move ordering;
- decision-only TT admission;
- exact16 rank-bank layout;
- 512K TT slots.

## Structural result

The factored residual implementation and the later WSL-625 representation produce the same semantic alpha-beta node counts on both anchors:

| Anchor | Score | Baseline nodes | Semantic nodes | Node ratio | Reduction |
| --- | ---: | ---: | ---: | ---: | ---: |
| `663152175` | -4 | 1,014,754 | 786,581 | 0.775145 | 22.48% |
| `41267575` | +3 | 5,261,422 | 4,138,812 | 0.786634 | 21.34% |

TT writes also fall materially:

```text
loss anchor write ratio: 0.759589
win anchor write ratio:  0.771847
```

TT hits do not fall with the reduced proof graph:

```text
loss anchor hit ratio: 1.057512
win anchor hit ratio:  1.013107
```

This repeated win/loss result is the main MQ5 finding so far: **semantic residual state reduces exact alpha-beta proof work by about 21–22.5% on both frozen workloads.**

## Representation progression

### 1. First lazy residual arena

The first prototype proved the node reduction but used whole-state string keys and dynamic residual mask arrays. On the loss anchor it was about 36x slower than the fixed-width baseline despite searching only 77.6% as many nodes.

That established that the semantic direction and the implementation cost had to be evaluated separately.

### 2. Factored side-state arena

Commit/run lineage:

```text
source:       6c10887db22a53f0c51d946cc8b3af8831aad8b5
workflow:     34572020977
job:          103175978744
```

Factoring each player's residual antichain into separately interned side states preserved the search tree while substantially reducing duplicate whole-state materialization.

The loss-anchor elapsed factor fell to roughly 20x; the win anchor remained about 25x. The remaining state payload was still represented as JS arrays of native two-word cell masks with string interning.

### 3. WSL-625 u16 requirement IDs

The next implementation maps every live residual requirement to the fixed standard-7x6 universe of 625 nonempty winning-line subsets and stores canonical side antichains as `Uint16` IDs.

First attempt:

```text
source:       29249774e779c12b458323bb27e905fd595fc761
workflow:     34572145083
job:          103176361012
result:       FAIL — loss anchor returned 0 instead of -4
```

Root cause: the implementation confused **42 playable cells** with the native solver's **49-bit sentinel-stride coordinate domain**. Native playable cells occupy bit indices through 47, but the first WSL transition table was built for indices `0..41` only.

Repair/guard:

```text
repair:       afac9edc771f54ee976fe3bc359185878849e451
guard:        9fda600ecd5ca6be2b43409a73ce1dd1d3e4940c
```

The corrected table covers all 49 native bit slots and explicitly guards the boundary.

Qualified run:

```text
workflow:     34572527527
job:          103177554442
runtime:      Ubuntu 24.04 / Node 26.7.0
```

Exact scores and the previous semantic node counts were restored on both anchors.

### WSL-625 measured effect

Loss anchor:

```text
baseline:       161.9 ms
semantic:      1815.4 ms
elapsed ratio:   11.21x
side states:   494,512
requirement IDs stored: 4,064,038
requirement payload:    8,128,076 B
```

Win anchor:

```text
baseline:       706.6 ms
semantic:     10886.3 ms
elapsed ratio:   15.41x
side states: 2,028,848
requirement IDs stored: 18,574,406
requirement payload:     37,148,812 B
```

Compared with the factored two-word goal representation, WSL-625 cuts the residual requirement payload by 4x and roughly halves the remaining wall-time penalty while preserving the exact same semantic search tree.

## Current bottleneck

WSL-625 shows that requirement payload width is no longer the central problem.

The hot implementation still uses JS `Map` objects for:

- exact side-state hash buckets;
- mover transition cache;
- blocker transition cache;
- exact whole-state interning;

and uses a BigInt tuple as the whole-state map key.

The win anchor constructs approximately:

```text
side states:                   2,028,848
whole states:                  2,198,870
mover transition cache:        2,687,446 entries
blocker transition cache:      2,898,179 entries
whole-state prepare calls:    14,441,869
```

The transition caches are valuable—the number of cache entries is far below the number of prepare calls—but generic JS object/hash machinery is now the obvious implementation bottleneck.

## Next experiment

Keep the residual semantics and alpha-beta policy unchanged.

Replace generic JS identity/storage machinery with exact typed fixed-width structures:

1. exact open-address side-state interning over the u16 requirement pool;
2. exact open-address `(height,currentRef,opponentRef)` whole-state interning with no BigInt key;
3. exact typed sparse transition caches for `(sideRef,cell)`;
4. retain full-record equality checks—hash equality alone must never establish semantic identity.

First acceptance gate:

```text
loss semantic nodes == 786,581
win semantic nodes  == 4,138,812
scores               == -4 / +3
```

If those remain invariant, measure wall time and memory before attempting further search-policy changes.

Durable compact evidence:

```text
docs/research/evidence/2026-09-11-minimax-mq5-semantic-residual-anchors.json
```
