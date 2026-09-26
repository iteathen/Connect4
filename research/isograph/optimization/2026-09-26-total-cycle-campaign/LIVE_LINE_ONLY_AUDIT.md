# Owner-challenged live-line experiment: interpretation suspended

Owner questioned the apparent 97.1% cycle regression. Raw evidence is retained;
do not treat that number as proof that live-line scoring or lazy selection is
inferior. The control already used the same live-line scoring function.

## Verified observations

Manifest pins clean baseline 49f88b2 and candidate 151b7ae, same Node/CPU,
four workers, input, timeout, cache sizes and sample mask. All 16 production
samples returned WDL +1 and move 3 with joined cleanup. No wrong-checkout or
instrumented-production sample was found. Four block cycle ratios consistently
range about 1.954 to 1.978. No counter failure demonstrated.

Separate diagnostic records are now preserved in live-line-only-nodes/.
Control all-worker counts: 2,913,950 and 2,893,149.
Candidate: 6,595,872 and 6,681,982. These are the same visit-counter sites in
both versions, not winner-only counts. Candidate winner visited 1,681,362
nodes versus control winner 722,220. This shows increased work in this combined
variant, without identifying its cause. Instrumentation is diagnostic only.

## Scope problem in my experiment

The diff simultaneously changed:

1. eager sorted list to lazy argmax and per-depth score views;
2. center-first ties to natural numeric ties;
3. worker-specific tie rotation to the same tie policy for every worker;
4. CPC move restriction/forced-block consumption and production;
5. iterative forced transit to ordinary recursive traversal.

The fifth change also alters exact-cache publication opportunities: the prior
forced-transit loop did not publish each intermediate parent on return; the
ordinary recursive path can. Therefore this was not an isolated selector-cost
test. Identical worker tie policy changes Lazy SMP diversity; actual duplicated
q work was not measured and must not be asserted from visit totals alone.

The literal combined variant is measured, but attributing its regression to
live-line-only ordering is not supported. No evidence currently shows a score,
argmax, per-depth scratch, WDL or cycle-counter implementation bug. The live-line
evaluator and new source/storage checks passed again during audit (3 tests).
Passing these tests is not a proof of the entire experiment's correctness.

## Accounting defect found and repaired

Independent review found the static source ledger omitted full-column sentinel
stores added by lazy scoring. Add O-L memory stores and correct stale comments
claiming restrictions remained unchanged. This is a real ledger defect; it does
not affect OS process-cycle measurements. The correction is a separate commit
on the experimental branch after the measured 151b7ae revision. Runtime source
and raw results were not rewritten. Catalog verification passed after repair.

## Disposition and next diagnostic boundary

Do not promote or use this result to reject the owner's move-order direction.
Selected candidate remains 49f88b2. First isolate selector mechanics with the
same actions/ties and verify identical serial expansion trace; then vary tie
policy, worker diversity and CPC pruning separately. Trace counts and cache
publication effects must stay explicit. Do not silently put rejected machinery
back into the requested final candidate or call a mixed experiment causal proof.

No additional performance rerun was performed during this audit: the same
combined comparison would not resolve the attribution problem.
