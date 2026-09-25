# Connect4 Lazy SMP Search Method — Full IsoGraph Decode 0.2

**Status:** successor full-decode candidate; unqualified  
**Supersedes for active interpretation:** `CONNECT4_LAZY_SMP_SEARCH_METHOD_0_1.*`  
**Authority effect:** none  
**Solver-method effect:** none  
**Implementation anchor:** `iteathen/JSMinSys@04d37498607ace16dae33c79462ddfe1503c8a0d`

## Why 0.2 exists

0.1 captured the high-level topology but did not fully decode the mechanism. It compressed the cache protocol, winner protocol, sampling gate, lifecycle and teardown into summary nodes.

0.2 decodes the actual operational state machines and gates.

## Invocation topology

```text
runLazySmpConnect4Rba32
|
+-- root from moves
+-- one shared immutable geometry image
+-- one invocation-local shared exact cache
+-- control SAB: STOP / DONE / ERROR / WAKE / WINNER
+-- result SAB: one row per worker
+-- metric SAB: one row per worker
+-- ManagedThreadSession
+-- N worker occurrences, 2 <= N <= 64
```

There is no search Branch Manager, work queue, branch assignment or tree partition.

## Worker occurrence

```text
worker_i
|
+-- private exact CPC/RBA/Negamax state
|   +-- private local exact cache
|   +-- recursive scratch
|   +-- action order rotated by i mod columns
|
+-- shared geometry
+-- shared exact cache
+-- shared control/result/metric buffers
```

Every worker sees the same semantic root content but is a distinct execution occurrence.

## Local-first exact-cache integration

Probe:

```text
key -> hash -> private slot
          |
          +-- current epoch + full key match -> local exact hit
          |
          +-- miss -> share-eligible(hash,mask)?
                       no  -> miss
                       yes -> shared probe
```

Store:

```text
exact result
 -> publish private key/value/stamp
 -> share-eligible(hash,mask)?
      no  -> local only
      yes -> one shared-store attempt
```

The shared cache is never consulted before a local miss.

Only exact-cache publication reaches shared store. Narrow-window alpha/beta bounds are not published as exact shared truth.

## Deterministic share partition

```text
sharedSampleBits = sharedSampleMask << 24

share(key) iff:
    hash(key) & sharedSampleBits == 0
```

This is a deterministic exact-key partition, not random per-access sampling.

For a fixed exact key, mask and hash function, all workers make the same share/no-share decision.

## Shared-slot state machine

```text
sequence == 0          EMPTY
sequence odd           WRITING
sequence even != 0     COMMITTED
```

Probe:

```text
slot = hash(key) & mask
before = seq[slot]

before == 0 or odd -> miss
otherwise:
    atomically compare all key words
    mismatch -> miss
    read value
    after = seq[slot]
    before != after or after odd or value==0 -> miss
    otherwise -> exact shared hit
```

Store:

```text
current = seq[slot]

current odd -> contention drop
CAS current -> current+1 odd fails -> contention drop

CAS succeeds:
    WRITING
    write key words
    write exact value
    write seq = odd+1 even
    COMMITTED
```

No spin/retry occurs. Successful direct-map stores may overwrite prior committed rows.

## Winner protocol

A worker first publishes:

```text
metric row
result.value
result.relative
result.move
completion = 1
```

Then it performs:

```text
CAS WINNER: -1 -> workerIndex
```

CAS winner:

```text
DONE = 1
WAKE += 1
notify(WAKE)
```

A worker may be complete and still lose the winner CAS.

Exactness exists before winner arbitration.

## Host exactness/failure

Failure events—worker error, unexpected exit, deadline, abort—converge on:

```text
CAS ERROR: 0 -> errorCode
STOP = 1
WAKE += 1
notify
```

Host exact gate:

```text
ERROR == 0
AND DONE == 1
AND WINNER >= 0
```

Only then is the result `EXACT`.

## Losing-worker teardown

Session close always:

```text
STOP = 1
WAKE += 1
notify
Worker.terminate() all threads
await exits
```

The current recursive Lazy-SMP solve does **not** cooperatively poll STOP.

First-finisher shutdown is therefore an external thread-termination boundary.

## Evidence lifetime

Both local and shared exact caches are per invocation.

At teardown:

- shared cache disappears;
- private caches disappear;
- unshared loser-private exact facts disappear;
- no cross-invocation exact-cache persistence exists.

## Identity boundaries

Keep separate:

- semantic root content;
- worker root/storage occurrence;
- worker occurrence;
- local cache occurrence;
- shared slot index;
- shared slot generation;
- exact fact content;
- completion occurrence;
- winner occurrence;
- root scalar W/D/L;
- move/proof witness.

A raw slot number, worker index, hash or result-row offset is not semantic identity authority.

## Scope boundary

0.2 fully decodes Lazy-SMP-specific orchestration, cache integration and lifecycle.

It references rather than redefines the unchanged CPC/RBA/Negamax solver recurrence below the exact-cache integration boundary.
