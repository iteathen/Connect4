# Coverage-Mask and Fused-Hash Residual Transition Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34650758480`, job `103432106190`  
**Status:** exact and fully qualified; rejected on wall-clock

## Candidate

The qualified flat two-u32 residual kernel was modified with two implementation-only changes:

1. per-class residual coverage masks, allowing an own/block transition to return the same class in O(1) when the landing cell occurs in no residual term;
2. canonical class hashing fused into the existing filter/merge output pass instead of rescanning the output sequence afterward.

Search semantics, q identity, transition semantics, move ordering, tactical closure, and proof work were intentionally unchanged.

## Qualification

Against the qualified flat kernel, the candidate reproduced on every complete bounded control:

- complete reachable q-state count;
- terminal/nonterminal/illegal edge census;
- residual class count;
- every residual class ID's exact term sequence;
- every qID's support/P0-class/P1-class tuple;
- independent BSFP root W/D/L;
- independent BSFP per-root-action W/D/L;
- identical Negamax expansion and call counts.

Therefore timing differences are physical implementation differences, not semantic or search changes.

## Timing

Median total time:

| Geometry | flat v1 | coverage+fused v2 | v2 / v1 |
| --- | ---: | ---: | ---: |
| 4x3 c3 | **0.328 ms** | 0.371 ms | 1.129 |
| 4x4 c4 | **3.112 ms** | 3.864 ms | 1.242 |
| 5x3 c4 | 1.084 ms | **1.077 ms** | 0.994 |
| 4x5 c4 | **12.887 ms** | 13.400 ms | 1.040 |

The 4x5 root still performed 2,222 own no-op and 2,179 block no-op transitions, but avoiding those linear scans did not recover the added metadata/hash bookkeeping cost. The candidate regressed the governing complete proxy by about 4.0%.

## Interpretation

For the observed residual-class sizes, the existing flat linear scans are cheap enough that the extra coverage metadata access and fused-hash bookkeeping are not profitable. This is another case where reducing nominal work does not imply lower wall-clock.

Do not promote this candidate into the current fast kernel.

The result is retained as negative evidence. It may become relevant only if standard-7x6 class lengths become large enough to change the scan-vs-metadata crossover.

## Current baseline note

This experiment was performed on the flat two-u32 kernel. The branch has since advanced to the qualified u16 term-ID residual substrate, which is the stronger current representation candidate on the 4x5 proxy. Any future equivalent optimization must be re-derived against that term-ID substrate rather than assumed transferable from this result.
