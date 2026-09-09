# Connect4: reopening all 107 historical ideas as integration hypotheses

Date: 2026-09-09. Status: research, not maintained implementation or a new governing specification.

## Scope and evidence identity

The owner asked to assume that every previous integration, including the apparent successes, could be improved. This review therefore preserves observations but withdraws blanket design verdicts. An experiment can establish that a particular implementation beat a particular control; it cannot establish that its abstraction or integration is optimal.

Remote state read at the beginning: research head `babf1acd135b4a4b5123b573985b3db4c3f62eeb`; main `de47d43f4f4133a68973d0876a402531ef5735da`. The research head adds equal-active-capacity controls beyond the earlier `990686a` checkpoint. Maintained source is unchanged by this unit.

The executable reference used here is the owner-controlled `reference/research-prototypes/2026-09-08-exact-solver/twoword_solver_sharedtt.mjs`, verified byte-for-byte against Git blob `965c3806c92a7add544dce4777d965b3e12376d6`. No outside implementation was incorporated. External literature/specifications are research leads and language authority, not substituted project implementation authority.

Prior records consulted include the failed-idea reassessment, selective-promotion/locality/overlap reassessment, the preserved region-fixed and shared kernels, and the newer isolation-control source. Historical numbers below retain the qualification limits of those records.

Three distinctions govern the reopening:

* semantic correctness, physical lifetime safety, and cache profitability are different claims;
* state identity, task identity, proof obligation, cache placement, and cleanup applicability are different relations;
* a result is conditional on the key representation, entry layout, move ordering, search driver, worker schedule, active memory, and machine.

Exactness, permitted languages, repository ownership, and honest evidence remain requirements. Proposed alternatives below do not silently authorize maintained-source changes or hot-loop scheduler/cleanup machinery.

## What was executed in this unit

### 1. Exact residual key rather than a probabilistic short tag

For a 49-bit key `(lo, hi)`, `hi` has 17 bits. The existing mixer computes

```text
x = lo XOR imul(hi, 0x9e3779b1)
f = imul(x XOR (x >>> 16), 0x85ebca6b) mod 2^32
```

For fixed `hi`, XOR with a constant, XOR-shift by 16, and multiplication by an odd integer are all invertible over 32-bit words. Store

```text
residual32 = (hi << 15) OR (f >>> 17)
slot       = f AND tableMask
```

When the descriptor has at least 2^17 entries, the slot supplies the missing low 17 bits. The residual supplies all 17 high-key bits and all 15 remaining mixer bits. Thus `(slot low17, residual32)` reconstructs the full original 49-bit key exactly. This is not a fingerprint and does not depend on a low collision probability.

Using a fixed 17-bit implicit portion rather than the current table exponent keeps the encoding stable across supported lower-half shrink/grow operations. It deliberately retains redundant index bits in larger tables. The prototype rejects capacities below 128K. It does not establish that smaller tables cannot use another exact encoding.

The research change retains the original moves, bounds, hash-slot selection, store policy, counters, and seqlock-style publication. Only key representation/validation changes. Key identity does not prove that concurrent payload publication is safe; the original publication protocol remains research-grade.

Measured at 512K entries, one worker, Node 22.16.0, Xeon Platinum 8272CL sandbox:

| Position | Exact result | Nodes, both modes | Full-key median ms | Residual median ms |
| --- | ---: | ---: | ---: | ---: |
| 663152175 | -4 | 1,004,480 | 758.457 | 572.777 |
| 41267575 | +3 | 5,945,560 | 4,138.065 | 3,980.008 |

Three repetitions per mode per position used alternating order and clean TT payloads after warm-up. Node counts, validated hits, store attempts, and successful stores matched exactly across modes/repetitions. TT array storage fell from 14 to 10 bytes per entry: 7 MiB to 5 MiB at 512K entries, a 28.57% reduction. Timing is exploratory, especially the variable smaller-position result; these are not cross-machine or production speedup claims. This is an equal-entry, not equal-byte, comparison.

Qualification: 262,144 inverse checks covered every possible high word with two low-word samples; the algebra gives the general inverse argument. An independent cell-array exhaustive oracle checked 96 late-game instances (48 generated ply-36 boards and their mirrors). Those vectors do not independently certify the larger benchmark roots. A quiescent 512K -> 256K -> 128K -> 512K reuse sequence preserved full-key/compact score, node, and hit agreement.

