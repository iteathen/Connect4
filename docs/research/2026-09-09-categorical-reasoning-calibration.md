# Categorical reasoning calibration for exact-solver candidates

**Date:** 2026-09-09  
**Status:** research reasoning protocol; maintained source and `main` unchanged.  
**Scope:** improves how the existing independent candidate categories are assessed. It does not collapse them into a decision score.

## Why this exists

The candidate schema already separates projected effectiveness, measured effectiveness, adoption likelihood, compatibility, synergy, leverage, risk, evidence maturity and the other axes. The remaining failure mode is softer: assigning labels such as `high`, `medium` or `compatible` without making the causal claim inspectable.

From this point, every nontrivial categorical assessment should be backed by four separate annotations:

1. **mechanism** — the causal reason the category should take that value;
2. **evidence basis** — theorem/invariant, exhaustive check, independent oracle, differential implementation, timing, literature prior, or pure hypothesis;
3. **confidence** — confidence in the categorical assessment, separate from the magnitude of the category;
4. **regime** — the positions, memory pressure, proof mode, worker count, representation or execution stage under which the claim is expected to hold.

Example:

```text
projected time effectiveness: positive-to-strong
mechanism: removes TT probes/writes for deterministic transit states
confidence: high
regime: exact alpha-beta/null-window search with appreciable forced chains
basis: exact small-game differential + independent 7x6 oracle + repeated timing
```

This is stronger than `effectiveness: high` and does not mix effectiveness with confidence or maturity.

## Evidence hierarchy

Evidence types are not interchangeable. Use the strongest applicable description rather than a single numeric grade.

### Semantic / exactness evidence

1. **formal invariant / algebraic proof** — e.g. exact reversible TT key reconstruction;
2. **exhaustive complete-domain check** — e.g. all reachable states of a small Connect-Four variant;
3. **independent exact oracle differential** — separate implementation/mechanics;
4. **same-family exact differential** — useful but more correlated with the candidate implementation;
5. **adversarial/falsification examples** — especially important for ruling out unsound abstractions;
6. **literature/theoretical prior** — supports plausibility, never substitutes for repository qualification;
7. **conceptual hypothesis only**.

### Performance evidence

1. **same-environment repeated end-to-end time-to-proof**, alternating/rotating order, with exactness held fixed;
2. **same-environment deterministic work metrics** such as nodes, TT traffic, bytes or dispatches;
3. **microkernel/microbenchmark evidence** tied to a known hot operation;
4. **single noisy timing sample**;
5. **projected performance from mechanism only**.

A node reduction is measured *node effectiveness*, not measured time effectiveness. A memory saving is measured *footprint effectiveness*, not automatically a time win.

## Projection discipline

Projected effectiveness is a vector, not a scalar. Prefer qualitative intervals rather than false precision:

- `strong positive expected`
- `positive expected`
- `small positive expected`
- `regime-dependent / sign uncertain`
- `small negative expected`
- `negative expected`
- `strong negative expected`

Attach a separate confidence: `low`, `medium`, `high`, `very high`.

Where useful, project distinct outcomes:

```text
projected nodes: positive
projected NPS: negative
projected time-to-proof: sign uncertain until representation-native
projected memory: neutral
```

Never turn these into an average.

## Causal chain requirement

A projected effect should be expressible as:

```text
candidate fact
  -> changed state/search/cache operation
  -> changed resource or proof behavior
  -> expected metric effect
  -> regime where the effect matters
```

Examples:

```text
fixed residual IDs
  -> precomputed transition/subsumption maps
  -> no dynamic requirement sorting/subset scans
  -> higher NPS / lower allocation pressure
  -> residual search with frequent descendant updates
```

```text
rank banking
  -> impossible cross-rank collisions removed
  -> better retention at tight TT capacity
  -> fewer nodes
  -> memory-pressure regimes; effect saturates as capacity grows
```

If a candidate cannot be given such a causal chain, its projection confidence should remain low.

## Compatibility reasoning

Pairwise compatibility is not a score of merit. Record the relation and the conflict surface.

Allowed relation descriptions include:

- **orthogonal/complementary** — different responsibilities, no known shared constraint;
- **dependent-compatible** — one requires facts/state owned by the other;
- **co-design-compatible** — can coexist, but both constrain the same representation/layout;
- **overlapping** — both attack some of the same work;
- **substitutive** — alternative realizations of one responsibility;
- **conditionally incompatible** — can coexist only if a stated constraint holds;
- **fundamentally incompatible** — their semantic/resource contracts cannot both hold.

Do not translate these into a single compatibility number.

## Directional synergy reasoning

For `A -> B`, state exactly how A changes B:

- lowers B's execution cost;
- increases B's hit/applicability rate;
- improves B's proof order;
- shrinks B's state/domain;
- improves B's cache locality/retention;
- supplies metadata B otherwise computes;
- makes B exact where it was heuristic;
- or interferes by doing the inverse.

