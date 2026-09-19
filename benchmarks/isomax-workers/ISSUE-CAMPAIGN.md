# IsoMax issue campaign

Owner request: extend protected comments through hot-loop callees; review all
issues, qualify improvements, resolve only with evidence, compare prior
performance and integrate reasonable non-regressing work.

Baseline: 5acf8ea855fdead7e502091e62464bd5242f4ae5. The temporary detached baseline
is retained for paired runs until campaign cleanup. Live integration owner is
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
exact completion lags. Most overlaps are late: on the hard draw, 3077 of 3242
duplicates have rank >=30; the lowest sampled overlap rank is 22. Distinct
completed keys are not a saved-subtree count. Census overhead (46/1790/814 ms
aggregate worker time) is unacceptable for production; do not import its string
serialization/scans into recursion. Sampling/snapshot tails/pool resets bias
coverage, so do not extrapolate a precise total. Portable summary retained;
full exact snapshots remain Git-private evidence. Before a shared-TT protocol,
test the existing task quantum as the lowest-coordination scheduling candidate.
