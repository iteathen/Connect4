# Standard 7×6 replacement run — descriptor lifetime becomes the limiter

**Date:** 2026-09-11  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Purpose

Re-run the corrected standard-7x6 forward W/D/L root proof with the qualified 8-way generation-safe shared proof replacement table, holding the previous search configuration fixed.

## Result

Generation-safe entry replacement removed the former fixed-entry/open-addressing failure. The run continued through more than **30.9 million** shared proof replacements without a stale-handle or proof-corruption failure.

The next limiter was the still-append-only descriptor-term arena:

```text
elapsed to failure:      149.46 s
live proof entries:      8,388,606 / 8,388,608
shared replacements:    30,969,854
term IDs used:         459,999,997 / 460,000,000
root W/D/L:             unresolved
RSS at failure:          ~15.42 GB
```

The failing publication requested 28 more term IDs than remained:

```text
semantic TT term arena exhausted: 460000025 > 460000000
```

## Progress shape

```text
15 s   entries 3.55M   replacements    13K   terms  39.8M   RSS  2.36 GB
30 s   entries 6.98M   replacements   995K   terms  93.2M   RSS  4.64 GB
45 s   entries 8.13M   replacements  4.13M   terms 144.3M   RSS  6.47 GB
60 s   entries 8.35M   replacements  7.94M   terms 191.6M   RSS  7.91 GB
75 s   entries 8.38M   replacements 11.83M   terms 237.3M   RSS  9.62 GB
90 s   entries 8.39M   replacements 16.64M   terms 292.5M   RSS 11.03 GB
105 s  entries 8.39M   replacements 20.02M   terms 332.3M   RSS 12.67 GB
120 s  entries 8.39M   replacements 24.81M   terms 387.8M   RSS 14.20 GB
135 s  entries 8.39M   replacements 28.88M   terms 436.0M   RSS 15.31 GB
149 s  entries 8.39M   replacements 30.97M   terms 460.0M   RSS 15.42 GB -> failure
```

The old pathological linear-probe cliff is gone. Replacement throughput continues after the table becomes full. The remaining shared-descriptor design defect is lifetime: descriptor terms are allocated per physical incarnation even though the containing proof slot is being reused.

## Search shape at failure

```text
coordinator local q states:     139
coordinator residual classes:   278
shallow decision expansions:     55
leaf tasks issued:              102
worker calls:            67,965,982
worker expansions:       23,010,437
detached scout tasks:            63
```

The root remained in the first `[0,1]` win-threshold proof.

## Next ownership correction

Descriptor storage should follow the lifecycle of the **physical proof slot**, not the number of semantic identities that have occupied it.

Candidate:

- each physical proof slot owns a reusable descriptor-term span;
- replacement may overwrite the existing span while the slot is in descriptor-writing state;
- if the new descriptor fits, no new term allocation occurs;
- only a descriptor larger than the slot's current span grows/reallocates that slot;
- generation still changes on every replacement, so old proof handles remain stale;
- lock-free probes that overlapped replacement reject on the existing status/generation recheck.

This avoids introducing a general concurrent variable-size free-list before evidence requires one. Storage growth approaches the maximum descriptor footprint demanded by each physical proof slot rather than cumulative replacement count.

RSS growth is also now material and must be measured independently. Shared descriptor span reuse may remove a large component of physical page growth, but worker-local quotient/class/descriptor state may become the next limiter. Future root telemetry should therefore include worker-local state/class high-water marks.

## Qualification identity

Workflow run: `34671380474`  
Job: `103493240621`  
Executed head: `7d7012dba394ebf322c7d88523a6cb8750320830`  
Result: expected research failure — append-only descriptor-term capacity exhausted after generation-safe proof replacement removed the entry-count limiter.
