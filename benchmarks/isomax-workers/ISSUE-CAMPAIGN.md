# IsoMax issue campaign

Owner request: extend protected comments through hot-loop callees; review all
issues, qualify improvements, resolve only with evidence, compare prior
performance and integrate reasonable non-regressing work.

Baseline: 5acf8ea855fdead7e502091e62464bd5242f4ae5. Temporary detached baselines
were used for paired runs and removed after qualification. Live integration owner is
solver/isometric; no solver-family merge into main is assumed.

Inventory: 27 open issues. IsoMax implementation candidates: #74–#88; umbrella
#72. #73 is canonical research/IsoGraph work. #67 remains a guarded-proof seam,
not permission to substitute solved labels for unproved premises. #71/#63 and
open PR #48 belong to the CUDA-BSFP lane. #1/#3/#13/#41/#42/#43/#69 need separate
scope/current-state disposition; historical issue text is not implementation
authority. No issue has been closed merely to clear the list.

Order: protect reachable callees; #88 profiling/census; #74 repeated key work;
#82 hit-first insertion; independently test #77/#75/#76/#81/#80/#86; qualify
#79 against real retirement and one-worker overhead; use resulting profiles to
assess #84/#85/#78. #83/#87 remain separately scoped optional-consumer economics.
Review exact diffs and guard boundaries before integrating each positive unit.

Completed so far: comment protection extended to 72 additional helpers/methods,
including preparation/error and optional certificate/RBA boundaries.
Runtime code is unchanged by that comment unit.

#74 experiment A: recursive scalar prepared-key reuse passes 78 controls
(76 existing plus collision/repeated-growth/scratch/mirror/pool rejection and
one-key-per-node coverage). Three paired fresh-process samples versus 5acf8ea8:
serial median 2401.69 -> 2311.83 ms; one-worker 2775.72 -> 2674.50 ms.
All exact decisions and nodes match (2,643,905 serial / 2,644,522 one worker).
No baseline/candidate timing ranges overlap in this sample. Keep the change;
Experiment B and final four-worker review remain separate pending work.
Portable raw root records: issue-74-key-A.json.

#74 experiment B: maintained mirrored support was correct on every imported
prefix/undo and mirror control, but the independent paired screen against A
was inconclusive: serial 2290.40 -> 2292.42 ms; one-worker 2682.78 -> 2669.68 ms,
with overlapping ranges. Do not promote another maintained field on that
evidence. Candidate source AND its protected comments remain together in
rejected/issue-74-mirror.patch; raw records in issue-74-key-B.json.

Profiling uses actual bounded native tasks in a worker. Raw CPU/heap/generated
code traces stay in Git-private evidence because they contain machine paths.
Portable summaries retain source/runtime/workload and explicit limitations.
Timing promotion uses separate uninstrumented alternating processes.

#82 hit-first interning: explicit chunk/class/cache threshold and sealed-hit controls passed. Three paired samples against #74A had serial medians 2313.37 -> 2339.67 ms (1.14% slower), one-worker 2679.24 -> 2679.52 ms (neutral), identical exact work. No promotion: normal sealed tasks reserve sufficient insertion headroom before entry; an artificial threshold-hit test is not evidence of a live solver defect. Preserve candidate, tests and protected comments in rejected/issue-82-hit-first.patch, timings in issue-82-hit-first.json.

#75: benchmark-only residual-census.mjs measured real native tasks inside a
worker; instrumentation times are not promotion evidence. All three roots show substantial above-prefix reuse; residual-census.json
retains exact per-band counts. The census
also found 98–99% repeated blocker chunk triples, motivating #76 separately.
16K reduced serial median 2289.35 -> 2120.27 ms and one-worker
2665.39 -> 2516.39 ms. 64K reduced serial 2304.59 -> 1943.12 ms (15.7%),
one-worker 2666.45 -> 2375.84 ms (10.9%), four-worker 2362.54 -> 2065.04 ms
(12.6%). Serial/one-worker work is identical; four-worker scheduling changes
node totals, with identical exact decisions. Prefix tables cost 21 MiB/pool;
four-worker peak observed process RSS 539,000,832 -> 617,136,128 bytes.
All 80 relevant tests pass, including prefix 1/4K/64K differential transitions,
full undo/reflection/singleton equality and an exact root crossing 64K classes.
The selected default is 64K; no recursive allocation or memory limit change.
Portable paired records are issue-75-prefix-{16k,64k,four}.json. Bounded normal
empty-root smoke follows this implementation checkpoint.

#75 empty-root smoke: 20260919T185905961Z-isomax tested 47446ccf, 78,695,656 settled calls in the unchanged 29s internal deadline plus cleanup within 30s. Timeout only; root WDL unknown, no solve claim. Workers terminated, 1,359,732,736-byte peak RSS. This exceeds the prior campaign's 962,416,640-byte observation; typed-array retention/GC and different progress make it more than the fixed table delta. Available host RAM is 32 GiB and no existing limit was increased. Four-worker completed-root paired timing, not empty-root node count, authorizes the speed claim. Evidence: issue-75-empty.json.

