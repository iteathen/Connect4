# Binary phase cocycle representation-robustness audit

**Research direction:** Joshua Oshiro  
**Evidence source:** frozen successful rule-only workflow `36598111645`, job `109508173798`  
**Producer uses solved W/D/L labels:** no  
**Authority effect:** none

## Question

Does the non-vacuous zero-syndrome cycle depend on one redundant residual representation, or does it survive already-qualified structural closures that preserve the recursive action-unlabelled semantics?

This is a particularly important falsifier because prior work established:

```text
behavioral redundancy != safe destructive normalization
```

A candidate phase that changed arbitrarily under the existing semantics-preserving closure stack would be poor evidence for an intrinsic residual phase.

## Result

The cocycle verdict is stable across every 4x4 Connect-4 representation variant already emitted by the rule-only workflow.

| representation | residual states | recursive classes | deeper groups | binary groups | binary edges | delta=1 | reconvergences | cycle rank | nonzero syndrome |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| raw direct carrier | 10,507 | 8,242 | 65 | 61 | 31 | 6 | 1 | 1 | 0 |
| universal blocker | 10,075 | 8,242 | 65 | 61 | 31 | 6 | 1 | 1 | 0 |
| nonterminal blocker | 9,951 | 8,242 | 60 | 56 | 28 | 6 | 1 | 1 | 0 |
| + final-cap parity | 9,441 | 8,242 | 60 | 56 | 28 | 6 | 1 | 1 | 0 |
| + remaining-move capacity | 9,321 | 8,242 | 60 | 56 | 28 | 6 | 1 | 1 | 0 |
| + support-release capacity | 9,319 | 8,242 | 60 | 56 | 28 | 6 | 1 | 1 | 0 |
| + open-cap dominance | 9,090 | 8,242 | 60 | 56 | 28 | 6 | 1 | 1 | 0 |
| column-refinement audit carrier | 9,441 | 8,242 | 60 | 56 | 28 | 6 | 1 | 1 | 0 |

Every variant has:

```text
topological reconvergences       1
contradictory reconvergences     0
cycle rank                       1
zero syndromes                   1
nonzero syndromes                0
```

## What changes

The stronger closures remove five binary deeper groups and three binary continuation edges:

```text
raw:      61 binary groups / 31 binary edges
rewritten:56 binary groups / 28 binary edges
```

They also reduce transporter exits:

```text
raw transporter exits        23
rewritten transporter exits  21
```

but the nontrivial cycle and all six sheet-flipping edges that survive in the rewritten carrier remain consistent.

Thus the zero-syndrome result does not require preservation of all redundant residual syntax.

## Interpretation

This materially weakens a representation-artifact explanation.

The current evidence now separates three facts:

1. **not generic binary bookkeeping:** 4x4 Connect-3 has 232 binary groups and nonzero deltas but no cycle;
2. **not tree-path vacuity:** 4x4 Connect-4 has one genuine reconvergent cycle;
3. **not tied to the raw residual carrier:** the cycle and zero syndrome survive the existing structural closure stack while hundreds to more than a thousand structural states are removed.

The strongest bounded statement is therefore slightly sharper:

> The exact outcome-blind 4x4 Connect-4 recursive binary residue contains a non-vacuous integrable GF(2) phase cycle that is invariant across the currently qualified residual-closure representations.

## Remaining falsifiers

This still does not establish a generalized Connect Four phase algebra.

The surviving independent cycle count is only one. Generic two-sheet transition-cover trivialization and generic cofactor/action-order confluence remain plausible explanations.

The next useful experiment must therefore create **more independent cycle constraints**, not merely more binary nodes.

A larger same-rule carrier such as 4x5 Connect-4 is the natural next target because its direct rule-only graph is already known to be feasible (~102,815 states under the established structural rewrite stack).

The decisive quantity is not total graph growth. It is:

```text
binary inheritance cycle rank
+ cycle syndrome distribution
+ number of genuinely distinct reconvergent routes
```

If multiple independent cycles appear, each becomes a direct falsifier of the phase-potential hypothesis.
