# OQS CUDA cofactor qualification

## Assessment and bounded execution

Continue research/zdd-transfer-20260910 from 0b1d67e97e74ae9014621e18ff109bda50997352.
The owner checkpoint predates the R6 record and portable cofactor kernel already
on that branch. Preserve both; qualify the implemented semantic transform before
constructing a device quotient grouping pipeline. The earlier feature/cuda-bsfp
checkout and the exact CUDA-Algorithms/CUDA-JS pair remain unchanged.

R6 original-job evidence is extracted into the adjacent evidence directory. It
separates exact layer-set/direct-cofactor checks from the three count-only R5
checkpoints. The CPU synthesis timer includes direct-oracle validation when enabled;
its ratio is descriptive, not a clean production benchmark. Seed construction is
still the dominant measured prerequisite. This slice consumes precomputed exact
seed/quotient fixtures; it does not eliminate that prerequisite or solve 7x6.

One integration owner, sequential work units:

1. Reconcile original R6 evidence and scope. Retain raw logs locally and a compact
   exact extraction in the repository; no repeated expensive R6 run is required.
2. Qualify the existing packed cofactor kernel on every transition of a selected
   small support, then the R5 adversarial supports. Compare every candidate's
   crossing mask and both exact frontier sets against incremental JS. On oracle
   supports also require the independently rebuilt R3 layer set. No CPU dedup
   result feeds a GPU synthesis claim: each input layer is a qualification fixture.
3. Prove/test the antichain-preserving cofactor optimization and compare both
   device modes. Test 42-bit boundaries, capacity/offset/input/extent failures,
   empty extent and changed batch/block shapes. Runtime success is not validity.
4. Route scalable order/scan/grouping to CUDA-Algorithms with measured bounds and
   exact consumer equality requirements. Do not install a private generic stack.

Owned writes: OQS CUDA program/plan, research qualification runner/fixtures/tests,
Q1 profile, portable workflow, evidence and current-state routing. Falsifiers are
any candidate/layer difference, missing input ordinal, silent overflow, unbounded
allocation, false native claim or leaked resources. Stop at the first divergence;
preserve failed Q1 runs. Each plan owns independent allocations and reverse-order
cleanup; qualified outputs precede widening. Native runs use Q1 memory admission,
timeout supervision and append-only publication. The new worktree and ignored
logs remain continuation/evidence state until this branch's disposition is decided.

## Cofactor preservation argument

For an antichain A and fixed subset F, restrict to members containing all of F.
For any surviving a,b, a\\F is a subset of b\\F iff a is a subset of b; clearing
F is also injective on this restricted family. Thus fixing only P0 cells preserves
the maximal Loss antichain after filtering. Fixing only P1 cells leaves surviving
Win generators unchanged, so their minimal antichain is preserved. With mixed
ownership both frontiers use the exact existing normalizer. The empty fixed set
preserves both. This requires canonical antichain inputs, not arbitrary lists.

## Generic capability boundary

At CUDA-Algorithms 48ee0aec9acae7776950f03ab52ab1737e598b6e, the maintained select
prefix loops over all prior elements; ordering compares every active pair.
SPEC-0003 explicitly makes no performance claim. Its exact feature/ranked-closure
remote still points to that revision. OQS needs a scalable permutation order,
consumer exact equality boundary flags, bounded scan/selection for dense IDs and
record compaction, with device active extents and explicit overflow. Equality of
variable-length Win/Loss sets and crossing ownership remains Connect4-owned;
hash equality alone cannot assign quotient IDs. First qualify transform semantics;
larger device quotient chaining remains dependency-blocked on that generic seam.

## Local native result and reassessment

Local Q1 20260911T031600072Z-3eb2deea passed 4x4 support 468: all 1,409
candidates / ten cuts in both modes, full target coverage. All ten boundary
controls passed. Q1 20260911T031649192Z-7ae224c5 passed the four 5x5 supports:
220,744 candidates / 112 cuts in both modes. Every GPU candidate matches direct
JS; direct JS is additionally checked against sequential cofactors. Support 4426
rebuilds all 29 independent layers; the other supports keep the R5 count checks.

GTX 1660 Ti, Node 26.7.0, driver 610.74, unchanged lower pair. Aggregate 5x5
submit/wait was 451.255 ms baseline and 285.352 ms preservation (1.58x in this
single rotating-order pass). It is not an end-to-end OQS speedup: input uploads
were about 0.37 s/mode, qualification readback about 2.25 s/mode and C1 seed
construction 38.490 s. Preserve the exact optimization, but do not infer small-case
or broad performance improvement: the small 4x4 aggregate was time-negative.

