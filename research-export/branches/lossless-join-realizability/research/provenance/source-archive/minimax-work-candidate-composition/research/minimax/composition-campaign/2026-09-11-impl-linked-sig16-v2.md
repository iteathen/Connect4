# Exact-distance IMPL V2 — linked recent frontier + conservative sig16 prefilter

**Date:** 2026-09-11  
**Status:** qualified exact/proof-equivalent to V1 at matching capacity/order; runtime improved in important regimes but remains negative.

## Scope

V2 was built only after the typed+A123 V1 experiment established that parent IMPL remains strongly proof-positive but the JS object/linear-maintenance form is runtime-negative.

Qualified form:

`IMPL-RID-EXACTDIST-LINKED-SIG16-V2`

Files:

- `research/minimax/semantic-residual-mq5/residual_solver_wsl625_typed_a123.mjs`
- `research/minimax/semantic-residual-mq5/run_wsl625_typed_a123_impl_v2.mjs`
- `.github/workflows/minimax-mq5-typed-a123-impl-v2.yml`

Implementation commit:

`b8690c7ecef0df027ce3f20e7405b5d0ecf190df`

Workflow run `34620849916`, job `103334150176`, conclusion **success**.

## Semantic authority

V2 changes representation/filtering only:

- same exact physical gravity support scope;
- same lower-bound upward / upper-bound downward transfer direction;
- null-window results are never reinterpreted as exact;
- conservative signatures may reject candidates only;
- exact RID upward-closure containment remains the final transfer authority;
- same bounded recent-frontier capacity and recency semantics as V1.

The qualifier asserts that V2 reproduces the **exact V1 node count** for every matching capacity/order form. All assertions passed:

### Loss anchor `663152175 -> -4`

- C32 IMPL→A123: **364,377** nodes
- C32 A123→IMPL: **364,320** nodes
- C4 A123→IMPL: **419,408** nodes

### Win anchor `41267575 -> +3`

- C32 IMPL→A123: **1,950,573** nodes
- C32 A123→IMPL: **1,950,939** nodes
- C4 A123→IMPL: **2,228,281** nodes

Thus V2 timing evidence is not confounded by proof-tree drift.

## Mechanical changes

Compared with V1:

1. exact-state strengthening/refresh uses numeric state-ID maps rather than a linear scan;
2. per-support lower/upper frontiers use linked recent lists with O(1) move-to-tail and FIFO eviction;
3. a conservative dual-8-bit projection (16 bits total) rejects some impossible entry/query pairs before the existing full signature + exact RID test;
4. all surviving candidates still pass through exact semantic relation authority.

## Loss anchor

Typed+A123 control: **557,605 nodes**.

First-run screen:

| form | nodes | slot visits | sig16 rejects | candidates after sig16 | exact closure checks | wall ratio vs control |
|---|---:|---:|---:|---:|---:|---:|
| C32 IMPL→A123 | 364,377 | 2,095,727 | 84,641 | 2,011,086 | 1,802,556 | 1.279x |
| C32 A123→IMPL | 364,320 | 2,081,650 | 79,874 | 2,001,776 | 1,794,360 | 1.351x |
| C4 A123→IMPL | 419,408 | 787,216 | 48,714 | 738,502 | 685,026 | 1.190x |

C32 IMPL→A123 frontier mechanics:

- stores: 153,399
- exact-state hits/updates: 17,510
- evictions: 16,395
- live frontier entries: 119,494
- support buckets: 27,001

Repeated rotating timing, first two warmups excluded:

- control median: **1,399.033 ms**
- C32 IMPL→A123: **2,050.251 ms** — **1.465x slower**
- C32 A123→IMPL: **2,120.038 ms** — **1.515x slower**

V1 had repeated C32 A123→IMPL at about 1.532x slower than its same-run control. V2 therefore gives a small but real same-order relative efficiency improvement on the loss anchor, while retaining the identical proof tree.

## Win anchor

Typed+A123 control: **3,161,623 nodes**.

First-run screen:

| form | nodes | slot visits | sig16 rejects | candidates after sig16 | exact closure checks | wall ratio vs control |
|---|---:|---:|---:|---:|---:|---:|
| C32 IMPL→A123 | 1,950,573 | 13,305,570 | 1,393,299 | 11,912,271 | 10,487,897 | 1.575x |
| C32 A123→IMPL | 1,950,939 | 13,041,802 | 1,344,700 | 11,697,102 | 10,313,682 | 1.508x |
| C4 A123→IMPL | 2,228,281 | 4,698,905 | 544,905 | 4,154,000 | 3,795,644 | 1.273x |

C32 IMPL→A123 frontier mechanics:

- stores: 748,961
- exact-state hits/updates: 57,948
- evictions: 88,688
- live frontier entries: 602,325
- support buckets: 80,263

Repeated rotating timing:

- control median: **8,391.867 ms**
- C32 IMPL→A123: **12,184.873 ms** — **1.452x slower**
- C32 A123→IMPL: **12,664.551 ms** — **1.509x slower**

The matching V1 C32 IMPL→A123 repeated result was 14,601.738 ms against a 9,181.486 ms control, or about **1.590x slower**. On a same-form relative-to-control basis V2 improves the slowdown factor from 1.590x to 1.452x, about a **9.5% relative efficiency improvement**, while reproducing the exact V1 proof tree.

## Cost diagnosis

V2 confirms that V1 maintenance cost was material, but it is not the whole problem.

On the win C32 IMPL→A123 form:

- V1 candidate visits: 13.31M;
- V2 still visits all **13.31M frontier slots**;
- sig16 rejects only **1.39M** (~10.5%) before deeper candidate work;
- **11.91M** candidates survive the sig16 filter;
- **10.49M** exact RID closure checks remain.

The frontier itself is valuable: shrinking capacity to 1 or 2 remained runtime-negative while discarding a large fraction of the 34.7–38.3% C32 proof reduction. The next form should therefore retain a large proof frontier but avoid visiting most irrelevant entries.

## Interpretation

V2 is a qualified positive implementation step, not the final IMPL form:

- exact semantics preserved;
- exact V1 proof trees reproduced;
- O(1) exact-state maintenance removes a major source of avoidable work;
- repeated win-anchor efficiency improves materially;
- full typed+A123+IMPL is still slower than typed+A123 alone.

The next implementation seam is **support-local bulk candidate indexing/compaction**. A capacity-32 frontier is naturally representable as a 32-bit candidate mask, allowing conservative signature/resource filters to eliminate groups of entries before per-entry exact RID work while retaining the exact transfer authority and, where desired, the V1 recency order.

Do not interpret the remaining wall-time deficit as saturation of IMPL. V2 still carries the same ~34.7–38.3% marginal proof reduction as V1; the unresolved problem is candidate enumeration cost.
