# Rust Fhourstones runtime audit

PASS, runtime-input-only, at `aff5861ad4f714059096c6d7c9664477f463766b`. This is a language/implementation control in the Fhourstones family, not an independent algorithm family. Historical lineage is unknown/not-certified-lineage-clean.

The benchmark directly compiles unchanged `src/board.rs`, `src/search.rs`, and `src/tt.rs` with a benchmark entrypoint. These three modules depend only on Rust std. `src/bin/solve.rs` supplies the native 8,306,069-entry TT default; its interactive input loop is replaced by `Board::new()`, a fresh `Solver`, and explicit `tt.clear()`. No algorithm function changes. The wrapper inspects cold state before search and maps the returned native exact score after search.

The executable closure excludes Cargo UI/other-algorithm dependencies, `inputs`, README results, and test executables. The three modules contain regression assertions under `#[cfg(test)]` (board.rs:143, search.rs:388, tt.rs:197); rustc runs without `--test`, so these modules are not compiled. No files are opened by the solver modules. `BOOKPLY=0` in search.rs is a current-search depth/reporting parameter, not a loaded book. `TransTable::new` uses a zero-filled Vec; `clear` zeroes every entry and store count; `stats().is_none()` checks that no stored score is present. No previous process state survives.

Rule-derived bit masks, reflection, history initialization and search constants are admitted. The search source describes tie-break changes informed by comparing known results/work counts; that does not make this runtime lineage-clean. It does not feed those comparisons into the compiled solver. Native nodes count `ab` visits, native stores count TT store calls; neither is normalized against other solvers.

Build/command identity, complete source hashes, executable/system-library import closure, compiler and flags are recorded by `build.mjs` in the external build lock. Run `node runner.mjs prepare fhourstones-rust --build <build-root> --out <fresh-evidence-dir>` for cold initialization only; `smoke` enters the solving path under a short external deadline. `run` is reserved for the later campaign.
