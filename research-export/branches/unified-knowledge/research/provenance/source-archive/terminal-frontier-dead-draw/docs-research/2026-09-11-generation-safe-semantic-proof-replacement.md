# Generation-safe semantic proof replacement qualification

**Date:** 2026-09-11  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Purpose

Qualify bounded shared semantic-proof replacement only after the corrected frontier engine demonstrated that retained proof publication alone fills the 8,388,608-entry append-only table.

The candidate is an 8-way set-associative table with:

- exact semantic descriptor comparison inside the selected bucket;
- generation-bearing proof handles;
- slot states shared by descriptor replacement and proof publication;
- non-exact proof records preferred as victims;
- rotated exact-proof victims only when all ways are exact;
- stale reads degrading to the default unknown proof `[-1,+1]`;
- stale publications becoming no-ops;
- generation wrap failing closed;
- append-only descriptor-term storage retained for this first experiment.

## Synthetic stale-handle control

A deliberately tiny one-bucket arena contained eight entries. All eight were made exact so replacement was forced to evict an exact record.

Observed:

```text
stale handle:       8
replacement handle: 16
entries:             8 / 8
replacements:        1
stale reads:         3
stale publications:  1
```

After eviction:

- the old descriptor no longer probed successfully;
- reads through its old handle returned the unknown proof state;
- a delayed `publishExact()` through that stale handle was rejected;
- the live replacement record remained exact draw;
- its move hint remained unchanged.

This directly exercises the race that ordinary slot-index replacement would make unsafe.

## Constrained exact-game control

A two-worker 4x5 connect-4 solve used only **4,096 shared proof entries**, making replacement unavoidable.

Root solve:

```text
root W/D/L:          draw
entry capacity:      4,096
shared replacements: 12,031
term IDs used:       87,372
```

Root-action solve after semantic-arena reset:

```text
actions:             [0,0,0,0]
shared replacements: 43,460
term IDs used:       243,422
worker tasks:         [29,22]
worker failures:      0
```

Exact root and action semantics therefore survived tens of thousands of concurrent replacements in a table substantially smaller than the proof working set.

## Interpretation

The generation handle is part of proof-resource lifetime safety, not semantic identity. Semantic equality remains exact descriptor content; generation only distinguishes physical incarnations of a slot.

Replacement is now qualified strongly enough for a standard-7x6 research rerun. The next unresolved resource question is descriptor-term lifetime. The current term arena is append-only, so repeated replacement consumes fresh descriptor-term storage even though the proof-entry table remains fixed-size.

That is deliberate for the first replacement experiment: entry replacement and descriptor reclamation are separate lifecycle problems and should not be conflated before measurement shows term storage is the next limiter.

## Qualification identity

Workflow run: `34671322460`  
Job: `103493085712`  
Executed head: `b6a9d59132b1f0c6572b52d65d70321e907aa9b2`  
Result: success.
