# Connect4 RBA IsoGraph Topology Placement — 0.1

**Date:** 2026-09-18  
**Canonical branch:** `research/semantic-quotient`  
**Base authority:** Connect4 IsoGraph Logic Authority 1.1  
**RBA QU:** `RBA-QU-0001` / native node `430000`  
**Status:** post-1.1 successor topology overlay; not authority  
**Research direction:** Josh Oshiro

## Purpose

Place the structured RBA Quantifiable Unknown in the actual Connect4 IsoGraph semantic neighborhood rather than leaving it as a detached QU island.

This overlay does **not** assign speculative typed claim edges.

It distinguishes:

```text
known incidence / known participation
    !=
known relation kind
```

Where the participating endpoints are known but the exact relation is not, the **relation occurrence itself** is represented as an OPEN QU state.

## Native overlay vocabulary

The companion native overlay uses successor-local placement roles:

| Label | Role |
| --- | --- |
| `^97600` | RBA topology overlay record |
| `^97601` | overlay identity bytes |
| `^97602` | frozen base-authority manifest identity |
| `^97603` | semantic-region record |
| `^97604` | fixed region-member incidence |
| `^97605` | open relation-occurrence record |
| `^97606` | fixed relation endpoint incidence |
| `^97607` | endpoint-incidence-fixed marker |
| `^97608` | open relation-semantics marker/description |
| `^97609` | directionality-state description |
| `^97610` | relation constraint bytes |
| `^97611` | admissible future relation-kind candidate |
| `^97612` | excluded/unsupported relation interpretation |
| `^97613` | placement evidence/provenance reference |
| `^97614` | authority-effect/status record |

These labels are local to this successor overlay. They do not extend Core or authority 1.1.

## Placement

The current ordinary-value topology is represented as:

```text
RESIDUAL / FUTURE-BEHAVIOR REGION
    authority anchors:
        C4-R0008  behavior-preserving quotient contract
        C4-R0025  support + residual antichain exactness on bounded controls
        C4-R0026  direct semantic residual automaton exactness on bounded controls
        C4-R0068  exact support + complete player-labelled residual content
    post-1.1 evidence:
        standard-7x6 q congruence / conservative residual extension
                |
                |  OPEN RELATION RBA-REL-01
                |  endpoint incidence fixed
                |  exact relation kind partly unknown
                v
          RBA-QU-0001
       Residual Boundary Algebra
                |
                |  OPEN RELATION RBA-REL-02
                |  endpoint incidence fixed
                |  exact closure/basis relation unknown
                v
EXACT ORDINARY VALUE-BOUNDARY REGION
    post-1.1 evidence:
        support-local favorable order
        action-value threshold frontiers
        two-sided Upper/Lower recurrence
        residual-shape distributive lattice
        cofactor adjoints
        closed-blocker Lower dual
                |
                v
        exact strong action values
                |
                v
        exact best-move set
```

A separate unresolved side seam is:

```text
                RBA-QU-0001
                     |
                     |  OPEN RELATION RBA-REL-03
                     |  incidence fixed
                     |  relation type/direction partly unknown
                     v
PROOF / CONTROLLABLE-PREDECESSOR REGION
    C4-R0073  predecessor-closed support-local clause dictionary
    C4-R0074  bounded exact coverage/cofactor qualification
    C4-R0043  missing realizability-preserving closure law
    C4-R0069  missing observation-relative controllable predecessor
    C4-R0076  missing compact clause-to-value predecessor seam
```

The side relation does **not** state that RBA equals, derives from, refines, or closes those missing-law claims.

## Region nodes

This overlay introduces successor-local region nodes only for placement.

```text
431000  residual/future-behavior region
431010  exact ordinary value-boundary region
431020  proof/controllable-predecessor region
430000  existing RBA QU state
```

The region nodes are organizational semantic neighborhoods, not new game laws.

## Fixed anchor membership

### Residual / future-behavior region — 431000

Existing authority claim nodes:

```text
100008  C4-R0008
100025  C4-R0025
100026  C4-R0026
100068  C4-R0068
```

Post-1.1 evidence remains evidence, not frozen authority:

- `STANDARD_7X6_Q_CONGRUENCE.md`
- `ABSTRACT_RESIDUAL_CONSERVATIVE_EXTENSION.md`
- `COFACTOR_UPSET_ADJOINT_CHECKPOINT.md`

### Exact ordinary value-boundary region — 431010

Current post-1.1 evidence:

