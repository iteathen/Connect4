# Shared-TT and L2 campaign — execution results

Status: IN PROGRESS. Canonical plan remains SHARED_TT_L2_EXPERIMENT_PLAN.md.
Owner authorized execution. Selected solver remains be7c2887defcefb37080fa61de7ce1dc38dc2990;
no proof-mask stacking, no hot-loop/solver edits. Node27.0.0-nightly20260928b59840b593,
Windows11Pro10.0.26200,i5-12600K,4workers(1wide+3deep),full sharing.

## M16 empty-board observation

Shared67108864,private1048576 per worker,600000ms,unpinned.
TIMEOUT600028.2634ms;rootWdl=null;1318300093nodes;
8133553305152process cycles;2205126msCPU;305322080shared hits;
48791093stores;436562contention;peakRSS2944532480bytes.
All4workers active/exited;cleanup=true;errors=[]. No solve claimed.
Earlier same-source/nightly4M shared run also timed out600017ms:
1478258352nodes;8158168537640cycles;204649042hits;43019502stores.
Noncontemporaneous censored windows do not establish an exact solve-speed ratio.
More reuse coexists with higher per-node cost; repeated completed controls decide.

Raw checkpoint: JSMinSys ba19a8f, evidence/isomax-memory-affinity-20260928/.
[Evidence branch](https://github.com/iteathen/JSMinSys/tree/experiment/isomax-memory-affinity-20260928/evidence/isomax-memory-affinity-20260928).

## Cold placement prerequisite

Implemented in JSMinSys e7e5499; review fixes e76294b.
Generic optional Windows x64 affinity API + inherited --import startup preload.
No canonical/generated search edits; no per-node branch/call. Actual discovery
reports P-core targets(group0,processor0/2/4/6),distinct physical cores,L2=1310720B.
Native pinned preflight recorded accepted masks1/4/16/64 and exact-1/move4.
178/178tests,catalog/generated/audits passed. Direct interval-CPC ledger counts
corrected source-neutrally rather than copying the rejected mask formula.
Independent review confirmed ABI offsets/direct counts and caught inherited env
exposure plus stale summary; both fixed before shared comparison. FFI/OS/cold IO
costs remain nonzero symbolic; full physical host/worker cycles are measured.
No claim of L2 residency/exclusivity or performance promotion.

Next: shared-capacity ABBAABBA on35333571 at300000ms,then separately default-off
preload,placement and private-cache stages. Do not interpret a short preflight
as memory qualification. Preserve all raw samples and censored controls.
