# Integrated-invariant performance reassessment

Research direction / architecture: Josh Oshiro  
Implementation / reassessment: OpenAI ChatGPT

## Purpose

Re-examine recent negative or ambiguous frontier-Negamax performance results under a compute-first design rule:

> Prefer representations that carry several useful invariants intrinsically, and spend bounded preallocated memory when that removes repeated computation, dependent loads, probe work, or lifecycle machinery.

This is an analysis checkpoint only. It changes no solver semantics or production implementation. The active proof-handle validation candidate remains unresolved and continues to block stacking new performance mutations.

## Governing distinction

Several earlier experiments optimized one local resource in isolation: fewer bytes, fewer stored fields, fewer copied words, or fewer hash slots. That is not the same question as whether the surrounding representation can make identity, addressing, extraction, equality, semantic publication, and proof lookup share one invariant.

The positive results increasingly show that integrated structure is the stronger target:

- packed support descriptors made the standard 7x6 support representation both much smaller and materially faster by replacing large tables with one u32 descriptor plus shifts/masks;
- direct opponent blocking reused the parent slot/chunk structure and won paired target-scale timing;
- changed-slot class hashing reused transition-local changed positions to remove a second full identity traversal;
- semantic state-hash reuse spent about 2 MiB/worker to eliminate about 95% of repeated composed-hash computation;
- large sealed reservations later beat much tighter sealed reservations because the extra memory reduced bucket load and probe work.

These are not merely micro-optimizations. They demonstrate the intended trade: make a structural fact available once, then let several consumers obtain it cheaply.

## Reclassification of earlier negative / ambiguous results

### Old stored-state-hash removal and hash-width reductions

The historical no-stored-hash and hash16 experiments removed or weakened a collision prefilter while retaining the same bucket-hash computation and surrounding state representation. Their small regressions therefore do **not** establish that carrying identity-derived hash information is bad.

The current packed state pool is materially different: exact local identity is already encoded into two u32 words where the supported domain fits 64 bits, exact equality is a word comparison, and bucket addressing separately recomputes a mixed hash from those packed words.

Reclassification: **do not resurrect the old representation, but do not treat those results as evidence against integrated ID/address metadata.**

### Packed search record

Packing lower/upper/best-move into one byte saved memory but added decode/update masking without eliminating another computation or boundary. It was a storage-only optimization and slightly regressed the bounded proxy.

Reclassification: **genuine low-priority negative for packing solely to save bytes.** If a future representation makes the packed record itself the natural unit consumed across several boundaries, it may be reconsidered, but not as a byte-saving exercise.

### Direct residual read

Removing the whole-class input copy and reading immutable canonical chunks directly had only a single cold timing sample, approximately 0.2% slower with identical work counters. That is not paired evidence and is below the established regression gate.

More importantly, the isolated candidate removed one copy but left later identity/metadata work separate.

Reclassification: **unresolved, not rejected.** Its premise should be retested only as part of a fused transition path that also produces load-bearing metadata, not as another isolated subtraction.

### Compact chunk index

The compact bucket-head plus collision-link index saved about 5 MiB/kernel while elapsed changed by about +0.49% and CPU by about -0.36%, within variation. It optimized memory footprint but introduced a dependent collision-link load and did not exploit the available memory budget for fewer probes.

Reclassification: **memory option, not compute optimum.** The stronger compute-first experiment is the opposite direction: intentionally larger sparse bucket/index geometry, possibly eliminating collision links or shortening chains, combined with cheaper addressing.

### Preallocated search storage

The original reservation introduction appeared about 2% slower while greatly increasing retained typed storage. Later controlled reservation-size A/B, with both variants sealed and growth-free, reversed the interpretation: the larger reservation was about 3% faster than the tight reservation with identical solver work, while substantially reducing bucket load.

Reclassification: **preallocation remains load-bearing and extra memory can buy compute.** The unresolved variable is reservation geometry, not whether fixed preallocation should exist.

### Lazy mover / direct ownTransition

The branchy lazy mover was exact and strongly faster on bounded controls but about 21% slower in paired standard-7x6 graph growth. Its implementation replaced regular dense arithmetic with dynamic masks, branches, lazy parent reads, and dirty-state control.

Reclassification: **keep the rejection of that execution shape.** The locality invariant remains useful. Exploit it to update metadata/hash/state incrementally during the existing regular dense transform rather than to make execution branchy.

### Proof-handle duplicate validation removal

