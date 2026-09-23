# Execution contract — standard 7x6 specialization

The native-key geometry is explicitly 7x6. Size-dependent hot functions are
named `*7x6`; they do not advertise a general board-family API.

## Authority and representation

Shared TT is the sole q identity, exact-value, topology and execution authority.
Keys contain 8 uint32 words: packed support/rank, required terminal/sentinel
flags, 3 P0 local-upset words and 3 P1 local-upset words. The kernel supplies a
canonical normalized key. Hash is a locator only; every key word participates
in exact equality. No worker-local residual ID substitutes for that content.

The packed rank in support bits 21..26 determines the ordinary legal side.
This admission applies to valid standard-play canonical keys; arbitrary side
overrides or unproved imports are not supported by the kernel contract.
Proof/certificate identity is not represented by this ordinary-value table.

Every hot TT function requires the caller to hold `enter(table, owner)` or
exclusive cold ownership. Owner 1 is the manager; evaluator owners start at 2.
No game computation runs inside a TT transaction. The mutex protects complete
multi-row transfers; its performance is unqualified, not assumed optimal.

Queue/event links are fields of q. There is no work pool, occurrence pool,
manager-private key table or descriptor copy. Queue generation and execution
membership prevent slot reuse; dead queued entries unlink in constant time.

`refs = external/session pins + pending-child pins + attached incoming edges`.
Execution and event membership independently protect access until consumption.
Insertion returns one pin. Publication installs that pin into the parent row
in the same transaction. Attachment consumes it without an extra retain.
Manager detachment unlinks the incoming edge before releasing the pin. Recycle
requires zero refs, execution, event membership, children and incoming edges.
Generation overflow and capacity fail closed, without changing limits.

## Kernel interface

`IsoMaxBranchManager({workers, capacity, buckets, kernelURL, kernelData,
timeoutMs}).run(rootWords, {reflected, signal})` starts one bounded root session.
The supplied file module exports:

```js
export function prepare(worker, data) { /* cold, allocate private state once */ }
export function evaluate(table, q, worker, expose) { /* trusted native kernel */ }
```

The kernel reads immutable input directly at `table.keys[q * 8]` while the
worker owns execution. No input copy/replay is required. `worker.started` is 1
on entry to a new task and 0 for its retained continuation. Private continuation
storage must reset logically on a new task, without a compulsory unwind.

Return codes:

| Code | Meaning |
|---|---|
| 1 / 2 / 3 | exact P0-oriented loss / draw / win |
| 4 | genuine branch prepared in fixed worker output storage |
| 5 | private continuation retained, at an amortized control boundary |
| 6 / 7 / 8 | incomplete boundary / arena capacity / uncovered query; distinct error 22 / 23 / 24 |
| 9 | interruption; cancellation without WDL |

The native RBA kernel has no search fallback, no search stack and no fallback
configuration switch. Codes 22 and 24 produce host status INCOMPLETE, code 23
produces FAILED. All have null WDL and no move. Generic BRANCH/CONTINUE support
remains executor infrastructure, not an alternate native solving algorithm.

For 4, set `worker.count` to 2..7 and write each complete canonical child key
into `worker.keys[i * 8 .. i * 8 + 7]`, and its parent-canonical physical
column into `worker.actions[i]`. Children must advance rank and actions must
be unique. First child is advisory-best and remains locally owned when free.
The parent publication region is the TT itself; no copied wire descriptor.
Only new-key insertion writes key content into the table; hits do not copy it.

For exact closure set `worker.witness` when an action witness exists; use -1
for an already-terminal root. The kernel must respect first-win stopping and
the exact gameplay specification. Unsupported outcomes must not become WDL.

`expose=0` requires local kernel continuation/closure. It is always 0 with one
worker, and becomes 0 when the ready reservoir contains at least twice the
evaluator count. Exposure is checked at control boundaries, not at every native
node; in-flight publications can overshoot that soft reservoir target. Capacity
is a separate hard bound. No worker observes peer-idle state or assigns peers.

## Manager and failure semantics

The manager attaches canonical incoming edges, queues surplus children, applies
exact max/min closure and releases unneeded edges. An extreme exact child
permits value cutoff. A child still needed by another parent remains alive.
Root value and deterministic center-first action witness close separately;
completion order cannot choose the root move. Root reflection is transported
into caller-frame tie priority and at the external witness boundary. No alpha/beta cutoff is labelled exact.
General non-exact interval/window propagation is not implemented here.

On retirement a worker abandons its private continuation at its next control
boundary and polls again. It does not unwind merely to change ownership.
Death, including death while holding the TT transaction, fails the session
closed. There is no speculative lock takeover/recovery authority. The host
terminates and joins every owned thread; session backing storage is then
discardable. Mid-transaction recovery is not claimed.

The timeout cannot exceed 120 seconds. Output distinguishes EXACT, INCOMPLETE,
TIMEOUT and FAILED; all non-exact runs return `rootWdl: null`. Rich errors and reporting
are cold host work. This initial host API creates a pool per root session;
retained cross-root workers are an explicit remaining economics item.
