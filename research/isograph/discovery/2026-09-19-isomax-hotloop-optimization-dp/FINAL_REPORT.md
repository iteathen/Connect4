# IsoMax Hot-Loop Optimization Discovery — Final Report

**Date:** 2026-09-19  
**Owner:** `research/semantic-quotient`  
**Discovery scope:** DP-01 through DP-45 against qualified IsoMax hot-loop graph 0.3  
**Solver realization inspected:** `solver/isometric@eb8928fe6f4c4b3dba6ad3e2d42f186947a6ebf2`  
**IsoGraph dependency inspected:** `iteathen/isograph@55c98d31dd2715cdb48abe4f8e313fd72d0dabba`  
**Authority effect:** none; this is discovery evidence, not implementation or semantic promotion.

## 1. Result

The complete DP-01..DP-45 pass is complete.

It found:

- **no new semantic defect** in current Connect4 logic authority 1.2;
- **no q_o/q_r collapse**;
- **no need for a new hot-loop NEI identity result**;
- one strong new worker-kernel optimization lead;
- one strong manager reconstruction lead;
- one conceptual strengthening of deterministic-chain scheduling;
- two measurement-gated runtime leads;
- a deeper common cause connecting the multicore candidate family;
- several durable negative/stop results.

No solver source was changed.

No duplicate candidate issue was created.

## 2. Authority and concurrent-work disposition

The campaign began while the research branch was advancing through Experiment 018 and authority promotion.

Current game-theory routing is the promoted root:

`research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md`

with manifest:

`research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_2.json`

The older successor authority aliases were subsequently retired by concurrent cleanup. Their removal was preserved; this campaign does not recreate them.

The separate performance-research authority remains:

`research/isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_AUTHORITY_0_3.md`

It has no gameplay-authority effect.

## 3. Established structure

### 3.1 q scope

```text
q_o
    orientation-sensitive ordinary future-behavior carrier

q_r
    horizontal-reflection orbit quotient of q_o
    action transporter c -> 6-c when orientation differs
```

The hot-loop exact value cache consumes q_r.

Equal q_r supports exact scalar W/D/L/value reuse and future-game correspondence under explicit action transport.

It does not imply:
- identical literal action labels without transport metadata;
- physical occurrence identity;
- move-history identity;
- proof/certificate identity.

### 3.2 Ordinary recurrence

The semantic object remains a finite ranked q dependency DAG:

```text
q_r --legal action--> q_(r+1)

V(q_(r+1)) -> V(q_r)
```

The current execution materializes only part of this DAG globally. Workers privately materialize additional q dependencies inside bounded recursive tasks.

### 3.3 Native frontier precedence

Current exact native classification establishes:

```text
terminal
bilateral residual exhaustion
playable mover singleton -> exact immediate win
multiple playable opponent singletons -> exact loss
one playable opponent singleton -> forced move
otherwise quiet
```

Own-win precedence is load-bearing.

### 3.4 WSL terminal construction

The generated standard-7x6 WSL profile has 625 terms and defines:

```text
reduce(term, cell) == terminal
    iff removing cell makes the term empty
    iff term == {cell}
```

The profile independently checks the singleton-term-ID/cell-ID correspondence.

### 3.5 Worker portability boundary

Worker tasks correctly transport legal move history rather than pool-local residual/chunk IDs.

Pool-local IDs are realization identifiers, not portable semantic q identity.

## 4. Strongest new supported optimization lead

### F-002 — frontier-qualified nonterminal mover cofactor

This is the strongest new exact worker-kernel result.

From native frontier closure:

```text
frontier is forced or quiet
    ->
no playable mover singleton
```

For every legal landing cell after that classification:

```text
landing cell is playable
+ no mover singleton at that cell
+ WSL terminal reduction only from singleton {cell}
    ->
ownTransition(ownClass, landingCell)
cannot return RESIDUAL_TERMINAL_WIN
```

Current execution nevertheless calls the general terminal-capable `ownTransition`, which:
1. tests the singleton terminal fast path;
2. retains `target === terminal` inside the active reduction loop.

The scoped ordinary-worker edge does not need that capability.

### Correct ownership

Do **not** weaken public/general `ResidualPool.ownTransition`.

Instead, if the experiment is worth code, use a worker-scoped nonterminal mover cofactor or another exact specialization whose admission is explicitly the native frontier precondition.

### Issue ownership

Mapped into **#100** rather than filing a duplicate.

### Qualification burden

- reachable-state counterexample search;
- isolated cofactor differential;
- terminal/first-win controls;
- reflection/play/undo;
- exact WDL/actions/nodes;
- generated optimized code and allocation sites;
- paired serial/worker timings;
- reject if V8 already removes the branches or specialization hurts inlining/code size.

## 5. Strong manager reconstruction lead

### F-006 — derive child manager q from the already-live parent state

Current manager expansion:

```text
expand(node):
    createState(node.moves)             # replay parent

for each child:
    build([...node.moves, column]):
        createState(childMoves)         # replay entire child again
        derive q
        lookup/create node
```

