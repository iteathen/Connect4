# OQS R5 widened flat-transfer qualification — 2026-09-10

## Scope

Research-only continuation of the R3/R4 residual-class transfer line. This run widened exact flat-transfer qualification and profiled the construction phases that precede the compact runtime artifact. It does **not** claim CUDA OQS, a standard-7x6 solve, or native GPU performance.

Authority/evidence identity:

- branch: `research/zdd-transfer-20260910`
- commit: `0dd21bd2d59d8a28a0c794666f0d2ded00b3ab0f`
- GitHub Actions run: `34538774305`
- result kind: `connect4-bsfp-r5-widened-flat-transfer-qualification`
- result: **pass**

Support selection preserved the R1 rule: top 24 supports by C1 boundary-record count plus four fixed geometric anchors, deduplicated. The larger 5x5 case used four deterministic adversarial supports selected from exact R1 profiles rather than serially compiling all 28 hot supports.

## Exact widened results

| Geometry / selection | Supports | Total dense states | Transition entries | Runtime artifact bytes | Max dense states | Max flat slots | Max history classes | Build-layer share |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 4x5 c4 / full R1 hot set | 28 | 133,833 | 210,294 | 419,758 | 4,096 | 4,096 | 7 | 91.45% |
| 5x4 c4 / full R1 hot set | 28 | 188,324 | 288,652 | 578,550 | 4,096 | 8,192 | 11 | 95.17% |
| 5x5 c4 / adversarial 4 | 4 | 165,608 | 220,744 | 442,064 | 9,170 | 32,768 | 26 | 99.37% |

All three widened cases had:

- zero semantic mismatches;
- zero serialization mismatches;
- no capacity failure;
- minimum target coverage = 1;
- maximum introduced ownership width = 4;
- maximum transition fanout = 16;
- 16-bit target IDs remained sufficient for every measured layer.

The flat runtime artifact remained approximately half the size of a uniform-u32 target representation in the widened cases.

## 5x5 adversarial supports

The exact selected supports and R4-compatible aggregate checkpoints were:

| Support | Heights | Selection reason | Total dense states | Max dense states | Transition entries | Runtime bytes | `buildLayer` ms |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 4426 | `[4,5,2,2,3]` | max history classes + max mean history | 16,736 | 1,603 | 22,598 | 45,340 | 16,200.00 |
| 4743 | `[3,4,5,3,3]` | max boundary records | 40,035 | 3,985 | 52,129 | 104,402 | 103,636.33 |
| 6351 | `[3,2,2,5,4]` | distinct high-risk profile | 21,872 | 2,107 | 28,444 | 57,032 | 27,055.91 |
| 6465 | `[3,3,5,5,4]` | widest R1 worst-cut crossing | 86,965 | 9,170 | 117,573 | 235,290 | 218,607.27 |

Support 6465 is the strongest measured construction-cost stressor in this run. Its final runtime artifact is only 235,290 bytes despite more than 218 seconds being spent independently rebuilding semantic layers in JavaScript.

## Phase diagnosis

Measured aggregate phase times:

### 4x5 hot set

- `buildLayer`: 11,985.84 ms
- dense-ID compilation: 219.15 ms
- transition compilation: 898.83 ms
- flattening: 2.28 ms

### 5x4 hot set

- `buildLayer`: 30,441.65 ms
- dense-ID compilation: 263.63 ms
- transition compilation: 1,279.74 ms
- flattening: 1.38 ms

### 5x5 adversarial four

- `buildLayer`: 365,499.51 ms
- dense-ID compilation: 244.88 ms
- transition compilation: 2,087.21 ms
- flattening: 0.74 ms

Therefore the measured OQS bottleneck is not the flat representation. It is the reference construction method that independently reconstructs each cut by cofactors over forgotten-history assignments.

## Decision

Preserve the current `buildLayer` implementation as an exact reference/oracle path. Do not optimize final table flattening first.

The next production-oriented OQS candidate should exploit the R3/R5 transition-closure result directly:

1. seed the exact residual pair once;
2. advance one line cut at a time from the previous exact quotient;
3. branch only on cells whose first line incidence occurs at that step (`<= connect`, therefore fanout `<= 16` for connect-4);
4. canonicalize/deduplicate resulting `(crossing ownership, residual pair)` states;
5. emit layer-local dense IDs and the flat transition table;
6. use the independent `buildLayer` path only for qualification/sampling.

That removes repeated forgotten-history reconstruction from the synthesis path. The remaining candidate generation, antichain normalization, key production, ordering, exact adjacent equality, boundary selection, and state-ID assignment are the intended CUDA OQS targets.
