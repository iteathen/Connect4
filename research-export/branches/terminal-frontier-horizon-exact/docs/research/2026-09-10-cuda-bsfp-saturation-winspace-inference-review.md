# CUDA-BSFP GPU saturation, parallel-work quality, and winspace inference review

**Date:** 2026-09-10  
**Branch:** `feature/cuda-bsfp`  
**Starting head:** `c37b20cd6d7a64d37237855f1850d1d0e1648499`  
**Status:** research/code-review checkpoint; no solver-semantic change is authorized by this note alone.

## New physical observation

During the bounded native CUDA-BSFP scaling test the owner observed the GPU remaining approximately **95–100% utilized** during the expensive interval.

Treat this as a useful physical signal, not as proof that the existing kernel is efficient. High device utilization rules against a simple explanation in which the GPU spends most of the slow interval waiting for Node or launch submission. It is fully compatible with the GPU being saturated by low-value repeated work, divergent serial loops, duplicate handling, or an algebra that creates far more candidates than necessary.

The current working diagnosis therefore has two independent axes:

1. **algorithmic volume:** reduce frontier/candidate work through exact winspace/CPC/NDC inference before Cartesian pair generation;
2. **parallel-work quality:** make the remaining normalization and dominance work expose substantially more useful parallelism per instruction.

Both must preserve the C4-0006..0009 BSFP semantics. Neither authorizes minimax/search fallback.

## Code review: where the current GPU spends work

### 1. Cardinality normalization scans every candidate 43 times

`packedNormalize42` processes minimal/maximal antichains in 43 cardinality phases. Every phase walks the complete candidate interval and tests whether each candidate's popcount equals that phase.

A candidate participates semantically in exactly one phase but is visited by the outer candidate scan in all 43 phases. The cardinality ordering is exact and useful; the repeated full scan is not semantically required. A cardinality-bucket/index representation could preserve the ordering while avoiding most of these visits.

### 2. Duplicate suppression contains an unmeasured quadratic scan

For candidates in the same cardinality bucket, dominance reduces to equality. The current implementation checks duplicates by scanning `prior < i` and comparing popcount plus both 42-bit lanes.

That duplicate scan is **not included in `subsetChecksPerformed`**. Therefore current reports systematically understate normalization work when pair generation creates many equal masks. OR/AND products are especially capable of collapsing many operand pairs to the same result.

The first diagnostic must count duplicate comparisons and duplicate hits separately from subset dominance checks.

### 3. One block owns one support through a long serial semantic pipeline

`solveCompactRank42` assigns one block per support. Inside that block the support progresses serially through:

- columns;
- win/loss directions;
- cofactor normalization;
- each applicable terminal requirement;
- terminal subtraction/intersection;
- terminal union;
- aggregate union/intersection;
- every candidate tile;
- every cardinality phase in every normalization.

Different supports execute concurrently, but one expensive support cannot expose its candidate/frontier Cartesian comparison as independent blocks. A 128-thread block repeatedly performs serial frontier scans per candidate. This is a plausible explanation for high utilization combined with much lower useful dominance throughput than B1.

### 4. B1 versus full-solver reported subset throughput shows a large efficiency gap

B1 established approximately **35.35 billion exact 42-bit subset checks/second** on the GTX 1660 Ti in the flat synthetic dominance workload.

The official 5x5 C1 warm run reports approximately **2.155 billion subset checks** and **3.300 seconds submit/wait**. Dividing those figures gives only about **0.65 billion reported subset checks/second** across the full device execution, roughly 1/54 of B1's primitive rate.

This is **not** a claim that the solver's dominance kernel itself is 54x slower: the solver interval also contains candidate generation, terminal algebra, unions, barriers, duplicate scans, copying, and other work. It does show that 100% GPU utilization cannot be interpreted as 100% utilization of the measured B1 capability. A large amount of time is being spent somewhere other than useful reported subset checks.

### 5. The 6x5 explosion begins close to terminal rank, not at peak support count

For 6x5, support-rank counts are the coefficients of `(1+x+...+x^5)^6` and peak at rank 15 with 4,332 supports.

With the current 64-support shard schedule, the first 32 prepared DAG nodes cover ranks 30 through 24 completely and only the first seven solve shards of rank 23. Rank 23 has 756 supports and only seven empty cells remain.

The measured first 32-node epoch taking about 75.118 seconds therefore reaches the wall **well before** the middle-rank support-count maximum. That strongly increases the probability that terminal/cofactor/frontier algebra and normalization shape, rather than raw support count alone, is responsible.

## Winspace inference: why it can be profitable here

### Existing exact substrate

The branch already contains the necessary semantic foundation:

