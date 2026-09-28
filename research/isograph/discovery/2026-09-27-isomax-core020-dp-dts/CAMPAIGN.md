# IsoMax Core-0.20 post-IA Discovery Protocol + DTS campaign

**Date:** 2026-09-27 author-local  
**Status:** active discovery campaign  
**Owner:** `research/semantic-quotient`  
**Work branch:** `research/isomax-core020-dp-dts-20260927`  
**Frozen base:** `4cecb8f4f626bd701548c0951f36cec12d5c4ab5`

## Goal

Use the newly primitive-rendered IsoMax semantics and the recursive IA fixed
point to find **new structural work**, not restate existing optimizations.

Run:

- Discovery Protocols DP-01 through DP-45 under current DP 0.8 discrepancy
  discipline;
- DTS 0.1 over state-changing, proof-refinement, cache-observation,
  task-control and advisory-order transitions;
- QU/NEI only where their scopes are actually load-bearing.

## Frozen semantic inputs

- IA fixed-point report:
  `research/isograph/optimization/2026-09-27-isomax-core020-implicit-closure/FIXED_POINT_REPORT_0_1.md`
  blob `124a78bb1a6139efbed04db64e02257165daafbf`;
- fixed-point pass:
  `ROUND_08_FIXED_POINT_0_1.json`
  blob `489aeee0e3815495147709f13d208e72cc1a54f9`;
- Core-0.20 primitive game/order/execution bundle at the same owner head.

## Frozen execution observations

- search-derived zero-bound realization:
  blob `88f01929fc5de509bca608ad7733b4f3a3dac2b5`;
- same-q weak-bound coalescing + shared exact-draw result:
  blob `63c468ccd2e07cf074c4c45e128ae1b28cb959ad`;
- all-noncutoff shared-exact fallback result:
  blob `70ab2270340744ad2ca851f7217bc503c39bf908`;
- known-hash shared-cache reuse plan:
  blob `8c3bc3711d7e171ee6549920ca9e82b021579487`;
- accepted forward proof-publication semantics:
  `docs/specs/C4-0010-quotient-native-negamax-v1.md`
  blob `97f0c22ab30b7cc18492eb9f0a2b891d1a56a4aa`;
- historical packed lower/upper proof-store realization:
  blob `8820607a8d7c02f40b849de8f1560025504c38e4`;
- historical packed proof-record realization:
  blob `b96c184b8cf0e4bcca179a02535c7ac0d7905d21`.

Execution observations are discovery evidence. They do not modify the semantic
truth conditions.

## Observation-first discrepancy set

The campaign begins from four observations:

1. Search-derived LOWER0/UPPER0 is extremely effective on hard/deep work.
2. Both weak directions are useful, but repeated bound interaction/store traffic
   is costly; same-q opposite-bound coalescing to exact draw improves the
   completed tree.
3. Broad shared-exact fallback after a non-cutoff weak hit is neutral on the
   completed derived-long control but strongly favorable in a censored harder
   window.
4. Current CPC-derived weak-bound storage was rejected economically even though
   CPC already produces semantically valid intervals.

No observation is pre-labelled as a defect.

## Search discipline

The pass asks separately:

- semantic relation?
- transition relation?
- proof-information refinement?
- occurrence/control transition?
- cache/storage realization?
- machine-cost observation?

Do not collapse those layers.

New leads are promoted only when they expose a relation not already present in
the existing optimization plans/negative list.

## Candidate novelty check

The campaign explicitly checks prior project history before calling a lead new.

Recovered prior structure:

- C4-0010 already owns monotone lower/upper proof publication;
- the historical packed proof store already implemented monotone
  `max(lower)` / `min(upper)` refinement and contradiction checking.

Therefore the generic notion "proof bounds form a lattice" is **not new**.

Potential novelty must lie in a new exact projection, transition correspondence,
or implementation/economic consequence for the current zero-bound architecture.
