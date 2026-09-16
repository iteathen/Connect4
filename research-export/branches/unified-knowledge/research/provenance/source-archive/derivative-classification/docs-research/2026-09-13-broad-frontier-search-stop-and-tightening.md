# Broad-frontier search stop and tightening boundary

**Date:** 2026-09-13  
**Research direction / structural target:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT  
**Branch:** `research/frontier-negamax-conformance`

## Status

**NEGATIVE CONTROL + ACTIVE TIGHTENING BOUNDARY.**

This note records where the standard-7x6 hard-frontier program was deliberately
stopped under the agreed bounded-experiment rule.

The result is not that recursive proof composition failed. It is the opposite:
recursive hard-frontier composition is now a sound and useful partial calculus, but
the current positive base alphabet `I / E(O)` is too weak to keep the broad frontier
small. Continuing exact-q recursion without a new theorem reconstructs a large state
space and is therefore rejected.

## 1. Current constructive coverage

At the retained depth-8 standard-7x6 positive proof frontier:

```text
1,141 total frontier states
  319 immediate P0 wins
  822 recursive obligations
```

Constructive structural closure currently proves:

```text
99  shallow I/O/E/A roots
62  additional generalized unique-hard chains
24  additional low-width branching-frontier roots
---
185 / 822 recursive roots
```

Including the 319 immediate leaves:

```text
504 / 1,141 depth-8 states
```

The hard-frontier theorem and exact-q normalization rules are recorded in
`2026-09-13-hard-frontier-recursion-calculus.md`.

## 2. Decisive no-oracle target search

Target control:

```text
46656555
```

A bounded structural AND/OR search was run with:

```text
base leaves:           I and E(O)
P0 semantics:          try every legal existential move
P1 semantics:          require every legal reply
identity:              exact C4-0010 q
external oracle:       none
maximum macro depth:   8
q-state cap:           100,000
recursive-call cap:    250,000
workflow timeout:      10 minutes
```

The run hit the **q-state cap**, not the wall-clock timeout.

Observed iterative growth:

```text
depth 1:
  +2,258 q states
  2,267 cumulative
  8 recursive proof calls

depth 2:
  +11,362 q states
  13,629 cumulative
  66 cumulative proof calls

depth 3:
  +42,594 q states
  56,223 cumulative
  358 cumulative proof calls

depth 4 attempt:
  cap reached at 100,001 q states
  758 cumulative proof calls
```

No proof had closed before the cap.

The very small recursive-call count relative to the q-state count matters: the
failure mode is **semantic consequence-space expansion**, not slow recursion or an
implementation bottleneck.

Therefore:

```text
Do not increase the state cap.
Do not increase recursive depth.
Do not treat more exact-q exploration as mathematical progress.
```

This is not a claim that `46656555` is non-winning. It bounds the present base
calculus only.

Reproducer:
`research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-target-structural-proof-search.mjs`

Workflow run:
`34793768681`, job `103822816609`.

## 3. Why witness choice alone is insufficient

Earlier controls showed that canonical witness selection can be locally poor.

For `46656555`:

```text
canonical hard-width history:
2 -> 6 -> 26
```

Choosing, among exact winning discovery moves, the move with minimum immediate hard
count changes the beginning to:

```text
1 -> 1 -> 1 -> 1 -> 1 -> 6 -> 28
```

So witness choice can postpone or reshape expansion, but it does not eliminate the
broad regime.

The no-oracle all-witness target search above then showed that simply trying all
witnesses globally is also too unconstrained under `I / E(O)`.

Thus the missing object is not merely a better move-ordering heuristic.

## 4. Residual-hub hypothesis retained only as contextual evidence

The tight `4665655*` sibling differential found that P1 reply 5 at `(column 5,row 4)`
removes nine P0 residual requirements at once, versus only two or three in the nearby
closing siblings. Several of the removed low-cardinality requirements shared the same
future event and looked like a progress hub.

