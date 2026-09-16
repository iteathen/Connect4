# Incumbent TT capacity-pressure sweep — replacement policy is not the current performance seam

**Date:** 2026-09-15  
**Research direction / structural architecture / invariant-first program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT  
**Branch:** `research/terminal-frontier-horizon-exact`  
**PR:** #45 — `research: exact decisive frontier before horizon evaluation`

## Status

**Diagnostic result: default incumbent TT capacity is already beyond the search-work knee.**

Do not spend the next optimization cycle adding structural retention/replacement policy to the incumbent two-slot TT merely because replacements occur. At the accepted structural-order baseline, increasing capacity above 262,144 positions drives replacements toward zero but does not reduce explored search work.

This is a negative-control result about **capacity/replacement leverage**, not a claim that TT lookup cost, key aliasing, or shared semantic-TT contention are solved.

## Why this diagnostic came first

The optimization campaign had identified TT collision/retention economics as a high-leverage candidate, but the mechanisms must remain separate:

```text
exact-key aliasing
bucket/probe cost
capacity/replacement eviction
cross-worker/shared-table contention
```

The incumbent TT is local to one `IncumbentSearchEngine`. It uses a two-slot bucket, exact `(hashLo, hashHi, sideToMove)` comparison, generation/depth replacement, and perspective-specific score/best-move payloads.

Therefore:

- bucket collisions are safe lookup collisions, not key equality;
- true 64-bit Zobrist aliasing is a separate theoretical exact-key issue and is not measured by replacement count;
- cross-worker contention does not exist in this incumbent TT path;
- shared semantic-TT contention belongs to the quotient/shared-TT lane instead.

Before inventing a structural victim priority, the first question was simply whether capacity eviction currently changes the tree enough to matter.

## Experiment

Temporary workflow commit:

`ddf376e15151ddfc8b87141c3a580e111a44c5cd`

GitHub Actions run:

`35001590140`

Artifact:

`10409533094`

Runtime:

`Node v26.7.0`, Ubuntu 24.04 hosted runner.

The accepted incumbent source was unchanged. The existing benchmark ran at six TT capacities:

```text
8,192
32,768
131,072
262,144   // default/control
524,288
1,048,576
```

Fixed-workload repetitions and wall-depth repetitions were both set to 3. Hosted wall time is secondary evidence; deterministic search counters are the authority for this diagnostic.

All capacities preserved the same decision checksum in both persistent and reset workloads.

## Persistent reroot workload

| TT capacity | Nodes | Eval calls | TT probes | Position hits | Score hits | Bound cutoffs | Stores | Replacements | Node delta vs 262k |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 8,192 | 403,983 | 208,878 | 188,271 | 89,526 | 28,482 | 22,413 | 163,083 | 74,256 | +1.929% |
| 32,768 | 397,344 | 205,161 | 185,412 | 96,507 | 27,822 | 21,918 | 160,854 | 21,765 | +0.254% |
| 131,072 | 396,315 | 204,717 | 184,824 | 97,026 | 27,675 | 21,789 | 160,407 | 2,490 | -0.006% |
| 262,144 | 396,339 | 204,723 | 184,842 | 97,116 | 27,681 | 21,792 | 160,419 | 672 | control |
| 524,288 | 396,339 | 204,723 | 184,842 | 97,131 | 27,681 | 21,792 | 160,419 | 168 | 0.000% |
| 1,048,576 | 396,339 | 204,723 | 184,842 | 97,131 | 27,681 | 21,792 | 160,419 | 30 | 0.000% |

The meaningful boundary is obvious:

```text
131k -> 262k -> 524k -> 1M
search work is already flat.
```

Replacement count is not predictive of search-work cost in this region:

```text
672 -> 168 -> 30 replacements
```

with exactly the same nodes/evaluator calls from 262k upward.

Even 32k, with 21,765 replacements, costs only about 0.25% extra nodes on this workload. A severe search-work penalty appears only much farther down at 8k.

## Reset-each-root workload

| TT capacity | Nodes | Eval calls | TT probes | Position hits | Score hits | Bound cutoffs | Stores | Replacements | Node delta vs 262k |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 8,192 | 479,904 | 251,622 | 219,888 | 85,431 | 32,097 | 25,290 | 191,592 | 18,657 | +0.640% |
| 32,768 | 476,937 | 249,843 | 218,736 | 88,155 | 32,235 | 25,251 | 190,446 | 1,815 | +0.018% |
| 131,072 | 476,844 | 249,798 | 218,685 | 88,383 | 32,214 | 25,227 | 190,419 | 168 | -0.001% |
| 262,144 | 476,850 | 249,801 | 218,688 | 88,404 | 32,217 | 25,230 | 190,419 | 33 | control |
| 524,288 | 476,850 | 249,801 | 218,688 | 88,407 | 32,217 | 25,230 | 190,419 | 9 | 0.000% |
| 1,048,576 | 476,850 | 249,801 | 218,688 | 88,410 | 32,217 | 25,230 | 190,419 | 0 | 0.000% |

The reset workload is even less sensitive. Eliminating all observed replacements at 1M changes no search work relative to the default 262k table.

## Timing evidence

Hosted timings were not monotone with capacity and are therefore not used to choose a winner. For example, the smallest table sometimes appeared faster despite doing more work, while 1M appeared slower despite identical work. This is consistent with the known hosted-runner noise plus memory/cache effects and reinforces the decision to use deterministic work counters as the primary capacity-pressure diagnostic.

A dedicated paired timing experiment would be required before changing capacity for wall-time/cache reasons alone.

## Interpretation

### Capacity/replacement eviction

At the default 262k capacity, **capacity pressure is not a material search-work bottleneck** for the current benchmark distribution.

The present replacement policy may not be globally optimal, but a smarter structural victim selector has little opportunity to improve the explored tree when making the table 4x larger produces zero work reduction.

Do not infer that every replacement is useless; infer only that the aggregate retained information is already sufficient for this workload.

### Bucket/probe cost

Not settled.

The two-slot `find()` always checks the first slot and, on first-slot failure, may inspect the second. Capacity changes alter bucket count and occupancy, but this sweep did not count first-slot misses, second-slot hits, or second-slot misses. If TT hot-path instruction cost later becomes the active seam, instrument those lookup-path categories directly rather than using replacement count as a proxy.

### Exact key aliasing

Not measured.

The table treats equal `(hashLo,hashHi,turn)` as the same position. Detecting a true 64-bit Zobrist collision requires an independent physical/state identity oracle in a qualification/debug path. Bucket collisions are not key aliasing.

### Shared/cross-worker contention

Not applicable to this incumbent table. Any such study belongs to the shared semantic TT and must be evaluated in that owner.

## Disposition

Retain the default TT implementation and capacity for now.

Do **not** add structural residual/singleton/control metadata to replacement priority at this point. The exact descriptors discovered during the ordering campaign may still be useful for another consumer, but current incumbent capacity/replacement economics do not justify paying their lookup/maintenance cost here.

The next stronger optimization target is Branch Manager/work scheduling, where structural facts such as fan-in/proof externality, unresolved interval width, certificate deficit, response-resource pressure, and deadline slack are closer to the consumer's actual objective.

If incumbent TT work is reopened later, start with direct probe-path instrumentation or a deliberately memory-focused 131k-vs-262k paired experiment—not structural retention policy.