A new limitation is important: moving resident compact entries so that their implicit local index bits change is not automatically a safe miss. It can change reconstructed identity. Arbitrary slab permutation/reuse needs invalidation or a proven transformation. Compression and relocation must be designed together.

Code: `exact_residual_key.mjs`, `exact_residual_bench.mjs`, `identity_lifecycle_checks.mjs` under `reference/research-prototypes/2026-09-09-rethink/`. Raw evidence: `evidence/2026-09-09-residual19-small.jsonl`, `evidence/2026-09-09-residual19-large.jsonl`, and `evidence/2026-09-09-identity-lifecycle.jsonl`.

### 2. Isolation versus grouping versus actual active capacity

The preserved A1/B/A2 roots were replayed with the unchanged full-key kernel. All three full converged values were +3; each [3,4) task bound was checked against that value. This is same-kernel consistency, not independent exactness certification.

| Layout/order | Active entries | Total nodes, deterministic |
| --- | ---: | ---: |
| Flat, A1/B/A2 | 512K | 1,935,328 |
| Split, two 256K regions | 512K | 2,018,571 |
| Split, two 512K regions | 1M | 1,913,389 |
| Flat, A1/B/A2 | 1M | 1,883,891 |
| Grouped A1/A2/B, shared | 512K | 1,913,389 |
| Grouped A1/A2/B, shared | 1M | 1,875,595 |

The smaller shared table, grouped in time, exactly reproduces the split-extra table's node count with half its active storage. Equal-total splitting increases nodes here. Timing overlaps and drifts across the two repetitions; it does not establish a reliable wall-time winner.

This preserves the genuine interference observation while withdrawing the stronger inference that physical separation is the best response. Temporal scheduling, entry density, capacity, and physical separation are alternative ways to affect retention. The replay has fixed task roots and windows; changing real YBWC order can change which tasks even exist. It is not yet a whole-solve scheduling result.

Code: `isolation_recheck.mjs`. Raw evidence: `evidence/2026-09-09-isolation-recheck.jsonl`.

### 3. Symmetry changes the domain-exclusivity proof

The legal roots `17` and `71` have opposite owners at the same bottom-left cell, so their raw descendant board sets are incompatible. They are also horizontal reflections. Their keys are respectively 4,398,046,511,106 and 8,796,093,022,209; reflection canonicalization makes them equal.

Therefore raw-cell ownership contradiction does not by itself prove disjoint *cache equivalence classes* after reflection is introduced. This does not invalidate the earlier raw-key smoke. It invalidates carrying that proof unchanged into a symmetry-reduced cache.

The first isolation log emitted the same two raw keys in reverse label order. `identity_lifecycle_checks.mjs` reparses the literal sequences and records the corrected mapping. The unordered equality property and all isolation timing/node evidence were unaffected; the original output is retained.

### Experimental disposition

An initial combined compact-key run hit the tool's 60-second timeout after 11 of 12 timed trials. Its partial log and timeout note are retained, not passed off as a completed run. The two separately completed position runs are the summarized evidence. No benchmark process remains running. The generated compact module is reproducible from the pinned baseline and the checked transformation script; its exact SHA-256 is recorded in the raw environment records and package manifest.

## Complete historical inventory reopened

The numbers below match the 107-item inventory in the conversation. Each row gives a new integration question and a falsifier; it is not a renewed good/bad vote. Unless referenced in the execution section above, the proposed test has not been performed in this unit.

### Representation and cache access: 1-16

