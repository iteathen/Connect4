# Tactical win/loss CPC without predictive draw/no-win bounds

Disposition: promising completed-control cycle saving; retain as a candidate,
not production promotion. User requested restoring loss detection after the
win-only ablation while leaving draw detection out.

Candidate JSMinSys: 14d6b8f32ebf7ec938a21940f1cebec63ca3f912 on
experiment/cpc-no-draw-20260926. Baseline main remains
93aca1758718bcbf0635c11a957a67ca6387d50c. Connect4 production and dependency
pin unchanged. Harness: 7a1a41665d3f5b1a679c16598d60ae3d1035706d.

## Exact scope

Restored immediate wins, opponent double threats, forced blocks, support-lift
losses, fork-preemption losses and action restrictions. Removed initial
residual-exhaustion/no-win bounds and final response no-win bounds. A no-win
bound is not necessarily an exact draw: it can also constrain a position that
ultimately loses. Thus this is not merely deleting a final draw return code.
Actual first-win and full-board draw detection remain in the RBA transition.

## Production measurements

Input 45461667, four Lazy SMP workers, sample mask 7, 65,536 local/shared
entries, 30-second timeout. Intel i5-12600K, Windows, Node 26.7.0 / V8
14.6.202.34-node.28. Two separate four-block ABBA screens: 32 fresh processes,
16 per arm. No instrumentation in production samples. All returned WDL +1,
zero-based move 3, all workers exited and clean shutdown. No retries.

| Screen | Paired total-cycle change | Descriptive 95% interval | Paired wall change |
| --- | ---: | ---: | ---: |
| Initial | -3.093% | [-5.776%, -0.410%] | -0.471% |
| Confirmation | -3.768% | [-7.333%, -0.202%] | -1.260% |

All eight paired blocks favored the candidate on total process cycles. Wall
intervals span zero in both screens: no established elapsed-time speedup.
The short, same-host repeats are not proof across other workloads/hosts.

Across all 32 samples, descriptive arithmetic means:

| Measurement | Full CPC | Candidate |
| --- | ---: | ---: |
| Total process cycles | 17.506 billion | 16.903 billion |
| Joined-solve wall time | 1.0381 s | 1.0289 s |

Bootstrap, setup, all worker work, shared traffic and terminate/join costs are
included in total cycles; disjoint partitions close. No local saving is used
in place of the whole-operation result. Ratios of arm means differ slightly
from block-paired ratios; do not interchange the statistical estimands.

## Separate all-worker diagnostic

One ABBA block, two samples per arm, instrumented and excluded from production
acceptance:

| Mean metric | Full CPC | Candidate |
| --- | ---: | ---: |
| All-worker visits | 2,813,552 | 2,875,811.5 |
| Total process cycles / visit | 6,319 | 5,847 |
| Visits / solve second | 2.690 million | 2.803 million |

About 2.2% more work and 7.5% fewer cycles per visit in this diagnostic. That
pattern is consistent with retaining valuable tactical pruning while reducing
analysis overhead. It is not a causal decomposition of exact detector cycles:
workload mix, scheduling, caches and instrumentation also differ. Round-0
instrumentation overhead remains uncertain; do not substitute diagnostic cycle
ratios for uninstrumented acceptance data.

## Qualification and disposition

15 selected tests passed: retained loss/fork/first-win consequences, new
no-predictive-draw expectations, independent small/late 7x6 exact oracles,
ordering and Lazy SMP/sharing-density checks. Catalog and runtime-geometry
audits passed. No unchanged full-suite claim: tests demanding deliberately
removed deductions are outside this ablation's acceptance. No final NEES or
full four-input Fhourstones qualification is claimed.

Independent read-only review found no issue invalidating the experiment.
Removed deductions weaken bounds; retained proofs do not rely on those bounds.
Scratch reset, terminal, and exact-cache ownership remain intact. Review also
confirmed that calling the removed bound work only draw detection is incomplete.

This is substantially better than the prior win-only candidate, which lost
45.5% whole-operation cycles, but comparisons here use freshly measured full-CPC
controls rather than treating earlier wall times as contemporaneous controls.
Keep the candidate for a broader completed-position and mirrored-root campaign.
Do not merge on one input, and do not infer that every draw-related deduction
loses individually. Splitting exhaustion from response-bound analysis is a
future causal experiment, not a result of this test.

## Evidence

- no-draw-production/: initial immutable raw outcomes and summary.
- no-draw-confirmation/: fresh repeated screen, same candidate/harness.
- no-draw-nodes/: separately labelled counters and exact diagnostic script.
- NO_DRAW_PLAN.md: pre-run scope/configuration checkpoint.

Reproduce from the pinned harness using clean baseline/candidate checkouts and
a fresh output directory:

```text
node tools/isomax-cycle-campaign.mjs candidate NEW_OUTPUT BASELINE_CHECKOUT CANDIDATE_CHECKOUT 4
```
