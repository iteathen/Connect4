# C1 bounded independent implementation review

Date: 2026-09-26. **No blocking correctness or hot-path finding.** This admits
the candidate to whole-operation performance qualification; it does not establish
a speedup or justify public promotion.

Reviewed JSMinSys baseline `04d37498607ace16dae33c79462ddfe1503c8a0d`, candidate
`f6080f7d08fee6f561142b533a67ee570c8bd7a5`, and ledger-only correction
`393b8a1ac98d13ece5109246620b072ee92878dd`. Read the actual coordinate, geometry
and profile implementations, new differential tests, configured tests, source
diff, and cost-ledger delta. No solver source was changed and no benchmark ran.

## Semantic checks

- Target coordinates are cleared before construction. Every completed insertion
  writes its image and every strict superset in the same induced child basis.
  Geometry orders shapes by cardinality; the existing cardinality boundaries
  therefore omit no strict superset. Inductively each target is an upset, so an
  existing image bit proves its entire principal upset is already present.
- The added membership checks run before the current image write. Survival
  guards still reject the opponent's residuals containing the played cell.
  P0/P1 coverage is tested separately; when only one is covered, expansion still
  writes the other. There is no inference across players.
- Singleton first-win and full-board draw handling remain before deep cofactor
  construction. Empty residual normalization, child-basis generation and image
  lookup are unchanged. Every surviving image belongs to that child basis.
- Bit 31 may yield a negative signed AND result, but logical negation tests
  zero/nonzero correctly. The guards introduce no signed comparison.
- No allocation, new arena, geometry dispatch, callback, retained state or
  scratch lifetime was added. Existing removed-image scratch, inverse map and
  nonoverlapping source/target spans keep their previous contracts. Selected
  dense/sparse subset callbacks are pure, so omitting their redundant invocations
  is valid.

## Evidence and limits

Independently executed:

```text
node --test test/rba-cofactor-absorption.test.mjs test/rba-configured.test.mjs
10 tests passed, 0 failed
node tools/verify-catalog.mjs
297 sealed functions + 192 add-on units verified
node tools/audit-runtime-geometry.mjs
passed
```

The new physical oracle enumerates winning lines and board ownership directly;
expected coordinate membership does not call the optimized subset/removal
functions. It checks more than 1,000 transitions, both players, terminal metadata,
support and induced bases across 4x4/7x6/10x10, two specialization budgets, and
cached-map versus binary-search paths. Reused alternating buffers also exercise
scratch reuse. The principal-upset fixture independently confirms one expansion
and player separation. Existing configured reflection tests pass through native
cofactors before canonicalization.

This is bounded evidence, not exhaustive state enumeration. The expected basis
uses the existing support-to-basis implementation and geometry's shape metadata;
that part is not a wholly independent geometry implementation. This limitation
does not make the physical residual oracle circular for the changed guard.

## Cost ledger

The added `A` terms expose executed surviving-player target loads, address adds,
ANDs and field-load accounting. `J` and `A` expose conservative control costs;
`PS` and `U` now exclude fully absorbed expansions. Operations and the expression
agree. The retained inherited terms are a source-operation envelope, not an exact
dynamic instruction count; the updated note explicitly preserves that limit.
Neither fewer subset calls nor this symbolic ledger proves lower Intel cycles.

The correction binds the cofactor source to canonical Git blob
`6c10f0b4b2bc9371bfb1ada4d44cde5eb6ea31f6`; this matches the reviewed commit and
the catalog verifier passes in the reviewed worktree. The original mixed-line-
ending hash is no longer the ledger binding.

Remaining promotion gate: matched whole-operation cycles and solve latency with
unchanged result/witness, workload, worker count and limits. Reject the performance
claim if target-load/control overhead outweighs the saved closure work.
