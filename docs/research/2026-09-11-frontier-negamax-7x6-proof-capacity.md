# Standard 7×6 frontier-Negamax proof-capacity result

**Date:** 2026-09-11  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Purpose

Re-run the standard empty-root forward W/D/L attempt only after removing the conventional execution assumptions identified in the frontier-conformance audit.

This attempt used:

- dynamic player-relative live-winning-line frontier ordering;
- one-sided WSL exhaustion bounds;
- forced-response macro normalization before unresolved decision depth;
- shared semantic proof lookup without allocation on read;
- allocation only on retained proof publication;
- incremental sibling completion with non-interrupting detach after parent cutoff;
- Branch Manager execution role, with autonomous structural exploration deliberately disabled for this isolation run.

Configuration:

```text
search workers:          3
available logical lanes: 4
split depth:             8 unresolved decision nodes
root threshold:          [0,1]
TT entry capacity:       8,388,608
TT term-ID capacity:     460,000,000
prebuilt global graph:   none
autonomous explore:      off
```

The numeric depth 8 is a comparison control only. Its meaning differs from the historical attempt because forced transit no longer increments decision depth.

## Result

The root remained unresolved and the shared proof-entry table reached its exact fixed capacity:

```text
elapsed to failure:    238.54 s
TT entries:            8,388,608 / 8,388,608
term IDs used:        99,025,439 / 460,000,000
process RSS:          ~4.47 GB
root W/D/L:           unresolved
```

Failure was an attempted exact proof publication into a full semantic table.

The descriptor term arena was only about 21.5% consumed. The first shared-proof resource limiter is therefore retained proof-entry count, not descriptor-term capacity.

## Open-addressing saturation cliff

Progress showed a severe slowdown before the final capacity exception:

```text
15 s   6,014,321 entries
30 s   8,340,565 entries
45 s   8,369,757 entries
90 s   8,382,178 entries
150 s  8,386,680 entries
210 s  8,388,195 entries
225 s  8,388,514 entries
238 s  8,388,608 entries -> failure
```

Thus the append-only linear-probe table becomes pathological well before the final exception. From roughly 30 seconds onward, almost all additional wall time was spent admitting the final ~48K proof records into an almost-full table.

## Search-shape evidence

At failure the shallow coordinator had only:

```text
67 local q states
134 residual classes
25 shallow decision expansions
42 leaf tasks
41 scout tasks
4 coordinator proof admissions
```

The heavy proof work was in the search workers:

```text
worker calls:       12,407,875
worker expansions:   4,137,272
worker assignments: [13,15,14]
```

Sixteen sibling scout tasks had been detached from parent critical paths after cutoffs; they were not interrupted.

The run therefore did not fail because the coordinator/global work-DAG grew large. It failed because exact worker proof publication continued to produce more retained semantic proof records than the append-only table can admit.

## Interpretation

The earlier warning against prematurely implementing TT replacement has now been resolved by direct evidence.

The old 8.39M saturation result was ambiguous because every proof lookup allocated a semantic entry. This corrected run does **not** allocate on ordinary lookup. The table still reaches full capacity from retained proof publication alone.

Therefore bounded exact replacement/reclamation is now justified by the frontier engine's measured behavior rather than by conventional TT design habit.

The required correctness property is stronger than ordinary replacement:

- a stale proof handle from an evicted semantic identity must never read proof for the replacement identity;
- a delayed publication through a stale handle must never modify the replacement record;
- replacement must be mutually exclusive with concurrent proof publication;
- semantic equality remains exact descriptor equality, never hash equality;
- generation wrap must fail closed rather than alias an ancient handle;
- workers continue to access the table locally/shared-memory without per-node Branch Manager RPC.

A set-associative fixed-capacity table with generation-bearing proof handles is the next measured candidate.

Descriptor storage can remain append-only for the first replacement experiment because the current term arena has substantial headroom; descriptor reclamation is a separate lifecycle problem and must become explicit if term capacity later becomes the limiter.

## Qualification identity

Workflow run: `34670736675`  
Job: `103491484871`  
Executed head: `768be407394848289601c0343eebe6fa3959e1ad`  
Result: expected research failure — exact proof-entry capacity exhausted before root proof.
