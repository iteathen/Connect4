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

The shared OQS/flat-transfer history is preserved here through the superseded `research/zdd-transfer-20260910` lineage. Important established evidence includes:

- identified-line quotient `(support,H0,H1)` passed complete physical transition/WDL controls through 4x5;
- separator crossing ownership alone is insufficient for the full symbolic BSFP domain, while measured exact hidden-history classes remained small on controls;
- canonical residual classes were transition-stable on tested controls;
- R4 compiled those classes to pointer-free `stateId + inputOrdinal -> nextStateId` arrays;
- R6 synthesized quotient layers incrementally from prior classes rather than rebuilding forgotten histories;
- minimax research independently established exact reuse across different colored histories when residual future structure matched.

## Residual-pair factorization seam

The latest shared OQS handoff is `research/zdd-transfer-20260910@5dfe1312a357c48eee53168e82fd6eba27814a06`.

The semantic result retained here is that exact canonical residual-pair identity can be factored from crossing-state occurrence identity for the qualified cut-local cofactor operation. The bounded 7x6 observations include 8,192 crossing states but only 48 distinct residual pairs after six cuts, and cut five requires 8,192 logical state/input outputs but only 128 distinct residual/input cofactor evaluations.

O3 strengthened the exact regression so factored input IDs must recover the original residual pair and every logical occurrence output remains represented. The CUDA mapping kernel, layout, profile, qualifier, native timing and generated evidence are owned by `solver/cuda-bsfp`; they are implementation evidence for this semantic seam, not semantic ownership.

This is **not** yet evidence that residual pairs can be globally interned across all supports/cuts, and it is not a complete 7x6 quotient-size or root-W/D/L result.

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

The OQS CUDA cofactor/grouping work remains valuable evidence where it answers the shared quotient/compiler question. Production CUDA-BSFP integration decisions belong on `solver/cuda-bsfp`.

The former `research/zdd-transfer-20260910` ref is superseded as the research continuity branch. Its latest audited handoff head is ancestry-preserved here, while CUDA-owned O1/O2/O3 implementation is routed to the solver lane.

## Preservation caveat

Several older minimax research packets were historically preserved only by durable reports/hashes rather than full committed local bundles. Do not claim those original packets are present merely because their conclusions or reconstructed descendants are available.
