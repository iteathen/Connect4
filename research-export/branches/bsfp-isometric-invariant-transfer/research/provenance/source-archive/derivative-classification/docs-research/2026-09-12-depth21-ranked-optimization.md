# Ranked depth-21 hot-loop optimization

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

## Scope and method

Continuation from the uncommitted working tree at 0317c1c95eeae2e6b3e60040eed57198f4f5f9eb. Existing changes were preserved. Governing contracts: C4-0001 domain, C4-0006 residual/support semantics and C4-0010 semantic/proof separation and exact policy ownership. No full-root trigger, remote ref or protected-main mutation occurred.

Seven sequential depth-21 profiles used the same empty 7-column × 6-row connect-4 board, 60,000 ms child timeout, Node 26.7.0 and 2 GiB reservation budget. Each timed out and exited. The profiler worker saved approximately 55 seconds before termination; the last approximately five seconds are unprofiled. A one-time inspector diagnostic after profile stop records search counters. There is no per-node reporting or added asynchronous search work. These are fixed-time throughput comparisons, not completed depth-21 solves or identical-work latency measurements.

## Assessed, implemented and qualified units

1. **TT probing / stable descriptor filtering:** reject nonzero low-hash mismatches before acquiring slot status. Possible matches still require status, generation and exact descriptor comparison. Zero low words still acquire status; reset may retain old hash words, causing extra scanning but no false proof hit. Adversarial collision, zero-hash, replacement, reset and writer controls passed. The initial nested filter regressed shallow timing; it was simplified and requalified.
2. **Tactical singleton projection:** read four scalar words from the canonical residual owner once per classification. Those words serve both the no-singleton fast return and every landing intersection. Remove the iterator and redundant legal-move count: rank below cell count already establishes a gravity continuation. No per-state cache, board reconstruction or new terminal/parity implication. All existing pool providers implement the scalar contract. A campaign initially found an omitted provider; this was corrected. Ten representation controls pass (3,735 states and 1,988 classes each); high-word and variable-board scalar controls pass.
3. **Exact term writing:** initialization proves that chunk zero is the canonical empty pair in each slot dictionary. Skip those chunks, read the current backing once per nonempty chunk, and replace the inner two-word loop with signed bit iteration. Preserve term ordering, length and vocabulary checks. Storage/allocation controls and residual/replacement campaigns passed. No retained storage was added.
4. **Tactical adapter forwarding:** remove duplicate state/result checking and dispatch in the online adapter. The kernel retains state validation; Negamax retains tactical-result validation. Malformed state/result controls and replacement/dependency/ExploreHint campaigns passed.
5. **Frontier provider selection:** bind the provider once at initialization instead of testing its function type on every node. Malformed present providers now fail closed at initialization. Boolean legality validation uses direct Boolean comparisons. Both exact policy adapters and initialization/provider controls passed.

## Measurements

| Stage | Search calls near 55 seconds |
|---|---:|
| Baseline | 60,560,536 |
| Initial TT filter | 74,401,361 |
| Singleton scalars | 86,821,040 |
| Sparse term writer | 88,683,630 |
| Simplified TT filter | 86,728,046 |
| Direct tactical forwarding | 92,124,159 |
| Initialization-bound frontier provider | 92,254,913 |

Final throughput increased approximately **52.3%** over baseline. Baseline/final captured windows were 55,036.7481 / 55,036.7283 ms; measured process CPU was 50,843 / 53,156 ms. Process CPU includes profiler-worker overhead. Different checkpoints reach different portions of the tree; source sample estimates are not per-invocation stopwatch measurements.

Final depth-21 expanded nodes: **9,970,194 → 15,157,320**; cutoffs: **78,053 → 92,927**; exact TT returns: **4,510,074 → 6,517,976**. This records more work reached, not different pruning for identical completed work.

A separate completed depth-8 ABBA comparison used fresh processes and identical bounds/resources: mean search time **1,814.51955 → 1,729.33075 ms** (4.7% lower), CPU **1,961 → 1,875 ms**. Every recorded search, proof, descriptor and operation counter matched exactly. Both completed with 4,777,115 calls, 672,690 expanded nodes, 2,424 cutoffs, 221,398 local states and 4,014,763 unresolved horizon leaves. The result remains unknown at the horizon, not draw. Two runs per variant establish only a limited timing sample.

## Qualification, remaining costs and cleanup

Final local qualification: **69 controls passed; six campaigns passed** (slot64 residual, semantic replacement, dependency parallel, ExploreHint, physical terminal boundary and independent pruning). Ten residual representation controls passed. CI routing includes the scalar-provider comparison control. Remote CI was not run. Earlier failed intermediate controls and slower candidates remain recorded in the evidence directory.

Remaining ranked costs include TT status/generation acquisition, canonical chunk access, support landing extraction, exact descriptor materialization/comparison, recursive proof policy and frontier propagation. These remain necessary under their current owner contracts; this pass does not claim all possible optimizations or the earlier whole-engine audit are complete. Exact comparison cannot be replaced by hash equality. Proof locks/reset quiescence cannot be removed based on a single-worker timing run; measured proof/bucket waits were zero. Exact term and frontier propagation still write required numeric payloads. Generic public descriptor validation retains type guards and cold error diagnostics; this is not a claim that all source-level string literals or every copy has been removed from the import graph.

All solver children and profiler workers exited; the final process inventory found none running. No more test runs were launched after the user's timeout question. Changes remain uncommitted. Depth 21 remains incomplete. Next performance owner: remaining repeated TT/descriptor work and support extraction, with equal-work qualification before any further boundary changes.

Evidence: [final source-mapped CPU ranking](evidence/2026-09-12-ranked-depth21/initialized-bound-access/profile/line-cpu.md), [baseline ranking](evidence/2026-09-12-ranked-depth21/baseline/profile/line-cpu.md), [completed-work comparison](evidence/2026-09-12-ranked-depth21/verified-depth8-comparison.json), [final controls](evidence/2026-09-12-ranked-depth21/final-controls.log). Each profile includes frozen source snapshots, source hashes, counters, reservation and timeout outcome.