#76: rejected two fixed 1024-chunk-prefix memo layouts (1.640625 MiB/pool). Baseline census after #75 still found 722,697 blocker interner calls / 10,666 distinct triples on the hardest root, 721,988 exact interner hits; 695,215 calls had parent chunk <1024. Reuse was real, but adding a memo did not improve economics. Mask-first A: serial 1957.43 -> 1967.11 ms, worker 2364.13 -> 2371.67 ms. Memo-first B: serial 1938.55 -> 1962.82 ms, worker 2349.62 -> 2387.46 ms. All decisions/work identical; A passed 15 transition/undo/hot-storage controls. Removed both candidates, preserving source and protected comments in rejected/issue-76-chunk-{A,B}.patch and timings in issue-76-chunk-{A,B}.json. Exact interning was already cheap enough that high reuse alone did not justify another lookup/storage layer. No claim that every possible memo layout is disproven.

#77 A: preload 42 unsigned low/high cell masks (336 bytes/profile), replacing only recursive exponentiation. Three paired samples against #75: serial 1968.44 -> 1810.08 ms (8.0%); one worker 2359.14 -> 2218.59 ms (6.0%). Identical exact work, 81 tests pass including independent wide-integer mask decomposition. Baseline generated applyUnchecked/undo each had four static fast-C-call sites around floating conversions; candidate has zero. Latest compiled body sizes: apply 2912 -> 2484 bytes, undo 2108 -> 1720 bytes. These are code-site counts, not dynamic costs; timing supplies the performance claim. jit-baseline-code.json names the original 5acf baseline trace; jit-mask-code.json captures the tested uncommitted runtime represented by issue-77-mask-tables.json candidate diff plus the new mask test (before this commit). The full stack also includes #74/#75, so solveNode code-size differences are not attributed to masks alone. Flat pair incidence remains independent experiment B.

#77 B: flat typed pair incidence preserves exact advisory ordering. Initial three pairs: serial 1844.69 -> 1831.28 ms, one-worker 2202.59 -> 2185.76 ms. Independent confirmation: serial 1839.97 -> 1807.90 ms, one-worker 2211.67 -> 2173.03 ms. All twelve paired comparisons favor the candidate; identical nodes/decisions. Existing physical-child threat, mirror/high-cell/exposure-veto/dedup/tie/root-scope controls pass (ordering.test.mjs). Kept the flat incidence; initialization may allocate temporary builders but recursive scans only load fixed numeric arrays. A mistyped initial targeted test filename ran no test; the correct ordering.test.mjs was subsequently run and passed all three controls.

#88 concrete repair: prepared hashes now carry unchanged 32 bits as signed int32. All addressing remains hash & mask and equality remains exact q. Generated solveNode allocation-top reads dropped 6 -> 0, HeapNumber map loads 3 -> 0; compiled body 8888 -> 8580 bytes. Sampled solveNode allocation attribution fell 10,553,904 -> 65,552 bytes across bounded warm-root worker tasks (sampling/warmup included, not a universal zero-allocation claim). Three uninstrumented pairs against 88df23b0: serial 1784.58 -> 1778.90 ms; one-worker 2199.68 -> 2166.23 ms. Identical exact work, 81 tests pass including negative-hash/high-bit/collision/resize/cross-API lookup coverage. Profiling is still incomplete for hardware counters and persistent-deopt attribution; issue #88 remains open for that work. Also corrected indentation only in the flat-incidence source.

#81 reassessment: internBits already compares FINAL chunk words and skips unchanged chunk interning; touched-slot bookkeeping would not by itself remove another operation. A stronger exact metadata formulation exists: generated singleton term IDs 0..41 equal cell IDs. The profile now checks the complete mapping and exclusion of later singletons before execution. computeSingletonMasks projects FINAL words 0/1 directly (word 1 masked), valid for arbitrary interning and reflection as well as own moves; no parent-provenance assumption or incremental tracker. This removes the 20-word scan and set-bit loop per new class. All 625 isolated terms and mixed word-1 bits are qualified, plus physical reconstruction and complete 82-test suite. Paired medians: serial 1798.82 -> 1749.07 ms (2.8%); one-worker 2176.16 -> 2153.42 ms (1.0%), all exact work unchanged. Source invariant, mapping, preserved membership and discarded non-singleton metadata are explicit; the residual itself retains every normalized term and all legal-time/support information.

#79: native workers now observe the existing manager-owned needed word at scheduled controls, throw a precreated retirement token, fully unwind, and return no WDL. Completed exact values remain valid. Manager still solely owns scheduling; no queue access or per-node RPC. Tested 8192/512/32-node intervals with three paired one/four-worker runs each. Selected 512: one-worker median 2158.75 -> 2146.21 ms, identical work; four-worker 1904.36 -> 1768.53 ms (7.1%), nodes 7.34–7.59M -> 6.95–6.99M. At 32, four-worker median 1885.64 -> 1816.03 ms (3.7%); tighter polling did not establish a better tradeoff. 8192 improvement was noisy. Real-worker diagnostic handshakes tested 8192/2048/512/128/32/1: exact post-request extra-node bounds interval-1, restored roots, no WDL, all workers exited. Diagnostic milliseconds include JIT/wrappers and delivery, not production latency claims. 84 tests pass, including running retirement, completed-exact race, deadline/death and cleanup. New controlChecks/busyRetiredTasks/retiredTaskNodes metrics are task-boundary evidence; retiredTaskNodes counts ALL work in retired tasks, not just work after the request. Bounded empty-root comparison follows the implementation commit.

