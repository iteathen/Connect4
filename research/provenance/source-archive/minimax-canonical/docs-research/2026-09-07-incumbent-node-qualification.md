# Incumbent Node evaluator/search qualification — 2026-09-07

## Source readback

The owner re-supplied `Connect4.zip` and requested that the relevant source be retained in the repository so continuation does not depend on a transient upload.

Full supplied archive SHA-256:

`3dee57256552c2a0c8104cdc76c6b103e7de4a2bc69332a6723d4a5d1e543f20`

The exact benchmark-relevant source entries were validated byte-for-byte against the previously recorded hashes and retained as:

`reference/legacy-source/Connect4-engine-source.zip`

Source-only bundle SHA-256:

`d944bbf82f51493873638c418670788e2bfc88e581347d891d484f3f80e51633`

The bundle contains the exact archived bytes for `abpWorker.js`, `virtualBoard.js`, `classDefinitions.js` and `globalDefinitions.js`. Browser UI/media/font assets are not maintained product source and were intentionally excluded from this small recovery bundle. The manifest retains the full original archive identity.

## Re-derived evaluator algebra

Reading the supplied optimized source confirmed:

- live-line positional contribution is `20 * ownTokenCount(line)` for each opponent-free line;
- an immediately playable three-own/one-empty line is revisited through each owned token, preserving the repeated-immediate promotion;
- support count reduces to `targetRow - columnHeight + 1`;
- the legacy global scan to the target reduces for adjustable dimensions to `(((columns - 1) * rows) - tokenCount + targetRow + 1) & 1`.

The reduction removes board scans without substituting a 7×6 constant.

## Evaluator differential qualification

A low-level line-once evaluator was compared directly with the exact supplied optimized `virtualBoard.score()` over deterministic legal random games.

Exact player-score comparisons:

| Profile | Comparisons |
| --- | ---: |
| 4×4 | 62,322 |
| 5×4 | 70,736 |
| 6×5 | 81,750 |
| 7×6 | 90,026 |
| 8×7 | 95,608 |
| **Total** | **400,442** |

All 400,442 comparisons matched exactly.

The retained implementation uses one winning-line pass to accumulate both players' frontier scores and uses typed arrays/primitive state in the hot path.

## Fixed-depth search differential

The rewritten root-explicit alpha-beta control was compared with fresh exact-worker instances on 190 deterministic legal positions spanning 4×4, 5×4, 6×5, 7×6 and 8×7, with depths up to 8.

Result: **190/190 exact move matches and 190/190 exact external score matches** under the `legacy-qualified` fixed-depth policy.

This gate covers immediate wins, forced single blocks, double-immediate-threat losses, parity positions and the repeated-immediate evaluator case.

## Historical self-play integration oracle

The exact supplied worker was first reproduced headlessly in Node. The resulting depth-3 through depth-12 outcomes matched the known historical behavior.

The rewritten engine, using one persistent TT across moves, `searchFixedDepth`, and `legacy-qualified` ordering, then reproduced **every move of every historical self-play game at depths 3 through 12**, including the depth-7 draw and depth-12 first-player win.

This establishes compatibility behavior; it is not a claim of solved-game perfect play.

## Cross-move TT semantics

A reroot trace with production persistent-best-move ordering demonstrated the intended separation:

- after the first move, inherited previous-root positions were found, but their opposite-root-perspective scores produced **zero cross-generation score hits** while their best moves were reused for ordering;
- after the second move, the root perspective matched entries produced two plies earlier and safe cross-generation score reuse became observable.

C4-0003 freezes this rule: perspective/depth control score validity; generation does not invalidate reusable search work.

## Local performance evidence — not canonical benchmark truth

The development container provides Node `22.16.0`, not the canonical Node `26.7.0`. A local evaluator microbenchmark over 300,000 root evaluations showed an exact checksum and approximately **6.58×** lower elapsed time for the primitive one-pass evaluator than the legacy object evaluator in this environment.

This number is diagnostic only. It must not be published as the Node 26.7 benchmark result. Canonical throughput, reached-depth, TT-reuse and allocation evidence belongs to the repository benchmark harness under exact runtime/hardware identity after CI/correctness qualification.

## Disposition

The evaluator and incumbent search are now executable product candidates rather than a browser port. The next product seam is to establish the Node 26.7 benchmark protocol/evidence around this qualified incumbent before adding a CUDA-MCGS comparison lane.

CUDA-MCGS #124 remains paused and was not resumed by this work.
