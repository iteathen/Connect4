# Connect4 Status

**Updated:** 2026-09-10
**Phase:** Compact device-owned BSFP native-qualified through 5x5; 6x5 cost diagnosis

The current continuation is recorded in [next_step.yaml](next_step.yaml) and
[the compact CUDA research record](docs/research/2026-09-10-compact-cuda-vertical-slice.md).
C1 computes cofactor, terminal handling, antichain composition and rank finalization
on device, with two resident ranks. [Q1 evidence PR #20](https://github.com/iteathen/Connect4/pull/20) records passing
4x3, 4x4 and 5x5 complete frontier comparisons; 6x5 timed out twice at 180 seconds. Empty 7x6 remains unsolved here.
P2's newer owner-authored hybrid profile is preserved as a separate control.
The historical P1/portable milestones below retain their original scope.

## Product role

Connect4 is the product-owned Connect Four exact-solver laboratory and benchmark/validation repository. It intentionally preserves two separate solver lanes:

1. `components/incumbent/` — incumbent minimax/alpha-beta/search baseline;
2. `components/bsfp/` — CUDA-BSFP backward symbolic fixed-point solving.

The lanes share Connect4 domain/oracle authority but do not share solver semantics by convenience.

## Active development

```text
branch: feature/cuda-bsfp
PR:     #14 (draft)
base:   protected main@de47d43f4f4133a68973d0876a402531ef5735da
```

The recovered 2026-09-09 CPC/WSL-625/NDC/BSFP research/evidence packet is preserved on this branch.

## Formal BSFP authority

- `C4-0006-control-parity-and-winspace-v1.md` — CPC + WSL-625 structural/domain mathematics;
- `C4-0007-nested-dependency-closure-v1.md` — NDC proof/dependency/fixed-point semantics;
- `C4-0008-bsfp-exact-solver-v1.md` — exact BSFP W/D/L semantics;
- `C4-0009-bsfp-cuda-execution-profile-v1.md` — CUDA realization and CUDA-Algorithms/CUDA-JS seam;
- `profiles/C4-0009-P1-4x3-cuda-bsfp-v0.md` — first 4x3 CUDA correctness profile;
- `profiles/C4-0009-Q1-benchmark-qualification-v1.md` — benchmark qualification, timeout/VRAM safety, crash evidence and repository publication.

C4-0006..0008 are branch-local Candidate semantic specs. C4-0009/P1/Q1 remain Working until required physical evidence closes their current gates. None is Accepted protected-main authority yet.

## First maintained BSFP result

The CUDA-free direct symbolic support-lattice reference is qualified for 4x3 connect-3:

```text
support skeletons:              256
rank range:                     0..12
winning lines:                  14
empty-root W/D/L:               Win
reachable nonterminal states:   4,631
legal edges:                    11,818
W/D/L mismatches:               0
```

The independent explicit-state oracle exists only in qualification/tests; recursive search is not the maintained BSFP solver path.

## CUDA-Algorithms seam

Current exact upstream pair:

```text
CUDA-Algorithms: 48ee0aec9acae7776950f03ab52ab1737e598b6e
branch:          feature/ranked-closure
PR:              #8 (draft)
CUDA-JS:         98e2ebc942c14d63acf4dd82e912dd548c363a05
package:         cuda-js@0.1.0-alpha.20
```

CUDA-Algorithms owns only the reusable implicit ranked-derived-activation subprofile and lower generic sequence/workset behavior. Connect4 retains CPC/WSL/NDC/WDL/proof/equality/dominance/terminal semantics.

The upstream typed composition path is portable-qualified with two materially different non-BSFP consumer shapes. CUDA-JS was not modified.

## P1 CUDA slices

P1-A maps Connect4 support predecessors onto the CUDA-Algorithms typed `(sourceIndex, emissionLane) -> targetIndex|INVALID` activation seam.

P1-B is the complete dense 4x3 Device-JS W/D/L recurrence:

```text
support skeletons:     256
ownership valuations:  4,096
table elements:         1,048,576
table bytes:            4,194,304 (4 MiB)
prepared rank kernels:  13
rank order:             12 -> 0
```

The dense profile is deliberately redundant correctness machinery, not the intended standard-7x6 representation.

Final portable CI for the frozen first profile passed on Connect4 head `811cc0b8e1078f59be85da142de059d8d6b74784`:

```text
verify:             34439253107 success
bsfp-portable:      34439253134 success
strength-evidence:  34439253157 success
benchmark-evidence: 34439253187 success
```

## Q1 benchmark qualifier

The maintained entry point is:

```text
npm run bench:bsfp:qualify
```

which expands to the explicitly armed:

```text
node tools/cuda-bsfp-qualifier.mjs --qualify-benchmark
```

Q1 provides outer-process supervision, fsync'd event journaling, interrupted-run recovery, anonymous machine/system/GPU identity, conservative profile-owned VRAM admission, current free-VRAM gating, emergency low-VRAM termination, case/run timeouts, process-tree cleanup, the default 4x3-through-9x7 geometry ladder, explicit failure/boundary statuses, stdout/stderr and traceback capture, sanitized bounded repository logs, a SHA-256 manifest, and immutable evidence-branch/PR publication.

Default VRAM policy is `min(95% free, free-256 MiB, 12288 MiB)` with a 256 MiB emergency free-VRAM floor. Default timeouts are 120 seconds per case and 900 seconds per run.

Official publication requires `CUDA_BSFP_GITHUB_TOKEN`, `GITHUB_TOKEN`, or `GH_TOKEN`. Repository tokens are stripped from solver-child environments. Official P1 evidence additionally requires a clean discoverable Connect4 Git revision and the exact qualified CUDA-Algorithms/CUDA-JS revisions.

Generated reports live under `docs/evidence/cuda-bsfp/qualification/<run-id>/` on `evidence/cuda-bsfp-q1/<run-id>` and arrive through an evidence PR rather than a direct protected-main push. Publication is retry-safe if a crash happens after branch/PR creation.

## Current geometry behavior

The Q1 ladder is broader than P1 by design. Current P1 executes only 4x3 connect-3. Larger ladder cases are retained as `unsupported-profile` with hypothetical dense-scaling context where useful.

Future compact WSL/NDC/CPC/antichain CUDA-BSFP representations register as new Q1 profiles with their own geometry support and conservative device-memory bound. The qualifier/report schema does not change merely because the solver representation changes.

## Portable Q1 validation

Portable tests cover explicit arming, geometry parsing/ladder breadth, simultaneous VRAM constraints, BigInt scaling, child success and timeout containment, log sanitization/truncation with traceback-tail retention, interrupted/local-only recovery, GitHub evidence publication, and idempotent publication resume. A dry-run exercises orchestration/report finalization without GPU allocation or repository publication.

## Next gate

Run an official Q1 qualification on an authorized NVIDIA host. For P1, native success still requires root Win, 4,631 nonterminal states, 11,818 legal edges, zero mismatches, and the ranked-activation predecessor/duplicate/capacity/rank-failure checks. The complete report must be published back to the repository.

After native correctness, do not scale the dense table toward standard 7x6. Move to compact WSL/NDC/CPC + dominance/antichain/exact-canonicalization representations and register each serious candidate in Q1. Add new CUDA-Algorithms mechanisms only when they survive the deletion test and have materially different consumer evidence.

## Non-claims

- no native NVIDIA CUDA-BSFP numerical correctness result yet;
- no CUDA-BSFP GPU performance result yet;
- no empty-board standard-7x6 CUDA-BSFP completion;
- no exact strong-distance BSFP result;
- current P1 does not execute the larger Q1 ladder;
- the dense 4 MiB profile is not a 7x6 representation;
- CUDA-Algorithms SPEC-0004 remains Working Draft;
- C4-0006..0009/P1/Q1 are not Accepted protected-main authority;
- the incumbent minimax/search lane is not replaced or modified.
