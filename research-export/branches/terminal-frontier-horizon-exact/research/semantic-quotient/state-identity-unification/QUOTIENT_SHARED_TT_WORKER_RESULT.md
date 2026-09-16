# Quotient Shared-TT Search Workers + Dedup/Cleanup Owner — Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** qualified positive bounded-control result; online 7x6 integration remains open  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Ownership model

The corrected concurrency architecture is:

```text
coordinator
  |
  +-- dedup / cleanup worker
  |     - canonical q-state construction / dedup ownership
  |     - descriptor lifecycle
  |     - shared proof-arena lifecycle
  |     - cleanup / reclamation ownership
  |
  +-- search worker 0 --+
  +-- search worker 1 --+--> one shared exact proof/TT arena
  +-- search worker N --+
```

Search workers own synchronous recursive Negamax only. Deduplication, forwarding, cleanup policy and descriptor lifecycle do not enter the recursive search path.

For this first concurrency qualification, the dedup worker constructs the complete canonical 4x5 connect-4 quotient graph once, publishes immutable shared graph arrays, and owns reset/cleanup lifecycle. This isolates shared-proof concurrency from online quotient interning. It does **not** yet qualify online descriptor reclamation.

The shared proof record is one byte per canonical q state, packing W/D/L lower bound, upper bound and best-move hint. Search workers use same-size non-atomic byte reads/writes. Concurrent races may lose a stronger sound store or expose an older sound store; every published byte remains a valid proof record. Exactness was therefore required under actual contention.

## Qualification

Workflow run: `34658872365`  
Job: `103457015792`  
Conclusion: **success**

The dedup worker reproduced the established complete graph:

```text
canonical q states: 294,593
residual classes:    69,707
shared graph edges: 1,178,372
root W/D/L:                 0
root actions:        [0, 0, 0, 0]
```

Every sequential and concurrent repetition reproduced the exact root result and all four exact root-action values.

## Performance

GitHub hosted runner reported four available logical execution lanes. Seven measured repetitions were used after worker warmup.

```text
mode                 median solve ms    expanded    calls
sequential root split       6.7476        31,174    59,619
1 persistent worker         4.5372        31,174    59,619
2 shared-TT workers         3.2893        25,532    47,194
4 shared-TT workers         5.8331        26,270    48,489
```

Relative to the sequential root-split control, two workers reduce median solve time by about **51.3%**.

The stronger result is proof-work behavior. Two concurrent workers reduce expansions by about **18.1%** versus the same sequential root split, rather than increasing them.

This sharply contrasts with the earlier private-worker experiment, where separate mutable quotient/TT instances caused work duplication:

```text
private 2 workers: 38,959 expansions
private 4 workers: 45,278 expansions
```

The shared-TT experiment therefore supports the intended architecture rather than merely demonstrating CPU parallelism.

## Interpretation

The private-worker failure was not evidence against worker parallelism. It was evidence against isolating transposition/proof knowledge.

With canonical q identity already deduplicated and one shared proof arena, workers can discover independent certificates that immediately prune work in other root-action searches. Parallel execution can therefore reduce both elapsed time **and** aggregate proof work.

Four workers lose to two on this small control despite still doing less proof work than sequential search. The likely remaining factors are task granularity, execution-lane contention, cache pressure, and move-order desynchronization. The 3-worker point and deterministic-vs-desynchronized ordering must be measured before fixing worker count policy.

## Disposition

**Promote the architecture, not a fixed worker count.**

Retain:

- shared exact proof/TT storage;
- dedicated dedup/cleanup ownership;
- persistent search workers;
- no dedup/cleanup bookkeeping in recursive Negamax;
- coarse task dispatch.

Do not promote:

- private worker-local TTs as the primary design;
- four search workers merely because four lanes are visible;
- per-node coordinator/dedup RPC.

Next experiment:

1. add the 3-worker point;
2. compare deterministic and deliberately desynchronized worker move ordering;
3. keep the dedup/cleanup worker persistent;
4. then move the winning search-worker policy toward the online 7x6 quotient/chunk lifecycle design.
