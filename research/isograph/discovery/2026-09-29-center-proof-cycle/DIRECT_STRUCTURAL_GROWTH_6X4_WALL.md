# Direct structural growth — 6x4 Connect-4 timeout wall

**Status:** bounded negative structural-growth evidence  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Producer head:** `fb8aa63ff6d571f52ff5050c4b14999f73b6e863`  
**Workflow:** `36555332049` — cancelled by job timeout  
**Canonicalizer:** refinement-partitioned exact tie search  
**Solved/outcome labels used by producer:** no  
**Physical board enumeration:** no

## Purpose

Measure width growth beyond the exact 5x4 control using the qualified
refinement-partitioned canonicalizer before attempting another scale increase.

The board has:

~~~text
width          6
height         4
cells         24
Connect-K      4
winning lines 24
~~~

The run used the compact direct residual-growth evaluator with nonterminal
frontier blocking and mover final-cap parity closure.

## Exact wall

The direct-growth step began at:

~~~text
2026-09-29T10:24:17.697Z
~~~

and GitHub cancelled it at:

~~~text
2026-09-29T10:34:19.345Z
~~~

after the workflow's ten-minute job limit.

Observed environment:

~~~text
Node                    v26.10.0
max old-space size      4096 MB
C4_WIDTH                6
C4_HEIGHT               4
C4_K                    4
refined column canon    enabled
~~~

The log contains:

~~~text
The operation was canceled.
~~~

No final JSON result was emitted, so the direct-state, edge, recursive-class,
frontier, and memory counts are **unknown** for this run.

This was not an observed OOM. The durable result is specifically a wall-time
limit under the declared GitHub-hosted configuration.

## Comparison with the completed 5x4 control

The matched partitioned 5x4 run completed in about 27.26 s. Therefore the 6x4
run required more than about 22x that wall time before being terminated:

~~~text
600 s / 27.26 s > 22x
~~~

This lower bound is an execution-economics observation, not a state-growth
factor. Without a completed 6x4 graph it cannot distinguish among:

- structural-state growth;
- residual-antichain processing;
- nonbinary/tied-column canonicalization work;
- hash/map/object overhead;
- interactions among those costs.

## Consequence for the next experiment

Do not rerun the same 6x4 representation unchanged.

Subsequent work derived exact binary-tie stabilizers directly from residual
incidence and began replacing binary tie-orientation enumeration with affine
GF(2) canonicalization. That is a material representation change and therefore
can justify a later 6x4 rerun **only after**:

1. exact 4x4 equivalence is qualified;
2. a completed 5x4 matched benchmark demonstrates the new canonicalizer's
   economics;
3. any remaining nonbinary fallback cost is measured.

A timeout is research evidence, not merely an infrastructure failure.

## Non-claims

This wall does not establish exponential generalized growth, does not prove
that canonicalization is the dominant 6x4 cost, and does not provide a 6x4
state count. It also has no gameplay-authority or production-solver effect.
