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
