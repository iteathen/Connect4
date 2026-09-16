# Integrated identity ownership checkpoint

**Date:** 2026-09-12  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Governing optimization rule

The frontier solver now treats representation design as a compute owner. Prefer a
canonical representation that carries useful invariants across producer and consumer
boundaries over repeatedly deriving equivalent facts. Memory is an intentional compute
resource: fixed preallocation, lower table occupancy and retained invariant metadata are
acceptable when they reduce total exact solve work. A measured 0.5% total CPU change is
material on the recursive hot path.

## Proof-handle validation candidate cleared

Candidate `7d1d2caf4d556d6e4033e30d69a419936dcf7cb0` removes the duplicate
`assertStateId` from `rememberHandle`; parent is
`58770f4171772c9326d7f6c0e1d5bc50d60540a5`.

Paired run `34736592492`, job `103669004238`, used Node 26.7.0 with symmetric
warm-up and ABBA/BAAB order. Four samples per variant matched all exact search,
proof, descriptor, state/class and storage-growth counters. Mean search time was
2934.2991 ms baseline versus 2916.5463 ms candidate (0.605% lower); mean process
CPU was 3225.8495 ms versus 3204.2930 ms (0.668% lower). Median elapsed was
effectively flat (0.116% lower candidate). The earlier one-sample slowdown was
runner variance; the removal is retained and no longer blocks optimization.

## Direct packed semantic hashing promoted

The slot64 residual owner already stores the canonical residual set as packed DWORD
chunks. Previously a first semantic-class visit materialized that set into a Uint16
scratch sequence and then traversed the sequence again to compute the shared semantic
residual hash.

The promoted change adds `writeSemanticMetadata(id,target)` to the slot64 owner. It
walks the authoritative packed words directly in canonical term order and performs the
existing semantic hash arithmetic in that same scan. Hash values and exact identity are
unchanged. The descriptor cache uses the direct owner operation when available and
retains the original materialize/hash fallback for other/reference providers.

Candidate A/B run `34737153104`, job `103670495564`, passed storage contracts,
semantic-arena controls, complete bounded slot64 graph/evaluator qualification and
semantic-TT replacement before timing. Symmetric warm-up plus ABBA/BAAB produced:

- mean elapsed: 2926.8979 -> 2902.6285 ms (0.829% lower);
- median elapsed: 2900.7290 -> 2901.1833 ms (effectively flat);
- mean process CPU: 3209.9998 -> 3193.5103 ms (0.514% lower);
- kernel bytes unchanged at 239,673,095;
- descriptor retained+scratch bytes unchanged at 6,391,010;
- shared-TT maximum bucket scan unchanged at 5;
- class builds unchanged at 305,714;
- descriptor direct term writes 842,426 -> 536,712, exactly 305,714 fewer;
- descriptor term IDs written 4,416,668 -> 2,975,336, 1,441,332 fewer;
- no recursive storage growth and all exact search/proof work matched.

Production promotion run `34737270710`, job `103670781953`, qualified the actual
branch source through storage contracts, semantic-arena controls, slot64 residual,
semantic-TT replacement, ExploreHint/Branch Manager and dependency-parallel lanes.
The resulting source commit is
`7e9dcf77057510a2df5221436c242a6f26dcb199` (`Hash semantic residuals from packed storage`).

Two earlier integrated-hash harness attempts (`34736897626`/`103669818397` and
`34737075685`/`103670297470`) failed while generating the candidate source. No
candidate code executed in those runs; they are tooling failures, not semantic or
performance evidence.

## Reinterpreted negative results

Several earlier candidates optimized a local resource while leaving equivalent work at
neighboring boundaries. The branchy lazy mover remains rejected at target scale because
irregular control flow was about 21% slower, but the locality invariant remains useful
inside dense fixed-width transformations. Compact chunk indexing remains a memory-only
option rather than a speed default. Historical no-hash/hash16 experiments do not test a
structurally integrated identity/address invariant because they still computed a separate
bucket hash. Direct residual read remains semantically useful copy elimination; its old
single cold +0.2% timing is not a decisive rejection when fused with other producer work.

## Next ownership seam

The next candidate should move the semantic residual hash pair into canonical class
creation. `computeClassMetadata(bits,id)` already scans new canonical class content to
derive cardinality/singletons, so hashing should be fused into that scan rather than
deferred to a later first descriptor visit. The same content-stable pair can then be
tested as the local class address filter as well as the semantic descriptor fingerprint.
Exact ordered tuple/content comparison remains authoritative.

Current duplicate storage is also a target: local class addressing retains one u32 hash,
while the descriptor cache retains two u32 semantic words plus readiness. If one canonical
pair serves both roles and descriptor-owned duplicates can be removed, the design can save
compute and approximately 4.125 bytes per reserved class simultaneously. At 1,048,576
classes that is roughly 4.1 MiB per worker. If distribution worsens, first audit table
occupancy and spend preallocated bucket memory before abandoning the integrated invariant.

No full-root solve was launched and the full-root trigger was not changed.
