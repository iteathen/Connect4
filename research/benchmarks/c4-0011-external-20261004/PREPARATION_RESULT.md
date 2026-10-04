# Preparation result

**Ready for a separately authorized actual timing campaign, with the disclosed target/resource differences. No full solve or repeated timing campaign was performed.** The completed source/build/cold audit was committed at `e698753d` before any solving-path smoke.

| Solver | Optimized build | Cold preparation | Bounded empty-start solve entry | Runtime-input status |
|---|---|---|---|---|
| IsoMax | PASS; pinned historical Node and unchanged package | PASS; empty ingress, source-backed zero-buffer allocation | PASS; computed RLC handoff, four deep workers pinned | PASS |
| C Fhourstones | PASS; GCC 16.2.0 | PASS; all TT fields zero | PASS; native serial weak solve | PASS |
| Pons | PASS; GCC 16.2.0 | PASS; reset TT, null book pointer, depth -1 | PASS; native serial weak solve | CONDITIONAL PASS; no-book condition satisfied |
| Christophe | PASS; MSVC 19.50.35730.0, LTCG | PASS; zero TT, four search workers, all persistence flags false | PASS; four-thread weak solve | PASS with frozen settings |
| Rust Fhourstones | PASS; Rust 1.90.0, thin LTO | PASS; new/clear TT, no stored scores | PASS; native serial weak solve | PASS |

Each path smoke had a 5,000 ms external wait ceiling and was deliberately terminated incomplete. Process startup/affinity setup and termination cleanup are included in recorded wall time, so raw intervals slightly exceed that wait ceiling. These intervals are **not completed solve times**, and no W/D/L result or native final node count was fabricated. CPU time, OS peak working set, exit status, raw stdout/stderr and native entry markers were captured. All five runtime closures were unchanged after execution.

IsoMax's raw trace computes zero-based moves `[3,3,3,3,3]` (display columns 4-4-4-4-4) from an initially empty array. The final RLC reason is `UNIQUE_MAX_EXHAUSTS_COLUMN`. Four worker reports confirm processor group 0, logical CPUs 0/2/4/6, before solver initialization. The wrapper contains no literal prefix or fixed structural-move count. It performs one exact search call, not self-play or repeated searches.

The common runner parsed all five real cold/entry records. Synthetic parser tests cover all three W/D/L encodings for the serial wrappers, the Christophe string/score encoding, and IsoMax's exact-result structure; these fixtures are not game-answer inputs and are outside runtime directories. Full result parsing has not been exercised by completing an empty-board solve in this preparation task.

## Modifications and retained boundaries

- C Fhourstones: wrapper replaces interactive entrypoint, calls upstream `trans_init/reset/emptyTT/solve`, scans cold state and redirects native progress to stderr. Search code unchanged.
- Pons: wrapper includes the upstream solver, constructs/reset an empty solver and position, inspects cold TT/book through read-only member access, calls `solve(position, true)`. No `loadBook` invocation; legitimate `book.get` and search optimizations remain unchanged.
- Christophe: settings change strong mode to weak and auto thread count to four. Book/load/save flags were already false and are compile-time asserted. Two cold-only read accessors inspect TT and worker count. No search/worker/TT algorithm or concurrency rewrite. MSVC handles native Windows APIs without a source compatibility patch.
- Rust: small fixed-empty wrapper compiles three unchanged solver modules directly with std. No Cargo UI dependencies or test configurations are linked; solver tests remain `cfg(test)` excluded.
- IsoMax: wrapper uses the exact package exports/profile, builds the actual live RLC trajectory and calls unchanged production Lazy SMP once. CPC, BSFP, support libraries, worker topology and hot loop are untouched.

## Fairness and remaining limits

IsoMax's exact target is the runtime-computed live handoff; external solvers' exact target is the fixed empty-root weak W/D/L. C4-0011 admits the composite empty-start execution, but this preparation does not prove RLC optimality. Later comparisons must show that distinction. No universal 7×6 formula claim follows.

TT allocations differ deliberately: IsoMax 6.25 GiB total across shared/private tables; Christophe about 1 GiB shared; C/Rust Fhourstones 66,448,552 bytes each; Pons 83,886,295 bytes. Native serial controls remain serial. All processes have the same four-P-core mask; IsoMax additionally pins individual workers. Native thread migration and toolchain/JIT differences remain disclosed. No hard OS memory cap is imposed.

Christophe's inherited shared-memory data-race risks remain unresolved correctness concerns distinct from runtime-input independence. Runtime-input PASS does not mean its C++ concurrency is proved correct. Historical heuristic/theorem lineage is not certified for any external project. Rust Fhourstones is a language control in the same algorithm family as C Fhourstones.

Initial preparation diagnostics are retained: GCC's disabled LTO configuration, its dormant Windows affinity compile incompatibility for Christophe (resolved by native MSVC without algorithm changes), Rust's required official mingw component/self-contained link mode, Windows Node `--import` URL correction, and native post-exit RSS accounting replacing an unavailable .NET property. Final cold checks and smoke evidence use the corrected collector and frozen release binaries.

An independent read-only review found and checked fixes for stale build/include contamination, optional manifest binding, permissive record validation, timeout cleanup, and worker-affinity verification. Its final bounded review found no preparation/smoke blocker; it is not an independent mathematical audit of each solver.

Only this packet is committed. Upstream clones, toolchains and generated executables remain outside Connect4. A temporary untracked Windows cache directory created during compiler setup remains local after automatic cleanup approval was rejected; it is excluded from Git and all runtime closures.