`A -> B` and `B -> A` are independent entries.

Observed synergy requires a crossed experiment or an equivalent causal ablation. Theoretical synergy remains `projected` even when each candidate is independently measured.

## Multi-problem leverage reasoning

Record the **distinct problem set**, not an adjective alone.

A problem counts separately only if solving it would have independent value without the other listed problems. Examples:

- semantic state compression;
- exact tactical termination;
- move ordering;
- TT footprint;
- TT collision/retention;
- proof transfer between non-identical states;
- support timing;
- parallel duplicate-work reduction;
- coarse scheduling;
- proof-rule coverage.

A candidate is high-leverage when one shared mechanism addresses several such problems without separate hot-path machinery.

Do not award extra leverage for several variants of the same optimization.

## Shared-substrate accounting

For each candidate identify whether it is:

- **substrate producer** — creates state/precomputation used by multiple candidates;
- **substrate consumer / free rider** — uses already-maintained facts;
- **substrate co-owner risk** — attempts to introduce a second source of truth for the same fact;
- **dedicated substrate** — adds machinery used mainly by itself;
- **substrate replacement** — can remove an existing source of truth.

This is especially important for the residual requirement universe, support/event frontier, TT identity and Allis/evaluator metadata.

## Saturation reasoning

Marginal-value saturation is assessed against a named stack, not abstractly.

For candidate A, distinguish:

- standalone addressable work;
- work already removed by tactical closure / forced macros / bounds / TT / symmetry;
- new work exposed by another candidate;
- residual work on which A can still act.

A candidate can be intrinsically strong but have low marginal value after another candidate subsumes its target states.

## Regime model

At minimum consider these regimes when relevant:

- early / mid / late game;
- tactical / quiet;
- high / low support complexity;
- high / low residual symmetry;
- high / low forced-chain density;
- tight / roomy TT capacity;
- serial / multicore;
- null-window fail-high / fail-low / exact refinement;
- cold-root / persistent reroot;
- CPU fixed-width / eventual GPU execution.

A candidate with a sharply positive niche should be classified as regime-sensitive, not averaged into mediocrity.

## Negative evidence discipline

A failed implementation updates the candidate at the narrowest justified level.

Examples:

- dynamic VICTOR compatibility graph being expensive lowers the projection for that implementation, not for compiled Allis proof masks;
- full-line evaluator rescans being expensive lowers that implementation, not incremental live-line metadata;
- ordinary board reflection hurting a direct-mapped TT does not falsify residual-game automorphism reduction;
- a comparison-heavy implication frontier being slow does not falsify the proven monotone relation.

Conversely, positive evidence must not be generalized upward without mechanism support.

## External literature discipline

External literature changes priors and can expose missing mechanisms or known failure modes. It does not override repository evidence or authorize external code.

Current useful priors include:

- Pascal Pons's Connect-Four solver sequence: best-first move ordering, direct losing-move anticipation, fixed transposition tables, and partial-key TT compression are all high-leverage in a strong exact alpha-beta solver;
- Allis's VICTOR work: strategic rules can prove coverage of opponent winning groups, but rule compatibility is a real constraint rather than independent set membership;
- conspiracy/proof-number literature: proof/disproof effort estimates can guide highly non-uniform proof trees, while full best-first proof-number search changes the search/memory regime and should not be conflated with a cheap ordering signal;
- YBWC/Jamboree literature: useful parallel alpha-beta usually protects first-child information and limits speculative work rather than simply splitting every sibling.

These are priors. The Connect4 repository's exact semantics, fixed-width performance envelope and measured compositions remain the local authority.

## Candidate assessment output format

A sharpened candidate profile should expose at least:

```text
candidate
underlying idea vs current implementation form
projected effectiveness vector + confidence + mechanism + regime
measured effectiveness vector + evidence identity
adoption likelihood + confidence
proof-authority class
benefit mechanism(s)
hot-path / footprint / locality / parallel / GPU implications
incrementalizability and amortization
maturity / correctness risk / validation difficulty / lock-in / form risk
regime sensitivity and variance
stage and information half-life
important pairwise compatibility relations
important directional synergies (projected vs observed)
substitution / displacement / saturation
distinct problems solved
substrate role
dependencies / exclusion risks
next falsifier or decisive experiment
```

No field is permitted to stand in for another.

## Theoretical update rule

When new evidence arrives:

1. identify which exact candidate *form* was tested;
2. update measured effectiveness only for the measured metrics;
3. update projected effectiveness through the causal mechanism actually demonstrated;
4. update confidence separately;
5. update relational categories only where the tested composition supports them;
6. preserve adverse/contradictory regime evidence rather than averaging it away;
7. reconsider substitution/saturation because a new representation can make old candidates redundant;
8. do not silently reclassify every candidate that shares a name with the tested implementation.

This protocol is intended to keep the upcoming whole-candidate theoretical ledger inspectable and resistant to category collapse.