| ID | Historical idea | Reopened integration and decisive comparison |
| ---: | --- | --- |
| 1 | BigInt state | Keep BigInt as a cold reference/diagnostic representation; separately assess Number-valued exact keys and paired-word kernels. Losing in recursion does not disqualify it from independent checks or infrequent atomic-wide publication experiments. Include conversion and allocation costs. |
| 2 | V8 Map TT | The unbounded all-node cache failed. A bounded coarse-task proof directory has a different cardinality and access rate. Compare it with a numeric open-addressed directory; do not recreate a per-node object store. |
| 3 | Two-word state | Reopen word split, arithmetic, key encoding, and dispatch together. A 32/17 split winning once does not rule out column-aligned splits or less redundant key storage. Preserve exact operation/state tests before timing. |
| 4 | Direct mapping | Its simplicity may be valuable, but the meaningful baseline is the best bytes-per-entry and reuse policy, not the original full-key slot. Compare compact direct mapping with alternative admission/replacement at equal active bytes. |
| 5 | keyLo -> keyHi -> payload | This order assumes two stored key words are necessary. The executed residual experiment challenges that premise while preserving exact identity. Recheck coherent publication separately from logical collision freedom. |
| 6 | Two-way association | Reopen only with a changed causal premise: denser exact identities or measured costly collisions. Compare equal bytes, cache footprint, and search policy, including the extra probe cost. A generic two-way revival is not justified. |
| 7 | Four-way direct | Explore four candidate entries only if they can be accessed cheaply enough and their retained bounds pay for the scan. Compare actual line traffic/instruction cost and full solve time, not hit rate alone. |
| 8 | Four-way/tagged | Distinguish probabilistic tag filters from complete identity factored across index and stored bits. A short prefilter can reject; it cannot authorize an exact bound unless remaining identity is validated. |
| 9 | 32K physical slabs | Reopen the unit in bytes, not entries alone. The full-key layout has 448 KiB of TT arrays per 32K entries; the compact layout has 320 KiB. Allocator granularity, task footprint, and hardware cache line are separate quantities. |
| 10 | One family per 32K chunk | The failure could mean insufficient capacity, stranded arena, excessive independence, or all three. Reserve one-slab descriptors for measured small-demand cases; cold families can alias. Compare against equally small flat controls. |
| 11 | Larger flat is always better | Replace the slogan with a whole-solve cost curve for a specified entry layout, ordering, and worker count. Fewer collisions can lose to higher access cost; the knee can shift after unrelated improvements. |
| 12 | Dynamic active capacity | Dynamic permission does not require continual adaptation. Compare a calibrated stable capacity, one coarse change, and an online selector with all profiling/remapping costs included. A controller must beat the best simple policy. |
| 13 | Worker-local TTs | Local-only lost, but private writes plus an immutable shared previous-pass table is a different design. Compare equal total bytes, second-probe cost, delayed reuse, and merge/publication cost at coarse boundaries. |
| 14 | One global shared TT | Global visibility need not mean one replacement pool or immediate multiwriter updates everywhere. Compare worker-group banks, global immutable knowledge, and selected shared writable regions without losing exact identity. |
| 15 | Seqlock-style publication | Score agreement is not a proof of every concurrent interleaving. Reopen ECMAScript ordering, version wrap, paused writers, resize, and coherent key/payload tuples. Compare atomic payloads or immutable ownership alternatives without claiming they are automatically cheaper. |
| 16 | False misses allowed, false hits forbidden | Retain exactness, but distinguish collision freedom, bound validity, publication coherence, and lifecycle safety. Recompute on a cache miss; never reinterpret a bound, relocated residual, or stale resource as valid merely because a score looks plausible. |

### Parallel execution and workers: 17-27

| ID | Historical idea | Reopened integration and decisive comparison |
| ---: | --- | --- |
| 17 | Independent worker scaling | Raw throughput is a machine-capacity control, not proof-search speedup. Measure root-bound progress, useful obligations completed, duplicate work, critical path, and completion after speculative tasks drain. |
| 18 | Naive root splitting | Static one-child-per-worker was the weak variant. Root-local batching, selective further splitting of the dominant child, or same-root proof diversification deserve separate tests. Keep the serial root as a control. |
| 19 | Lazy YBWC/Jamboree | Waiting for the first child trades less speculation for a serial bottleneck. Reopen waiting using cutoff likelihood and first-child cost, not a universal eldest-child rule; compare bounded speculative probes and deterministic controls. |
| 20 | Unlimited speculation | The history did not establish a universal experiment over every speculative width. The actual question is a bounded outstanding-work budget with explicit wasted work and publication traffic. Do not equate idle CPUs with profitable speculation. |
| 21 | Two lanes | Two beat three in one regime; it is not a law. Retest after ordering, entry density, task size, and worker count change. Report whole-solve time, not just worker utilization. |
| 22 | Shallow parallel shell | Fixed depth is a rough work proxy. Compare a bounded, cost-informed coarse frontier and iterative work exposure, with no scheduler policy inside the existing hot kernel. Count dispatcher CPU cost. |
| 23 | Fixed worker count | A fixed benchmark control is useful; a universal production count is not. Stable worker bands may outperform a noisy adaptive controller. Compare both rather than making dynamism mandatory. |
| 24 | availableParallelism gives desired count | It is an estimate, usable as an initialization/policy ceiling, not a guarantee of profitable capacity. Measure actual scaling and resource limits. Do not infer homogeneous cores from one integer. |
| 25 | Dynamic workers | Add a worker only when it helps the proof's critical path more than it adds contention, duplication, and startup cost. Coarse per-worker completions are useful; task difficulty confounds raw per-worker nodes/second. |
| 26 | Equal P/E/SMT lanes | Throughput depends on task mix, scheduling, and cache sharing, not merely core labels. Compare adaptive assignment with controlled heterogeneous-task observations; do not hard-code a topology model. |
| 27 | Work stealing | Stealing balances load but can destroy cache affinity. Compare affinity-first dispatch with a global escape path against unrestricted stealing. Avoid both rigid pinning and starvation. |

