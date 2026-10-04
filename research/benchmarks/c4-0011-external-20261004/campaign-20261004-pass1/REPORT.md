# First measured pass — all five completed

One fresh-process run per solver, executed sequentially on the i5-12600K under the frozen preparation packet. All five returned exact results at their declared targets, with no timeouts, cold-state failures or affinity failures. No solver/runtime/harness files were changed for this pass.

| Solver | Search workers | Whole-process wall | Process CPU | Peak RSS | Native nodes |
|---|---:|---:|---:|---:|---:|
| IsoMax | 4 deep | **34.664 s** | 127.000 s | 6,828,482,560 bytes | unavailable |
| Christophe c4 | 4 | **8.064 s** | 28.828 s | 1,077,956,608 bytes | 114,693,987 |
| Pons, book-free weak mode | 1 | **119.480 s** | 116.156 s | 87,773,184 bytes | 1,608,026,330 |
| C Fhourstones | 1 | **95.182 s** | 92.875 s | 70,098,944 bytes | 1,479,113,766 |
| Rust Fhourstones | 1 | **80.073 s** | 78.078 s | 70,184,960 bytes | 1,479,113,766 |

All report **first-player WIN**. Four external solvers solve the fixed empty-root weak W/D/L. IsoMax starts empty, computes its RLC live trajectory, then solves exactly at the resulting live handoff. Its raw trace computed display columns 4-4-4-4-4; the wrapper supplied no stored prefix. RLC stopped with `UNIQUE_MAX_EXHAUSTS_COLUMN`, then one exact Lazy SMP call completed with four clean worker exits. Its exact-search internal interval was 34.270 s; the primary 34.664 s includes cold initialization, geometry, RLC, search, output and cleanup. This is not full-game self-play.

Christophe had the shortest observed interval in this pass. This is one observation per native configuration, not a repeatability study or an equal-resource/equal-target speed claim. Its inherited C++ shared-memory race concerns remain unresolved. The source audit's runtime-input PASS is not a separate proof of concurrency correctness.

C and Rust Fhourstones matched both their native node counts and **641,554,803 TT store calls**. That supports their role as language/implementation controls in one algorithm family. Native node definitions differ across the other solvers and have not been normalized. IsoMax's disabled production counters were not reintroduced.

## Validation after return

Only after all five processes exited, raw result records were compared with parsed summaries and frozen source/executable/build identities. Runtime directories were hash-checked again. Cold flags, process affinity, per-worker IsoMax affinity, exact status, W/D/L domain, exit/cleanup and CPU/RSS validity passed. IsoMax's recorded trace was checked for continuous runtime-computed advancement, headroom checks and an unresolved handoff.

The four external empty-root results agree. No expected answer was supplied to any timed process; no external oracle was queried. This is post-return cross-solver agreement and protocol verification, not independent mathematical verification of all search reductions. IsoMax's live handoff was not separately solved by another implementation in this pass, and no RLC empty-root optimality bridge is claimed. The frozen runner's original `performance_conclusion_allowed:false` fields are retained; this report adds the separate, narrower interpretation.

## Conditions and reproducibility

The prepared runtime-input-only lane, exact upstream commits, optimized builds, native TT sizes, four-P-core process mask, IsoMax per-worker pinning and cleared child environment remain as recorded in the parent audit/manifest. IsoMax uses the pinned Node v27 nightly and 6.25 GiB total configured TT; Christophe uses about 1 GiB; serial native capacities remain unchanged. RSS is measured resident memory, not configured TT capacity. Hardware was unchanged and about 15.9 GB RAM was free at preflight. This was the user's active desktop, not a dedicated otherwise-idle benchmark host.

Source fetch/build, file-hash verification and collector startup occur before the primary timer. All child initialization and position-dependent work occur inside it. Runs were sequential, with no concurrent solver jobs or rebuilds. One external one-hour ceiling was declared for each invocation; IsoMax additionally retained its production five-minute internal ceiling. Neither ceiling was reached.

Prepared command form, used unchanged with each ID and a new output directory:

```powershell
node ../runner.mjs run isomax --build C:/r/c4-external-build-final-20261004 --out ./isomax --timeout-ms 3600000
```

Use a new output directory for any repetition; the runner refuses reuse. Exact invocations, complete raw stdout/stderr, native result records, measurements and affinity reports are preserved in each solver's subdirectory. [RESULT.json](RESULT.json) contains full precision, source pins, evidence hashes and explicit validation limits. The preparation manifest remains an immutable preparation snapshot; this campaign record establishes that actual measured tests have now run.
