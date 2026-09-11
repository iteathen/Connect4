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
