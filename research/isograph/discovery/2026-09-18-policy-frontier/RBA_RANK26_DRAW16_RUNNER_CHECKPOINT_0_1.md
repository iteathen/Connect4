# RBA rank26 draw16 resumable runner checkpoint 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** execution substrate frozen; attempt 1 ready  
**Authority effect:** none  
**Semantic owner:** `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md`

## Target

```text
support       [3,3,2,0,6,6,6]
rank          26
target        draw16
shapes        40
bits          80
```

Required rank27 draw15 children:

```text
[4,3,2,0,6,6,6]   missing
[3,4,2,0,6,6,6]   previously closed
[3,3,3,0,6,6,6]   missing
[3,3,2,1,6,6,6]   missing
```

## Runner

Workflow:

`.github/workflows/rba-rank26-draw16.yml`

Exact evaluator:

`research/isograph/discovery/2026-09-18-policy-frontier/rba-draw-boundary-runner.mjs`

Invocation:

```text
--base 3,3,2,0,6,6,6
--stop-rank 26
```

The single parent cone contains 560 support fibers, so one shared cache naturally deduplicates all four child cones.

## Durability

Each runner support/action/product result is written into the local cache as soon as it closes.

Each bounded GitHub Actions attempt:

1. restores the newest cache matching `rba-rank26-draw16-`;
2. advances exact computation for at most 30 minutes;
3. treats exit 124 as a normal checkpoint rather than failure;
4. saves the resulting cache under a new immutable run key;
5. uploads a compact progress JSON/log artifact.

Thus a conversation/tool disconnect does not require replay from rank42.

## Semantics

This workflow changes no Bellman/RBA semantics.

It uses only the already-qualified exact evaluator:
- shared-target principal-cover recurrence;
- exact cofactor/action boundaries;
- static normalization;
- core absorption / trace / projection-tree staged product policy already implemented by the runner.

The checkpoint/cache is execution evidence, not logic authority.

## Completion condition

The attempt series is complete when:

`out/rba-rank26-cache/3_3_2_0_6_6_6.json`

exists and records the exact rank26 Upper/Lower boundary counts/hashes.

At completion:
- persist the three newly closed rank27 child counts/hashes;
- persist selected rank26 draw16 counts/hashes;
- independently replay/hash at least the final state Upper boundary and any practical final Lower reconstruction/control;
- update the RBA checkpoint/QU only if a new structural/evaluation law was discovered.
