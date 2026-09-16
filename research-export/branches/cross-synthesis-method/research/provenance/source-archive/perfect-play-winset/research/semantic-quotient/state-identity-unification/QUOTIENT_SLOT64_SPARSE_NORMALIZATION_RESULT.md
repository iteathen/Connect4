# Slot64 Sparse-Normalization Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Candidate commit:** `fde0d90c952278fbb796c5a9d3964cf1ec0e71bb`  
**Bounded qualification:** workflow run `34655651697`, job `103447351891`  
**Standard-7x6 growth:** workflow run `34655651266`, job `103447350433`  
**Status:** exact and retained; material speed improvement, but not sufficient to close the slot64 transition gap

## Change

The slot64 residual pool previously represented strict-superset normalization as a dense table:

```text
625 residual ontology terms x 20 u32 words
```

For every reduced term, the own-transition path probed all 20 words even though most entries were zero.

The sparse candidate replaces runtime normalization rows with:

```text
strictSupersetStarts[term]
strictSupersetWordIndex[entry]
strictSupersetWordMask[entry]
```

The dense relation is used only during setup to build the sparse rows and is then released. Transition semantics, class identity, slot dictionaries, class tuples, support representation, and transition-cache policy are unchanged.

## Exactness

Both validation layers passed:

- complete bounded q-state/class/edge identity;
- independent BSFP root and root-action W/D/L;
- identical bounded Negamax work;
- standard-7x6 rank/state/class checkpoints through expansion of rank 8.

The standard-7x6 checkpoint remained:

```text
q states:            797,388
residual classes:  1,357,101
rank-9 frontier:      538,774
```

## Target-scale runtime

Slot64 v1:

```text
full campaign through rank 8: 14.359 s
rank-8 expansion:             10.256 s
```

Sparse normalization:

```text
full campaign through rank 8: 13.145 s
rank-8 expansion:              9.354 s
```

Approximate improvement:

```text
full campaign: ~8.5%
rank-8 expansion: ~8.8%
```

These are same-architecture workflow measurements on hosted runners; they are strong directional evidence rather than a hardware-pinned benchmark.

## Work reduction

At the rank-8 boundary:

```text
reduced terms:                5,993,904
sparse superset-word probes: 13,518,601
nonzero clears:              13,518,601
```

The dense implementation could perform roughly:

```text
5,993,904 x 20 = 119,878,080 word probes
```

So sparse rows remove about 106.4 million guaranteed-zero word probes in this bounded target-scale traversal.

## Memory

The target-scale typed footprint remained effectively the same while becoming slightly smaller:

```text
slot64 v1 total typed:       118,139,885 B
sparse slot64 total typed:   118,100,848 B

slot64 v1 residual:           86,533,790 B
sparse slot64 residual:       86,494,753 B
```

The slot-width and unique-chunk distributions did not change.

## Interpretation

Sparse strict-superset rows are a clear keep:

- exact semantics are preserved;
- target-scale transition time improves materially;
- memory does not regress;
- the optimization removes work known in advance to be useless.

However, it closes only a small fraction of the gap between the persistent slot64 representation and the term-list transition engine.

The next optimization seam remains **selective slot materialization**, beginning with opponent block transitions. The repaired locality audit shows block transitions change only about 2.22 of ten slots on average (p95 4), and blocking is pure deletion with no cross-slot antichain-normalization closure.