#79 empty control: candidate f9e0a423 run 20260919T193100800Z-isomax reached 90,583,604 settled nodes, 618 busy retirements, 182,893 scheduled control checks; peak RSS 1,452,343,296 bytes, CPU user/system 108.375/1.765 s. Historical fb9a67fa control run 20260919T193254437Z-isomax-control reached 90,725,663 nodes; peak RSS 1,348,009,984 bytes, CPU 107.828/1.921 s. Both stopped only at the unchanged 29s internal deadline within 30s, unknown WDL, all workers/child exited. No empty-root speedup claim; completed-root four-worker paired evidence is the benefit. Historical control uses an explicit clean detached-checkout harness because the normal production entry correctly rejects detached branches; its branch requirement was not relaxed.

#86: tested separate checked public / unchecked trusted primitives for own/block transitions, class loading and singleton queries. Native state and quiet classifier supplied owning-pool nonterminal IDs and bounded legal cells; public APIs still rejected 42 malformed class/cell cases. 27 state/hot-loop/ordering/execution controls passed. Three paired measurements did not justify the API split: serial 1744.66 -> 1757.06 ms (0.7% slower), one-worker 2145.70 -> 2145.36 ms (neutral). Restore the safer existing methods; retain full candidate and protected comments in rejected/issue-86-trusted-primitives.patch, raw timings in issue-86-trusted-primitives.json. This does not prove every guard is free; it rejects this combined fast-path proposal on actual caller economics.

#84/#85 actual execution profile at 500f73f5: benchmark-only bootstrap wraps cold boundaries, then imports the unchanged native worker; ordinary recursion is not instrumented. Three completed roots and a 10s empty-root control. Empty root: 2799 settled tasks, 2687 without backing-array replacement/cache rehash; replay 90.37 ms, pool preparation 316.90 ms, cache preparation 886.43 ms across 36,932.93 aggregate worker-task ms. Five pool lifetimes per worker reflect explicit retained-record resets. Existing retained capacity/hysteresis are real; there is no rebuild on every task. Manager thread used 1.078 CPU s in 10.017 wall s; 42.19 ms observed manager GC. Across the profile, required-graph visit accounts for 321.32 ms CPU self samples and is the largest manager source site. Test epoch visitation first; do not jump to graph arenas. ReplacedBackingBytes is explicitly not a copy-byte estimate. Full raw task/CPU/heap traces remain Git-private; portable aggregate and per-task percentiles in execution-profile.json.

#85: reject per-node epoch visitation after two independent three-pair screens.
First one-worker median 2145.12 -> 2166.94 ms; four-worker 1780.83 -> 1803.37 ms.
Confirmation one-worker 2163.62 -> 2163.44 ms; four-worker 1815.76 -> 1823.22 ms.
All exact decisions match; nine execution controls pass. Fewer Set operations did
not establish an end-to-end improvement. Restore the existing traversal; preserve
candidate and protected comments in rejected/issue-85-manager-epochs.patch. No
claim that every arena design is disproven; their extra lifecycle/identity
machinery lacks measured justification in this pass.

#84: existing retained preparation already avoids rebuilding on 96% of the
instrumented empty-root tasks. Tested two-quantum TT reservation to reduce early
rehashing. Initial one/four-worker medians improved 2175.40 -> 2152.65 ms and
1833.86 -> 1817.17 ms. Independent confirmation reversed this: one worker
2145.96 -> 2170.56, two 1926.80 -> 1987.30, four 1786.25 -> 1801.08 ms.
All 84 controls and exact decisions pass; do not promote the extra reservation.
Preserve rejected patch and both paired reports. Retain the existing capacity
policy; replay is only 0.245% of aggregate worker-task time in the profile, so
worker-affine restart is not justified by replay alone. Byte-copy attribution
and quantum/duplicate-work co-design remain separate, uncompleted measurements.

#80 expanded qualification retains the original 96 even-ply roots and adds 32
odd-ply roots plus 64 one-sided-exhaustion roots. Selection uses independent
physical winning-line blocking, never outcome/timing. A single 512-root batch
had only six eligible roots at one depth, so bounded deterministic seed batches
collect the requested 32 per depth (34/35). Corpus generation is outside timing,
performed once and captured with a hash for all candidate processes. Each cold
state's residual emptiness is checked against the physical predicate. Existing
independent WDL/all-action/certificate controls pass; no production promotion yet.

#80 expanded run afcba6ed / 20260919T195747516Z-isomax-candidates: 192 roots,
baseline 5,337,845 calls / 3895.36 ms median; non-win 5,229,810 / 3848.84;
non-loss 5,337,845 / 3893.05; both 5,229,810 / 3855.59. Exact actions agree;
timing ranges overlap. Both exhaustion-only strata save over half their calls.
An ensuing FULL-suite check exposed a missing experimental guard: native
emptiness plus a contradictory opposite certificate could prematurely declare
draw. Correct every experimental variant to activate only without certificates,
and add that concrete independent physical-WDL regression to candidate coverage.
Ordinary certificate-free timing evidence above remains valid; it was not proof
of the omitted certificate interaction. Production never contained that defect.