- C4-0006 residual winning requirements and blocker coverage;
- WSL-625 with exact 625-element standard-board residual universe;
- a canonical requirement-antichain upward-closure encoding of 20 u32 words / 80 bytes;
- exact packed implication and residual-dominance tests;
- C4-0007 monotone NDC consequences and blocker/requirement feedback;
- prior exact residual-state equivalence tests;
- prior proof-DAG experiments showing very large logical compression after irrelevant operational detail is removed.

Earlier residual search experiments also established that semantic winspace identity can remove real work. The strongest controlled cohort observed about 31% fewer nodes from accepting exact different-board winspace-equivalent reuse. Other cohorts demonstrated the important counterexample: wider residual representations can cost more time than they save on CPU even when they reduce node count.

The CUDA-BSFP economics differ because antichain intersections create Cartesian products. If exact inference reduces each input frontier by fraction `r`, pair production falls approximately with the product of the surviving fractions. For example:

- 20% reduction on each side -> about 36% fewer pairs;
- 30% reduction on each side -> about 51% fewer pairs;
- 50% reduction on each side -> about 75% fewer pairs.

This multiplicative leverage is the primary reason to revisit winspace inference now.

## Important cost boundary: do not blindly replace 42-bit records with WSL closures

A raw ownership subset comparison touches two u32 lanes. A full standard-board residual dominance test can require two 20-word closure-inclusion tests, approximately 40 u32 words in the worst case.

Ignoring early exits and memory effects, a residual comparison can therefore be on the order of twenty times the lane work of the current ownership comparison. If a full residual representation merely substitutes one candidate-for-one candidate, it is likely to regress.

As a rough screening rule, if both candidate and retained-frontier populations shrank by the same factor and every comparison became about 20x wider, the width would need to fall below roughly `1/sqrt(20) ~= 22%` of the ownership width (about a **78% reduction**) before the comparison count alone repaid the wider relation. This is only a screening estimate, not a performance contract.

Therefore the first target should **not** be "make every frontier record 160-byte residual state." The first target should be **cheap exact inference that prevents large ownership products from being generated at all**.

## Preferred integration: inference-seeded ownership antichains

The current minimal-Win / maximal-Loss representation can remain authoritative while exact inference supplies additional already-proved regions.

For each support, a cheap inference pass may derive exact P0-Win generators and/or P0-Loss caps from WSL/CPC/NDC facts. Those records seed the same ownership antichains already consumed by the recurrence.

Then expensive child-derived candidates can be rejected as soon as an inferred seed already dominates them. If inference cannot prove anything, execution falls back to the existing exact recurrence. The profitability selector may be heuristic; the certificate itself may not be.

This is attractive because it preserves:

- ownership-antichain output meaning;
- existing cofactor/intersection authority;
- all-frontier CPU differential qualification;
- exact fallback;
- the no-search BSFP boundary.

A later residual/NDC frontier ontology remains available if the measured compression is large enough to justify changing the algebra.

## First inference candidates

### A. Exact direct-threat / double-threat certificates

The cheapest new semantic inference is the existing winning-requirement network evaluated at the current support/playable frontier.

Examples worth expressing as symbolic ownership regions include:

- mover immediate completion (already represented by terminal handling, useful as a control);
- opponent multiple independently playable immediate completions when the mover has no earlier completion;
- forced single-block regions;
- bilateral requirement exhaustion;
- one-sided no-win bounds where they can remove one W/L side even without deciding exact draw versus win/loss.

The direct/double-threat family is local, finite, and easy to falsify against complete small games. It should be attempted before expensive strategic-rule combination.

### B. WSL blocker-coverage certificates

A certified blocker is already represented by a 625-bit upward closure. Coverage of all active opponent requirements is then fixed-width bitset algebra.

The expensive part is certification, not coverage. Start only with blockers whose preconditions are local and exact.

### C. Local Allis-derived certificates compiled into the existing substrate

The prior synthesis already identified **Claimeven, Baseinverse, and Vertical** as the first local rules to translate into generic requirement/blocker consequences. Do not recreate VICTOR's rule graph or combinatorial cover evaluator.

A successful local certificate should output ordinary WSL blocker/ownership/response facts and then disappear into the generic NDC/BSFP machinery.

### D. Bounded NDC feedback

Only after local facts are cheap and useful should the solver iterate:

`response/control -> blocker -> requirement elimination -> stronger response/control -> ...`

Put a finite cost budget on optional inference. Budget exhaustion means "use the ordinary exact BSFP recurrence," not "unknown result becomes false."

## Parallel-work-quality candidates independent of semantic inference

### P1. Cardinality bucketing instead of 43 full scans

