# Cross-layer synthesis route

Use this file as the stable entry point when work must combine Connect4 structural logic with solver/runtime optimization.

Research direction / structural architecture: **Josh Oshiro**.  
Formalization / implementation / qualification: **OpenAI ChatGPT**.

## Read first

1. [`2026-09-15-cross-layer-logic-code-synthesis-protocol.md`](2026-09-15-cross-layer-logic-code-synthesis-protocol.md) — durable method for loading logic research, code/performance research, and live implementation together and matching structural isomorphs across them.
2. [`RESEARCH_INDEX.md`](RESEARCH_INDEX.md) — routes the primary theorem/evidence corpus and negative controls.
3. Repository-root `STATUS.md` and `next_step.yaml` — current state/proof seam.

## Current continuity handoff

For the terminal-frontier / structural-search optimization campaign:

- [`2026-09-15-terminal-frontier-search-optimization-handoff.md`](2026-09-15-terminal-frontier-search-optimization-handoff.md)
- [`2026-09-15-terminal-frontier-search-optimization-handoff-prompt.md`](2026-09-15-terminal-frontier-search-optimization-handoff-prompt.md)

A future handoff may replace these as current continuity evidence. The synthesis protocol itself should remain durable unless superseded by a better explicit method.

## Non-negotiable workflow

Do not optimize from the implementation alone.

Before meaningful mutation:

```text
logic/theorem research
        +
code/performance research
        +
live implementation read line-by-line
        |
        v
explicit correspondence/isomorph map
        |
        v
small attributable experiment
        |
        v
qualification + cleanup/documentation
```

The purpose is to recognize when theorem-side and runtime-side structures are the same relation in different representations, so exact/precompiled facts can be produced once and reused across terminal classification, move ordering, TT/proof retention, Branch Manager scheduling, or other consumers without inventing unsupported W/D/L claims.