Exact compositional replacement:

```text
replay parent once

for each legal child:
    applyUnchecked(column)
    derive/lookup exact child q
    retain legal move path for worker transport
    undo()
```

This does not change the worker portability contract.

It removes manager-local reconstruction that is semantically unnecessary.

### Issue ownership

Mapped into closed **#85** as a narrower new experiment, not a new arena architecture and not an automatic reopen.

### Measurement gate

Prior #85 evidence found manager work measurable but not dominant. Before source mutation:
- count child-history moves replayed by manager;
- attribute CPU to child reconstruction/residual transitions;
- estimate removable fraction;
- compare one-parent replay plus sibling apply/undo;
- require end-to-end benefit.

## 6. Workload-distribution common cause

### F-001 — semantic q visibility delay

The multicore mismatch can be stated precisely:

```text
semantic:
    one canonical ranked q_r dependency DAG

execution:
    manager-visible canonical q_r DAG
    + private worker TT/subtree materializations
```

Define:

```text
q visibility delay =
    first private creation/completion of q
    ->
    first globally visible manager/publication point for q
```

Cross-worker duplicate work can accumulate only during that interval and only when the hidden q participates in overlapping root-relevant dependency occurrences.

This explains why:
- raw duplicate-q counts are not saved-node counts;
- snapshot observation lag is not exact completion latency;
- a globally shared recursive TT is not automatically the right answer.

### Existing candidate consolidation

- **#78** — portable exact publication/reuse;
- **#89** — rank-cut q exposure;
- **#90** — dependency-leverage priority;
- **#91** — structural affinity;
- **#94** — structural-pressure exposure/quantum policy;
- **#95** — deterministic dependency-chain collapse;
- **#93** — demand-triggered local supply front;
- **#92** — optional support-fiber relation layered on visible demand, not the common cause.

No scheduler is selected by discovery.

## 7. Deterministic-chain strengthening

### F-007 — define decision-frontier macro edges by exact outdegree 1

The deeper topology behind #95 is:

```text
ordinary legal-action outdegree == 1
    ->
one value dependency
```

Native forced defense is only one way to establish this.

Other cases include late states with exactly one legal column.

Therefore #95 should be interpreted as bounded **outdegree-one q dependency-chain collapse**, not only threat-forced-chain collapse.

This is now recorded on #95.

## 8. Measurement-gated runtime leads

### F-004 — full `process.memoryUsage()` on every successful worker result

Current worker completion executes:

```js
isolateMemory: process.memoryUsage()
```

before posting the result.

Current Node 26 documentation says `process.memoryUsage()` iterates over each page to gather memory information and may be slow depending on allocation state. `process.memoryUsage.rss()` is explicitly documented as faster for RSS-only queries.

Reference:
https://nodejs.org/api/process.html#processmemoryusage

Why this is currently hidden in metrics:

```text
executionMs
    measures solver.runTask(...)

then
    process.memoryUsage()
    result construction
    postMessage transport
```

So worker `executionMs` excludes the full result-side service cost.

This is a measurement lead first:
- directly time the call;
- measure task rate and aggregate cost;
- determine diagnostic/public-contract ownership;
- do not weaken exact resource-reporting semantics silently.

No issue filed yet.

### F-005 — native forced-cell provenance

Native forced cell is derived from exactly one bit in:

```text
opponent singleton mask
AND
maintained playable mask
```

so it is already a valid playable landing cell.

The solver later routes it through the same `columnForForcedCell()` validator used by external/certificate forced consequences.

A native-only worker path could preserve provenance and avoid proof-facing validation while keeping certificate validation unchanged.

This is exact but lower priority because #86 found broader validation fast paths economically weak.

No new issue filed; map conceptually to #86/#87 if frequency evidence warrants another experiment.

## 9. Existing representation/runtime candidates retained as candidates

The fresh pass did not invalidate:

- #96 — signed 32-bit full hash-mix chain;
- #97 — support-first q_r canonicalization;
- #98 — terminal-before-q / first-win dead-state suppression;
- #99 — residual-word reuse in move ordering;
- #100 — dense class-load/cofactor fusion, now strengthened with F-002;
- #101 — WDL-specialized exact cache without narrowing generic q payload ownership.

None is promoted by this report.

## 10. Durable negative results / stop decisions

### 10.1 Do not remove runtime fields just because q omits them

`sideToMove` is derivable from ply parity, and other runtime fields are also derivable in principle, but they have independent hot/public consumers.

Issue #64 already established the correct rule: semantic derivability alone is not storage-removal evidence.

### 10.2 Do not unify own/block residual kernels

They share a residual vocabulary but have different transforms and economics.

The earlier branchy/lazy mover lost on the real workload.

### 10.3 Do not reopen broad manager-arena work first

#85 measured manager CPU/GC and rejected the tested epoch rewrite.

Try the narrower reconstruction removal F-006 only if its direct census is material.

### 10.4 Do not infer worker-state-reuse value from allocation count

