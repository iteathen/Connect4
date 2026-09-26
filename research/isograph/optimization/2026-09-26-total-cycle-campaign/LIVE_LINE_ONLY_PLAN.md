# Strict lazy live-line move selection

Owner requests no CPC or center machinery in move ordering. Baseline is selected
candidate JSMinSys 49f88b2b0cd45ae427f43ceece568a4895953e5f. New experiment:
experiment/live-line-only-lazy-20260926; committed exact SHA in run manifests.
Connect4 harness 7a1a4166. Production pins unchanged.

Active Lazy SMP/CPC-only path scores every legal landing cell only by live-line
contribution. Natural numeric column order breaks equal scores. Removes center
order indirection, per-worker tie rotation, CPC forced transitions/action masks,
and eager insertion sorting. Prepares score views per depth over one numeric
backing store at initialization, then chooses the next maximum lazily using
existing JSMinSys argmax helpers. No move-list allocation or hot view creation.
All legal scores are computed before the first pick, because the maximum needs
comparison; selection of later actions stops at cutoff.

CPC remains the exact state detector before expansion, including first-win and
proved-loss results; it neither scores nor restricts moves. Restriction producer
stores were removed while fork-loss intersection proofs remain. RBA terminal,
board count and checked root witness semantics remain. Optional Four-Front code
is outside the measured live-worker path, not an additional candidate model.

Initial tests: selected independent small/late 7x6 oracles, first-win, ordering
and Lazy SMP/sharing-density (10); candidate source/storage checks and cofactor
differential/absorption (6, including two overlapping candidate tests). Catalog
114 units and runtime geometry audit pass. No full-suite/final NEES claim.
Ledger adds lazy selector calls and per-depth setup storage; retained old fixed
envelopes conservatively overcharge deleted work. All process cycles govern.

Run four-worker ABBA, four blocks, input 45461667, mask 7, 65,536 local/shared
entries, 30-second ceiling. Compare against selected candidate in same blocks.
Preserve failures/no retries. Separate all-worker instrumented ABBA diagnostic.
If promising or too noisy, independent confirmation; no single-control promotion.
This combined machinery ablation does not isolate each constituent's benefit.