Generate or compact candidates into exact popcount buckets once, then process only occupied buckets in dominance order. The semantic cardinality-phase invariant remains unchanged.

This is likely the lowest-risk direct GPU improvement exposed by the code review.

### P2. Exact duplicate elimination before dominance

Measure duplicate frequency first. If high, add an exact fixed-width dedup stage before frontier scans. A hash may locate a candidate bucket but collisions must be resolved by exact 42-bit equality. No probabilistic equality is admissible.

If this mechanism is consumer-neutral, its natural owner may be CUDA-Algorithms. Do not move Connect4 dominance semantics down with it.

### P3. Specialized terminal subtraction rather than generic Cartesian pair reduction

The CPU authority already uses the exact special form:

- a downward cap unaffected by forbidden upward requirement `q` is copied directly;
- only a cap containing `q` branches to `cap \\ {x}` for `x in q`;
- the dual only branches when an upward generator is actually contained by the forbidden cap.

The current GPU path expresses this through generic intersection against complement generators, generating pairs even for unaffected records. Because the 6x5 wall appears close to terminal rank, a device special-case matching the CPU algebra is high-value to measure.

### P4. Expose heavy-support work across more than one block

If diagnostics show a few supports dominate an epoch, one-block-per-support is the wrong physical work decomposition even if the GPU reports high utilization. Candidate/frontier dominance can be split into independent tiles/blocks and compacted afterward while the support's semantic state remains one owner.

Do not request new CUDA-JS warp/shared-memory capabilities until the current public surface has been exhausted. Shared memory and warp primitives remain proposal-only at the pinned CUDA-JS revision.

## Required diagnostic before selecting the optimization

Add bounded diagnostics that do not influence recurrence:

Per rank and preferably per support or support histogram:

- input Win/Loss frontier widths;
- pair candidates by operation class:
  - move intersection;
  - terminal subtraction;
  - union/carry normalization;
- normalization input records;
- subset comparisons;
- **same-cardinality duplicate comparisons**;
- duplicate hits;
- number of occupied cardinality buckets;
- maximum and distribution of frontier width;
- number of inference certificates attempted/hit;
- candidate products avoided by an exact certificate;
- epoch wall time already available.

This should identify whether the first 6x5 epoch is dominated by:

1. genuine frontier growth;
2. duplicate explosion;
3. generic terminal subtraction;
4. 43-pass scan overhead;
5. a few pathological supports;
6. some combination.

No single primitive benchmark can answer that question.

## Experiment order

1. Add observer-only workload diagnostics to the current C1 recurrence.
2. Run 4x4 and 5x5 and require identical complete frontiers; use their existing evidence as controls.
3. Measure the three low-risk physical improvements independently: cardinality bucketing, exact early dedup, specialized terminal subtraction.
4. Add the cheapest exact winspace certificate family and measure **candidate products avoided per inference word-operation**, not only certificate hit rate.
5. Only then perform one bounded native 6x5 run through Q1.
6. Promote broader WSL/NDC frontier representation only if measured quotient/compression is large enough to repay its much wider records.

## Current hypothesis ranking

1. **Very high confidence:** 43-phase scanning and unmeasured duplicate scans waste substantial GPU work.
2. **High confidence:** the one-block-per-support fused kernel leaves large parallelism quality on the table compared with B1.
3. **High confidence:** exact winspace inference has multiplicative leverage if it prunes before pair generation.
4. **Medium confidence:** terminal subtraction is a major contributor to the surprisingly early 6x5 wall; rank location makes it plausible, diagnostics must prove it.
5. **Medium confidence:** cheap direct/blocker certificates will repay their cost on 6x5.
6. **Low confidence without measurement:** replacing every ownership record with a full WSL/NDC record is profitable.

## External prior-art check

Classical Connect Four work supports the general value of threat/zugzwang inference, but it must not be imported as search architecture. Pascal Pons' modern alpha-beta tutorial uses direct opponent winning-position inference to remove losing moves before expansion. Allis' earlier rule system reasons about potential winning groups and compatible blocker rules; the prior Connect4 synthesis correctly notes that Allis' rule-combination search itself became expensive.

Decision-diagram literature also supports representing sparse set families structurally rather than enumerating every member, including ZDD/chain-reduced variants. That is relevant as representation research, not evidence that a ZDD should replace the currently faster ownership antichain path.

## Next seam

The next implementation should be **diagnostic first, then the smallest exact intervention supported by the diagnostic**. Do not spend another 180-second native run merely to reconfirm saturation.

The key optimization metric is now:

> **exact proof/candidate work eliminated before Cartesian materialization per unit of inference/normalization cost.**

That metric directly connects the owner's winspace-inference idea to the measured CUDA scaling wall.
