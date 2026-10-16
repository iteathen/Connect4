# Center-only reverse certificate — 2026-10-16

The first four-representative third-P0-move delay-discovery run hit its predeclared 400-state candidate budget (250 local predicate checks), with **no global certificate and no outcome claim**. Preserve that failure unchanged.

Rather than expand the budget or the four-way graph, isolate **only** the critical reply `444444` (P1 fills center on turn 6). Reuse the frozen exact first-win and residual generators from the committed `turn6-third-move-dual.mjs`, changing only the representative list from `[1,2,3,4]` to `[4]` for this bounded diagnostic. Keep the same 400-state/2,000-local-predicate/30s ceilings. Verification must independently cover every P0 first and second action under a proposed P1 delay witness. No oracle input, no generalized solve, and no outer-center replay census.

If this also exhausts, do not broaden; compute static three-cell residual overlaps and attack the earliest missing response guard using a direct local hitting-set certificate. Record all limits.