Tested two simpler native implementations after repairing the guard. Direct flag
initialization: serial 1765.49 -> 1752.78 ms, one-worker 2152.44 -> 2168.88 ms.
Choice-loop-only cutoff after exact/forced precedence: serial 1735.03 -> 1727.13,
one-worker 2150.34 -> 2157.68, four-worker 1783.58 -> 1805.49 ms. Both reduce
serial calls 2,643,905 -> 2,616,106 but fail the worker timing promotion test.
Reject both, preserving protected comments in their patches. All 55 relevant
controls passed for the guarded implementations. No native exhaustion bound is
promoted; stronger workload-specific economics remain possible, not established.

#78 phase 0: actual four-worker native task-boundary snapshots, full portable
canonical q content equality (terminal sentinel explicitly distinct), deterministic
content-hash 1/128 selection. Three roots complete with expected -1/0/1 and moves
3/3/4, workers cleaned up. Sampled unique keys 672/4237/4851; cross-worker keys
295/3242/3421. Snapshot observation lag medians 14.90/261.36/160.56 ms are NOT
exact completion lags. Most overlaps are late: on the hard draw, 3089 of 3242
duplicates have rank >=30; the lowest sampled overlap rank is 22. Distinct
completed keys are not a saved-subtree count. Census overhead (46/1790/814 ms
aggregate worker time) is unacceptable for production; do not import its string
serialization/scans into recursion. Sampling/snapshot tails/pool resets bias
coverage, so do not extrapolate a precise total. Portable summary retained;
full exact snapshots remain Git-private evidence. Before a shared-TT protocol,
test the existing task quantum as the lowest-coordination scheduling candidate.

#78/#84 quantum: reject 32K (one/two/four-worker medians 2139.86 -> 2182.90,
1913.60 -> 1961.27, 1806.64 -> 1848.86 ms). 128K initial medians:
one 2150.03 -> 2124.70, two 1920.06 -> 1873.77, four 1823.51 -> 1855.88.
Do not increase four-worker quantum. Confirm conditional 128K only for one/two:
one 2412.55 -> 2268.58, two 2118.32 -> 2029.45 ms; confirmation has visibly
higher host variance, so do not claim its larger percentage as universal.
Five of six pairs favor 128K at each selected count. Initial observed peak RSS:
one 251,850,752 -> 316,493,824 bytes; two 387,366,912 -> 476,094,464;
four 612,843,520 -> 814,325,760 (four-worker change rejected).
Select conditional policy; keep 512-node controls, retention, deadlines and
memory limits unchanged. Exact actions agree; one-worker nodes decrease only
2,644,522 -> 2,644,187, so this is predominantly task-entry amortization, not
proof of portable recursive reuse. Full controls and bounded smoke follow.

Selected quantum qualified with 108 tests (including incumbent/oracle controls).
Two-worker empty smoke at cc2744b1: 18,120,626 settled calls / 10,014.55 solve ms,
peak RSS 839,958,528 bytes; only the configured 10s timeout, no WDL, all workers
and reporting child exited. Executor abort/fault counters reflect its existing
timeout poisoning path; they are not silently rewritten to zero.

#88 machine review at cc2744b1: xperf reports `Failed to configure counters`;
no active loggers before/after. No hardware branch/cache claim. Actual worker
CPU/heap/V8 code capture succeeded. Inspection found FUNCTION_CONTEXT_TYPE and
growU32 closure allocation in inlined ensureClassCapacity, despite source early
return preceding the closure declaration. Moving growU32 to module scope removes
the captured local and leaves cold allocation/copy behind the existing sealed
guard. Sampled internBits allocation 14,853,112 -> 0 bytes; last compiled body
9328 -> 9164 bytes, allocation-top sites 4 -> 0. Sampling includes warmup and
does not prove universal zero allocation. Three-pair timings: serial 1769.39 ->
1746.46, one-worker 2129.78 -> 2124.41, four-worker 1788.74 -> 1792.44 ms (neutral
within scheduling variation). Confirmation serial 1749.03 -> 1735.44, one-worker
2124.54 -> 2103.76; all six serial pairs favor the candidate, exact work equal.
51 IsoMax tests passed. Retain this allocation repair; no hash-storage rewrite
was needed. Raw machine review also shows unsigned isolated-bit arguments boxing
before MathClz32 in ownTransition; assess that separately rather than attributing
all residual allocation to hashing.

#88 isolated-bit repair: preserve the isolated high bit as signed int32 before
Math.clz32; its ToUint32 semantics read identical bits. Previously unsigned
0x80000000 boxed at two MathClz32 sites in ownTransition. Captured optimized
body 6208 -> 5616 bytes, allocation-top sites 4 -> 0, HeapNumber-map sites 2 -> 0.
No hash layout change. First three pairs: serial 1726.48 -> 1708.42 ms,
one-worker 2119.75 -> 2068.83, four-worker 1820.23 -> 1755.36. Confirmation:
serial 1756.19 -> 1724.97, one-worker 2150.93 -> 2093.53. Every pair favors
the candidate; exact serial/one-worker work and all decisions agree. New
independent BigInt cofactor/reflection test covers all 625 isolated vocabulary
terms and all 42 cells, including every word's sign bit. 52 IsoMax tests passed.
Only test formatting changed after timing; production diff is identical.

