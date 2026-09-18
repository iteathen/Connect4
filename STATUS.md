# Connect4 Hybrid Confluence Status

**Updated:** 2026-09-17  
**Branch:** `solver/hybrid-confluence`  
**Solver family:** Hybrid Confluence  
**State:** initialized; branch-local implementation contract not yet established

## Role

Hybrid Confluence is a first-class solver-family head. It owns exact cooperation between solver capabilities through an explicit confluence contract. It is not a generic shared-services branch and it is not a rename of SUT.

The branch may consume accepted/public behavior from Minimax/Negamax and CUDA-BSFP, and later other solver families where explicitly qualified. It does not take ownership of their private implementation state.

## Current implementation state

At the 2026-09-17 implementation-topology cleanup, this branch had no unique implementation commits beyond the shared foundation. It was therefore fast-forwarded to current `main` and given explicit branch-local routing rather than left as a stale placeholder.

No mature Hybrid Confluence kernel, scheduler, proof-exchange implementation, performance claim, or qualification result is currently established by this branch.

## Ownership

Hybrid Confluence may own:

- solver-specific confluence/result exchange;
- hybrid proof transport and exact reconciliation;
- hybrid scheduling/cancellation where specific to this solver;
- hybrid qualification and benchmark evidence.

It does not own:

- Minimax/Negamax private search/TT internals;
- CUDA-BSFP private symbolic recurrence/storage;
- Isometric structural calculus;
- SUT semantics;
- all canonical Connect4 research.

## Immediate seam

Before substantive implementation:

1. define the smallest exact confluence contract between participating solver capabilities;
2. identify exact shared state/result identity and proof-strength ordering;
3. define which side may publish, consume, supersede or cancel work;
4. prove that composition cannot turn stale/partial information into a false exact result;
5. qualify the contract on bounded controls before performance work.

Do not infer a concrete architecture merely from the branch name or the older repository-level sketch.

## Research ownership

This branch does not own research. Hybrid-specific research questions, hypotheses, results, negative results, and research evidence belong on `research/semantic-quotient`; this branch owns Hybrid Confluence implementation and implementation qualification.

## Routing

- Shared product/domain facts -> `main`.
- All research -> `research/semantic-quotient`.
- Hybrid-specific implementation/evidence -> this branch.
- Temporary Hybrid work -> bounded branch owned by this lane, then integrate/archive/retire.

See `HYBRID_CONFLUENCE_BRANCH.md` and `docs/decisions/2026-09-17-closed-durable-lane-topology.md`.
