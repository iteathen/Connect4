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

## Continuation complete: private-cache screens and placement

All18 continuation samples (4disabled-loader,8placement,6private-screen) returned EXACT(-1,move4),all4workers active/exited,cleanup=true. Shared10GiB remained fixed. Private576KiB,1.125MiB,2.25MiB each lost against36MiB: process cycles +35.848%,+35.140%,+33.723%; nodes +66.875%,+65.518%,+61.209%. Each is one AB screen; no interval/universal optimum inferred. No smaller candidate merits confirmation. Retain1M private entries and qualified optional P-core placement for this host/profile. No additional empty-board test,production merge or cross-hardware default change.

Full combined report and complete raw data committed/pushed in JSMinSys fdb4f805c6a3668cffd9cbdc11e851ba2276b7f2:
[Ten-GiB continuation report](https://github.com/iteathen/JSMinSys/blob/fdb4f805c6a3668cffd9cbdc11e851ba2276b7f2/evidence/isomax-memory-affinity-20260928/CONTINUATION_REPORT.md).

The measured placement gain is not proof of L2 residency or a diagnosis of the specific Windows scheduling mechanism; unpinned residency was not traced. Smaller tables improve per-node cost but lose whole-solve economics on35333571. The tested10GiB setting remains owner-selected,not globally optimal by these results. No benchmark processes remained after completion.

## Candidate-only18/72MiB curve extension

Owner requested approximately15/100MiB and no repeated baseline. Native power-of-two capacities select18/72MiB;100MiB itself was NOT tested. Two new samples on same6bbba7c/nightly/4pinned workers/10GiB shared/hard35333571. Both EXACT(-1,move4),clean exit.18MiB:66.546s,972150131798cycles,196946287nodes.72MiB:40.683s,595178346882cycles,87351245nodes. Relative to existing four-run36MiB pinned mean:18MiB cycles+18.171%,72MiB-27.652%;72MiB nodes-40.670%. Historical-baseline descriptive comparisons only,not fresh paired qualification; no singleton confidence interval.72MiB is promising,not a proven global/empty-board optimum. No new baseline runs or global-default change.

Raw/report pushed: JSMinSys da5c391c315812d1718b4df63cf3faf2ff14f0e1, evidence/isomax-memory-affinity-20260928/PRIVATE_CURVE_RESULT.md.

## Candidate-only288/1152MiB extension

Owner next requested256MiB then1GiB. Nearest native capacities288MiB and1152MiB per worker; no repeated baseline. Same6bbba7c/nightly/10GiB shared/4pinned workers/35333571/300000ms. Both EXACT(-1,move4),all4active/exited,clean.288MiB:32.9349536s,482075353928cycles,60615217nodes.1152MiB:33.0614747s,483474833037cycles,59077579nodes.1152versus288:cycles+0.2903%,wall+0.3842%,nodes-2.5367%.288versus72:cycles-19.0032%. Singleton historical comparisons only; no paired CI or empty-board/global saturation claim. No production-default change. Full curve/raw pushed JSMinSys3380b1f06f16c5d8949421f492074042dc67a34b,evidence/isomax-memory-affinity-20260928/PRIVATE_CURVE_RESULT.md.

Owner200MiB request mapped to nearest native144MiB(4194304entries),not exact200. One candidate-only same-profile run:EXACT(-1,move4),34.0948028s,499079947062cycles,65526864nodes,4workers active/exited,cleanup=true. No baseline repeated. Historical288MiB32.935s versus144MiB34.095s suggests nearby curve flattening on this fixture only; singleton/noCI. Raw/report JSMinSysc15c9cb52e7a157976a9c3dbc4703f7ecefdcc40,evidence/isomax-memory-affinity-20260928/PRIVATE_CURVE_RESULT.md.
