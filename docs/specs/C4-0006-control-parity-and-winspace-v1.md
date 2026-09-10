# C4-0006 — Control Parity and Winspace v1

**Status:** Candidate structural-mathematics specification on `feature/cuda-bsfp`; not Accepted until reviewed and integrated through the repository's normal authority path.

## Purpose

Promote the established **CPC — Control Parity Calculus** and **WSL-625 — Winspace Lattice 625** research into a Connect4-owned product specification.

This specification owns structural/domain mathematics only. It does not define NDC proof closure, BSFP W/D/L solver semantics, CUDA execution, generic GPU workset mechanics, or performance policy.

## Depends on

- C4-0001 Connect Four domain semantics;
- the preserved research/evidence packet on `feature/cuda-bsfp`, especially:
  - `docs/research/2026-09-09-bsfp-terminology-and-attribution.md`;
  - `docs/research/2026-09-09-universal-strategic-algebra.md`;
  - `docs/research/2026-09-09-win-space-representation-discussion.md`;
  - `docs/research/2026-09-09-winspace-results.md`;
  - `docs/research/2026-09-09-native-winspace-candidate-results.md`;
  - associated winspace evidence/prototypes.

Research documents remain provenance/evidence; this file is the formal structural contract for the scope stated here.

## Ownership

Connect4 owns:

- geometric Connect Four winning-line meaning;
- legal support/accessibility meaning under gravity;
- future placement-event meaning;
- CPC event-rank/control semantics;
- WSL-625 requirement/blocker semantics;
- residual requirement transitions;
- structural implication, subsumption, blocker coverage, exhaustion, and any exact dominance relation used by the solver.

CUDA-Algorithms does not own these facts merely because it may later order, group, compact, or schedule indices representing them.

## 1. Structural event model

After the already played prefix is fixed, the future board is represented by future placement events constrained by gravity.

For each column `c`, future cells form a strict chain:

```text
(c, h_c) < (c, h_c + 1) < ... < (c, H - 1)
```

where `h_c` is the current filled height of column `c`.

A support/accessibility skeleton must preserve enough information to decide which future event is currently playable and which events precede another event. Two structural records are not interchangeable merely because their surviving winning sets look similar if their legal support/event order differs.

## 2. CPC — Control Parity Calculus

For a future target cell `t = (c, r)`, the basic event-count form is:

```text
N(t)
  = (r - h_c + 1)
    + sum_{d != c}(H - h_d)
```

With current occupied-cell count:

```text
ply = sum_d h_d
```

this reduces algebraically to:

```text
N(t) = (W - 1)H - ply + r + 1
```

The target-column height cancels from the reduced expression.

The parity of the event rank determines which side would receive that event in the zero-reservation/basic case:

```text
ownerParity(t) = (N(t) - 1) mod 2
```

interpreted relative to the side to move.

For standard 7x6 Connect Four, `(W - 1)H = 36` is even, so the basic parity reduces to current move parity plus target-row parity.

### CPC is not a standalone ownership oracle

CPC parity is exact only under the structural conditions represented by the applicable event reservoir. Support, forced responses, reserved/released events, blockers, deadlines, and race conditions can alter which events participate before a target.

Therefore production code must not treat the simple parity expression as permission to claim unconditional future ownership when the proof state contains unresolved response/resource/timing conditions.

A fragment that changes the number of relevant prior events by `Delta` preserves target parity exactly when:

```text
Delta mod 2 = 0
```

This even-release relation is a reusable CPC invariant.

## 3. Primitive CPC relation forms

The structural algebra may represent exact facts such as:

```text
owner(e) = P0 | P1
owner(e1) XOR owner(e2) = 0 | 1
response(e_trigger) -> e_response
e_before < e_after
```

and bounded deadline/race relations that state that an opponent cannot acquire an entire requirement before a certified completion event.

These are structural facts. Their nesting and proof closure are governed by C4-0007, not this specification.

## 4. WSL-625 — Winspace Lattice 625

For standard 7x6 Connect Four, let `L` be the 69 geometric four-cell winning lines.

The WSL semantic universe is the set of unique non-empty subsets of those winning lines:

```text
WSL = unique({ s | exists line in L: empty != s subset_of line })
```

For standard 7x6:

```text
|WSL| = 625
```

Each WSL element can represent a residual winning requirement or a strategic blocker, depending on role.

The **625-element semantic universe is normative** for standard 7x6. A particular numeric RID/ID assignment is an implementation representation unless a later accepted table freezes that ordering explicitly.

Other Connect Four geometries have their own corresponding residual universes and must not be mislabeled WSL-625.

## 5. Residual winning requirements