#84 exact cold copy census now distinguishes typed source bytes from widened
destination bytes, counts actual bulk-set calls, chunk/class/cache rehash entries,
and nested reference/chunk preparation. Wrappers are benchmark-only and restored
before recursion even on failure (two controls pass). They can invalidate JIT
assumptions, so instrumented wall times are NOT production or A/B evidence.
Four-worker 10s empty profile: 779 settled tasks, bulk pool copy source 42,319,872
bytes / destination 168,148,992; 80 widened slots; 459,597 class / 474 chunk /
5,340,063 cache rehash entries. Cache bulk-set bytes are zero because its rehash
uses scalar stores, not because rehash has no traffic. Raw task records remain
Git-private; cold-copy-profile.json preserves portable totals.
The large copied destination with small replaced backing identifies a concrete
preparation ordering candidate: class arrays grow at their old narrow type before
being widened, so widening copies the newly reserved mostly-unused capacity.
Test widening against the small old class capacity before class-array growth.

#84 preparation order retained: size/widen chunk references while class arrays
still have their old capacity, then grow class storage. Exact IDs/content,
reservation amounts and sealed bounds are unchanged. Warm class/transition/
reflection content survives widening; repeat reservation retains array identity.
53 IsoMax controls pass. Cold empty-pool 262144-class reservation bulk-set source
bytes 5,289,984 -> 88,064; destination bytes 21,018,624 -> 118,784. At 524288
reservation destination bytes 41,990,144 -> 118,784. Both variants perform 34
bulk-set calls; repeat same reservation performs zero. This excludes allocator
zeroing, fills and scalar rehash traffic; the same final capacity is retained.
Three-pair one/two/four-worker medians: 2081.02 -> 2068.59, 1858.51 -> 1816.41,
1795.25 -> 1722.93 ms. Confirmation: 2101.37 -> 2090.78, 1863.63 -> 1842.71,
1801.99 -> 1780.18. All one-worker pairs favor the candidate with identical
work; five of six pairs favor it at each parallel count, with scheduling/work
variation. Keep this direct preparation repair, not a new continuation layer.

## Integrated qualification and issue disposition

Final tested implementation: a34743cd7ccd91185afd84c518e9eb610d03ab01; baseline
5acf8ea855fdead7e502091e62464bd5242f4ae5. Both clean; candidate diff hash empty.
Node26.7.0 / V8 14.6.202.34-node.28 / Windows x64 / i5-12600K. Three alternating
fresh-process pairs per variant, same preselected three 18-ply synthetic roots,
startup and cleanup included; NOT Begin-Hard or an empty solve.

| Mode | Baseline median ms | Final median ms | Less time |
|---|---:|---:|---:|
| Serial | 2379.87 | 1709.77 | 28.16% |
| One worker | 2761.83 | 2052.99 | 25.67% |
| Four workers | 2429.99 | 1779.85 | 26.75% |

Every pair favors final. Serial work remains 2,643,905 calls; one worker changes
2,644,522 -> 2,644,187 from task granularity. Four workers perform 7.09-7.17M
calls, still much more than serial and still slower on this corpus. Exact WDL
and root actions all agree. Max observed process RSS baseline/final: serial
181,743,616/170,094,592 bytes; one 217,382,912/269,103,104; four
526,835,712/550,449,152. The retained policies spend memory; no limit increased.
Raw per-root records: issue-campaign-final-comparison.json.

112 relevant tests pass, zero failures/skips. Command:

```sh
node --test components/domain/test/domain.test.mjs components/isometric/test/*.test.mjs components/bsfp/test/rba-wdl-reference.test.mjs tools/test/solver-performance.test.mjs research/semantic-quotient/state-identity-unification/src/quotient-worker-contract.test.mjs benchmarks/isomax-candidates/qualification.test.mjs benchmarks/isomax-workers/portable-q-census.test.mjs benchmarks/isomax-workers/cold-copy-census.test.mjs components/incumbent/test/*.test.mjs components/oracle/test/*.test.mjs benchmarks/test/*.test.mjs
```

CI qualify succeeds at the tested SHA (run 35468208132). Reviewed the complete
retained production diff, scratch lifetime, exact collision/rehash behavior,
sentinel/bit-width/normalization boundaries, task retirement races and cold
preparation order. No independent human/model review is claimed.

Final normal empty-root run 20260919T204424414Z-isomax: 91,431,317 settled calls,
29,004.69 solve ms, 976,625,664 peak RSS bytes, 107.046/2.062 CPU user/system s.
Only `ISOMAX_TIMEOUT: 29000 ms; no exact root result`; WDL/oracle match unknown.
Four workers supplied, zero active/pending after cleanup; workers terminated and
reporter/child exited. Existing timeout poisoning reports failed=1, aborted=3,
workerFaults=1; these are not erased from evidence or called successful solves.
30s supervisor / 29s internal deadline unchanged. Raw result retained in
issue-campaign-final-empty.json. No empty-root speedup is inferred from nodes.

