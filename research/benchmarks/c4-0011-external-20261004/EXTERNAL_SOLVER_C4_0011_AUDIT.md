# External solver C4-0011 audit

Authority: Connect4 `research/semantic-quotient` at **f3bc9c6b06b9b7cc02e99d1621f25d456dd9b0ef**, `docs/specs/C4-0011-solved-knowledge-independent-benchmark-v1.md`. The packet is prepared on `experiment/c4-0011-external-solver-benchmark-20261004`. Only the **runtime-input-only** lane is claimed. No historical lineage-clean certification or universal solver-correctness certification follows from this audit.

| Solver | Frozen revision | Runtime-input audit | Runtime/closure and forbidden-input boundary |
|---|---|---|---|
| IsoMax | `1b843981ba7d68c118656dad1a6c7591453e7686` | PASS | [Detailed audit](solvers/isomax/audit.md): exact packaged index and 49 runtime modules plus profile/affinity targets; selected standard dense worker closure identified separately. No evidence/test/book modules imported. Fresh buffers, no persisted state. |
| Tromp Fhourstones C 3.2 | `bf0e70ed9fe8128eeea8539f17dd41826f2cc6b6` | PASS | [Detailed audit](solvers/fhourstones-c/audit.md): SearchGame.c, Game.c, TransGame.c and wrapper only. `emptyTT()` before solve; full empty-field scan. Native `BOOKPLY=0` is a search parameter, not a data loader. |
| Pascal Pons | `d6ba50d8aaf2308c769d9bf2abd42d90f34baf41` | CONDITIONAL PASS; frozen wrapper satisfies no-book condition | [Detailed audit](solvers/pons/audit.md): Solver.cpp and headers; CLI main.cpp excluded. Wrapper never invokes `loadBook`; default empty book pointer/depth checked, TT reset and scanned. `book.get` stays unchanged and short-circuits with empty book. No book file staged. |
| Christophe c4 | `fa27f186d2f1bf8e8fd61bfad63454c6e4b0431c` | PASS with frozen settings | [Detailed audit](solvers/christophe/audit.md): all 26 solver source/header files; `STRONG_SOLVES_ENABLED=false`, `NUM_THREADS=4`, `LOAD_BOOK_FILE=false`, `LOAD_TABLE_FILE=false`, `UPDATE_TABLE_FILE=false`. Read/save/writer paths unreachable in this build. Read-only cold accessors inspect allocated TT and worker count. |
| Rust Fhourstones | `aff5861ad4f714059096c6d7c9664477f463766b` | PASS | [Detailed audit](solvers/fhourstones-rust/audit.md): unchanged board.rs/search.rs/tt.rs, std, and wrapper. Regression assertions remain under excluded `cfg(test)`; original UI, Cargo dependencies, `inputs` and README answers are not runtime inputs. Fresh new/clear TT and occupancy statistics check. |

The detailed audits identify each book/persistence location and why it is absent or unreachable. The machine manifest records full source trees, source/wrapper/patch/executable hashes, compiler commands and flags, direct PE imports with Windows system DLL hashes/API-set mappings, and every staged runtime file. Native executables statically link their language runtime where supported; Windows system services and Node builtins are trusted platform dependencies. This is a practical auditable closure, not a claim to inventory every transitive Windows kernel component.

The launch directory is an exact hashed allowlist. Before and after each invocation the runner rejects missing, changed, added or symlinked runtime files. Source repositories, tests, books, upstream `inputs`, package benchmark evidence, and build outputs are outside that directory. Children get closed stdin and a minimal allowlisted environment; `NODE_OPTIONS`, arbitrary preloads, home/config paths and persisted cache paths are not inherited. No expected answer is passed in argv, environment, stdin or runtime files. Native wrappers accept only no arguments or `--prepare-only`.

## Cold-start procedures and commands

