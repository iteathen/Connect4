# CPC six-state proof mask — local rejection

Date: 2026-09-28. Disposition: **CPC_PROOF_MASK_REJECTED_LOCAL_WHOLE_SOLVE**.
Plan: [CPC_PROOF_MASK_PLAN.md](CPC_PROOF_MASK_PLAN.md).

A=`be7c2887defcefb37080fa61de7ce1dc38dc2990`.
B=`7f74e324457c4237590bc6b0f924852f6d728e4c`.
The selected continuation remains **be7c2887**; the proof-mask runtime is not selected.

## Evidence

- RED b4b1495 / Verify36461231312 preserved; only new representation controls failed.
- GREEN normal Verify36464380804 passed verify/schema/node compatibility.
- Local180/180 tests, source seals/catalog, generated checks and audits passed.
- Differential24757 CPC evaluations against A match kinds, decoded proof and
  all other scratch state on4x4/7x6/8x5 and both frontier/advisory settings.
- All16 primary samples completed EXACT: rootWdl=-1, move=4.
- Four workers, one wide + three deep; all performed work and exited cleanly.

Local Windows11Pro10.0.26200, i5-12600K10physical/16logical,34088599552bytes RAM,
Node26.7.0/V814.6.202.34-node.28. QueryProcessCycleTime across process threads.
Eight balanced AB/BA pairs on353335714, clean fixed worktrees, fresh processes,
rootFrontier=true, shared4194304/private1048576 each, mask0. No strategist.

| Metric | A mean | B mean | Mean paired delta | Descriptive95% paired interval |
|---|---:|---:|---:|---:|
| Process solve cycles | 38229389027.5 | 38539189725 | +0.832% | [-1.228%, +2.892%] |
| Wall ms | 2470.924 | 2493.592 | +0.943% | [-1.251%, +3.137%] |
| CPU ms | 10347.875 | 10430.125 | +0.823% | [-1.583%, +3.229%] |
| All-worker nodes | 4579350.875 | 4597133.375 | +0.393% | [-0.232%, +1.017%] |
| Winner nodes | 1270081.875 | 1268720.375 | -0.104% | [-1.753%, +1.545%] |

No improvement was established. This interval is not proof of a general slowdown.
No favorable-subset selection, tuning retry or pooled local/hosted denominator.
No additional hosted performance or hard run after this non-promising result;
hard120000ms ceiling unchanged. Normal hosted Verify is not performance evidence.

## Meaning

The exact six-state proof algebra is retained. The realization publishes one
proof byte, refines a local scalar and decodes one constant nibble at search
consumption. It preserves CPC semantics, cache1..3 codes, packed tags/rows,
private weak bounds and exact-only sharing. No close-only fusion was introduced.
Less scratch traffic did not establish cheaper whole solving. Decode/control/JIT
cost is a possible offset, not an isolated measured cause.

Independent review exposed inherited CPC accounting undercounts. Candidate
direct loads/stores were recounted and regression-tested before timing. The
selected interval implementation needs its own interval-specific accounting
correction; copying the rejected mask ledger there would be wrong. The existing
selected K/STOP_TEST repair remains intact.

## Durable artifacts and next lead

[JSMinSys full report, raw samples, environment and blob hashes](https://github.com/iteathen/JSMinSys/tree/1aa2159/evidence/isomax-phase2-cpc-proof-mask-20260928).
Source7f74e32; harnessc6e2fda; raw36022ca; analyzed result1aa2159.
PR118 was [closed without merge](https://github.com/iteathen/JSMinSys/pull/118#issuecomment-5876061951)
as a rejected runtime experiment. Its branch and RED/GREEN history are retained;
final evidence checkpoint acf9639 reconciles the plan/progress status.
PR84 remains outside this experiment and must not be merged.

Next bounded hypothesis: [prepared private epoch prefix](PRIVATE_EPOCH_PREFIX_PLAN.md).
It starts from be7c2887, not this rejected candidate, and has no performance claim.

## Owner-requested standard Fhourstones follow-up

2026-09-28: all four official inputs tested once per arm with the same fixed
A/B sources above. Four workers (one wide + three deep), same caches/runtime,
120000ms per input. Eight fresh processes; both arms solved1/4, timed out3/4.
All four workers performed work in every run and every shutdown was clean.

| Input | A wall seconds | B wall seconds | Result both | A visits | B visits |
|---|---:|---:|---|---:|---:|
|45461667|0.170|0.169|EXACT WDL1,move3|121210|119404|
|35333571|120.029|120.036|TIMEOUT|216797914|218238709|
|13333111|120.044|120.056|TIMEOUT|197370374|198451015|
|Empty|120.026|120.044|TIMEOUT|258629043|263558413|

Only the first pair completed; its cycle delta was +0.140%, wall -0.936%.
Single pairs do not establish a confidence interval or promotion. Timeout
throughput is descriptive only; no exact solve-speed ratio or completed
Fhourstones score. The earlier repeated exact qualification rejection remains.

[Full report and raw evidence at JSMinSys105cf98727f01d4a79560c64656bf9f27f7c8105](https://github.com/iteathen/JSMinSys/tree/105cf98727f01d4a79560c64656bf9f27f7c8105/evidence/isomax-phase2-proof-mask-fhourstones-20260928).
Includes cycles,cycles/visit,CPU,throughput,per-worker data,hardware,source SHAs
and hashes. Solver source unchanged. The old exact harness rejected the normal
TIMEOUT/102 result after baseline35333571; raw evidence was retained, only cold
timeout classification/resumption corrected, and no sample was rerun.
