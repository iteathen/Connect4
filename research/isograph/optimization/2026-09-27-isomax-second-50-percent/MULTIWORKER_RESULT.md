# Phase 2 selected seven-worker result

Date: 2026-09-27

Selected profile:
- 7 workers;
- six deep + one root-frontier;
- 4M shared exact;
- 1M local exact per worker;
- full sharing;
- private 262,144-entry support plan per worker.

Control: `fb81d150...`
Candidate: `ad871518...`

Workflow run `36359137924`, artifact `10944872966`,
digest `sha256:fca442cdc8c38856a35b529e9d44eb6714fddffedab009435a6b20e85c82eed4`.

On `353335714`, eight paired blocks:
- **cycles -59.293%** [-59.922%, -58.665%];
- **wall -59.488%**;
- **all-worker nodes -79.042%**;
- winner nodes ~4.289M -> ~0.848M;
- exact W/D/L/root move unchanged.

Shared exact hits fall ~84%, but whole solve cost falls ~59%. Therefore lost
shared evidence is not a reason to insert a shared-exact-precedence probe into
the hot path. The local bound is economically more valuable on this workload.

Short control `45461667` is statistically neutral.

All seven workers perform material work; the prior idle-second-worker regression
is absent.

The second cumulative 50% target is now crossed on the selected multiworker
configuration as well as the local lane.

Next gate: official Fhourstones `35333571` under the unchanged 120-second
application ceiling, followed by promotion review.
