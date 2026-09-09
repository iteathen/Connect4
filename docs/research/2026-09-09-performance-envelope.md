# Exact-solver performance and composition envelope

**Date:** 2026-09-09  
**Status:** research constraint/checkpoint; maintained source and `main` unchanged.  
**Research lineage:** continues `research/forced-macro-implication-2026-09-09`.

## Purpose

Structural research has moved beyond semantic proof-of-concept. Candidates must now be evaluated against the performance characteristics of the fixed-width exact-solver work rather than against BigInt/Map reference-harness speed.

The objective is **time to exact proof**. Raw node reduction and raw nodes/second are supporting metrics, not standalone objectives.

Candidate interactions are also first-class. Some mechanisms alter state identity, branching, proof order, TT pressure, or metadata cost in ways that make another mechanism materially stronger or cheaper. Therefore a candidate is not rejected solely because its standalone implementation loses if there is a concrete, testable composition mechanism that could make the combined system win.

## Preserved sandbox performance evidence

The 2026-09-08 exact-solver checkpoint recorded a clean Debian/Node sandbox with roughly four CPU cores of effective quota.

Important measurements:

- same-sandbox reconstructed Fhourstones C reference: about **9.03 M positions/s** single-thread;
- Node fixed-width two-word arithmetic with TT disabled: about **9.47-9.99 M nodes/s** single-thread;
- raw independent-worker scaling: **8.81 M/s** at 1 worker, **13.74 M/s** at 2, **20.77 M/s** at 3, **30.17 M/s** at 4, with one 4-worker sample at **33.27 M/s**;
- clean long exact empty-board proof passes completed **8.892 billion nodes** in **647.134 s**, or about **13.74 M nodes/s aggregate** across seven completed passes;
- fastest completed long pass: **15.61 M nodes/s**.

This is strong performance for a virtualized sandbox and demonstrates that Node/V8 itself is not the dominant bottleneck when the hot representation is fixed-width and allocation-free.

These values are environment-bound research evidence, not universal release thresholds. Same-machine/same-runtime comparisons remain required.

## Existing specification alignment

The accepted Connect4 search/benchmark specifications already support the intended discipline:

- fixed-size preallocated TT storage;
- primitive/typed-array fields rather than object-per-node state;
- no strings, JSON, closures, board clones, sorting objects or temporary move collections in the recursive hot path;
- explicit elapsed-time and nodes/sec evidence;
- fixed-wall-clock depth qualification without timer branches in recursion;
- correctness/conformance as a prerequisite for performance claims.

The structural exact-solver line should preserve and strengthen these properties.

## Hot-path constraints

A production-oriented residual solver should avoid the following per visited node unless same-environment measurement proves the operation buys more proof reduction than it costs:

- BigInt arithmetic;
- JavaScript `Map`/`Set` state identity;
- string key creation or serialization;
- object or array allocation;
- dynamic sorting;
- generic graph traversal;
- variable-size compatibility-set construction;
- full-board reconstruction;
- repeated scanning of all 625 requirement IDs when a fixed-width/precomputed alternative exists;
- per-node atomics or synchronization;
- resource/policy selection that can be resolved at root/pass/task boundaries.

Prefer:

- 32-bit scalar locals and typed arrays;
- fixed precomputed transition tables;
- fixed-width bitsets;
- compact numeric state identity;
- direct or very small bounded table probes;
- incremental state updates;
- branch-local scratch allocated once outside recursion;
- compile/root-time conversion from board/history into residual state;
- coarse task/resource decisions handed to the kernel as resolved numeric values.

## Break-even NPS rule

For the same exact workload and machine/runtime:

```text
candidate_time < baseline_time
iff
candidate_NPS > baseline_NPS * (candidate_nodes / baseline_nodes)
```

Using **13.74 M nodes/s** only as an illustrative sandbox reference:

- 9.93% fewer nodes requires about **12.38 M/s** to break even;
- 26.80% fewer nodes requires about **10.06 M/s**;
- 33.89% fewer nodes requires about **9.08 M/s**.

Node savings therefore define the maximum affordable per-node overhead.

## Composition is a first-class performance property

Do not evaluate every mechanism only in isolation.

