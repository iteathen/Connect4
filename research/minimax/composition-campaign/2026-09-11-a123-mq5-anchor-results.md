# Geometry-native A1-A3 on MQ5 strong-distance anchors

**Date:** 2026-09-11  
**Status:** research evidence; no maintained solver promotion implied.

## Question

Does the role-generalized A1-A3/U1+U2 one-sided no-win certificate remain useful on the current semantic-residual **exact-distance alpha-beta** workload, or was the earlier ~26% proof reduction specific to late-game W/D/L-style controls?

## Fairness / authority

The experiment subclasses the qualified `Wsl625ResidualSolver` and leaves its semantic state, WSL-625 transitions, decision-state tactical handling, rank-banked 512K TT, null-window driver and move ordering unchanged.

The certificate is consulted only on non-forced TT-miss decision states after immediate/double-threat handling and existing distance bounds. It contributes only the exact proposition:

`current player cannot win => score <= 0`

It does **not** claim an exact distance score.

One-sided exhaustion (EXH) is crossed separately so empty current win-space cannot be credited to A1-A3.

The subclass baseline was required to reproduce the original WSL solver's node count, TT hits and writes exactly on both anchors before certificate evidence was accepted.

Workflow run `34593576536`, job `103244138581` passed.

## Results

### Loss anchor `663152175`, exact score -4

| Form | Nodes | Node ratio vs MQ5 baseline | Total ms | Time ratio |
|---|---:|---:|---:|---:|
| MQ5 WSL baseline | 786,581 | 1.0000 | 1,978.5 | 1.0000 |
| EXH only | 786,896 | 1.0004 | 1,980.9 | 1.0012 |
| A1-A3 only | **557,605** | **0.7089** | **1,751.4** | **0.8852** |
| EXH + A1-A3 | 556,980 | 0.7081 | 1,826.7 | 0.9233 |

A1-A3 alone removes **29.11%** of the remaining semantic-MQ5 nodes and is materially faster in this run. EXH alone is saturated/slightly adverse; combining it with A1-A3 saves only 625 more nodes while losing time relative to A1-A3 alone.

Certificate activity for A1-A3 alone:

- checks: 245,093
- hits: 10,149
- cuts: 6,394
- generated candidates: 2,665,586
- DFS steps after full-coverage gate: 54,296

Relative to the older compact decision/rank board baseline of 1,014,754 nodes, semantic MQ5 + A1-A3 reaches 557,605 nodes: about **45.05% less proof work**.

### Win anchor `41267575`, exact score +3

| Form | Nodes | Node ratio vs MQ5 baseline | Total ms | Time ratio |
|---|---:|---:|---:|---:|
| MQ5 WSL baseline | 4,138,812 | 1.0000 | 11,133.3 | 1.0000 |
| EXH only | 4,143,313 | 1.0011 | 11,169.2 | 1.0032 |
| A1-A3 only | **3,161,623** | **0.7639** | **10,918.9** | **0.9807** |
| EXH + A1-A3 | 3,166,088 | 0.7650 | 10,932.6 | 0.9820 |

A1-A3 alone removes **23.61%** of the remaining semantic-MQ5 nodes and is essentially wall-time neutral/slightly positive despite the still-expensive JS Map/BigInt semantic representation. EXH again adds no useful marginal effect in this workload.

Certificate activity for A1-A3 alone:

- checks: 1,281,767
- hits: 67,137
- cuts: 39,150
- generated candidates: 14,184,022
- DFS steps after full-coverage gate: 370,065

Relative to the older compact decision/rank board baseline of 5,261,422 nodes, semantic MQ5 + A1-A3 reaches 3,161,623 nodes: about **39.91% less proof work**.

## Interpretation

A1-A3/U1+U2 is not merely a late-game certificate. It remains strongly additive on both a losing and winning strong-distance anchor after semantic residual quotienting, tactical normalization and rank-banked proof memory.

The result also clarifies EXH in this regime: one-sided exhaustion is exact but mostly saturated and slightly changes collision/search paths. Keep it as a nearly-free semantic fact when naturally available; do not assign it independent optimization priority from these anchors.

The geometry-native certificate form should remain in the composition stack. Its next performance question is interaction with the planned typed exact semantic interning/runtime work, where the current Map/BigInt overhead is expected to fall substantially.

The result does **not** prove A4-A9 compatibility or authorize richer Allis rules. U1 compatibility qualification remains separate.
