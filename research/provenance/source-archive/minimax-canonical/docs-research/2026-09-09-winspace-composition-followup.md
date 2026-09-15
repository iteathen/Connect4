# Win-space composition follow-up

**Date:** 2026-09-09  
**Status:** research evidence only; no maintained-source promotion

This note resumes the structural-candidate work after the decision-state/bitset follow-up. It records results produced from the preserved prototypes and new UTF-8 local experiments.

## 1. Semantic-successor dedup + structural ordering

Two independently positive win-space mechanisms were composed:

1. group legal moves that lead to the same exact residual game and search one representative;
2. order the remaining unique successors by structural changes to minimal winning requirements rather than center order alone.

On complete small games, using the best tested requirement-oriented ordering after semantic dedup:

| Geometry | Center baseline nodes | Composed nodes | Reduction |
| --- | ---: | ---: | ---: |
| 4x3 connect-3 | 515 | 305 | **40.8%** |
| 4x4 connect-4 | 9,213 | 4,854 | **47.3%** |
| 5x3 connect-4 | 1,968 | 741 | **62.3%** |
| 4x5 connect-4 | 42,614 | 24,057 | **43.5%** |

Exact root values agreed in every comparison.

This is substantially more stable than structural ordering alone, which had a large regression on 5x3. Semantic successor reduction changes the ordering problem by removing redundant choices before ranking them.

The present implementation remains dominated by high-level residual canonicalization; the node result is the meaningful evidence.

## 2. Shared-read / local-write TT: negative

A deliberately favorable two-tier TT experiment preserved a full 512K shared table for the first mandatory null-window pass. After that drained boundary:

- the lower 256K half was frozen as a read-only shared snapshot;
- the upper 256K half was cleared and divided into four worker-private 64K write tables;
- workers probed private state first, then the frozen shared snapshot;
- private writes used ordinary non-atomic stores;
- total backing capacity remained the same 512K arena.

On `41267575`, four workers, split depth 4, lane cap 2, paired/reversed four-repeat batch:

- full shared 512K median: **~10.47M nodes / 1.828 s**;
- shared-read/local-write median: **~19.55M nodes / 1.927 s**.

The tiered mode had essentially no write contention, but later-pass cross-worker knowledge almost disappeared. New proof information produced during a pass is valuable enough that delaying/privatizing it nearly doubled work.

Disposition: negative for this integration. The result strengthens the case that immediate shared proof knowledge is not merely synchronization overhead in the current multicore exact search.

## 3. Sparse fixed-ID win-space representation

The 7x6 residual-requirement universe contains 625 unique non-empty subsets of geometric winning lines, but the *active* minimal requirement set for each player is monotone non-increasing during play.

A sparse representation was therefore tested:

- each live requirement is a fixed 0..624 ID;
- legal moves use precomputed `target[cell][requirementId]` transitions;
- opponent moves filter IDs using precomputed cell membership;
- minimality is maintained over only the live IDs;
- no global requirement reconstruction is performed.

On the same twelve ordinary 7x6 late roots used by the earlier exact win-space test, sparse IDs reproduced **exactly the same root scores and exact state counts** as the dynamic array/normalize implementation.

Ten repeated 12-root batches produced median summed solve times:

- dynamic array/normalize representation: **~20.94 ms**;
- sparse fixed-ID representation: **~7.07 ms**;
- median reduction: **~66.2%** in this high-level research harness.

Timing is not a native hot-kernel claim, but it demonstrates that the semantic state reduction does not require repeated global set canonicalization.

The maximum live requirement count observed in each tested root was exactly its initial count, confirming the monotonicity invariant in execution.

## 4. Neutral capacity + residual move orbits with sparse IDs

Dynamic neutral capacity removes a whole column from explicit search when none of its remaining cells participates in any live requirement for either player. Its remaining placements become a single neutral-turn capacity.

Residual orbit pruning searches only one representative from columns proven interchangeable under the current residual win-space.

Reimplementing the automorphism checks over sparse fixed requirement IDs reduced the old residual-orbit candidate explosion dramatically. On the seven established 7x6 late roots, average verified permutation candidates were only about **1.0-1.46 per orbit query**, rather than roughly 69-143 in the older high-level orbit implementation.

Exact scores remained identical. Representative call reductions for `neutral + orbit` versus raw win-space included:

- 1,012 -> 736 (**27.3%**);
- 204 -> 145 (**28.9%**);
- 160 -> 86 (**46.3%**);
- 77 -> 38 (**50.6%**).

On these roots, orbit-only call counts exactly matched the earlier semantic-successor dedup counts, showing that the observed child equivalences were explainable by local residual automorphisms in this cohort. This is not universal: complete 5x3 connect-4 previously showed much stronger semantic-successor collapse than parent-state orbit pruning.

Neutral capacity and residual symmetry reinforce each other structurally: retiring irrelevant columns removes symmetry noise and makes the remaining automorphism problem almost trivial in these late roots.

## 5. Score bounds from win-space requirements: mixed

The minimal number `r` of current-player placements still required by any winning requirement gives a sound lower limit on how soon that player could possibly win. The opponent's minimum requirement gives the symmetric loss-time limit.

Using those values to aggressively tighten alpha/beta windows was negative on several draw-heavy complete games despite a strong positive 4x3 result. The window changes altered later proof shape enough to increase total work.

A safer cutoff-only integration improved three of four complete variants but still regressed on 4x5:

- 4x3 connect-3: **~33.0% fewer nodes**;
- 4x4 connect-4: **~10.2% fewer**;
- 5x3 connect-4: **~16.3% fewer**;
- 4x5 connect-4: **~5.0% more**.

One-sided exhaustion bounds (`my win-space empty => V<=0`, `opponent win-space empty => V>=0`) were likewise mixed.

Disposition: the bounds are mathematically useful facts, but no unconditional hot-search policy is supported yet. They may be more useful as answers to specific null-window obligations than as generic recursive window modifications.

## 6. Current composition lesson

The strongest mechanisms continue to be the ones that **remove distinctions before general-purpose search pays for them**:

- minimal residual requirements remove historical board distinctions;
- semantic successor dedup removes duplicate legal branches before descent;
- structural ordering acts only on the remaining unique choices;
- decision-state TT admission avoids caching deterministic transit nodes;
- neutral capacity compresses draw-only/support-free filler choices;
- residual automorphisms remove locally interchangeable choices;
- intrinsic rank prevents impossible cross-rank TT collisions;
- compact exact keys remove redundant identity bits.

By contrast, mechanisms that delay useful proof exchange or manipulate windows without removing semantic distinctions have been less reliable.

## Next seams

1. Move semantic-successor/orbit detection onto the sparse fixed-ID representation entirely, avoiding child-state canonical strings.
2. Test requirement-oriented ordering after cheap local orbit/semantic dedup on larger 7x6 workloads.
3. Revisit dominance lookup using the sparse antichain's precomputed implication closures rather than a separate frontier scan.
4. Keep shared per-node TT publication as the baseline; the frozen-shared/private-write split is rejected for now.
