# Separator hidden-history census and processed-line accumulator results

Date: 2026-09-10
Branch: `research/zdd-transfer-20260910`
Qualification commit: `19fd9045e854fa230687dfb041bf135d4592a3d8`
Qualification workflow run: `34530585056`
Qualification job: `103050054893`

This note preserves the R1 separator census and the first R2 semantic-accumulator falsification results. It is research evidence only. It does not change the accepted CUDA-BSFP production architecture, C1 implementation, numbered authorities, `STATUS.md`, or `next_step.yaml`.

## Question

The candidate graph-free transfer shape is:

```text
optimized winning-line stream
  -> crossing-cell ownership X
  -> small exact hidden-history state h
  -> flat next-layer table
```

R1 asks whether `X` alone is a complete separator for the exact closed C1 Win/Loss ownership function. When it is not, R2 asks what small semantic accumulator can replace arbitrary persistent DD/ZDD node identity.

## R1 method

For each selected support and each cut of an optimized winning-line order, occupied cells are partitioned into:

- `L`: processed-only occupied cells whose winning-line incidences are all behind the cut;
- `X`: crossing occupied cells with incidences on both sides of the cut;
- `R`: unprocessed-only occupied cells.

For each canonical assignment to `X`, all ownership assignments to `L` are varied. Each resulting exact C1 Win/Loss function over `R` is cofactered and normalized with the production C1 antichain semantics. Distinct canonical residual-function pairs are counted as hidden-history classes.

The hypothesis `X is a complete Markov boundary` is true only when every measured bucket has exactly one residual-history class.

### Reporting corrections

The first implementation had two reporting-only defects. Neither changed canonical residual equality, collision existence, or `maxHistoryClasses`.

1. Physical reachability rejected a target state if the target itself contained a win before checking target equality. The corrected rule requires strict prefixes to be nonterminal while allowing the target itself to be terminal.
2. The case-level mean averaged support/cut means. The corrected mean weights each crossing assignment directly.

The guarded corrected runner is `separator-history-classes-corrected.mjs`.

## R1 results

| Geometry | Selection | Max crossing width | Max history classes | History bits | Weighted mean classes | Capacity cuts | Physically reachable collision found |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| 4x3:c3 | all 256 | 6 | 8 | 3 | 1.6087772949 | 0 | no |
| 4x4:c4 | all 625 | 8 | 6 | 3 | 1.6267406024 | 0 | no |
| 5x3:c4 | all 1024 | 3 | 5 | 3 | 1.7418910324 | 0 | no |
| 4x5:c4 | hot 28 | 12 | 7 | 3 | 1.5329702370 | 0 | no |
| 5x4:c4 | hot 28 | 12 | 11 | 4 | 1.8847328403 | 0 | no |
| 5x5:c4 | hot 28 | 14 | 26 | 5 | 1.7407428416 | 0 | no |

The worst measured symbolic bucket is 5x5:c4 support 4426, rank 16, heights `[4,5,2,2,3]`, cut 16. It has `L=7`, `X=6`, `R=3`, 57 canonical crossing cofactors, and a maximum of 26 residual-history classes. Its mean at that cut is 10.640625 classes.

### R1 conclusion

`X` alone is rejected as an exact replacement for the complete symbolic C1 ownership domain. The important positive result is that the additional exact state remains small on these controls: the measured worst case needs only 5 class bits.

The physical diagnostic points in a different direction: after correcting target-terminal reachability, no physically reachable collision was found in the measured controls. This does not erase the symbolic C1 falsifier, because a C1 replacement must preserve the full symbolic ownership function, but it is evidence that the product-legal causal quotient may be smaller than the complete symbolic quotient.

No 7x6 hidden-history bound has yet been established.

## R2 candidates

The first semantic hypothesis is that forgotten ownership matters only through processed winning-line viability. Two nested accumulators were tested against the same canonical C1 residual-function oracle.

### Candidate A: processed-line viability/hit masks

For each processed winning line touched by a forgotten cell, record whether forgotten P0 ownership touches that line and whether forgotten P1 ownership touches it. Equivalently, these bits say whether the forgotten portion has already killed that line for P1/P0.

Result: **not rejected on tested controls**. No signature mapped to more than one exact residual C1 class.

### Candidate B: processed-line P0 count vector

For every such processed line, record the exact number of forgotten cells owned by P0. Support fixes the total forgotten occupancy of the line, so P1 count is implied.

Result: **not rejected on tested controls**. No signature mapped to more than one exact residual C1 class.

Because Candidate B strictly refines Candidate A yet found no additional exact distinction, the count vector is not justified by the current evidence. Candidate A is the stronger engineering candidate.

## R2 capacity and state evidence

The R2 DP cap was 250,000 `(canonical residual pair, candidate state)` entries. There were zero capacity cuts.

| Geometry | Max relevant processed lines | Raw hit-mask bits | Max hit signatures | Hit-signature bits | Max exact classes | Exact-class bits | Max DP states |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 4x3:c3 | 12 | 24 | 128 | 7 | 8 | 3 | 128 |
| 4x4:c4 | 8 | 16 | 223 | 8 | 6 | 3 | 472 |
| 5x3:c4 | 5 | 10 | 98 | 7 | 5 | 3 | 338 |
| 4x5:c4 | 14 | 28 | 2351 | 12 | 7 | 3 | 4096 |
| 5x4:c4 | 15 | 30 | 2536 | 12 | 11 | 4 | 8192 |
| 5x5:c4 | 25 | 50 | 51014 | 16 | 26 | 5 | 131072 |

The count-vector signature population was never smaller than the hit-mask population and reached 131,072 signatures / 17 bits on the hot 5x5 controls, versus 51,014 / 16 bits for hit masks and only 26 / 5 bits for the exact residual quotient.

### R2 conclusion

Processed-line viability is carrying the missing semantic history on the tested controls, but the raw viability mask is far from minimal. The measured gap is large: 51,014 raw viability signatures versus 26 exact residual classes in the largest control.

Therefore the next target is not a wider line-local accumulator. It is the quotient of viability state by future behavior.

## Next experiment: transition-stable residual classes

For adjacent line cuts, assign each `(X, forgotten history)` to its canonical exact residual class `h`. Then test transition determinism:

```text
(old cut, X, h, entering ownership bits)
    ->
(new cut, X', h')
```

For every pair of concrete histories sharing the same old `(X,h)` and the same entering ownership input, the resulting `(X',h')` must agree.

If this holds, the canonical residual classes are a finite-state transfer quotient: the runtime state can use dense layer-local class IDs instead of 69-line masks or persistent DD nodes. Measure per cut/support:

- maximum and mean history classes per `X`;
- total dense `(X,h)` states;
- transition fanout and occupancy;
- maximum class-ID bits;
- first nondeterminism witness, if any;
- comparison against raw viability signatures.

This is the decisive bridge from R2 semantics to the proposed flat rolling table. CUDA layout should remain deferred until this transition quotient is qualified.