From this packet directory, use `node runner.mjs prepare <id> --build <build-root> --out <new-directory>` for fresh initialization and cold checks without solve. Use `smoke` instead of `prepare` for a **maximum 10-second bounded path test** (default 5 seconds). Each invocation creates a new process; no state survives between tests. For a later full run use `node runner.mjs run <id> --build <build-root> --out <new-directory> --timeout-ms 3600000`. IDs are `isomax`, `fhourstones-c`, `pons`, `christophe`, `fhourstones-rust`. Exact executable paths/argv are frozen in each raw invocation and the manifest.

Before entering any solving path the runner requires a completed audit attestation bound to the build-lock digest. All required harness hashes and runtime files must match. A new machine rebuild requires a new build lock, cold checks and refreshed audit attestation; moving an executable and retaining an old performance label is not sufficient. Builds require a new directory to exclude stale local include overrides.

IsoMax `--prepare-only` verifies empty ingress and geometry but does **not** invoke the unchanged host: worker modules immediately begin solving after allocation, so there is no independent all-ready observation gate. TT emptiness in its actual run is a source-backed fresh-zero-buffer attestation, not a measured occupancy scan. Its bounded path smoke records actual computed RLC states and worker affinity before solver initialization. No hard-coded opening prefix or prefix-length assumption is present in its wrapper.

## Target and resource fairness

IsoMax starts empty, computes structural RLC moves on its live board until unresolved, and performs one exact search there with four deep workers. This is admitted empty-start composite execution under the current spec. The result is **exact WDL at the computed live handoff**, not a newly established proof that RLC preserved the empty-root minimax value. External wrappers solve weak WDL at the fixed empty root. This target difference must remain visible in any later speed comparison.

IsoMax retains 4 GiB shared TT + 576 MiB private TT per worker (6.25 GiB total TT). Christophe retains its native roughly 1 GiB shared TT and four search threads. C/Rust Fhourstones and Pons retain native serial configurations and TT sizes; see the machine manifest and cold records for exact bytes. No artificial parallel replicas or memory equalization. There is no OS hard memory cap; configured TT bytes and measured peak RSS are separate fields.

All processes request the same four-P-core CPU mask. IsoMax additionally uses the original per-worker topology-validated affinity preload. Native threads may migrate within that mask. Current prepared toolchains differ: GCC release/native targeting for C/Pons, optimized Rust with thin LTO, MSVC optimized LTCG for Christophe, historical Node nightly for IsoMax. Portable GCC lacks LTO; no timing conclusion is drawn from this packet. These are disclosed toolchain/placement differences, not concealed equivalent configurations.

Christophe's upstream non-atomic shared TT/stop/progress accesses pose inherited C++ concurrency-correctness risks. They are preserved, documented and separate from no-book qualification; a correct-looking output cannot settle them. Its heuristic and reduction lineage is unknown/not-certified. Rust Fhourstones is an implementation control, not an independent algorithmic family. All historical selector/theorem lineage remains unknown/not-certified for this lane.

## Timing, output and validation separation

Primary wall time starts immediately before process creation and ends at process exit. It includes runtime loading, geometry/solver setup, TT allocation/zeroing and cold scans, all position-dependent work, IsoMax RLC, search, result production and cleanup. Only external collector setup, source fetch/build, and file-identity checks are outside the timer. CPU time and OS peak working set are captured by the parent; no new hot-loop counters are installed. IsoMax native node counts remain unavailable; other solvers retain native metric definitions in their detailed audits.

Raw stdout/stderr, invocation, process accounting, affinity records and parsed summary are retained. A timed-out smoke is an incomplete path observation, never a solved-game timing. Strict cold/result/affinity checks distinguish evidence from a bare correct answer. The runner never promotes a performance conclusion; successful full runs are only eligible for separate post-return validation. No expected WDL has been queried or used in preparation.

Default `benjaminrall/connect-four-ai` is excluded: `Solver::new()` consumes embedded `crates/core/src/engine/books/default-book.bin`. No substituted `Solver::empty()` variant is included.

Final build/cold/smoke status is recorded in `PREPARATION_RESULT.md`, `external-solver-c4-0011-manifest.json`, and `evidence/`. This document is the audit rationale, not a full timing report.
