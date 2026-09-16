# Lookup timing attribution

Measured batch-function elapsed times, including callees:

| Function | Source entry | Mean ms |
|---|---|---:|
| tripleBatch | [run.mjs:139](run.mjs#L139) | 98.218 |
| pairBatch | [run.mjs:153](run.mjs#L153) | 147.864 |
| nativeBatch | [run.mjs:169](run.mjs#L169) | 80.554 |

Separate 1 ms sampling pass; ticks are sampled source attribution, not exact line latency. Comparator timings exclude this pass.

**Sampling limitation:** V8 attributed the synchronous work to the enclosing module with unknown line number. No usable hot-line samples were returned; the saved profile does not establish per-line costs.

| Function | Source | Ticks |
|---|---|---:|

