# CPC close-only exact-draw fusion — realization V1 result

**Date:** 2026-09-27 author-local  
**Status:** V1 realization rejected as a production optimization; semantic lead remains open for value-only realization  
**Implementation repo:** `iteathen/JSMinSys`  
**Implementation PR:** #95  
**Frozen control:** `e449df20dc59cc6c1e5b2da78134751a2376f355`

## Mechanism tested

After an already-verified local search-derived weak row survives its immediate
cutoff check, CPC is already evaluated on the same q.

V1 added:

~~~text
local LOWER0 + CPC UPPER0 -> exact draw
local UPPER0 + CPC LOWER0 -> exact draw
~~~

General CPC weak storage remained disabled.

V1 promoted the draw through the ordinary exact-store path:

~~~text
storeConnect4RbaExactCacheSlot32(...)
~~~

which rewrites the local full q key/stamp and optionally publishes shared exact.

## Correctness

TDD RED:
- JSMinSys run `36380868256`;
- 14 existing CPC alpha-beta tests passed;
- the new close-only assertion alone failed because zero promotions were
  observed.

GREEN:
- the same solver-level test passed after implementation;
- independent 4x4 oracle WDL/move remained unchanged.

Full JSMinSys Verify:
- run `36381783145`;
- catalog/NEES PASS;
- generated behavior PASS;
- generated root-frontier PASS;
- root-frontier audit PASS;
- runtime geometry audit PASS;
- full tests PASS;
- benchmark smoke checks PASS;
- node compatibility/schema PASS.

## First four-block 4-worker screen

Workflow:
- run `36382047162`;
- artifact `10952872523`;
- digest `sha256:a8e18cd7d1f0f6b84d9aba1e8b2d3e2a777ec903bbb118cca6ed0c4a0464489f`.

Topology:
- hosted Windows;
- availableParallelism = 4;
- worker 0 wide/root-frontier;
- workers 1..3 deep;
- no single-worker qualification.

Completed exact `353335714`, four balanced blocks:
- both arms 4/4 exact;
- identical root WDL -1 / move 4;
- V1 process cycles: **-0.918%**;
- 95% interval: **[-1.993%, +0.157%]**;
- nodes: -1.060%, interval crosses zero;
- cycles/node: +0.145%, interval crosses zero;
- shared stores: -0.545%, 95% interval below zero.

This was suggestive but not promotion-grade.

Official-hard `35333571`:
- both arms timed out at unchanged 120-second ceiling;
- V1 descriptive fixed-window cycles: -1.313%;
- nodes: -1.930%;
- cycles/node: +0.629%.

No exact hard solve ratio is admissible.

## Eight-block exact confirmation

Workflow:
- run `36382508117`;
- artifact `10952613302`;
- digest `sha256:e612e80430f45d1a01ee5a339b80b6a6db3839aa9ac4fc5d6809a0dae6cf27f9`.

Completed exact `353335714`, eight balanced blocks / 16 processes:
- both arms 8/8 exact;
- identical root WDL -1 / move 4.

V1 versus frozen control:

~~~text
process cycles      +0.068%
95% interval        [-0.642%, +0.779%]

nodes               -0.294%
95% interval        [-0.767%, +0.178%]

cycles/node         +0.363%
95% interval        [+0.084%, +0.641%]

shared hits         +1.337%
95% interval        [+0.558%, +2.117%]

shared stores       -0.051%
95% interval        [-0.489%, +0.387%]

shared contention   -2.540%
95% interval        [-5.121%, +0.041%]
~~~

## Disposition

`V1_REJECTED_AS_PRODUCTION_OPTIMIZATION`

The exact proof rule is sound, but V1 does not improve completed whole-solve
cycles.

The result contains a useful clue rather than terminating the structural lead:

- the q was already full-key verified by the weak local probe;
- the semantic transition is only weak proof -> exact draw at the **same q**;
- V1 nevertheless calls the generic exact-store path;
- that path republishes the entire q key and stamp before storing exact value.

This is representation work with no semantic identity change.

## V2 lead — value-only in-place exact promotion

For a verified local weak row and opposite CPC weak evidence:

~~~text
cache.value[slot] = exact draw
~~~

is sufficient for the private same-q proof transition.

Retain:
- optional existing shared-exact publication;
- full q validation already performed by the local probe;
- exact-only shared semantics;
- all CPC/search correctness rules.

Remove on this transition:
- local full-key republication;
- local stamp rewrite.

This is not a new semantic theorem. It is the minimum realization of the
already-proved same-q proof refinement.

V2 must receive its own NEES accounting and completed exact A/B before any
promotion.


## V2 — value-only in-place exact promotion

V2 removed the V1 representation redundancy.

For a verified same-q local weak row, exact-draw promotion became:

~~~text
cache.value[slot] = exact draw
~~~

with:
- no local key republication;
- no local stamp rewrite;
- optional existing shared-exact publication retained;
- full shared key/sequence validation unchanged.

Full JSMinSys Verify:
- run `36382971575`;
- PASS.

Eight-block exact confirmation:
- run `36382971576`;
- artifact `10952673645`;
- digest `sha256:71891b328eb1db6e498061835cdac5c46344b115f5deb61ca6c1b46baf4f0d21`;
- hosted Windows, 4 workers, 1 wide + 3 deep;
- all 16 processes exact;
- root WDL -1 / move 4 unchanged.

V2 versus frozen control:

~~~text
process cycles      +0.021%
95% interval        [-0.596%, +0.638%]

nodes               -0.241%
95% interval        [-0.776%, +0.293%]

cycles/node         +0.263%
95% interval        [-0.065%, +0.591%]

shared hits         +1.464%
95% interval        [+0.920%, +2.007%]

shared stores       -0.049%
95% interval        [-0.296%, +0.198%]
~~~

## Final lead disposition

`CPC_CLOSE_ONLY_REJECTED_AS_WHOLE_SOLVE_OPTIMIZATION`

The exact proof refinement is correct and V2 removes the obvious redundant
local-key work, but neither realization demonstrates a completed exact
whole-solve cycle improvement.

This is useful negative evidence:

- opposite CPC weak closures occur and can reduce some search work;
- the effect is too small to pay reliably for the extra close-only control path;
- additional shared exact hits do not produce a measurable net win here.

Do not carry CPC close-only into the preferred production path.

The semantic six-state proof-refinement model remains valid and continues to
motivate diagnostics that target **stutter work** without adding per-node
proof checks.
