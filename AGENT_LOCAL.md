# Repository context: Connect4

Universal engineering and design guidance comes from the account-global `AGENTS.md`.

## Mission and ownership

Connect4 is an independent Node benchmark/validation product and exact-solver laboratory for Connect Four. It owns Connect Four domain semantics, the custom evaluator and conformance vectors, solved-game oracle evidence, benchmark positions/budgets/fairness/metrics/evidence, and product composition of public CUDA libraries.

The repository currently contains two deliberately separate solver lanes:

- `components/incumbent/` owns the incumbent minimax/alpha-beta/search implementation and its search-specific semantics.
- `components/bsfp/` owns Connect4 CUDA-BSFP consumer semantics: backward symbolic fixed-point proof-state meaning, Connect4-specific derivation/terminal/proof rules, and composition of generic GPU-algorithm capabilities.

Do not make BSFP a specialization of the incumbent search component, and do not import minimax/alpha-beta/search lifecycle semantics into BSFP merely because both solve the same game.

CUDA-Algorithms owns reusable provider-neutral GPU parallel-algorithm semantics. CUDA-MCGS owns generic search/evaluator/resource/session semantics. CUDA-JS-Tensor owns generic Tensor semantics. CUDA-JS owns CUDA runtime/compiler/memory/provider/lifecycle mechanisms.

## Local routing

- `STATUS.md` and `next_step.yaml` — current product/workstream state.
- Accepted Connect4 ADR/specification files — benchmark/product and solver-lane authority.
- `components/bsfp/` — BSFP consumer implementation and local proof semantics on BSFP work branches.
- `reference/legacy-source/` — provenance/source evidence only, not specification authority.

## Local constraints

Maintained source is JavaScript/Node.js plus product Device-JS through public CUDA contracts. No Python, direct CUDA FFI, C/C++/CUDA C++, hand PTX, or native-addon escape path. Benchmark correctness/fairness semantics remain Connect4-owned. BSFP may consume CUDA-Algorithms only through its public consumer-neutral contracts; generic workset/closure mechanics must not be copied downstream into Connect4.
