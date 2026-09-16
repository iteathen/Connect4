# Shared dependency TT dead-end prototypes — 2026-09-09

These files are **dirty research prototypes preserved as negative/diagnostic evidence**. They are not maintained Connect4 source and are not specification authority.

The accompanying analysis is:

- `docs/research/2026-09-09-shared-dependency-tt-dead-ends-and-corrected-architecture.md`
- raw measurements: `docs/research/evidence/2026-09-09-shared-dependency-dead-end-evidence.jsonl`

The successful comparison baseline is documented separately in `docs/research/2026-09-08-shared-tt-smaller-real-tests.md`.

## Variants

### 1. One physical 32K chunk per logical dependency family

- `twoword_solver_shareddep.mjs`
- `ybwc_shareddep_worker.mjs`
- `shareddep_bench.mjs`

Example:

```sh
node shareddep_bench.mjs 663152175 4 4 1 2 8 15
node shareddep_bench.mjs 41267575 4 4 1 2 16 15
```

Failure: logical dependency identity was incorrectly coupled to one physical slab. A search remaining in one family stranded the rest of the arena.

### 2. Uniform multi-slab regions per dependency family

- `twoword_solver_shareddep_regions.mjs`
- `ybwc_shareddep_regions_worker.mjs`
- `shareddep_regions_bench.mjs`

Example:

```sh
node shareddep_regions_bench.mjs 41267575 4 4 1 2 16 15 3
```

Failure: independent large region requests exhaust the arena when several logical refinements coexist. Logical identity, capacity policy, and physical placement were entangled.

### 3. Hand-scaled descendant region sizes

- `twoword_solver_shareddep_regions_v2.mjs`
- `ybwc_shareddep_regions_v2_worker.mjs`
- `shareddep_regions_v2_bench.mjs`

Example:

```sh
node shareddep_regions_v2_bench.mjs 41267575 4 4 1 2 16 15 3
```

This removed region exhaustion and was substantially faster, but still remained an allocator heuristic embedded in the dependency representation and still lost to the flat shared-TT baseline.

### 4. Nested hierarchy directly splitting parent physical TT regions

- `twoword_solver_shareddep_hier.mjs`
- `ybwc_shareddep_hier_worker.mjs`
- `shareddep_hier_bench.mjs`

Example:

```sh
node shareddep_hier_bench.mjs 663152175 4 4 1 2 8 15
node shareddep_hier_bench.mjs 41267575 4 4 1 2 16 15
```

The preserved source is the later alias-cached form. The earlier pre-alias form created catastrophic repeated hierarchy/allocator work; its exact measured output is retained in the JSONL evidence file. Even after alias caching, direct physical parent splitting over-partitioned useful shared capacity and remained slower than the flat shared table.

## Corrected direction

The failures converge on one separation-of-responsibilities rule:

```text
canonical dependency facts
    -> stable logical chunk ID
    -> shared chunkMap[logical ID]
    -> physical descriptor ID
    -> one or more slabs in the fixed SAB arena
```

The dependency tree/lattice owns logical relationships and cleanup proofs only. The **chunk map is the sole physical-placement and forwarding authority**.

Multiple logical IDs may deliberately resolve to the same physical descriptor. Cleanup/dedupe redirects by changing the chunk map directly to the surviving descriptor; no redirect chains or payload merge are required initially. Workers resolve at coarse dependency/task boundaries and may finish a task using a retiring descriptor before it is recycled.

## SHA-256 checkpoint

```text
acce2eb09fe2b1cbdb0e6303e0e57744706115736165fd6275c2139829b981cc  twoword_solver_shareddep.mjs
7e7d868312712e6f5a2af6b2db6583ad580559a36adbfb137d045b7a31bdd1f2  ybwc_shareddep_worker.mjs
c9b3c3f5418195a91355cfb98ed7c70d11a62c996783476c55a32bb327ee5862  shareddep_bench.mjs
bfe4360ce715f6e74609d15ceca7cc0c45379bdfccbb6d1c9f99478e885b484c  twoword_solver_shareddep_regions.mjs
d34355038b83ccaadea99b1495d3a896fdd244806595f9be7224289689787109  ybwc_shareddep_regions_worker.mjs
b03500aa5ce49c9c3ca21baf8e7982123fb26afac619384dd244273876d2ab04  shareddep_regions_bench.mjs
fb5124c77c8ac5fb727aca3e53e5c42c7488486bb04505a810f3b1297daf0028  twoword_solver_shareddep_regions_v2.mjs
bc778e6695105cd128bafa7593c1e060b8d3746364c4f35e3939e42cfbf367e6  ybwc_shareddep_regions_v2_worker.mjs
5ed7762e25ccf1a8055205f5f053f42733609415b93000b1737149e166557751  shareddep_regions_v2_bench.mjs
ec929766f2eda738aad94a538778b69449ca1a80240247d3f7357971813fd64c  twoword_solver_shareddep_hier.mjs
144e7e4d8ab5f4bd1affd54c7dba14793e1606d64b76d507ccfa37325dd0ff9b  ybwc_shareddep_hier_worker.mjs
9206a21f23b99e6d75347162f3a6329d9172c0980a4820f7029e3735c30030b5  shareddep_hier_bench.mjs
4534ebc1e8fc9c612bc5196ac9b5dc0eb3c87bf0327d47c85df537d34a67e732  shared-dependency-dead-end-evidence.jsonl
```

Do not promote these files by copying them into maintained source. Their purpose is to preserve mistakes, measurements, and the reasoning that falsified them.