The probe exposes an important prerequisite missed by compile-only CI: this kernel
exceeds the default 32 launch parameters. Accepted CUDA-JS SPEC-0005 permits an
explicit 64-argument policy. Wide copied readback also uses SPEC-0004's permitted
64 MiB transfer bound. No lower implementation/pin changes were needed. Windows
CRLF source seams and URL pathname handling in the JS research loader were repaired
without changing reference semantics. Same-address writes of crossing output by
all block lanes were restricted to lane zero before native execution.

All 90 integrated tests passed including the O1 acceptance test. The
antichain proof control exhausts all 168 four-bit antichains against every fixed
subset. Both baseline and shortcut remain explicitly selectable for qualification.
Portable composition exercises complete preparation/submission and cleanup,
rather than treating a compiler artifact as executable qualification.

Final qualification also compares 17-state shards of the worst small transition
against the complete candidate set, changes the block width from 128 to 64 and
requires valid execution after every deliberate metadata failure. The wide
portable envelope submits successfully. Clean-source native publication follows
these final controls; the earlier local results are explicitly dirty-source
development evidence and are not substituted for that publication.

## Official native qualification and disposition

Exact source: 6e30e3829ddede96c7a9dce3fdad71df467e4ebe, clean checkout.
Q1 run 20260911T032754503Z-b0df94a3 is `qualified`; all three cases passed.
[Evidence PR #21](https://github.com/iteathen/Connect4/pull/21) retains the
append-only bundle at d2e31abb6f4da79f4b4d006e166e4b39d1960dd3. All 23
published payloads were checked against their manifest SHA-256 values and remote
Git blob identities. No main merge was performed.

| Geometry / selected supports | Cuts | Candidates per mode | Baseline submit/wait ms | Preservation submit/wait ms |
| --- | ---: | ---: | ---: | ---: |
| 4x3:c3 / 190 | 14 | 1,120 | 13.2602 | 10.7865 |
| 4x4:c4 / 468 | 10 | 1,409 | 10.5245 | 8.1668 |
| 5x5:c4 / 4426, 4743, 6351, 6465 | 112 | 220,744 | 428.3844 | 280.9927 |

All candidate comparisons have zero mismatches and exact next-target set coverage.
All eleven small-case controls passed. Independent R3 checks cover 15 layers for
4x3, 11 for 4x4 and 29 for 4426; the other three supports retain the explicitly
weaker independent count-check scope. Both device modes compare every candidate
to JS; JS sequential-cofactor checks cover every candidate on all selected supports.

The official 5x5 timing ratio is 1.52x for submit/wait only, from a single pass
with mode order alternating by cut. Baseline/preservation uploads are 370.793 /
345.421 ms and readback 2,217.539 / 2,217.294 ms. Seed construction is 38.630 s;
plan setup is 839.326 ms. These timings include qualification overhead and cannot
support an end-to-end OQS speedup claim. The 269,746,344-byte device payload and
538,181,800-byte admission bound are finite selected-control envelopes.

[Portable CUDA CI](https://github.com/iteathen/Connect4/actions/runs/34558523310)
and [incremental OQS regression](https://github.com/iteathen/Connect4/actions/runs/34558523311)
passed at the same exact source. Integrated local tests: 90/90. Review is bounded
author-side review of the cofactor program/plan, oracle seams, finite layout,
qualification runner/profile, evidence and lifecycle; not an independent full
solver audit. No native 7x6, full quotient grouping or device OQS chain was tested.

The concrete generic capability packet is attached to the existing
[CUDA-Algorithms issue #3](https://github.com/iteathen/CUDA-Algorithms/issues/3).
It records exact bounds, collision-complete grouping, device active extents,
finite scratch, dense mapping and a second-consumer requirement. No lower source,
contract or dependency pin was changed. Accept that bounded generic contract
before implementation; retain Connect4 exact structural equality here.

Cleanup: all native plans/runtimes closed gracefully and the Q1 process exited.
The old feature lane and both lower worktrees remain clean and unchanged. Keep
this OQS worktree, dependency junctions, raw original R6 log and ignored Q1 spools
for continuation/reproduction. Remote evidence PR #21 remains open. Cancelled
redundant runs 34558523329 (historical ZDD replay) and 34558523247 (duplicate R6
compact replay) remain visible as cancelled, not successful evidence. Their
workflows are retained for manual reproduction and no longer auto-run on pushes;
the incremental OQS regression and portable CUDA qualification retain automatic
triggers. No evidence or historical implementation was deleted.
