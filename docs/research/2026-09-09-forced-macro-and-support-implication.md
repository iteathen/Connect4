# Forced macro-edges and support-compatible implication reuse

**Date:** 2026-09-09  
**Status:** research evidence only; maintained source and `main` unchanged.  
**Research lineage:** continues `research/residual-automorphisms-2026-09-09` at `5f84cb526c43d9b5ce4112ded3d8f05fbe1faa3d`.

## Scope

This batch tested two underqualified structural candidates against the repaired residual-win-space interval-TT harness:

1. **true forced macro-edges** — collapse chains where a playable singleton opponent threat leaves exactly one non-losing reply, without admitting the intermediate forced states to the TT;
2. **support-compatible implication/proof reuse** — transfer alpha-beta bounds only between states with the identical support-height vector and a proven monotonic relation between both players' residual win formulas.

All 7x6 qualification uses the same fixed 625-ID minimal-requirement universe, the established move order `[3,4,2,5,1,6,0]`, the repaired exact-entry TT rule, and the frozen baseline-selected eight-position cohort used by the residual-automorphism work.

## Candidate 1: forced macro-edges

### Exact forcing rule

At a state, a residual singleton requirement is an immediate threat only when its cell is the current legal landing cell for that column.

The compression loop applies these exact cases in order:

1. if the side to move has a playable singleton, an immediate win is available and the exact maximum score for that ply is returned;
2. otherwise, if the opponent has playable singleton threats in two distinct cells, the position is an exact loss on the opponent's next move;
3. otherwise, if the opponent has exactly one playable singleton threat, the only non-losing move is to occupy that cell; apply that move and continue the loop;
4. otherwise stop compression and expose the state to normal alpha-beta search.

The third case is the actual macro-edge mechanism. Its intermediate forced states are deliberately not TT-admitted.

### Why tactical recognition and macro compression were measured separately

Several 7x6 roots have an immediate singleton win or double-threat disposition. Returning those exact terminal facts is valuable, but it is not evidence that eliminating intermediate forced states helps. Therefore qualification includes a `tactical` control that performs cases 1-2 but does **not** collapse case 3.

### Complete small-game differential qualification

All baseline, tactical, and macro modes returned identical exact empty-root scores.

| Geometry | Baseline nodes | Tactical nodes | Macro nodes | Macro reduction beyond tactical |
| --- | ---: | ---: | ---: | ---: |
| 4x3 connect-3 | 812 | 383 | 246 | **35.8%** |
| 4x4 connect-4 | 12,935 | 8,450 | 6,501 | **23.1%** |
| 5x3 connect-4 | 2,628 | 1,746 | 1,570 | **10.1%** |
| 4x5 connect-4 | 57,944 | 31,574 | 24,291 | **23.1%** |

This establishes that true forced-chain compression contributes independently of immediate tactical terminal recognition.

### Frozen baseline-selected 7x6 cohort

All modes matched the maintained independent 7x6 oracle scores.

| Mode | Aggregate nodes | Reduction vs corresponding unforced mode | Rotating-order median cohort time |
| --- | ---: | ---: | ---: |
| repaired baseline | 43,269 | — | 66.39 ms |
| tactical terminals | 4,499 | — | 5.33 ms |
| tactical + forced macro | **3,084** | **31.5% vs tactical** | **4.13 ms** |
| cardinality + residual orbits | 28,606 | — | 48.97 ms |
| current stack + tactical | 3,807 | — | 6.22 ms |
| current stack + forced macro | **2,609** | **31.5% vs current+tactical** | **5.47 ms** |

The very large baseline-to-tactical reduction is a separate structural finding: the current residual solver was spending substantial proof work rediscovering exact immediate wins/double threats. The macro-edge conclusion is based on the incremental tactical-to-macro comparison.

### Fresh non-tactical-root cohort

To isolate transit compression further, a deterministic fresh cohort was generated with the following eligibility rule before macro results were examined:

- legal nonterminal 7x6 sequence;
- root is **not** immediately solved by singleton-win/double-threat recognition;
- repaired baseline search is 500..30,000 nodes.

Twelve positions qualified. Their sequences are preserved in the evidence file.

Aggregate nodes:

| Mode | Nodes |
| --- | ---: |
| baseline | 137,930 |
| tactical terminals | 16,846 |
| tactical + forced macro | **13,928** |
| current stack + tactical | 11,848 |
| current stack + forced macro | **7,322** |

Thus true macro compression removed **17.3%** of nodes beyond tactical recognition alone, and **38.2%** beyond tactical recognition when composed with cardinality + residual automorphisms.

Repeated rotating-order timing on those same 12 positions:

| Mode | Median cohort time |
| --- | ---: |
| tactical | 24.99 ms |
| tactical + macro | **24.43 ms** |
| current stack + tactical | 19.39 ms |
| current stack + macro | **15.31 ms** |

The raw macro mechanism is a modest **2.2% runtime win** on this deliberately non-tactical cohort despite some individual positions searching more nodes after intermediate TT states are removed. In the current structural stack it is a much clearer **21.0% runtime win**.

### Important composition observation

Forced macro-edges are not monotonically node-positive on every individual position. Removing forced intermediate TT states can remove reuse that happened to help a later proof. The aggregate results remain positive, especially in the current structural stack. This is exactly why the earlier experiment that merely replaced recursion with a loop was insufficient: it retained the intermediate TT/search states and therefore did not test graph elimination.

