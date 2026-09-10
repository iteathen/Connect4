# Connect4 Status

**Updated:** 2026-09-10  
**Phase:** Device-owned compact CUDA-BSFP exact through 5x5; native C3 6x5 workload diagnosis is the next physical gate

The active continuation is [next_step.yaml](next_step.yaml). C1 is a real bottom-up compact CUDA-BSFP solver: cofactor, terminal handling, ownership-antichain composition and rank finalization execute on device using two resident rank arenas. Q1 evidence PR #20 records complete all-frontier native agreement for 4x3, 4x4 and 5x5. Empty 7x6 remains unsolved.

Two bounded 6x5 attempts timed out at 180 seconds. With 2,048-candidate tiles, the first 32-node static epoch took about 75.118 seconds. The owner observed approximately 95–100% GPU utilization during the slow interval, so the current problem is not adequately described as launch starvation: both excessive symbolic work and poor quality of the parallel work are active suspects.

## Current exact dependency pair

```text
CUDA-Algorithms: 48ee0aec9acae7776950f03ab52ab1737e598b6e
CUDA-JS:         98e2ebc942c14d63acf4dd82e912dd548c363a05
package:         cuda-js@0.1.0-alpha.20
```

No lower dependency was repinned.

## Native milestones

- **P1 / PR #18:** exact native 4x3 dense qualification passed.
- **B1 / PR #19:** approximately 35.35B exact packed42 subset checks/s on the GTX 1660 Ti.
- **C1 / PR #20:** 4x3, 4x4 and 5x5 complete support-frontier equality passed. The official 5x5 warm solve wall was about 3.569 s; the same-machine CPU reference with qualification observer was about 11.664 s.

The official C1 5x5 run reported 85,934,909 generated GPU pairs and about 2.156B subset checks. This is not evidence that the flat B1 primitive runs at the same rate inside the fused solver; candidate generation, terminal algebra, copying, barriers, duplicate scans and cardinality phases also occupy device time.

## C3 workload diagnostic

C3 is deliberately **not a solver result profile**. It executes one statically selected prefix of the same C1 recurrence and reads observer counters only after that prefix completes.

The low-perturbation observer source is:

```text
468611d9e2f743a6a30a55a2db23cc70a824f988
```

Its portable gate is complete:

```text
verify:        34485057956 — success
bsfp-portable: 34485057959 — Windows/Linux × Node 24.15/26.7 all pass
```

The diagnostic records per-support pair candidates, subset checks, same-cardinality prior-scan iterations, duplicate hits, normalization volume/calls, terminal-vs-aggregate pair work, rank summaries and hot-support skew. The observer repair avoids incrementing a u64 counter on every duplicate-scan comparison; it derives the scan count from the terminating index and accumulates once per candidate.

C3 emits `partial-rank-diagnostic`, has `rootWdl: null`, and the normal result path still refuses an incomplete schedule. A partial epoch therefore cannot look like a 6x5 solve.

## Code-review diagnosis

The present packed normalizer has several measurable inefficiencies:

1. every normalization revisits the candidate interval through 43 cardinality phases;
2. same-cardinality exact duplicate removal performs a serial `prior < i` scan that was previously invisible in metrics;
3. one block owns one support through columns, terminal requirements, tiles and reductions, so a pathological support cannot distribute that semantic work over multiple blocks;
4. generic terminal subtraction may create unnecessary Cartesian work close to terminal ranks.

The first 6x5 epoch reaches the wall well before the middle-rank support-count maximum, which makes raw support count alone an insufficient explanation.

## Winspace inference result

The first concrete inference candidate is now measured rather than hypothetical. `reference/research-prototypes/2026-09-10-bsfp-winspace-inference/double-threat-absorber.mjs` derives exact Win/Loss ownership cones from two **distinct currently playable** completion cells, subtracting the mover's own immediate-win region so first-win behavior remains authoritative.

Research run `34485833438` tested complete 4x3, 4x4, 5x3, 4x5, 5x4 and 5x5 games. It reproduced the maintained aggregate pair counts and every target frontier exactly: zero unsound seeds, zero baseline frontier mismatches and zero absorber frontier mismatches.

For 5x5:

```text
supports with an inferred seed:           6,468 / 7,776
baseline aggregate pair candidates:       81,515,570
absorber aggregate pair candidates:       79,580,610
direct generated-pair reduction:          2.37%
post-combine candidates already proved:   21,671,147 (~26.59% of baseline pairs)
```

This rejects the strongest version of the hypothesis: simple double-threat inference is **not** a sufficient standalone search-space reduction. Its more promising role is as a cheap semantic filter before expensive dominance/dedup normalization. The production predicate can test the already-present local terminal requirement masks directly rather than scan the normalized seed frontier.

The result is preserved in `docs/research/2026-09-10-double-threat-absorber-results.md`. It is research evidence only and is not integrated into C1.

## Next gate

Run one bounded native C3 first-epoch diagnostic on the authorized GTX 1660 Ti using exact Connect4 source `468611d9e2f743a6a30a55a2db23cc70a824f988` through the maintained Q1/bootstrap path. That one datum should select the next intervention:

- duplicate/prior-scan heavy → exact early dedup/cardinality bucketing;
- 43-phase visit heavy → bucket once by popcount;
- terminal-pair heavy → specialized exact terminal subtraction;
- aggregate-pair heavy → broader WSL/CPC/NDC operand reduction;
- normalization-heavy with many exact double-threat hits → double-threat filtering plus dense survivor compaction;
- strongly skewed supports → split one semantic support's physical work across multiple blocks.

Do not spend another full 180-second 6x5 run merely to reconfirm GPU saturation. Do not attempt 7x6 until 6x5 has a bounded completion with cost/resource evidence.

## Non-claims

- no 6x5 CUDA-BSFP completion yet;
- no empty-board standard-7x6 CUDA-BSFP completion;
- no exact strong-distance BSFP result;
- C3 partial-rank evidence is not root W/D/L evidence;
- double-threat inference is not yet a native optimization;
- the incumbent minimax/search lane is unchanged.
