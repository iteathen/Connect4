# SIU-1 result — BSFP-aligned relational state in both directions

**Status:** Passed on complete bounded controls; gaps identified

**Date:** 2026-09-11

**Workflow:** run `34632643724`, job `103372941221`

## Question

Can one relational Connect Four state, aligned with CUDA-BSFP semantics, replace colored-board identity as the exact state seen by both forward and backward reasoning?

The tested logical state was exactly:

```text
supportIndex
+ sideToMove
+ normalized P0 residual winning-requirement antichain
+ normalized P1 residual winning-requirement antichain
```

The forward relational engine carried no colored ownership board. The reverse W/D/L closure operated only on relational IDs plus the exact reverse relation. Colored board state existed only in the independent oracle harness.

## Result

Across four complete controls, **1,681,808** legal non-winning physical states were checked with **zero**:

- physical-to-relational projection mismatches;
- forward relational transition mismatches;
- terminal mismatches;
- distance-sensitive strong state-score mismatches;
- per-column action-score mismatches;
- BSFP W/D/L mismatches;
- reverse relational closure mismatches;
- unresolved reverse-closure states.

This is stronger than W/D/L-only agreement: on these controls the relational state preserves the exact strong score and every labeled action score used by a forward exact solver.

## Compression observed

| Geometry | Physical states | Relational states | Physical / relational | Max physical states merged into one relational state |
| --- | ---: | ---: | ---: | ---: |
| 4x3 c3 | 4,659 | 3,735 | 1.247x | 28 |
| 4x4 c4 | 139,625 | 34,095 | 4.095x | 5,336 |
| 5x3 c4 | 152,003 | 11,317 | 13.431x | 4,440 |
| 4x5 c4 | 1,385,521 | 294,593 | 4.703x | 37,080 |

The important result is not merely fewer keys. Large exact equivalence classes exist: many distinct colored histories really do collapse to one future-behavior state.

## Gap 1 — the quotient is not state-level reversible

The deterministic forward transition is:

```text
T(q, column) -> terminal | q'
```

But the inverse is not generally a function:

```text
T^-1(q', column) -> {q1, q2, ...}
```

Measured ambiguity:

| Geometry | `(child,column)` pairs | Ambiguous pairs | Functional fraction | Max parents for one child+column |
| --- | ---: | ---: | ---: | ---: |
| 4x3 c3 | 7,078 | 584 | 91.75% | 6 |
| 4x4 c4 | 71,698 | 15,808 | 77.95% | 11 |
| 5x3 c4 | 29,682 | 5,969 | 79.89% | 3 |
| 4x5 c4 | 604,992 | 127,374 | 78.95% | 21 |

This is expected from useful quotienting. Forward residualization removes the landing cell from mover requirements, deletes newly blocked opponent requirements, and minimizes antichains. Several distinct relational predecessors can therefore collapse to the same child.

**Do not repair this by automatically adding history back to the state.** Reversibility is not a semantic requirement. BSFP fundamentally consumes predecessor *sets*. The correct shared algebra is likely a deterministic forward map plus a set-valued inverse-image/preimage operator.

## Gap 2 — an explicit reverse index nearly duplicates the forward graph

A compact CSR-style exact reverse index was estimated from the observed relational DAG:

| Geometry | Reverse CSR estimate | Dense forward transition estimate |
| --- | ---: | ---: |
| 4x3 c3 | 46,312 B | 59,760 B |
| 4x4 c4 | 514,416 B | 545,520 B |
| 5x3 c4 | 189,004 B | 226,340 B |
| 4x5 c4 | 4,435,576 B | 4,713,488 B |

Materializing both directions would roughly duplicate transition storage. That may still be acceptable for small controls, but it is the wrong default assumption for 7x6.

The next BSFP-facing experiment should therefore attempt to compute the inverse image symbolically from the relational algebra instead of storing every reverse edge.

## Gap 3 — current BSFP symbolic frontiers are more compressed than explicit relational-state enumeration

For 4x5 c4 the direct relational automaton contained **294,593** states, while the current ownership-antichain BSFP result used **40,707** Win/Loss boundary records.

Therefore forcing BSFP to enumerate one record per common relational state could be a substantial regression even though the relational state is semantically exact.

The desired unification is:

```text
common semantic language: q

minimax: deterministic forward T(q,a)
BSFP: symbolic inverse image / frontier operations over sets of q
hybrid: exact proof lookup/classification expressed in q
```

not necessarily one common physical table.

## Gap 4 — minimax hot-path economics are not established

The experiment proves state sufficiency and dual-direction exactness. It does **not** prove that the current research representation is fast enough for alpha-beta.

The prototype uses BigInt requirement masks, antichain normalization, objects and string keys. A production-oriented minimax experiment would need to test:

- dense or packed relational IDs;
- incremental/local transition cost;
- make/unmake or immutable-child economics;
- TT lookup cost and locality;
- immediate-win and forced-response extraction from residual relationships;
- move ordering;
- symmetry canonicalization;
- compatibility with any depth-limited evaluator or NN input path.

A relational identity that reduces node count but makes every node much slower is not a successful minimax optimization.

## Gap 5 — 7x6 remains unproved

The complete evidence is bounded to the four control geometries. Standard 7x6 has the known 823,543 support skeletons and WSL-625 requirement universe, but this experiment does not establish the number of reachable relational states, their distribution, or the cost of their transitions.

The small controls justify the state algebra as a serious candidate. They do not justify extrapolating its storage or speed to the empty 7x6 root.

## Architectural implication

The strongest current model is no longer “make minimax and BSFP share a board representation.” It is:

```text
one exact relational game algebra
        |
        +-- forward image:  T(q,a)            -> minimax / search
        |
        +-- inverse image:  Pre_a(Q)           -> BSFP
        |
        +-- exact classify: proof/value over q -> hybrid confluence
```

This is a deeper and cleaner unification. The solvers can speak the same semantic language through and through while retaining execution structures suited to their direction and hardware.

## Next experiment

**SIU-2 should test a direct relational alpha-beta search** under fair controls, without carrying colored board state recursively. It should compare node work and wall-clock cost against the positional implementation while decomposing:

1. relational transition cost;
2. key/interning cost;
3. additional TT reuse from merged identities;
4. tactical/ordering information lost or made cheaper;
5. any evaluator features that cannot be reconstructed from the relational state.

In parallel, the BSFP-side follow-up should derive a symbolic preimage operator for the same relational transition law and compare it with the explicit reverse-CSR cost measured here.
