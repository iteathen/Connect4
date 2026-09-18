# Exact-distance IMPL tiny-frontier screen

**Date:** 2026-09-11  
**Status:** qualified scoped V1 capacity evidence; runtime-negative, proof-positive.

The original typed+A123 IMPL V1 screen covered capacities 4/8/16/32. Before changing the representation, the same exact harness was also run at capacities 1 and 2 to determine whether a very small frontier could recover wall time while retaining useful proof reuse.

Workflow run `34620438737`, job `103332782410`, conclusion **success**.

The workflow derives the capacity-1/2 qualifier mechanically from the committed V1 harness and preserves its JSON output as an artifact; bound authority and stage semantics are unchanged.

## Loss anchor `663152175 -> -4`

Typed+A123 control: **557,605 nodes**.

| capacity | order | nodes | marginal proof cut | first-run wall ratio |
|---:|---|---:|---:|---:|
| 1 | IMPL→A123 | 475,088 | 14.798% | 1.383x |
| 1 | A123→IMPL | 474,592 | 14.887% | 1.328x |
| 2 | IMPL→A123 | 446,592 | 19.909% | 1.385x |
| 2 | A123→IMPL | 446,646 | 19.899% | 1.389x |

Repeated rotating timing after warmup:

- control: **937.748 ms**;
- C2 IMPL→A123: **1,144.083 ms** — 446,592 nodes, about **1.220x slower**;
- C1 A123→IMPL: **1,125.577 ms** — 474,592 nodes, about **1.200x slower**.

## Win anchor `41267575 -> +3`

Typed+A123 control: **3,161,623 nodes**.

| capacity | order | nodes | marginal proof cut | first-run wall ratio |
|---:|---|---:|---:|---:|
| 1 | IMPL→A123 | 2,609,572 | 17.461% | 1.210x |
| 1 | A123→IMPL | 2,610,620 | 17.428% | 1.214x |
| 2 | IMPL→A123 | 2,410,377 | 23.761% | 1.206x |
| 2 | A123→IMPL | 2,412,364 | 23.699% | 1.224x |

Repeated rotating timing after warmup:

- control: **5,918.859 ms**;
- C2 IMPL→A123: **7,134.773 ms** — 2,410,377 nodes, about **1.205x slower**;
- C2 A123→IMPL: **7,254.012 ms** — 2,412,364 nodes, about **1.226x slower**.

## Interpretation

The tiny-frontier screen rules out a simple capacity-only fix for the current form. Even one or two retained bounds recover substantial proof work, but the V1 per-lookup/per-maintenance machinery remains expensive enough that all tested tiny forms are wall-time negative.

The proof curve is monotone and valuable from capacity 1 through 32: larger frontiers keep buying proof reduction, culminating in about 34.7–38.3% marginal cuts at capacity 32. The correct next action is therefore to make the retained frontier cheaper rather than shrinking it until its proof value disappears.

This is evidence against the **capacity-only remedy in V1**, not against IMPL or bounded frontiers as a mechanism.
