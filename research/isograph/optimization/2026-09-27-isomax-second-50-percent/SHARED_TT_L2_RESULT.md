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

## Owner-selected continuation

Shared TT is now fixed at10GiB(268435456entries) for remaining tests. This is an owner-selected testing configuration,not an inferred optimum. The final same-source hard pair on35333571 completed exactly(-1,move4):2.5GiB90.4928611s/1233665886145cycles/147074193nodes;10GiB91.0900836s/1239509668337cycles/143525402nodes. One pair cannot establish broader capacity economics,especially empty-board search. Owner explicitly rejected generalizing this to a2.5GiB optimum and selected10GiB; no additional empty-board run now.

Source6bbba7c repairs startup typed-array view truncation after worker transport of4/8GiB views; SAB backing was preserved. Restore header once,no copies/growth/hot-loop changes.180tests/catalog/generated audits passed; accounting-only correction a1c6aa7. Failed and harness-interrupted attempts remain preserved. Evidence at JSMinSys experiment/isomax-memory-affinity-20260928/evidence/isomax-memory-affinity-20260928/. Continue default-off,placement and private-cache experiments with10GiB fixed.

Startup control completed: preload-off-v2 ABBA, all4 EXACT(-1,move4),10GiB shared,private1M,source6bbba7c. Mean process cycles no-preload1244456764538 versus disabled preload1243962372516.5 (-0.040%). Two pairs only; no speed qualification claimed. Raw data/summary pushed in JSMinSys1c6aa84. Placement8-process comparison now running; private-cache screens follow.

Placement ABBAABBA complete:8/8EXACT(-1,move4),all4workers active/clean,10GiB shared/1M private. Pinning to4distinct P-cores versus unpinned: process cycles -33.6748% [95% paired -35.4091%,-31.9406%]; wall -38.2633%; nodes +2.6851%. Means cycles1.240338T versus0.822664T; wall91.1196s versus56.2547s. This qualifies placement for this host/fixture/profile,not universal hardware or L2-residency proof. Raw/analysis JSMinSys0271766. Private-cache screens now hold placement pinned in both arms.
