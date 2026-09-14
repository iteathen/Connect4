# Connect4 current research status

**Updated:** 2026-09-13  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is a current-state router. Retained history and controls remain under
`docs/research/**` and `reference/research-prototypes/**`.

## Objective

Derive a complete structural proof of standard 7x6 Connect Four perfect-play W/D/L,
then derive the exact P0 perfect-play terminal winning-line set with provenance.
Suspected output cardinalities are not premises or tuning targets.

## Governing semantics

Value identity remains exact C4-0010:

```text
q = exact support
  + normalized P0 residual antichain
  + normalized P1 residual antichain
```

Winning region:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

Output identity remains `q + exact P0 residual/origin provenance Pi0`.
Certificate reuse is not state equality. Output-safe merging is stricter than value
merging.

## First-move boundary

Non-center safety is internally complete:

```text
V(opening c) <= 0 for c in {1,2,3,5,6,7}
```

Authority:
`docs/research/2026-09-13-noncenter-opening-structural-safety-theorem.md`

The remaining root-value task is the positive proof after opening column 4.

## Standard-7x6 positive proof frontier

The exact depth-8 discovery frontier exhibits genuine expand/collapse behavior:

```text
ply:             0   1   2   3   4    5    6    7     8
unique states:   1   1   7   7  47   47  277  204  1141
proof paths:     1   1   7   7  49   49  343  231  1616
```

At depth 8:

```text
1,141 frontier states
  319 immediate structural P0 wins
  822 recursive obligations
```

Frontier width is therefore not a progress rank.

## Hard-frontier recursion calculus

The current positive calculus is now explicit and theorem-backed.

For each unresolved P0 `q` obligation:

1. choose one concrete legal P0 witness move;
2. enumerate **every** legal P1 reply;
3. discharge replies already covered by a proved positive base certificate;
4. retain every other P0 child as a hard recursive obligation;
5. exact-`q` normalize duplicate value obligations;
6. repeat.

A finite hard-frontier chain ending in the empty set is a constructive positive proof.
Each retained macro successor is exactly two plies deeper, so

```text
rho(s) = 42 - supportRank(s)
```

decreases by two even when frontier width expands.

Authority:
`docs/research/2026-09-13-hard-frontier-recursion-calculus.md`

Evidence:
`docs/research/evidence/2026-09-13-hard-frontier-recursion-calculus.json`

## Current constructive depth-8 coverage

With the current base grammar `I / O / E / A`:

```text
319 immediate-win leaves
 99 shallow recursive closures
 62 additional generalized unique-hard closures
 24 additional low-width branching-frontier closures
---
504 / 1141 depth-8 frontier states structurally proved
```

Equivalently:

```text
185 / 822 recursive depth-8 obligations proved
```

The three recursive groups are disjoint by construction.

## Direct expand/collapse proofs

The low-width branching pilot found **55** first hard frontiers of width 2..4:

```text
24 closed structurally
31 exceeded the width-16 research cap
0 depth-capped
```

By initial width:

```text
width 2: 12 / 13 closed
width 3:  3 / 19 closed
width 4:  9 / 23 closed
```

Representative successful hard-frontier histories include:

```text
2 -> 0
2 -> 2 -> 0
2 -> 12 -> 0
2 -> 7 -> 2 -> 3 -> 0
2 -> 7 -> 9 -> 3 -> 0
4 -> 5 -> 2 -> 0
```

This is direct standard-7x6 evidence that real proof branching can expand, converge,
merge under exact `q`, and later collapse while remaining well-founded.

## Current boundary

Blindly increasing recursive depth is rejected. A rank-5 pilot materialized 100,001
`q` states after only 60 source roots and produced **zero** new rank-5 closures.

The single canonical binary overflow (`46656555`) had:

```text
2 -> 6 -> 26
```

Changing to a different exact-winning discovery witness converts the start into a
long unique-hard chain:

```text
1 -> 1 -> 1 -> 1 -> 1 -> 6 -> 28
```

so binary branching itself is not the missing theorem. The present hard boundary is
the broad **5..7-hard consequence regime** and the lack of a standalone structural
rule for choosing useful P0 witnesses.

## Immediate execution seam

Do **not** raise frontier caps or run generic deeper recursion.

Use the already-closed certificates to extract theorem-backed structural rules for:

1. P0 witness selection / transport from CPC, WSL, NDC, support and resource/race facts;
2. new positive base certificates that discharge the broad 5..7-hard regimes before
   they generate large frontiers.

Start with paired controls:

- closed expand/collapse certificates;
- their nearest broad-reexpansion siblings;
- the `4665655*` family, where nearly identical prefixes show both closure and broad
  re-expansion.

A candidate rule must be independently derived and falsified before recursive reuse.

## Hygiene

- Exact solvers/oracles are discovery and falsification controls only.
- Frozen closed certificates are verified from legal transitions and structural proof
  rules; oracle scores are not proof premises.
- Exact `q` duplicate removal is value-safe; terminal-line provenance remains separate.
- Unresolved frontiers are unknown, not losses or counterexamples.
- Negative controls and incomplete experiments remain retained.
