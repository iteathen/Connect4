# Minimax research

This is the canonical namespace for **new** minimax/negamax/alpha-beta research packets on `solver/minimax-alpha-beta`.

Historical prototypes and evidence remain in their original committed `reference/research-prototypes/` and `docs/research/` paths for reproducibility. Do not move or duplicate them mechanically and do not add new experiments to the historical catch-all tree.

New experiment packets should use:

```text
research/minimax/<experiment>/
  README.md
  manifest.json
  src/
  evidence/
```

Search-policy, TT, scheduling, alpha-beta proof order and minimax-specific implementation research belongs here. Shared questions about the minimum exact game state, behavioral equivalence, win-space quotienting and support sufficiency belong first on `research/semantic-quotient` and are promoted here only when the experiment is specifically about alpha-beta consumption/performance.
