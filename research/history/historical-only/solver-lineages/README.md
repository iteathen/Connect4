# Historical solver lineages

This directory preserves solver-family knowledge after a solver implementation lane is retired.

A retired solver lineage is not deleted from the project's intellectual history merely because its branch is no longer active. Preserve:

- what the solver attempted;
- exact final branch/head identity;
- important mechanisms;
- useful measurements;
- falsifiers and negative results;
- ideas that survived into active research/solvers;
- the reason the solver family stopped being an active implementation lane.

## Active solver topology after 2026-09-18

~~~text
ACTIVE
    solver/isometric
        IsoMax / forward structural exact solving with recursive exact residue

    solver/cuda-bsfp
        backward symbolic fixed-point exact solving

    solver/sut
        future exact composition of IsoMax + CUDA-BSFP
~~~

## Historical solver lineages

- [Minimax / Negamax / alpha-beta](MINIMAX_ALPHA_BETA.md)
- [Hybrid Confluence](HYBRID_CONFLUENCE.md)

The maintained incumbent search implementation on `main` is retained as a reference/baseline/conformance implementation. Its presence does not make Minimax an active solver-family lane.
