# IsoMax integrated hot-loop optimization IsoGraph 0.1

**Issue:** #73 — Integrated Multi-Level IsoGraph Rendering of the IsoMax Hot Loop  
**Status:** performance-focused successor research artifact; not Connect4 logic authority 1.1  
**Research owner:** `research/semantic-quotient`  
**Solver realization inspected:** `solver/isometric@69a1ae0929b934682d475b31cdd4a38fac77fc12`  
**Qualified implementation evidence baseline/final:** `5acf8ea855fdead7e502091e62464bd5242f4ae5 -> a34743cd7ccd91185afd84c518e9eb610d03ab01`  
**Runtime evidence:** Node 26.7.0 / V8 14.6.202.34-node.28 / Windows x64 / Intel i5-12600K  
**Vocabulary:** `ISOMAX_HOT_LOOP_OPTIMIZATION_VOCAB_0_1.md`

## Purpose

This is not an assembly listing beside a semantic diagram. It is one causal object in which lower-level realizations are children of the semantic operation they implement:

```text
Connect4 / IsoMax semantic requirement
    -> source realization
    -> data/runtime realization
    -> observed generated machine realization
    -> measured consequence
```

NEI, QU and the Discovery Protocol operate *on this graph*:

- **NEI** determines which representation distinctions can be collapsed under a declared operation profile and which must remain distinct.
- **QU** preserves unresolved lowering/cost/distribution structure with its known constraints and interfaces instead of inventing facts.
- **Discovery Protocol** searches the cross-layer graph for repeated mismatch shapes, missing collapse, structural domination and wrong-layer work.

The optimization objective is to move executed structure toward the irreducible semantic structure while preserving exact ordinary value, first-win stopping, q identity, proof identity and lifecycle truth.

---

# 1. Semantic parent graph

The ordinary worker hot path is a demand-driven realization of the ranked exact value dependency:

```text
ranked q dependency DAG
    |
    +-- exact q cache lookup
    |
    +-- native terminal / exact frontier consequence
    |
    +-- optional guarded proof/value consumers (excluded from ordinary worker)
    |
    +-- forced dependency edge
    |
    +-- exact min/max child dependency fold
    |
    +-- exact q cache publication
```

The principal semantic units represented here are:

1. **ordinary value dependency** — exact P0-oriented W/D/L recurrence on a finite rank DAG;
2. **canonical q addressing** — support + normalized P0 residual + normalized P1 residual, with exact equality authority;
3. **own residual cofactor** — mover acquisition and exact antichain normalization;
4. **block residual cofactor** — opponent blocking and exact antichain normalization;
5. **support transition** — legal gravity/support update and reversible undo;
6. **advisory move order** — ordering only; never value authority;
7. **task necessity** — manager scheduling liveness only; never W/D/L;
8. **ranked q dependency DAG** — one canonical ordinary dependency may have multiple contextual parent/task occurrences.

These parents come from Connect4 semantics and accepted IsoMax contracts. JS/V8/assembly is not allowed to redefine them.

---

# 2. Integrated realization graph

## 2.1 Canonical q addressing

```text
canonical q addressing
    |
    +-- IsometricState.gameplayKey / canonical reflection
    |
    +-- IsoMaxTransitionCache.prepareKey
    |
    +-- 32-bit locator hash
    |      |
    |      +-- exact q equality remains authority
    |      +-- hash & mask locates probe slot
    |
    +-- solveNode carries prepared key/hash through exact store
           |
           +-- selected signed-int32 hash carrier
           |
           +-- V8 observation:
           |      solveNode allocation-top reads       6 -> 0
           |      HeapNumber-map loads                 3 -> 0
           |      optimized body bytes              8888 -> 8580
           |
           +-- sampled allocation attribution:
                  10,553,904 -> 65,552 bytes
                  (sampling includes setup/warmup; not a universal zero-allocation proof)
```

### NEI profile: bit-pattern consumer

For the locator operations that observe only the same 32 bits:

```text
signed int32 representation
unsigned JS-number representation
    -> SAME under P-ISOMAX-32BIT-CONSUMER
```

when the consumer is constrained to bit-preserving operations such as exact 32-bit masking.

They remain DISTINCT under JavaScript numeric-representation identity.

### NEI negative guard: q identity

```text
hash locator != canonical q
```

No NEI profile in this graph permits a hash collision to become q equality. Exact residual/support equality remains load-bearing.

### Optimization conclusion

The earlier source distinction “unsigned looks more natural for a hash” was performance-irrelevant to semantics and harmful to V8 representation. The safe collapse is at the **observed 32-bit pattern**, not at q identity.

---

## 2.2 Own residual cofactor / isolated-bit index

