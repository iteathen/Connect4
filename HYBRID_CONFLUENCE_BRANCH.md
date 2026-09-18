# Hybrid Confluence branch

**Branch:** `solver/hybrid-confluence`  
**Solver family:** Hybrid Confluence

Hybrid Confluence is a first-class Connect4 solver lineage. It is distinct from Minimax/Negamax, CUDA-BSFP, Isometric, and SUT.

The branch owns exact cooperation between solver capabilities through explicit confluence contracts. It may consume public/accepted behavior from other solver families, but it does not absorb ownership of their private kernels, state layouts, search policy, recurrence machinery, or research authority.

## Current maturity

This branch is intentionally initialized but not yet a mature implementation head. At the 2026-09-17 topology cleanup it contained no implementation commits beyond the shared foundation. Its first responsibility is therefore to establish branch-local contract/state before substantive implementation rather than inheriting `main`'s router as if that were solver state.

## Ownership boundary

Hybrid Confluence may own:

- exact proof/result exchange between solver families;
- hybrid confluence identity and transport;
- hybrid scheduling/cancellation semantics where those are specific to this solver family;
- hybrid qualification and performance evidence.

It does not own:

- Minimax private TT/search policy;
- BSFP private symbolic recurrence/storage;
- Isometric structural calculus;
- SUT's independently evolving S ∪ T semantics;
- canonical solver-neutral research.

Shared product facts route to `main`; shared research routes to `research/semantic-quotient`.

## Branch rule

New Hybrid Confluence implementation lands here or on a bounded temporary branch explicitly owned by this lane. Temporary branches must return durable code/evidence here and then retire.
