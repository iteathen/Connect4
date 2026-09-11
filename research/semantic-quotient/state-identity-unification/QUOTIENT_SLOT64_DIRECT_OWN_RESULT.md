# Slot64 Direct Lazy Mover Transition — Bounded Qualification Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** complete bounded exactness passed; standard-7x6 rank-8 promotion gate open  
**Research direction / architecture:** Josh Oshiro  
**Adversarial implementation / qualification:** OpenAI ChatGPT

## Question

Can mover `ownTransition` exploit the measured residual-slot locality without changing exact residual-class identity, qID creation order, graph semantics, memory, or solver work?

The qualified slot64-v2 mover path reconstructs the complete twenty-word residual bitset even though the exact standard-7x6 locality audit measured only 4.57 changed 64-bit slots on average, with 2.19 active source slots, 2.51 reduction-target slots, and 3.57 normalization slots.

## Candidate

The source-generated direct mover candidate starts from the parent ten-chunk tuple and materializes slot words only when required by the exact transition:

1. preserve the existing prefix-transition cache and singleton-at-landing terminal fast path;
2. inspect a source slot only when the landing-cell containment mask intersects that ontology slot;
3. materialize a source slot only when the current class actually has affected terms there;
4. collect reduced target terms into the existing exact target bitset and target-slot mask;
5. materialize a target slot only when a reduced target changes the parent contents;
6. apply the existing sparse strict-superset normalization rows, materializing an untouched slot only when the clear mask actually intersects its current parent word;
7. intern only dirty slots whose final two-word value differs from the parent;
8. exact-intern the final ten-chunk tuple using the existing class hash/identity;
9. preserve singleton metadata incrementally as parent singleton cells OR newly reduced singleton targets.

The incremental singleton rule is valid for the nonterminal mover path only if existing singleton requirements cannot disappear. The bounded exhaustive qualification below directly validates that rule against the complete baseline graphs rather than treating it as an unchecked assumption.

## Qualification

Workflow run: `34657277213`  
Job: `103452289559`  
Conclusion: **success**

The candidate passed complete exactness comparison against qualified slot64-v2 on:

- 4x3 connect-3;
- 4x4 connect-4;
- 5x3 connect-4;
- 4x5 connect-4.

Checks included:

- complete reachable q-state census;
- exact residual-class count;
- exact term-ID sequence for every residual class ID;
- exact q-state tuple for every qID;
- exact action-edge result for every reachable state/action;
- independent BSFP root W/D/L;
- every root-action W/D/L;
- identical Negamax expansion and call counts.

The complete 4x5 graph remained:

```text
reachable q states: 294,593
residual classes:    69,707
terminal edges:      76,058
nonterminal edges:  814,300
illegal edges:      288,014
```

The full-graph operational and storage metrics also matched exactly between baseline and candidate, including:

- class intern lookups/hits/misses;
- mover/block transition hits/misses;
- mover/block no-op counts;
- terminal returns;
- reduced-term count;
- sparse superset-word probes/clears;
- class/hash growth counts;
- slot reference widening;
- parent-chunk reuse;
- chunk interning;
- prefix-cache accounting;
- all typed-memory byte counts.

This is stronger than equal W/D/L alone: the candidate reproduced the same class construction, graph identity, and allocation shape.

## 4x5 paired timing

Twenty-one alternating baseline/candidate repeats on one GitHub Ubuntu/Node 26.7.0 runner:

```text
slot64-v2 baseline total median: 22.041730 ms
direct mover total median:       20.339547 ms
ratio:                             0.922775

baseline solve median:            20.959764 ms
direct mover solve median:        19.227405 ms
solve ratio:                       0.917348
```

This is approximately a **7.72% total-time improvement** and **8.27% solve-time improvement** on the largest complete bounded control.

Representative root-solve structural metrics stayed identical:

```text
own-transition misses: baseline 10,672 / candidate 10,672
chunk interns:          baseline 28,027 / candidate 28,027
typed bytes:            baseline 1,445,166 / candidate 1,445,166
expanded states:        baseline 15,054 / candidate 15,054
solver calls:           baseline 24,882 / candidate 24,882
```

The speedup therefore comes from avoiding unnecessary full-class materialization and slot scanning, not from performing less semantic/search work or changing the representation.

## Disposition

**Retain as a strong positive candidate; do not promote yet.**

The next gate is the standard 7x6 exact rank-8 forward-growth boundary:

```text
q states:             797,388
residual classes:   1,357,101
rank-9 frontier:      538,774
typed bytes:       118,099,719
residual bytes:      86,493,624
```

The candidate must reproduce those exact checkpoints and edge counts with no memory drift. Target-scale wall-clock performance is then compared against qualified slot64-v2. If the separate hosted-run result is not decisively larger than runner variance, a same-run alternating paired rank-8 benchmark is required before promotion.
