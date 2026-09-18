# Repository context: Connect4

Universal engineering and design guidance comes from the account-global `AGENTS.md`.


## Single research owner

All durable Connect4 research is owned by `research/semantic-quotient`, regardless of which solver exposed it. This includes derivations, hypotheses, research experiments/results, falsifiers, negative results, research evidence, open questions, synthesis, maps, and provenance.

This branch owns implementation, implementation contracts/status, qualification/reproduction machinery, and implementation-local qualification evidence—not a separate research corpus. Solver-local or historical paths named `research/` or `docs/research/` are source/provenance or implementation-experiment material unless and until their durable research meaning is integrated into canonical research. Do not add new durable research here.

See `docs/decisions/2026-09-17-single-research-owner.md`.

## Current durable topology authority

This branch is the **durable Minimax / Negamax / alpha-beta solver head** under the owner-authorized closed topology in `docs/decisions/2026-09-17-solver-namespace-normalization.md`.

The durable set is closed. Do not create or promote another continuity branch without explicit owner instruction. Any `work/*`, `experiment/*`, noncanonical `research/*`, `feature/*`, handoff, staging or evidence ref created from this lane must name this or another durable owner, preserve useful results back to that owner or an immutable archive, and retire when its bounded purpose ends.

## Mission and ownership

Connect4 is an independent Node benchmark/validation product for search architectures. It owns Connect Four domain semantics, the custom evaluator and conformance vectors, product Device-JS realization, the incumbent minimax/alpha-beta baseline, benchmark positions/budgets/fairness/metrics/evidence, and product composition of public CUDA libraries.

CUDA-MCGS owns generic search/evaluator/resource/session semantics. CUDA-JS-Tensor owns generic Tensor semantics. CUDA-JS owns CUDA mechanisms.

## Local routing

- `STATUS.md` and `next_step.yaml` — current product/workstream state.
- Accepted Connect4 ADR/specification files — benchmark/product authority.
- `reference/legacy-source/` — provenance/source evidence only, not specification authority.

## Local constraints

Maintained source is JavaScript/Node.js plus product Device-JS through public CUDA contracts. No Python, direct CUDA FFI, C/C++/CUDA C++, hand PTX, or native-addon escape path. Benchmark correctness/fairness semantics remain Connect4-owned.