A cross-control over all 13 binary seeds falsified every tested scalar hub statistic as
a standalone separator. Closed binary proofs can have the same:

- common residual count;
- maximum hub incidence;
- low-cardinality hub incidence;
- playable/future hub counts;
- support distance.

Therefore residual hubs remain a contextual transport clue, not a theorem.

## 5. Successor-set race blocker screen

The accepted compatible-cover/progress calculus contains a generic race-blocker
construction:

```text
own residual Q
-> successor set S(Q)
-> certified blocker against opponent residuals containing S(Q)
```

Before spending work on CPC/NDC timing certification, a necessary geometric cover
screen was run on the four tight sibling states:

```text
46656551
46656552
46656555
46656557
```

Result:

```text
state      opponent residuals   geometrically uncoverable by race blockers alone
46656551   38                   10
46656552   38                   10
46656555   39                   15
46656557   39                    9
```

So successor-set race blockers alone cannot form a total policy cover even in the
three closing sibling controls.

The bad sibling is structurally worse under this screen, but the route is incomplete
for all four states. Do not promote race-blocker count into a classifier.

Reproducer:
`research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-race-blocker-cover-screen.mjs`

Workflow run:
`34793934108`, job `103823281070`.

## 6. Tightening inference

The current broad frontier is best interpreted as a **policy-fragment composition
gap**.

The exact-q hard-frontier calculus proves states one by one. In the broad regime this
creates many exact obligations. The existing compatible-cover theory provides a more
appropriate proof object:

```text
local structural fragments
  + requirement coverage
  + typed response resources
  + CPC ownership / release constraints
  + NDC guards and precedence
  + compatibility
  + well-founded own progress
  -> total positive policy certificate
```

This is stronger than another snapshot predicate and different from a coarser state
quotient. It proves a family/set of obligations by a shared policy invariant.

The next experiment should therefore add **fragment types**, not search depth.

## 7. Existing fragment families to compose

Do not invent arbitrary new predicates before testing the already-derived families:

1. direct playable singleton / immediate completion;
2. poisoned-support restrictions;
3. stacked-singleton / response overload;
4. reusable vertical response-pair contracts where their CPC/deadline guards hold;
5. exclusive guarded response intervals;
6. successor-set race blockers;
7. ordinary blockers generated from certified ownership/control facts.

Each fragment must expose the generic contract interface:

```text
Coverage
Resources
Responses
Parity/CPC commitments
Order/deadlines
Guards
Progress consequence
```

The current `I/E(O)` recursion already realizes the first three when they become
concrete. The new compression opportunity is to recognize and compose them **before**
expanding every physical alternative, together with the richer response/race
fragments.

## 8. Bounded next test

Use the `4665655*` family as the primary differential.

For each sibling, compile the existing fragment families into a finite typed-contract
instance and measure, without legal-move recursion:

```text
opponent requirements covered
uncovered residual core
forced fragments
fragment dominance eliminations
independent components
CPC/parity contradictions
order/deadline contradictions
resource conflicts
candidate controlled-completion requirements
```

Acceptance condition for continuing this route:

- the three nearby closing siblings must obtain a substantially smaller residual
  compatible-cover core than `46656555`, or;
- a common positive policy skeleton must emerge that can be independently proved and
  then applied to the bad sibling/broad frontiers.

Stop condition:

- if the typed fragment instance remains essentially injective/state-specific, or
  requires generic backtracking comparable to the physical proof tree, stop and seek a
  different structural primitive.

## 9. Current conclusion

The discovery space is **not globally small enough under the current base grammar**.
That question has now been experimentally answered.

But it is also not unconstrained everywhere:

- 504/1,141 depth-8 states already close constructively;
- unique-hard and low-width frontiers often collapse;
- 12/13 first binary frontiers close;
- exact-q recursion fails specifically when a broad policy regime is reached.

The credible next compression layer is therefore a typed compatible-cover + progress
certificate over the finite WSL/CPC/NDC substrate, not deeper exact-q recursion.