### Dependency identity and placement: 28-40

| ID | Historical idea | Reopened integration and decisive comparison |
| ---: | --- | --- |
| 28 | Bottom-row identity | It is one projection, not privileged truth about reuse. Compare cheap irreversible facts, ply, and measured overlap for scheduling/cleanup purposes. Do not require one projection to serve every purpose. |
| 29 | Two-row identity | More detail increases labels and can reduce useful sharing. Choose features by discriminatory value per cost; test how frequently candidate labels distinguish genuinely different cached states or proof obligations. |
| 30 | Dependency partitioning generally | Reopen spatial partitioning, temporal grouping, partial overlap, and no partition. The fixed-task control now shows grouping can obtain the same retained work with less active storage. Whole-solve effects remain open. |
| 31 | Dependency switches inside negamax | The failed policy machinery remains poor evidence for ordinary cheap address arithmetic. Separate static TT index calculation from logical discovery/allocation. Any new deterministic bank function needs its own hot-path cost and identity proof. |
| 32 | Per-node chunkMap lookup | Mutable logical placement is not the same thing as an ordinary numeric slab-address load. Keep mutable resolution outside recursion; compare contiguous addressing against a frozen descriptor's bank addressing only if noncontiguous storage has demonstrated value. |
| 33 | Resolve once at dispatch | This avoids redirects but does not require exactly one cache view. A task could receive a fixed writable region and a fixed read-only shared region. Measure the extra probe and stale-knowledge tradeoff. |
| 34 | One fixed descriptor per subtree | Keep lifetime stability, reopen what the descriptor contains. Immutable base/mask/view tuples or fixed bank sets may supply sharing without running tasks following allocator changes. |
| 35 | Switch to a more-specific running region | Instead of a silent switch, a separate frontier-generating kernel could return explicit proof continuations at coarse boundaries. This is a new algorithm with overhead; it must not masquerade as unchanged negamax. |
| 36 | Dependency tree owns physical layout | Logical topology can suggest placement without owning memory. Reopen whether a tree is even the right logical model; compatible conjunctions and shared descendants naturally create a DAG/lattice. |
| 37 | Separate topology and storage | Ownership separation is useful, but it need not create several permanent runtime tables. Compose the separation into small fixed numeric dispatch contracts; prove each indirection has a present beneficiary. |
| 38 | Stable logical IDs | Stability can be structural and session-scoped; it need not require a global monotonic namespace. Compare existing numeric signatures with compact encountered-node IDs and account for sparse-directory memory. |
| 39 | chunkMap indirection | Dedupe/relocation justify it; a permanently flat table may not. Compare a direct descriptor assignment with a map under actual remapping demand. Count metadata and initialization, not only task-time lookup. |
| 40 | Descriptor table | Keep resource ownership explicit, but separate hot fields from cold lifecycle/provenance. Representation and implicit-index requirements belong in its contract if keys depend on placement. |

### Resource sizing and selectors: 41-56