- `SUPPORT_LOCAL_ACTION_VALUE_ISOTONY.md`
- `TWO_SIDED_BOUNDARY_PROPAGATION_CHECKPOINT.md`
- `RANK33_LATTICE_BOUNDARY_CHECKPOINT.md`
- `COFACTOR_UPSET_ADJOINT_CHECKPOINT.md`
- `CLOSED_BLOCKER_LOWER_DUAL_CHECKPOINT.md`

This region is deliberately post-1.1 research structure. It is not promoted into frozen authority merely by this placement.

### Proof / controllable-predecessor region — 431020

Existing authority/successor anchors:

```text
100073  C4-R0073
100074  C4-R0074
100043  C4-R0043
100069  C4-R0069
100076  C4-R0076  post-1.1 successor overlay
```

C4-R0076 is successor-only and remains a missing-law claim.

## Open relation occurrence RBA-REL-01

**Endpoints fixed:**

```text
431000 residual/future-behavior region
430000 RBA QU
```

**Existence/participation:** fixed in this research information state.

**Open relation semantics may include, if later proved:**

- representation / factorization;
- sufficient-observation relation;
- quotient/embedding relation;
- algebra carrier/interface;
- Galois/adjoint interface;
- another exact relation not yet classified.

**Already constrained:**

- the relation must preserve ordinary exact future/value behavior;
- it cannot erase first-win stopping;
- it cannot upgrade ordinary value equivalence to proof/history identity;
- it cannot treat an abstract residual pair as legal q without the applicable exact restriction theorem.

## Open relation occurrence RBA-REL-02

**Endpoints fixed:**

```text
430000 RBA QU
431010 exact ordinary value-boundary region
```

**Existence/participation:** fixed in this research information state.

**Open relation semantics may include, if later proved:**

- algebraic generation;
- closure;
- fixed-point semantics;
- transfer/composition;
- threshold-boundary realization;
- another exact relation not yet classified.

**Already constrained:**

- resulting state/action values must be exact;
- threshold boundaries must preserve the strong-score order;
- no solved database outcome may enter as a theorem premise;
- implementation schedule is not itself the relation.

## Open relation occurrence RBA-REL-03

**Endpoints fixed:**

```text
430000 RBA QU
431020 proof/controllable-predecessor region
```

**Existence/participation:** fixed only at the level that the unresolved proof/value seam is structurally relevant to RBA completion.

**Relation type, orientation, and strength remain OPEN.**

Admissible future resolutions may establish, for example:

- a bridge;
- a projection;
- a refinement relation;
- a factorization relation;
- a one-way consequence relation;
- a scoped equivalence under an ordinary-value view;
- a proof/value separation theorem showing only a weaker interface.

The following are **not** currently established:

```text
RBA == C4-R0076
RBA derived_from C4-R0076
RBA refines C4-R0069
RBA closes C4-R0043
C4-R0043 == C4-R0069 == C4-R0076
proof carrier == ordinary-value carrier
```

## Why this is the correct region

The research trajectory repeatedly localized accidental combinatorial explosion **before** ordinary value collapse:

```text
fine ownership / distributed proof alternatives
    -> residual/q semantic collapse
    -> value-boundary algebra
```

RBA is the still-open algebraic structure governing that middle-to-value transition.

Therefore it belongs neither:

- above the game rules as a new primitive;
- below the best-move output as an implementation;
- inside solver ontology;
- inside proof/certificate identity;
- detached in a generic uncertainty region.

It belongs in the unresolved structural gap between the exact residual/future-behavior carrier and the exact value-boundary consequences, with an explicitly open side interface to the proof/predecessor region.

## Relation-promotion rule

This overlay introduces **open relation occurrences**, not typed authority edges.

A future refinement may fix a relation type only after the relation itself receives the required deductive or guarded-exact proof.

Until then:

```text
fixed endpoints
+ OPEN relation semantics
!=
promoted typed edge
```

## Reconnect marker

```text
RBA node
    430000

semantic placement
    431000 residual/future-behavior
        -- RBA-REL-01 OPEN -->
    430000 RBA
        -- RBA-REL-02 OPEN -->
    431010 exact ordinary value-boundary

side seam
    430000 RBA
        -- RBA-REL-03 OPEN --
    431020 proof/controllable-predecessor

next structural work
    refine relation QUs only when new proof/evidence narrows their admissible relation families
```

## Authority effect

```text
authority 1.1 mutated             NO
typed relation promoted           NO
RBA topologically detached        NO
unknown relation structure kept   YES
```
