# Connect4 Semantic-Quotient Research Status

**Updated:** 2026-09-11  
**Canonical branch:** `research/semantic-quotient`  
**State:** quotient-native exactness, standard-7x6 rank-8 scaling, shared-proof worker value, and online semantic-TT identity are qualified research results; dependency-aware parallel Negamax remains the next implementation seam.

## Repository role

This branch is a Connect4 exact-solver research lane. It owns Connect Four quotient semantics, comparative evidence, and candidate forward-solver behavior. It is not the production solver branch and it does not own generic runtime/CPU-topology mechanisms merely because the research prototype currently contains them.

Product lanes remain separate:

- historical `solver/minimax-alpha-beta`;
- `solver/cuda-bsfp`;
- `solver/hybrid-confluence`;
- future quotient-native forward solver only after the standard-7x6 implementation is sufficiently established.

## Exact quotient state

The future-relevant state is:

```text
q = supportIndex
  + normalized P0 residual winning requirements
  + normalized P1 residual winning requirements

sideToMove = rank(supportIndex) & 1
```

The recursive solver does not require a colored physical board as its machine state.

Complete bounded controls checked 1,681,808 physical states with zero projection, transition, terminal, strong-score, per-action-score, BSFP W/D/L, or reverse-closure mismatches.

Reachable quotient-state counts remain:

| Geometry | q states |
| --- | ---: |
| 4x3 c3 | 3,735 |
| 4x4 c4 | 34,095 |
| 5x3 c4 | 11,317 |
| 4x5 c4 | 294,593 |

## Current quotient representation

The strongest scalable representation chain is:

```text
packed support descriptor
+ exact term-ID residual ontology
+ slot64 persistent residual classes
+ direct opponent-block filtering
```

Standard 7x6 has an exact residual vocabulary of 625 terms, requiring 10 bits per term ID.

At the qualified rank-8 growth checkpoint:

```text
q states:          797,388
residual classes: 1,357,101
rank-9 frontier:    538,774
typed bytes:    118,099,719
residual bytes:  86,493,624
```

The slot64 representation substantially reduced the target-scale memory pressure relative to the earlier term-list form while preserving exact state/class checkpoints.

## Bounded forward performance

The governing fair physical comparison remains the term-ID quotient versus exact physical-board W/D/L Negamax under conservative memory accounting.

Largest complete bounded proxy, 4x5 c4:

```text
quotient: 10.183 ms, 15,054 expansions
physical: 13.400 ms, 36,826 expansions
```

Thus the quotient remains the preferred forward-state representation on current evidence.

## Parallel search result

Private worker-local TTs were a negative result because proof work was duplicated.

With one shared exact proof arena on the complete 4x5 quotient graph:

```text
sequential root split: 6.7476 ms, 31,174 expansions
2 shared-TT workers:   3.2893 ms, 25,532 expansions
```

Parallelism therefore became useful only after workers shared exact proof knowledge.

The worker architecture now distinguishes:

```text
search workers
    recursive Negamax only
    local fast quotient execution state

maintenance execution host
    work-planner service
    proof-resource lifecycle service
    future dedup/reclamation services

shared exact proof store
    monotone W/D/L bound publication
    advisory best-move hint
```

The maintenance worker is an execution location, not the semantic owner of every service it hosts.

## Online semantic identity

Workers no longer need globally identical local qIDs or residual-class IDs.

The shared semantic identity is:

```text
supportIndex
+ exact sorted P0 residual term sequence
+ exact sorted P1 residual term sequence
```

Hash words are addressing aids only. Candidate TT matches are accepted only after exact descriptor comparison, so hash collisions cannot produce false proof hits.

The online semantic worker campaign reproduced exact root draw and all root-action draws while recursive search used local quotient kernels rather than the complete precompiled graph.

That campaign also produced an important scheduler rejection: solving every shallow frontier state as an independent full-window exact task roughly doubled proof work. The semantic-TT bridge is retained; static full-window frontier fanout is not.

## Current Negamax alignment

The 2026-09-11 compliance pass made the current research code better match the governing LEGO → SOLID → CUPID → KISS hierarchy without adding new process machinery.

Current explicit owners:

- `quotient-negamax-domain-contract.mjs` — quotient transition/tactical codes and meanings;
- `quotient-semantic-identity.mjs` — canonical semantic descriptor shape and hashing;
- `quotient-negamax-search-record.mjs` — packed proof/hint record meaning;
- `quotient-packed-proof-store.mjs` — monotone shared proof publication;
- `quotient-semantic-shared-tt.mjs` — exact descriptor storage/probing mechanics;
- `quotient-work-plan-service.mjs` — work-plan lifecycle;
- `quotient-proof-resource-service.mjs` — shared proof-resource lifecycle;
- `quotient-shared-dedup-worker.mjs` — execution host/composition adapter for maintenance-side services;
- Negamax search modules — recursive search policy.

The shared proof store now uses atomic compare/exchange to merge stronger lower/upper proof facts without letting a concurrent hint publication erase stronger proof information.

## Known boundary debt

The compliance pass intentionally did not disguise unresolved boundaries:

1. `quotient-native-negamax-support-layout-kernel.mjs` still carries historical local copies of quotient/tactical code constants. They agree with the new domain contract but have not yet been mechanically collapsed into it.
2. The single-thread packed-record research kernel still carries historical local record helper functions instead of consuming the centralized record contract.
3. The online semantic TT still performs exact `findOrCreate` insertion from search workers. This qualified the semantic identity bridge, but it does not yet match the intended model where the maintenance side owns dedup reconciliation while recursive search remains maintenance-blind.
4. CPU topology/affinity calibration in this branch is research scaffolding. Consumer-neutral runtime/resource discovery belongs below Connect4; generic search-session capacity belongs in the generic search/session layer.

These are implementation-alignment issues, not reasons to invalidate the already-qualified quotient mathematics or experiment results.

## Current next seam

Build the dependency-aware parallel Negamax work tree.

The scheduler must preserve alpha-beta dependency semantics:

```text
preferred child first
    -> establish parent bound
    -> expose only dependency-satisfied sibling proof work
    -> shared proof reuse
    -> stop or ignore obsolete siblings after cutoff
```

The lookahead depth and active search-worker count remain measured properties of the actual hardware and position. Earlier 3-4-ply results remain plausible standard-7x6 candidates, while the tiny 4x5 control preferred depth 2.

## Evidence limits

Current evidence supports:

- exact quotient semantics on complete bounded controls;
- quotient-native bounded wall-clock advantage over the physical control;
- standard-7x6 rank-8 representation scaling checkpoints;
- useful shared-proof worker parallelism on bounded controls;
- exact semantic-content TT sharing across worker-local quotient IDs.

Current evidence does not yet establish:

- standard-7x6 empty-root solve wall clock;
- a universal worker count or lookahead depth;
- production P-core/E-core affinity placement;
- maintenance-owned online dedup reconciliation;
- end-to-end hybrid speedup including real BSFP boundary costs.
