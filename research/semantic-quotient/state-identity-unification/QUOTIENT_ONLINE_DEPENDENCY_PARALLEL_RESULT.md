# Online dependency-aware quotient Negamax — result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Solver authority:** `docs/specs/C4-0010-quotient-native-negamax-v1.md`  
**Status:** exact positive bounded result; standard-7x6 presearch profiling is next

## Question

Does dependency-aware parallel Negamax still preserve useful alpha-beta proof behavior when the coordinator and workers have independent local q/class IDs and share proofs only through exact semantic-content identity?

## Architecture

The coordinator and every search worker own independent local slot64 quotient kernels.

The coordinator explores only the shallow dependency tree. It records one representative move path for each locally deduplicated q state.

At a split edge it submits:

```text
representative path
+ alpha
+ beta
```

to a persistent worker. The worker replays the path into its own quotient kernel and executes the unified Negamax engine with that exact proof window.

Coordinator and workers share one semantic proof space keyed by:

```text
supportIndex
+ exact sorted P0 residual term sequence
+ exact sorted P1 residual term sequence
```

Local qIDs/class IDs may differ. Hashes remain addressing aids only; exact descriptor comparison defines equality.

No complete global qID graph is required by recursive search and there is no per-node maintenance RPC.

## Qualification

Workflow run: `34664719598`  
Job: `103474220551`  
Conclusion: **success**

Every tested configuration reproduced:

```text
root W/D/L: 0
root actions: [0, 0, 0, 0]
```

Tested split depths: `2, 3, 4`  
Tested workers: `1, 2, 3, 4`  
Measured repetitions: `5`

## Online single-thread baseline

```text
median elapsed: 23.179975 ms
expanded:       15,054
calls:          24,882
```

## Dependency-aware results

| workers | depth | median ms | median expanded |
| ---: | ---: | ---: | ---: |
| 1 | 2 | 23.407377 | **15,054** |
| 1 | 3 | 23.117642 | **15,054** |
| 1 | 4 | 30.139563 | 16,299 |
| 2 | 2 | 33.760588 | 15,382 |
| 2 | 3 | 19.346459 | 15,651 |
| 2 | 4 | 22.738962 | 17,053 |
| 3 | 2 | 27.231850 | 15,484 |
| 3 | 3 | **18.801097** | 15,595 |
| 3 | 4 | 20.985654 | 17,265 |
| 4 | 2 | 39.674725 | 15,235 |
| 4 | 3 | 21.283185 | 15,755 |
| 4 | 4 | 23.364403 | 17,217 |

All bounded configurations again reported zero full-window re-searches after scout obligations.

## Main result

Depth 2 and depth 3 with one worker both preserve **exactly the baseline 15,054 expansions**.

That proves the dependency-aware scheduler is not intrinsically adding proof work when concurrency is removed, even though the coordinator and worker have independent local quotient identities.

With multiple workers, duplicate proof work remains small compared with the rejected static frontier design. For example:

```text
online baseline:            15,054 expansions
3 workers / depth 3:        15,595 expansions  (+3.6%)
static full-window frontier: ~65,000 expansions
```

The bounded wall-clock winner on this hosted run was 3 workers / depth 3 at `18.801097 ms` median versus `23.179975 ms` baseline. This timing is useful workload evidence, not a universal speed ratio.

## Shallow coordinator size

The coordinator remained very small:

```text
depth 2: 125 q states / 178 residual classes
depth 3: 427 q states / 674 residual classes
depth 4: 922 q states / 1,393 residual classes
```

This supports the intended architecture in which shallow planning/dedup stays maintenance-side while deep recursive workers remain local and communicate only coarse proof obligations.

## Interpretation

The architecture now satisfies the core C4-0010 parallel-search shape:

```text
local shallow quotient planning
  -> preferred child establishes bound
  -> dependency-qualified scout work
  -> worker-local deep quotient search
  -> exact semantic shared proof reuse
```

The next useful question is no longer whether the worker architecture works on 4x5. It is how standard 7x6 root structure changes split-depth and worker-count economics.

## Next work

Profile standard 7x6 shallow presearch across candidate depths before attempting the empty-root solve.

Measure at least:

- unique quotient frontier width;
- transposition/fan-in rate;
- tactical/forced-response closure;
- bounded estimated task-cost distribution and skew;
- idealized worker load balance at candidate worker counts;
- coordinator state/class/memory growth;
- retained presearch construction cost.

Use that evidence together with machine search-capacity calibration to choose the initial worker count and split depth. Do not promote the bounded 4x5 optimum as a standard-7x6 constant.
