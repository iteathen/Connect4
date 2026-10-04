# Clean external solver comparison — preparation packet

Start with [the audit](EXTERNAL_SOLVER_C4_0011_AUDIT.md), [the frozen manifest](external-solver-c4-0011-manifest.json), and [preparation results](PREPARATION_RESULT.md). This is preparation plus bounded smoke evidence, not a solve-time leaderboard.

Five pinned solvers: current IsoMax, C Fhourstones 3.2, Pascal Pons without a book, Christophe c4 with weak/no-book/no-persistence settings and four threads, and Rust Fhourstones. Default benjaminrall is excluded. No upstream solver sources or executables are vendored here. `solvers/` contains only wrappers, the two Christophe configuration/cold-audit patches, and source audit metadata.

## Reproduce on Windows x64

Prerequisites: Git, Node for preparation scripts, PowerShell 7, 7-Zip, and Visual Studio 18 Community C++ toolset 14.50.35717 / SDK 10.0.26100.0. The actual IsoMax child uses the pinned Node v27.0.0 nightly recorded in the manifest. The portable toolchain script pins GCC 16.2.0 / w64devkit 2.10.0 and Rust 1.90.0 GNU components by archive SHA-256; it does not install systemwide or execute archive installer scripts.

```powershell
pwsh -NoProfile -File ./fetch-sources.ps1 -Destination C:/c4-sources
pwsh -NoProfile -File ./prepare-toolchains.ps1 -Destination C:/c4-toolchains
# Copy machine.example.json to a local config outside this packet; update paths.
# isomaxGit must point to the fetched jsminsys clone. buildRoot MUST NOT EXIST.
# Affinity targets must be requalified against the actual benchmark machine.
node ./build.mjs C:/c4-machine.json
node ./freeze-packet.mjs C:/c4-build
node --test ./harness.test.mjs
```

`build.mjs` reads exact pinned Git blobs, never mutable checkout files or upstream build scripts. It builds all five in a fresh root, emits raw build logs, source/runtime closures and `build-lock.json`, and copies only allowed runtime files into per-solver runtime directories. The example machine uses the original i5-12600K and four P-core targets; a different machine requires an explicit reviewed target/config update and fresh build evidence. `-march=native` / `target-cpu=native` artifacts are machine-specific. Do not move them to an incompatible CPU.

Run one cold preparation for each ID (`isomax`, `fhourstones-c`, `pons`, `christophe`, `fhourstones-rust`), placing verified records under `evidence/prepare-final/<id>` in the new packet copy:

```powershell
node ./runner.mjs prepare pons --build C:/c4-build --out ./evidence/prepare-final/pons
# After all five cold checks, review the source audit and build-lock differences.
node ./freeze-packet.mjs C:/c4-build --audit-complete
# Commit the complete reviewed packet before any solving-path smoke.
node ./runner.mjs smoke pons --build C:/c4-build --out C:/c4-smoke/pons
```

The audit-complete flag is an auditor attestation, not something inferred from compilation or a correct answer. Do not use it without reviewing the packet. Every output directory must be new. `prepare` exits without search; `smoke` has a 5-second default and a 10-second maximum. The runner binds to the manifest's build-lock hash and refuses changed harness/runtime files. It records raw stdout/stderr, process time, CPU, native OS peak working set, native metrics if returned, and actual affinity.

Prepared later timing command (not executed by this task):

```powershell
node ./runner.mjs run pons --build C:/c4-build --out C:/c4-runs/pons-001 --timeout-ms 3600000
```

Repeat that explicit command with another ID and fresh output directory to run that solver. IsoMax retains its production 300-second internal search ceiling regardless of a larger external deadline. No implicit repeated campaign exists. A successful returned result is eligible only for separate post-return validation; the child never receives an expected answer. Parser tests use synthetic records outside the runtime closure.

## Evidence layout

- `evidence/build-lock.json`: authoritative compiled/runtime identities and toolchains.
- `evidence/prepare-final/`: successful cold checks using the final collector.
- `evidence/smoke/`: bounded solving-path records; interrupted runs are not performance results.
- `evidence/prepare/` and `build-lock-initial.json`: retained initial preparation diagnostics (Node Windows import-path failure and missing .NET post-exit RSS), superseded by corrected collector evidence. No solving path ran in those attempts.
- `external-solver-c4-0011-manifest.json`: aggregate audit/resource comparison and exact commands.

Runtime closure verification is before and after the measured process. The primary timer includes all in-process initialization, cold scans, RLC computations, search, output and cleanup; build and hash verification are outside it. Native serial baselines remain serial; native node counts are not equated. The IsoMax live-handoff target and Christophe inherited concurrency risks are disclosed in the audit and must accompany later comparisons.
