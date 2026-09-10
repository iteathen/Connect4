# Connect4 Status

**Updated:** 2026-09-10  
**Phase:** CUDA-BSFP compact exact closure through 5x5; 6x5 cause isolation and reducer-quality qualification

## Active lane

```text
branch: feature/cuda-bsfp
PR:     #14 (draft)
base:   main@de47d43f4f4133a68973d0876a402531ef5735da
goal:   exact empty-board 7x6 connect-4 W/D/L, extremely fast on CUDA
method: backward symbolic fixed-point, not move-tree search
```

Connect4 keeps the incumbent minimax/alpha-beta lane separate under `components/incumbent/`. CUDA-BSFP is under `components/bsfp/` and must not be converted into recursive search.

## Exact dependency pair

```text
CUDA-Algorithms: 48ee0aec9acae7776950f03ab52ab1737e598b6e
CUDA-JS:         98e2ebc942c14d63acf4dd82e912dd548c363a05
package:         cuda-js@0.1.0-alpha.20
```

No lower repository change is currently required.

## Native milestones

- P1 / evidence PR #18: first physical CUDA-BSFP correctness slice on GTX 1660 Ti.
- B1 / evidence PR #19: about 35.35 billion exact packed42 subset checks/s; raw two-u32 subset testing is not the first wall.
- C1 / evidence PR #20: complete device-owned compact recurrence, exact all-frontier agreement on 4x3, 4x4 and 5x5.
- Official C1 5x5: about 3.30 s submit/wait and 3.57 s warm solve wall versus about 11.66 s for the same-machine CPU reference including its qualification observer.

## 6x5 wall

Two bounded C1 6x5 attempts timed out at 180 seconds. With a 2,048-candidate tile, the first 32-node static epoch took about 75.118 seconds. The owner observed roughly 95–100% GPU utilization during the expensive interval.

Current suspects are complete 43-phase candidate rescans, quadratic same-cardinality duplicate scans, one-block-per-support serialization, generic terminal subtraction, and genuinely excessive aggregate pair volume requiring stronger winspace/CPC/NDC inference.

## C3 workload diagnostic

C3 is a one-static-epoch result-neutral 6x5 profile. It records pair class, subset checks, prior-scan iterations, duplicate hits, normalization volume/calls, rank summaries and hot-support skew. It is explicitly `partial-rank-diagnostic` and cannot publish root W/D/L.

Exact low-perturbation native source:

```text
468611d9e2f743a6a30a55a2db23cc70a824f988
```

Portable qualification passed Windows Server 2025 and Ubuntu 24.04 under Node 24.15.0 and 26.7.0. A native C3 datum is still required.

## Exact winspace inference result

The distinct-playable double-threat absorber remains research-only. Complete-game controls through 5x5 had zero unsound seeds and zero frontier mismatches.

On 5x5:

```text
baseline aggregate pairs:       81,515,570
with absorber:                  79,580,610
direct pair reduction:               2.37%
post-combine pairs already proved: 21,671,147 (~26.59%)
```

Disposition: insufficient as a standalone pair-space breakthrough, but promising as a cheap semantic filter before expensive dominance/dedup normalization.

## B2 cardinality-bucketed normalizer

C1/C3 still use the legacy reducer. B2 is a separate exact primitive A/B profile.

The bucketed reducer replaces 43 complete candidate rescans with count -> prefix -> scatter -> exact per-bucket processing. It preserves cardinality order, exact subset dominance, exact equality deduplication, invalid-candidate handling and capacity-fail-closed behavior.

B2 now contains two fixed workload families so a result cannot be optimized to a single favorable shape:

1. equal-cardinality duplicate stress;
2. deterministic mixed-cardinality control with exact host-derived minimal/maximal survivor sets.

Each family runs legacy and bucketed native children independently, for four exact A/B steps total.

Current exact native B2 source:

```text
7298bbbaa5d761b0dd163f68aa00ba9baf9cb1e5
```

Fixed physical size:

```text
segments:     1,024
segment size: 512
candidates:   524,288 per child
block size:   256
```

Portable qualification at that exact source:

```text
verify:        34494972124 success
bsfp-portable: 34494972278 success
matrix:        Windows/Ubuntu x Node 24.15/26.7 all pass
mixed fixture: compile/submit pass on all four lanes
B2 dry-run:    pass on all four lanes
B2 bootstrap:  pass on all four lanes
```

This proves representability/composition only. A native same-GPU A/B must show a material gain on the mixed control, not merely the one-bucket stress case, before C1 integration is allowed.

## Next gate

Two independent native measurements are ready:

1. **C3**, exact source `468611d9...`: classify the first 6x5 epoch by actual work source.
2. **B2**, exact source `7298bb...`: compare legacy versus bucketed normalization on both workload families.

After those measurements, select the smallest intervention supported by evidence. If bucketed normalization wins, integrate it into C1 and requalify every support frontier for 4x3, 4x4 and 5x5 before retrying 6x5. If it does not win, preserve the negative result and use C3 to choose terminal specialization, heavy-support decomposition, semantic filtering, or broader WSL/CPC/NDC operand reduction.

Empty 7x6 remains unsolved by complete BSFP closure. No exact-distance result or protected-main merge is claimed.
