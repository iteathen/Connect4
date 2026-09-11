# Slot64 Direct Block Transition — Qualification Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** exact at bounded and 7x6 rank-8 scale; performance result contradictory across runner contexts; paired target-scale gate open  
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

The candidate is source-generated ephemerally by the research campaigns; it has not replaced the qualified sparse-normalization implementation.

## Bounded qualification

Workflow run: `34656048236`  
Job: `103448573740`

The candidate passed all required exactness checks on 4x3 connect-3, 4x4 connect-4, 5x3 connect-4, and 4x5 connect-4.

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

Twenty-one alternating repeats on one GitHub Ubuntu/Node 26.7.0 runner:

```text
sparse-slot64 baseline total median: 25.332199 ms
direct-block total median:           24.274595 ms
ratio:                                0.958251

baseline solve median:               24.358830 ms
direct-block solve median:           23.292284 ms
solve ratio:                          0.956215
```

This is approximately a **4.2% total-time improvement** and **4.4% solve-time improvement** on the largest complete bounded control.

Structural work was unchanged:

```text
block transition misses: baseline 12,446 / candidate 12,446
chunk interns:           baseline 28,027 / candidate 28,027
expanded states:         baseline 15,054 / candidate 15,054
solver calls:            baseline 24,882 / candidate 24,882
```

## First standard-7x6 rank-8 gate

Candidate workflow run: `34656209257`  
Candidate job: `103449079065`

The direct-block candidate reproduced every exact target-scale checkpoint:

```text
q states after expanding rank 8: 797,388
residual classes:                1,357,101
rank-9 frontier states:            538,774
typed bytes:                    118,099,719
residual bytes:                  86,493,624
legal nonterminal edges:          1,772,397
terminal-win edges:                  33,274
illegal edges:                        4,627
```

The frozen sparse-slot64 reference is commit `fde0d90c952278fbb796c5a9d3964cf1ec0e71bb`, workflow run `34655651266`, job `103447350433`.

The separate-run timings were:

```text
                                  sparse baseline     direct block      ratio
campaign through rank 8           13,145.194 ms      13,304.199 ms     1.01210
rank-8 expansion                   9,354.055 ms       9,548.464 ms      1.02078
```

So the first target-scale run was approximately **1.2% slower overall** and **2.1% slower at rank 8**, despite the bounded same-run improvement.

This is not sufficient evidence to classify the candidate as a true regression: the target-scale values came from different hosted runners, while the positive 4x5 result was a same-run alternating comparison. The observed target-scale difference is small enough to be plausibly contaminated by cross-runner variance.

## Disposition

**Do not promote or reject direct blocking yet.**

Semantic qualification is complete. Performance qualification now requires a same-run, paired target-scale comparison:

- construct sparse baseline and direct-block candidate from the same revision;
- run both on the same hosted runner;
- alternate A/B and B/A order;
- repeat enough times to compare medians rather than one samples;
- require every repetition to reproduce the exact rank/state/class/memory checkpoints above.

If paired 7x6 timing shows a repeatable improvement, promote direct blocking into the qualified slot64 source. If the paired result is neutral or slower, retain this as a rejected/negative optimization result and move directly to the mover-reduction transition path.
