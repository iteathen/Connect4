# NEES Draft 0.5 — JSMinSys shared-TT IsoMax

NEES revision: `7650bef0aecc0d2b226ecf253a1f8937ccf89d69`.
JSMinSys revision: `d176330ebed2c29d8b71f290f95734b107817d3e`.

Semantic owner: retained Connect4 gameplay specifications and the active
Isometric/IsoMax solver contract. Reusable TT, queue, worker and manager
mechanics are consumed from the pinned merged JSMinSys library.

**Conformance status: partial qualification; no NEES-EXTREME, JMS-RESTRICTED or
JMS-SEALED claim.**

## Current execution scope

```text
Connect4 legal replay ingress
  -> cold root q preparation
  -> shared JSMinSys RBA TT
  -> one manager thread
  -> N evaluator workers
       -> CPC-first q evaluation
       -> RBA cofactor/canonicalization
       -> exact/scalar child publication
       -> retained first child
       -> surplus through shared ready queue
  -> manager dependency attachment/reconciliation
  -> exact root result
```

The TT is the sole authority for q identity, exact/bound evidence, references,
generation, dependency topology, ready membership, event membership and recycle
eligibility.

The Branch Manager does not evaluate the game and has no second branch table.
It drains bounded event batches, attaches/reconciles dependency evidence and
exposes unresolved surplus q through the TT ready queue.

Workers do not RPC the manager for work. They claim q directly under the TT
transaction, evaluate outside the transaction, publish once, retain at most one
runnable child directly, and return surplus ownership to shared topology.

## Synchronization

- One TT transaction serializes topology/ref/queue mutation.
- Game evaluation never runs while that transaction is held.
- STOP/DONE/ERROR/WAKE are atomic cross-thread control words.
- Ready/event intrusive lists are fields of q rows; generation stamps reject
  stale tickets.
- Execution ownership pins active q against recycle.
- Failure/timeout/cancellation is fail-closed and publishes no W/D/L.
- Host cleanup terminates and joins the manager plus all evaluator workers.

The current queue is FIFO across q arrivals. Prepared action order and CPC
evidence influence which child is retained/published first. Global highest-value
queue ordering is not yet implemented and is explicit optimization debt.

## Hot-path policy

After worker preparation, evaluator storage is fixed typed storage. CPC/RBA
evaluation is allocation-free at the qualified source level. Exact child
evidence may remain scalar without interning a q. Unresolved canonical children
are interned exactly and share identity across parents.

The manager is intentionally outside the game-evaluation hot loop. Its work is
bounded by event/dependency topology. It may become a synchronization bottleneck;
that is a measurable economics question, not permission to duplicate q authority.

No recursive Four-Front production path, conventional colored-board rebuild,
BigInt gameplay state, or alternate fallback solver is active.

## Qualification

Connect4 CI run `35930426403`:

- Connect4 57/57 tests passed;
- pinned JSMinSys 125/125 tests passed;
- 1/2/4 evaluator workers agree with independent late-position oracles;
- caller-frame reflection/witness controls pass;
- shared ready queue and surplus publication are exercised;
- cancellation/deadline cleanup returns no W/D/L.

JSMinSys PR #4 additionally qualified retained-child/surplus behavior and
CPC-first shared-TT traversal against the existing exact CPC alpha-beta control.

## Measurement/optimization debt

The previous standard Fhourstones result belongs to the superseded private
single-worker alpha-beta wrapper and is not transferred to this topology.

Required next measurements:

- standard Fhourstones qualification at one evaluator;
- paired 1/2/4-worker benchmark on the same official first case;
- TT lock contention / manager event throughput;
- ready-queue occupancy and idle-worker time;
- whole-operation CPU cycles and wall time;
- comparison against the prior private alpha-beta control with semantic work
  units kept distinct.

A global value-priority queue, retained cross-root worker pool, lock sharding,
manager batching changes or alternate wake policies require measured evidence
before promotion.
