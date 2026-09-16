# Native singleton-effect ordering experiment

**Date:** 2026-09-15  
**Research direction / structural architecture / invariant-first program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT  
**Branch:** `research/terminal-frontier-horizon-exact`  
**PR:** #45 — `research: exact decisive frontier before horizon evaluation`

## Status

Accepted as an ordering-only performance result.

This experiment does **not** promote residual degree, singleton creation, line incidence, or any local structural effect to signed W/D/L authority. Exact terminal/tactical certificates remain ahead of advisory ordering. The unresolved guarded cofactor-to-obligation theorem remains unresolved.

The result is important because it demonstrates a useful cross-layer correspondence:

```text
positive residual cofactor / support effect
        ~=
transition-local exact frontier effect
        ->
small advisory ordering class
```

The structural effect is exact as a transformation descriptor even though it is not value-complete.

## Pre-experiment synthesis

The experiment was selected only after reading together:

1. the structural logic route (`CROSS_LAYER_SYNTHESIS.md`, the cross-layer protocol, positive cofactor / anchored-zero-edge / CPC / WDL-interval work, and negative controls);
2. the code/performance history, including the terminal-frontier maintenance/consumption break-even lesson and the older live-line ordering control;
3. the live incumbent implementation line by line: search, position/transition frontier, evaluator, TT, static profile/incidence, and the preserved Branch Manager/work-DAG lane.

The implementation-side seam was unusually clean:

- `profile.mjs` already precompiles cell -> winning-line incidence;
- `position.mjs` already maintains exact per-line owner counts, empty-cell XOR, and singleton refs;
- therefore a move effect can be inferred from the landing cell's incident lines without a board scan, allocations, or speculative apply/undo of every candidate.

The older live-line orderer was retained only as a negative/control idea. Surviving-line count alone does not encode support, response slots, deadlines, or signed value.

## Experiment definition

Control code checkpoint:

`1863961eb6fadb5fca172e08581fe9b19a4824cd`

Paired-harness commit:

`26178db11b3c51a2faadab601e2e069af17234cb`

Ordering implementation commit:

`3a235df2807858242bff441f2f96707859ce5636`

Focused structural-effect qualification commit:

`8d26e87f81c9321beab9060d7e9d1fc1d1faf64e`

The ordering experiment leaves these authorities unchanged:

1. exact cached/terminal result;
2. exact horizon immediate-win / double-threat classification;
3. TT score/bounds and TT best-move hint;
4. exact non-horizon immediate win / double-threat / unique forced block handling.

Only after those layers, and only below the root, one non-TT move may be promoted ahead of the remaining static move order.

### Effect descriptor

For a legal landing cell `x` by player `p`, the descriptor is inferred from the current native frontier:

- exact own degree-2 -> degree-1 contractions on lines incident to `x`;
- support exposure of an already existing own singleton directly above `x`;
- support exposure of an already existing opponent singleton directly above `x`.

Own playable singleton completion cells are counted by **distinct completion cell**, capped at two for the tiny class. An opponent singleton exposed by the support step is a veto on advisory promotion.

The classes are therefore lexicographic/categorical, not a weighted scalar:

```text
2 distinct own playable singleton completions, no opponent exposure
1 distinct own playable singleton completion, no opponent exposure
otherwise: preserve incumbent static order
```

The helper consumes only existing:

- `heights`;
- cell -> line incidence;
- packed `lineState`;
- `lineEmptyXor`;
- singleton refs.

No new maintained metadata was introduced, so there is no maintenance-only tax to amortize. The experiment is a direct comparison of classifier cost versus search-work reduction.

Root move order was deliberately left unchanged to avoid conflating the experiment with externally visible root tie selection.

## Proof boundary

What is exact:

- owner-labelled residual contraction/deletion as Boolean cofactor structure;
- which incident degree-2 residual becomes degree-1 after this placement;
- which empty completion cell remains;
- whether that completion is playable after the support change;
- whether the support step exposes a currently existing opponent singleton.

What is **not** asserted:

- degree drop has signed value;
- one created singleton is a universal win;
- two locally created singletons are a universal theorem outside the already qualified tactical classifier;
- absence of the descriptor implies bad play, draw, or loss;
- this descriptor may prune, narrow WDL intervals, or certify an obligation.

This is advisory ordering only.

## Null A/B calibration

Before the production mutation, the paired workflow compared identical production code on the same Node 26.7.0 hosted job.

Actions run: `34996146828`.

Deterministic metrics and the decision checksum were identical, as required. Hosted timing still moved by about 2-3% between identical code:

- persistent elapsed: `462.858 ms` control vs `472.196 ms` candidate-like checkout (`+2.02%`);
- reset elapsed: `551.964 ms` vs `534.935 ms` (`-3.09%`);
- deep wall-depth samples also moved by low-single-digit percentages.

Therefore low-single-digit hosted timing changes are treated as noise unless backed by deterministic work reduction or a much larger same-runner effect.

## Paired Node 26.7.0 result

Actions run: `34996641695`.

ABBA shape on the same hosted job:

```text
control A -> candidate A -> candidate B -> control B
```

### Persistent fixed workload

| Metric | Control | Candidate | Delta |
|---|---:|---:|---:|
| elapsed | 458.040 ms | 424.125 ms | **-7.40%** |
| nodes | 835,065 | 660,565 | **-20.90%** |
| evaluator calls | 467,865 | 341,205 | **-27.07%** |
| TT probes | 351,375 | 308,070 | -12.32% |
| TT score hits | 58,155 | 46,135 | -20.67% |
| TT bound cutoffs | 45,615 | 36,320 | -20.38% |
| TT stores | 300,910 | 267,365 | -11.15% |
| TT replacements | 1,645 | 1,120 | **-31.91%** |

