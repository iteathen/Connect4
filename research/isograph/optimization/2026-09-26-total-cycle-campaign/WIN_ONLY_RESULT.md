# Win-only CPC: rejected on completed Fhourstones control

The requested ablation preserves the solved result but loses whole-operation
economics. Do not promote it. This finding concerns the combined removal on
this control, not a claim that every individual CPC deduction pays for itself.

Control JSMinSys: 93aca1758718bcbf0635c11a957a67ca6387d50c.
Candidate JSMinSys: 3574cb3 (experiment/cpc-win-only-20260926).
Harness Connect4: 7a1a41665d3f5b1a679c16598d60ae3d1035706d.
Production Connect4 pin remains unchanged at afbb8baa / JSMinSys 93aca175.

## Whole-operation result

Four ABBA blocks, eight fresh processes per arm, four workers; Intel i5-12600K,
Node 26.7.0 / V8 14.6.202.34-node.28, Windows. Input 45461667, mask 7,
65,536-entry local/shared caches, unchanged 30-second screening timeout.
Every sample solved exactly: WDL +1, zero-based move 3, all workers exited,
clean shutdown. No retries or omitted samples.

| Measurement | Current CPC | Win-only CPC |
| --- | ---: | ---: |
| Mean total process cycles | 17.797 billion | 25.875 billion |
| Mean joined-solve wall time | 1.058 s | 1.671 s |

Block-paired total-cycle increase: **45.46%**, descriptive 95% t interval
**[39.29%, 51.62%]**. Individual block increases were 45.32%, 47.63%,
40.07%, 48.80%. Joined-solve cycles increased 46.07%; wall time increased
58.09%. Ratios of displayed arm means can differ slightly from paired means.
Bootstrap, setup and solve cycle partitions all close exactly.

This exceeds the owner's one-percent regression threshold by a large margin.
It is negative screening evidence, not final NEES qualification or a full
four-input Fhourstones score. No larger benchmark or optimization stacking is
justified for this exact candidate.

## Separate node diagnostic

One instrumented ABBA block (two samples per arm), not used for promotion:

| Measurement | Current CPC | Win-only CPC |
| --- | ---: | ---: |
| Mean all-worker visits | 2,775,313.5 | 5,148,668.5 |
| Mean total-process cycles / visit | 6,368 | 5,109 |
| Mean all-worker visits / solve second | 2.645 million | 3.028 million |

Approximately **85.5% more visits**, **19.8% fewer cycles per visit**. This is
consistent with a cheaper per-node path being overwhelmed by extra work.
It is not an isolated measurement of detector instructions: workload mix,
cache behavior and multiworker execution also change. Instrumentation overhead
was not established below one percent in round 0, so these figures are
diagnostic and separate from the production comparison above.

The removed analysis also supplied forced blocks and action restrictions.
Consequently this tests win-only CPC as requested, not removal of only the
final WDL assignment while retaining the expensive predicates.

## Correctness, review, and reproduction

Nine selected tests passed: candidate behavior, both-player immediate wins,
independent small/late standard-board exact oracles, live-line ordering, and
Lazy SMP/sharing-density controls. Catalog (297 sealed / 113 addon units) and
runtime-geometry audits passed. Historical tests requiring removed deductions
are intentionally outside this candidate's acceptance; no full-suite claim.

Independent read-only review found no important flaw invalidating the test:
consumed intervals/restrictions clear each call, singleton membership and
playability match the original predicate, and terminal/cache ownership remains
unchanged. Minor unadded test coverage: nonzero offsets, stale precursor count,
and simultaneous mover/opponent threats. Advisory compatibility is not a
retention claim. No production strings, allocations, or mode branch were added.

Production command from the harness checkout:

```text
node tools/isomax-cycle-campaign.mjs candidate NEW_OUTPUT BASELINE_CHECKOUT CANDIDATE_CHECKOUT 4
```

Raw production data: win-only-production/. Raw node data and the exact cold
diagnostic script: win-only-nodes/. The diagnostic script records both revisions
before launch and validates all-worker counters after cleanup; its paths are
host-specific and its output directory must be fresh. The existing loader and
sample runner are pinned by the harness commit. No diagnostic numbers replace
the uninstrumented acceptance data.

Next possible hypothesis is a per-deduction ablation retaining cheap forced
blocks while independently testing expensive response/fork analysis. That is
a different candidate; this pass does not implement or assume its benefit.
