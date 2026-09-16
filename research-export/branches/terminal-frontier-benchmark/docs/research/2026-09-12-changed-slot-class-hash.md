# Reuse class identity work at changed relational slots

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

## Assessment, research and plan

Continues the [relational address investigation](2026-09-12-relational-address-investigation.md)
at HEAD `0317c1c95eeae2e6b3e60040eed57198f4f5f9eb` plus the preserved working tree.
The user authorized replacing the extra class-tuple hash traversal with work
integrated into the transition's existing changed-slot loop.

AGENT_LOCAL, C4-0006 residual normalization and C4-0010 semantic/proof separation
require exact canonical identity. Slot position is already present. Local chunk
IDs remain stable within each slot owner; they are not cross-worker semantic IDs.
The existing class hash array can own the new address filter without more storage.

## Executed change and invariant

`quotient-slot64-residual-pool-v2.mjs` removes `hashChunkTuple`. The two residual
construction paths now use this local composition:

```text
contribution(slot, chunkId) = mix32(chunkId XOR imul(slot + 1, 0x9e3779b1))
H(class) = XOR of contributions at all its slots
```

Bootstrap folds contributions while constructing its first tuples. A child
starts with the parent's stored hash. Each changed slot XORs out its old
contribution and XORs in its new one. An unchanged slot performs no fingerprint
work. `internBits` applies this after mover normalization, while `blockTransition`
applies it where the changed canonical chunk ID is already produced.

Because `x XOR x = 0`, unchanged contributions survive and replaced contributions
cancel exactly. The result equals full composition independent of transition
history. Slot-dependent contributions avoid treating identical numeric IDs from
different slot dictionaries as the same coordinate. They remain a compressed
address filter, not a collision-free encoding. Exact ordered tuple comparison is
unchanged and remains authoritative. The hash is converted to Uint32 before
comparison/publication to the existing class hash array.

No board reconstruction, new retained arrays, objects, strings, parsing, copies,
waits or hot reporting were introduced. No compatibility path or old full-tuple
hash remains. Chunk key interning, class capacity, growth/recovery, shared semantic
hashing, TT generations and proof policy are unchanged. Geometry and slot count
continue to derive from initialization.

## Narrow qualification, review and broader checks

Existing 21 storage controls passed first. A new maintained control in
`quotient-storage-contract.test.mjs` checks canonical convergence under reversed
blocker order and idempotent blocking, starting from several mover-reduced classes
in two multi-slot board geometries. It independently filters the parent term set
to check exact results. The same exercise runs with avalanche multiplication
outputs forced to zero before bootstrap, deliberately collapsing address filters.
The override is restored in `finally`; no production test hook was added.

An [isolated recomputation control](evidence/2026-09-12-changed-slot-hash/recompute-control.mjs)
inserts assertions into a generated copy of the owner. Every normal depth-8 class
lookup recomputes the fingerprint from its complete tuple and checks the delta
result. All **842,426** checks passed. Its result, search/proof/operation counters,
memory and growth match the uninstrumented candidate. Instrumented timing is not
performance evidence. Generated source and hashes remain in the evidence folder.

That control counted 8,424,260 terms in the removed full traversals versus
5,749,172 old/new contribution evaluations, a 31.75% reduction in contributions.
It also removes the sequential fold/final avalanche. Counting source `Math.imul`
calls for class hashing only gives 26,957,632 before versus 14,372,940 after;
these are arithmetic counts, not JIT instructions or CPU timing attribution.

Final source passed **61 controls** and four local campaigns:

- slot64 residual exact graph/action qualification across four geometries;
- semantic TT replacement;
- ExploreHint/Branch Manager;
- online dependency-aware parallel Negamax.

All [qualification logs](evidence/2026-09-12-changed-slot-hash/contracts.log) are
retained alongside per-campaign logs. Existing workflow path filters cover the
changed owner in the affected bounded campaigns and the changed storage test in
the slot64 workflow. No remote workflow or full-root trigger was launched.

## Same-bounds timing and source profile

Four sequential cold processes used the normal empty 7-column by 6-row connect-4
search, depth 8, hard 60-second child timeout, baseline/candidate/candidate/baseline.

| Measurement | Baseline mean | Candidate mean |
|---|---:|---:|
| Search elapsed | 1940.4546 ms | 1865.14285 ms |
| Process CPU | 2078 ms | 2032 ms |
| Kernel typed bytes | 86,580,999 | 86,580,999 |

[Raw comparison](evidence/2026-09-12-changed-slot-hash/comparison.json): elapsed is
3.88% lower and CPU 2.21% lower in this batch. Baseline elapsed ranged from
1887.305 to 1993.6042 ms; candidate ranged from 1862.198 to 1868.0877 ms. Two runs
per variant and the baseline variation limit the precision of the gain claim.
Retain the removed traversal with encouraging bounded timing; do not project this
percentage to a full-root solve.

All four results match every search/proof/descriptor/operation counter, kernel
memory and storage-growth field. There are 4,777,115 search calls, 221,398 local
states and 305,714 residual classes; root remains unknown at the horizon. No
storage grows during search. Proof work has not been silently dropped to improve
time.

The [frozen-source CPU report](evidence/2026-09-12-changed-slot-line-cpu/line-cpu.md)
completed in 1838.5541 ms, 2000 CPU ms, with 301 mapped source locations. Top
sampled lines are shared-TT status load (110.45 estimated CPU ms), chunk bucket
head read (78.16), and singleton-mask intersection (54.38). These are V8 sample
estimates with inlining/runtime attribution limits, not per-invocation stopwatches.

## Cleanup and next owner

[Unit patch and source hashes](evidence/2026-09-12-changed-slot-hash/source-manifest.json)
cover the two changed files against the pre-unit snapshot, with all-four-run
counter/memory verification. Earlier work remains intact and the baseline is
retained until integration. All test children exited. Audit, status, next-step
and research index are updated; no protected-main/ref mutation occurred.

Remaining measured work is led by shared-TT probing and chunk bucket access.
First-time semantic descriptor hashing is another possible structural reuse
unit. Hash distribution at larger loads and full-root sizing remain unqualified;
no new root readiness claim follows from this optimization.
