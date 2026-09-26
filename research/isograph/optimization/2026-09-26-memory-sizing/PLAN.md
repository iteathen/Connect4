# IsoMax shared/private cache memory campaign

> Execution: use the executing-plans workflow, sequentially. This plan prepares
> the campaign; no memory-sizing runs or harness modifications have started.

**Goal:** find whether additional retained exact results lower total solve cycles,
while accounting for larger allocations and memory-access cost.
**Architecture:** existing Lazy SMP only, four workers, fixed sharing mask 7.
Vary shared exact-cache entries and private exact-cache entries per worker.
Keep stacks, scratch/basis storage, geometry, move order, CPC and algorithms fixed.
**Stack:** Node26.7.0 / Windows QueryProcessCycleTime; existing JSMinSys public API.
**Scope authority:** owner request; components/isometric/jsminsys/README.md,
components/isometric/NEES_PROFILE.md, current total-cycle campaign.

## Frozen comparison baseline

Selected JSMinSys candidate ec6a602268e5dd281db9cb29b2f4defd47c6d325:
restored move ordering plus pooled-frontier test repair; 142/142 tests passed.
Connect4 harness base 6f5828c7d9a5fefde14b77567a6b8198574aa371.
This selected candidate is not the production vendor pin. Record both explicitly;
use the same selected dependency for every memory arm. Do not update that pin or
modify JSMinSys/BSFP. Fetch before mutation and freeze fresh valid revisions
before running; changed revisions require a new manifest, not pooled evidence.

## Matrix and bytes

Baseline: 65,536 shared entries and 65,536 private entries PER WORKER.
Screen each dimension independently at 16,384 / 131,072 / 262,144 / 1,048,576,
holding the other at baseline. This is eight challenger configurations.
The smaller arm tests whether even the current allocation is too large.

At observed keyWords=14, private backing arrays cost 61 bytes/entry
(56-byte key + 4-byte epoch + 1-byte value); shared arrays cost 64 bytes/entry
(56-byte key + 4-byte sequence + 4-byte value), plus 12 bytes of shared statistics.
Baseline cache backing storage across four workers is 19.25 MiB + 12 bytes.
If both capacities later reach 1,048,576, it is 308 MiB + 12 bytes.
These exclude worker heaps, geometry, scratch, object headers and runtime storage.
Matrix.json contains exact arm allocations. Validate formulas against cold-created
public cache objects at execution; never allocate an extra duplicate cache inside
a timed solve just to measure its size. RSS is process-wide; do not sum it per worker.

## Measurement and safety

- Fresh process and empty caches for each sample; run one process at a time.
- Keep restored sorting, center ties, worker rotation and CPC restrictions intact.
- Measure all-process-thread CPU cycles from process creation through joined
  solve; retain bootstrap/setup/solve partitions. No nominal-GHz conversions.
- Record actual shared/private capacities, cache bytes, sampled RSS high-water,
  final RSS, free RAM, wall/CPU time, result, cleanup and source hashes.
- Sample RSS periodically only in the separate diagnostic runs; clearly label
  sampled high-water (not exact peak). Production timing keeps current reporting.
- Record existing shared hits/stores/contention and winner metrics, but do not
  label winner nodes or winner cache hits as whole-system totals or hit rates.
- Separate instrumented runs capture all-worker nodes, visits/sec and cycles/visit.
  Never divide all-thread cycles by winner-only nodes. No new hot instrumentation.
- Preserve 30-second screening ceiling and 120-second application ceiling.
- Cache backing-store budget <=512 MiB. Admission requires >=4 GiB free host RAM;
  preserve failure/skip evidence. No timeout/limit increases or silent retries.
- A crash, wrong WDL, unclean shutdown or revision drift stops that arm for review.
  Timeout is censored data, never a solve or a performance win.

## Task 1 — Extend existing cold harness, not another solver

Files: tools/isomax-cycle-sample.mjs, tools/isomax-cycle-campaign.mjs,
tools/isomax-cycle-analysis.mjs, test/cycle-accounting.test.mjs on the implementation
branch. Research artifacts remain under research/semantic-quotient.

