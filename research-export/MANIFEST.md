# Research export manifest

Export branch: `research/export`

Base `main` snapshot: `15b8e62de07f2b35a74ea2297fda79b72633bf64`

## Core pinned lineages

| Export directory | Source ref | Pinned source commit |
| --- | --- | --- |
| `lossless-join-realizability` | `research/lossless-join-realizability` | `6a3b22199ededa4cf18e29dfe7f25c2dfb25b020` |
| `cross-synthesis-method` | `research/cross-synthesis-method` | `7454321ceee574146368600162afa8ee7672265a` |
| `center-reply-partition` | `research/center-reply-partition` | `401fb8d38c0cbfbd655b84772018bead73106d60` |
| `frontier-negamax-conformance` | `research/frontier-negamax-conformance` | `9bf620adaf5586b5f44cdaf4f6565d57928c8592` |
| `connect-k-derivative-classification` | `research/connect-k-derivative-classification` | `c7d7d0d3ab76186ecbb671fa66dbd2b56646232b` |
| `perfect-play-winset-count` | `research/perfect-play-winset-count` | `9d7ae6cf2288d813d219535895011cfe234ab1ec` |
| `semantic-quotient` | `research/semantic-quotient` | `bebc2fc59920d89595c3447a01dccf07dd38a2f6` |
| `terminal-frontier-horizon-exact` | `research/terminal-frontier-horizon-exact` | `6b7f19ce4d15423f6f2537dd7b18bcba2a7348ea` |
| `isometric` | `isometric` | `b112c341d8a365cbec8d1dd2c474b3b11fec7806` |

For each core lineage, the export carries the exact source `docs/`, `research/`, and `reference/` trees where present. Root status/research routing files are copied under that lineage's `root/` directory.

## Additional live research refs observed at export time

These are inventoried for the overlay pass and are not authority merely because they exist:

- `research/bsfp-isometric-invariant-transfer` @ `e8e3bb5266a39a92549248f2a586b45de4f2709e`
- `research/bsfp-tensor-dominance-overflow` @ `0860adcfb7acb9631a21e830befc7ec6c38f0e85`
- `research/bsfp-tensor-overflow-dominance` @ `a71ddd4919292a743c1a00188d1d5aeed38b4d7d`
- `research/live-q1-5min-20260910` @ `b8e15aa72c92fb58515a80340876e7df45b5316c`
- `research/semantic-quotient-explore-hints` @ `55079cf34c84a6808ae1c1500579c83545d1c44d`
- `research/terminal-frontier-benchmark` @ `8663c130ea9577f1b0a0dbe5b7107cbe5afc32ee`
- `research/terminal-frontier-dead-draw-staging` @ `bb5f7e729fe9e023b5a0bf6a61979b5c55321782`
- `research/terminal-frontier-horizon-exact-own-cofactor-evidence` @ `92a8d8f586a8be8f8c7f5896f9a75221a85ec0ba`
- `research/terminal-frontier-horizon-exact-suppression-evidence` @ `df3d2d0917be63d3ccacaba223ab6ac3772478f9`
- `research/unified-knowledge` @ `0e5e29e4ca4fd3941bdcffe70a52b66348705589`
- `research/zdd-transfer-20260910` @ `54d63ae9a066dba42b2748b3ad51353611a2c52a`

## Intentional exclusion

`research/frontier-negamax-conformance-test-do-not-use` is intentionally excluded from the research authority/export set. Its observed head was `0ae5e48cfad6846c7716943d053dde58c49b325c`.

Staging/work branches outside the `research/*` namespace are not treated as canonical research lineages by this export unless separately listed.

## Semantics

This aggregation is archival/navigation infrastructure only. Copying a branch into the export does not promote its claims, merge its code, change theorem status, or make experiment output authoritative. Original source commit SHAs remain the provenance authority.
