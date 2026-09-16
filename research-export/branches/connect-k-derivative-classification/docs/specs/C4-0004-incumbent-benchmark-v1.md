# C4-0004 — Incumbent Node benchmark protocol v1

**Status:** accepted benchmark-protocol specification

## Purpose

Define the first reproducible Node-local performance protocol for the qualified Connect4 incumbent. This protocol measures the incumbent before any CUDA-MCGS comparison exists. It owns Connect4 benchmark workload, isolation, metrics and evidence identity; it does not define generic CUDA-MCGS behavior.

Correctness authority remains C4-0001, C4-0002 and C4-0003. Performance evidence is invalid if those conformance gates fail.

## Canonical runtime

The initial canonical runtime is exactly Node `26.7.0`.

Every evidence record must bind at least:

- Connect4 source revision;
- Node and V8 versions;
- operating system/release and architecture;
- CPU model and logical CPU count when observable;
- board profile;
- TT capacity and ordering policy;
- benchmark fixture identity;
- requested depth/repetitions or wall-clock budget.

A result from another runtime or machine is separate evidence, not a silent continuation of the same measurement.

## Canonical board profile

The first benchmark profile is standard 7×6 Connect Four. This is a benchmark selection, not an implementation restriction. C4-0002/C4-0003 remain dimension-parameterized for the supported adjustable-board incumbent profiles.

## Fixed-request work lane

The fixed-request lane executes the same deterministic sequence of nonterminal roots at the same requested depth and repetition count.

Two variants differ only in cross-root search memory:

1. **persistent** — the production TT survives each reroot/search request;
2. **isolated-reset** — `resetSearchMemory()` is called before every root search.

The semantic request workload is therefore fixed while internal work is allowed to differ. This is intentional: node/evaluator-call reduction is itself the quantity being measured when persistent subtree knowledge is retained. Calling this lane "fixed request work" must not be misread as requiring equal internal node counts.

The fixture advances by a predetermined legal move sequence rather than the benchmarked engine's chosen move. Both variants therefore receive the same roots even when ordering changes a tie-selected move.

Required output includes:

- elapsed time;
- nodes and nodes/second;
- evaluator calls and evaluator calls/second;
- alpha-beta cutoff count/rate;
- TT probes and position hits;
- exact/lower/upper score-hit classes;
- exact returns and bound cutoffs;
- insufficient-depth hits;
- shallow/cross-perspective ordering reuse;
- cross-generation position/score/ordering reuse;
- stores/replacements;
- a decision checksum;
- practical process-memory snapshots/deltas.

No minimum speedup is a correctness condition.

## Fixed-wall-clock depth lane

The wall-clock lane answers a different question: what complete iterative-deepening depth fits inside a specified wall-clock budget on this exact runtime/machine?

To avoid adding timer checks to the alpha-beta hot path, the v1 protocol uses a **fresh-engine full-search depth sweep**:

1. reconstruct one frozen nonterminal position;
2. for depth 1, 2, 3, ... run a fresh full `search(position, depth)`;
3. repeat each candidate depth a fixed number of times;
4. use the median completion time for that depth;
5. report the deepest depth whose median full-search completion time is within the budget, plus the first depth over budget when observed.

This is a calibration sweep, not asynchronous interruption. It deliberately leaves the fixed-depth search implementation unperturbed by deadline branches. The evidence record must include every measured depth and its min/median/max time, nodes, evaluator calls and decision identity.

## Cross-move TT interpretation

Generation is measured but does not invalidate search work. The fixed-request persistent-vs-reset comparison is the primary incumbent evidence for cross-move subtree reuse.

Score reuse still follows C4-0003 perspective/depth/bound rules. Opposite-perspective or insufficient-depth entries may only influence ordering under the production policy.

Reset is an experiment-isolation control. It is not the normal engine policy and must never be presented as a production simplification.

## Allocation / GC evidence

The incumbent hot recursive path is specified to avoid board clones, node objects, callbacks, strings/JSON and temporary move collections. The benchmark records process memory before/after the fixed-request scenarios and, when Node is launched with `--expose-gc`, after an explicit out-of-timed-region collection.

Those deltas are practical retained-memory evidence, not a claim to count every V8 allocation. Deeper allocation profiling may be added separately without changing the search workload.

## CI evidence

Repository CI may execute this protocol to prove the harness works under exact Node 26.7 and to capture a revision-bound reference result. GitHub-hosted-runner timing is machine-specific and must not be promoted as a universal incumbent performance claim.

The benchmark-evidence workflow contains no performance threshold. A slower but correct run remains valid evidence rather than becoming a flaky correctness failure.

## Future CUDA-MCGS comparison

A later CUDA-MCGS lane must use Connect4-owned workload/evaluator acceptance and must distinguish at least:

- tree-equivalent/device-residency advantage; and
- graph/transposition-reuse advantage.

The incumbent persistent-vs-reset evidence establishes the host-side reuse baseline but does not authorize CUDA-MCGS work by itself. CUDA-MCGS issue #124 remains paused until explicit owner instruction.
