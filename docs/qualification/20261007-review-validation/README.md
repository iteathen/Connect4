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

Completed validation: 240 independently checked late roots (ranks32..39), 16 cold-process actual12GiB late cases plus one draw control, nine early roots (ranks8..16) and returned witness checks against book-free Pons, six-writer/two-reader forced-collision stress with288,000 attempted stores, and100 geometry guards/1,551 states without searches. All final checks passed. Early samples include many tactical positions; these checks do not establish exhaustive correctness or full-table replacement coverage. Expected answers stay in qualification code and are evaluated only after solver return.

| Solver/configuration | Primary solve | Full external wall | Whole-process CPU | Samples |
|---|---:|---:|---:|---:|
| IsoMax, six pinned workers,12GiB shared plus192MiB private each | 33.560 s | 39.744 s | 205.175 s | 5 |
| Christophe c4, six threads,12GiB native TT | 4.867 s | 8.088 s | 32.281 s | 3 |
| Pons, native serial,80MiB TT, book-free weak mode | 98.948 s | 99.063 s | 96.094 s | 1 |

Both parallel solvers use the same six P-core CPU set; c4 inherits a process mask and may migrate among those CPUs, while IsoMax verifies individual thread pins. c4's actual TT payload is12,884,901,696 bytes (192 bytes below12GiB). Equal shared TT bytes do not mean equal entry counts or equal total RAM: c4 uses8-byte rows and no IsoMax-style private tables/support plans. Pons is a native serial baseline, not a matched parallel result. Raw native metrics, compiler/source/executable identities, no-book/no-persisted-data checks and the accepted C4-0011 specification pin are bundled. These runs are local cross-solver observations, not a portable language-performance claim or historical-lineage-clean certification.

Native primary intervals now include actual root construction/replay after READY. Full external wall includes all initialization, cold-table checks and cleanup for every solver. c4's three native node counts were138,073,105 /137,916,892 /138,080,906; Pons reported1,608,026,330. Native counters have different inclusion rules.

The separate instrumented IsoMax run returned EXACT/WIN/move3, six published counts and clean six-worker exits: **236,060,119 recursive entries** total. It modifies only a private copy, adding one local increment per entry plus cold final reporting and a cooperative cleanup grace. Its timing is ineligible for production performance claims, and its count cannot be used as the production node count or directly normalized against another solver's metric. Production node counters remain disabled.

Independent read-only review found no Critical/Important source issue; its provenance-label finding is corrected by deriving the full-capacity aggregate source identity from its child records. Current full-capacity records all identify8b81911. Packaging/privacy/extraction checks are recorded after final assembly.

The experimental memory-profile auto-selection and pinning policies remain as explicitly selected by the owner; unmeasured large profiles retain experimental labels. No formula holdout outcome was accessed. No full 10x10 solve was run. Originals containing incidental personal details remain outside Git; current public evidence preserves technical conditions without publishing application identities, user paths or unrelated personal instructions. Git history is not rewritten.
