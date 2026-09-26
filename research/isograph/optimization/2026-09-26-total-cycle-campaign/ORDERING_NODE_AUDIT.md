# Ordering slowdown audit: all-worker visits

Question: is the score-only candidate slower per node, or doing more search?

## Exact code audit

Compared selected JSMinSys 49f88b2b0cd45ae427f43ceece568a4895953e5f with
e016360d9c8d20aae5dace5b6d735e37975cc4c9. Production addon diff has only:
(1) default geometry action order center-out -> input columns 0..6;
(2) removal of worker-index rotation override.
Recursive insertion sort, score calculation, CPC pruning/proofs, transitions,
and caches are byte-identical. There is no hot center-score calculation or
secondary tie comparator to remove: default order is prepared cold. The stable
score sort lets this input order determine ties. Other commit changes are the
ledger and candidate guards. Exact addon diff is preserved.

## Diagnostic method

Four workers, 45461667, existing harness 7a1a4166, same cache/configuration.
Two ABBA blocks per comparison (four samples per arm), sequential fresh processes.
The existing diagnostic loader redirects the existing node increments into a
private 64-byte-padded shared slot per worker. Reads occur after shutdown/join.
No per-node atomics, callbacks or logging. Count includes losing/cancelled
workers, not only the winner. Each winner count agrees with production metrics;
all totals and cycle partitions validate. All 16 samples solved correctly and
cleaned up. Source identities and loader hashes are recorded.

Instrumentation changes generated code. These figures diagnose search work;
the previous uninstrumented measurements remain the performance evidence.
Node means count recursive entries, not unique q states or Fhourstones-standard
nodes. No exact duplicate-state measurement was performed.

| Change | Baseline mean nodes | Candidate mean nodes | Nodes delta | Mean cycles/visit A -> B | Cycles/visit delta | Diagnostic total cycles delta |
|---|---:|---:|---:|---:|---:|---:|
| Center preference removed, worker rotation retained | 2,881,229 | 3,238,017.25 | +12.38% | 5864.79 -> 5831.90 | -0.56% | +11.73% |
| Center preference and worker rotation removed | 2,895,923 | 4,835,718.25 | +66.98% | 5816.50 -> 5362.75 | -7.80% | +53.95% |

Each cycles/visit value is mean whole-process cycles divided by visited nodes
within each sample, then averaged. Includes setup and all-worker CPU cycles.
These are descriptive small-sample means, not separate significance claims.

## Interpretation and correction

On this fixture the slowdown is accompanied by increased work, not increased
mean cost per visited node. The combined candidate is cheaper per visited node
but visits about 1.94 million additional nodes across workers. The uninstrumented
+53.71% cycle result is reproduced closely by +53.95% in this diagnostic.
The center-only +10.13% uninstrumented result similarly accompanies +12.38%
more visits with nearly unchanged cycles/visit.

It was incorrect to attribute the combined result to center preference alone.
Removing worker order diversity was another change. The measurements establish
extra visits; they do not prove how much comes from duplicate traversal, altered
alpha-beta cutoffs, shared-cache timing, or a particular tie at a particular node.
Similar worker counts alone are not proof of duplicate search.

No hidden production-code change or counter-total discrepancy was found in this
audit. This is not proof of universal correctness or of an optimal ordering policy.
The baseline's already reported pooled-frontier assertion failure remains open;
no full-green/NEES claim is made. No solver/pin changed during this audit.

Reproduction: node audit-ordering-nodes.mjs HARNESS OUTPUT BASELINE NATURAL_TIES
SCORE_SORT_ONLY, using Node26.7.0 and the exact paths/revisions in the manifest.
The script applies --experimental-ffi and the diagnostic loader to every sample.
