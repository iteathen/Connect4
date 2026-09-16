# Resumed structural candidate batch

**Date:** 2026-09-09  
**Status:** research evidence only; no maintained-source promotion.

This note records the work resumed after the interrupted preservation message. It extends `2026-09-09-decision-state-and-proof-frontier-followup.md` and `2026-09-09-more-structural-candidates.md`.

## Decision-state TT admission remains strongly positive

Treating certified single-choice states as transit edges instead of general-purpose TT states changes several costs together.

At 512K on `41267575`:

- flat baseline: 5,945,560 nodes / 3,383,162 TT writes;
- decision-only: 5,521,407 nodes / 2,173,208 writes;
- decision + intrinsic rank banks: 5,261,422 nodes / 2,081,030 writes.

Interpretation: a deterministic transit state does not automatically deserve cache identity. This is a structural admission rule, not an age/LRU heuristic.

## Incremental fixed-universe win-space antichain

For 7x6 Connect Four, enumerate every non-empty subset of each of the 69 winning lines. After deduplication, the residual-requirement universe contains 625 requirement IDs.

A player's minimal remaining win-space can therefore be represented as a fixed 625-bit active set plus precomputed transition/subsumption relations. The prototype updates the antichain incrementally under a legal move instead of rebuilding arrays, sorting, deduplicating and testing subset relationships at every node.

On the complete smaller variants, the fixed-ID bitset transition reproduced exactly the expensive canonical minimal-requirement state counts already established:

- 4x3 connect-3: 3,735 states;
- 4x4 connect-4: 34,095;
- 5x3 connect-4: 11,317;
- 4x5 connect-4: 294,593.

Interpretation: the semantic compression is not tied to high-level set canonicalization. The canonical antichain can be maintained by construction using a finite fixed universe.

The same fixed universe also supplies precomputed implication closure masks, making residual-state dominance tests reducible to bounded bitset operations rather than arbitrary nested requirement comparisons.

## Dominance proof reuse: semantic positive, indexing still unresolved

Prior live alpha-beta tests showed 5.4%-13.0% node reductions on complete small variants from cross-state implication bounds. A later WDL Pareto-frontier representation preserved and amplified the search reduction in larger complete variants (up to roughly 50% fewer expanded states in 4x5 connect-4) but remained comparison-heavy.

A first exact-value/frontier implementation fragmented certificates and increased comparison work. That is an indexing failure, not evidence against the dominance relation itself.

The fixed 625-bit requirement universe is now the preferred route for a bounded implication index because both canonical identity and dominance closure derive from the same representation.

## Semantic-successor dedup and alpha-beta interaction

Full state-space enumeration previously showed large savings when multiple legal moves producing the same residual game were searched only once: 27.5%, 24.1% and 88.0% fewer recursive calls on the three complete small variants.

A new alpha-beta composition test added the same exact-successor dedup to both center ordering and structural/net ordering. It produced the same exact root values but **no node-count change** in the tested complete variants. Duplicate children existed, but the current TT/alpha-beta ordering generally prevented those duplicates from becoming additional expanded work.

Disposition: semantic-successor equivalence is real and remains useful to the semantic graph representation, but a separate child-dedup layer is not currently justified inside the alpha-beta hot path.

## Structural move ordering inside the real 7x6 kernel

The existing two-word kernel already orders candidate moves by the number of winning positions created after the move. Two new variants added opponent-win destruction to the ordering score (own-first and defense-first forms).

On both established positions at 512K, score, node count, TT hits and TT writes were exactly unchanged from baseline:

- `663152175`: 1,004,480 nodes in all variants;
- `41267575`: 5,945,560 nodes in all variants.

The added winning-position calculation only increased runtime.

Disposition: negative for this integration. The extra structural feature did not alter the move order on these roots.

## Two-tier previous-pass-read/current-pass-write TT

A separate test split retained proof history by pass:

- current null-window pass reads/writes one table;
- previous completed pass is retained read-only in another table;
- after each pass the tables swap and the new current table is cleared.

At equal total capacity, two 256K tiers versus one flat 512K table was substantially worse on both established positions.

On `41267575`:

- flat 512K: 5,945,560 nodes;
- two-tier 2x256K (512K total): 6,710,378 nodes.

Giving each tier 512K reduced the count to 5,362,423, but the required flat-1M control reached 5,155,879 nodes. Thus the tiering itself did not earn the improvement; the added memory did.

On `663152175`, both tiered layouts also searched more nodes than the corresponding flat controls.

Disposition: negative. Previous-pass knowledge is not valuable enough to justify physically isolating it from current-pass writes under this design.

## Current structural priority

The strongest converging structure is now:

1. fixed-universe minimal remaining win requirements as semantic state;
2. decision-state caching rather than caching deterministic transit states;
3. intrinsic rank banking for physical TT isolation where capacity is tight;
4. compact exact identity designed together with the local bank width;
5. dominance/implication reuse derived from the same requirement bitsets;
6. residual-game symmetry as a later canonical-labeling layer once the bitset representation is low-level enough.

The rejected mechanisms remain useful controls: WDL-first exact-score staging, raw board reflection, per-entry standalone move hints, recursion-only forced chains, structural-order extra scans, separate child-dedup in alpha-beta, and two-tier previous-pass/current-pass TT storage.

## Local evidence hashes

- `combo_semantic_dedup_order.mjs`: `8e3cc9574d25c3705bfbbd2d454c33b4cfbe3e753195c38b556565c8107ad49e`
- `combo_semantic_dedup_order.jsonl`: `ec72f9d962ea7ecb1d6c4cf600db7c2e70ede2b47481ac7a97ee0766da1dc26b`
- `bench_struct_order_real.mjs`: `1cdee7da4b782f0fdc0a514b85c6f2be1345f79c75a16066913b9586349a5db4`
- `struct_order_real.jsonl`: `80e83dc4dcb46b9b84b58a2ddd8acb545e38498cdd5f6e83f261bc032d386fc5`
- `bench_two_tier_tt.mjs`: `d99e7c24c4f52f4c41bf914f706cd7115671876d353650f5b243d933738c75f3`
- `two_tier_tt.jsonl`: `1495ea70b924388a70fa45245f3c55134ba09dc4d9ccdfb7ffece45857b578dd`
- `2026-09-09-decision-state-and-proof-frontier-followup.md`: `c736f3e233ab11a2b0fc78d8dff3609b346863cb389f24b1995cebfe989a01c9`
