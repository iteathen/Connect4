# Connect4 frontier-native forward-solver research status

**Updated:** 2026-09-11  
**Canonical research line:** `research/semantic-quotient`  
**Current repair branch:** `research/semantic-quotient-explore-hints`

## Governing structural chain

The forward Negamax lane does not own the Connect Four structural mathematics it consumes.

Read the current model as:

```text
C4-0001  domain/legal game
  -> C4-0006  CPC + WSL-625 structural mathematics
  -> C4-0007  NDC strategic dependency semantics when consumed
  -> C4-0010  forward exact Negamax consumption/execution policy
```

The broader research architecture is:

```text
geometric winning-line axioms
  -> CPC control parity / event precedence / race
  -> WSL-625 requirements and blockers
  -> NDC nested dependency closure
  -> solver-specific exact proof procedure
```

BSFP is the backward fixed-point solver lane. Quotient Negamax is a separate exact forward solver/control that should consume the same structural facts where applicable rather than flatten them into conventional search heuristics.

## Current objective

Bring the forward W/D/L Negamax implementation into conformance with the frontier mathematics **before another standard-7x6 root performance claim**.

The immediate objective is not another larger TT or deeper fixed split. It is to remove conventional-engine assumptions that distorted the previous root experiments.

## Exact forward quotient projection

The current ordinary forward projection remains:

```text
q = supportIndex
  + normalized P0 residual winning requirements
  + normalized P1 residual winning requirements

sideToMove = rank(supportIndex) & 1
```

Complete bounded controls checked 1,681,808 reachable physical states with zero quotient/exact W/D/L mismatches in the qualified campaigns.

This projection is not the whole NDC closure state. Strategic certificate facts that depend on parity reservoirs, response resources, blockers, event order, race horizon or deadlines require those premises to remain derivable or explicitly represented.

## CPC control invariant

For base target event `t=(c,r)`:

```text
N(t)
  = (r - h_c + 1)
    + sum_{d != c}(H - h_d)
  = (W - 1)H - ply + r + 1
```

Future control is determined by event-rank parity relative to side to move.

If a strategy/frontier transformation changes the relevant reservoir by `Delta`, control is preserved only when the relevant parity change is even and the corresponding resource/response/event-order guards still hold.

Therefore CPC must not be replaced by static row parity, and a compressed frontier may not silently discard the parity effect of omitted/released events.

## Frontier move value

The legacy player-relative live-line value is:

```text
value_p(cell)
  = number of original geometric winning lines through cell
    with no opponent stone in that line
```

One opponent stone cancels the line for player `p`; own stones do not.

The standard empty-root vector:

```text
[3, 4, 5, 7, 5, 4, 3]
```

is derived evidence only.

The current explore prototype reconstructs occupancy from a representative path. That was useful to verify the old value but is not the desired frontier-native representation. The next form should maintain player-relative live geometric-line masks/provenance incrementally as advisory branch context. It must not become quotient proof identity.

## Current implementation mismatch

The active recursive Negamax engine still uses proof hint followed by `centerOrder`, and one worker path can reverse that order by worker salt. The authoritative solver therefore has not yet adopted frontier-native ordering.

Current forced-move handling also advances one forced ply at a time even though earlier research established deterministic forced macro-edge/decision-state handling as an exact structural optimization.

The shared semantic TT currently allocates identity on proof read (`findOrCreate`). Thus every touched state, including deterministic transit states, consumes a shared slot. The previous 8,388,608-entry saturation proves touched/interned-state pressure under that admission policy, not that 8.39M retained proofs are intrinsically necessary.

## Branch Manager model

**Branch Manager** is the current execution-role name.

Its intended role is proactive bounded frontier-work supply and hosted background services. Search workers do not request new work and wait. Busy workers are not interrupted.

Ready-work precedence is:

```text
authoritative dependency-qualified proof work
  > queued frontier exploration
  > idle
```

Exploration discovers frontier structure and likely future branches; only the Negamax dependency state can turn a branch into a parent-advancing alpha/beta obligation.

The rename is not yet completely propagated through all older campaigns/root-attempt files; stale `startOnlineMaintenanceHost` references remain and must be removed directly rather than preserved by aliases.

## Exact terminal/strategic closure

Current `tacticalCode()` correctly specializes cheap local residual cases:

- immediate playable singleton win;
- one forced opponent singleton response;
- multiple distinct playable opponent singleton threats -> forced loss where applicable;
- bilateral exhaustion/no-continuation draw.

This is not the full common terminalization algebra.

The research model permits:

```text
parity/response fact
  -> certified blocker
  -> WSL upward-closure elimination
  -> changed event obligations
  -> stronger parity/response fact
  -> ...
```

with timing/race premises first-class. One-sided exhaustion is already an exact no-win bound and should be consumed by the forward solver.

## Current evidence retained

Standard 7x6 representation checkpoints:

```text
WSL term vocabulary:      625
rank-8 q states:          797,388
rank-8 residual classes:  1,357,101
rank-9 frontier:          538,774
```

Bounded dependency-aware parallel Negamax and online semantic identity both produced exact qualified results. The 7x6 depth-8 root attempt activated all three hosted search workers but exhausted an append-only 8,388,608-entry shared semantic table before root proof.

That storage result must now be reinterpreted in light of allocate-on-read and deterministic-transit admission.

## Current work order

1. finish Branch Manager rename and remove obsolete maintenance-worker references;
2. replace representative-board live-line reconstruction with incremental live-line frontier context;
3. make authoritative Negamax ordering frontier-native;
4. preserve CPC parity when frontier events are compressed/reserved/released;
5. consume one-sided exhaustion and other already-qualified exact frontier bounds;
6. collapse forced chains and use decision-state-aware proof admission;
7. separate TT probe from allocation and remeasure actual retained-proof pressure;
8. make Branch Manager self-replenishing with bounded semantic seen/dedup state;
9. consume sibling proof completions incrementally without interrupting workers;
10. rerun standard-7x6 only after these execution assumptions are removed.

## Open mathematics

Complete cheap forward integration of U1/U2/NDC is not yet established. In particular, early-game response-policy alternatives may or may not collapse completely into GF(2), monotone closure, dominance, matching or another compact algebra without strategic branching.

Do not claim that the forward Negamax lane has solved that open problem merely because it can search through unresolved decisions.

## Pre-alpha

There is no released compatibility contract. Rename/replace/delete obsolete implementation directly and update all current consumers. Preserve useful research evidence, not compatibility debris.