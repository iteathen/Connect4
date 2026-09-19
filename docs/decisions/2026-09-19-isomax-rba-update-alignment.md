# IsoMax alignment for research-coupled RBA/value closure

**Date:** 2026-09-19  
**Durable implementation branch:** `solver/isometric`  
**Canonical research owner:** `research/semantic-quotient`

## Decision

IsoMax remains the active forward structural exact solver. Its implementation update path must remain coupled to canonical research without freezing transient research mechanisms into solver identity.

The stable architecture is:

```text
ordinary gameplay identity
    q = support + normalized P0/P1 residuals

exact structural/proof consumers
    native frontier consequences
    + optional guarded proof/certificate facts

ordinary exact value consumer
    optional qualified q/RBA boundary closure

fallback/control
    recursive exact W/D/L
```

The RBA value path and the NDC proof path are distinct.

## Why this changes the 2026-09-18 framing

The earlier Isometric/IsoGraph realignment correctly identified q-shaped cache identity, contextual certificates and fail-closed temporal/resource guards. At that point, reducing unresolved residue was framed primarily as:

```text
qualify guarded obligation birth
-> close more states structurally
-> recurse on the rest
```

Subsequent post-1.1 RBA research has independently supplied an exact ordinary-value Bellman/residual-boundary algebra. Therefore guarded obligation birth is no longer the only non-recursive closure route.

No proof/value equivalence is claimed.

## Stable work that may proceed now

- explicit q gameplay-key API;
- proofIdentity/payload binding and collision rejection;
- direct q-congruence/cross-profile qualification;
- first-win/residual transition qualification;
- recursive backend retained as exact fallback/control;
- typed distinction among gameplay, value-boundary and proof/certificate facts.

## Research-fed work

Keep these replaceable and pinned to canonical research revisions:

- q/RBA value-boundary resolver;
- threshold/front representation;
- factor ordering and multiplication orientation;
- local-skyline and projection-tree evaluation;
- frontier/query cost model;
- stronger structural consequences;
- temporal/resource/realizability obligation birth;
- any move-order/planning policy derived from current research economics.

## Initial research pin

The first implementation comparison may consume:

`research/semantic-quotient@104abfbe4444fcd315ac807b46ce2be8da13df39`

as a reproducible known-good checkpoint.

That SHA is **not** a final design freeze. Before each meaningful value-boundary implementation unit, re-check the live canonical research successor for semantic or exact evaluation-law changes.

## Promotion discipline

A q/RBA value resolver is promoted only if:

- exact W/D/L and value-preserving moves match the retained exact controls;
- partial/incomplete boundary work never publishes a value;
- total economics improve or another material architectural benefit is demonstrated;
- q/value equality is not lifted into proof/certificate reuse;
- the exact canonical research revision/evidence consumed is recorded.

The recursive backend remains available until the replacement coverage/economics justify a later decision.

## Readiness

```text
IsoMax q-native state/transition core       READY
recursive exact fallback/control            READY
identity hardening (#64/#65/#66)            READY
q/RBA value-boundary consumer               READY FOR IMPLEMENTATION QUALIFICATION
NDC guarded-obligation proof seam (#67)     OPEN SIDE SEAM
empty-root nonrecursive closure             NOT CLAIMED
```
