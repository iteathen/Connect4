# CPC-owned immediate win: guarded removal of duplicate transition checks

Owner clarified that CPC should retain immediate-win detection. The candidate
removes the redundant test from native recursive move transitions after CPC
has already proved there is no immediate mover win. It does NOT remove CPC's
first-win priority or make child-state opponent analysis substitute for it.

Control: no-draw candidate 14d6b8f32ebf7ec938a21940f1cebec63ca3f912.
Tested candidate: 56a132f711ad41e3f088ddeb2187497ad2c6eeb8.
Final experimental head: 49f88b2, documentation and source-hash-only correction
after measurement. Harness Connect4: 7a1a4166. Production pins unchanged.

## Implementation and proof scope

Both forced and ordinary searchCpcOnly calls now use the common nonwinning
cofactor body. CPC_EXACT returns before either call. Parent word/basis slices
are distinct from child slices, so sibling recursion does not invalidate that
proof. No per-transition mode flag, allocation or string was introduced.

The checked entry still owns win detection for root witness selection, ingress,
and optional Four-Front callers, then delegates to the same body. It proves the
selected move nonwinning; CPC recursion proves all legal moves nonwinning.
Stone-count full-board detection stays in the common body. Root checks remain
necessary to identify a valid witness; this candidate makes no claim that they
were removed. CPC itself is byte-identical to the no-draw control.

## Complete-operation production results

Four-worker Lazy SMP, input 45461667, mask 7, 65,536 local/shared entries,
30-second ceiling. Windows Intel i5-12600K, Node 26.7.0 / V8 14.6.202.34-node.28.
Initial four ABBA blocks then an eight-block confirmation because the initial
interval overlapped zero. All 48 uninstrumented samples were retained. Every
sample produced exact WDL +1, zero-based move 3, clean shutdown and all worker
exits. No failed sample, retry, or timeout extension.

| Screen | Paired total-cycle change | Descriptive 95% interval | Paired wall change |
| --- | ---: | ---: | ---: |
| Initial, 4 blocks | -1.724% | [-5.877%, +2.429%] | -1.582% |
| Confirmation, 8 blocks | -1.825% | [-2.867%, -0.784%] | -1.778% |

Confirmation wall interval: [-2.946%, -0.611%]. Every confirmation block favored
the candidate on total cycles; the initial screen included two losing blocks.
No local or phase-only improvement substitutes for the total-process measure.

Confirmation arithmetic arm means:

| Metric | No-draw control | CPC-owned transition |
| --- | ---: | ---: |
| Total process cycles | 16.837 billion | 16.530 billion |
| Joined-solve time | 1.0254 s | 1.0072 s |

Bootstrap, setup, workers, shared traffic and terminate/join are included in
cycle totals; partitions close. This remains one workload on one host, not
full performance or NEES qualification. Descriptive t intervals do not establish
host stationarity. Retain for broader tests, do not promote yet.

## Separate diagnostic, including contrary evidence

One instrumented ABBA block, excluded from production acceptance:

| Mean metric | Control | Candidate |
| --- | ---: | ---: |
| All-worker visits | 2,955,344.5 | 2,954,770.5 |
| Total-process cycles/visit | 5,735.7 | 5,766.8 |

Visits were effectively unchanged (-0.019%). This small diagnostic did NOT
reproduce a per-visit cycle saving (+0.54%); retain that observation instead of
claiming isolated detector-cycle proof. It is only two instrumented samples per
arm and has the round-0 instrumentation uncertainty. The larger uninstrumented
confirmation is the primary evidence. No winner-only node denominator is used.

## Tests, review and provenance

Candidate transition differential and route tests passed (>200 guarded child
comparisons across 4x4/7x6 and mirrored frames). Selected first-win, independent
small/late standard-board solver oracle and Lazy SMP tests passed. A separate
nine-test cofactor absorption/configured-geometry run passed. Catalog verifies
297 sealed functions and 114 addon units; geometry audit passes. Source ledger
charges checked wrapper and callee separately with conservative envelopes, not
fabricated fixed hardware cycles. No full-suite/final NEES claim.

Independent read-only review found no experiment-invalidating issue; its minor
selected-action versus all-actions comment correction is commit 49f88b2. The
two candidate tests and catalog verification passed again after that comment
change. No runtime code changed after the measured SHA.

The earlier mistaken attempt to disable CPC itself was interrupted during tests
after owner correction; no performance results were taken and those changes
were removed before this candidate. It is not evidence about this mechanism.

Raw data: cpc-owned-win-production/, cpc-owned-win-confirmation/,
cpc-owned-win-nodes/. Diagnostic script retained beside its output. Both control
and candidate SHAs were pinned before child launch. Reproduce with the pinned
harness and fresh directory:

```text
node tools/isomax-cycle-campaign.mjs candidate NEW_OUTPUT NO_DRAW_CONTROL CANDIDATE 8
```
