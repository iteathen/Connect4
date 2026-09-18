# Connect4

Connect4 is the shared product/domain repository for exact Connect Four semantics, benchmark and oracle authority, solver qualification contracts, and product-specific CUDA composition.

The repository has one shared foundation, one canonical research lane, and **three active solver-family heads**:

- `solver/isometric` — IsoMax, the active forward structural/frontier exact solver;
- `solver/cuda-bsfp` — the active backward symbolic fixed-point exact solver;
- `solver/sut` — the retained future exact-composition lane that will bring mature IsoMax and CUDA-BSFP capabilities together;
- `research/semantic-quotient` — the single canonical owner of **all Connect4 research**, including active solver research, historical solver knowledge, negative results, synthesis, and provenance.

`solver/minimax-alpha-beta` and `solver/hybrid-confluence` are historical solver lineages, not active implementation owners. Their useful knowledge is preserved in canonical research history. The qualified incumbent implementation on `main` remains a reference/baseline/conformance comparator.
`main` is **not another solver line**. It is the shared accepted substrate and repository router. It owns domain rules, benchmark/fairness semantics, oracle/reference behavior, accepted cross-lane contracts and repository-level ownership decisions.

The qualified incumbent implementation on `main` is retained as a reference/baseline and oracle comparator. It is not the repository's singular "current solver" and does not make `main` the minimax implementation head.

## Durable branch model

```text
                          main
            shared domain / oracle / contracts
               /            |            \
              /             |             \
       IsoMax/Isometric   CUDA-BSFP        SUT
              \             |             /
               \            |            /
                research/semantic-quotient
             canonical research + history
```

The diagram is ownership-orientedThe diagram is ownership-oriented, not a Git ancestry claim. Solver heads are peers and may have different historical origins.

The current durable set is closed by `docs/decisions/2026-09-18-three-active-solver-topology.md`. Agents may create bounded temporary work/experiment branches, but may not invent another durable lane or let a temporary branch become a continuity owner without explicit owner instruction.

## Branch hygiene

Temporary `work/*`, `experiment/*`, `feature/*`, handoff, staging and evidence branches must name an owning durable lane and a retirement condition. Do not create new durable focused `research/*` branches. Valuable implementation returns to its solver owner; every durable research result, hypothesis, falsifier, research-evidence packet, and unresolved question returns to `research/semantic-quotient` before the temporary ref is removed.

Shared accepted changes flow from `main` into solver lines. **All research** is normalized and preserved on `research/semantic-quotient`. Solver-specific kernels, scheduling, symbolic state, transposition structures, implementation contracts, and composition machinery stay on their owning solver head.

Read `STATUS.md`, `next_step.yaml`, `REPOSITORY_STRUCTURE.md`, and the target lane's own status/next-step before executing work.

## Current state

The shared domain, benchmark protocol and solved-strength oracle baseline remain qualified on `main`. IsoMax/Isometric and CUDA-BSFP are the two active solving engines. SUT is intentionally early-stage and is retained as the future exact composition lane between them. Minimax and Hybrid Confluence are historical lineages only.

The canonical research lane consolidates **all** research, including solver-specific findings and provenance, so solver and experiment branches never become competing research owners.

The archived 2025 browser game is source/provenance material, not the target architecture. UI/audio/browser-specific structure is not imported wholesale.