Decision checksum: unchanged.

### Reset-each-root workload

| Metric | Control | Candidate | Delta |
|---|---:|---:|---:|
| elapsed | 508.871 ms | 445.880 ms | **-12.38%** |
| nodes | 1,049,345 | 794,750 | **-24.26%** |
| evaluator calls | 603,620 | 416,335 | **-31.03%** |
| TT probes | control | candidate | -13.98% |
| TT score hits | control | candidate | -23.10% |
| TT bound cutoffs | control | candidate | -22.22% |
| TT replacements | 100 | 55 | **-45.00%** |

Decision checksum: unchanged.

The reduced TT traffic is a consequence of searching less tree, not evidence that TT retention itself has been solved.

### Deep wall-depth samples

The shallow classifier has visible fixed overhead at very small depths. The intended recursive regime is strongly positive:

| Depth | Candidate elapsed change | Approx. speedup |
|---:|---:|---:|
| 6 | -31.71% | 1.46x |
| 7 | -24.57% | 1.33x |
| 8 | -9.34% | 1.10x |
| 9 | -24.63% | 1.33x |
| 10 | -24.34% | 1.32x |
| 11 | -22.32% | 1.29x |
| 12 | -23.95% | 1.31x |
| 13 | -33.41% | 1.50x |
| 14 | -29.62% | 1.42x |

The work reduction is much larger than the null-run timing noise and is deterministic.

## Independent solved-strength qualification

The pre-ordering strength run (`34996144605`) and ordering strength run (`34996641543`) report the same move-quality aggregates at every reported depth.

Key unchanged values:

- calibration depth 1: `118 / 128` optimal, `124 / 128` result class preserved;
- calibration reaches `128 / 128` optimal at depth 8 and remains perfect through depth 12;
- beginning spot-check depth 1: `29 / 30` optimal, `30 / 30` result class preserved;
- beginning spot-check depth 12: `28 / 30` optimal.

Search work on the same solved-strength task nevertheless drops:

- calibration depth-12 nodes: `192,380 -> 167,372` (**-13.00%**);
- calibration depth-12 evaluator calls: `41,854 -> 35,759` (**-14.56%**);
- beginning spot-check depth-12 nodes: `1,223,398 -> 865,252` (**-29.27%**).

Known hard vector `54676552255627` remains a useful negative control:

- depth 12 remains wrong/result-class-dropping;
- depth 19 remains correct/optimal;
- ordering changes search work but does not erase the known semantic difficulty.

This guards against claiming that better ordering is equivalent to a stronger value theorem.

## Structural-effect invariant qualification

`components/incumbent/test/structural-order-effects.test.mjs` independently compares the pre-move descriptor formula against the realized child singleton frontier on quiet nonterminal states across:

- 4x4;
- 5x4;
- 7x6;
- 8x6;
- 6x7.

The oracle materializes the child only in the test path, counts realized playable singleton completion cells for both players, then undoes the move. Production still performs no per-candidate child materialization.

This test qualifies the structural transformation correspondence only. It does not use solved labels and does not assert value completeness.

## Interpretation

The accepted cross-layer lesson is stronger than the older live-line heuristic:

> An exact local structural transformation can be a high-value ordering signal without being a value theorem.

The successful signal is close to the same residual event algebra already used in the structural research and close to the same first-order facts already owned by the transition frontier. That is the desired theorem/runtime isomorph seam.

It also reinforces the earlier performance lesson:

> maintain stable first-order structural facts once; derive cheap second-order consumer consequences where they pay.

Here no new aggregate needed to be maintained at all.

## Negative results / limits retained

- Static surviving-line incidence alone remains too weak as the primary structural ordering signal.
- A local degree drop remains unsigned.
- Response-slot serialization and deadlines are still absent from this tiny descriptor.
- A move exposing an immediate opponent singleton is deliberately not promoted even if it also improves own local residual structure.
- Shallow depths can lose wall time because classifier overhead is not yet amortized.
- The known hard solved vector shows that improved ordering does not close the value-calculus gap.
- No conclusion about TT bucket/key aliasing, replacement economics, or cross-worker contention follows from fewer TT accesses.

## Next attributable experiments

Preserve this accepted class and add one structural tier at a time.

Most promising next ordering experiment:

1. keep exact theorem/certificate classes first;
2. keep the accepted playable-singleton effect class;
3. add **opponent residual destruction/blocking** as a separate lexicographic advisory tier;
4. then test **own residual contraction / live-line incidence** separately;
5. do not collapse the tiers into an opaque weighted sum.

Before adding maintained metadata, first ask whether the effect is already derivable from the landing cell's incident-line transition facts. If another consumer (TT retention or Branch Manager scheduling) needs the same descriptor, that is the trigger to consider a compiled structural consequence/effect plane rather than duplicating interpretation.

Branch Manager remains a later high-leverage consumer: proof externality/fan-in, interval width, certificate deficit, response resources, and deadline slack should be investigated as structural scheduling facts, not mixed into Negamax value semantics.

TT retention remains separate: distinguish key aliasing, bucket/probe cost, capacity/replacement eviction, and cross-worker contention before changing policy.

The theorem-side active target remains unchanged:

```text
MixedCofactorConsequence
+ AdmissibleSupport
+ UniversalInterventionStability
+ SharedResourceAccounting
+ FirstWinBeforeDeadline
-> CertifiedObligation
```

No ordering result in this note supplies the missing quantifier/deadline proof.
