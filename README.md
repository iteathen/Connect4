# Connect4

Independent Connect Four exact-solver laboratory and benchmark/validation product.

The repository deliberately preserves separate solver lanes:

- `components/incumbent/` — the incumbent Node minimax/alpha-beta search baseline;
- `components/bsfp/` — CUDA-BSFP (Backward Symbolic Fixed-Point), whose proof/solver semantics are not search semantics.

Connect Four rules, evaluator meaning, solved-game oracle evidence, benchmark fairness, BSFP structural/proof semantics, and qualification evidence belong here. Reusable CUDA algorithms/runtime mechanisms remain owned by their respective CUDA repositories.

## CUDA-BSFP qualification

The maintained benchmark qualifier is governed by `docs/specs/profiles/C4-0009-Q1-benchmark-qualification-v1.md`.

Official native qualification is explicitly armed and publishes an immutable evidence branch/PR back to this repository:

```text
npm run bench:bsfp:qualify
```

The default ladder includes geometries through 9x7. Every GPU case is admitted only after a conservative profile-owned memory bound is compared with current free VRAM under the configured safety policy. Cases have bounded timeouts, logs/stack traces are captured by an outer process, and interrupted runs are recovered on the next qualifier invocation.

Publication requires `CUDA_BSFP_GITHUB_TOKEN`, `GITHUB_TOKEN`, or `GH_TOKEN` with suitable repository contents/pull-request permission. Tokens are not forwarded to solver children or evidence.

For a non-publishing plan check:

```text
node tools/cuda-bsfp-qualifier.mjs --qualify-benchmark --dry-run
```

Current C4-0009-P1 native execution is intentionally frozen to 4x3 connect-3; larger default-ladder cases therefore remain visible as unsupported until a later compact CUDA-BSFP profile registers executable semantics and a safe memory bound.
