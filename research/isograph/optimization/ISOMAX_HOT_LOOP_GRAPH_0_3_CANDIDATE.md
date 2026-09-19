# IsoMax Hot-Loop Integrated IsoGraph — 0.3 Candidate

**Status:** active successor candidate for hot-loop optimization research  
**Owner:** `research/semantic-quotient`  
**Solver realization inspected:** `solver/isometric@69a1ae0929b934682d475b31cdd4a38fac77fc12`  
**NEI successor dependency:** `iteathen/isograph@485a16cd44299b3e7ec03768791d261a38bc08c8`, `extensions/nei/NATURAL_ENTROPIC_IDENTITY_SPEC_0_4_CANDIDATE.md`  
**Gameplay authority effect:** none  
**Supersedes for active hot-loop interpretation:** the 0.1 optimization graph, 0.2 NEI correction layer, and 0.1/0.2 qualification/discovery overlays  
**Historical evidence retained:** all prior artifacts remain immutable research/provenance evidence

## 1. Governing rule

This graph does not use NEI as a generic equivalence engine.

The current interpretation is:

```text
semantic operation
    -> exact source/representation realization
    -> exact scoped equivalence where substitution is proved
    -> runtime/JIT realization
    -> machine realization
    -> measured cost

unresolved runtime/distribution structure
    -> QU

genuine identity question, if one remains
    -> evidence + QU
    -> admissible identity models
    -> derived NEI result
```

Most hot-loop optimization questions are **representation equivalence** questions, not natural/domain identity questions.

## 2. Semantic parents

The ordinary worker realizes:

1. exact ordinary W/D/L dependency over a finite ranked game DAG;
2. canonical q lookup/store using exact `(P0 residual, P1 residual, support)`;
3. mover residual cofactor;
4. blocker residual cofactor;
5. reversible support/playability transition;
6. advisory move ordering;
7. task-necessity polling;
8. manager-level canonical q dependency sharing.

These semantic parents are not redefined by JavaScript/V8/machine behavior.

## 3. Representation-equivalence layer

### 3.1 Prepared q hash carriage

The baseline unsigned-Number hash carrier and selected signed-int32 carrier are two representation occurrences.

Exact qualified fact:

```text
pi32(hash_unsigned) = pi32(hash_signed)
```

for the pinned locator operations that consume only the same 32 bits.

This is an **exact scoped equivalence** under the locator operation. It does not imply:
- equal JavaScript numeric representation;
- equal numeric magnitude;
- q equality;
- NEI SAME.

The q hash remains a locator only. Full exact q coordinates authorize a cache hit.

Observed selected realization:
- solveNode allocation-top reads: 6 -> 0;
- HeapNumber-map loads: 3 -> 0;
- optimized body: 8888 -> 8580 bytes;
- sampled solveNode allocation attribution: 10,553,904 -> 65,552 bytes.

### 3.2 Isolated-bit carriage

For the input to `Math.clz32`:

```text
pi32(bit_unsigned) = pi32(bit_signed)
```

under the exact bit-index operation.

This is again scoped representation equivalence, not a global identity statement.

Observed selected realization:
- body 6208 -> 5616 bytes;
- allocation-top sites 4 -> 0;
- HeapNumber-map sites 2 -> 0.

### 3.3 Profile-static finite relations

These are exact finite-domain realization substitutions:

- 42 cell masks: runtime arithmetic -> precomputed profile masks;
- degree-two move-order incidence: JS object records -> flat numeric arrays;
- singleton metadata: residual scan -> direct projection from fixed vocabulary placement;
- growth helper: nested lexical helper -> module-scope cold helper;
- preparation ordering: grow-then-widen -> widen-then-grow with identical final storage semantics.

Their correctness burden is reconstruction/equivalence under the owned operation, not NEI.

## 4. Exact q identity versus occurrence identity

### 4.1 Cache equality

Within one residual pool:

```text
q_cache =
canonical P0 residual class
+ canonical P1 residual class
+ canonical packed support
```

Hash values, slots and pool-local IDs are addressing machinery, not portable semantic identity by themselves.

### 4.2 Contextual task occurrences

A canonical q dependency may appear in multiple parent/task occurrences:

```text
task occurrence A
task occurrence B
    -> same manager-visible q projection
```

The occurrences remain distinct execution/provenance occurrences.

Whether equal q states are one **ordinary future-behavior identity** is a game-theory question owned by the Connect4 game-theory IsoGraph, not by this performance graph.

