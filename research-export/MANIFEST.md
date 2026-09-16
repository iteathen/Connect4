# Research export manifest

Export branch: `research/export`

Base shared substrate: `main` @ `15b8e62de07f2b35a74ea2297fda79b72633bf64`

Snapshot census: 2026-09-16. Every directory below is pinned to the exact source commit listed here; later movement of the source branch does not alter this export commit.

## Included research lineages

| Export directory | Source ref | Pinned source commit |
| --- | --- | --- |
| `lossless-join-realizability` | `research/lossless-join-realizability` | `6a3b22199ededa4cf18e29dfe7f25c2dfb25b020` |
| `cross-synthesis-method` | `research/cross-synthesis-method` | `7454321ceee574146368600162afa8ee7672265a` |
| `center-reply-partition` | `research/center-reply-partition` | `401fb8d38c0cbfbd655b84772018bead73106d60` |
| `frontier-negamax-conformance` | `research/frontier-negamax-conformance` | `9bf620adaf5586b5f44cdaf4f6565d57928c8592` |
| `connect-k-derivative-classification` | `research/connect-k-derivative-classification` | `c7d7d0d3ab76186ecbb671fa66dbd2b56646232b` |
| `perfect-play-winset-count` | `research/perfect-play-winset-count` | `9d7ae6cf2288d813d219535895011cfe234ab1ec` |
| `semantic-quotient` | `research/semantic-quotient` | `bebc2fc59920d89595c3447a01dccf07dd38a2f6` |
| `semantic-quotient-explore-hints` | `research/semantic-quotient-explore-hints` | `55079cf34c84a6808ae1c1500579c83545d1c44d` |
| `terminal-frontier-horizon-exact` | `research/terminal-frontier-horizon-exact` | `6b7f19ce4d15423f6f2537dd7b18bcba2a7348ea` |
| `terminal-frontier-benchmark` | `research/terminal-frontier-benchmark` | `8663c130ea9577f1b0a0dbe5b7107cbe5afc32ee` |
| `terminal-frontier-dead-draw-staging` | `research/terminal-frontier-dead-draw-staging` | `bb5f7e729fe9e023b5a0bf6a61979b5c55321782` |
| `terminal-frontier-horizon-exact-own-cofactor-evidence` | `research/terminal-frontier-horizon-exact-own-cofactor-evidence` | `92a8d8f586a8be8f8c7f5896f9a75221a85ec0ba` |
| `terminal-frontier-horizon-exact-suppression-evidence` | `research/terminal-frontier-horizon-exact-suppression-evidence` | `df3d2d0917be63d3ccacaba223ab6ac3772478f9` |
| `bsfp-isometric-invariant-transfer` | `research/bsfp-isometric-invariant-transfer` | `e8e3bb5266a39a92549248f2a586b45de4f2709e` |
| `bsfp-tensor-dominance-overflow` | `research/bsfp-tensor-dominance-overflow` | `0860adcfb7acb9631a21e830befc7ec6c38f0e85` |
| `bsfp-tensor-overflow-dominance` | `research/bsfp-tensor-overflow-dominance` | `a71ddd4919292a743c1a00188d1d5aeed38b4d7d` |
| `live-q1-5min-20260910` | `research/live-q1-5min-20260910` | `b8e15aa72c92fb58515a80340876e7df45b5316c` |
| `unified-knowledge` | `research/unified-knowledge` | `0e5e29e4ca4fd3941bdcffe70a52b66348705589` |
| `zdd-transfer-20260910` | `research/zdd-transfer-20260910` | `54d63ae9a066dba42b2748b3ad51353611a2c52a` |
| `isometric` | `isometric` | `b112c341d8a365cbec8d1dd2c474b3b11fec7806` |

## Snapshot contents

For each lineage, the export copies every applicable research-bearing top-level subtree among:

- `docs/` — theorem notes, derivations, research maps and reports;
- `research/` — normalized claims, proofs, source archive and research executables;
- `reference/` — retained evidence/prototype material;
- `experiments/` — experimental records and controls.

Important root research/status files are copied under `root/` where present, including `STATUS.md`, `SEMANTIC_QUOTIENT_RESEARCH.md`, `ISOMETRIC_BRANCH.md`, `REPOSITORY_STRUCTURE.md`, and selected `next_step.yaml` files.

`live-q1-5min-20260910` and `zdd-transfer-20260910` have no top-level `research/` tree at the pinned commits; their existing docs/reference/experiments/status material is preserved without inventing one.

## Intentional exclusion

`research/frontier-negamax-conformance-test-do-not-use` is intentionally excluded. Observed head at the census: `0ae5e48cfad6846c7716943d053dde58c49b325c`.

The `research-unified-knowledge-staging*` refs and ordinary `work/*` branches are not treated as independent research authorities here. Their staging content is not promoted merely by being a branch. See `BRANCH_HEADS.md` for the census context.

## Authority

This branch is archival/navigation infrastructure only. Inclusion does not promote a conjecture, merge implementation history, establish solver adoption, or change a theorem's epistemic status. Original source commit SHAs remain provenance authority.
