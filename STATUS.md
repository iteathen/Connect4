# Connect4 Semantic-Quotient Research Status

**Updated:** 2026-09-10  
**Canonical branch:** `research/semantic-quotient`  
**State:** active cross-solver research

## Mission

Find the smallest exact, efficiently updatable description of the remaining Connect Four game. This branch owns solver-neutral research into future-behavior equivalence, win-space reduction, support/accessibility sufficiency, identified-line quotients, residual classes, canonical transitions and practical minimum-description representations.

It does **not** own the minimax/alpha-beta solver implementation or the CUDA-BSFP solver implementation. Those remain on:

- `solver/minimax-alpha-beta`
- `solver/cuda-bsfp`

## Starting evidence

This branch descends from `research/zdd-transfer-20260910`, so the complete OQS/flat-transfer research history is preserved here. Important established evidence includes:

- identified-line quotient `(support,H0,H1)` passed complete physical transition/WDL controls through 4x5;
- separator crossing ownership alone is insufficient for the full symbolic BSFP domain, while measured exact hidden-history classes remained small on controls;
- canonical residual classes were transition-stable on tested controls;
- R4 compiled those classes to pointer-free `stateId + inputOrdinal -> nextStateId` arrays;
- R6 synthesized quotient layers incrementally from prior classes rather than rebuilding forgotten histories;
- minimax research independently established exact reuse across different colored histories when residual future structure matched.

## Immediate cross-solver program

The first research sequence is MQ1-MQ5:

1. **MQ1:** qualify the identified-line quotient for minimax's exact distance-sensitive state and per-column action values, not only W/D/L.
2. **MQ2:** compute the coarsest action-labelled behavioral quotient on complete small games by exact partition refinement.
3. **MQ3:** classify information still removable after identified-line/support state and preserve smallest counterexamples for failed candidate keys.
4. **MQ4:** compile exact `(classId,column) -> terminal | nextClassId` transition artifacts and measure description/transition cost.
5. **MQ5:** compare unchanged serial alpha-beta over the compiled quotient against the strongest fixed-width colored-board control.

Only after those gates should solver-specific optimizations be promoted back into either solver lane.

## Research principle

Kolmogorov complexity is motivation, not a computable acceptance metric. Acceptance is exact future-behavior equivalence. Track state description bytes, transition bytes, construction cost and actual proof cost separately.

A smaller-looking representation is rejected if it changes legal actions, terminal timing, exact action values or solver-required proof meaning.

## Existing OQS continuation

The OQS CUDA cofactor and grouping work remains valuable evidence and may continue where it answers the shared quotient/compiler question. Production CUDA-BSFP integration decisions belong on `solver/cuda-bsfp`.

The former `research/zdd-transfer-20260910` ref is superseded as the research continuity branch because its head is an ancestor of this branch.

## Preservation caveat

Several older minimax research packets were historically preserved only by durable reports/hashes rather than full committed local bundles. Do not claim those original packets are present merely because their conclusions or reconstructed descendants are available.
