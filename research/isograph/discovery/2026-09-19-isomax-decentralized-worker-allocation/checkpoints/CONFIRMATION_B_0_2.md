# Issue 102 independent confirmation — pass B / instrumented qualification

**Date:** 2026-09-19  
**Research head before write:** `97c644494c1b98597f0e998580340938cfca299b`  
**Measured solver revision:** `1dc4411862a4bf6f11e4ed563f25e1fecc0f3b8b`  
**Actions run:** `35480738389`  
**Artifact:** `10595473139`  
**Correctness run:** `35480738479` — success

Node v26.7.0, AMD EPYC 7763, `availableParallelism=4`.

Exact decisions matched across the full grid. Native WSL correctness qualification passed.

## Four-worker result

### reserve 0

- median wall: **4623.10 ms**
- median result-ready: **4571.56 ms**
- median nodes: **7,085,114**
- median redispatch-idle accumulator: **421.57 ms**
- observed max RSS: **774,062,080 bytes**
- zero-node retirements: 7 / 7 / 9

### reserve 4

- median wall: **4544.19 ms**
- median result-ready: **4488.73 ms**
- median nodes: **6,810,165**
- median redispatch-idle accumulator: **240.42 ms**
- observed max RSS: **698,454,016 bytes**
- zero-node retirements: 98 / 99 / 110

Relative median effect:

- wall: **-1.71%**
- result-ready: **-1.81%**
- nodes: **-3.88%**
- observed max RSS: **-9.77%**

Two of three wall samples beat reserve 0; all three candidate node samples were below their same-pass reserve-0 node sample.

Together with the prior independent pass, the full-reserve four-worker phase has now survived two independent confirmation runs after the initial screen.

## Mechanism measurements

### Manager scan cost is not the primary seam

Across the three roots:

reserve 0 `required()`:
- 762–800 calls;
- 12.59–20.42 ms aggregate scan time.

reserve 4:
- 803–959 calls;
- 24.06–31.88 ms aggregate scan time.

Reserve performs **more** manager scanning yet still improves the qualified four-worker median. Manager readiness traversal is therefore not the cause of the win and is too small to explain the remaining multicore inefficiency.

### Worker resets are not the cause

Worker reset count was **zero in every sample** for both policies.

The win is not an artifact of resetting private state.

### Task-duration distribution

Buckets are:

```text
<1 ms, 1–4 ms, 4–16 ms, 16–64 ms, 64–256 ms, >=256 ms
```

Representative median-sample distributions:

reserve 0:
```text
356, 105, 125, 140, 73, 7
```

reserve 4:
```text
392–532 very-short tasks across samples,
103–123,
121–132,
108–127,
74–76,
6–7
```

The extra reserve work creates many very short task completions, primarily obsolete queued occurrences that retire at entry. The long-task tail remains similar.

### TT / residual observations

Aggregate transition-cache hit/store ratios remain approximately stable per recursive node. No discontinuity suggests a cache-reset explanation.

Reserve 4 begins more tasks with retained worker state present, but the current aggregate counters cannot attribute an individual hit to pre-task retained entries. Exact warm-TT reuse remains QU rather than a proved causal benefit.

Local entry/class growth tracks aggregate recursive work: in the candidate’s lower-node samples, growth is lower too.

## Strengthened conclusion

The broad hypothesis remains rejected:

> arbitrary small reserve admission is not a win.

The surviving result is narrower:

> **At four workers, admitting one additional worker-count of globally ready portable task occurrences (`W+W` outstanding) can improve both end-to-end time and total recursive work, even though it also increases cheap queued-obsolescence retirement.**

This is not explained by manager scan savings or worker resets. The evidence supports a scheduling-order effect: earlier availability changes which admissible speculative dependencies execute and which branches close/retire first.

Thus:

> **ready work is semantically fungible across workers but economically non-fungible across admission order.**

## Flexible-capacity consequence

The benchmark runner exposes four logical execution slots. Four worker isolates plus the manager is an oversubscribed stress configuration; current default worker selection would choose three workers.

Before any default reserve policy is promoted, test the capacity-aligned phase:

```text
3 workers / reserve 0
vs
3 workers / reserve 3
```

under the same corpus and instrumentation.

If 3/full-reserve also qualifies, a worker-count-dependent full-reserve phase becomes plausible.

If it fails, retain the 4/full-reserve result as a stress-regime candidate only.

## Affinity consequence

Because assignment timing now qualifies in one bounded phase, #91 soft affinity is eligible for the next isolated combination test:

```text
qualified eligible reservoir
+ prefer warm continuation worker when immediately available
+ otherwise dispatch to any available worker
```

No waiting for affinity is permitted in the first test.
