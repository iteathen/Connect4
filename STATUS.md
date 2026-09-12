# Connect4 Semantic-Quotient Research Status

**Updated:** 2026-09-11  
**Canonical branch:** `research/semantic-quotient`

## Current objective

Solve standard 7x6 Connect Four exactly with quotient-native W/D/L Negamax while preserving exact Connect Four semantics and minimizing proof work, memory traffic, and synchronization cost.

## Exact quotient state

```text
q = supportIndex
  + normalized P0 residual winning requirements
  + normalized P1 residual winning requirements

sideToMove = rank(supportIndex) & 1
```

Complete bounded controls checked 1,681,808 physical states with zero projection, transition, terminal, strong-score, per-action-score, BSFP W/D/L, or reverse-closure mismatches.

| Geometry | reachable q states |
| --- | ---: |
| 4x3 c3 | 3,735 |
| 4x4 c4 | 34,095 |
| 5x3 c4 | 11,317 |
| 4x5 c4 | 294,593 |

## Current representation

```text
packed support
+ exact term-ID residual ontology
+ slot64 residual classes
+ direct opponent-block filtering
```

Standard 7x6:

```text
residual vocabulary:     625 terms
term ID width:            10 bits
rank-8 q states:         797,388
rank-8 residual classes: 1,357,101
rank-9 frontier:         538,774
rank-8 typed bytes:      118,099,719
```

## Current ownership

```text
quotient state space
    transition semantics
    tactical closure
    canonical semantic identity

Negamax engine
    recursive W/D/L alpha-beta policy
    proof-window dependency semantics
    move-order consumption

proof store
    packed proof record
    monotone lower/upper publication
    advisory best-move hint

semantic TT
    exact descriptor storage
    addressing and collision-checked lookup

work planner
    shallow work structure
    task estimation/order
    plan lifecycle

proof resources
    shared arena allocation/reset

maintenance worker
    execution host for maintenance-side services

search workers
    recursive Negamax
    worker-local quotient transition state
```

Current source owners:

- `quotient-negamax-domain-contract.mjs`
- `quotient-semantic-identity.mjs`
- `quotient-negamax-engine.mjs`
- `quotient-negamax-search-record.mjs`
- `quotient-packed-proof-store.mjs`
- `quotient-semantic-shared-tt.mjs`
- `quotient-work-plan-service.mjs`
- `quotient-proof-resource-service.mjs`
- `quotient-maintenance-worker.mjs`

The current slot64 solver path consumes the separate Negamax engine instead of defining another active copy of search policy.

## Shared proof semantics

Shared proof publication is monotone. Concurrent writers merge stronger W/D/L bounds with atomic compare/exchange. Best-move information is advisory and cannot erase stronger proof facts.

Reads remain allocation-free and may observe stale-but-sound proof information; that can cause extra work but cannot create a false proof.

## Worker model

Search workers do not perform per-node RPC to the maintenance worker.

The maintenance host owns execution of planning/resource services. It does not become the semantic owner of the services it hosts.

Workers may use different local qIDs and residual-class IDs. Shared semantic identity is:

```text
supportIndex
+ exact sorted P0 residual term sequence
+ exact sorted P1 residual term sequence
```

Hash equality alone is never semantic equality; descriptor content is compared exactly.

## Performance evidence

Fair 4x5 physical control:

```text
quotient: 10.183 ms, 15,054 expansions
physical: 13.400 ms, 36,826 expansions
```

Shared-proof bounded worker control:

```text
sequential root split: 6.7476 ms, 31,174 expansions
2 shared-proof workers: 3.2893 ms, 25,532 expansions
```

The online semantic-TT campaign also reproduced the exact root/action result with worker-local quotient IDs and no complete global qID graph inside recursive search.

## Current scheduler direction

Static full-window solving of every shallow frontier state is rejected because it destroys useful alpha-beta dependency information and substantially increases proof work.

The current target is dependency-aware parallel Negamax:

```text
preferred child first
    -> establish parent bound
    -> release dependency-satisfied sibling work
    -> share exact proof facts
    -> stop or ignore obsolete sibling work after cutoff
```

Worker count and lookahead depth are measured at initialization/presearch rather than fixed constants. Depth 3-4 remains the expected standard-7x6 candidate range until measured otherwise.

## Open work

- move online semantic dedup reconciliation to the maintenance side without per-node RPC;
- provide consumer-neutral CPU/thread affinity and measured search-capacity services below Connect4;
- implement dependency-aware parallel Negamax work scheduling;
- solve the standard 7x6 empty root and measure wall clock;
- include actual BSFP boundary cost before making a hybrid performance claim.

CPU-topology code currently present in this branch is research-only. Generic runtime/resource discovery belongs to CUDA-JS; generic search-session capacity belongs to CUDA-MCGS.
