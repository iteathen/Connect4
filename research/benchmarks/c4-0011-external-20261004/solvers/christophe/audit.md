# Christophe preparation audit — C4-0011

This is a **runtime-input-only** preparation, not a lineage-clean certification or an exactness proof of upstream. Source identity: [ChristopheSteininger/c4 at fa27f186d2f1bf8e8fd61bfad63454c6e4b0431c](https://github.com/ChristopheSteininger/c4/tree/fa27f186d2f1bf8e8fd61bfad63454c6e4b0431c). Durable research owner is `research/semantic-quotient`; this experiment supplies preparation artifacts for that owner. No benchmark or oracle validation was run during this audit.

The frozen target is exact W/D/L of the standard 7×6 empty board, from the first player's perspective. No action, complete action set, principal variation, or remoteness is requested. The wrapper constructs `Position{}` and calls the original `Solver::solve(pos)` once. Its result is computed, not supplied by a root-answer constant. Score validation accepts all three values -1, 0, +1 without preferring an expected answer.

## Changes and build boundary

- Apply [settings.patch](settings.patch) to a build copy of the pinned source. It changes only strong solves to false and thread count to four. The three persistent-input/output flags were already false upstream and remain false; wrapper `static_assert`s freeze them.
- Apply [cold-audit.patch](cold-audit.patch). It adds inline, read-only inspection methods to `Table` and `Solver`; it adds no member fields, node counters, search calls, or hot-path hooks. The complete allocated table is scanned once before any search starts. The scan touches native memory and its time belongs to cold preparation and external total wall time.
- Replace the `src/c4.cpp` executable entrypoint with [benchmark.cpp](benchmark.cpp), compiling the same twelve solver translation units. Do not link upstream `src/c4.cpp`, `book.cpp`, `play.cpp`, `random.cpp`, tests, UI bindings, or any data file.
- Use C++20 and a 64-bit native build. Upstream optimized MSVC settings are `NDEBUG`, `/W4 /Ox /GL`; the benchmark build should also record exception/runtime/link flags, compiler version, and actual command line. The platform code uses Windows allocation/affinity APIs and `_mm_prefetch`; link `Advapi32.lib` if retained Windows privilege helpers require it. No third-party runtime dependency is declared by this source closure. Compiler/STL/CRT and Windows DLL versions remain build/runner manifest responsibilities.
- For Windows GCC, use `-std=c++20 -DNDEBUG -O3 -flto` and record the chosen MinGW thread model and required `-pthread`/runtime dependencies. Upstream uses `-flto=full` at `CMakeLists.txt:78`, which is not the GCC spelling; the common build must use GCC-compatible LTO flags. If the Windows prefetch declarations are missing with that compiler, record an injected `-include immintrin.h` build flag. These are build adaptations, not changes to search.
- Do not execute upstream CMake's test/book/random/play targets. A direct build of the explicit closure is sufficient. Upstream CMake declares C++20 at `CMakeLists.txt:4–8`, solver source collection at line 17, and compiler choices at lines 65–96.

The upstream clone remains untouched. No binaries, books, corpora, or downloaded solved labels are vendored here. Actual post-patch source/executable/dependency hashes must be frozen by the common build manifest before oracle validation.

## Complete source closure

[source-closure.json](source-closure.json) enumerates SHA-256 of all 26 original source/header files and every quoted local include edge. These twelve translation units and fourteen headers form the source closure; the wrapper is the sole added translation unit. Hashes refer to pinned checkout bytes before the two patches, not to the final executable.

| Directory under `src/solver/` | Translation units | Headers |
| --- | --- | --- |
| root | `entry.cpp`, `position.cpp`, `search.cpp`, `solver.cpp`, `table.cpp` | `entry.h`, `position.h`, `search.h`, `solver.h`, `table.h`, `settings.h`, `types.h` |
| `parallel/` | `pool.cpp`, `result.cpp`, `worker.cpp` | `pool.h`, `result.h`, `worker.h` |
| `util/` | `os.cpp`, `progress.cpp`, `stats.cpp`, `writer.cpp` | `os.h`, `progress.h`, `stats.h`, `writer.h` |

No include edge reaches `data/`, `tst/`, `ui/`, the upstream README, or another entrypoint. The checkout contains an opening book and known-state test corpora, but they are outside this executable closure. The audit inspected the upstream README for build/provenance context; its published outcome tables are not runtime inputs, validation data, or wrapper constants.

## Answer-bearing input/output audit

All citations below use unpatched upstream line numbers at the pinned commit.

| Site | Reachability under frozen settings |
| --- | --- |
| `src/solver/solver.cpp:16–20` calls both loaders during construction | Calls remain; each returns before any file open. |
| `src/solver/table.cpp:19–29` constructs `data/table-7x6.csv` and `data/book-7x6.csv` paths | Table path construction remains for the inert writer; no file is opened. Paths are relative to process cwd. |
| `src/solver/table.cpp:118–168`, table-file load and parse | `LOAD_TABLE_FILE=false` returns at lines 119–120, before `ifstream` at 124. |
| `src/solver/table.cpp:170–202`, opening-book load and exact-entry insertion | `LOAD_BOOK_FILE=false` returns at lines 171–172, before `ifstream` at 176. |
| `src/solver/table.cpp:96–115`, persistent significant-node serialization | `UPDATE_TABLE_FILE=false` disables the branch. Current-run in-memory stores remain. |
| `src/solver/util/writer.cpp:16–22,24–37,39–56` | Constructor, destructor and enqueue return immediately when updates are disabled. No file worker is launched. |
| `src/solver/util/writer.cpp:64–102`, append writer | `ofstream.open(..., ios::app)` at 66 is unreachable from the frozen constructor/enqueue path. |
| `src/solver/util/progress.h:18`, `progress.cpp:18–20,45–59,69–79` | Progress printing starts false. Wrapper never enables it; native bookkeeping remains. |
| `src/solver/position.cpp:532–582`, display helpers; `solver.cpp:123–125`, error display | Not called on the wrapper's normal solve path. Unexpected stdout invalidates the strict JSON protocol. |
| `src/solver/util/os.cpp:16–79,81–140` | Allocation/affinity/platform diagnostics only; no answer-file input. Huge pages and native per-thread affinity disabled. |

Source inspection found no embedded solved W/D/L corpus, opening-book array, best-move table, or answer-bearing root/prefix constant in the listed runtime closure. Compile-time bit masks in `position.cpp:10–84` are generated from board dimensions/directions. This statement concerns runtime dependencies; it does not establish historical independence of the algorithm's design.

## Frozen settings, memory, workers

`src/solver/settings.h:10–11,19,22,39–63` defines:

| Setting | Frozen value |
| --- | --- |
| Board | 7×6 |
| Strong solves | false; weak W/D/L |
| Search workers | 4 |
| Native TT capacity | 134,217,757 entries |
| Native TT allocation | 134,217,758 entries × 8 bytes = 1,073,742,064 bytes |
| Huge pages / native affinity | false / false |
| Enhanced table cutoff | 27 plies |
| Move-score jitter | 0.3f |
| Book load / table load / table update | false / false / false |
| Inactive persistence threshold | 1,000,000 nodes |

`table.cpp:31–49` allocates the native TT plus one adjacent-probe slot and clears every entry. `Entry::data` starts zero (`entry.h:33`), and emptiness is `data==0` (`entry.h:17`). The cold accessor counts all allocated entries including the extra slot. It does not simulate occupancy with a node counter, sample entries, clear an already populated table, or change TT sizing. Allocation failure handling is inherited: upstream does not check allocation before `std::fill`; a crash or missing ready record is a failed preparation, never a successful empty-table attestation.

`table.h:15–16` and `search.h:34–35` share the storage and writer while giving each worker separate stats. `pool.cpp:40–50` creates four `Worker`s; `worker.cpp:16–25` creates one native thread per worker, initially waiting. The caller is a coordinator, so four search threads does not mean only four OS threads total. Disabled writer means no persistent-file thread. Thread-local PRNGs are seeded by worker IDs (`search.h:35`) and jitter schedules derive from worker index/window (`pool.cpp:15–37`); OS interleavings still make performance/native node totals nondeterministic.

Every worker searches the same root/window with different move ordering (`pool.cpp:87–100`); this is shared-TT redundant parallel search, not four disjoint root subtrees. First result wakes the coordinator, which stops and waits for all workers (`pool.cpp:97–111`; `result.cpp:7–40`). Per-worker stats are reset on start (`worker.cpp:55–56`) and merged after completion (`pool.cpp:138–149`). Each fresh process constructs a fresh table, pool, progress object, result object and RNG state. The wrapper does not reuse any of them between runs.

Native affinity is disabled, so the common runner must apply and record the agreed process CPU mask before threads are launched, and record effective affinity. No affinity or scheduler fairness is claimed by this wrapper. Keep native memory sizing unchanged and record RSS/peak process memory separately from the 1 GiB TT allocation.

## Semantics and inherited mechanisms

`position.h:14–21` maps every win to +1 with strong solves disabled; losses negate this in `position.cpp:468–482`. `solver.cpp:26–77` searches the full weak interval until bounds meet, checking existing wins before full-board draw (`33–45`). The empty root has no side-to-move conversion ambiguity. The wrapper never calls `get_best_move` or `get_principal_variation`, which can launch additional solves.

Preserved runtime mechanisms include alpha-beta/null-window convergence and TT bounds; immediate-threat/forced-move reductions (`search.cpp:287–355`, `position.cpp:310–374`); an even-row strategy bound (`search.cpp:345–354`, `position.cpp:376–448`); mirrored, dead-stone-normalized hashing (`position.cpp:509–530,616–653`); and weighted threats, center preference, TT move preference and jitter (`search.cpp:43–81`). Historical discovery/selection lineage for these mechanisms and tuning weights is **unknown/not certified**. Some are correctness-critical reductions/equivalences, not merely ordering. They are inherited under the authorized runtime-input-only scope, not newly promoted to canonical theorems by this audit. Upstream credits Tromp and Pons; that attribution does not prove rule-only lineage.

There are inherited implementation risks independent of answer-input purity: concurrent plain `Entry` loads/stores (`table.cpp:64–70,226`), a plain `stop_search` bool written by the coordinator and read by a worker (`search.h:37–38,50`; `search.cpp:115`), and pre-lock progress reads (`progress.cpp:24–25`) raise C++ data-race concerns. They remain unchanged. A completed result requires independent validation under the benchmark contract; preserving upstream is not a race-freedom or correctness certification.

## Protocol, timing, and result parser

- Accept no arguments for a solve, or exactly `--prepare-only`. Other arguments exit 2 before allocation/search.
- After native construction and a full TT scan, verify empty physical board, zero root moves, no terminal root, four actual worker objects, zero initial native nodes and zero occupied TT entries. Emit one newline-terminated `event:"ready"` JSON record to stderr, including cwd and executable argument. `--prepare-only` also emits that record on stdout and exits without invoking `solve`.
- Normal execution emits one stdout `event:"result"` JSON record only after `solve` returns. Validate schema `c4-0011-christophe-v1`, `exact_target:"WDL"`, `perspective:"first-player"`, `root:"empty"`, integer `score` in {-1,0,1}, and matching `wdl` loss/draw/win. Reject extraneous stdout, malformed JSON, missing ready, errors, nonzero exit, timeout, or out-of-range score. A ready record alone is never a solve result.
- `native_negamax_nodes` is upstream's existing counter (`search.cpp:111`; `stats.h:32`), summed across workers/windows. It excludes static-search-only visits, includes redundant parallel work, and is not a normative cross-solver node count. No counter was added to the search loop.
- `initialization_ms` includes construction/TT clearing/thread creation; `cold_checks_ms` includes the complete TT scan. `search_ms` surrounds the original solve call. `entry_to_result_ms` includes preparation and ready-record emission but excludes process startup and destructor/exit costs. The common runner's process-start-to-exit wall time remains the total benchmark measure. No current-position preparation is excluded from that total.

Build identity, compiler flags, executable hash, applied patch hashes, DLL closure, process ID, OS/hardware/CPU mask, external wall/RSS, freeze-before-oracle checkpoint and final validation records are deliberately supplied by the common build/runner manifests, not invented by this preparation fragment.