The active candidate removes one validation in isolation and has one slower hosted sample. It has no structural synergy and remains unresolved until paired A/B against its parent.

Reclassification: **still blocked/provisional.** Do not stack integrated candidates over it.

## Current duplicated identity work

The current source exposes several overlapping identity-derived layers:

1. Residual classes retain a local 32-bit class hash used for local class interning. It is composed from slot-local chunk IDs and therefore is not cross-worker semantic identity.
2. The local semantic descriptor cache separately retains two u32 content hashes per residual class plus readiness bits. First construction materializes exact term IDs into scratch and hashes them.
3. Packed quotient states retain exact packed local identity words, but state interning separately computes `pairHash(lo, hi)` for bucket addressing.
4. The semantic descriptor cache separately retains two u32 semantic state-hash words plus readiness bits for shared proof lookup.

The same semantic facts are therefore represented, mixed, cached, and traversed more than once at different ownership boundaries.

## Strong integrated candidate

The next structural target should be a **carried content invariant** rather than a faster standalone hash.

### Residual layer

Give each canonical residual class a deterministic two-u32 content fingerprint owned by the residual pool. Compute it from exact content and update it incrementally from the parent during exact transitions using already-known changed slots. Exact content remains equality authority.

The same pair should be evaluated as:

- local class-table address/filter;
- semantic residual fingerprint for shared proof descriptors;
- input to state identity/addressing;
- publication metadata.

If successful, this can replace the current local class hash plus the later semantic class-hash cache and eliminate first-use term-ID materialization solely for hashing.

### State layer

At state intern time, combine support identity with the two residual content fingerprints into the canonical semantic state fingerprint. Store/carry that pair with the state owner. Use one lane or a cheap fold for the local state-table bucket while preserving packed exact identity for equality.

The same pair can then be handed directly to the semantic descriptor/shared TT path, replacing both repeated `pairHash` work and the later semantic state-hash build/readiness machinery.

This should be designed as movement of existing metadata ownership, not unconditional addition of another cache. Current descriptor-side hash arrays already consume memory; integrating them into canonical state/class ownership may reduce both compute and total metadata.

## Memory/hash synergy

A second candidate axis is to deliberately trade more preallocated index memory for a cheaper address function.

Current state and chunk lookup use avalanche mixing even though prepared search can operate at low load factors. Measure real observed-key distributions for cheap fixed address families (for example, selected/folded packed bits, XOR/rotate/fixed multiply variants) under several intentionally sparse table geometries.

The important experiment is **joint**:

`address arithmetic cost + table memory + probe distribution + dependent loads + exact comparisons + end-to-end search time`

Do not reject a cheap address because it clusters at a tight load factor if a larger fixed table eliminates those collisions cheaply. Conversely, do not buy memory that fails to reduce total compute.

## Mover fusion opportunity

Keep the regular dense 20-word mover transform that performs well at target scale. During that same pass, accumulate every invariant that can be derived from already-visited data:

- changed-slot set;
- exact residual content fingerprint delta;
- term-count/cardinality delta where exact and useful;
- final class-address contribution;
- any state-level contribution that can be composed once the child support/opponent class are known.

The goal is one regular producer pass whose output is already ready for interning and semantic publication, rather than a transform followed by separate scans for metadata and hashes.

## Qualification order

1. Dispose the active proof-handle validation candidate with symmetric warmed paired A/B against its parent. If it still loses, record and remove it before new work.
2. Add measurement only for current duplicate identity/hash work and table geometry; do not perturb production semantics.
3. Prototype residual content-fingerprint ownership and prove it equals independently recomputed exact-content fingerprints across complete bounded controls and adversarial collision cases.
4. Integrate state fingerprint/address reuse while preserving packed exact equality.
5. Test cheaper addressing jointly with larger fixed reservations; measure probe counts, dependent loads where observable, RSS/typed bytes, CPU and elapsed.
6. Qualify bounded exactness, then paired target-scale evidence before promotion. No full-root trigger follows automatically.

## Conclusion

The earlier negative results do not form one category. The branchy lazy mover is a real target-scale rejection; packing a search byte solely to save memory is low-value. Several other results are merely negative answers to narrow local questions.

The strongest next direction is to make exact structural identity carry its own reusable addressing and semantic-publication information. The representation should do more work by **being** the invariant, while preallocated memory is deliberately spent where it removes runtime work. This is the current preferred interpretation of the performance evidence.