```text
own residual cofactor
    |
    +-- residual word scan / isolated-bit extraction
    |
    +-- bitIndex32 -> Math.clz32
    |
    +-- prior unsigned isolated high bit
    |      -> HeapNumber boxing at two MathClz32 sites
    |
    +-- selected signed-int32 isolated-bit carrier
           |
           +-- Math.clz32 ToUint32 observes identical 32 bits
           +-- all 625 terms x 42 cofactors/reflection independently checked
           |
           +-- V8 observation:
                  optimized body bytes              6208 -> 5616
                  allocation-top sites                 4 -> 0
                  HeapNumber-map sites                  2 -> 0
```

This is the second independent instance of the same NEI bit-pattern law.

### Cross-operation invariant

```text
semantic quantity = fixed 32-bit pattern
consumer          = bitwise / ToUint32-defined
general-number representation not required
    =>
signed-int32 carrier may preserve semantics while removing HeapNumber structure
```

This is a reusable optimization law candidate, not permission to make every unsigned domain signed.

---

## 2.3 Support transition

```text
support transition
    |
    +-- applyUnchecked / undo
    |
    +-- old runtime cell-mask derivation
    |      -> floating numeric conversion / power-related lowering
    |
    +-- domain fact: exactly 42 fixed cells
    |
    +-- selected profile-owned cellLo/cellHi tables
           |
           +-- exact mask equality independently checked
           |
           +-- generated-code observation:
                  applyUnchecked fast-C-call sites     4 -> 0
                  undo fast-C-call sites               4 -> 0
                  apply optimized body bytes        2912 -> 2484
                  undo optimized body bytes         2108 -> 1720
```

### Discovery interpretation

The semantic object was a **finite profile constant**, but the realization repeatedly reconstructed it as general numeric computation.

This is not merely “table lookup is faster.” It is a missing-collapse relation:

```text
profile-static finite-domain relation
    -> represented as runtime arithmetic
    -> unnecessary lowering/conversion structure
```

---

## 2.4 Advisory move-order incidence

```text
advisory move order
    |
    +-- semantic degree-two residual incidence
    |
    +-- prior arrays of JS objects
    |
    +-- selected flat fixed numeric incidence
           pairStart / pairEnd / pairWord / pairMask / pairOther
           |
           +-- same promoted-column decisions
           +-- exact WDL/work preserved in equal-work controls
```

NEI applies only to the advisory relation realized, not to object identity. The object records and flat numeric spans are alternative representations of the same qualified move-order incidence under the ordering-output profile.

---

## 2.5 Residual transition memoization

```text
own/block residual cofactor
    |
    +-- repeated exact (class, cell) transition
    |
    +-- selected 64K direct transition prefix
           |
           +-- exact class equality still authoritative
           +-- fixed preallocated storage
           +-- no recursive growth
```

Measured retained evidence:

```text
serial median      2304.59 -> 1943.12 ms
one-worker median  2666.45 -> 2375.84 ms
four-worker median 2362.54 -> 2065.04 ms
```

The graph therefore separates:

```text
semantic cofactor
!=
cost of recomputing an already-seen exact cofactor realization
```

The memo is a realization collapse, not new semantics.

A chunk-local blocker memo had very high apparent reuse but lost end-to-end time and remains negative evidence. “Repeated relation” is not sufficient; representation overhead belongs in the graph.

---

## 2.6 Singleton metadata

```text
normalized residual class
    |
    +-- semantic singleton-membership query
    |
    +-- vocabulary invariant:
    |      generated singleton term IDs 0..41 == cell IDs
    |
    +-- prior full 20-word scan/set-bit loop
    |
    +-- selected direct final-word projection
           |
           +-- exact for arbitrary interning/reflection
           +-- non-singleton residual information remains in the residual itself
```

This is another finite/static encoding relation that was present semantically but not exploited by the implementation.

---

## 2.7 Cold growth helper versus hot no-growth path

```text
capacity sufficiency
    |
    +-- ordinary sealed recursion: no growth is required
    |
    +-- ensureClassCapacity source contained nested growU32 helper
    |
    +-- observed V8:
    |      FUNCTION_CONTEXT_TYPE / captured-local allocation
    |      exists despite source early-return before helper use
    |
    +-- selected module-scope growU32
           |
           +-- cold allocation/copy remains behind existing growth guard
           +-- hot lexical context no longer needs captured helper environment
           |
           +-- observed:
                  internBits sampled allocation 14,853,112 -> 0 bytes
                  optimized body bytes              9328 -> 9164
                  allocation-top sites                 4 -> 0
```

### Discovery interpretation

Source control-flow dominance did not imply allocation dominance.

```text
source says: cold helper is after early return
machine says: lexical capture can affect hot invocation anyway
```

