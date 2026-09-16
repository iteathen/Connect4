# Slot64 Direct Lazy Mover Transition — Qualification and Rejection Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** exact but rejected for target-scale graph growth after same-run paired 7x6 regression  
**Research direction / architecture:** Josh Oshiro  
**Adversarial implementation / qualification:** OpenAI ChatGPT

## Question

Can mover `ownTransition` exploit measured residual-slot locality by lazily materializing only dynamically affected 64-bit slots, while preserving exact residual-class identity, qID creation order, graph semantics, memory, and solver work?

The qualified slot64-v2 mover path reconstructs the complete twenty-word residual bitset even though the exact standard-7x6 locality audit measured only 4.57 changed 64-bit slots on average, with 2.19 active source slots, 2.51 reduction-target slots, and 3.57 normalization slots.

## Candidate

The source-generated candidate starts from the parent ten-chunk tuple and materializes slot words only when required by the exact transition. It lazily visits affected source slots, reduction-target slots, and sparse dominance-clear slots; interns only final dirty chunks; and maintains singleton metadata incrementally.

## Bounded exactness and positive local result

Workflow run: `34657277213`  
Job: `103452289559`  
Conclusion: **success**

The candidate reproduced complete class/qID/edge identity against qualified slot64-v2 on:

- 4x3 connect-3;
- 4x4 connect-4;
- 5x3 connect-4;
- 4x5 connect-4.

It also reproduced independent BSFP root/action W/D/L, identical Negamax expansion/call counts, identical chunk/class metrics, and identical typed-memory accounting.

The complete 4x5 graph remained:

```text
reachable q states: 294,593
residual classes:    69,707
terminal edges:      76,058
nonterminal edges:  814,300
illegal edges:      288,014
```

Twenty-one alternating 4x5 repeats showed a strong bounded/search-local improvement:

```text
slot64-v2 total median: 22.041730 ms
direct mover median:    20.339547 ms
ratio:                    0.922775

baseline solve median:   20.959764 ms
direct solve median:     19.227405 ms
solve ratio:              0.917348
```

That is approximately **7.72% faster overall** and **8.27% faster in solve time** on the bounded proxy.

## Standard-7x6 exact scale gate

Workflow run: `34657441325`  
Job: `103452774181`  
Conclusion: **success for exactness, negative for performance**

The candidate reproduced every standard rank-8 invariant:

```text
q states:                  797,388
residual classes:        1,357,101
rank-9 frontier:           538,774
typed bytes:            118,099,719
residual bytes:          86,493,624
legal nonterminal edges:  1,772,397
terminal-win edges:          33,274
illegal edges:                4,627
```

Operational class metrics were also unchanged, including:

```text
own-transition misses: 1,805,671
block misses:          1,772,397
reduced terms:         5,993,904
superset probes:      13,518,601
parent chunk reuses:  23,388,248
chunk interns:        12,039,032
```

The separate candidate run took:

```text
campaign through rank 8: 17,201.083 ms
rank-8 expansion:         12,258.661 ms
```

That was much slower than historical v2 runs, but hosted-run variance required a paired same-run test before rejection.

## Decisive paired standard-7x6 benchmark

Workflow run: `34657519609`  
Job: `103453013177`  
Conclusion: **success; candidate loses all three paired comparisons**

Three complete baseline traversals and three complete candidate traversals were alternated on the same hosted runner. Every run was hard-gated on the exact graph and byte counts above.

Raw campaign times:

```text
baseline:  12,801.143  13,447.295  13,294.516 ms
candidate: 16,342.918  16,116.812  15,744.948 ms
```

Raw rank-8 times:

```text
baseline:   8,973.212   9,540.021   9,435.929 ms
candidate: 11,887.682  11,453.898  11,097.291 ms
```

Medians:

```text
campaign baseline:  13,294.516 ms
campaign candidate: 16,116.812 ms
ratio:                1.212290

rank-8 baseline:      9,435.929 ms
rank-8 candidate:    11,453.898 ms
ratio:                1.213860
```

The lazy mover is therefore approximately **21.2% slower for the full target-scale campaign** and **21.4% slower at rank 8**. This is far beyond measurement noise and reverses the bounded result.

## Interpretation

The locality measurement itself remains valid: most exact mover transitions touch fewer than half of the ten slots. What failed is the implementation strategy.

At target scale, replacing a straight dense twenty-word transform with dynamic slot masks, per-slot branching, lazy parent-word fetches, and dirty-state control flow costs more than the skipped word work. The bounded/search-local benchmark favored the branchy path because it operates on a much smaller and different state distribution; that benefit does not survive exhaustive 7x6 graph growth.

This is an important negative result:

> **semantic locality does not imply that a branchy lazy execution representation is faster than dense fixed-width arithmetic.**

The right follow-up is to preserve the dense transform and exploit locality only where it removes redundant work without adding irregular control flow.

## Disposition

**Reject direct lazy mover for the standard-7x6 graph-growth path. Do not promote it into slot64-v3.**

Qualified slot64-v2 remains authoritative.

The next candidate should retain the dense mover transformation but remove its redundant post-transform parent-chunk comparisons. During the existing dense pass, an exact changed-slot mask can be accumulated from:

- source-word deletions;
- target-bit insertions that actually change a word;
- sparse dominance clears that actually change a word.

That mask can drive final chunk interning directly, avoiding ten post-transform `equals` checks while keeping the regular dense transform that performs well at scale. This is a narrower, lower-control-flow optimization and should be tested against the same bounded and paired rank-8 ladder.
