# Lazy SMP Full Translation DP Rerun 0.3 — Results

**Status:** COMPLETE  
**Authority effect:** none  
**Solver method:** unchanged

The rerun found no gameplay-semantic defect, but it found several implementation structures not emphasized by the earlier pass.

## Strongest results

### 1. The mask creates a permanent blind region

Sharing is a deterministic key-space partition.

If a key is not eligible under the fixed mask, no worker can publish that exact fact to peers during the invocation.

That makes the relevant question not simply “how much do we share?” but:

> Are high-leverage exact states landing inside or outside the shared key class?

### 2. Shared exact hits are not retained locally

Current flow:

```text
local miss -> shared hit -> return exact value
```

There is no:

```text
shared hit -> local cache backfill
```

Repeated encounters can therefore pay shared atomic-probe cost again. Backfill is exactness-plausible but changes local direct-map replacement economics and must be measured.

### 3. Local/shared collision partitions are coupled

With equal capacities, both caches address slots from the same low hash bits.

Thus the shared cache adds cross-worker visibility but not an independent collision namespace.

### 4. Worker diversity is only a cyclic orbit

```text
order_i = rotate(base_order, i mod columns)
```

The same rotation is used at every node. Diversity therefore saturates after board width and is highly correlated across depth.

### 5. “First finisher” is publication-delayed

Before WINNER CAS, a worker writes all 15 metrics and 4 result fields.

The selected winner is the first worker to reach and win CAS **after publication**, not necessarily the first solver computation to return.

### 6. WAKE is not consumed by current Lazy SMP

Winner/failure/close increment and notify WAKE, but the host waits by polling STOP/DONE on a nominal 2ms interval.

This exposes a measurable host-observation tail and a current-composition control redundancy.

### 7. Post-DONE loser error and clean exit differ

A clean exit after DONE is accepted.

An `error` event still calls fail-closed and can set ERROR.

This is an explicit policy distinction. It may be intentional conservative semantics; DP does not classify it as defect without contract evidence.

## Priority experiments

1. share-blind-region leverage census;
2. shared-hit repetition + local-backfill A/B;
3. collision-coupling census;
4. winner/publication/poll/cleanup timing decomposition;
5. richer precomputed worker-order diversity A/B;
6. injected post-DONE loser-error contract test.

All 45 DP routes completed.
