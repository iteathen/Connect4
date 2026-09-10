# Repository context: Connect4

Universal engineering and design guidance comes from the account-global `AGENTS.md`.

## Mission and ownership

Connect4 is an independent Node benchmark/validation product and exact-solver laboratory for Connect Four. It owns Connect Four domain semantics, the custom evaluator and conformance vectors, solved-game oracle evidence, benchmark positions/budgets/fairness/metrics/evidence, BSFP qualification semantics/evidence, and product composition of public CUDA libraries.

The repository currently contains two deliberately separate solver lanes:

- `components/incumbent/` owns the incumbent minimax/alpha-beta/search implementation and its search-specific semantics.
- `components/bsfp/` owns Connect4 CUDA-BSFP consumer semantics: backward symbolic fixed-point proof-state meaning, Connect4-specific derivation/terminal/proof rules, and composition of generic GPU-algorithm capabilities.

Do not make BSFP a specialization of the incumbent search component, and do not import minimax/alpha-beta/search lifecycle semantics into BSFP merely because both solve the same game.

CUDA-Algorithms owns reusable provider-neutral GPU parallel-algorithm semantics. CUDA-MCGS owns generic search/evaluator/resource/session semantics. CUDA-JS-Tensor owns generic Tensor semantics. CUDA-JS owns CUDA runtime/compiler/memory/provider/lifecycle mechanisms.

## Local routing

- `STATUS.md` and `next_step.yaml` — current product/workstream state.
- C4-0001 through C4-0005 — protected baseline domain/incumbent/benchmark/oracle authority within their stated scopes.
- `docs/specs/C4-0006-control-parity-and-winspace-v1.md` — CPC + WSL-625 structural/domain mathematics for the BSFP lane.
- `docs/specs/C4-0007-nested-dependency-closure-v1.md` — NDC dependency/certificate/fixed-point proof semantics.
- `docs/specs/C4-0008-bsfp-exact-solver-v1.md` — exact BSFP W/D/L solver semantics, terminal axioms and result meaning.
- `docs/specs/C4-0009-bsfp-cuda-execution-profile-v1.md` — CUDA-BSFP consumer projection, CUDA-Algorithms/CUDA-JS seam, GPU/Node boundary and physical qualification gate.
- `docs/specs/profiles/C4-0009-P1-4x3-cuda-bsfp-v0.md` — exact first 4x3 CUDA-BSFP qualification profile.
- `docs/specs/profiles/C4-0009-Q1-benchmark-qualification-v1.md` — benchmark qualifier, crash-safe evidence, timeout/VRAM safety and repository publication authority.
- `docs/evidence/cuda-bsfp/qualification/` — immutable Q1-generated report bundles; never rewrite a prior run into a different outcome.
- `docs/research/2026-09-09-*` plus associated evidence/prototypes — preserved research/provenance supporting C4-0006..0009; evidence is not stronger authority than the formal specs.
- `components/bsfp/` — BSFP consumer implementation and local proof semantics on BSFP work branches.
- `tools/cuda-bsfp-qualifier.mjs` and `tools/cuda-bsfp-qualifier/` — Connect4-owned outer qualification/reporting machinery; solver children must not own repository credentials/publication.
- `reference/legacy-source/` — provenance/source evidence only, not specification authority.

On a BSFP work branch, read **C4-0006 → C4-0007 → C4-0008 → C4-0009**, then the selected execution/qualification profile before implementing or changing CUDA-BSFP.

## Local constraints

Maintained source is JavaScript/Node.js plus product Device-JS through public CUDA contracts. No Python, direct CUDA FFI, C/C++/CUDA C++, hand PTX, or native-addon escape path. Benchmark correctness/fairness semantics remain Connect4-owned.

BSFP may consume CUDA-Algorithms only through its public consumer-neutral contracts; generic workset/closure/sequence mechanics must not be copied downstream into Connect4. Conversely, CPC/WSL-625/NDC/WDL semantics, exact BSFP equality/dominance, existential/universal proof reduction and semantic rank completion must not move into CUDA-Algorithms.

Generic ranked activation is not by itself BSFP W/D/L evaluation. A lower-rank BSFP target is authoritative only after the complete required higher-rank contribution set has been accounted for and consumer-owned semantic reduction has finalized it.

Q1 qualification is fail-closed for GPU memory: no GPU case may launch without both a profile-owned finite upper memory bound and current free-VRAM telemetry. Timeouts, memory-safety refusals/aborts, crashes and unsupported geometries must remain visible in evidence. Official qualifier runs publish append-only evidence through a dedicated branch/PR; never push generated reports directly to protected `main` and never pass repository tokens into solver children.
