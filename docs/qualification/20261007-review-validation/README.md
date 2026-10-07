# IsoMax review qualification

This owner-authorized evidence update preserves runtime source `8b81911bb19f58665f5a5bbb4811a05fc0fd9fba`. It changes documentation, distribution evidence and qualification tests, not production workers, CPC, search, TT semantics, defaults or BSFP.

## Matched empty-board series

Five uncontaminated fresh-process pairs used six individually pinned P-core workers on the recorded i5-12600K, the retained Node27/V8/JIT flags, 12 GiB shared partial24 TT and 192 MiB private TT per worker. No RLC, opening book or prior-run data. The control is `679239578f853d0a7a2f1bcd70c860926a8ddc14`; the candidate is the shipped source `8b81911`. Both use the same raw prepared host configuration. Expected root WDL is checked only after return.

| Metric | Control | Candidate |
|---|---:|---:|
| Mean solve time | 33,803.029 ms | 33,560.174 ms |
| Solve range | 33,677.979–33,910.970 ms | 32,989.339–34,343.928 ms |
| Sample standard deviation | 88.219 ms | 567.464 ms |
| Mean process CPU | 208,234.6 ms | 205,174.8 ms |
| Mean full external wall | 39,916.518 ms | 39,744.082 ms |

The observed mean wall reduction is **0.718%**, with the candidate slower in two of five pairs. This series does not establish a dependable wall-time improvement. The earlier two-per-arm 2.656% result is retained as historical evidence, not the current headline attribution. The newer mean CPU reduction is about 1.47%; without matched search-effort counts it does not establish per-node efficiency.

All accepted runs returned EXACT/WIN/zero-based move3, verified six pins and clean six-worker exits. Primary timing begins after READY/page initialization and includes actual empty root construction and solve. CPU/RSS cover the hosting process; full external wall includes startup and cleanup. Cycles are unavailable. Initialization is a separate secondary measurement, not silently removed from the full-process result.

The first pair overlapped a qualification-only CPU task. It is preserved in `matched/` but excluded based on workload contamination, not performance or returned value. A sixth pair replaced it, retaining five uncontaminated pairs. Selection and exclusion details, invocation records, stdout/stderr and per-run summaries are included. Fixed alternating A/B order may retain ordering/drift effects; this is a local observation, not a portable gain.

## Qualification boundaries

The package also includes the sanitized raw rc.5 public-default confirmation (33,334.3664 ms solve; 39,689.6962 ms full external wall). Different worker/memory configurations from older rc.2 runs cannot establish an isolated kernel speedup.

Current validation, comparison and diagnostic records are added in their respective folders. Only completed records establish a result. The independent reference stays in qualification code, not the runtime import closure. A diagnostic local recursive-entry counter exists only in a private instrumented copy and is ineligible for production timing. Node metrics are native definitions, not cross-solver interchangeable work units.

The experimental memory-profile auto-selection and pinning policies remain as explicitly selected by the owner; unmeasured large profiles retain experimental labels. No formula holdout outcome was accessed. No full 10x10 solve was run. Originals containing incidental personal details remain outside Git; current public evidence preserves technical conditions without publishing application identities, user paths or unrelated personal instructions. Git history is not rewritten.
