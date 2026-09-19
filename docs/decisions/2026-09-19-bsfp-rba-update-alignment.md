# BSFP specification alignment for the post-P2 RBA update pass

**Date:** 2026-09-19  
**Durable implementation branch:** `solver/cuda-bsfp`  
**Canonical research owner:** `research/semantic-quotient`  
**Supersedes for current routing:** implementation assumptions in the 2026-09-18 BSFP/IsoGraph realignment where later RBA research has narrowed the ordinary-value seam.

## Decision

CUDA-BSFP is ready for an implementation update pass **after this specification alignment**, with P2 retained unchanged as the exact baseline.

The update pass must distinguish three things:

```text
ordinary gameplay/value carrier
    q / support-local residual fiber

ordinary exact value evaluation
    C4-0008 Bellman fixed point
    candidate RBA boundary-native realization

stronger proof/certificate carrier
    optional C4-0007 NDC context
```

The C4-0007 guarded-obligation/proof-value bridge is not a prerequisite for an ordinary exact W/D/L implementation.

## Authority boundary

Frozen Connect4 IsoGraph authority 1.1 remains unchanged.

The current post-1.1 RBA overlay/QU/topology and late-rank exact checkpoints on `research/semantic-quotient` are successor research evidence. They may be consumed by an experimental BSFP profile only when the exact revision/evidence is pinned and independently qualified. They do not silently become Accepted specification authority.

## What changed since the 2026-09-18 realignment

The earlier realignment correctly separated q gameplay identity, P2 representation identity and NDC proof identity. It still described the q-native predecessor algebra as something to derive and the guarded-obligation seam as the active closure gap.

Subsequent RBA research has now supplied an exact candidate ordinary-value algebra:

```text
support-conditioned residual distributive lattice
-> terminal-extended cofactor adjunction
-> W/D/L threshold fronts
-> antichain-semiring Bellman composition
-> exact local skyline / projection pruning evaluation
```

The proof/value bridge remains OPEN separately.

## Implementation roles

### P2

P2 remains exact under its qualified controls and remains the finer ownership-antichain baseline. Do not delete or silently morph it during the update.

### q/RBA candidate profile

The new ordinary-value candidate should be implemented adjacent to P2 and compared on identical controls. It should reuse the exact q/residual semantics and boundary algebra rather than re-deriving a new solver abstraction.

Initial qualification should prove:

- exact terminal/first-win agreement;
- exact child/predecessor boundary agreement on persisted controls;
- exact root W/D/L on complete small games;
- identity-profile correctness;
- factor-order/orientation invariance;
- projection-pruning invariance;
- no Cartesian truncation;
- rank/support completion;
- honest capacity/yield/failure states.

### NDC

NDC remains available for stronger proof/certificate acceleration. Its guarded-obligation seam is a side seam. Do not block ordinary-value work on it and do not attach NDC facts to q without their non-q premises.

## CUDA ownership

Connect4 owns residual/value order, cofactors, Bellman factor semantics, exact boundary equality and dominance.

CUDA-Algorithms should own consumer-neutral scalable mechanisms when generalized: segmented normalization, scan/group/unique/compaction, subset/superset antichain operations, or projection-tree traversal where the contract can be made domain-neutral.

CUDA-JS continues to own runtime/compiler/device-memory/execution lifecycle.

## Readiness disposition

```text
P2 exact baseline                         READY
BSFP W/D/L semantics                     READY
identity profile separation              READY
ordinary-value RBA research candidate    READY FOR IMPLEMENTATION QUALIFICATION
NDC proof/value bridge                    OPEN SIDE SEAM
empty 7x6 root                            UNSOLVED
current-head qualification refresh        REQUIRED BEFORE PROMOTION
```

The update pass should begin with a bounded q/RBA reference/profile comparison against P2, not by optimizing the old P2 representation further and not by implementing the proof-value bridge first.
