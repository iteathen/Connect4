# Rethink: sharing, placement, scheduling, and proof are separate decisions

Date: 2026-09-09. Status: research reassessment, not maintained implementation authority.

## Inputs and scope

Read remote state and preserved sources before mutation. Research input head was `990686a094acaddc0bc37d0995759ab138d63aa4`; main was `de47d43f4f4133a68973d0876a402531ef5735da`. Global AGENTS.md and local AGENT_LOCAL.md were read. No maintained source or other repository was changed. Prior failed prototypes remain intact.

Reviewed the selective-promotion coordinator, shared two-word kernel, interleave/pair/batch replay prototypes, original reclamation proposal, and prior reassessment evidence. External specifications were consulted as technical background only; no outside implementation was imported.

The preceding status summary was too strong in calling physical exclusivity a universal requirement and treating the isolation smoke as sufficient reason to build exclusive-domain formation. Those are different claims from what the measurements establish.

## New experiment: add the missing active-capacity and scheduling controls

`reference/research-prototypes/2026-09-09-rethink/isolation_fair_controls.mjs` retains the exact owned shared-TT kernel, verified against Git blob `965c3806c92a7add544dce4777d965b3e12376d6`. It uses the preserved real A1/B/A2 task states without changing negamax, move ordering, publication, or task windows. Descriptor views are established outside the timed task loop; each task keeps one fixed descriptor.

For base capacity S, compare:

- flatSmall: shared S, A1/B/A2;
- splitSameTotal: two S/2 domains, A1/B/A2;
- splitExtra: two S domains, A1/B/A2;
- flatLarge: shared 2S, A1/B/A2;
- groupedSmall: shared S, A1/A2/B;
- groupedLarge: shared 2S, A1/A2/B.

Each group has one fixed 2S backing arena. Active capacity is accounted separately. Arena clearing is benchmark isolation, outside timing, not a proposed game-time policy. Three rotated/reversed repetitions at S=256K, 512K, 1M produced 54 trials and 162 task results. One worker, Node v22.16.0, Linux x64, AMD EPYC 9V74; this is not target-Node or multicore qualification.

### Deterministic total nodes, all three tasks

| S | flatSmall S | splitSameTotal S | splitExtra 2S | flatLarge 2S | groupedSmall S |
| --- | ---: | ---: | ---: | ---: | ---: |
| 256K | 2,065,343 | 2,443,449 | 2,018,571 | 1,935,328 | 2,018,571 |
| 512K | 1,935,328 | 2,018,571 | 1,913,389 | 1,883,891 | 1,913,389 |
| 1M | 1,883,891 | 1,913,389 | 1,875,595 | 1,863,060 | 1,875,595 |

The isolation mechanism is real, but it is not uniquely valuable: groupedSmall exactly matches splitExtra's total nodes at every tested capacity with half the active entries. Splitting equal total active capacity searches more nodes than flat at all three sizes. Shared 2S also searches fewer nodes than split 2S in this fixture.

Some splits nevertheless have lower elapsed time because each task touches a smaller table. For example, at S=512K, flatSmall median is 415.62 ms versus 334.39 ms for splitSameTotal. This preserves the earlier locality observation rather than disproving partitioning. The identical flat-512K algorithm measured 376.48 ms as flatLarge in the previous capacity group, illustrating timing variation even within this run. These short three-repeat timings do not justify a universal winner or precise expected speedup.

Conclusion: require BOTH equal-active-capacity and equal-per-task-working-set controls, plus an ordering control. The operative question is time saved relative to the best feasible flat configuration, not relative to an oversized flat table or a deliberately interleaved trace.

### Qualification limits

Cold solveBits convergence returned +3 for A1, B, and A2. Every null-window result was checked against those full values; deterministic node counts and splitExtra/groupedSmall equality were asserted. These are same-kernel consistency checks, not an independent exactness oracle. The old batch smoke drops 20 unresolved tasks out of 50 and replays known task roots/windows. It does not include live frontier generation, cutoff changes, or whole-solve critical-path effects. Keep its conclusions restricted to retained-cache interference.

## Concrete root-entry precondition gap

The optimized negamax kernel assumes the side to move has no immediate winning move. Its guarded solveBits entry checks this; the inspected coarse solve wrapper enters pneg/prepare without that root check.

A new boundary witness is the legal sequence `121212`. P0 has three stones in column 1 and wins immediately on its next move; P1 has three in column 2 but does not move first. Canonical state is `(cLo,cHi,mLo,mHi,moves)=(7,0,903,0,6)`.

Observed with the unmodified kernel:

```json
{"seq":"121212","state":{"cLo":7,"cHi":0,"mLo":903,"mHi":0,"moves":6},"alpha":17,"beta":18,"immediateWinExpected":18,"guardedSolveBits":18,"guardedNodes":0,"unguardedNegamaxBound":17,"unguardedNodes":1}
```

