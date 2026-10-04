# First measured pass

Owner authorization: “Start the tests.”

Frozen preparation commit: `1e5590ac6a21108c852afbe90efbfe9d9f405439`.
Use its unchanged runner, solver binaries, source/runtime closures, profiles and cold-start protocol.

Run sequentially: IsoMax, Christophe c4, Pons, C Fhourstones, Rust Fhourstones. One fresh process per solver. External deadline 3,600,000 ms per invocation; IsoMax additionally retains its unchanged 300,000 ms internal search ceiling. This is a first measured pass, not a repeatability study. No simultaneous benchmark jobs or source/build activity during timed solves.

Primary wall time includes process initialization, cold checks, all RLC/current-position work, exact search and cleanup. Raw output, native metric definitions, CPU, peak RSS, actual affinity, exit and result statuses remain in per-solver directories. Timeouts remain censored/incomplete measurements, never solved-game timings. Solver errors or invalid cold/identity checks require diagnosis rather than silently counting as a completed benchmark.

Validate only after a process returns, outside all runtime directories. External fixed-empty-root results and IsoMax's computed-live-handoff result retain their different target labels. No expected answer is passed to a child. The frozen harness deliberately leaves performance promotion false; post-return validation and interpretation are separate records.

Preflight: all five runtime closures and manifest/build-lock identities verified; four harness tests passed. Host remains i5-12600K, Windows 10.0.26200, 34,088,599,552 bytes total RAM, about 15.9 GB free before launch. Process mask 85 (logical CPUs 0/2/4/6); IsoMax per-worker targets unchanged. The earlier untracked Windows cache directory is excluded from this packet and every runtime directory.
