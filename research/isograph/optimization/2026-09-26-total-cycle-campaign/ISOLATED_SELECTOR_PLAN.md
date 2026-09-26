# Isolate selector cost before varying search policy

After the owner's challenge, isolate lazy next-action selection alone against
selected candidate 49f88b2. Branch experiment/lazy-selector-isolated-20260926
retains CPC restrictions, forced transit, action tie order, worker rotation,
root behavior and cache publication. Recursive insertion sorting is replaced
by lazy argmax in the same prepared action-order slots. Excluded slots are
sentinels. Per-depth numeric score views are prepared once so child recursion
cannot overwrite parent scores. Root ordering remains unchanged in this unit.

This is a diagnostic control, NOT substitution of these mechanisms into the
owner's requested strict live-line-only final candidate. It tests whether lazy
selection itself explains the previous combined regression. Subsequent policy
ablations must be separate and preserve their actual scope.

Ten targeted tests and catalog verification passed. Exact ordered full-q and
depth traces match control on 45461667 (832,445 node visits), plus a late root
and its mirror at four worker offsets. Result and all serial metrics also
match. Trace instrumentation is test-only and excluded from timed runs.
The development trace predates commit; the committed trace pins the immutable
candidate revision. No single-worker product benchmark is claimed: these are
internal serial correctness traces only.

Production comparison: four workers, 45461667, mask 7, capacities 65,536,
30-second timeout, four ABBA blocks using committed harness 7a1a4166. Include
all process cycles and cold score-view setup. Preserve every sample. Follow
with separate diagnostic counters; repeat if effect is small or uncertain.
Production dependencies remain unchanged. No final NEES or broader promotion.
