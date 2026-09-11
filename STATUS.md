# Connect4 Semantic-Quotient Research Status

**Updated:** 2026-09-10  
**Canonical branch:** `research/semantic-quotient`  
**State:** active cross-solver research

## Mission

Find the smallest exact, efficiently updatable description of the remaining Connect Four game. This branch owns solver-neutral research into future-behavior equivalence, win-space reduction, support/accessibility sufficiency, identified-line quotients, residual classes, canonical transitions and practical minimum-description representations.

It does **not** own the minimax/alpha-beta solver implementation or the CUDA-BSFP solver implementation. Those remain on:

- `solver/minimax-alpha-beta`
- `solver/cuda-bsfp`

## Established cross-solver evidence

- identified-line quotient `(support,H0,H1)` passed complete physical transition/WDL controls through 4x5;
- separator crossing ownership alone is insufficient for the full symbolic BSFP domain, while measured exact hidden-history classes remained small on controls;
- canonical residual classes were transition-stable on tested controls;
- R4 compiled those classes to pointer-free `stateId + inputOrdinal -> nextStateId` arrays;
- R6 synthesized quotient layers incrementally from prior classes rather than rebuilding forgotten histories;
- minimax research independently established exact reuse across different colored histories when residual future structure matched.

## Latest OQS factorization result

The latest incoming OQS work from former mixed branch head `e04cee12bc24cda63fcf889eb4ca2137837f86bf` is now curated into this branch as semantic research rather than left on a fifth continuity lane.

The bounded 7x6 seed/prefix probes strengthened the minimum-description hypothesis:

- after six cuts, 8,192 logical `(crossing assignment,residual)` states used only **48 distinct exact residual pairs**;
- 1,732,992 logical frontier-record occurrences corresponded to only **10,597 records** in those distinct residual pairs;
- at cut 5, 8,192 state/input outputs required only **128 distinct residual/input cofactor evaluations**;
- exact residual-cofactor reuse on complete 4x4 controls and a bounded 7x6 prefix preserved the exact layer state sets/digests;
- observed CPU cofactor evaluations dropped from **11,056 to 624** and the six-cut probe from about **22.52 s to 3.28 s** (~6.86x descriptive ratio).

This does not prove the final 7x6 quotient size or CUDA speedup. It does show that **crossing-state identity and residual-function identity should be factored rather than stored/recomputed one-for-one**.

Active research artifacts are now owned here:

- `docs/research/2026-09-11-oqs-seed-scaling.md`;
- `docs/research/evidence/2026-09-11-oqs-seed-scaling.json`;
- `docs/research/evidence/2026-09-11-oqs-residual-cofactor-reuse.json`;
- `reference/research-prototypes/2026-09-10-oqs/`.

CUDA O1/O2 layouts/profiles/qualifier implementation were separately routed to `solver/cuda-bsfp`.

## Immediate cross-solver program

The main semantic program remains MQ1-MQ5:

1. **MQ1:** qualify the identified-line quotient for minimax's exact distance-sensitive state and per-column action values, not only W/D/L.
2. **MQ2:** compute the coarsest action-labelled behavioral quotient on complete small games by exact partition refinement.
3. **MQ3:** classify information still removable after identified-line/support state and preserve smallest counterexamples for failed candidate keys.
4. **MQ4:** compile exact `(classId,column) -> terminal | nextClassId` transition artifacts and measure description/transition cost.
5. **MQ5:** compare unchanged serial alpha-beta over the compiled quotient against the strongest fixed-width colored-board control.

The OQS residual-pair factorization is a parallel shared-representation seam because it may expose exactly the kind of class decomposition MQ2–MQ4 seek: many operational states referencing a much smaller immutable semantic kernel.

## Research principle

Kolmogorov complexity is motivation, not a computable acceptance metric. Acceptance is exact future-behavior equivalence. Track state description bytes, transition bytes, construction cost and actual proof cost separately.

A smaller-looking representation is rejected if it changes legal actions, terminal timing, exact action values or solver-required proof meaning.

## Ownership boundary

The former `research/zdd-transfer-20260910` branch is historical/incoming work, not a fifth durable lane. Its latest audited head is ancestry-preserved by the curated semantic/CUDA handoff. New shared quotient/OQS semantics belong here; CUDA-specific Device-JS profiles and native qualification belong on `solver/cuda-bsfp`.

## Preservation caveat

Several older minimax research packets were historically preserved only by durable reports/hashes rather than full committed local bundles. Do not claim those original packets are present merely because their conclusions or reconstructed descendants are available.
