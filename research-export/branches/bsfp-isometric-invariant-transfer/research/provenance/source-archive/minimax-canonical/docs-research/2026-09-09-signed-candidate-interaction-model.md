# Signed all-candidate interaction model

**Date:** 2026-09-09  
**Status:** research classification correction; maintained source and `main` unchanged.

## Correction

A separate intrinsic `exclusion risk` category is conceptually wrong for this candidate set. Exclusion is relational: candidate A is excluded, weakened, displaced or made redundant **because of some other candidate B or some selected architecture**.

The classification therefore replaces separate synergy/exclusion bookkeeping with one **directed signed interaction map across all candidates**.

This does **not** collapse unrelated categories. Effectiveness, evidence maturity, compatibility, implementation risk, footprint, leverage, proof authority, etc. remain independent axes. The signed map owns only the relational question:

> If candidate A is adopted, what happens to the value, cost, applicability or viability of candidate B?

## Directed matrix

For every ordered pair `(A, B)`, define:

```text
I[A -> B]
```

The direction matters. `I[A -> B]` and `I[B -> A]` may differ strongly.

Examples:

- `RID -> Allis rules` is strongly positive because RID makes rule coverage cheap;
- `Allis rules -> RID` is much weaker;
- a rich support-event representation may strongly reduce the need for a separate neutral-tempo subsystem;
- adopting a global neutral-pool implementation can make exact support semantics invalid.

## Signed ordinal scale

The numeric value is ordinal. Do not treat differences or sums as calibrated utilities.

| Value | Meaning |
|---:|---|
| `+4` | transformative amplification: A can make B substantially cheaper/more applicable or turn an otherwise unprofitable B into a likely winner |
| `+3` | strong material synergy |
| `+2` | clear positive synergy |
| `+1` | mild positive interaction |
| `0` | assessed as materially independent/additive |
| `-1` | mild exclusion pressure: overlap/saturation reduces B's marginal value |
| `-2` | material exclusion pressure: A displaces a meaningful portion of B or creates substantial interference |
| `-3` | likely exclusion/substitution: if A wins, B's current role/form is probably not retained |
| `-4` | fundamental exclusion: A and B's stated forms/contracts cannot safely or coherently coexist |

Any negative value therefore indicates **exclusion pressure**, as requested. Magnitude describes how strongly A pushes B out.

## Unknown is not zero

An unassessed pair is `null`, not `0`.

This distinction is mandatory:

```text
0    = we considered the pair and expect no material interaction
null = we have not established the relation yet
```

For a large candidate universe, the repository may store the matrix sparsely, but sparse absence must mean `unknown`, never implicitly `0`.

## Every edge carries separate metadata

The signed value does not replace categorical reasoning. Each nontrivial edge should record:

```text
source
candidate
value
mechanism
relation_kind
evidence_state
confidence
regime
basis
```

### `relation_kind`

Use one or more causal labels without changing the numeric value's meaning:

Positive mechanisms:

- `cost-sharing`
- `state-simplification`
- `applicability-increase`
- `proof-order`
- `cache-retention`
- `shared-metadata`
- `validity-enabling`
- `parallel-duplication-reduction`

Negative / exclusion mechanisms:

- `saturation`
- `overlap`
- `subsumption`
- `substitution`
- `resource-interference`
- `cache-interference`
- `state-identity-conflict`
- `support-semantics-conflict`
- `proof-authority-conflict`
- `hot-path-cost-conflict`
- `architectural-lock-in`

The tags matter because the same `-3` may arise for very different reasons.

## Compatibility remains separate

Do not infer compatibility directly from the signed value.

Examples:

- A can be perfectly compatible with B yet have `I[A -> B] = -2` because A subsumes most of B's benefit.
- A can have `I[A -> B] = +2` while requiring substantial co-design because both depend on the same TT key layout.
- Two alternative support representations may be technically incompatible (`substitutive`) even though each has high projected effectiveness.

Therefore pairwise **compatibility/relation type** remains a separate categorical field. The signed map measures effect on value/viability, not whether two implementations can literally coexist.

## Exclusion becomes emergent

Instead of storing an intrinsic `exclusion risk`, derive exclusion pressure on candidate B from incoming negative edges:

```text
A1 -> B = -3
A2 -> B = -1
A3 -> B = +2
...
```

