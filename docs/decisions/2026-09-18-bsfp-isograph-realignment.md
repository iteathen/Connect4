# CUDA-BSFP realignment after IsoGraph / NEI discovery

**Date:** 2026-09-18  
**Durable implementation branch:** `solver/cuda-bsfp`  
**Canonical research owner:** `research/semantic-quotient`

## Verdict

The current BSFP solver architecture remains **correct in W/D/L semantics** under its qualified controls.

The new IsoGraph/NEI work does not expose an incorrect BSFP recurrence. It exposes an **outdated semantic boundary** in the branch specifications:

1. ordinary gameplay identity and stronger proof/certificate context were described too broadly as one structural-state identity;
2. P2's physical ownership-antichain representation was not explicitly distinguished from the smaller q future-behavior identity;
3. NDC described the closure architecture without naming the now-isolated guarded-obligation-birth law as its active incompleteness boundary.

P2 is therefore conservative rather than unsound:

~~~text
physical ownership/frontier identity
    finer than
ordinary future-behavior q identity
~~~

Keeping the finer representation can waste proof/frontier work but does not lose correctness.

## Canonical gameplay identity consumed by BSFP

For ordinary legal future behavior, current canonical research gives the candidate key:

~~~text
q =
    support
    + normalized P0 residual antichain
    + normalized P1 residual antichain
~~~

Side to move is derivable from support rank under standard alternating no-pass play.

The q-congruence derivation indicates that equal q fixes legal actions, immediate terminal results, and every nonterminal successor q.

That result must not be overextended.

## Required identity separation

~~~text
GameplayKey:
    q

RepresentationKey:
    exact profile-specific physical/symbolic record

ProofKey:
    q
    + proof profile
    + every non-q premise needed by the published fact
~~~

Examples of non-q proof context include blockers, reserved responses, deadlines, race premises, NDC certificate identity, and proof provenance when they are not exactly derivable from q.

## Spec changes made on this branch

- C4-0006 now distinguishes gameplay q identity from proof context.
- C4-0007 now distinguishes q from NDC closure state and records guarded obligation birth as the current missing composition seam.
- C4-0008 now defines typed gameplay/representation/proof identities.
- C4-0009 now requires CUDA items/equality operations to declare their identity profile.
- P2 now explicitly identifies ownership masks/frontiers as a finer exact representation rather than canonical gameplay identity.
- P2 now proposes a measured q-native successor comparison instead of assuming q is faster.
- P2's 7x6 Win entry is clarified as an independent expected/oracle value, not evidence that the current P2 7x6 attempt completed.

## Open implementation issues

- #60 — qualify q-native frontier identity against P2 ownership-antichain baseline.
- #61 — separate q gameplay equality from proof/certificate identity in caches and dedup.
- #62 — derive and qualify symbolic predecessor operations directly over q.
- #63 — implement guarded obligation-birth seam without hiding recursion.

All target `solver/cuda-bsfp`.

## Non-changes

This realignment does not:

- claim a completed 7x6 P2 solve;
- replace P2 before a measured exact comparison;
- move BSFP semantics into CUDA-Algorithms;
- promote the q-congruence research candidate into frozen IsoGraph authority;
- authorize recursive minimax/search fallback;
- claim the guarded-obligation calculus is already complete.

## Current architectural target

~~~text
q ordinary gameplay semantics
        |
        +-- exact symbolic q regions / predecessor closure
        |
        +-- optional stronger NDC ProofKey context
        |
        v
BSFP W/D/L fixed point

P2 ownership-antichain recurrence
    = exact finer-representation control during migration/measurement
~~~

The practical question is now not whether P2 is correct. It is how much q-native canonicalization and q-native symbolic predecessor algebra can reduce P2's proof/frontier work without costing more than they save.
