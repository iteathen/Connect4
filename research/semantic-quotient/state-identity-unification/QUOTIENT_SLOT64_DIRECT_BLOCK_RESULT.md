# Slot64 Direct Block Transition — Qualification and Promotion Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** promoted into qualified slot64-v2 after paired target-scale performance win and full regression qualification  
**Research direction / architecture:** Josh Oshiro  
**Adversarial implementation / qualification:** OpenAI ChatGPT

## Question

Can the slot-local 64-bit residual representation avoid reconstructing the full 20-word residual class for the opponent-block transition, while preserving exact class identity and creation order?

Blocking is the simpler half of the one-cell transition algebra: terms containing the newly occupied opponent cell are deleted, while all other terms are unchanged. It is therefore an order-preserving filter and does not require mover-style reduction or new dominance normalization.

## Candidate

For each of the ten 64-bit ontology slots, direct blocking:

1. starts from the parent class's existing chunk ID;
2. skips the slot when the landing-cell containment mask has no bits in that slot;
3. otherwise reads only the slot's two u32 words from the slot-local chunk dictionary;
4. clears the landing-cell-containing terms;
5. reuses the parent chunk ID when unchanged and interns only a changed chunk;
6. hashes/interns the resulting exact ten-chunk class tuple;
7. derives singleton-cell metadata from the parent by clearing the landing cell.

The candidate was first evaluated as an ephemeral source-generated research variant. The original sparse slot64 pool was then retained unchanged as historical evidence and the promoted implementation was placed in `src/quotient-slot64-residual-pool-v2.mjs`.

## Bounded qualification

Candidate workflow run: `34656048236`  
Candidate job: `103448573740`

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

## 4x5 paired timing

Twenty-one alternating repeats on one GitHub Ubuntu/Node 26.7.0 runner:

```text
sparse-slot64 baseline total median: 25.332199 ms
direct-block total median:           24.274595 ms
ratio:                                0.958251

baseline solve median:               24.358830 ms
direct-block solve median:           23.292284 ms
solve ratio:                          0.956215
```

This was approximately a **4.2% total-time improvement** and **4.4% solve-time improvement** on the largest complete bounded control.

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

The first target-scale candidate run was on a different hosted runner and was slightly slower than that historical sparse run:

```text
                                  sparse historical   direct block      ratio
campaign through rank 8           13,145.194 ms      13,304.199 ms     1.01210
rank-8 expansion                   9,354.055 ms       9,548.464 ms      1.02078
```

Because the effect was small and the runners differed, this comparison was treated as ambiguous rather than as promotion or rejection evidence.

## Decisive paired standard-7x6 benchmark

Workflow run: `34656333793`  
Job: `103449468396`

Five complete sparse-baseline traversals and five complete direct-block traversals were alternated A/B then B/A on the same hosted runner. Every individual traversal was hard-gated on the exact graph and byte counts above.

The direct-block candidate won **all five same-run pairs**.

Median results:

```text
                                  sparse baseline     direct block      ratio
campaign through rank 8           13,060.289 ms      12,859.128 ms     0.984598
rank-8 expansion                   9,276.861 ms       9,116.873 ms      0.982754
```

This is a repeatable **1.54% full-campaign improvement** and **1.72% rank-8 improvement** at standard 7x6 scale.

The paired result is the performance authority for promotion. Separate hosted-run timings remain informational because runner variance is large enough to obscure an effect of this size.

## Promotion

The historical sparse pool remains at:

`src/quotient-slot64-residual-pool.mjs`

The promoted direct-block implementation is:

`src/quotient-slot64-residual-pool-v2.mjs`

The slot64 kernel wrapper was switched to v2 in commit:

`e22d7a0fd4695c711efbb591b7fe7c430c321e5e`

The temporary source-generator candidate workflows were frozen to manual dispatch before promotion so they cannot produce false failures after their historical source seam disappears.

## Qualification of the promoted source

The actual promoted v2 source, not the ephemeral candidate, passed all three promotion gates.

### Bounded slot64 exactness

Workflow run: `34656740720`  
Job: `103450692359`  
Conclusion: **success**

The promoted source reproduced complete class/qID/edge identity, independent BSFP root/action WDL, and identical Negamax work on all four bounded controls.

### Standard 7x6 rank-8 growth

Workflow run: `34656740698`  
Job: `103450691991`  
Conclusion: **success**

The promoted source reproduced:

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

At this boundary the representation uses:

```text
class tuple bytes:       44,040,192
chunk dictionary bytes:  7,401,472
parent chunk reuses:     23,388,248
chunk interns:           12,039,032
reference widths:        [2,2,2,2,1,2,2,2,2,4]
```

This preserves the large slot64 memory win:

- about **44.7% less total typed memory** than the term-list rank-8 reference;
- about **52.4% less residual memory** than the term-list reference;
- about **11.8% less total typed memory** than the older global-128 chunked prototype;
- about **15.4% less residual memory** than the global-128 prototype.

The separate promoted-source CI run took `13,594.623 ms` through rank 8. That value is not used to overturn the paired benchmark because it ran on a different hosted runner.

### Broader SIU dual-direction regression

Workflow run: `34656740635`  
Job: `103450691966`  
Conclusion: **success**

The broader relational forward/backward exactness experiment completed successfully after the slot64-v2 promotion.

## Disposition

**Direct opponent blocking is promoted and closed.**

The next optimization seam is mover `ownTransition`, which still performs broad residual materialization despite strong slot locality. At the standard rank-8 boundary the current exact workload includes:

```text
own-transition misses: 1,805,671
reduced terms:         5,993,904
superset-word probes: 13,518,601
own terminal returns:     33,274
```

The next candidate should preserve the same exact class identity and creation order while reducing mover-side materialization to the source/target/normalization slots actually affected by the landing cell. It must pass the same bounded and target-scale promotion ladder before replacing the v2 mover path.