All 27 initially open issues were reviewed; 17 have supported closed dispositions:

- Qualified implementation/qualification: #74, #75, #77, #79, #81, #84, #88.
- Tested/rejected or superseded: #13, #76, #80, #82, #85, #86.
- Previously delivered scoped foundation/research/design records: #1, #41,
  #42, #43. Closing these does not mean new external-oracle reproduction, an
  all-board exact census, or promotion of the historical packed-key proposal.

Remaining open, with concrete boundaries:

- #78: full-content overlap demonstrated; exact task-boundary import/export
  still unimplemented. Counts/observation lag do not prove avoidable subtree work.
- #83/#87: shared completed RBA artifact contract missing; optional proof/value
  object paths remain excluded from ordinary workers pending a qualified consumer.
- #67/#63: canonical temporal/resource/realizability proof lift still unqualified;
  UNRESOLVED remains UNRESOLVED. Exact WDL is not a guard premise.
- #73: native integrated IsoGraph not constructed/fidelity-qualified. Supplied
  semantic/source/V8/machine/cost evidence is input, not a substitute graph.
- #71: native-GPU-only BSFP backlog; no GPU run or CPU-fallback promotion here.
  CUDA-Algorithms #11/#12 remain open. PR #48 reviewed at 8555e47d, left draft:
  native equality/timing and live-consumer slice-domain qualification missing.
- #69: removed only fully merged work/retire-minimax-hybrid-20260918. Retained
  solver/minimax-alpha-beta and solver/hybrid-confluence because 54/17 commits
  are unreachable from surviving durable heads. Do not delete unique history.
- #3: corrected stale issue text. Main is ruleset-protected; CLI admin is
  available. Other desired settings were not silently changed, particularly
  automatic head deletion versus active durable-owner retention.
- #72 remains the umbrella for outstanding IsoMax work, not falsely closed.

All qualified units were fast-forward published to solver/isometric. No main or
CUDA-BSFP merge is justified by these CPU timings. Canonical research remains
fea030f5c6c143b25f1723705017c38babbd290d; BSFP remains 582c7024f84659cd71e5c08124adcf7fa743a646.
Rejected patches, portable evidence and reproduction tools are intentionally
retained. Raw profiles/logs stay Git-private in .git/issue-campaign and
.git/solver-performance. Temporary detached benchmark worktrees are removed
after qualification; no task-owned worker or profiler remains running.

## Spec-alignment pass: live 11f3ec61, NEES Draft 0.3

Execution checkpoint, 2026-09-19. Starting implementation head:
`11f3ec619f5348aa0145a151d62f6af936df9bcc`; canonical research:
`21cfe24af925a2eceaadccac494cacc87b0faf6f`. Global authority unchanged;
current local authority, C4-0011, NEES profile/conformance and pinned NEES
`3a78310a3ba14fb3acb4046c8dffd396209c213c` consulted before mutation.
Node 26.7.0 / V8 14.6.202.34-node.28 / Windows x64 remains the runtime.

Scope: complete ordinary-worker E0-E2 cost baseline, then critically qualified
issue fixes. Candidates are not implementation authority. The existing manager
stays active; no scheduler rewrite is inferred from issue #102's proposal.
No timeout, memory limit, GPU policy or gameplay/proof authority is changed.

Critical review before experiments:

- #96: every bit-pattern consumer must be checked. `classHashes` is Uint32
  storage compared with strict numeric equality: blindly returning a signed
  class hash would break interning. Preserve unsigned equality at that boundary.
- #97: support-first q orientation requires matching `gameplayOrientation()`;
  the issue's instruction to leave that helper unchanged is unsafe. The proof
  `structuralSignature()` must remain independent. Test both equality and action
  transport, including symmetric support and residual/support order disagreement.
- #98: ordinary recursion usually closes immediate wins before a winning child
  is entered. Count actual terminal entries before adding another per-node test.
  Public terminal residuals and certificate contradiction checks remain required.
- #99/#100: plausible redundant loads/scratch passes, not proven speedups.
  Preserve dense mover normalization and exact advisory ordering; compare equal
  work in fresh alternating processes. Reject if end-to-end timing regresses.
- #101: generic cache stores arbitrary payloads and manager nodes. Any WDL
  specialization belongs only to the ordinary solver, never the generic owner.
- #89-95/#102: scheduling-only candidates require topology/work economics;
  q/proof identity, first-win and unfinished/retired semantics remain unchanged.
  Ready reserve is historical evidence, not proof of decentralized pull.

Planned qualification: full existing relevant suite at coherent unit boundary;
targeted invariant controls during development; existing compare-hot-loop.mjs
against a detached 11f3ec61 checkout, serial/one/four workers, three alternating
fresh-process pairs. Retain per-root results, exact calls and memory; the three
18-ply synthetic roots are not Begin-Hard or empty-board solve claims. Use a
separate broader ordering corpus before claims beyond those controls. Run no
competing timing/profile workload. Before each expensive run persist the exact
candidate and falsifier here or in its result manifest; results flush per case.

### #97 qualified support-first q orbit and matching action transporter

Candidate diff and full per-root results: `issue-97-support-first.json`.
Baseline 11f3ec61, three alternating fresh-process pairs, Node 26.7.0:

