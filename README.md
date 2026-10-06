# Connect4

Connect4 is the shared product/domain repository for exact Connect Four semantics, benchmark and oracle authority, solver qualification contracts, and product-specific CUDA composition.

## Run the current IsoMax solver

**IsoMax0.2.0-rc.2 replaces the old solver on the existing Connect4 implementation
branch. Open [the solver package](https://github.com/iteathen/Connect4/tree/work/isomax-jsminsys-rebuild/isomax)
or its [setup guide](https://github.com/iteathen/Connect4/blob/work/isomax-jsminsys-rebuild/README.md).**

With Node26.7 or later:

```sh
git clone --branch work/isomax-jsminsys-rebuild https://github.com/iteathen/Connect4.git Connect4-IsoMax
cd Connect4-IsoMax/isomax
node verify.mjs
node run.mjs
```

The default solves the actual empty7×6 board with four deep workers, 4 GiB shared
TT and256MiB private TT per worker, plus geometry plans. No opening, RLC or prior
solved cache is consumed. No npm install or submodule checkout is required.
The setup guide covers variable dimensions and measured Windows affinity.

[Download the archive](https://github.com/iteathen/Connect4/raw/refs/heads/work/isomax-jsminsys-rebuild/isomax/dist/iteathen-isomax-0.2.0-rc.2.tgz)
or read [replacement qualification](https://github.com/iteathen/Connect4/blob/work/isomax-jsminsys-rebuild/docs/qualification/20261006-isomax-package-replacement.md).
The runtime and archive identities match the frozen producer package. Integration
and package tests pass; the transfer's localhost empty-board confirmation returned
WIN/column4 in57.46s. This is a single transfer check, not a new performance ranking.

`main` routes to the solver implementation; `research/semantic-quotient` remains
the research owner. The retired `solver/isometric` branch is preserved under
`archive/lazy-smp-retirement-20260926/solver/isometric`; the current implementation
is `work/isomax-jsminsys-rebuild`, now updated through [PR178](https://github.com/iteathen/Connect4/pull/178).

## Evidence and external validation

Start with [EVIDENCE.md](EVIDENCE.md) and the machine-readable [claim registry](evidence/claims.json).

The preserved external correctness result is **192/192 W/D/L matches with 0 mismatches** against deterministic published slices of Pascal Pons Connect Four benchmark sets: the first 32 rows of each L1 set and the first 64 rows of L2_R1 and L3_R1. Its original solver evidence remains in the [archived external-evidence index](https://github.com/iteathen/Connect4/blob/archive/lazy-smp-retirement-20260926/solver/isometric/evidence/external/README.md). That historical record does not automatically qualify the replacement package.

That result is a scoped **REFERENCE-GROUNDED parent-position correctness claim**. It is not a performance ranking, does not externally validate the repository-generated per-move score vectors, and does not establish CUDA-BSFP correctness.

The repository has one shared foundation, one canonical research lane, and **three active solver-family heads**:

- IsoMax — current implementation at `work/isomax-jsminsys-rebuild`; the former `solver/isometric` ref is archived as noted above;
- `solver/cuda-bsfp` — the active backward symbolic fixed-point exact solver;
- `solver/sut` — the retained future exact-composition lane that will bring mature IsoMax and CUDA-BSFP capabilities together;
- `research/semantic-quotient` — the single canonical owner of **all Connect4 research**, including active solver research, historical solver knowledge, negative results, synthesis, and provenance.

`solver/minimax-alpha-beta` and `solver/hybrid-confluence` are historical solver lineages, not active implementation owners. Their useful knowledge is preserved in canonical research history. The qualified incumbent implementation on `main` remains a reference/baseline/conformance comparator.
`main` is **not another solver line**. It is the shared accepted substrate and repository router. It owns domain rules, benchmark/fairness semantics, oracle/reference behavior, accepted cross-lane contracts and repository-level ownership decisions.

The qualified incumbent implementation on `main` is retained as a reference/baseline and oracle comparator. It is not an active solver-family implementation.

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

The diagram is ownership-oriented, not a Git ancestry claim. Solver heads are peers and may have different historical origins.

The current durable set is closed by `docs/decisions/2026-09-18-three-active-solver-topology.md`. Agents may create bounded temporary work/experiment branches, but may not invent another durable lane or let a temporary branch become a continuity owner without explicit owner instruction.

## Branch hygiene

Temporary `work/*`, `experiment/*`, `feature/*`, handoff, staging and evidence branches must name an owning durable lane and a retirement condition. Do not create new durable focused `research/*` branches. Valuable implementation returns to its solver owner; every durable research result, hypothesis, falsifier, research-evidence packet, and unresolved question returns to `research/semantic-quotient` before the temporary ref is removed.

Shared accepted changes flow from `main` into solver lines. **All research** is normalized and preserved on `research/semantic-quotient`. Solver-specific kernels, scheduling, symbolic state, transposition structures, implementation contracts, and composition machinery stay on their owning solver head.

Read `STATUS.md`, `next_step.yaml`, `REPOSITORY_STRUCTURE.md`, and the target lane's own status/next-step before executing work.

## Current state

The shared domain, benchmark protocol and solved-strength oracle baseline remain qualified on `main`. IsoMax/Isometric and CUDA-BSFP are the two active solving engines. SUT is intentionally early-stage and is retained as the future exact composition lane between them. Minimax and Hybrid Confluence are historical lineages only.

The canonical research lane consolidates **all** research, including solver-specific findings and provenance, so solver and experiment branches never become competing research owners.

The archived 2025 browser game is source/provenance material, not the target architecture. UI/audio/browser-specific structure is not imported wholesale.
