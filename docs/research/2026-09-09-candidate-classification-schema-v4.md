# Candidate classification schema v4 — terminalization-aware profiles + signed interaction graph

**Date:** 2026-09-09  
**Status:** current research classification schema; maintained source and `main` unchanged.

## Governing model

Candidate properties and candidate-to-candidate effects remain separate.

1. **candidate profile** — intrinsic properties of one candidate;
2. **directed signed interaction graph** — what adopting candidate A does to candidate B.

No axis is collapsed into a composite score. Every assessment carries confidence, evidence basis and regime.

## New correction: future-terminal detection is not ordinary search structure

Prior schemas partially represented future-terminal methods through proof authority, benefit mechanism and stage locality, but did not identify their defining property:

> some candidates can certify an eventual terminal outcome, terminal class, or one-sided terminal impossibility from the current state without searching the intervening game tree.

This is materially different from move ordering, cache layout, alpha-beta bounds, symmetry quotienting, parallel scheduling, or forced-edge compression.

Two new intrinsic axes are therefore mandatory.

### 28. Terminalization role

Record whether the candidate can terminate an unresolved state semantically rather than merely make its search cheaper.

Allowed descriptive classes include:

- `none` — does not itself certify a terminal future;
- `immediate-terminal` — identifies a terminal result available now/next move;
- `bounded-forced-terminal` — proves an inevitable terminal result across a bounded forced horizon;
- `strategic-future-terminal` — proves an eventual terminal class without enumerating the intervening future;
- `partial-terminal-certificate` — proves a one-sided impossibility or terminal bound but not necessarily the complete W/D/L result by itself;
- `exact-draw-terminalization` — proves that no future win is possible for either side;
- `certificate-component` — contributes exact facts to a larger terminal certificate but is not complete alone.

Also record the **terminal output** where relevant: exact win/loss/draw, exact distance-sensitive value, WDL class, one-sided no-win/no-loss fact, or another explicit terminal proposition.

### 29. Semantic reach / proof horizon

Record how far the candidate's proof can jump over the future game:

- `current-state`;
- `one-ply`;
- `bounded-k-ply`;
- `forced-chain`;
- `strategic/unbounded` — the proof can establish eventual outcome independently of how many legal intervening moves remain;
- `state-dependent` — horizon varies by the certificate.

Semantic reach is not the same as computational cost. A cheap one-ply tactic and an expensive unbounded Zugzwang certificate may both be excellent if their avoided search differs accordingly.

## Intrinsic candidate profile axes

Every candidate, including current core candidates, receives the same intrinsic profile.

1. Projected effectiveness vector.
2. Measured effectiveness vector.
3. Expected usefulness / adoption likelihood.
4. Proof-authority class.
5. Benefit mechanism(s).
6. Hot-path performance risk.
7. State/resource footprint cost.
8. Precomputation / cold-path cost.
9. Incrementalizability.
10. Amortization horizon.
11. Cache/locality effect.
12. Parallelism interaction as an intrinsic execution property.
13. GPU suitability.
14. Reroot/persistence value.
15. Generality/domain scope.
16. Correctness-risk severity.
17. Validation difficulty.
18. Architectural lock-in / reversibility.
19. Evidence maturity.
20. Implementation-form risk.
21. Benefit consistency / variance.
22. Regime sensitivity.
23. Information half-life.
24. Stage locality.
25. Multi-problem leverage / direct optimization encapsulation.
26. Enabling/substrate leverage.
27. Substrate role.
28. **Terminalization role.**
29. **Semantic reach / proof horizon.**

## Terminalization economics

Future-terminal detectors require different measurement from ordinary per-node optimizations.

Record separately where possible:

```text
certificate checks
certificate hits
hit rate
check cost
terminal proposition proved
search nodes / proof obligations avoided per hit
wall time avoided per hit
residual depth/horizon skipped
false-positive count (must be zero for exact authority)
false-negative rate where measurable
```

A detector can be profitable even with a low hit rate if each successful certificate erases a very large subtree.

Do not reject such a candidate merely because its per-check cost is higher than an ordinary ordering heuristic.

## Canonical examples

### Exact immediate win (`IWIN`)

- terminalization role: `immediate-terminal`;
- semantic reach: `one-ply`;
- proof authority: exact terminal result;
- effect: removes the entire child subtree because the result is already known.

### Double immediate threat (`DTH`)

