# Candidate classification schema v5 — terminal proposition strength and completeness

**Date:** 2026-09-09  
**Status:** current research classification schema; maintained source and `main` unchanged.

## Governing structures

The research model still has two independent structures:

1. **candidate intrinsic profile**;
2. **directed signed all-candidate interaction graph**.

No composite score is introduced. Every assessment has a value, confidence, regime, mechanism and evidence basis.

This revision keeps the v4 terminalization axes and corrects a remaining ambiguity: two candidates can both see arbitrarily far into the future while proving propositions of very different strength.

## Intrinsic axes

Retain v4 axes 1-29. Terminalization-specific fields are now represented as four coordinated intrinsic fields.

### 28. Terminalization role

What relationship does this candidate have to semantically ending an unresolved game/proof obligation?

Allowed descriptive roles:

- `none`;
- `immediate-terminal`;
- `bounded-forced-terminal`;
- `strategic-future-terminal`;
- `partial-terminal-certificate`;
- `exact-draw-terminalization`;
- `certificate-component`.

A candidate with `none` can still have large semantic reach. For example a future admissible bound or support-event representation looks far ahead but does not settle the outcome.

### 29. Semantic reach / proof horizon

How far into the future does the candidate's own proposition or transformation range?

Examples:

- `current-state`;
- `one-ply`;
- `bounded forced horizon`;
- `forced-chain`;
- `future admissible bound`;
- `strategic/unbounded`;
- `whole remaining game semantics`;
- `cross-state proof relation`.

Reach is not strength. A strategic/unbounded certificate component can prove less than a one-ply exact-value terminalizer.

### 30. Terminal proposition strength

If the candidate terminalizes or contributes to terminalization, record exactly what proposition it proves:

- `exact-distance-value`;
- `exact-outcome` — exact W/D/L or winner class, distance unresolved;
- `exact-draw`;
- `one-sided-no-win` — exact for a binary win/no-win obligation but not necessarily complete score;
- `strategic-resource-certificate` — exact future ownership/control fact used inside a larger proof;
- `none`.

Do not promote a one-sided no-win proof to exact W/D/L or distance merely because it can produce an alpha-beta cutoff in a particular window.

### 31. Terminalization completeness

Record whether the candidate can close its stated proposition by itself:

- `standalone`;
- `conditional-standalone` — closes only when coverage/preconditions span the entire relevant obligation;
- `component`;
- `not-applicable`.

This is especially important for Allis rules. A Claimeven instance has strategic/unbounded reach and exact authority over the group/resource fact it certifies, but it is normally a component. If one instance happens to cover all relevant opponent groups, it can conditionally close the one-sided no-win proposition.

## Corrected examples

| Candidate | Role | Reach | Proposition strength | Completeness |
|---|---|---|---|---|
| IWIN | immediate-terminal | one-ply | exact-distance-value | standalone |
| DTH | bounded-forced-terminal | bounded forced horizon | exact-outcome | standalone |
| FBLK | none | one-ply restriction | none | not-applicable |
| FMAC | none | forced-chain | none | not-applicable |
| CARD | none | future admissible bound | none | not-applicable |
| EXH | partial-terminal-certificate | strategic/unbounded | one-sided-no-win | standalone for that proposition |
| BEXH | exact-draw-terminalization | strategic/unbounded | exact-draw | standalone |
| A1-A9 | certificate-component | strategic/unbounded | strategic-resource-certificate | component / conditional-standalone if total coverage closes |
| A10 compatible Allis cover | partial-terminal-certificate | strategic/unbounded | one-sided-no-win | standalone for that proposition when valid coverage closes |
| E2 parity metadata | none | future ownership signal | none | not-applicable |
| ZPAR | strategic-future-terminal | strategic/unbounded | projected exact-outcome; distance authority unproved | projected standalone when predicate closes |
| IMPL | none | cross-state proof relation | none | not-applicable |
| exact TT hit / CPR | none | proof retrieval | none | not-applicable |

## Terminalization is semantic, not computational early exit

The category is deliberately narrower than `can cause an early return`.

These are **not** terminalizers merely because they can end a computation:

- exact TT hits;
- completed coarse-proof reuse;
- implication-derived bound cutoffs;
- alpha-beta bounds;
- proof-number search reaching a proof;
- cached move witnesses.

They reuse or organize proof work. Terminalization is reserved for inference from the current game's semantic structure about its future terminal proposition.

## Interaction-graph consequence

Negative edges from terminalizers to downstream search machinery must be scoped by both:

1. **certificate hit state**;
2. **proposition strength relative to the current proof goal**.

Examples:

- `BEXH -> exact-distance search`: full subtree erasure because exact draw closes the complete value;
- `A10 -> exact-distance search`: only partial saturation if A10 proves merely that the opponent cannot win; search may still need to distinguish draw from controller win and determine distance;
- `A10 -> binary can-opponent-win proof`: full subtree erasure when the cover closes;
- `ZPAR -> exact-distance search`: magnitude remains uncertain until ZPAR's exact output is formalized; exact W/D/L alone does not automatically settle distance.

Therefore interaction edges add optional fields:

```text
proof_goal_scope
terminal_proposition_strength
```

## Confidence discipline

Confidence belongs to each assessment cell, not the candidate globally.

In particular, separate:

- confidence the candidate has the assigned terminalization role;
- confidence in proposition soundness;
- confidence in hit-rate projection;
- confidence in runtime profitability;
- confidence in each graph edge.

A candidate can have near-certain classification as a strategic certificate yet low confidence in how often it will close a real 7x6 proof.

## Current authority

Use together:

- `2026-09-09-terminalization-candidate-audit.md` — complete terminalization audit;
- this schema — current intrinsic fields;
- `2026-09-09-signed-candidate-interaction-model-v3.md` — graph semantics;
- `docs/research/evidence/2026-09-09-signed-interaction-graph-terminalization-v2.json` — structured terminalization graph slice.

Older schema versions remain historical records and are superseded for current classification work.