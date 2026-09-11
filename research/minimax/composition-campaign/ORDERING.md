# Minimax candidate composition ordering

This campaign does not treat optimization candidates as an unordered bag of toggles.

The governing sources are:

- `docs/research/2026-09-09-directional-core-synergy-map.md`;
- `docs/research/2026-09-09-signed-candidate-interaction-model-v3.md`;
- `docs/research/evidence/2026-09-09-signed-interaction-graph-terminalization-v2.json`;
- `docs/research/2026-09-09-categorical-reasoning-calibration.md`.

## Default dependency/saturation order

### 0. Semantic/execution substrate

These are representation owners rather than recursive policy switches:

`RWS -> RID -> SUP -> INC -> FW`

- RWS owns remaining-game semantic requirements.
- RID makes the requirement vocabulary finite and addressable.
- SUP owns exact gravity/accessibility/event timing.
- INC derives transition-local facts from the shared substrate.
- FW is the final low-level realization constraint; it must not weaken semantic identity.

### 1. Exact tactical normalization

At each recursive state:

`IWIN -> DTH -> FBLK -> FMAC`

This order is semantically constrained:

1. an immediate win closes the exact value first;
2. an opponent double immediate threat closes the bounded forced loss;
3. exactly one opponent immediate threat restricts the only non-losing move;
4. repeated unique forced moves are traversed as a macro edge until the next decision state.

FBLK is the primitive that enables FMAC. Transit states should not be exposed to expensive downstream decision machinery unless a specific cache-reuse control is being tested.

### 2. Cheap exact terminal/bound facts

After tactical normalization reaches the current decision state:

`BEXH -> EXH -> CARD/SEWB`

- BEXH is an exact draw/value fact and therefore precedes weaker one-sided bounds.
- EXH supplies one-sided no-win bounds.
- CARD and SEWB are alternate/overlapping earliest-win bounds; SEWB should normally be tested as a substitution for CARD rather than blindly stacked.

Where evaluation order can only change check cost rather than the resulting bound, both orders may be timed while node counts are expected to remain invariant.

### 3. Semantic action/state quotienting

Default:

`DEAD -> AUTO`

DEAD is only valid in its exact neutral-tempo/event-safe form. Collapsing multiple dead physical columns without retaining their remaining tempo capacity is not accepted evidence.

DEAD precedes AUTO because the synergy map projects `DEAD -> AUTO` as an applicability/state simplifier: removing dead distinctions can enlarge automorphism classes. The reverse order remains an explicit control because runtime economics can differ.

If AUTO is implemented as action-orbit pruning rather than full state canonicalization, orbit representatives should be selected **before expensive child scoring**. A post-order AUTO variant remains a control to measure this ordering effect.

### 4. Proof/cache retrieval

Exact proof reuse should be consulted before heuristic ordering work. Candidate families include:

- exact TT / compact TT identity;
- PH-separated exact bounds vs hints;
- implication/dominance proof bounds;
- completed coarse-proof reuse where applicable.

The exact ordering of cheap local semantic bounds vs TT lookup is implementation-sensitive and must be crossed on the production-shaped kernel rather than assumed from a high-level harness.

### 5. Decision move ordering

Only surviving distinct decision actions are scored.

Default composition family:

`MHINT (if nearly free) -> E1 maturity -> E2 parity tie-break/secondary -> P1 proof-cost tie-break`

This is not a claim that this exact lexical order is final. The campaign must test:

- E1 alone;
- E2 primary;
- E1 then E2;
- E2 then E1 where meaningful;
- P1 primary and P1 as a secondary/tie-break signal;
- hints before/after semantic scoring when packed hints are available.

Historical adverse evidence against one ordering form does not reject the underlying feature in another role.

## Order-sensitive required controls

The campaign should explicitly retain both legal orders, or the best justified subset, for:

1. `DEAD -> AUTO` vs `AUTO -> DEAD`;
2. AUTO before child scoring vs AUTO after scoring;
3. E1/E2/P1 lexical priority permutations;
4. CARD vs SEWB substitution and check order;
5. cheap exact semantic bounds vs TT lookup on a production-shaped fixed-width kernel;
6. proof reuse before ordering vs ordering metadata generated first when the latter metadata is already paid for.

## Evidence discipline

No candidate is rejected because one ordering loses.

Record separately:

- candidate set;
- exact execution order;
- semantic regime/root cohort;
- exact score parity;
- nodes;
- TT traffic;
- checks/hits/cutoffs;
- time;
- memory/metadata cost;
- whether the tested edge was projected or previously observed.

A candidate can be retained as order-sensitive/regime-sensitive even if its median standalone effect is negative.
