# Candidate classification schema v2

**Date:** 2026-09-09  
**Status:** research classification schema; maintained source and `main` unchanged.

## Principle

Every candidate, including candidates currently labeled core, is evaluated on the same independent axes. No axis is collapsed into a composite score during classification. Derived labels such as `core`, `conditional`, `experimental`, or `excluded-form` may be assigned later from the completed matrix, but they are not substitutes for the underlying categories.

## Intrinsic candidate axes

1. **Projected effectiveness** — expected benefit before/without complete measurement. Record the mechanism and confidence separately.
2. **Measured effectiveness** — observed benefit, preserving the actual metric(s): time-to-proof, node reduction, nodes/sec, memory, TT traffic, depth reached under a fixed budget, parallel efficiency, or other directly measured outcome. Never collapse a node win and a runtime loss into one value.
3. **Expected usefulness / adoption likelihood** — likelihood that the underlying idea appears in the eventual solver in some form.
4. **Proof-authority class** — semantic foundation, exact state reduction, exact terminal proof, admissible bound, ordering-only heuristic, scheduling hint, cache/representation mechanism, etc.
5. **Benefit mechanism** — how the candidate wins: fewer states, lower branching, better ordering, lower per-node arithmetic, less memory traffic, denser TT, better retention, more parallel work, reduced duplicate work, etc.
6. **Hot-path performance risk** — likelihood/cause of per-node throughput damage.
7. **State/resource footprint cost** — additional bits/words/TT bytes/stack/worker storage.
8. **Precomputation / cold-path cost** — root/game/build-time work and storage.
9. **Incrementalizability** — whether the needed facts can be updated from the previous state with bounded/fixed work rather than rediscovered.
10. **Amortization horizon** — per transition, decision state, proof pass, root, game, reroot sequence, or persistent across games.
11. **Cache/locality effect** — expected impact on cache footprint, memory traffic, TT density and access locality.
12. **Parallelism interaction** — effect on exposed work, critical path, duplicate work, contention and synchronization.
13. **GPU suitability** — fixed-width suitability, divergence, warp/coalescing behavior, table locality, register/shared/global-memory implications.
14. **Reroot/persistence value** — how much produced knowledge survives root movement / later proof passes.
15. **Generality/domain scope** — 7x6-only, Connect-Four-family, search-generic, execution-generic, etc.
16. **Correctness-risk severity** — consequence of a defect: ordering degradation, performance regression, stale hint, false bound, false proof, etc.
17. **Validation difficulty** — cost/difficulty of independent soundness and performance qualification.
18. **Architectural lock-in / reversibility** — how strongly adoption constrains state identity, TT layout, scheduler, ABI or later representations.
19. **Evidence maturity** — conceptual, prototype, mechanism-tested, exact-qualified, performance-qualified, composition-qualified, production-qualified.
20. **Implementation-form risk** — chance the current realization is wrong/suboptimal while the underlying idea survives.
21. **Benefit consistency / variance** — consistency across positions/regimes and pathological tails.
22. **Regime sensitivity** — opening/midgame/endgame, tactical/quiet, TT pressure, window shape, parallel load, etc.
23. **Information half-life** — how long the candidate's produced information remains useful.
24. **Stage locality** — root compilation, transition, forced normalization, canonicalization, TT probe/store, ordering, proof-window selection, coarse scheduling, etc.

## Relational axes

25. **Pairwise compatibility** — candidate-by-candidate compatibility; do not average across partners.
26. **Directional synergy** — `A -> B` and `B -> A` are separate facts. Record whether A makes B cheaper, more frequent, more powerful, more local, or more accurate.
27. **Observed vs projected synergy** — measured composition evidence and suspected/theoretical interaction are separate statuses.
28. **Substitution / overlap** — additive, partially overlapping, alternative realization, subsuming, or mutually exclusive.
29. **Amplification potential** — capacity to increase the effectiveness of other candidates, kept distinct from direct usefulness.
30. **Multi-problem leverage / optimization encapsulation** — distinct optimization problems solved by one mechanism. Record the actual problem set rather than a single scalar count when possible.
31. **Shared-substrate leverage** — whether the candidate reuses an already-paid substrate, creates a substrate shared by multiple features, or requires dedicated machinery.
32. **Coverage redundancy / displacement** — which other candidates become unnecessary or materially less valuable if this candidate succeeds.
33. **Architectural dependency** — prerequisites that must exist or be settled first.
34. **Exclusion risk** — likelihood another candidate/representation eliminates the need or possibility for this one.
35. **Marginal-value saturation** — remaining benefit after the strongest current stack already solves much of the targeted work.

## Effectiveness recording rule

Projected and measured effectiveness are not single numbers.

For each candidate and each tested composition, preserve a metric vector where available:

```text
exactness/oracle agreement
nodes or proof obligations
elapsed time / time-to-proof
nodes per second
memory / bytes per entry / active footprint
TT probes, hits, writes, replacements
candidate-specific checks/hits/cutoffs
parallel useful work / duplicate work / critical-path time
depth or proof progress under fixed wall-clock budget
```

A candidate may therefore be, for example:

- projected effectiveness: high;
- measured node effectiveness: high;
- measured time effectiveness: negative;
- measured memory effectiveness: neutral;
- composition effectiveness with candidate X: positive.

Those statements remain separate.

## Multi-problem leverage rule

Do not reward superficial breadth. Record distinct problems actually solved by the same underlying mechanism.

Example distinction:

- one representation that simultaneously improves state identity, exact bounds, symmetry handling, evaluator projection and proof-rule encoding has genuine multi-problem leverage;
- five TT replacement variants addressing the same collision/retention problem do not count as five distinct problems solved.

## Directional synergy rule

Synergy is a relation, not an intrinsic property.

Examples:

- `RID -> Allis rules`: strong if the fixed requirement universe turns dynamic rule coverage into precomputed masks;
- `Allis rules -> RID`: likely weak because the rules do not materially improve the residual dictionary itself;
- `support-event frontier -> implication reuse`: potentially strong because it can make support compatibility/incremental proof-frontier maintenance cheap;
- `implication reuse -> support-event frontier`: likely much weaker.

Observed and projected directional synergy must be recorded separately.

## Classification discipline

- Core candidates are ordinary rows in this schema; `core` is only a derived adoption-likelihood label.
- Do not combine compatibility, usefulness, effectiveness, maturity, risk, or synergy into one score unless the owner later explicitly asks for a decision model.
- Do not infer performance effectiveness from node reduction alone.
- Do not infer exactness from heuristic correlation.
- Do not infer incompatibility when two candidates are simply alternative implementations of one responsibility.
- Preserve implementation exclusions separately from knowledge/mechanism exclusions.
