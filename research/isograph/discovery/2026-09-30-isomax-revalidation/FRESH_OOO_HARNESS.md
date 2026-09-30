# Fresh full-OOO preparation and replay harness

Status: code prepared for root review; no fresh enumeration or scalar solve performed while authoring. Canonical owner `research/semantic-quotient`; authority 1.2 unchanged. Full OOO is the only qualification target. No RS095 feature claim is tested.

The literal allowlist is `3x7-k4`, then `7x3-k4`. Sealed `3x6-k4`/`5x3-k4`, all trained controls and standard 7x6 are rejected. The backup can run only after a persisted primary resource-censoring or vacuity disposition. `FRESH_OOO_WARRANT.json` fixes semantics, provenance and budgets for review before execution.

## Source and independence

`fresh-oracle-adapter.mjs` loads the exact Git blob at `649596b43e59b7bedab858335f4098309288ca0e`, checks SHA-256 `ba2938ffe66cf74a91329f05ed1f5295c7b0b551afcdd6d0bd0cd85fc5d16096`, and asserts every source-replacement anchor occurs once. Changes restrict the allowlist, add state/time/memory guard calls and allow resumable values checkpoints. No oracle semantics are intentionally changed. This is reuse of the reviewed independent oracle, not another independent minimax implementation.

`fresh-polynomial.mjs` is a pure structural API. `preparePolynomial(signatures, options)` returns `{classKeys,classSignatures,lowcolumns,triples,rowsLow,rowsOoo,affineColumns,dependencies:[{sourceIndices,oooResidue}],lowerRank,affineRank,oooRank,leftNullity,storedIncidences}`. Classes and semantic feature columns are lexicographically sorted. P/O atoms retain exact descriptor strings. D2 includes the constant, every observed P/O atom and every observed square-free pair. OOO includes every observed triple of distinct odd descriptors. Source combinations are sparse sorted class-index arrays; a strict 20m stored-incidence budget bounds growth. No scalar value enters preparation.

The primary elimination uses sparse rows and greatest pivots. A separate packed-BigInt least-pivot implementation checks ranks; every dependency's source-index XOR must produce zero D2 and exactly the frozen OOO residue. The snapshot also includes `lowerBasisClassIndices`, `oooBasisDependencyIndices`, and `oooKernelDependencyIndices`; the complete OOO kernel is frozen before minimax. Replay checks scalar XOR on that frozen kernel as well as through sparse and packed augmented elimination. These are distinct elimination mechanisms, not independent implementations of the game.

## Execution and checkpoints

Commands from repository root after root review:

```text
node research/isograph/discovery/2026-09-30-isomax-revalidation/fresh-run.mjs prepare 3x7-k4
```

Preparation never invokes `solve()`. It persists reachable states by rank, state-to-discovery-class indices by rank, canonical classes, complete D2/OOO rows, dependency source combinations, ranks and source identities. Partial preparation resumes using rank checkpoints. Each gzip/value checkpoint has a hash sidecar verified on resume; incomplete sidecar writes trigger recomputation rather than trusted reuse. Text-source identities use UTF8_LF, while compressed/binary hashes preserve exact bytes. `fresh-io.mjs` retries only EPERM/EACCES/EBUSY checkpoint renames with eight bounded attempts. It writes `fresh-3x7-k4/fresh-structure-manifest.json` with `newScalarReplay:false` and either STRUCTURALLY_ELIGIBLE_AWAIT_COMMITTED_SNAPSHOT or STRUCTURALLY_VACUOUS.

Root must review and commit the structural manifest, compressed structural snapshot, every listed rank/class shard, warrant and harness sources. Only then:

```text
node research/isograph/discovery/2026-09-30-isomax-revalidation/fresh-run.mjs replay 3x7-k4 <40-character-structural-snapshot-commit>
```

Replay refuses absent/uncommitted/changed snapshots and source drift. It enumerates from structural rank checkpoints, computes minimax once, saves resumable value bytes every 100k outer-loop states, checks all T2=O states for class purity, records affine and degree-two obstructions, and tests full OOO on the already-frozen D2 kernel. Relative scalar encoding is L=0,D=1,W=2. Nonzero structural OOO rank alone does not establish scalar non-affinity. Scalar vanishing on K produces SCALAR_OOO_VACUOUS. Otherwise the result is bounded fresh qualification or a fresh falsifier with explicit class-index dependency support. Purity failure is a separate rejection.

The supervisor runs a 4-GiB V8 heap limit, hides the Windows child window and enforces a wall-clock deadline. In-process guards check the 6-GiB RSS cap regularly, per-state insertion checks prevent crossing 2m reachable states while building the next rank, and polynomial/class caps are enforced before scalar work. Resource usage accumulates across resumes. Every exit updates actual elapsed time; a timeout records RESOURCE_CENSORED in both supervisor evidence and the resource ledger so the predeclared fallback gate can recognize it. Other child failures stay FAILED/INCOMPLETE. An incomplete/OOM run is not mathematical evidence and must never be reported as qualification. The resource ledger and parent supervisor records should be retained together.

Tests exercise structural kernels, ordering, sparse-versus-packed ranks, two-bit synthetic certificates, resource rejection and prohibited-carrier rejection. Test values are synthetic GF(2) labels, not a fresh-board or sealed-board solve.