| ID | Historical idea | Reopened integration and decisive comparison |
| ---: | --- | --- |
| 41 | Fixed SAB arena | A fixed budget is not a requirement to touch every byte or allocate every subsystem at maximum. Include directory, descriptors, worker state, and scratch in the budget; count initialization and physical page activity separately. |
| 42 | Multi-slab capacity | Multi-slab regions may be contiguous extents or frozen lists; those have different addressing costs. Compare total active bytes and locality, while keeping logical family identity independent of the allocation choice. |
| 43 | Power-of-two sizes | They simplify masking and splitting, but coarse quantization can waste useful allocation choices. Compare nested equal-sized banks or a proved alternative index scheme before discarding cheap masks. Compact keys constrain this design. |
| 44 | Equal family capacity | Equal allocation is a control, not automatically a defect. It can be rational under uncertain marginal benefit. Compare it with uneven allocations using savings versus capacity, not just task-work fractions. |
| 45 | Capacity from dependency depth | Depth might correlate with remaining subtree complexity in some regimes. Use it only as a calibrated prior with failure cases, not as an ownership rule or a claimed dynamic allocator. |
| 46 | Capacity from coarse work | Large work does not imply high cache sensitivity: an expensive task may have little reusable structure. The target is avoided future recomputation per added byte, measured by controlled capacity/retention interventions. |
| 47 | Selective hot promotion | Promotion should compete against grouping, bank affinity, compression, and no change. Admit a child only when measured retention value offsets lost cross-family reuse and transition cost. |
| 48 | Promote hottest exact signatures | Hotness conflates demand, overlap, proof difficulty, and current cache misses. Reopen grouping by weighted reuse/eviction relationships rather than exact-signature rank. Obtain those relationships through bounded research traces, not permanent per-node policy. |
| 49 | Promote every nested child | Eager allocation can be reasonable only if occupancy, reuse, and cardinality justify it. Compare lazy descriptor creation and aliasing, with metadata cost and unused capacity reported. |
| 50 | One slab for each hot child | The existing negative tests disfavor this integration, not every tiny private tier. A small L1 plus broad shared knowledge is a distinct hypothesis; count double probes and write aggregation. |
| 51 | Parent fallback for cold children | Fallback preserves capacity but can become a pollution sink or an overlap bridge. Compare shared read-only fallback, a common writable pool, and temporal batching; define exactly which entries may reside there. |
| 52 | First-pass predictor | Early passes may represent a different proof threshold and task distribution. Use first-pass observations only with an explicit predictive claim; compare against static defaults and held-out whole-solve outcomes. |
| 53 | Previous-pass replanning | A tiny pass should not automatically redirect an arena. Reopen information-weighted decisions, including the decision to do nothing, and charge reconfiguration plus lost cache state. |
| 54 | Cumulative replanning | Cumulative work can preserve stale demand as readily as useful history. Track sufficient evidence for the current proof, not an indiscriminate lifetime sum; compare against stable placement. |
| 55 | Hysteresis | Hysteresis is not intrinsically an arbitrary patch. It can follow from a measured switching cost and uncertainty interval. Require predicted benefit to exceed both; do not tune unexplained thresholds to two positions. |
| 56 | Hindsight hot-signature oracle | It was an oracle for ranking work, not for optimal cache assignment. A bad hindsight result falsifies that objective, not every selector. Compare offline allocations optimized for measured end-to-end cost. |

### Overlap, exclusivity, and experimental controls: 57-68