For candidates A and B measure at least:

```text
base
A
B
A+B
```

and, where another stack S is already established:

```text
S
S+A
S+B
S+A+B
```

Track both node and elapsed-time interaction.

Define a simple node-work synergy ratio:

```text
expected_independent_fraction = (nodes_A / nodes_base) * (nodes_B / nodes_base)
observed_combined_fraction = nodes_A+B / nodes_base
synergy = expected_independent_fraction / observed_combined_fraction
```

- `synergy > 1` means the pair removes more nodes than independent multiplication predicts;
- `synergy ~= 1` means approximately independent composition;
- `synergy < 1` means overlap/interference.

Elapsed-time synergy matters more than node synergy. A mechanism may reduce another candidate's metadata cost, improve locality, reduce TT pressure, increase hit rate, or turn a dynamic calculation into a precomputed consequence. Those effects must be measured directly.

### Candidate classifications

Use these dispositions instead of a simple pass/fail:

1. **standalone winner** — improves time to proof by itself;
2. **conditional enabler** — may lose alone but makes another mechanism materially cheaper/stronger for a known reason;
3. **composition winner** — combined system wins even though one component does not standalone;
4. **semantic candidate only** — exact/node-positive but no currently plausible performance integration;
5. **rejected** — unsound or repeatedly cost-negative with no credible integration mechanism.

A conditional enabler must name the expected interaction. "Maybe it helps later" is not enough.

## Known/current interaction examples

### Cardinality bounds + residual automorphisms

Already positive together. Automorphism checking becomes materially more attractive after cardinality bounds shrink the search and the 625-ID representation makes permutation checks fixed/precomputed.

### Tactical closure + forced macro-edges

Strong positive composition. Tactical closure removes immediate solved states; macro-edges then delete deterministic transit states that remain. In the current stack the macro result was substantially stronger than in the unstacked control.

### Support-compatible implication reuse

Currently node-positive but time-negative. Keep as a conditional/semantic candidate because an event/support representation or incrementally maintained proof frontier could remove most of its lookup overhead. It should not enter the hot stack until that interaction is demonstrated.

### Allis/Victor proof rules + residual 625-ID representation

The original dynamic compatibility graph would likely violate the envelope. The candidate survives because the 625-ID substrate may compile rule coverage and conflicts into fixed-width masks, potentially turning expensive proof logic into a few bit operations. Qualification must test the compiled combination, not only a literal VICTOR-style implementation.

### Incumbent evaluator + proof-cost ordering

The evaluator may be too expensive if rescanned naively per node, but residual/incremental live-line and parity metadata may make the same information almost free. It should therefore be tested both as a direct ordering control and as a residualized incremental signal.

### Support-event representation as an amplifier

This remains a synthesis candidate rather than accepted architecture. Its potential value is partly compositional: it could make support-aware earliest-win bounds, Allis Aftereven/Before logic, implication compatibility, and neutral-tempo handling cheap native state operations. Its value must be judged by the resulting combined kernel, not by representation elegance alone.

## Qualification protocol going forward

Every performance-sensitive candidate or combination should report, on representative exact workloads:

1. exact score/oracle agreement;
2. visited nodes;
3. elapsed time with warm-up separated;
4. nodes/sec;
5. TT probes/hits/writes where relevant;
6. candidate-specific operations/hits/cutoffs;
7. memory/layout identity;
8. runtime/machine identity;
9. standalone result;
10. composition against the strongest current stack;
11. interaction/synergy explanation when the combined result differs materially from independent expectation.

A slow reference implementation can establish semantics. **Promotion requires a representation-native implementation and a same-environment time-to-proof win, either standalone or as part of a measured composition.**

## Current design target

The CPU research kernel should retain the broad performance shape already demonstrated by the two-word solver:

- roughly C-class fixed-width arithmetic throughput on the same sandbox class;
- compact/local TT access rather than global random-memory bookkeeping;
- structural features paid for through precomputation and incremental state, not allocation;
- fewer semantic states **and** cheap surviving nodes.

The eventual GPU implementation can have a different absolute throughput/cost structure, but the same accounting applies: no clever mechanism gets a free pass on hot-path cost, and combinations should be judged by total time/resource cost to proof.