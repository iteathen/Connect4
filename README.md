# Connect4

Independent Connect Four benchmark and validation product for Node search architectures.

Connect4 preserves a strong pre-existing minimax/alpha-beta engine as historical evidence, freezes its custom evaluator behavior, and builds a low-overhead Node/V8 incumbent for fair comparison with a future CUDA-MCGS device-resident lane. Connect Four rules, evaluator meaning, benchmark positions and benchmark fairness belong here; generic search/runtime/Tensor/CUDA mechanisms remain owned by their respective CUDA repositories.

## Current state

The first incumbent Node/V8 rewrite is under qualification. It preserves the optimized 2025 evaluator exactly while replacing browser/search hot-path machinery with primitive position values, precompiled winning-line tables and a typed persistent transposition table.

The compatibility lane reproduces frozen legacy move+score traces. A separate optimized lane reuses retained subtree best moves across turns for ordering while keeping root-relative numeric bounds origin-safe.

No CUDA-MCGS performance or strength claim exists yet. CUDA-MCGS #124 remains paused until explicit owner instruction.

## Validate

```bash
npm test
```

The repository CI runs Node 26.7.0. Local development timing from other Node versions is diagnostic only and is not a benchmark/support claim.

## Legacy source

The owner-supplied 2025 browser game remains source material and provenance rather than the target architecture. UI, audio, graphics and browser application structure are not imported wholesale. Exact archive-derived evaluator/search vectors are retained under `reference/` for regression.