- terminalization role: `bounded-forced-terminal`;
- semantic reach: bounded forced horizon;
- proof authority: exact forced loss;
- effect: terminalizes before playing the inevitable losing continuation.

### Forced block / macro edge (`FBLK`, `FMAC`)

- terminalization role: `none`;
- semantic reach: forced-chain for FMAC, but **not a terminal proof**;
- effect: removes deterministic transit vertices and resumes search at the next unresolved decision.

### Cardinality/support-aware earliest-win bounds (`CARD`, `SEWB`)

- terminalization role: normally `none`;
- semantic reach: future-looking bound;
- proof authority: admissible bound;
- effect: narrows proof windows but does not usually determine the terminal class.

### One-sided exhaustion (`EXH`)

- terminalization role: `partial-terminal-certificate` when only one side has no remaining wins; `exact-draw-terminalization` when both sides have none;
- semantic reach: strategic/unbounded;
- effect: can establish an eventual no-win fact without enumerating filler play.

### Compatible Allis rule cover (`A10`)

- terminalization role: `partial-terminal-certificate` or `strategic-future-terminal` depending the full controller/coverage proposition proved;
- semantic reach: strategic/unbounded;
- proof authority: exact strategic certificate when preconditions and compatibility are valid.

### Exact parity/Zugzwang terminal detector (`ZPAR`)

This is a new explicit graph node and is **not** the same candidate as heuristic parity ordering (`E2`).

- terminalization role: projected `strategic-future-terminal`;
- semantic reach: projected strategic/unbounded;
- intended proposition: determine eventual ownership/outcome from move/event parity and Zugzwang structure without searching all intervening placements;
- current confidence: low/medium until independently formalized and differentially tested;
- priority: high because successful terminalization could erase deep subtrees and amplify several strategic-certificate candidates.

## Signed interaction graph remains authoritative for relational effects

For every ordered pair `(A,B)`, `I[A -> B]` records the effect of adopting A on B's usefulness, cost, applicability or viability.

Scale remains:

- `+4` transformative amplification
- `+3` strong synergy
- `+2` clear positive synergy
- `+1` mild positive interaction
- `0` explicitly assessed neutral
- `-1` mild saturation/exclusion pressure
- `-2` material displacement/interference
- `-3` likely substitution/exclusion
- `-4` incompatible contracts/forms
- `null` unassessed

### New terminalization relation kinds

Positive:

- `terminalization-enabling` — A makes B's future-terminal proof valid or cheap;
- `semantic-horizon-extension` — A lets B prove farther into the future;
- `certificate-supply` — A provides exact pieces consumed by B's terminal certificate;
- `certificate-hit-rate` — A increases how often B can close the game semantically.

Negative:

- `subtree-erasure-saturation` — A terminalizes states that B would otherwise search/optimize;
- `bound-subsumption` — A exact terminal proof makes B's weaker bound unnecessary in hit states;
- `search-structure-saturation` — A removes downstream search work, reducing B's marginal opportunity without making B incompatible.

These negative edges **must not be interpreted as incompatibility** unless compatibility is separately marked incompatible.

## Terminalization must precede interpretation of search-structure value

The preferred conceptual pipeline is now:

```text
exact compact state
  -> future-terminal / strategic certificate checks
  -> deterministic forced normalization
  -> exact admissible bounds
  -> canonicalization / equivalence reduction
  -> TT / ordering / alpha-beta / parallel search
```

The exact ordering of cheap terminal checks versus forced normalization remains empirical, but terminalization is conceptually distinct: when it fires, the downstream search subtree ceases to exist.

## Confidence discipline

Terminalization assertions are high-severity exact claims. Confidence must be attached separately to:

- soundness of the terminal proposition;
- expected hit rate;
- expected subtree savings per hit;
- runtime profitability;
- signed interactions with enabling substrates and displaced search mechanisms.

A high-confidence theorem with unknown hit rate is not a high-confidence performance winner. A high projected payoff with low soundness confidence must be tested before promotion.

## Current authoritative research artifacts

Use together:

- `2026-09-09-categorical-reasoning-calibration.md`;
- `2026-09-09-signed-candidate-interaction-model-v2.md`;
- this v4 schema;
- `docs/research/evidence/2026-09-09-signed-interaction-graph-terminalization.json`;
- strategic candidate theory documents;
- low-confidence survival-test evidence.

Older schemas remain historical evidence and are not silently rewritten.