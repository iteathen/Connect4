# Phase cocycle / path-independence experiment checkpoint

**Status:** pre-run checkpoint; no cocycle result yet  
**Research direction:** Joshua Oshiro  
**Experimental branch:** `research/nim-control-parity-algebra-20260929`  
**Pre-run experimental head:** `388e79cc2563186646de7db6c70b2f53b8b24b63`  
**Live canonical research head observed before this checkpoint:** `8b6df3036471c9a52436a1202993478c5fc12afd`  
**Producer uses solved W/D/L labels:** no

## Question

The current 4x4 direct residual carrier contains 61 binary deeper-continuation groups and 31 binary-to-binary continuation edges after current-node action gauge has already been removed.

The next falsifier asks whether these two-sheet fibers admit an integrable relative GF(2) phase.

For each binary inheritance edge, assign only a *local* sheet order from the existing deterministic labelled-class ordering and derive the relative edge map

```text
delta(e) in GF(2)
```

from whether parent sheet 0 maps to target sheet 0 or target sheet 1.

Absolute sheet names are gauge choices. Only relative path XOR, parallel-edge disagreement, reconvergent-path disagreement, and closed-cycle syndrome are invariant.

## Existing carrier

Use the already-tested rule-only structural producer:

`research/isograph/discovery/2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs`

Existing exact bounded census:

```text
binary deeper groups                 61
changed child pairs                  79
binary continuation edges            31
nonbinary continuation edges          3
child action-transporter edges       23
child branch/multiplicity-erasure    22
terminal/unknown edges                0
```

No physical-board enumeration or solved outcome labels are required for the cocycle producer.

## Planned audit

1. Build the directed binary inheritance graph from the existing 31 continuation edges.
2. Verify each edge induces a bijection of the two local sheets.
3. Record the edge delta under the deterministic local sheet ordering.
4. Count nodes, distinct directed edges, parallel edges, weak components, branching points, joins, exits, shortest and longest inherited chains.
5. Enumerate reachable source/target pairs with multiple directed paths and compare accumulated XOR.
6. Independently test global integrability with parity propagation on the underlying undirected multigraph.
7. Report contradictory parallel edges, contradictory reconvergences, and nonzero cycle syndromes.
8. Explicitly classify a forest/no-reconvergence result as vacuous rather than positive evidence.
9. Retain the generic-cover falsifier: even a zero-syndrome two-sheet graph is not by itself a Connect-Four-specific value law.

## Decisive interpretations

- Any contradictory reconvergence or nonzero cycle syndrome falsifies a globally defined bounded phase potential on the present carrier, or proves the carrier is missing a required variable.
- Zero syndrome on a graph with genuine independent reconvergence establishes bounded integrability of this relative phase carrier, but **not** W/D/L, a nimber, generalized Connect Four, or a polynomial solve.
- Zero syndrome only because the graph is a forest / unique-path DAG is insufficient evidence.

## Execution discipline

Run the existing GitHub-hosted rule-only workflow after the audit is implemented. Preserve the current outcome-blind producer and existing structural counts. Commit the implementation before relying on the workflow result, and commit the measured positive or negative result immediately afterward.
