# Connect4 Status

**Updated:** 2026-09-10  
**Phase:** Compact device-owned CUDA-BSFP native-qualified through 5x5; C3 6x5 workload diagnostic portable-qualified and awaiting one bounded native datum

The active continuation is [next_step.yaml](next_step.yaml). The device-owned C1 solver computes cofactor, terminal handling, packed ownership-antichain composition and rank finalization on CUDA with two resident rank arenas. [Q1 evidence PR #20](https://github.com/iteathen/Connect4/pull/20) records complete all-frontier native agreement for 4x3, 4x4 and 5x5. Two bounded 6x5 attempts timed out at 180 seconds; empty 7x6 remains unsolved.

The owner observed approximately 95–100% GPU utilization during the slow native interval. Code review therefore treats both **algorithmic volume** and **parallel-work quality** as active suspects rather than assuming host/launch starvation. The new C3 profile measures the first 6x5 static epoch without changing BSFP recurrence semantics or permitting a root-result claim.

## Product role and ownership

Connect4 is the Connect Four exact-solver laboratory and benchmark/validation product. It intentionally preserves two separate solver lanes:

1. `components/incumbent/` — minimax/alpha-beta/search baseline;
2. `components/bsfp/` — backward symbolic fixed-point solving.

Connect4 owns CPC, WSL-625, NDC, BSFP W/D/L/proof/frontier/terminal semantics and Connect4 CUDA profiles. CUDA-Algorithms remains consumer-neutral; CUDA-JS remains the runtime/compiler/device-memory owner.

## Active development

```text
branch: feature/cuda-bsfp
PR:     #14 (draft)
base:   protected main@de47d43f4f4133a68973d0876a402531ef5735da
```

Exact lower pair remains unchanged:

```text
CUDA-Algorithms: 48ee0aec9acae7776950f03ab52ab1737e598b6e
CUDA-JS:         98e2ebc942c14d63acf4dd82e912dd548c363a05
package:         cuda-js@0.1.0-alpha.20
```

## Formal BSFP authority

- `docs/specs/C4-0006-control-parity-and-winspace-v1.md` — CPC + WSL-625 structural mathematics;
- `docs/specs/C4-0007-nested-dependency-closure-v1.md` — NDC proof/dependency closure;
- `docs/specs/C4-0008-bsfp-exact-solver-v1.md` — exact BSFP W/D/L semantics;
- `docs/specs/C4-0009-bsfp-cuda-execution-profile-v1.md` — CUDA realization boundary;
- `docs/specs/profiles/C4-0009-C1-compact-ownership-42-v0.md` — device-owned compact ownership profile;
- `docs/specs/profiles/C4-0009-C3-compact-work-diagnostic-v0.md` — bounded partial-rank workload diagnostic;
- `docs/specs/profiles/C4-0009-Q1-benchmark-qualification-v1.md` — native evidence/VRAM/timeout/publication authority.

These branch-local solver specifications remain experimental until normal review/integration. Evidence does not promote them to protected-main authority by itself.

## Native milestones

### P1 correctness

PR #18, run `20260910T065508562Z-fb451dd8` on Windows 11 / GTX 1660 Ti / Node 26.7.0:

```text
root:                         Win
reachable nonterminal states: 4,631
legal edges:                  11,818
W/D/L mismatches:             0
```

### B1 packed dominance

PR #19 measured approximately **35.35 billion exact 42-bit subset checks/second** on the GTX 1660 Ti for the flat 1,048,576 × 568 benchmark. B1 is primitive throughput evidence, not a 7x6 solve.

### C1 compact root closure

PR #20, run `20260910T100734116Z-e8de3c61` at source `fc7c8cc233b3cf1670ef75fde69750c91dd6492b`:

```text
4x3 c3: 256 supports, Win,  zero frontier mismatches
4x4 c4: 625 supports, Draw, zero frontier mismatches
5x5 c4: 7,776 supports, Draw, zero frontier mismatches
```

The official 5x5 warm solve wall was approximately 3.569 s versus 11.664 s for the same-machine CPU reference including its qualification observer. The run reported 85,934,909 generated pairs and about 2.156 billion subset checks. Cold/runtime/compiler costs remain separately reported.

## 6x5 wall

C1/C2 uses one block per support and exact packed cardinality-phased antichain normalization. Two local 6x5 runs timed out at 180 seconds. With 2,048-candidate tiles, the first 32-node static epoch took approximately 75.118 seconds.

Review found four high-value suspects:

- every normalization scans its candidate interval through 43 cardinality phases;
- exact same-cardinality duplicate suppression performs an unreported `prior < i` scan;
- one block owns each support through a long serial column/terminal/tile pipeline;
- generic terminal subtraction may generate unnecessary Cartesian work near the terminal ranks.

The fact that the wall appears in the first epoch, before the middle-rank support-count maximum, makes raw support count alone an insufficient explanation.

## C3 diagnostic

Commit `878b31840d4863ad941970c502a77995c8a0070b` adds a result-neutral observer profile for exactly one statically selected 6x5 epoch. It records per-support:

- generated pairs and subset checks;
- previously invisible same-cardinality prior-scan iterations and duplicate hits;
- normalization input volume/calls;
- terminal-vs-aggregate pair work;
- cofactor/terminal/aggregate normalization volume;
- rank summaries and the hottest supports.

A C3 result is always `partial-rank-diagnostic`; it cannot report root W/D/L and `result()` still requires the complete schedule.

Portable qualification at this commit is green:

```text
verify:             34483742485 — 85/85 tests pass
bsfp-portable:      34483742515 — Windows/Linux × Node 24.15/26.7 all pass
benchmark-evidence: success
strength-evidence:  success
```

Every portable lane executes the diagnostic composition, C3 Q1 dry-run, and clean-sibling C3 bootstrap preparation through the exact pinned dependency pair.

## Winspace inference direction

The current preferred semantic optimization is **exact inference before expensive ownership Cartesian algebra**, not blanket replacement of every compact ownership record with a much wider WSL/NDC record.

WSL-625 already provides an exact standard-board 625-element residual universe and a 20-u32 upward-closure encoding. C4-0007 provides the NDC proof model. Initial inference candidates are direct/double threats, exact requirement exhaustion, cheap certified blocker coverage, then local Claimeven/Baseinverse/Vertical consequences. Any optional inference may fail to prove something and fall back to ordinary BSFP; an unproved heuristic may never prune exact work.

The optimization metric is candidate/proof work eliminated before materialization per unit inference cost. Because BSFP intersections form Cartesian products, moderate frontier reductions can compound multiplicatively.

## Next gate

Run the C3 profile once on the authorized NVIDIA host through Q1 and publish the append-only evidence. Classify the first epoch by candidate class, duplicate scans, normalization volume and hot-support skew. Only then select the first reducer/inference intervention and requalify complete small-game frontiers before retrying 6x5.

Do not attempt standard 7x6 merely to produce another timeout. A solved-game claim requires complete BSFP closure to rank 0.

## Non-claims

- no 6x5 CUDA-BSFP completion yet;
- no empty-board standard-7x6 CUDA-BSFP completion;
- no exact strong-distance BSFP result;
- C3 partial-rank evidence is not root W/D/L evidence;
- no current evidence that full WSL/NDC records are cheaper than compact ownership records;
- no CUDA-Algorithms or CUDA-JS repin is authorized by the present diagnosis;
- the incumbent minimax/search lane is unchanged.