| ID | Historical idea | Reopened integration and decisive comparison |
| ---: | --- | --- |
| 57 | Signatures are independent families | A label is not a descendant-state set. Write down the actual equivalence/overlap relation; parenthood, compatibility, and disjointness must not be inferred from unequal integers. |
| 58 | Ancestor/descendant separation is bad | It can lose useful reuse, but that is not a correctness failure with coherent exact keys. Partial separation may still win on contention/locality. Compare saved communication against recomputation rather than imposing an absolute ban. |
| 59 | Compatible sibling separation | Compatibility means overlap is possible, not that useful overlap is large. Quantify observed reuse and eviction cost before either merging or separating their cache allocations. |
| 60 | Ownership contradiction proves disjointness | It proves a raw-state fact under specified irreversible semantics. The executed reflection counterexample shows it is not automatically a proof about symmetry-canonical TT identity. Apply proofs in the actual cache equivalence space. |
| 61 | Isolate incompatible siblings | It removes one kind of destructive eviction but partitions capacity and may hurt balancing. Compare with equal-total flat, equal-working-set flat, and temporal grouping; none is a universal winner. |
| 62 | A1/B/A2 smoke | It isolates an interference mechanism in a constructed replay. It does not quantify whole-solve value, task-selection changes, or critical-path effects. Preserve it as a causal micro-control, not a product benchmark. |
| 63 | Separate B restores A2 | True in the preserved replay, but restoring one task need not minimize total work or time. The executed grouping control restores the same overall node count with half active storage. |
| 64 | Isolation value depends on capacity | The observed curve is conditional on entry bytes and task schedule. Compression, ordering, or a different query distribution can move it; model joint capacity/placement choices. |
| 65 | A 2M partition win validates classification | It does not distinguish classification from a smaller per-task footprint. The same mistake could recur after entry compression, changes in warm state, or different worker utilization. |
| 66 | flatQuarter control | Retain it and add equal-entry, equal-byte, equal-task-footprint, and equal-retention controls. One fairness definition cannot isolate every cause. Report both allocated and active memory. |
| 67 | Task-local working set as a resource | A descriptor's nominal span is not the same as actual accessed lines or simultaneously useful entries. Where possible, correlate bounded access/reuse samples with measured wall time. |
| 68 | Always use the whole arena | Unused storage can be a useful spare for safe handoff or an immutable shared tier. It is not necessarily waste, but its reserved and touched costs still count in the resource contract. |

### Domain formation and scheduling order: 69-78

| ID | Historical idea | Reopened integration and decisive comparison |
| ---: | --- | --- |
| 69 | Deepen until ownership resolves | Fixed-depth expansion was a poor path. A targeted discriminator frontier is different, but it must include unresolved/never-resolved cases and account for proof continuation cost, not just produce pretty partitions. |
| 70 | Scheduler-level exclusive formation | Do not make full exclusivity a prerequisite for progress. Compare affinity grouping of already-ready tasks against more expensive domain construction. Sometimes accepting overlap is cheaper. |
| 71 | Fine-grained frontier scheduler | Moving recursion into the scheduler is still recursion cost. A compact iterative frontier kernel is possible as a distinct algorithm, but must beat coarse dispatch with its complete queue, state, and continuation overhead. |
| 72 | Broad unresolved pool plus child pools | This recreates overlap but not automatically incorrect scores. A shared readable broad tier with selective child writes might integrate it profitably. Test it as deliberate hierarchical caching, not exclusive domains. |
| 73 | Exclusive sibling batches | Batch formation should follow both proof independence and cache benefit. Excessively large batches can postpone a cheap decisive task; cap waiting by observed critical-path cost, not family size alone. |
| 74 | Temporal grouping | The executed fixed-task control supports its retention mechanism. Real alpha-beta ordering is also a pruning policy, so test grouping only among eligible tasks first and count changed/cancelled work. |
| 75 | Shared interleaving | Interleaving can improve completion latency or load balance even when it increases collisions. Keep it as a serious candidate, not merely a straw-man baseline. |
| 76 | Grouped/phased sharing | A hard phase barrier may sacrifice multicore utilization. Compare affinity-first eligible-task dispatch without forcing every worker to finish a family before another can begin. |
| 77 | Split interleaving | Isolate only where profitable while allowing all workers to access a domain's region. Do not conflate worker ownership, logical membership, and writable physical location. |
| 78 | Multicore resolved-batch benchmark | It qualifies a replay mechanism, not the real search scheduler or formation cost. Remap results by original task ID; fail-soft bounds need not be numerically identical across schedules if their inequalities remain valid. |

### Splitting, forwarding, and cleanup: 79-94