The coarse prepare also uses the no-immediate-win upper cap `floor((41-moves)/2)`; without the entry check, it cannot establish the true value 18 at this root. This is a missing caller precondition, not evidence that the optimized kernel's internal no-immediate-win contract is inherently wrong. The preserved smoke executes the kernel entry witness; a complete worker-pool run was not performed for this vector. Do not present arbitrary-root prototype correctness as qualified. A correction belongs at solve/task admission, not as a new check at every recursive node.

## Reassessment by idea

### 1. Exactness and benchmark equivalence

The Node kernel computes a distance-sensitive score. The published Fhourstones benchmark reports outcome scores (loss/draw/win, with bound classes); its published empty-board node count is the same 1,479,113,766 used in our rough reference. Outcome proof and full distance-score convergence are not the same computational question. The exact reconstructed C snapshot remains the authority for its particular run and should be rechecked before a stronger comparison.

Keep the C measurement as rough context, not a node-efficiency or language-speed proof. Separate time to establish W/D/L from additional time to refine the exact score. Do not silently weaken the product's required answer. Likewise, agreement between two layouts of the same kernel does not independently validate numerical semantics.

### 2. Fixed-width arithmetic and one fixed shared arena

Retain these foundations. The existing evidence justifies two-word hot arithmetic, fixed backing storage, exact key validation, and avoiding per-node scheduler/cleanup work. It does not justify treating one Node version, one probe footprint, or one slab size as permanent machine-independent truths. Keep maintained JS/Node and product Device-JS ownership; no native escape path.

### 3. What is actually shared

Exact canonical board identity owns reuse. A task-root signature is not a per-entry canonical placement function when its subtree can refine that signature without changing descriptors. State identity, scheduling affiliation, and a proof usable by the cleaner must remain distinct even when represented by related bits.

Partitioning overlapping state sets is not automatically numerically incorrect with validated full keys. It can lose reuse. Exclusivity is a sufficient proof that no exact-state cross-domain reuse is sacrificed, not a universal safety requirement or proof of profitability. Conversely, compatibility of two projections is not proof their full descendant sets overlap.

### 4. Use full existing board facts before inventing deeper signature frontiers

For task roots A and B, normalize owners to absolute P0 and compare both native words:

`conflict = (P0_A XOR P0_B) AND mask_A AND mask_B`.

Any nonzero bit is a sufficient impossibility-of-common-descendant proof under the current exact, orientation-fixed board identity. No bottom-two-row limitation is needed for this coarse proof. A zero result is inconclusive. This is task-boundary algebra, not per-node routing.

Reflection-canonical keys would require revalidating this reasoning under the chosen symmetry equivalence. Raw left/right cell contradictions do not by themselves prove disjoint cache equivalence classes after symmetry reduction.

### 5. Scheduling locality before physical isolation

Test affinity among tasks that YBWC has already made eligible. Preserve eldest-child priority, useful alpha/beta information, and critical-path progress. Prefer compatible work when available; do not idle useful workers merely to manufacture perfect batches. Grouped replay is a control, not an online scheduler implementation.

Also inspect exact coarse-root duplicate requests. Coalescing identical eligible requests or reusing a sufficient completed bound can avoid dispatch/speculation without touching negamax. Different windows cannot blindly share an alleged exact result: carry lower/upper bounds and prove each request is answered. These remain hypotheses, not measured wins in this unit.

### 6. Capacity must follow marginal saved time, not historical node share

A task can have many nodes because it is expensive, poorly ordered, under-capacity, or duplicating another task. Those causes imply different remedies. Hindsight top-signature counts failed too; better prediction of the wrong objective is not a solution.

Assess the time saved by the next capacity increment against locality, lost sharing, migration/reset cost, and whether that task delays the answer. Prefer a small measured candidate set and stable placement when evidence is weak. Dynamic selection does not require remapping every pass. Whole-solve wall time and per-pass critical-path effects remain the objective.

### 7. Reconsider the meaning of 32K slabs

The earlier sweep used one active small region. It supports a small working-set hypothesis and an allocation-granule candidate; it does not prove that labeling a contiguous 512K region as sixteen 32K slabs changes that region's access locality. Granule, active span, probe footprint, and number of simultaneously active descriptors are separate variables.

The current instrumented TT uses 14 bytes/entry (two key words, byte payload, 32-bit control, byte owner), so 32K entries occupy 448 KiB, not 32 KiB. There is an untested compact-payload candidate: a 49-bit exact key leaves 17 high-word bits; a 7-bit score and 8 diagnostic bits fit in the same 32-bit word, potentially reducing the layout to 12 bytes/entry with its control word. Prove ranges and publication first; this is not a proposal to revive failed associativity or accept hash collisions. Diagnostic bit widths must not become accidental worker support limits.

### 8. Keep the chunk map, but do not build unnecessary duplicate production

Stable logical IDs and one coarse resolution remain useful. The current prototype resolves on the coordinator before queueing; worker-side resolution is a possible boundary choice, not a requirement for correctness. Already-resolved queued tasks must count as stale holders if placement changes.

