# Lazy SMP Full Decode 0.2 — Final Report

The concern that 0.1 was incomplete was correct.

0.2 now decodes Lazy SMP down to the implementation state machines and publication gates.

## Most important newly exposed structure

### Deterministic sharing subgraph

```text
share(key) iff hash(key) & (mask << 24) == 0
```

For a fixed key and mask, every worker makes the same share/no-share decision. The mask partitions exact key space; it does not randomly sample accesses.

### Exactness precedes winner race

Workers publish metrics/result/completion before the winner CAS. The race selects among complete exact result occurrences; it does not establish exactness.

### Shared slot generation

A slot transitions:

```text
EMPTY -> WRITING(odd) -> COMMITTED(even)
```

Probe accepts only a stable committed generation after full-key equality and before/after sequence equality.

### Nonblocking write contention

A busy slot or failed CAS causes the shared store to be dropped. There is no retry. Correctness stays private; only reuse is lost.

### Ephemeral evidence

Local and shared caches are per-solve. Teardown destroys all cache materialization. Current Lazy SMP has no cross-invocation exact-memory layer.

### Hard loser teardown

The solver loop itself does not poll STOP. After DONE/STOP, host close calls Worker.terminate on threads. That makes winner-to-cleanup tail and discarded private exact state explicit QU.

## New QU

- share-key partition leverage;
- publication visibility delay;
- winner-to-termination tail;
- discarded loser-private exact state;
- cross-invocation persistence;
- contention/replacement distribution;
- implementation-key to q_o/q_r mapping.

## Boundary

The solver method is unchanged. 0.2 fully decodes Lazy-SMP-specific orchestration/cache/lifecycle and stops at the exact solver integration boundary.

DP-01..DP-45: COMPLETE.
