# C3 6x5 compact-work diagnostic implementation

**Date:** 2026-09-10  
**Branch:** `feature/cuda-bsfp`  
**Implementation commit:** `878b31840d4863ad941970c502a77995c8a0070b`  
**Status:** portable-qualified; one bounded native datum required next.

## Why this exists

The owner observed approximately 95–100% GPU utilization during the slow 6x5 CUDA-BSFP test. The prior first 32-node epoch took about 75.118 seconds. This makes another uninstrumented 180-second attempt low-information: the device is busy, but the current evidence cannot distinguish useful subset work from duplicate scans, repeated 43-phase candidate visits, terminal algebra, or a few pathological supports.

C3 turns that first epoch into a falsification instrument. It does not change the C1 recurrence and it cannot produce a root-result claim.

## Implementation

`compact-ownership-42-program.mjs` now carries 12 u64 observer lanes per support:

1. generated Cartesian pair candidates;
2. retained-frontier subset checks;
3. same-cardinality `prior < i` scan iterations;
4. exact duplicate hits;
5. records presented to normalization, including retained carry;
6. normalization calls;
7. terminal-subtraction pair candidates;
8. aggregate-move-intersection pair candidates;
9. cofactor normalization input records;
10. terminal-intersection normalization input records;
11. terminal-union normalization input records;
12. aggregate normalization input records.

The host derives `43 * normalizationInputRecords` as the exact number of outer candidate visits imposed by the current cardinality-phase structure. It also aggregates by support rank, records statically scheduled supports per rank, and reports the 16 supports with the largest combined `subsetChecks + priorScans + 43*normalizationInputRecords` observer score.

The previous subset-check counter meaning is preserved. The newly counted same-cardinality scan is intentionally separate because it was previously invisible.

## Semantic isolation

The plan accepts a predeclared `epochLimit`. It is chosen before ignition. A diagnostic execution is one-shot and reads metrics only after the selected static prefix completes. It cannot inspect those metrics to choose subsequent BSFP transitions.

`result()` still refuses any incomplete schedule. `diagnostics()` is the only readback available after a partial prefix. The experiment emits:

```text
caseRole: partial-rank-diagnostic
closure: partial-static-prefix
rootWdl: null
comparedSupports: 0
```

The Q1 C3 acceptance predicate explicitly rejects a full-root label, non-null root value, or a report that claims the complete schedule executed.

## Resource accounting

The compact admission bound now includes all 12 u64 observer lanes and four u32 report lanes per support. Conservative per-support u64 bounds include both subset comparisons and worst-case duplicate prior-scan work. Capacity failure semantics remain fail-closed.

The 6x5 C3 profile remains within the existing bounded reusable arena model and retains the same 95%-of-free-VRAM policy with the 256 MiB reserve/emergency floor.

## Portable qualification

Exact implementation head `878b31840d4863ad941970c502a77995c8a0070b`:

- `verify` run `34483742485`: **85/85 tests pass**;
- `bsfp-portable` run `34483742515`: **all four Windows Server 2025 / Ubuntu 24.04 × Node 24.15 / 26.7 lanes pass**;
- every lane compiles/submits the one-epoch C3 Device-JS program through public CUDA-JS;
- every lane passes the C3 Q1 dry-run registration;
- every lane reproduces the clean sibling bootstrap with the exact lower dependency pair;
- benchmark-evidence and strength-evidence also pass.

No lower dependency changed. CUDA-Algorithms remains `48ee0aec9acae7776950f03ab52ab1737e598b6e`; CUDA-JS remains `98e2ebc942c14d63acf4dd82e912dd548c363a05` / `cuda-js@0.1.0-alpha.20`.

## Native decision table

After one C3 native result, classify rather than immediately optimize:

- **prior scans / duplicate hits dominate:** exact pre-dedup or cardinality-bucket dedup first;
- **43-phase candidate visits dominate with low duplication:** bucket once by popcount and process occupied buckets only;
- **terminal pair candidates dominate:** replace generic complement Cartesian subtraction with the direct exact cone-subtraction form already used by the CPU authority;
- **aggregate pair candidates dominate:** prioritize exact winspace inference that shrinks operands or rejects pair regions before materialization;
- **a few supports dominate:** split candidate/frontier work for one semantic support across multiple physical blocks before asking CUDA-JS for new warp/shared-memory capability;
- **multiple causes are comparable:** choose the intervention with the greatest exact work removed per added mechanism/cost and measure independently.

## Winspace follow-up

The preferred semantic seam remains inference-seeded ownership antichains. WSL/CPC/NDC may prove exact Win/Loss regions that serve as absorbers against intermediate Cartesian products while the current ownership antichain remains the authoritative output representation. Failure to infer falls back to ordinary exact C1.

Direct/double-threat certificates are the first candidate because their proof conditions are local and their cost can be bounded. Broader residual/NDC frontier replacement is deferred unless measured compression is large enough to repay the much wider record relation.

## Cleanup/disposition

No main merge or dependency repin is part of this unit. The diagnostic source and profile are retained on the active branch because portable qualification passed and a real native datum is now required.

A temporary staging branch named `tmp-do-not-use-c4diag` was created during connector-side tree assembly. It contains no unique work and currently points to the same implementation commit as the active branch. The available connector does not expose branch deletion; it is safe to delete when ordinary Git/GitHub branch deletion is available.