| mode | baseline median ms | candidate median ms | calls |
|---|---:|---:|---|
| serial | 1715.5173 | 1560.4419 | 2,643,905 both |
| one worker | 2079.2672 | 1916.4252 | 2,644,187 both |
| four workers | 1761.1629 | 1683.4616 | 6.94-7.18M baseline; 7.20-7.23M candidate |

All nine paired totals favor the candidate. Four-worker work is schedule-sensitive
and slightly greater here; do not call that node reduction. Exact values/actions
match. 118 relevant tests pass, no skips/failures, 25.27 s. New regression covers
old/new orbit partition correspondence, canonical-state reconstruction by the
returned action orientation, legal child transport, support-symmetric ties,
proof-orientation disagreement and a trap proving the original-support minimum
performs no residual reflection/comparison. Existing collision/resize, full
physical differential, proof guard and sealed worker controls pass.

Critical correction to the issue: `gameplayOrientation()` MUST change with the
q representative order. `structuralSignature()` remains unchanged. Support order
then residual-content order is a total order over the same two-element orbit;
mirror swapping preserves its minimum. No legal-time or proof information is
discarded. Fresh IDs may differ; portable identity still uses content.

The complete Draft 0.3 E0-E2 baseline is in
`components/isometric/NEES_BASELINE_0_3.md`. It records suspected costs and
rejected alternatives instead of claiming all remaining work is required.

### #99 qualified consecutive residual-word reuse

Against 5fa41300, unchanged decisions/calls/classes: serial median
1578.3344 -> 1436.8903 ms; one worker 1921.8988 -> 1810.8124 ms;
four workers 1636.8564 -> 1587.2005 ms. All nine paired totals favor the
candidate. Raw `issue-99-word-reuse*.json` records use the existing three-root
control and alternating fresh processes; this is not a universal speed claim.

Instrumented `hot-cost-census.mjs` separately counts operations, not timing.
`wordAt` calls fall 35,381,843 -> 9,915,658 across the controls (25,466,185
avoided dependent chunk lookups). Class counts, exact work, q/reflection counts
and all semantic metrics agree. Corpus physical-threat differential plus the
new maximum-one-load-per-incident-word detector passes; full hot-loop controls
also pass. The last full-suite result remains 118/118; this unit adds one
targeted ordering test and changes no scheduling/identity/transition behavior.

The census also critically narrows #98: only 12 terminal entries occur among
2,643,905 calls. Native immediate-win closure already prevents almost all
terminal child descent. A new status test at every call must justify itself
against those 12 avoided q lookups, and must preserve optional contradiction
and public terminal-residual contracts. Do not assume terminal-before-q wins.

Retrieved the independent capacity-aligned reserve result from Actions
35480965920 (70ed0dba, EPYC/4 logical slots): three-worker reserve 3 loses all
seven pairs; median 3031.58 -> 3138.87 ms, calls 5,755,121 -> 5,973,872,
max RSS 629,448,704 -> 660,643,840. No worker resets. This falsifies promoting
full reserve as a general capacity-aware policy; the earlier four-worker stress
win is not evidence for the new decentralized architecture.

### #100 rejected both independent dataflow candidates

Baseline 347b6945. Both variants pass 18 hot-loop/state controls, including all
625 isolated terms x 42 cells, physical reconstruction and sealed allocation
traps. All completed decisions/calls match the baseline.

| candidate | serial baseline/candidate median ms | one-worker baseline/candidate median ms |
|---|---:|---:|
| A: dense direct two-word chunk traversal | 1414.4610 / 1435.8014 | 1778.4041 / 1791.0788 |
| B: precompiled affected-slot bitset | 1437.8907 / 1451.6182 | 1808.4435 / 1780.7734 |

Each was isolated, never stacked. A loses all three serial pairs and two of
three worker pairs. B wins all three worker pairs but loses all three serial
pairs. Neither qualifies as a general replacement under the no-material-
regression gate. Both production changes reverted; patches and raw results
retained as `rejected/issue-100-*.patch` and `issue-100-*.json`.
Removing scratch traffic or static mask tests is not sufficient: extra loop/
index/load dependencies change runtime economics. No hardware-cause claim is
made without counters. A different fused realization remains possible, but the
two proposed implementations do not earn promotion on the current profile.

### Owner criterion update and #96 hash-carrier qualification

Owner clarified that justified work reduction can be acceptable without a wall
speedup. Distinguish expanded entries/transition edges, representation traffic,
allocation/GC and elapsed time; do not call all of these "nodes" or infer a
time gain from fewer source operations. Reassess affected candidate decisions
under this resource/work criterion, preserving their measured timing tradeoffs.

#96 keeps bit-pattern mixing signed but explicitly returns an unsigned class
hash at the Uint32 strict-equality boundary. The original blanket proposal
would have violated interning if that boundary were omitted. Two new independent
BigInt modulo-2^32 controls cover 10,000 adversarial/random q triples and class
hash/re-interning across a legal corpus. 13 hash/hot-loop tests pass.