The load-bearing optimization relation is lexical/runtime topology, not source branch reachability alone.

---

## 2.8 Worker task necessity

```text
task necessity
    |
    +-- Branch Manager owns needed = 0/1
    |
    +-- worker scheduled control check
    |
    +-- selected poll interval 512 nodes
           |
           +-- precreated retirement token
           +-- full native unwind
           +-- retired work publishes no WDL
```

Measured four-worker bounded corpus:

```text
median latency      1904.36 -> 1768.53 ms
aggregate nodes     ~7.34-7.59M -> ~6.95-6.99M
```

This relation exists below scheduling semantics but above CPU instructions. It illustrates why #73 must include the execution topology surrounding the recursive loop rather than only arithmetic instructions.

---

## 2.9 Cold preparation order

```text
fixed-storage recursion requirement
    |
    +-- prepare/widen/grow storage before recursive entry
    |
    +-- prior ordering:
    |      grow class storage at old narrow reference width
    |      then widen -> copies large mostly-unused capacity
    |
    +-- selected ordering:
           widen while old class capacity is small
           then grow class storage
```

Cold empty-pool 262144-class reservation:

```text
bulk-set source bytes        5,289,984 -> 88,064
bulk-set destination bytes  21,018,624 -> 118,784
```

The same final semantic capacity is retained. The improvement follows from ordering two representation transforms, not from changing capacity semantics.

---

# 3. Higher-level execution mismatch: q DAG versus private task subtrees

The semantic dependency object is a ranked DAG:

```text
canonical q
  <- parent occurrence A
  <- parent occurrence B
  <- parent occurrence C
```

The current parallel realization uses bounded task-subtree occurrences:

```text
manager canonical q frontier
    -> worker task A -> private recursive TT
    -> worker task B -> private recursive TT
    -> worker task C -> private recursive TT
```

Manager-visible equal q is deduplicated, but convergence discovered inside separate running tasks is not globally visible until completion/split boundaries.

Final campaign evidence still shows:

```text
serial exact work      2,643,905 calls
four-worker work       ~7.09-7.17M calls
four-worker wall       slower than final serial on this corpus
```

The selected 512-node retirement check reduced obsolete work, but did not eliminate hidden cross-task overlap.

## NEI contextual-occurrence profile

The correct identity shape is:

```text
task occurrence A  DISTINCT occurrence B
        \             /
         \           /
          SAME ordinary q
```

under ordinary future-behavior identity, while task lineage/parent occurrence remains represented.

This is the same contextual-span pattern already exposed elsewhere in Connect4 NEI work: safe coarse sameness does not erase fine provenance.

## Derived optimization candidates

This graph directly motivates the existing IsoMax candidate issues:

- #89 rank-cut q frontiers;
- #90 dependency-leverage priority;
- #91 structural worker affinity;
- #92 support-fiber dominance-cone scheduling;
- #93 demand-triggered local supply front;
- #94 structural-pressure adaptive quanta;
- #95 forced-chain collapse.

They are candidates, not graph authority.

---

# 4. QU regions

## QU-HOT-01 — V8 lowering

Known:

- exact source revision;
- Node/V8/CPU environment;
- captured optimized-code summaries;
- specific allocation/map/call sites for selected operations;
- exact A/B semantic equivalence controls.

Open:

- lowering stability across V8 versions/tiering histories;
- whether remaining hot source constructs lower to hidden allocation/deopt structures in all representative runs;
- exact dynamic frequency of static generated-code sites.

Constraint:

```text
JS expression + runtime/version/tier/environment
    -> observed lowering
```

not:

```text
JS expression == universal assembly
```

Discriminating action: capture only when competing exact realizations differ or profiling identifies a material unresolved site.

## QU-HOT-02 — dynamic machine cost

Known:

- CPU statistical profiles;
- sampled allocation;
- generated-code summaries;
- end-to-end alternating process timings.

Open because `xperf` failed to configure counters:

- hardware branch-mispredict counts;
- cache-miss counts;
- retired dynamic instruction counts;
- direct attribution of those counters to semantic children.

These remain one connected QU region attached to their source/machine nodes, not three invented zero values.

## QU-HOT-03 — parallel work distribution

Known:

- manager q reuse exists;
- private worker TTs exist;
- overlap census demonstrates cross-worker duplicate portable q at task boundaries;
- four-worker aggregate work remains far above serial;
- busy retirement already helps.

Open:

- exact avoidable subtree work per duplicate;
- best visibility boundary for q publication;
- economics of rank-cut exposure versus manager work;
- value of affinity, priority, dominance and local supply-front policies.

The candidate issues #89-#95 are alternative lawful refinements of this QU region. None is selected by the graph without measurement.

---

