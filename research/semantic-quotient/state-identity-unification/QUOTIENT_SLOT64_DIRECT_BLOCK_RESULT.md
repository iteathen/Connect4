# Slot64 Direct Block Transition — Bounded Qualification Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** exact bounded qualification passed; target-scale promotion gate still open  
**Research direction / architecture:** Josh Oshiro  
**Adversarial implementation / qualification:** OpenAI ChatGPT

## Question

Can the slot-local 64-bit residual representation avoid reconstructing the full 20-word residual class for the opponent-block transition, while preserving exact class identity and creation order?

Blocking is the simpler half of the one-cell transition algebra: terms containing the newly occupied opponent cell are deleted, while all other terms are unchanged. It is therefore an order-preserving filter and does not require mover-style reduction or new dominance normalization.

## Candidate

The research candidate transforms `blockTransition` only. For each of the ten 64-bit ontology slots it:

1. starts from the parent class's existing chunk ID;
2. skips the slot entirely when the landing-cell containment mask has no bits in that slot;
3. otherwise reads the slot's two u32 words directly from the slot-local chunk dictionary;
4. clears the landing-cell-containing terms;
5. reuses the parent chunk ID when unchanged and interns only a changed chunk;
6. hashes/interns the resulting ten-chunk tuple using the existing exact class identity;
7. derives singleton-cell metadata exactly from the parent by clearing the landing cell.

The candidate was generated ephemerally by `src/quotient-slot64-direct-block-campaign.mjs`; it did not silently replace the qualified sparse-normalization implementation.

## Qualification

Workflow run: `34656048236`  
Job: `103448573740`

The candidate passed all required bounded exactness checks on:

- 4x3 connect-3;
- 4x4 connect-4;
- 5x3 connect-4;
- 4x5 connect-4.

Checks included:

- complete reachable q-state census;
- residual-class count;
- exact class-ID term sequence for every class;
- exact qID tuple identity for every state;
- every action edge ID / terminal / illegal result;
- independent BSFP root W/D/L;
- every legal root-action W/D/L;
- identical Negamax expansion and call counts.

The complete 4x5 graph remained:

```text
reachable q states: 294,593
residual classes:    69,707
terminal edges:      76,058
nonterminal edges:  814,300
illegal edges:      288,014
```

Class counts, chunk counts, reference widths, and typed memory were unchanged versus the qualified sparse-slot64 baseline.

## 4x5 timing

Twenty-one alternating repeats on the GitHub Ubuntu/Node 26.7.0 runner:

```text
sparse-slot64 baseline total median: 25.332199 ms
direct-block total median:           24.274595 ms
ratio:                                0.958251

baseline solve median:               24.358830 ms
direct-block solve median:           23.292284 ms
solve ratio:                          0.956215
```

This is approximately a **4.2% total-time improvement** and **4.4% solve-time improvement** on the largest complete bounded control.

The structural work was unchanged:

```text
block transition misses: baseline 12,446 / candidate 12,446
chunk interns:           baseline 28,027 / candidate 28,027
expanded states:         baseline 15,054 / candidate 15,054
solver calls:            baseline 24,882 / candidate 24,882
```

The improvement therefore comes from removing unnecessary whole-class materialization / comparison work, not from changing semantics, cache behavior, search work, or storage.

## Disposition

**Retain as a positive candidate, but do not yet promote it into the qualified slot64 source.**

The bounded improvement is real and exact, but the slot64 architecture is being optimized specifically for standard 7x6 scale. The next gate is therefore the same exact rank-8 7x6 forward-growth campaign used for the qualified slot64 and sparse-normalization variants.

Promotion requires:

- exact known 7x6 rank/state/class checkpoints through expansion of rank 8;
- the same 538,774-state rank-9 frontier;
- no memory regression;
- a repeatable target-scale wall-clock improvement versus the frozen sparse-slot64 baseline.

If that gate passes, direct blocking should become the qualified block-transition implementation before work moves to the more complex mover-reduction path.
