# C4-0011 external comparison preparation

Owner scope: prepare and smoke-test only. Do not run a repeated performance campaign or modify production solver algorithms. The canonical branch is not modified.

Frozen authority: Connect4 `research/semantic-quotient` at `f3bc9c6b06b9b7cc02e99d1621f25d456dd9b0ef`, specification `docs/specs/C4-0011-solved-knowledge-independent-benchmark-v1.md`. IsoMax: JSMinSys main at `1b843981ba7d68c118656dad1a6c7591453e7686`.

1. Recover source identities; audit solver/runtime closures and book/persistence paths.
2. Prepare minimal empty-board wrappers and pinned optimized builds outside the repository. Preserve native algorithms and memory configurations.
3. Prepare a hash-checked cold-process runner, raw evidence capture, and resource comparison. Expected answers never enter the child process.
4. Commit the complete audit packet before bounded solving-path smoke tests. Preparation-only checks may allocate fresh tables and exit without search.
5. Run bounded smoke tests, inspect raw outputs, record unresolved limitations, independently review the runner/audit, and commit evidence. No full timing campaign.

All five solvers use the runtime-input-only lane. Historical lineage cleanliness is not inferred. IsoMax computes a live RLC handoff from the empty board; its exact result is scoped to that live handoff position unless a separate optimality bridge is established.

Build artifacts, upstream clones, and toolchains stay outside Connect4. The repository retains wrappers, patches, scripts, source/closure hashes, audit findings, and small raw smoke evidence only.