With one coordinator owning allocations, prevent duplicate physical allocation of the same logical ID at admission where possible. Forwarding remains useful for deliberate remapping and draining old assignments; an elaborate deduplicator is not justified merely because a forwarding smoke works. Aliasing two logical IDs to one descriptor does not prove their logical state sets equivalent.

The 2^21-entry Int32 chunkMap also occupies 8 MiB. Report it separately from TT bytes. A preallocated sparse registry is an alternative to assess later, not an excuse for unbounded maps or lossy identity.

### 9. Cleanup proof and physical lifetime are different gates

A drained descriptor is physically safe to reassign; it is not thereby semantically impossible. A currently absent or cut-off family may reappear in a later null-window pass. A descriptor shared by several logical IDs cannot be reclaimed merely because one alias contradicts the current root. Its proof must cover all relevant aliases, resident-content provenance, admitted queued/running holders, and future search regions in scope.

No-copy splitting can retain broad-parent entries in the new child's physical half. Full-key lookup remains safe, but it does not establish that every retained entry satisfies the child's stronger facts. Do not silently promote a cache-placement label into a proof about all resident contents.

The fixed TT already bounds backing memory. Proof-only cleanup now needs to demonstrate better reuse/capacity availability, not claim to fix the old Map growth failure again. Actual game-root advancement may be a more valuable reclamation boundary than pass churn because an added stone is a genuinely new irreversible constraint. This remains compatible with persistent TT reuse and no per-node cleanup policy.

### 10. Shared publication is still an independent correctness gate

The current kernel uses ordinary key/payload fields bracketed by atomic control checks and a CAS writer acquisition. Correct answers on sample games do not prove absence of false/torn snapshots. ECMAScript's integer-cell no-tear guarantee is not a multi-field snapshot guarantee. A portable qualification needs the actual language-memory-model argument, version-wrap/lifetime bounds, collision-heavy writer/reader tests, and target runtime/architecture evidence. No false hit was demonstrated by this unit, and this note does not claim the protocol is definitely broken.

Preserve a clearly specified conservative reference protocol for differential qualification before optimizing publication. Do not import C/C++ memory-model assumptions into JS, and do not weaken exactness for throughput.

### 11. Parallelism, ordering, and problem formulation

Keep os.availableParallelism as an upper bound; per-task throughput alone does not choose the profitable active pool. More workers can increase duplicate search and delay useful bound communication. Two speculative lanes are a measured setting, not a universal topology rule. Do not conflate replay-batch speedup with complete alpha-beta speedup.

Move ordering is not absent: the inspected kernel already sorts moves by generated winning-position count with a center-prior tie break. Missing candidates include validated TT/cutoff replay hints and coarse previous-pass evidence. Do not mix them into the just-completed layout controls, but do not defer a separate ordering experiment indefinitely until an unproven allocator is 'finished'. Root symmetry reduction is another separate candidate; full per-node symmetry canonicalization needs both cost and cleanup-proof reassessment.

## Revised next seam

First repair and qualify root admission and exact/bound semantics in a separate research correction. Keep the flat shared TT as the control. Then compare unchanged-kernel complete solves using ordinary YBWC versus eligibility-preserving coarse affinity/coalescing, including unresolved work and dispatch/drain time. Only require exclusive domain formation if physical isolation subsequently beats the best feasible shared configuration at equal budget and pays for its own lost sharing and frontier cost.

No new automatic domain-frontier allocator, move-order change, concurrent-publication rewrite, or integrated cleaner was implemented in this unit.

## Evidence and reproduction

From repository root:

```sh
node reference/research-prototypes/2026-09-09-rethink/isolation_fair_controls.mjs 3 18,19,20
node reference/research-prototypes/2026-09-09-rethink/root_entry_precondition_smoke.mjs
node reference/research-prototypes/2026-09-09-rethink/restore_raw_evidence.mjs
```

The TSV contains every trial's unrounded wall/task times, node/hit/write counts, bounds, mode, order, and active capacity. The qualification JSON contains the original environment, task states, full-value runs, and assertions. All task writeBusy values were zero. Descriptor sizes and fixed arena sizes are defined by mode. `restore_raw_evidence.mjs` reconstructs the original 39,525-byte / 59-line stdout byte-for-byte and checks SHA-256 `5475278656c649d148efb36eb076cfaa46d29fa6687b112b3e9987b496f0d9`. This preserves exact raw evidence in small UTF-8 files rather than large base64 transport. Kernel source was copied locally through the connector and matched its Git blob before execution.

The root-entry smoke prints its exact observation as JSON. Older failed implementations were not changed or deleted. `main` is not an intended write target.

## Technical background consulted

- ECMAScript memory model, especially sections 29.7 and 29.11: https://tc39.es/ecma262/multipage/memory-model.html
- Node runtime parallelism API: https://nodejs.org/api/os.html#osavailableparallelism
- Published Fhourstones benchmark and output semantics: https://tromp.github.io/c4/fhour.html

These are background references, not outside contribution or implementation authority.
