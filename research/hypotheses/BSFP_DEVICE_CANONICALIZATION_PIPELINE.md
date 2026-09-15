# BSFP device canonicalization pipeline

**Status:** execution hypothesis / cross-project invariant transfer. No production change.

**Research direction:** Josh Oshiro.

## Goal

Resolve the O3 output-grouping / variable-length compaction / dense-ID / device-chaining seam without moving Connect4 residual identity into CUDA-Algorithms.

## Cross-project invariants

Three existing results align:

1. O3 proves many crossing occurrences share one exact residual transform.
2. CUDA-Algorithms prefers permutation-first ordering of compact item indices; consumer-owned wide records stay in place.
3. CUDA-Algorithms keeps exact domain-record equality with the consumer; generic grouping begins only after consumer equality emits boundary/change flags.
4. Standard-7x6 persistent-chunk experiments show that eager substructure interning can be much slower than whole-class duplicate detection even when structural sharing saves substantial memory.

## Candidate pipeline

```text
Connect4 candidate producer
  -> candidate records in consumer-owned SoA storage
  -> cheap primitive fingerprint / multiword structural key columns
  -> stable order only candidate indices
  -> Connect4 exact adjacent equality on ordered candidate records
  -> changeAfter flags
  -> generic exclusive scan => dense group IDs
  -> generic select representatives
  -> compact/intern variable-length payload only for representatives
  -> original candidate -> dense next-ID mapping
  -> next BSFP/OQS layer remains device-resident.
```

Hashes/keys narrow the comparison neighborhood but never define equality.

## Wide exact keys

When a collision-free canonical fixed-width key exists, stable least-significant-word-to-most-significant-word index ordering gives exact lexicographic adjacency without moving records.

When only a hash/fingerprint exists:

```text
hash order
-> equal-hash segment
-> Connect4 exact full-record ordering/equality inside the segment
```

must ensure an adversarial `A,B,A` collision cannot assign separate groups to equal records.

## Canonicalization order

Prefer:

```text
whole candidate identity test
-> group hit: reuse existing dense ID
-> group miss: canonicalize/intern substructure once for representative
```

rather than:

```text
intern every subchunk/subrecord
-> discover afterward that the whole class already existed.
```

The 7x6 chunked quotient evidence is the warning case: exact structural sharing reduced memory strongly but eager chunk interning dominated runtime.

## Composition with proof-side reductions

Run searchless/certificate filtering before grouping where cheap:

```text
reflection canonicalization
legal-cardinality / nonterminal feasibility
fixed-owner / affine-clause cone rejection
claim-relative transform reuse
certified macro collapse
```

so generic sequence machinery sees only surviving semantic candidates.

## Device progression

Use device-resident active extents with host-known capacities. Overflow is explicit failure/backpressure, never truncation. Node may administer submissions/status but does not inspect records to advance the fixed point.

For arena reuse, carry an epoch/incarnation tag or equivalent ownership token so late output from a prior layer cannot be accepted into a reused slot.

## Falsifiers

- hash/fingerprint used as equality authority;
- equal exact records split into multiple dense IDs under adversarial collisions;
- generic layer must understand residual/game semantics;
- wide record movement dominates index ordering with no viable provider realization;
- representative-only payload interning changes canonical identity;
- stale output from a reused arena is accepted as current layer data;
- host round-trips are required for mathematical progression rather than administration.