| ID | Historical idea | Reopened integration and decisive comparison |
| ---: | --- | --- |
| 79 | Live parent splitting | Mutating storage still writable through an old mask is unsafe resource ownership. Alternatives include deferral or immutable old extents plus new future assignments from spare arena capacity; both consume resources. |
| 80 | Global quiescent repartition | Safe boundaries need not mean a full-system barrier. Per-descriptor coarse-task ownership can permit independent progress. Compare bookkeeping/waiting against simple pass drain; keep counts off the recursive path. |
| 81 | Preserve the lower half | Full keys make many displaced entries harmless misses. Compact implicit-index keys need a stronger layout proof. The executed fixed-17 encoding supports the tested lower-half shrink/grow, not arbitrary relocation. |
| 82 | Avoid split payload copying | No copy avoids bandwidth, but discarding expensive bounds may cost more recomputation. Reopen bounded bulk transfer of demonstrably useful entries at drained boundaries; include scan, transfer, and validation time. |
| 83 | Detect duplicate physical descriptors | Preventing duplicate allocation through one coarse ownership authority may be cheaper than discovering it afterward. First quantify actual duplicate incidence and the reason duplicates are allowed. |
| 84 | Forward through chunkMap | Forwarding is one future-binding mechanism, not necessarily a shared map operation visible to workers. A coordinator-owned direct descriptor dispatch may be sufficient; compare complete lifecycle complexity. |
| 85 | No redirect chains | Direct resolution is desirable on the task path. It does not require eliminating every coordinator-side union structure; bounded cold canonicalization and flattened dispatch can coexist if worthwhile. |
| 86 | Stale workers chase redirects | Mutable lifetime repair inside search remains undesirable. The alternative is versioned or immutable coarse leases, not checking placement after every node. Include the memory tied up by stale assignments. |
| 87 | Stale holders finish normally | This is simple but can hold large regions for a straggler. Prefer better initial task granularity or delayed promotion before adding cancellation. Explicit continuation kernels are a separate measured option. |
| 88 | RETIRING then FREE after drain | Drain is necessary but not always sufficient: queued tasks, future map aliases, crashed-worker disposition, and payload-format validity also matter. Define when a physical slot can legally be rebound. |
| 89 | Discard loser entries | This is legal for a pure cache, but perhaps expensive. Compare no merge with selected-bound or whole-region cold migration; no assumption that merging is either necessary or inherently wasteful. |
| 90 | Proof-only cleanup | Separate proof of inapplicability from proof of safe physical reuse. A logical family contradiction does not prove that a shared descriptor contains only that family's states. Keep owner policy explicit. |
| 91 | Reject heuristic cleanup | Evicting optional cached knowledge after safe quiescence need not harm exactness; it may violate the intended retention policy or hurt performance. Do not confuse a cache miss with reclaiming a live resource or deleting authoritative proof state. |
| 92 | Opposite-owner cleanup proof | Apply it to facts genuinely shared by every resident entry and the current live root. Aliases, broad fallback tasks, symmetry, and future-root reuse can invalidate a descriptor-label-only argument. |
| 93 | No per-node ages/refcounts/LRU | Reopen the need, not just the implementation. Existing bound/ply information, fixed partitioning, or offline diagnostics might replace metadata. A coarse lease count is not a per-node reference count. |
| 94 | Asynchronous cleanup | A cleaner is not free merely because it has no dedicated core: it consumes bandwidth and may evict cache lines. Compare opportunistic coarse cleanup against no cleaner under the same wall-time and memory budget. |

### Ordering, references, and the combined objective: 95-107

| ID | Historical idea | Reopened integration and decisive comparison |
| ---: | --- | --- |
| 95 | Shared best-move hints | Bound storage and move ordering interact with TT demand and speculative work. Test a small coarse hint directory first, then a separately measured payload design. A hint orders legal moves; it never authorizes a proof cutoff by itself. |
| 96 | Immediate wins | These are proof facts already handled in the solver's entry/tactical logic, not merely a sort preference. Reopen where checks occur and their contracts; compare specialized forced/terminal paths without redundant scans. |
| 97 | Forced defense | One forced move needs no full multi-move sorting. Test a distinct cheap forced path; preserve detection of multiple immediate threats and losing support moves. |
| 98 | Prior-pass cutoff replay | Cache the useful proof/move fact, not blindly the last task label. Validate position, score orientation, bound kind, and current legality; a previous cutoff can be a hint even when not a usable current bound. |
| 99 | Center prior | It is a fallback ordering bias, not a universal first move. Compare its marginal value after tactical and stored-move information. Mirror handling must transform stored move coordinates consistently. |
| 100 | Child cost/history | Cheap-first, likely-cutoff-first, and maximum-information-first optimize different proof obligations. Test expected decisive progress per cost, distinguishing a one-child cutoff from an all-child proof. |
| 101 | Never mix ordering and TT experiments | Isolate a variable for diagnosis, then deliberately test interactions in a small crossed experiment. Permanently postponing ordering risks optimizing a TT layout for an obsolete access pattern. |
| 102 | Fhourstones reference | Keep same-machine C timing as context, not Node implementation authority or a promised target. Separate root-score convention, book usage, strong score versus W/D/L, move order, and hardware/runtime effects. |
| 103 | Maximize nodes/second | It rewards doing more cheap unnecessary work. The primary target is complete exact-result wall time under a fixed resource budget, with node rate retained only as a diagnostic. |
| 104 | Minimize nodes | Fewer nodes can still be slower because each node costs more or the critical path grows. Report both with initialization, pass, scheduling, remapping, and drain costs. |
| 105 | More sharing always better | Reuse benefit must exceed synchronization, coherence, eviction, and widened working-set cost. Prefer shared knowledge where useful, not universal immediate shared writes by default. |
| 106 | More partitioning always better | Separation spends capacity and can lose reuse or balancing. Temporal affinity, denser exact entries, and a stable smaller flat table are serious alternatives. |
| 107 | Share overlap, isolate disjointness | Replace the binary synthesis with a cost model over useful bound reuse, destructive eviction, proof dependencies, and physical execution. Exclusivity is one useful feature, not the master architecture. |