- [ ] Add tests first for independent local/shared parameters, invalid capacities,
  configuration mismatch rejection, timeout classification and metric denominators.
- [ ] Parameterize capacities and fixture expectations in existing cold harness.
  Its current candidate mode changes library paths and hard-codes capacities; do
  not pretend matrix.json can already be passed to that command.
- [ ] Keep same dependency path/SHA for both arms; record configuration identities
  independently of source identities. Assert echoed effective capacities match.
- [ ] Generalize oracle checking: known WDL per fixture; do not hard-code move 3
  for every input. Validate legal/optimal witnesses where an independent oracle
  is tractable. Keep mirrored late-position correctness controls.
- [ ] Add after-join RSS output; reuse existing all-worker loader for diagnostics.
- [ ] Run Connect4 tests, exact selected JSMinSys tests and two identical-config
  ABBA blocks to validate noise, cycle partition closure and clean cleanup.
- [ ] Commit harness and manifest before timing. No hot path changes.

## Task 2 — Fast independent-dimension screen

- [ ] Use 45461667, known P0 WDL +1. Four ABBA blocks per challenger against 64K/64K:
  16 fresh processes per comparison, 128 processes total, interleaved controls.
- [ ] Deterministically shuffle challenger order with seed 20260926; persist order.
- [ ] Write raw child output and each result immediately, including errors.
- [ ] Report per-arm block-paired cycle/wall ratios and descriptive intervals,
  actual bytes/RSS, correctness and clean exits. Do not select by cache hits alone.
- [ ] Do not choose a winner solely from the fastest noisy sample. Strong losers
  leave the current promotion set; inconclusive arms stay labeled inconclusive.
- [ ] Persist screen before progressing. Single-fixture screen cannot promote.

## Task 3 — Interaction and broader confirmation

- [ ] Keep at most two convincing arms per dimension. If no arm improves, retain
  baseline and stop broad expansion; record the negative/inconclusive outcome.
- [ ] Test at most four combinations of surviving shared/private sizes against
  baseline. Include equal-total-cache-byte comparisons where representable so
  shifting memory between workers and shared storage is distinguishable from
  simply buying more memory. Do not assume gains add or multiply.
- [ ] Confirm best two configurations on the three nonempty Fhourstones inputs:
  45461667 (+1), 35333571 (-1), 13333111 (0), and maintained mirrored late controls.
  Use four ABBA blocks for cases completing within 30 seconds.
- [ ] For unresolved hard/empty roots, do one bounded 30-second probe per arm,
  then a separate all-worker diagnostic. No false speedup from equal timeouts;
  raw node throughput is not proof of equal search progress.
- [ ] Separate two-block ABBA node diagnostics for baseline and finalists:
  total visits, all-thread cycles/visit, elapsed visits/sec, per-worker counts.
- [ ] Cap the whole confirmation phase at 30 minutes; predeclare case order,
  preserve incomplete cells and resume explicitly rather than extending timeouts.
- [ ] Only after an owner-selected finalist, use the existing official four-input
  120-second-per-case qualification as a distinct run. No automatic launch here.

## Decision rule and report

Primary: total cycles for a correct completed solve including setup and shutdown.
Report wall time beside it; faster wall at higher aggregate cycles is a tradeoff,
not automatically a win. Report each position separately and an equal-weight
geometric mean over identical completed case sets. Do not drop failed/timeout
cases to improve an average. Any repeatable >1% total-cycle regression must be
explicit and blocks unqualified promotion; sub-1% claims need tighter evidence.

Publish exact revisions/configuration, bytes, cycles, timing, nodes (diagnostic),
correctness, timeout/failure/cleanup, and raw artifact paths. No whole-suite speedup
or NEES certification claim from a one-position screen. No default change until
qualification supports it. Retain the smallest configuration statistically
indistinguishable from the best rather than assume maximum memory is best.
