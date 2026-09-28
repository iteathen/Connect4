# Candidate plan — CPC close-only exact-draw fusion

**Status:** highest-priority new DP/DTS experiment  
**Date:** 2026-09-27 author-local  
**Semantic owner:** `research/semantic-quotient`  
**Implementation owner:** `iteathen/JSMinSys` if executed

## Exact implementation baseline

Current coalesced + shared-exact-draw branch:

`iteathen/JSMinSys@e449df20dc59cc6c1e5b2da78134751a2376f355`

Branch:

`experiment/isomax-phase2-bound-coalesce-shared-20260927`

Relevant alpha-beta blob:

`addons/rba-connect4-alphabeta.mjs`
blob `23609966207f427e50488fd154696d5d340ecddd`.

Current local proof codes:

~~~text
exact absolute W/D/L: 1,2,3
LOWER0:              4
UPPER0:              5
~~~

The current probe verifies the full q key before returning a local weak code.

## Existing source order

Inside `searchCpcOnly`:

~~~text
compute q hash/slot
-> full-key local probe
-> consume LOWER0/UPPER0 for immediate cutoff or alpha/beta tightening
-> evaluate CPC on the same q
-> convert CPC absolute interval to mover-relative [semanticLo,semanticHi]
-> CPC exact / cutoff / tighten
-> search
~~~

Therefore CPC is already computed on every local weak hit that did not itself
cut off.

## Exact discovery

For mover-relative WDL:

~~~text
LOWER0 = {0,+1}
UPPER0 = {-1,0}
~~~

so:

~~~text
LOWER0 ∩ UPPER0 = {0} = exact draw.
~~~

Current same-source search/search coalescing already exploits this relation
when a later weak store meets an opposite local weak row.

The new case is cross-source:

~~~text
existing search-derived local weak
+
already-computed opposite CPC interval
->
exact draw.
~~~

## Candidate B — close-only CPC fusion

Do **not** restore general CPC weak-bound stores.

After CPC exact handling and after the CPC interval has been converted to
mover-relative `semanticLo/semanticHi`, but before ordinary CPC cutoff return:

~~~text
if local cached proof is LOWER0
and CPC establishes semanticHi == 0
and CPC is not already exact:
    same q is exact draw

if local cached proof is UPPER0
and CPC establishes semanticLo == 0
and CPC is not already exact:
    same q is exact draw
~~~

Then:

1. promote the current local full-q row to exact absolute draw code `2`;
2. use the existing exact local store/publication path;
3. allow the already-qualified shared-exact sampling/publication rule to
   publish the newly exact draw;
4. return mover-relative zero.

No CPC weak value is stored when:

- there is no existing local weak row;
- CPC supplies the same weak direction;
- the local probe missed;
- the local slot holds another q;
- CPC supplies no applicable opposite threshold.

## Why this is different from the rejected CPC-bound experiment

Prior CPC-bound realization wrote CPC weak evidence broadly.

Its economics were poor:

- search-derived bounds produced the dominant gain;
- CPC weak stores added pressure;
- combined search+CPC behavior did not improve the completed tree enough to
  justify that pressure.

Close-only fusion has a different transition contract:

~~~text
CPC weak observation
    is persisted only when
    it immediately converts an already-resident weak q
    into exact information.
~~~

No new weak CPC row is created.

## Mechanical counters first

Before timing, add source-specific counters:

~~~text
localWeakBeforeCpc
cpcOppositeWeakClosure
cpcSameWeakStutter
cpcWeakNoLocal
cpcExactWithLocalWeak
cpcCloseSharedPublish
cpcCloseContradiction
~~~

`cpcCloseContradiction` MUST remain zero.

If opposite closures are negligible, reject before a larger benchmark.

## Correctness controls

Required:

1. enumerate all six WDL interval states against CPC evidence using
   `wdl-proof-refinement-control.mjs`;
2. directed narrow-window positions where local LOWER0 + CPC UPPER0 closes draw;
3. dual UPPER0 + CPC LOWER0;
4. same-direction weak evidence remains weak and does not become exact;
5. CPC exact continues through the existing exact path;
6. full-q collision control: hash match with unequal q must never coalesce;
7. mover/sign and forced-tail controls;
8. exact root WDL/move agreement.

## Performance screen

No single-worker run.

Primary reduced GitHub profile:

~~~text
4 search workers
1 wide/root-frontier
3 deep
rootFrontier=true
shared exact 4M
local exact 1M/worker
full sharing
~~~

A:
current coalesced+shared exact-draw winner.

B:
A + CPC close-only fusion.

Primary completed exact fixture:
`353335714`, balanced paired blocks, process cycles primary.

Secondary:
official hard `35333571`, unchanged fixed ceiling; report censored metrics unless
both arms complete.

Record:

- process cycles;
- wall;
- nodes/cofactors;
- local weak hits;
- opposite CPC closures;
- exact-draw promotions;
- shared exact hits/stores/contention;
- per-worker work.

## NEES requirement

If implemented in JSMinSys, every added/removed hot operation updates the cycle
ledger in the same change.

Charge:

- weak-code direction tests;
- semantic interval endpoint test;
- branch/control cost;
- exact promotion path;
- any publication operations.

Do not treat a branch as free merely because the semantic rule is exact.

## Promotion / rejection rule

Promote only if:

- correctness gates pass;
- contradiction counter is zero;
- whole exact-solve cycles improve on the completed control;
- hard-window evidence is directionally compatible.

Reject if the closure rate is too small or hot-loop realization cost outweighs
the newly exact draws.
