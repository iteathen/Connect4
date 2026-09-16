# Support-local residual ID qualification

**Status:** completed exact representation/transition qualification on complete small controls. Performance not yet qualified.

**Research direction:** Josh Oshiro.

**Target:** `BSFP_SUPPORT_LOCAL_RESIDUAL_BASIS.md`.

## Question

For a fixed support `S` and geometry winning-line family `Lambda`, can every live residual requirement be represented exactly by a dense ID over

```text
B(S) = unique { lambda \ S | lambda in Lambda, lambda \ S != empty }
```

with exact local-ID transitions under one legal placement?

## Critical vocabulary rule

`B(S)` is a **dictionary of all unique nonempty geometric residual masks**.

It must NOT itself be antichain-normalized by subset.

A term `a` may geometrically satisfy `a subset b`, but the line producing `a` may be opponent-blocked while the line producing `b` remains live. Therefore deleting `b` from the vocabulary globally would be unsound.

Correct layering:

```text
support-local vocabulary:
    all unique nonempty line \ support masks

player residual state:
    normalized positive antichain over IDs in that vocabulary

precomputed metadata:
    subset/dominance relation among vocabulary terms
```

This distinction was exposed by the first falsifier run and retained as part of the result.

## Method

For every support in complete small controls:

1. construct the full unique support-local vocabulary `B(S)`;
2. enumerate every exact-cardinality P0 ownership assignment;
3. discard already-terminal ownerships so the state is a valid nonterminal predecessor boundary;
4. derive authoritative P0/P1 residual antichains directly from geometric lines and physical ownership;
5. encode those residuals as local IDs and require exact round-trip equality;
6. for every legal action, transition the local IDs directly:
   - mover terms remove the landing cell; empty result is terminal;
   - opponent terms containing the landing cell die;
   - surviving masks map into the child support-local vocabulary;
   - normalize the resulting player antichains;
7. compare the local-ID result with residuals recomputed directly from the physical child ownership state.

No solved W/D/L data or recursive search oracle is used.

## Results

| Geometry | Winning lines | Supports | Nonterminal states | Legal actions | Terminal-winning actions | Round-trip mismatches | Transition mismatches | Max local vocabulary |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 4x3 connect-3 | 14 | 256 | 4,945 | 12,482 | 3,320 | 0 | 0 | 14 |
| 4x4 connect-4 | 10 | 625 | 147,319 | 321,640 | 27,390 | 0 | 0 | 10 |
| 5x3 connect-4 | 6 | 1,024 | 154,151 | 382,983 | 11,625 | 0 | 0 | 6 |
| **Total** | — | **1,905** | **306,415** | **717,105** | **42,335** | **0** | **0** | — |

Mean local vocabulary sizes over supports were:

```text
4x3 c3: 9.984375
4x4 c4: 8.368
5x3 c4: 4.62890625
```

## What this establishes

The support-local residual vocabulary is an exact finite dictionary and supports deterministic parent->child ID transport under ordinary owner-labelled cofactor semantics.

For arbitrary variable-size geometry:

```text
|B(S)| <= number of geometric winning lines for that geometry.
```

Dense local IDs may therefore replace global residual masks on fixed-support hot paths when the construction/mapping cost is justified.

The representation width is selected from the actual local vocabulary size and backend word width; no 64-bit, 69-line, 42-cell, or WSL-625 constant is semantic.

## Interaction with global WSL / Isometric

Global WSL-like IDs remain useful for:

```text
cross-support structural retrieval
persistent theorem identity
proof/certificate indexing
shared canonical transformations
```

Support-local IDs are better candidates for:

```text
fixed-support blocker coverage
local implication/subsumption
residual antichain membership
child cofactor maps
claim-relative dependency incidence
pre-BSFP inference
```

The exact boundary should therefore support an explicit map:

```text
global/canonical residual identity
    <->
support-local dense residual ID
```

rather than forcing either representation to replace the other universally.

## Falsifier discovered and corrected

The first experiment incorrectly antichain-normalized `B(S)` itself and immediately failed with:

```text
mover residual has no child-local ID
```

That failure demonstrated why the local vocabulary cannot discard geometrically dominated terms independent of player ownership/blocking.

After restoring **all unique** geometric residual masks to the vocabulary, the complete controls passed with zero mismatches.

This negative result is part of the qualification, not discarded setup noise.

## Still unqualified

This experiment does not establish:

- a production CUDA speedup;
- that local table construction amortizes on every geometry/rank;
- the best dense-ID packing policy for large variable-size boards;
- that global/canonical WSL should be removed;
- the neutral-event reservoir hypothesis;
- the economics of blocker/NDC closure over local IDs.

## Next steps

1. Precompute geometry-generic support-local dictionaries and parent->child ID maps on reflection-orbit representatives.
2. Measure construction/storage cost separately from proof-side savings.
3. Compile exact blocker coverage into local membership words and compare against canonical global subset semantics.
4. Combine with rank-slice filtering before Cartesian BSFP materialization.
5. Test the 6x5 high-rank region as one profile, while keeping the implementation geometry-selected rather than hardcoded to that board.

## Reproduction

Run:

```text
node research/experiments/bsfp-support-local-residual/local-id-transition-equivalence.mjs
```

Any residual round-trip or transition mismatch sets a failing exit code.

## Disposition

**Supports** support-local dense residual IDs as an exact geometry-generic proof-side representation. The next question is performance and integration economics, not semantic correctness.
