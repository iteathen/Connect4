# JSMinSys helper review for native RBA

Reviewed 2026-09-23 against Connect4 `5f908057933f896f6b43455cb65566f72ea6338e`
and JSMinSys `64ba37a11522b533a1de87942a14921fe690ef86` (also live main).
This is implementation evidence, not a new semantic or cost authority.

## Coverage and decision rule

Read SPEC.md, all ten implementation modules exported by src/index.mjs,
the function catalog's preconditions, operation/data admission, block/basis
catalogs, cycle-accounting caveats, and the research identified below. The
export/catalog comparison finds **237 functions, 237 catalog entries, zero
missing functions**. The companion inventory accounts for each function by
name and source. This is not a claim to have read every research document in
every repository or to have qualified every helper on RBA.

Select a helper only after establishing its representation, ownership, ordering,
range and publication preconditions. Account for preparation and argument
acquisition, not just the helper body. JSMinSys also admits direct numeric
loads/stores/control; wrapping every operator in a function is not its contract.
Conversely, availability must be checked before writing a recurring block.

## Mapping to the current solve

| Surface | Functions reviewed | Application decision |
|---|---:|---|
| word32 | 15 | First-set-bit is used. Bit operations/subset/cardinality are usable compositions. Sparse versus SWAR counting requires actual density evidence. Isolated-bit indexing is cheaper only when the bit is already independently owned. |
| word64x32 | 29 | Logical/subset/popcount mechanisms apply to fixed lanes. RBA coordinates are three words per player, so two-word helpers do not cover an entire q. Do not introduce wide-integer carries/shifts for lane-local sets. High10 tables concern 42-bit masks, not arbitrary local coordinate lanes. |
| indexed32 | 32 | Packed height/landing derivation fits support. Action-major lookup is a candidate for repeated fixed-action shape deletion. Physical landing arrays and coordinate tables must not recreate a board. Two/three-word exact probes cannot replace eight-word q equality. Prefix projection is invalid for support-local singleton positions without a new proof. |
| state32 | 69 | Parity/rank extraction fits. Apply/undo families maintain playable masks/landing arrays that native RBA does not need; adding them would duplicate support. Caller-carried residual-frame restoration assumes local class IDs, absent here. Center omission saves no current q word and would add height reconstruction. Incremental reflected support remains a candidate if carried at lower whole cost. |
| mix32 | 27 | mix32 and primary-first canonicalization are used. **Missed applicable helper:** reflectPacked3Columns6To7 replaces our seven-iteration support reflection after masking rank. Delta tuple hashes need sparse changed coordinates; cofactors and basis transport may change many. Two/three/ten-tuple profiles do not match the eight-word q. |
| frontier32 | 14 | Minimal/maximal normalizers require cardinality order and one/two lanes; lazy variants additionally require nonempty input. Current streaming, unsorted paired RBA fronts can invalidate previous generators and use six words. Direct substitution is wrong; ordered batch normalization requires separately measured sorting/materialization and exact polarity transport. |
| search32 | 30 | Grouped immutable-word reuse is applicable to ascending local-index scans and is a candidate to benchmark. Fixed selectors apply if genuine scores already exist; inventing score arrays to call them adds work. Window-aware alpha/beta triage requires search windows, not globally exact q intervals. Do not promote window cutoffs into shared exact values. |
| atomic32 | 7 | CAS claim and no-notify release already used. No-notify is valid because wake ownership is separate. Load-first claim is a contention-dependent candidate, not an unconditional upgrade. Exchange/add/sub remain usable where lifecycle actually needs them. |
| queue32 | 10 | All are sequence-based FIFO rings. Owned-side variants remove counter arbitration only under real sole ownership/serialization. They do not implement newest-frontier priority, arbitrary q removal, event coalescing or generation lifetime. Adding a ring under the existing TT lock would duplicate publication machinery; blocking inside that lock can deadlock. Retain the intrusive q queue using admitted indexed operations. |
| capacity32 | 4 | Allocation/sizing are cold. isPowerOfTwo32 requires positive validated input. rehashOverwrite32 is a lossy cache operation: it cannot discard live authoritative q/topology. No growth or enlarged capacity is justified by the current capacity failure. |

## Research that changes the selection

JSMinSys research rounds 045, 048, 049, 057, 082, 087, 095, 097, 098,
099 and 100 were read with their implementation/preconditions. In particular:

- 045 supplies the exact seven-column register reflection, constants 9/15.
- 049/057 remove reservation atomics only with an actual owned queue side.
- 082 demonstrates why signed sequence rollover is part of correctness.
- 087 relies on maintained window inequalities; RBA interval evidence is different.
- 095 deletes redundant heights only when support is independently available.
- 097 reuses immutable words already grouped by the producer's ordering.
- 099 requires singleton IDs to be exactly a proved bit prefix. Global IDs
  have that property; dense support-local coordinates do not inherit it.
- 100 explicitly says application coordination/memo coverage is not solved
  by manufacturing another arithmetic helper. Historical percentage wins
  cannot be added together or transferred unmeasured to this implementation.

Connect4 research read at `cbcabb74adb945dcd9ab71ae8ab9cb17b79e4eff`:

- `research/isograph/optimization/ISOMAX_DECENTRALIZED_PULL_102_RESULT_0_1.md`
  and its `INTERPRETATION_CORRECTION`: retained local continuation must not
  become mandatory manager round-trip/replay at every branch. Our q continuation
  must remain direct and use the same shared identity; queue changes add no replay.
- Policy-frontier `RBA_BELLMAN_UNKNOWN_SHELL_CHECKPOINT_0_1.md`: value-specific
  refinement differs from preserving every transition observation. It does not
  prove that partial intervals are unnecessary in our bounded four-front profile.
- `RBA_CORE_RELATIVE_ABSORPTION_CHECKPOINT_0_1.md`: proved real row/column
  absorbers can eliminate product work before local skyline construction. This
  is a structural algebra candidate, not permission to discard correlations.
- `RBA_STATIC_DOMINANCE_TREE_PLANNER_CHECKPOINT_0_1.md`: global normalization
  is only one phase; greedy factor order and output width alone mispredict cost.
- `RBA_RANK26_DESCENT_LOCAL_PROJECTION_WALL_0_1.md`: repeated hard local
  projection remains after the qualified reductions. Do not assume those
  research constructions already solve empty 7x6 or import their larger limits.

## Architectural reassessment before further implementation

Owner correction: judging helper compatibility only against an already-chosen
implementation reverses the design process. The decisions above describe the
**current** representation, not reasons that representation must survive.
The following omissions prevent an optimization-completeness claim:

1. `rba/kernel.mjs:31` rebuilds a support/horizon-dependent boundary on every q
   evaluation. The constructor does not consume the queried P0/P1 coordinates.
   Different q values at equal support/horizon therefore repeat algebra under
   this implementation. Only queried scalar intervals survive publication.
   Before adding caches, compare retaining/composing native front artifacts
   against direct query-specific cofactor work. The four-front block research
   already establishes the semantic interface; bounded ownership/reuse economics
   have not been implemented or qualified here. A cache is not automatically
   the cheapest realization, and a second q authority is not permitted.
2. `rba/front.mjs:150` builds the local poset before the horizon-zero return at
   line 157. That leaf needs constant unknown fronts and validity metadata, not
   its own principal-upset table. Deleting unused work is prior to optimizing
   the table loop. This is an identified candidate, not yet a measured repair.
3. `rba/coordinate.mjs:61` scans each occupied local coordinate and then every
   child basis element. The prepared global shape transition is already indexed,
   but the principal-image application remains repeated. Compare prepared
   support/action maps, grouped word reuse and direct active-bit traversal at the
   complete transition/solve boundary, including preparation, storage and reuse.
4. `execution/shared-tt.mjs:97` writes up to 69 derived basis IDs per new q even
   though support determines the basis. This removed rescans but did not prove
   optimal ownership. Shared derived immutable support data could reduce writes;
   it would need an explicit bounded lifetime/cost proof, not another semantic
   identity system. Current publication writes are real, even without a memcpy API.
5. `execution/worker.mjs:110` wakes after every published q result/branch.
   Keeping the first child avoids a queue claim but not all synchronization.
   Test whole-operation publication/reconciliation granularity and lazy wakeup
   against the retained-continuation research before claiming efficient workers.
6. FIFO frontier growth is reproduced, but that does not prove LIFO is the best
   complete solver. Fixing the capacity symptom alone cannot establish that the
   algebra/TT/execution partition has appropriate cost.

Source line references above name the reviewed Connect4 revision. Read again:
policy-frontier `RBA_NATIVE_SEMIRING_CHECKPOINT_0_1.md` and
`RBA_FOUR_FRONT_BLOCK_CHECKPOINT_0_1.md`. They establish local absorption,
support-local computation and composed four-front information as load-bearing;
they do not establish this per-q rebuild implementation as optimal. The latter
document's informal 'nesting' wording is interpreted with the later reviewed
diamond relations, not a false total chain.

No production solver change follows from this review alone. First compare the
complete execution alternatives and their semantic/ownership obligations; then
implement the selected qualified unit. The failed benchmark remains the governing
negative evidence. Reading all 237 helpers now does not retroactively justify
design decisions made without that review.

## Previously queued candidates (paused for architectural reassessment)

1. Causal q scheduling control: current FIFO returns from a completed deep child
   to old shallow siblings. A depth-10 binary dependency tree exhausts 32 q rows.
   Test newest-frontier selection with the same TT and O(1) unlink; retain the
   first child directly, enqueue remaining children in reverse advisory order.
   No new queue, private DFS, identity system, or capacity increase.
2. Independently replace support reflection with the existing library helper;
   test every valid support and rank/flag transport, benchmark both the primitive
   and complete operation. Do not attribute scheduling changes to this helper.
3. Then evaluate grouped immutable coordinate-word loads and action-major shape
   deletion using whole cofactor/front/solver measurements. Neither is yet a win.
4. Retained/recomposed four-front artifacts remain missing. Scalar action/q
   intervals are now retained, but that does not claim complete algebra reuse.

Measured total process CPU cycles and elapsed time remain separate from the
library's symbolic serial ledgers. A clean structural checker is not full
NEES/JMS-SEALED qualification or proof of emitted assembly quality.
