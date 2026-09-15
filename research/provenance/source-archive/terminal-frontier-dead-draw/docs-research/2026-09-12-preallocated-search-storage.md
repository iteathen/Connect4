# Reserve storage before recursive search

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

Known typed-storage allocation, widening and growth copying now occur before
canonical online search starts. State storage, residual metadata, chunk payloads
and hash tables are reserved and sealed when the online port is initialized.
Descriptor metadata is then allocated to the residual owner's reserved capacity.
The semantic TT reserves the complete Uint16 descriptor scratch domain once.
The standalone slot64 solver separately reserves its local proof arrays when
selected; online semantic workers continue to retain zero local proof arrays.

This removes growth allocations from the recursive loop; it does not claim all
JavaScript/runtime allocation, worker protocol objects, output, task setup or
diagnostic APIs have disappeared. Publishing an exact descriptor still writes
into already-reserved arena storage. That is distinct from allocating a new
JavaScript buffer or resizing storage.

## Governing invariant and lifecycle

C4-0010 keeps semantic storage and proof authority separate. Each storage owner
reserves its own capacity before work begins, and publishes existing IDs without
changing their meaning. Initialization validates and snapshots resource targets.
Board geometry remains in the existing initialization owner.

`prepareSearchStorage()` seals the canonical kernel. Online port construction
calls it before descriptor-cache construction; search workers do so before
sending ready. Standalone `createWdlSolver()` uses the same preparation, then
reserves its selected local proof store. A sealed local-proof reset clears
records in place and retains the reservation.

If a reservation is exhausted, insertion throws an explicit capacity error and
does not silently allocate or resize. Previously published states/classes remain
valid. Existing worker failure handling poisons the task boundary rather than
returning the failed worker to service. Retrying with more capacity requires a
new appropriately sized kernel/worker; there is no mid-search expansion.

Before preparation, structural construction/enumeration can still grow storage.
Those APIs are also used by reference and graph qualification. They do not
authorize growth after canonical recursive search preparation.

## Configuration and memory

Kernel initialization accepts:

```js
createSlot64ResidualQuotientKernel(domain, {
  searchStorage: {
    states: 262144,
    classes: 524288,
    chunksPerSlot: 262144,
  },
});
```

These are the default resource targets, not board-size constants or a claim that
they suffice for an empty-board exact solve. Existing larger capacities are
retained; targets are rounded to supported powers of two. Dictionary tables are
reserved with enough spare slots for their payload capacities. References are
widened before search to address the complete reservation. Worker-pool options
forward `searchStorage` to each worker's kernel initialization.

The conservative uniform chunk reservation increases standard depth-8 retained
kernel typed storage from **32,685,831 to 84,483,847 bytes** (31.17 to 80.57 MiB).
Descriptor metadata, shared TT and runtime memory are separate from this kernel
metric. Full-root resource sizing remains unresolved; this change does not make
the next full root ready or authorize its trigger.

## Qualification and timing

53 storage/decision/arena/proof/worker controls passed. New controls:

- trap typed-array and ArrayBuffer/SharedArrayBuffer construction during a
  prepared exact search, and verify backing-storage growth counters remain fixed;
- exhaust state, residual and chunk reservations while preserving published IDs;
- reject malformed reservation inputs;
- reserve standalone local proof arrays and reset/re-solve without growth.

The new standalone test initially expected an object from `run()`; its actual
contract returns a scalar WDL. Correcting that test expectation was a harness
fix, not a solver-result change.

Slot64 residual, semantic replacement, ExploreHint and dependency campaigns
passed. The slot64 campaign was rerun after standalone proof reservation/reset
was added and passed. Changed production dependencies already route through
the existing bounded workflows. No remote workflow or full root was launched.

The normal empty 7-column, 6-row, connect-4 depth-8 runner now records storage
growth snapshots immediately before and after search and asserts equality. The
matching [line profile](evidence/2026-09-12-preallocated-line-cpu/line-cpu.md) retains
frozen source and sampled CPU estimates. It completed in 8540.6284 ms, with
unchanged search/proof/descriptor counters and no in-search storage growth.

Four isolated cold processes, baseline/candidate/candidate/baseline, each with
the existing 60-second external timeout, measured:

| Variant | Search times, ms | Mean search, ms | Mean CPU, ms | Mean setup, ms |
|---|---|---:|---:|---:|
| Before reservation | 8049.1311, 8186.2167 | 8117.6739 | 8078.5 | 34.70755 |
| Reserved/sealed | 8335.5180, 8226.4175 | 8280.96775 | 8195.5 | 46.2729 |

The candidate was **2.01% slower in elapsed search, 1.45% slower in CPU** in this
small comparison. No speedup is claimed. Allocation removal is verified; the
larger dictionary/reference footprint is a remaining locality/resource tradeoff,
not an established cause from these timings alone. Geometry, depth, proof work
and every search/descriptor counter match. The root remains unknown at depth 8.

[Comparison](evidence/2026-09-12-preallocated-storage/comparison.json), raw results,
source patch/hashes and qualification logs are retained together. All test
processes exited and the repository-configured diff check passed. Changes remain
uncommitted alongside the prior authorized work.

Next owner: reduce repeated chunk/class/state processing and size reservations
without reintroducing recursive allocation. Do not exchange the fixed-storage
contract for a silent grow-on-demand fallback merely to improve a small timing.