This reveals **who excludes B and why**, which the old scalar `exclusion risk: high` could not express.

Do not sum these values into a global exclusion score unless a later explicit decision model defines how to do so. The edge set itself is the classification result.

## Substitution and displacement move into edge semantics

Separate bookkeeping such as `coverage redundancy / displacement` is largely relational and can be represented as negative edges with cause tags.

Examples:

- `support-event frontier -> global neutral pool = -3 (subsumption/substitution)`;
- `full residual canonicalization -> sibling orbit pruning = -2 or -3 (subsumption)` depending implementation;
- `tactical exact closure -> evaluator immediate-threat heuristic = -3 (authority/subsumption)`;
- `completed coarse-proof reuse -> in-flight join graph = -1 or -2 (overlap/saturation)`, not necessarily incompatibility.

The candidate's **multi-problem leverage** remains an independent intrinsic/structural category; it is not replaced by these edges.

## Interaction values are regime-qualified

An interaction may change sign by regime. Store separate edges or regime-specific values rather than averaging.

Examples:

```text
RANK -> CTT
  tight TT: +3 cache-retention
  roomy TT: +1 or 0
```

```text
FMAC -> IMPL
  current comparison-heavy frontier: -1 saturation + lower query volume
  future event-indexed frontier: possibly +2 cost-sharing through decision-only queries
```

```text
STT -> YBWC
  overlap-heavy multicore proof: +3
  tiny tactical proof: 0 or -1 synchronization footprint
```

## Observed and projected maps are separate layers

For each pair preserve at least:

```text
projected_value
projected_confidence
observed_value (when crossed evidence exists)
observed_basis
```

Do not overwrite a projected edge with one experiment if the experiment covers only one regime.

A measured composition can also expose multiple mechanisms simultaneously. Keep the causal interpretation explicit.

## Core candidates are ordinary nodes

The current core group is not privileged. Every core candidate appears as both source and target in this same map.

Examples already supported by evidence/theory:

- `CARD -> AUTO`: positive observed interaction;
- `FBLK/DTH/IWIN -> FMAC`: strong observed positive interaction;
- `FMAC -> IMPL`: currently mild exclusion pressure through saturation even while fewer queried states can lower overhead;
- `DEAD -> AUTO`: projected positive state-simplification;
- `AUTO -> current address-dependent CTT encoding`: co-design tension, potentially negative until key identity is rederived;
- `SUP-event -> global neutral-pool form`: strong negative/substitution because the event representation owns neutral-gap timing correctly.

## Sparse graph representation

Because the candidate universe contains the historical 107 items plus newer residual/evaluator/Allis/proof candidates, a dense printed matrix would be mostly unreadable. Store the authoritative interaction data as a sparse directed edge list plus an assessment-coverage ledger.

Suggested future structured shape:

```json
{
  "source": "RID",
  "target": "A1_Claimeven",
  "projected": 4,
  "observed": null,
  "relation_kind": ["cost-sharing", "shared-metadata"],
  "confidence": "high",
  "regime": "residual fixed-ID exact search",
  "mechanism": "precompiled solves masks and local parity/support lookup"
}
```

The human-readable documents can render slices of this graph: core interactions, evaluator interactions, Allis interactions, cache interactions, etc.

## Consequence for the classification schema

Remove `exclusion risk` as an independent intrinsic axis.

Replace the previous relational collection:

- synergy with core;
- general amplification;
- exclusion risk;
- coverage displacement;

with one primary relational object:

> **directed signed all-candidate interaction map**

Keep these independent relational descriptors alongside it:

- pairwise compatibility / relationship type;
- dependency/prerequisite relation;
- observed-vs-projected evidence state.

Keep intrinsic categories such as projected/measured effectiveness, multi-problem leverage, implementation-form risk, evidence maturity, footprint, GPU suitability, etc. unchanged.

## Why this is better

The signed map preserves the actual structure of the design problem:

- a candidate can strongly help one candidate and strongly exclude another;
- adoption of a unifying representation can eliminate several workaround optimizations while amplifying several structural ones;
- a candidate can be excluded only in one implementation form or regime;
- directional interaction can reveal which candidates are true **hubs** and which are merely beneficiaries;
- exclusion decisions become traceable to named competitors/mechanisms rather than vague global risk labels.

This is the relational model to use for the next theoretical candidate pass.