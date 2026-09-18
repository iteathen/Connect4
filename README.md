# Connect4

Independent Connect Four exact-solver laboratory and benchmark/validation product.

The repository deliberately keeps solver lanes separate while sharing Connect4-owned structural mathematics:

- `components/incumbent/` — incumbent Node minimax/alpha-beta baseline;
- `components/bsfp/` — backward symbolic fixed-point solver and CUDA-BSFP composition;
- `research/semantic-quotient/` — quotient-native forward/Negamax research and conformance evidence.

Connect Four rules, evaluator meaning, solved-game oracle evidence, benchmark fairness, CPC/WSL/NDC structural semantics, solver-specific proof meaning, and qualification evidence belong here. Reusable CUDA algorithms/runtime/search mechanisms remain owned by their respective CUDA repositories.

## Start here

- `AGENT_LOCAL.md` — repository ownership, authority, lane boundaries, and local constraints.
- `STATUS.md` — current research state and proof boundary.
- `next_step.yaml` — current executable research seam.
- `docs/research/RESEARCH_INDEX.md` — compact map of durable research notes, controls, negative results, and historical evidence.

Dated research notes are evidence, not current-state authority. Solved databases and finite oracle/census results may validate or falsify structural candidates but do not prove unbounded theorems.

## CUDA-BSFP qualification

The maintained benchmark qualifier is governed by `docs/specs/profiles/C4-0009-Q1-benchmark-qualification-v1.md`.

Official native qualification is explicitly armed and publishes immutable evidence back to this repository:

```text
npm run bench:bsfp:qualify
```

For a non-publishing plan check:

```text
node tools/cuda-bsfp-qualifier.mjs --qualify-benchmark --dry-run
```

GPU cases are admitted only after the profile-owned memory bound is checked against current free VRAM under the configured safety policy. Cases use bounded timeouts, and interrupted qualification is recoverable on the next invocation.

Publication requires `CUDA_BSFP_GITHUB_TOKEN`, `GITHUB_TOKEN`, or `GH_TOKEN` with suitable repository permissions. Tokens are not forwarded to solver children or evidence.

Current C4-0009-P1 native execution is intentionally frozen to 4x3 connect-3; larger default-ladder cases remain visibly unsupported until a later compact CUDA-BSFP profile supplies executable semantics and a safe memory bound.
