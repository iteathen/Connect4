# Signed all-candidate interaction model v3 — proposition-aware terminalization

**Date:** 2026-09-09  
**Status:** current research interaction model; maintained source and `main` unchanged.

## Governing relation

For every ordered pair `(A,B)`, `I[A -> B]` records the effect of adopting A on B's usefulness, cost, applicability or viability. The signed ordinal scale remains `+4 .. -4`; `null` remains unassessed, never neutral.

This revision corrects terminalization edges so that the strength of the proved proposition is explicit.

## Required interaction fields

Each assessed edge records:

```text
source
target
projected_value
projected_confidence
observed_value
observed_confidence
scope
regime
proof_goal_scope
terminal_proposition_strength
relation_kind
mechanism
evidence_basis
```

The last two proof fields may be null for ordinary non-terminal interactions.

## Why proof-goal scope matters

A terminal certificate can completely erase one proof obligation while only partially helping another.

Example:

```text
A10 compatible Allis cover
    -> binary question: can opponent win?
       full semantic terminalization when valid cover closes

A10 compatible Allis cover
    -> exact distance-sensitive score
       only a one-sided bound unless another fact distinguishes draw/controller win and distance
```

Therefore the same source/target pair may carry different signed edges under different proof goals.

## Correct terminalization nodes

### Exact/complete terminalizers

- `IWIN` — immediate exact winning result; one-ply.
- `DTH` — bounded forced exact loss outcome.
- `BEXH` — bilateral win-space exhaustion; exact draw over the unbounded remaining horizon.

Where these settle the solver's full current value, downstream search machinery receives scoped negative `subtree-erasure-saturation` edges.

### Partial strategic terminal certificates

- `EXH` — one-sided win-space exhaustion; proves one player cannot win.
- `A10` — compatible Allis rule cover; proves the covered opponent cannot realize a winning group under the certified strategy.

These fully terminalize matching **binary win/no-win proof goals**, but only partially saturate a complete exact-distance solve.

### Strategic certificate components

`A1` through `A9` are exact future ownership/resource certificates with strategic/unbounded reach. They normally feed A10. A single instance can conditionally close the one-sided no-win proposition if its valid solved-group coverage spans every relevant opponent requirement.

### Projected strategic terminalizer

`ZPAR` remains a separate exact parity/Zugzwang future-terminal candidate. Its intended proposition is an exact eventual outcome/class from parity and Zugzwang structure. Its distance-sensitive authority remains unproved, so graph edges into exact-distance search stay weaker/uncertain than they would for an exact-value certificate.

### Not terminalizers

The following remain future-looking or early-return-capable but are **not semantic terminalization**:

- `FBLK`, `FMAC`;
- `CARD`, `SEWB`;
- `AUTO`, `DEAD`;
- `IMPL`;
- `TT exact hit`, `CPR`, `JOIN`;
- `E1`, `E2`, `E3`, `P1`;
- `P2` proof-number search;
- cache/layout/parallel/resource candidates.

`E2` is explicitly corrected from `certificate-component` to **terminalization-enabling metadata only**. The current parity heuristic does not have exact proof authority by itself.

## Terminalizer-to-search edge semantics

Negative edges from terminalizers use these relation kinds:

- `subtree-erasure-saturation` — the remaining subtree does not exist for the satisfied proof goal;
- `bound-subsumption` — a stronger terminal proposition makes a weaker bound unnecessary;
- `search-structure-saturation` — ordering/parallelism/canonicalization has no work below the hit;
- `cache-opportunity-saturation` — no descendant TT traffic exists below the hit.

These are not incompatibility edges.

## Proposition-aware examples

### BEXH

```text
BEXH -> CARD   = -3 in exact-score hit states
BEXH -> SEWB   = -3 in exact-score hit states
BEXH -> AUTO   = -2 in exact-score hit states
BEXH -> E1     = -2 in exact-score hit states
BEXH -> YBWC   = -2 in exact-score hit states
```

Reason: exact draw value closes the whole state.

### EXH

```text
EXH -> downstream exact-distance search
  proof_goal_scope = can-exhausted-side-win
  strong negative/full terminalization

EXH -> downstream complete exact-score search
  partial negative only
```

Reason: `cannot win` does not distinguish draw from loss for the exhausted side.

### A10

The same pattern applies. A valid rule cover can completely close a binary opponent-win obligation yet leave controller-win/draw/distance refinement unresolved.

### ZPAR

Until formalized:

```text
ZPAR -> exact-WDL search
  projected strong negative in certificate-hit states

ZPAR -> exact-distance refinement
  projected mild-to-material negative, not full exclusion
```

If ZPAR later proves exact distance as well as W/D/L, the latter edge can be upgraded.

## Enabling graph around terminalization

Important positive edges include:

```text
RWS -> EXH/BEXH/A1..A10/ZPAR
RID -> A1..A10/ZPAR
SUP-event -> A1..A10/ZPAR
INC -> A1..A10/ZPAR
A1..A9 -> A10
E2 -> ZPAR and selected Allis instance generation
```

The mechanism must be named correctly:

- `E2 -> ZPAR` is metadata/cost support, not proof authority transfer;
- `SUP-event -> A4/A8/A9` can be validity enabling because event order/accessibility is part of the exact rule preconditions;
- `RWS -> BEXH` exposes the exact empty-obligation condition directly.

## Interaction economics for terminalization

Every future-terminal experiment should record:

```text
checks
hits
hit rate
proposition strength
proof-goal closed
semantic horizon skipped
avoided nodes or obligations per hit
avoided wall time per hit
check cost
false positives
false negatives where measurable
```

Partial certificates must be credited only for the proof work they actually erase.

## Graph data

The current structured slice is:

`docs/research/evidence/2026-09-09-signed-interaction-graph-terminalization-v2.json`

The earlier v1 slice remains historical evidence and is superseded for terminalization classification.