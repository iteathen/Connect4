# Board/depth-owned bounded-test reservations and timeout profiling

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

## Assessment and correction

The requested depth-21 test exhausted the fixed 262,144-state reservation after
2.268 seconds. This was a resource-profile limitation, not a terminal result or
completed depth-21 measurement. The user directed that preallocation depend on
relevant structure, including board size and depth.

The bounded harness now constructs one initialization-only plan from the kernel's
captured domain, requested depth and explicit reservation budget. Default budget
is 2048 MiB, configurable with `--memory-mib`. The solver's recursive policy and
terminal/eval semantics are unchanged. Existing standalone/root/worker profiles
are not silently reconfigured by this bounded-test policy.

The depth bound uses the coefficient of `x^p` in `(1+x+...+x^rows)^columns` to count
gravity-consistent height patterns at ply p. Multiplying by `choose(p,floor(p/2))`
counts alternating-player color assignments. Summing through the requested depth
gives a conservative bound: impossible move orders, earlier wins and exact
semantic quotienting can only reduce the reachable set. This is capacity
analysis, not a board representation introduced into search or a prediction of
how much proof work is needed.

For 7x6, through depth 8 the bound is 291,271 positions, rounded to a 524,288-state
reservation when the budget permits. Through depth 21 it is 42,252,235,497, so a
complete reservation is impractical. The planner explicitly reports whether the
conservative state/class bounds fit or a budget/index cap applies. BigInt and
planning arrays exist only during initialization.

Class reservations follow two player classes per admitted state; chunk capacity
follows class capacity. Slot count remains vocabulary-derived. Shared proof entry
reservation uses at most a quarter of the typed reservation budget; its term arena
uses the domain's original-line count to bound normalized descriptor lengths.
For maximum length L, monotonically growing slot spans allocate at most L data
words and L three-word chunk headers, so four words per maximum term cover this
slot-owned growth contract. This is deliberately conservative.

## Ownership and lifecycle

State and residual owners estimate their own reserved bytes. Descriptor and TT
owners expose corresponding cold estimates. The kernel composes those estimates;
the bounded planner selects capacities and the harness verifies actual allocated
bytes against every estimate before entering search. Capacity selection does not
read a second mutable board-size owner.

The kernel accepts an explicit plan only before preparation. Once sealed, an
attempt to replace it fails; existing no-argument preparation remains idempotent.
There is no resizing, parsing, planning or resource-policy call in recursion.
Budget scope is explicit: retained kernel, descriptor metadata/scratch and shared
arena. V8 heap, transient growth copies and shared-view scratch are outside that
budget, so it is not an RSS limit or a guarantee that the chosen depth completes.

Files changed are recorded in the
[final source manifest](evidence/2026-09-12-board-depth-reservation/source-manifest.json).
No proof policy, strategic theorem or board reconstruction was introduced.

## Qualification

62 contract controls and four local campaigns passed: slot64 residual, semantic
replacement, ExploreHint and dependency-aware parallel Negamax. The new control
checks known combinatorial bounds, invalid inputs, geometry-dependent sizing,
budget exhaustion, actual allocated bytes and sealed-plan behavior across board
geometries. The final storage controls passed again after tightening the
conservative coverage-reporting flag at the index limit; that cold-only correction
produces exactly the same measured depth-21 plan.

Existing bounded workflow paths cover changed engine owners. The slot64 workflow
now also watches the planner and bounded harness; its storage control imports and
qualifies the planner. Tests and campaign logs are retained in
[the evidence directory](evidence/2026-09-12-board-depth-reservation/contracts.log).

## Depth-21 execution and profiling recovery

The resulting plan is:

| Reservation | Capacity / bytes |
|---|---:|
| Local states | 2,097,152 |
| Residual classes | 4,194,304 |
| Chunks per slot | 4,194,304 |
| Shared proof entries | 262,144 |
| Shared term words | 144,703,488 |
| Accounted reserved bytes | 1,301,619,717 (about 1.21 GiB) |
| Explicit reservation budget | 2,147,483,648 (2 GiB) |

The first resized run reached the hard 60-second timeout. Its child was killed,
but the in-process profiler had not flushed a profile. This is a harness evidence
failure; no completed depth result or source timing is claimed for that attempt.

A separate profiler worker now checkpoints the main thread before timeout using
the documented [Node inspector worker connection](https://nodejs.org/api/inspector.html#sessionconnecttomainthread).
An isolated two-second busy-loop control proved that a checkpoint can complete
while the main thread is still synchronous: it saved at 508.289 ms. Initial worker
startup exposed an event-loop liveness issue; an explicit worker keepalive fixes
it and is cleared on completion. This tooling does not put reporting in search.

One replacement depth-21 run then used the same empty 7-column by 6-row board,
resource plan and hard 60-second timeout. It timed out and its child exited.
The [saved CPU profile](evidence/2026-09-12-depth21-budget-line-cpu/line-cpu.md)
covers 55,037.7932 ms before the kill, with 53,375 process CPU ms and 810 mapped
locations. The remaining approximately five seconds are not profiled. Process
CPU includes the reporting worker; line estimates use main-thread V8 samples,
not per-invocation clocks. No depth-21 comparison baseline was launched.

Top sampled lines in that window:

| Operation | Estimated CPU |
|---|---:|
| Shared-TT status load | 4762.77 ms |
| Tactical column loop | 3848.78 ms |
| Descriptor hash rejection | 1975.34 ms |
| Singleton-mask intersection | 1860.90 ms |
| Canonical class-to-chunk read for term writing | 1492.48 ms |

These costs overlap function totals in the linked report; do not add both tables.
RSS at checkpoint was 703,918,080 bytes, distinct from reserved virtual typed
storage. Final search/node counters are unavailable after the hard kill, and
none are inferred. Depth 21 remains incomplete. Neither resized run hit the old
fixed reservation before its timeout.

## Cleanup and next owner

Both resized runs were sequential; no duplicate active solver ran. All children
and profiler workers exited. Exact sources, resource plan, profile, timing window,
timeout result and failure-reporting wrappers remain discoverable. Status,
next-step, index and audit ledger record the outcome. No full-root trigger or
protected-main/ref change occurred.

Remaining performance review should use the new source-mapped profile. The
conservative capacity estimate is not a replacement for structural quotienting
or a claim that depth-21 proof work must visit that many states.