# 5. Discovery Protocol findings

The integrated graph was inspected using the same discipline as the Connect4 Discovery Protocol campaigns:

```text
observe
-> align semantic quantity / scope / layer / authority
-> seek alternative factorization/common role
-> inspect immediate causal neighborhood
-> seek falsifier
-> preserve residual/unknown
```

## DP-HOT-01 — bit-pattern/static semantic facts represented too generally

Observed independently in:

- q locator hash carriage;
- isolated-bit/clz32 carriage;
- 42-cell masks;
- singleton vocabulary mapping;
- move-order incidence.

Common structure:

```text
semantic object has fixed finite / bit-pattern meaning
    ->
implementation represents or recomputes a more general object
    ->
V8/machine pays for generality
```

**Disposition:** structure established.

**Falsifier/boundary:** a consumer that depends on unsigned numeric magnitude, general Number semantics, dynamic domain extension, or object identity invalidates the corresponding collapse.

## DP-HOT-02 — cold representation structure can leak into hot machine structure

Observed nested growth helper caused context/allocation structure despite an early source return.

**Disposition:** structure established for the captured runtime.

**Boundary:** not every nested helper allocates; generated-code/profile evidence is required before changing source.

## DP-HOT-03 — semantic dependency DAG is materialized as partially hidden task subtrees

Observed exact q is the semantic reuse boundary, while running tasks own private recursive TTs.

**Disposition:** supported optimization lead; unresolved economics.

**Falsifier:** if earlier q exposure/affinity/shared publication costs at least as much as duplicate work saved, current subtree scheduling remains preferable.

## DP-HOT-04 — source-level cleanliness is not a reliable performance layer

Rejected candidates include hit-first interning, blocker chunk memoization, trusted unchecked primitive splits and manager epoch visitation. Each looked structurally simpler or removed an operation but failed end-to-end economics.

**Disposition:** structure established.

Optimization evidence must align:

```text
semantic equivalence
+ actual machine/runtime consequence
+ end-to-end economics
```

not source-operation count alone.

---

# 6. Cross-layer optimization laws exposed by the graph

These are the reusable conclusions of issue #73.

## Law candidate A — narrow to the strongest invariant actually observed by the consumer

If the semantic consumer observes only a fixed-width bit pattern, do not force a stronger Number-representation invariant.

This produced at least two independently qualified wins:

- q hash signed-int32 carriage;
- isolated-bit signed-int32 carriage.

NEI supplies the safe comparison profile.

## Law candidate B — compile profile-static finite relations once

If the domain/profile fixes a finite relation and recursive semantics only query it, runtime reconstruction is accidental work unless another invariant requires it.

Qualified instances:

- 42 cell masks;
- degree-two move-order incidence;
- singleton term-ID projection.

## Law candidate C — keep cold lifecycle structure out of hot invocation topology

A branch can be cold semantically while lexical/runtime machinery still contaminates every call.

Qualified instance:

- module-scope growth helper.

## Law candidate D — optimize the semantic dependency object, not merely each execution occurrence

Canonical q is a reusable dependency referent; task subtrees are contextual execution occurrences.

The four-worker work inflation shows the implementation still pays heavily for occurrence-local materialization. NEI contextual identity and QU distribution structure expose this as the next architectural optimization region.

---

# 7. Integrated performance consequence

Across the complete retained campaign, baseline and final implementation used identical preselected roots and exact outcomes.

| Mode | Baseline median | Final median | reduction |
|---|---:|---:|---:|
| Serial | 2379.87 ms | 1709.77 ms | 28.16% |
| One worker | 2761.83 ms | 2052.99 ms | 25.67% |
| Four workers | 2429.99 ms | 1779.85 ms | 26.75% |

Every pair favored the final implementation. Serial work remained 2,643,905 calls. The aggregate result is **not attributed to one graph edge**; individual units have their own evidence.

112 relevant tests passed at the integrated qualification checkpoint. The final bounded empty-root run timed out as expected with WDL unknown; it is not represented as a solve.

---

# 8. Authority and scope

This graph does **not**:

- mutate Connect4 logic authority 1.1;
- promote post-1.1 q-congruence or support-local isotony into frozen authority;
- equate hash identity with q identity;
- transfer proof/certificate premises through ordinary q equality;
- claim V8 lowering is universal across versions/architectures;
- claim hardware counter values that were not observed;
- claim four-worker scaling is solved;
- make #89-#95 accepted implementation policy.

It does establish a qualified performance representation in which semantic, source, runtime, generated-machine and measured-cost quantities are kept at their correct layers and connected by explicit evidence/unknown relations.

The graph should evolve demand-first: expand an unresolved machine/runtime child only when doing so can distinguish competing exact implementations or explain material cost.