Per-task state object/typed-array reuse is possible in principle, but #84 found replay only a small fraction of aggregate task time. No isolated allocation bottleneck currently justifies the lifecycle complexity.

### 10.5 Do not optimize the executor clone based only on duplicate-looking objects

The explicit `structuredClone` before `postMessage` is structurally redundant for the current fresh IsoMax message shape, but the executor is shared and manager-side overhead has not been established as the critical bottleneck.

F-003 is stopped pending direct transport evidence.

### 10.6 Do not transfer proof through q

Equal q_o/q_r does not transport deadlines, response resources, realizability, CPC/NDC premises, guard state, provenance or dependency cones unless those are independently q-derived.

### 10.7 Do not infer absent hardware counters as zero

QU-HOT-02 remains unresolved for branch misses, cache misses and retired instructions.

## 11. QU after the pass

### QU-HOT-01 — V8 lowering

Known:
- pinned Node/V8/CPU evidence;
- generated-code summaries;
- selected allocation and call observations.

Open:
- version/tier stability;
- hidden allocation/deopt behavior;
- dynamic static-site frequency;
- whether F-002/F-005 branches are already optimized away;
- specialization/inlining/code-size effects.

### QU-HOT-02 — dynamic machine cost

Known:
- CPU profiles;
- sampled allocation;
- wall time.

Open:
- branch misses;
- cache misses;
- retired instructions.

### QU-HOT-03 — workload distribution

Known:
- manager q dedup;
- private worker TTs;
- real cross-worker portable-q overlap;
- aggregate parallel work far above serial;
- busy-task retirement helps.

Open:
- avoidable work per hidden duplicate;
- publication boundary;
- affinity/priority/frontier economics.

### QU-HOT-03A — q visibility delay

Open:
- private q completion -> global visibility latency;
- root-relevant duplicate work accrued in that interval;
- hidden q fan-in/leverage;
- optimum rank/exposure boundary.

### QU-HOT-03B — task service-time decomposition

Open:
- full memory-census cost;
- result serialization;
- postMessage transport;
- queue/dispatch turnaround.

### QU-HOT-03C — manager reconstruction cost

Open:
- child replay moves/time;
- removable manager residual-transition work;
- F-006 end-to-end economics.

## 12. NEI disposition

NEI 0.4 remains correctly placed.

No new hot-loop NEI result was necessary.

The only current identity result consumed from the game-theory owner remains the qualified q_o future-behavior identity under its exact question.

Most optimization relations in this campaign are:
- exact scoped equivalence;
- exact implication;
- exact reconstruction equivalence;
- representation substitution;
- occurrence/value correspondence.

No Bayes factor was manufactured.

## 13. Issue actions taken

Updated existing conceptual owners:

- **#78** — q visibility delay synthesis;
- **#85** — manager child replay elimination;
- **#95** — outdegree-one macro-edge generalization;
- **#100** — frontier-qualified nonterminal mover cofactor.

No new issue was filed.

F-004 and F-005 remain below the new-issue threshold pending direct measurement.

## 14. Implementation work that should happen next

Keep causal experiments isolated.

### First isolated worker-kernel experiment

Use **#100 / F-002**:

```text
qualified frontier precondition
    -> nonterminal mover-cofactor specialization
```

This is the cleanest new discovery because:
- the semantic precondition is exact;
- it applies inside the high-frequency transition kernel;
- it removes generality rather than adding machinery;
- it is independently falsifiable by generated code and end-to-end timing.

Do not stack it with #96/#97/#99/#100-A in the same first measurement.

### In parallel, measurement-only distribution work

Add bounded observation for:
- QU-HOT-03A q visibility delay;
- QU-HOT-03B task result-side service time;
- QU-HOT-03C manager child replay cost.

Avoid the expensive full portable-q census already shown unsuitable for production.

### Then choose from existing representation candidates by measured cost

The current high-value representation set remains #96-#101. Use the machine evidence to decide which isolated candidate to execute next rather than ordering them by source-code elegance.

### Scheduler work only after visibility economics

Do not select #89-#95 from structural appeal alone.

First quantify when important q becomes globally visible and how much duplicate root-relevant work accumulates before that point.

## 15. Checkpoints

- `checkpoints/DP-01-09.md`
- `checkpoints/DP-10-18.md`
- `checkpoints/DP-19-27.md`
- `checkpoints/DP-28-36.md`
- `checkpoints/DP-37-45.md`

These are incremental durable records. This report is the synthesis, not a replacement for their detailed falsifiers and route-level findings.

## Final disposition

```text
DP-01..DP-45 executed                 COMPLETE
semantic defect found                 NO
q_o/q_r distinction preserved         YES
proof/value boundary preserved        YES
NEI overreach introduced              NO
QU flattened                          NO
new duplicate issue noise             NO
existing issue consolidation          YES
solver mutation                       NO
durable checkpoints                   YES
new exact worker-kernel lead          F-002
new exact manager reconstruction lead F-006
scheduler common cause                F-001
new QU refinements                    03A / 03B / 03C
```

**Campaign result: SUCCESSFUL DISCOVERY PASS.**
