# CUDA-BSFP research

This is the canonical namespace for **new** CUDA-BSFP-specific research packets on `solver/cuda-bsfp`.

Historical BSFP/OQS prototypes and evidence remain in their original committed paths for reproducibility. Do not extend `reference/research-prototypes/` as a general catch-all.

New packets should use:

```text
research/cuda-bsfp/<experiment>/
  README.md
  manifest.json
  src/
  evidence/
```

BSFP recurrence, CUDA execution, reducer/normalizer, native qualification and solver-specific capacity/performance research belongs here. Shared questions about exact game-state quotienting, future-behavior equivalence, win-space representation and generic residual-class compilation belong first on `research/semantic-quotient` and are promoted here only after solver-specific acceptance.
