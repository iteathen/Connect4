# Phase-2 result — shared exact-cache known-hash reuse

Date: 2026-09-27
Status: all-hot known-hash reuse is the current completed exact-control winner.

## Live implementation evidence

JSMinSys four-arm workflow:
- run: `36379171950`
- artifact: `10952570017`
- digest: `sha256:1569da67427f7a2190bfaa7607b8042b7090a72dbd3199ea92f8c9b4449c25cd`

Standard hosted Windows topology:
- `availableParallelism() = 4`
- 4 search workers
- worker 0 wide/root-frontier
- workers 1..3 deep
- no single-worker qualification.

Arms:
- retained coalesced+shared-draw: `e449df20dc59cc6c1e5b2da78134751a2376f355`
- all-noncutoff shared fallback: `4161b37e949adf05d3e10978547a40adf15a2743`
- fallback known-hash reuse: `2cf45625023877072a9a4e6f4e2667a7aee7b4c2`
- all-hot known-hash reuse: `48c514e747cb2656666b951f97e0928dda501cf7`

## Completed exact control — 353335714

Four balanced blocks; all arms exact with root WDL -1 / root move 4.

All-hot known-hash reuse versus retained coalesced winner:
- process cycles: **-2.088%**
- 95% interval: **[-2.915%, -1.262%]**
- wall: **-2.649%**
- CPU: **-2.260%**
- nodes: -0.479%, interval crosses zero
- cycles/node: **-1.617%**
- 95% interval: **[-2.016%, -1.218%]**

The improvement is primarily reduced operation cost, not a tree-size change.

## Official hard fixed window — 35333571

One balanced block, unchanged 120-second application ceiling.

All arms timed out. No exact solve ratio is admissible.

The censored block reversed the earlier all-noncutoff fallback hard lead:
the retained coalesced arm searched fewer nodes, while the all-hot known-hash
arm still had the lowest cycles/node.

Interpret this as high Lazy-SMP search-path/scheduling variance on the censored
hard fixture, not as an exact ranking.

## Structural conclusion

The current q already owns the full locator hash for its local direct-map slot.
Reusing that value for shared exact probe/store removes duplicate locator mixing
without weakening shared correctness:
- full q-key comparison remains;
- sequence validation remains;
- exact-only shared semantics remain;
- no solved prior information is introduced.

## Next pass

Split compatibility/default-path shared helpers from mandatory-known-hash hot
helpers so production hot callers do not pay:

    knownHash === undefined

on every shared operation.

The public/default helper remains available for cold/external callers. The hot
helper must preserve all key/sequence/atomic work and receive its own NEES
ledger before timing.

Current production PR #84 remains draft/open and is not authorized for merge by
this result alone.
