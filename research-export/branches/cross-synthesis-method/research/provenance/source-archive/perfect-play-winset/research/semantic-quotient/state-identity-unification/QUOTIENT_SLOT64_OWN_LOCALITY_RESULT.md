# Slot64 Mover Transition Locality Audit

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** exact rank-8 measurement complete; direct lazy mover transition justified  
**Research direction / architecture:** Josh Oshiro  
**Adversarial measurement / qualification:** OpenAI ChatGPT

## Purpose

Measure the actual slot locality of the qualified slot64-v2 `ownTransition` path before replacing broad 20-word materialization with a lazy slot-local transition.

This audit replaces an earlier invalid external locality measurement that reported impossible values larger than the ten-slot representation. The corrected counters are injected inside the exact slot64-v2 transition closure and are hard-bounded to histograms `[0..10]`.

## Qualification

Workflow run: `34657032602`  
Job: `103451567946`  
Conclusion: **success**

The instrumented implementation reproduced the exact standard-7x6 rank-8 checkpoints:

```text
q states:                  797,388
residual classes:        1,357,101
rank-9 frontier:           538,774
legal nonterminal edges:  1,772,397
terminal-win edges:          33,274
illegal edges:                4,627
```

Mover workload:

```text
own-transition misses: 1,805,671
terminal returns:         33,274
no-op returns:             1,038
nonterminal affected:  1,771,359
reduced terms:         5,993,904
superset-word probes: 13,518,601
```

The identity is exact:

```text
1,805,671 - 33,274 - 1,038 = 1,771,359 measured affected transitions
```

## Dynamic locality

For the 1,771,359 nonterminal affected mover transitions:

```text
average active source slots:       2.194924 / 10
average reduction target slots:    2.514433 / 10
average normalization slots:       3.568011 / 10
average final changed slots:       4.573619 / 10
```

Histograms are indexed by slot count `0..10`.

### Active source slots

```text
[0,
 398573,
 749076,
 511146,
 105130,
 7289,
 145,
 0,
 0,
 0,
 0]
```

No affected transition needed more than six active source slots, and almost all needed one to four.

### Reduction target slots

```text
[0,
 352436,
 634581,
 442425,
 226745,
 94772,
 18593,
 1764,
 43,
 0,
 0]
```

### Normalization slots

```text
[0,
 245739,
 396988,
 322589,
 339126,
 210177,
 4359,
 166239,
 62867,
 20155,
 3120]
```

Static normalization closure can span nearly the whole ontology, but the exact reachable transitions usually touch only a small dynamic subset.

### Final changed slots

```text
[0,
 0,
 148128,
 317233,
 398744,
 406717,
 317917,
 147511,
 31384,
 3395,
 330]
```

The distribution peaks at four to five changed slots. Only 330 measured transitions changed all ten slots.

## Interpretation

A static per-cell closure is too conservative for implementation selection: sparse dominance rows mean almost every board cell can theoretically invalidate terms across most or all ten ontology slots.

The reachable graph is much more local. The current mover path nevertheless:

- loads all ten parent chunks;
- scans all twenty u32 words;
- materializes a full result bitset;
- compares all ten result chunks back to the parent.

The audit therefore supports a different primitive:

1. begin with the parent ten-chunk tuple;
2. inspect only statically relevant source slots and materialize a source slot only when the current class actually has affected terms there;
3. collect reduced targets without rebuilding the whole class;
4. lazily materialize target slots only when a new target bit must be added;
5. lazily materialize normalization slots only when a sparse dominance mask intersects the current slot contents;
6. intern only changed slots, then exact-intern the final ten-chunk tuple;
7. derive singleton metadata incrementally from the parent plus newly created singleton reductions.

The nonterminal mover path cannot delete an existing singleton: an existing singleton containing the landing cell would have returned terminal before reduction, and a singleton elsewhere is not removed by occupying this cell. A nonempty reduced requirement can only add a singleton or dominate larger requirements. This incremental metadata rule must still be verified exhaustively by the bounded exactness suite before promotion.

## Disposition

**Proceed with a direct lazy slot64 mover candidate.**

Promotion remains contingent on the same ladder used for direct blocking:

- complete bounded class/qID/edge identity;
- independent BSFP root/action WDL;
- identical Negamax work;
- standard 7x6 rank-8 exact checkpoints and byte accounting;
- same-run paired performance evidence if the effect is small enough for hosted-run variance to matter.