For each player `p`, maintain the surviving residual requirements implied by the already fixed history/support state.

A requirement is the set of future cells that player still must own to complete one surviving geometric winning line.

For a legal placement at cell `x` by player `p`:

- every surviving `p` requirement containing `x` removes `x` from that requirement;
- every surviving opponent requirement containing `x` is permanently blocked and disappears;
- requirements not containing `x` remain unchanged;
- an empty surviving mover requirement denotes a newly completed winning line, subject to the terminal/first-win rules owned by C4-0008.

A removed physical-color distinction must never permit a previously blocked winning line to reappear.

## 6. Minimal-antichain normalization

Within one player's requirements at identical support/accessibility context:

- exact duplicate requirements are deduplicated;
- if requirement `a` is a strict subset of requirement `b`, `b` may be removed because satisfying `a` is sufficient to satisfy the same player's completion objective no later than `b` in the residual set semantics.

The normalized requirement collection is therefore a minimal antichain under subset inclusion.

This normalization is exact only inside the structural context whose support/event facts make the two records comparable. It is not permission to compare arbitrary records across incompatible support skeletons.

## 7. Blocker semantics and upward closure

A certified blocker `b` for player `p` means:

```text
opponent cannot own every event in b
```

before the relevant proof horizon/terminal deadline.

An opponent residual requirement `r` is solved by blocker `b` when:

```text
b subset_of r
```

For a fixed WSL universe, implementations may precompute the upward closure:

```text
Up[b] = { r in WSL | b subset_of r }
```

Then a set of certified blockers `B` solves the union of their upward closures.

The expensive/specific fact is **whether a blocker is certified**. Once certification exists, subset/upward-closure coverage is structural WSL algebra.

## 8. Exhaustion

If one player's residual requirement set is empty and no prior terminal win has occurred, that player has no remaining geometric winning possibility.

If both players' residual requirement sets are empty and no earlier win exists, the remaining region is exact draw territory subject to legal terminal semantics.

Exhaustion does not authorize continuation past an already completed win.

## 9. Structural equality

A hash is never exact structural equality.

An exact WSL/CPC state identity must preserve every fact that can affect future legal transitions or proof meaning, including at least the selected profile's:

```text
support/accessibility or equivalent legal frontier
side/event parity
normalized surviving requirement sets
certified blocker state where material
CPC response/parity/order facts where material
first-win/terminal preconditions where material
```

An implementation may prove a smaller sufficient state. It may not remove a distinction merely because it appears irrelevant on sampled games.

## 10. Residual dominance

The research line established a candidate residual-dominance order at identical support/accessibility skeletons under which stronger P0 residual state cannot reduce P0's game value.

Any production use of dominance/antichain W/L regions must state the exact order relation it implements and qualify monotonicity independently. The broad slogan `S >= T => V(S) >= V(T)` is not an implementation contract without the corresponding record/order definition.

C4-0008 may consume an independently qualified dominance relation; CUDA-Algorithms does not define BSFP dominance.

## 11. Relationship to prior Connect Four theory

Victor Allis's earlier published VICTOR rules and Control of Zugzwang are related prior work. This project may compile credited named rules into CPC/response/blocker forms for regression and comparison.

Named-rule compatibility is not normative runtime vocabulary for this specification. The product contract is the underlying event/parity/response/blocker semantics.

## Qualified evidence carried into this specification

Preserved research evidence includes:

- algebraic equivalence of the original future-target count and the reduced event-rank expression;
- the exact fixed 625-element standard-7x6 residual requirement/blocker universe;
- exact win-space identity tests showing distinct colored histories can collapse when their residual structural state is identical;
- exhaustive small-game residual-state/equivalence checks and independent late-7x6 controls;
- exact blocker/subset/upward-closure experiments;
- no evidence that hash equality alone is sufficient for exact state identity.

These results support the structural semantics. They do not by themselves establish an empty-board 7x6 BSFP solve or a final GPU representation.

## Non-claims

This specification does not claim:

- CPC alone solves Connect Four;
- WSL-625 alone solves Connect Four;
- every Allis rule is already completely reduced to the universal algebra;
- a particular packed ID layout is compatibility authority;
- exact distance-to-win/loss;
- CUDA/GPU support or performance.

## Falsifiers

Rework this specification or a proposed representation if:

- two records treated as equal produce different legal structural transitions or W/D/L outcomes;
- a blocked geometric winning line can reappear after residualization;
- antichain minimization changes an exact result;
- CPC claims ownership without preserving required response/resource/race conditions;
- WSL IDs are treated as semantic equality while their underlying requirement sets differ;
- a support/accessibility distinction removed by compression changes which future event is legal or its strategic ordering.