### Disposition

**Promote forced macro-edges.**

The candidate is exact, eliminates searchable/cacheable states rather than merely changing control flow, composes strongly with cardinality bounds and residual automorphisms, and remains a measured runtime win when immediate tactical roots are excluded.

Immediate singleton-win and double-threat recognition should also be retained as exact structural terminal bounds, but tracked separately from the macro-edge claim.

---

## Candidate 2: support-compatible implication/proof reuse

### Corrected monotonic relation

The earlier aggressive move-dominance attempt was unsound because it compared residual win formulas while ignoring physical accessibility. This experiment does **not** prune moves on formula implication alone.

Proof transfer is allowed only between states with the **identical packed column-height vector**. Therefore both states have the same legal future action tree, the same side to move, and the same support/accessibility frontier.

Let `F(R)` be the OR-of-conjunctions win formula represented by one player's minimal residual requirement antichain.

State `S` dominates state `T` from P0's perspective only when:

- `F(T.P0) => F(S.P0)` — every P0 win available in T is also available no later in S; and
- `F(S.P1) => F(T.P1)` — P1 is no easier in S than in T.

Under identical support, following any identical future move sequence cannot make P0 win later in S than T and cannot make P1 win earlier in S than T. Therefore the signed distance-sensitive exact value is monotonic: `V(S) >= V(T)`.

Consequences used by the search:

- a lower bound proved for T is a valid lower bound for any S that dominates T;
- an upper bound proved for S is a valid upper bound for any T that S dominates.

No exact value is copied unless the resulting lower and upper proofs meet.

### 625-ID implication representation

The first implementation scanned requirement masks. A second implementation moved implication onto the intended fixed-ID substrate.

For each of the 625 requirement IDs, precompute the 625-bit set of requirement IDs that are supersets of it. For an antichain B, OR those precomputed sets into an upward-closure bitset. Then:

`F(A) => F(B)` iff every ID in A lies in B's upward closure.

This turns formula implication into fixed-bitset operations. A support-local Pareto proof frontier was also tested, including an 8-record bounded variant.

### Complete small-game qualification

Exact scores matched baseline in every tested complete game. Full implication reuse changed nodes as follows:

| Geometry | Baseline | Implication | Node reduction |
| --- | ---: | ---: | ---: |
| 4x3 connect-3 | 812 | 749 | 7.8% |
| 4x4 connect-4 | 12,935 | 9,340 | **27.8%** |
| 5x3 connect-4 | 2,628 | 2,163 | 17.7% |
| 4x5 connect-4 | 57,944 | 36,265 | **37.4%** |

So the monotonic proof relation is not merely theoretical; it repeatedly removes real proof work.

### Frozen 7x6 cohort: Pareto frontier

| Mode | Nodes | Node reduction | Rotating-order median time |
| --- | ---: | ---: | ---: |
| baseline | 43,269 | — | 62.25 ms |
| implication Pareto | 33,238 | 23.2% | 100.52 ms |
| implication Pareto, max 8/support | 33,293 | **23.1%** | 100.51 ms |
| cardinality + residual orbits | 28,606 | — | 48.61 ms |
| current + implication Pareto | 22,147 | 22.6% | 77.48 ms |
| current + implication Pareto, max 8/support | 22,201 | **22.4%** | 72.79 ms |

The eight-record frontier retained essentially all of the node reduction, proving that the useful cross-state proofs are sparse. However, it remained a substantial CPU/JavaScript runtime regression.

### Fresh non-tactical cohort

On the same twelve non-tactical-root positions used for the macro isolation test:

- baseline: 137,930 nodes;
- bounded Pareto implication: 100,273 nodes (**27.3% fewer**);
- cardinality + orbits: 75,419 nodes;
- current + bounded implication: 56,470 nodes (**25.1% fewer**).

But median cohort time worsened:

- 339.58 -> 556.08 ms for baseline vs bounded implication;
- 254.93 -> 355.87 ms for current vs current + bounded implication.

When added after forced macro compression, implication still removed nodes (7,322 -> 6,326, **13.6%**) but slowed the cohort (15.95 -> 19.44 ms, about **21.9% slower**).

### Disposition

**Keep as a semantically validated research candidate; do not promote into the current hot stack.**

The corrected support-compatible form consistently removes 20-30% of proof nodes and survives complete-game and independent-oracle differential checks. But even fixed 625-bit implication plus a small Pareto frontier costs more on the current JavaScript prototype than the nodes it removes.

This candidate may become attractive only if the residual representation can maintain the relevant monotonic proof frontier incrementally or if the eventual execution substrate can compare a small support-local proof frontier materially more cheaply. That is a future hypothesis, not a current performance claim.

## Combined research conclusion

This batch strengthens the distinction between **eliminating states** and **deriving extra relations between states**:

- forced macro-edges remove deterministic transit states entirely and are already a practical win;
- implication reuse discovers valid cross-state order relations but still pays too much to find/use them.

The current strongest tested composition is therefore cardinality bounds + residual transposition automorphisms + exact tactical terminals + forced macro-edges. Support-compatible implication remains outside that hot stack pending a cheaper representation/index.

## Evidence

Structured raw/aggregate evidence is preserved in:

`docs/research/evidence/2026-09-09-forced-macro-and-support-implication.json`