This graph consumes that result only after it is qualified in the game-theory owner.

## 5. NEI placement

There is currently **no required hot-loop NEI SAME/DISTINCT claim** for the retained implementation optimizations.

If a future optimization asks a genuine identity question, it must use NEI 0.4 successor semantics:

```text
identity query context
+ exact/probabilistic identity evidence
+ QU when identity-relevant uncertainty exists
    -> admissible identity models
    -> derived result
```

The hot-loop graph MUST NOT:
- declare a relation identity-preserving/separating to obtain the desired result;
- convert scoped representation equivalence into global identity;
- invent a Bayes factor from benchmark counts or repeated successful tests.

No calibrated identity Bayes factors currently exist in this graph.

## 6. QU regions

### QU-HOT-01 — V8 lowering

Known:
- pinned source/runtime/CPU;
- generated-code summaries;
- selected allocation/map/call-site observations;
- exact behavioral A/B controls.

Open:
- tier/version stability;
- remaining hidden allocation/deopt structure;
- dynamic frequency of static generated-code sites.

### QU-HOT-02 — dynamic machine cost

Known:
- CPU statistical profiles;
- sampled allocation;
- alternating-process wall time.

Open:
- branch misses;
- cache misses;
- retired dynamic instruction counts.

No zero values are inferred from missing hardware counters.

### QU-HOT-03 — workload distribution

Known:
- manager-visible q dedup exists;
- worker TTs are private;
- cross-worker portable-q overlap is observed;
- four-worker aggregate work remains substantially above serial;
- busy-task retirement helps.

Open:
- avoidable work per hidden duplicate;
- best q publication/cut boundary;
- affinity/priority/frontier economics;
- interaction with task-entry and memory pressure.

Current candidate refinements:
- #78;
- #89-#95.

None is selected by this graph without measurement.

## 7. Current optimization candidates

Representation/runtime:
- #96 full signed hash-mix chain — structural candidate; no whole-chain NEI result assumed;
- #97 support-first mirror/q canonicalization;
- #98 terminal-before-q and guarded post-win transition collapse;
- #99 repeated residual-word reuse in move ordering;
- #100 dense class-load/cofactor fusion;
- #101 ordinary-WDL cache specialization without narrowing the generic q cache.

Distribution:
- #78 portable exact cross-worker reuse;
- #89 rank-cut q frontiers;
- #90 dependency-leverage priority;
- #91 structural worker affinity;
- #92 support-fiber dominance-cone scheduling;
- #93 demand-triggered local supply front;
- #94 structural-pressure adaptive quanta;
- #95 forced-chain macro edges.

Each remains a candidate until isolated correctness and end-to-end economics qualify it.

## 8. Integrated retained performance evidence

Against the original issue-campaign baseline:

| mode | baseline median | retained final median | less time |
|---|---:|---:|---:|
| serial | 2379.87 ms | 1709.77 ms | 28.16% |
| one worker | 2761.83 ms | 2052.99 ms | 25.67% |
| four workers | 2429.99 ms | 1779.85 ms | 26.75% |

Exact W/D/L and root actions agreed on the retained corpus.

The aggregate improvement is not assigned to one graph edge.

## 9. Historical artifact disposition

The following are **superseded for active interpretation** and retained only as provenance/evidence:

- `ISOMAX_HOT_LOOP_OPTIMIZATION_GRAPH_0_1.*`;
- `ISOMAX_HOT_LOOP_NEI_APPLICATION_0_2.*`;
- `ISOMAX_HOT_LOOP_DISCOVERY_PROTOCOL_0_1.md`;
- `ISOMAX_HOT_LOOP_FULL_DISCOVERY_0_2.*`;
- `ISOMAX_HOT_LOOP_QUALIFICATION_0_1.md`;
- `ISOMAX_HOT_LOOP_QUALIFICATION_0_2.md`.

Future hot-loop research reads this 0.3 candidate as the single current semantic interpretation.

Historical evidence remains usable at its exact pinned revision.

## 10. Promotion burden

Before this candidate can be called qualified current performance-research authority:

1. mechanical native/JSON closure;
2. verify every retained exact equivalence against its original controls;
3. verify no old NEI claim is needed to justify a retained implementation;
4. verify game-theory q identity is consumed only from its current owner;
5. verify QU regions preserve known constraints and unknowns;
6. run one full Discovery Protocol pass against this cleaned graph;
7. record candidate issue dispositions without promoting unmeasured changes.