On Node26.7.0, generated `hashSignature`: 628 -> 528 bytes, allocation-top sites
2 -> 0, HeapNumber-map sites 1 -> 0. `hashWords2`: 816 -> 644 bytes, sites 2 -> 0
and 1 -> 0. `hashChunkTuple` retains the required magnitude boundary: 1076 ->
1028 bytes, sites remain 2/1. Counts are static code sites, not dynamic cycles.
Actual worker sampling, same tasks/calls/results: total sampled allocation
59,749,544 -> 58,120,152 bytes; remaining table-growth allocation dominates.
Raw profiles remain Git-private; portable summaries and trace hashes retained.

Three paired fresh-process timings against 347b6945:
serial median 1432.6946 -> 1427.8593 ms; one worker 1782.4714 -> 1795.7392 ms;
four workers 1575.9674 -> 1573.8470 ms. Mixed/overlapping results: **no reliable
wall-time speedup claim**. Exact decisions and serial/one-worker calls match.
Retain for directly observed boxing/allocation-site and code-size reduction
under the owner's clarified work/resource criterion, with the small mixed
timing tradeoff explicit. This is scoped representation equivalence, not a
new NEI identity claim. Evidence: `issue-96-{hash-chain*,jit-*,profile-*}.json`.

The worker allocation profile also establishes #101 headroom: about 55.6 MB
sampled allocation is attributed to generic q-value array growth in this
bounded task replay. Next test only the ordinary WDL owner, keeping the generic
manager/object cache unchanged; falsify on exactness, lifecycle or adverse
resource/runtime effects. No per-probe storage-mode branch is permitted.

### #101 qualified ordinary WDL payload storage

`IsoMaxWdlTransitionCache` shares the exact generic key/probe/rehash code and
selects Int8 value storage only at cold construction/growth. No per-probe mode
branch. Generic cache remains Array-backed for manager objects/arbitrary public
payloads. Checked WDL ingress rejects non-WDL rather than truncating; prepared
publication retains the solver's exact-value precondition. Absence stays in
`used`, so zero is a value, not a miss. Reset preserves WDL specialization.

Against c8720a5b, three alternating fresh-process pairs:

| mode | baseline/candidate median ms | max observed RSS before/after bytes |
|---|---:|---:|
| serial | 1426.7373 / 1398.9687 | 167391232 / 175771648 |
| one worker | 1794.9081 / 1752.3382 | 289869824 / 242860032 |
| four workers | 1551.0547 / 1520.1511 | 538882048 / 509833216 |

All nine paired times improve; exact decisions and serial/one-worker calls
agree. Serial RSS rises in these samples despite narrower storage: report it,
not a blanket memory claim. Payload storage is exactly one byte per capacity
slot; other keys/used/pool storage are unchanged. Worker heap sampling falls
58,120,152 -> 3,070,208 attributed bytes; the ~55.6MB generic Array growth
attribution disappears. Typed backing storage remains external memory, not
zero memory. Same profiled tasks/calls/results as #96.

123 full relevant tests pass, no failures/skips, 25.11s. New controls cover
generic object ownership, lossy-value rejection, all WDLs, collisions/repeated
resize/mirrors, prepared-parent lifetime and sealed growth. Allocation traps
now include Int8Array. Evidence: `issue-101-wdl-cache.json`,
`issue-101-profile-after.json`, inherited `issue-96-profile-after.json`.

### #98 terminal-first candidate costed out

Tested Stage A against e462ec4c, preserving the optional certificate
contradiction route and public terminal residuals. 15 relevant controls pass;
exact decisions and entered calls agree. Serial median 1390.7999 -> 1396.9191
ms; one worker 1742.8095 -> 1745.1853 ms; two of three pairs regress in each
mode. Timing overlaps, so this is not a claim of a large slowdown.

The work tradeoff is unfavorable: the control census finds only 12 terminal
entries in 2,643,905 calls. The candidate removes those 12 q lookups/stores
but adds a status comparison on every call, including cache hits, and repeats
status interpretation on non-cache native paths. No expanded state/edge is
eliminated, and no measured memory benefit justifies the change. Under the
owner's work/resource criterion this is not comparable to removing hot boxing
or 25M dependent loads. Reverted; raw result and rejected patch retained.

Stage B is not admitted: the issue makes it conditional on Stage A qualification,
and public terminal residual reconstruction remains an observable contract.
The stronger frontier-qualified nonterminal mover question F-002 remains
separately visible debt rather than being silently deleted with this issue.

### Scheduler qualification checkpoint

Current runtime e462ec4c, documentation head 95df7542. Next instrumented survey
uses `scheduler-candidates.mjs run <output> survey 4 1` on the same three
completed roots, unchanged 30s/root and 120s child supervisor. It records ready
fan-in/support-fiber density, submitted-root forced chains, task structural
features and existing worker counters. Survey time is not performance evidence.

Then independently screen control versus rank2/rank3, admission fan-in and
non-waiting continuation affinity through qualification-only source variants.
Exact source substitutions fail if the owning implementation changes. Normal
worker execution and production policy remain unchanged. Falsifiers: incorrect
WDL/action/cleanup, more total expanded/transition work without compensating
resource/time benefit, manager amplification or lost locality. Priority must
affect ready admission: with only W outstanding, merely supplying executor
priority often has no competing queued work and cannot test #90's premise.
