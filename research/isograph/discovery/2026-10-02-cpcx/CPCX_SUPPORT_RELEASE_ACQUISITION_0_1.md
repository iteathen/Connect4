# CPCX Support-Release Acquisition 0.1

**Status:** qualified exact claim-relative theorem  
**Scope:** experimental CPCX only  
**Observation:** one protected controller residual under a pinned progress event


## Qualification result

Qualified on 2026-10-03 by the isolated `Research CPCX support-release acquisition` workflow.

- run: `37168820777` — SUCCESS
- tests: 7
- pass: 7
- fail: 0

The qualification includes fresh empty-board and non-bottom positive controls, rejection when the pinned controller action supplies the target, rejection of an opponent-terminal support trigger, rejection when supply creates a distinct opponent singleton, rejection when the target is outside the protected residual, and source-isolation checks against production CPC, solver, solved-data, oracle, and recursive-search dependencies.

Workflow success is execution evidence; the theorem remains bounded by the premises and conclusion stated below.

## Purpose

Provide the owner-side dual of support-release response neutralization.

A protected controller residual may contain a missing target `t` whose support
distance is exactly one.  If the controller first makes an independently
selected progress event outside `t`'s column, the opponent receives the next
turn.

The opponent then has two structural classes relative to `t`:

```text
SUPPLY:   occupy the unique support cell s below t
EXTERNAL: play any other current event
```

When the SUPPLY event is nonterminal and creates no competing opponent
first-terminal obligation, the controller gets the next turn and may occupy
`t`.  That owner-labelled event contracts the protected residual.

This theorem certifies that local acquisition edge.  It does not claim that the
opponent must supply `s`, that the residual must eventually complete, or that
an EXTERNAL event is strategically losing.

## Objects

Let `S` be an exact nonterminal finite-gravity position.

Let:

- `A = S.mover` be the controller;
- `D = A ^ 1` be the opponent;
- `R` be one live `A` residual;
- `t` be one explicitly selected missing cell of `R`;
- `supportDistance_S(t)=1`;
- `s` be the unique current frontier cell immediately below `t`;
- `d` be one pinned, independently selected current `A` progress event.

## Premises

Certification requires all of the following.

1. **Exact nonterminal source.** `S` is exact, nonterminal, and `A` is to
   move.

2. **Exact live protected residual.** `R` is a current live `A` residual,
   `t` belongs to its missing-cell set, and `t` has support distance one.

3. **Unique release cell.** The cell `s` immediately below `t` is the
   current legal frontier in `t`'s column.

4. **Pinned progress is outside the residual.**
   - `d` is current legal frontier;
   - `d` is outside `t`'s column;
   - `d` is not a missing cell of `R`;
   - `A:d` is nonterminal.

5. **Pinned progress does not release `t`.** After `A:d`, `t` still has
   support distance exactly one and `s` remains the unique frontier in its
   column.

6. **Opponent first-win guard before the response class.** After `A:d`, the
   opponent has no currently playable singleton terminal.

7. **Current external-class residual safety.** Every opponent frontier event
   other than `s` is disjoint from the current missing-cell set of `R`.
   Therefore one EXTERNAL event cannot kill `R` immediately.

   This premise is intentionally one-step and claim-relative.  It does not say
   later external events are irrelevant.

8. **SUPPLY is nonterminal.** Exact event `D:s` is legal and does not itself
   terminate for `D`.

9. **No competing opponent singleton after SUPPLY.** After `A:d ; D:s`, the
   opponent has no currently playable singleton.  Thus the controller's
   acquisition turn is not simultaneously consumed by a distinct urgent block.

10. **Target acquisition is legal.** `t` is current frontier after SUPPLY.

11. **First-win exactness.** Exact fixed event

```text
A:d ; D:s ; A:t
```

respects first-terminal stopping.  If `A:t` is terminal, it is an immediate
controller first-win certificate.  Otherwise the continuation remains
nonterminal.

12. **Protected cofactor contraction.** Exact owner-labelled residual algebra
    verifies:
    - `A:d` leaves `R`'s missing-cell identity unchanged;
    - `D:s` leaves `R` live;
    - `A:t` contracts `R` by exactly the selected cell, or completes it.

13. **Post-acquisition opponent urgency guard.** If `A:t` is nonterminal,
    the opponent has no currently playable singleton immediately afterward.

## Conclusion

Under Premises 1-13, relative to the pinned controller action `d`, CPCX may
emit:

```text
SUPPORT_RELEASE_ACQUISITION_EDGE
    D:s -> A:t
```

with exact meaning:

### EXTERNAL class

Every current opponent event other than `s` is outside `t`'s column and
does not occupy a missing cell of `R`.

Therefore that one event:

- cannot release `t`;
- cannot immediately kill `R`;
- leaves the selected acquisition question unresolved for a later structural
  transition.

No value claim is made for the EXTERNAL class.

### SUPPLY class

If the opponent occupies `s`, then `t` becomes legal for `A`.
The controller occupies `t` on the next turn.

The result is either:

```text
CERTIFIED_FIRST_WIN(A)
```

when `A:t` is terminal, or:

```text
exact protected-residual contraction
+ turn returned to D
+ no immediate D singleton
```

when nonterminal.

Thus an opponent support event can be represented as progress on the protected
residual rather than as an arbitrary branch.

## Projection discipline

This theorem does not authorize deletion of the EXTERNAL class.

A surrounding defect-transport or finite-resource theorem must separately prove
that repeated EXTERNAL events:

- consume a finite resource;
- preserve the protected residual or move it to another admitted descriptor;
- cannot introduce an earlier opponent terminal;
- eventually force a SUPPLY/acquisition transition or another certified
  controller completion.

Shared response/acquisition cells must be deduplicated by physical event before
capacity accounting.

## First-win semantics

All concrete events in the SUPPLY macro are checked under exact stopping.

`NO_CERTIFICATE` remains epistemic only.

## Complexity

For fixed CPCX residual cardinality `K<=4`:

```text
frontier/residual guard: O(columns + liveLineCount)
fixed-event audit:       O(line incidence)
cofactor audit:          O(K)
```

No recursive legal-move traversal is performed.

## Required qualification controls

Qualification must include:

1. a fresh positive case not derived from `44444`;
2. a fresh non-bottom target at support distance one;
3. rejection when the pinned controller action itself supplies the target;
4. rejection when SUPPLY is an opponent terminal;
5. rejection when SUPPLY creates a distinct immediate opponent singleton;
6. rejection when the target is not a member of the protected residual;
7. production-CPC / solver / oracle / recursive-search isolation.

## UC4A-CPCX use boundary

The current bridge candidate contains the P0 diagonal residual

```text
A6-B5-C4-D3
missing = {A6,B5,C4}.
```

After the one-support-short escape `P1:B3`, `B5` is one support step short
with release cell `B4`.

This theorem may be instantiated after an independently selected P0 event such
as a safe support-progress event outside column B.

It does not by itself prove that P1 must play `B4`, nor does it prove
`Best(44444)`.
