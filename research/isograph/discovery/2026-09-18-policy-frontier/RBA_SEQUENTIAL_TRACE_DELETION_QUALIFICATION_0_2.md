# RBA sequential trace deletion qualification 0.2

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact law supported; tested implementation not selected for current wall  
**Authority effect:** none

## Exact differential

The one-coordinate deletion recurrence from candidate 0.1 was tested on 4,500 deterministic random antichain/query cases over universes of 4 through 12 bits.

For every case:

- sequential deletion matched direct `Max({a AND b})`;
- reverse coordinate-deletion order matched;
- a third deterministic permutation matched.

```text
cases                 4,500
result mismatches          0
order mismatches           0
```

This supports the deductive order-independence argument.

## Large union-nearest pressure control

Synthetic fixed-cardinality antichain:

```text
universe bits       76
records         29,512
record popcount     38
deleted bits         5
```

Exact result:

```text
sequential deletion       ~26.34 s
one-shot direct batch      ~7.62 s
output generators          29,512
exact set match               YES
```

The sequential implementation rebuilt a static superset index at each deleted coordinate. It is therefore not selected as the current local-query remedy.

## Disposition

The deletion theorem remains exact and may still be useful for a specialized incremental/shared index, but the tested implementation merely moves the wall.

Do not replace the current local evaluator with this version.

The next candidate should reuse one static inner-family index across all outer queries rather than rebuild query-local indexes.