## Integration candidates after the reopening

These are competing candidates, not components that must all be built.

**Candidate A: compact shared flat control.** Keep the cheap current search, exact residual identities where their size/layout contract applies, and a calibrated stable active span. This reduces entry footprint without first constructing dependency domains. Its benefit can disappear at another capacity or concurrency level; qualify those before promotion.

**Candidate B: affinity-guided coarse work with shared capacity.** Group only already-eligible proof tasks using coarse reuse signals; allow global fallback to avoid stragglers. Preserve shared access rather than requiring physical exclusivity. The replay control motivates this, but actual alpha-beta task order remains unqualified.

**Candidate C: immutable shared knowledge plus local/current writes.** At a drained boundary, publish an immutable table or selected bounds; tasks receive fixed views and a fixed writable cache. This trades hot synchronization for extra probes and delayed reuse. It is an alternative experiment, not a reason to add an L1/L2 system now.

**Candidate D: proof-driven controller.** Separate the question being proved from the board projection used for cache placement. A task root plus threshold/bound contract identifies a proof obligation; duplicate obligations may be joined at coarse dispatch. Do not merge tasks just because their boards match when their windows differ. Root-score interval progress, not expensive-family ranking, should drive resource experiments.

New options absent from the original inventory also need comparison: reflection canonicalization with transformed moves and quotient-aware proofs; two-sided bound retention; alternative null-window/aspiration/full-window drivers; selective exact endgame or tactical proof kernels. They can change the TT's access pattern more than allocator tuning. They must preserve Connect4 score semantics and the JS/public-Device-JS ownership boundary; none is implemented by this note.

A useful falsification order is: qualify the compact-key/layout contract and publication boundary; establish a stronger whole-solve baseline including bounded ordering experiments; compare affinity versus spatial partitioning at equal actual bytes; then select whether any dynamic allocator or cleaner remains worth its cost. This is a revised research priority, not a promise that any candidate will win.

## Research sources and reproduction

Primary external leads checked: ECMA-262 shared-memory model (coherence/order obligations); Node OS documentation (`availableParallelism` is an estimate); Pascal Pons' optimized Connect Four TT treatment (index plus stored information can provide exact identity). The particular invertible-mixer residual implementation above was independently derived from the pinned owner-controlled kernel. It is not claimed as the first use of exact key compression.

```text
https://tc39.es/ecma262/multipage/memory-model.html
https://nodejs.org/api/os.html#osavailableparallelism
https://blog.gamesolver.org/solving-connect-four/11-optimized-transposition-table/
```

Run from repository root:

```sh
node reference/research-prototypes/2026-09-09-rethink/exact_residual_bench.mjs 19 3 663152175
node reference/research-prototypes/2026-09-09-rethink/exact_residual_bench.mjs 19 3 41267575
node reference/research-prototypes/2026-09-09-rethink/isolation_recheck.mjs 19 2
node reference/research-prototypes/2026-09-09-rethink/identity_lifecycle_checks.mjs
```

No blanket optimum, maintained solver upgrade, full empty-board completion, multicore speedup, or general concurrent-publication proof is claimed. The 107 rows reopen the complete inventory; only the explicitly reported experiments were executed.
