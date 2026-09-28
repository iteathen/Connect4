# Selected-production local official hard — suspicious, investigate

**Disposition: CENSORED / SUSPICIOUS. The results warrant investigation and do
not close JSMinSys PR #84's official-hard promotion gate. No promotion recommended
from this run.** This is local-host evidence, distinct from the hosted Windows
and derived-long controls already recorded in SELECTED_PRODUCTION_RESULT.md.

## Exact scope

- Control: `iteathen/JSMinSys@a3cf7f9ca5c90e5025542c3b27ab0b735a610e9a`.
- Candidate: `iteathen/JSMinSys@00ecc7d20ed08ee9585c92aa8441a8ef3969b7ee`.
- Official fixture `35333571`; unchanged 120000 ms application ceiling.
- Two complete ABBA blocks, eight fresh processes; no single-worker qualification.
- Seven workers, six deep + one root-frontier; shared capacity 4194304,
  local capacity 1048576/worker, sharedSampleMask=0, rootFrontier=true.
- Windows 11 Pro 10.0.26200, i5-12600K, 10 physical / 16 logical processors,
  34,088,599,552 bytes RAM, Balanced power plan; Node 26.7.0,
  V8 14.6.202.34-node.28, Windows QueryProcessCycleTime.
- Each fixed source's own selected runner; clean sources, identical runner/profile.
  No solver, ordering, memory, timeout, strategist or research-stack changes.
- Run September 27 local time / September 28 01:14:55–01:31:30 UTC.

## Observations

Means of four fixed-window samples per arm, **not whole-solve costs**:

| Metric | Control | Candidate |
|---|---:|---:|
| Exact / timeout | 0 / 4 | 0 / 4 |
| Process cycles | 1.673613 trillion | 1.673319 trillion |
| Wall | 120.062 seconds | 120.059 seconds |
| CPU | 453.871 seconds | 454.074 seconds |
| All-worker nodes | 243.052 million | 209.910 million |
| Winner nodes | unavailable | unavailable |
| Shared hits | 39.817 million | 33.447 million |
| Shared stores | 19.899 million | 27.721 million |
| Cycles/node | 6,885.81 | 7,971.81 |

All eight samples: rootWdl=null, move=-1 (no result), errorCode=102 documented
deadline, errors=[], cleanup=true, workersExited=7. All seven workers did
meaningful work; minimum individual count 13.312M. No idle-worker regression or
leftover benchmark process found. Exact expected WDL=-1/move=4 from prior qualified
evidence was a cold validation condition only; no sample produced it here.

Fixed-window descriptive candidate changes: nodes -13.636%, shared hits -15.998%,
shared stores +39.307%, cycles -0.01755%, wall -0.00279%. These are censored
observations, **not exact solve-speed improvements**. Paired solve-cost deltas and
95% confidence intervals are not admissible. Repeats are close (node CV control
0.169%, candidate 0.647%), which does not rule out systematic contamination.

## Why investigation is required

The earlier local control at `b6ce1c541807b0123cf8f5dab759dcccd6a93f3b` solved in
83.133 seconds with WDL=-1/move=4 and 412.369M nodes. Its solver/runtime/profile
paths are byte-identical in Git to current fixed control `a3cf7f9`; only evidence
and a cold verifier changed outside them. Declared hardware/runtime match.

Earlier aggregate CPU/wall was about 6.971; now it is about 3.780. Current control
throughput is 2.024M nodes/s versus 4.960M previously. This is an unexplained
execution discrepancy, not established evidence of a code regression. Complete
versus censored work scopes differ. No normalization or cause attribution is made.

Read-only checks found normal priority, full 16-processor affinity, no orphan
solver, and tiny cold-controller CPU consumption. They do not exclude scheduling,
throttling/QoS, contention, launch environment, or measurement-attribution effects.
Harness interference has neither been demonstrated nor completely ruled out.

One initial control output is also preserved: the cold controller rejected valid
TIMEOUT code 102 before B started. Only validation was corrected, and the entire
ABBA block restarted. Nine processes total, eight in complete blocks; no silent
sample deletion. This interruption is not a solver failure.

## Durable evidence and disposition

- [JSMinSys report and evidence](https://github.com/iteathen/JSMinSys/tree/dcbc01088e8ab4af9bff9e78afde0307e44e2d43/evidence/isomax-phase2-selected-production-local-hard-20260927).
- Raw eight-sample commit: `a1efbff19c4bc15398f91162423209b6edccbb2e`.
- Analyzed report commit: `dcbc01088e8ab4af9bff9e78afde0307e44e2d43`.
- Contains complete runner stdout/stderr, samples.jsonl, environment, commands,
  timestamps, manifest, analysis, preflight logs and bounded source review.
- Candidate preflight: 29 correctness tests; generated mirrors, catalog and
  geometry/hot-call audits pass. Public/shared exact-only and private-bound
  boundaries preserved by review. Verify/schema/Node compatibility green at
  checkpoint 2adc347, run 36365782434; subsequent evidence-only CI tracked on PR #84.

Retain earlier short -2.641% cycle and derived-long -66.8335% cycle results as
separate evidence. The official hard local exact/non-regression gate remains
unmet. PR #84 stays draft/pending investigation; no merge. This record adds an
empirical qualification observation, not new gameplay authority or claim IDs.
