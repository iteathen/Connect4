# Colored event structure and proof-antichain control

**Date:** 2026-09-13  
**Status:** bounded control + exact local confluence theorem + broader isomorphism candidate  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / isomorphic-structure inquiry / asynchronous-turn-parity framing:** **Josh Oshiro**  
**Formalization, bounded control, and synthesis:** OpenAI ChatGPT

## Purpose

The current research landscape contains several objects that appear under different names but share the same underlying mathematics. This note records two results from a tightly bounded follow-up:

1. literal subset-antichain absorption among one-step exact-`q` proof alternatives is theorem-valid but gives **zero compression** on the retained `4665655*` sibling controls;
2. the same evidence exposes an exact **colored event-structure / local confluence** pattern: different parity-preserving interleavings of independent column events converge to the same exact `q` state.

No recursive frontier search was run. The control executed one P0/P1 macro-step only and completed far below the five-minute cap.

---

## 1. Bounded proof-frontier antichain control

Implementation:

```text
research/semantic-quotient/state-identity-unification/src/
  quotient-standard7x6-4665655-proof-frontier-antichain.mjs
```

Workflow:

```text
.github/workflows/frontier-4665655-proof-frontier-antichain.yml
```

Workflow run:

```text
34796681345
```

Hard limits:

```text
GitHub job timeout: 5 minutes
process timeout:    270 seconds
recursive descent:  none
controls:           46656551, 46656552, 46656555, 46656557
```

Authority boundary:

```text
pure legal C4-0010 transitions
+ theorem-backed I / E(O) structural discharge
- no external score/value labels
- no recursive solved-value oracle
```

### Result

Across all four controls:

```text
legal P0 witnesses:             28
admissible P0 witnesses:        28
distinct exact-q proof terms:   28
minimal-antichain proof terms:  28
duplicate terms:                 0
strict-superset absorptions:     0
```

Therefore the local theorem

```text
H(a1) subset H(a2) => action a2's pure value-proof term is absorption-redundant
```

is valid but supplies **no material compression at this seam**.

This is a useful negative result. Do not spend a larger recursion budget merely hoping that literal subset absorption between exact-`q` child IDs will explain the broad frontier.

---

## 2. Unexpected invariant: identical witness-arity signature

Every one of the four controls has exactly the same one-step hard-obligation arity by P0 witness column:

```text
column 1 -> 7 hard replies
column 2 -> 7
column 3 -> 2
column 4 -> 2
column 5 -> 7
column 6 -> 1
column 7 -> 7
```

Equivalently the term-arity histogram is identical in all four states:

```text
1-hard: 1 witness
2-hard: 2 witnesses
7-hard: 4 witnesses
```

Yet the retained siblings are known to separate under later structural behavior: three are closing controls and `46656555` is the broad re-expansion control.

Consequences:

1. child-count/cardinality features cannot explain the separation;
2. the missing relation must involve the **internal structure / implication / compatibility of child obligations**, not merely how many there are;
3. proof terms at this seam already form an incomparable family under literal exact-`q` subset order.

The appropriate next abstraction, if one is proved, is therefore not a larger cardinality grammar. It is a semantic implication or compatibility order on typed child obligations.

---

## 3. Exact cross-control confluence visible in the same evidence

Although no two witness terms at one parent absorb each other, the exact hard child IDs reveal systematic **cross-parent convergence**.

For each unordered pair of sibling controls, exactly two hard exact-`q` descendants are shared, always under the same P0 witness column in both parents:

| sibling controls | shared P0 witness | shared exact q |
|---|---:|---:|
| `...51` / `...52` | 5 | 1716 |
| `...51` / `...52` | 7 | 2088 |
| `...51` / `...55` | 2 | 739 |
| `...51` / `...55` | 7 | 2213 |
| `...51` / `...57` | 2 | 824 |
| `...51` / `...57` | 5 | 1958 |
| `...52` / `...55` | 1 | 2621 |
| `...52` / `...55` | 7 | 4176 |
| `...52` / `...57` | 1 | 2726 |
| `...52` / `...57` | 5 | 3977 |
| `...55` / `...57` | 1 | 4647 |
| `...55` / `...57` | 2 | 4994 |

There are therefore:

```text
6 sibling pairs x 2 shared hard descendants = 12 exact-q convergence points.
```

Let

```text
S = {1, 2, 5, 7}
```

be the four sibling P1 reply columns.

For each sibling pair `{a,b} subset S`, the two shared hard descendants occur exactly under P0 witness columns

```text
S \ {a,b}.
```

Example:

```text
siblings 1 and 2
  -> shared hard descendants under P0 witnesses 5 and 7

siblings 2 and 7
  -> shared hard descendants under P0 witnesses 1 and 5
```

This is too regular to treat as an accidental state-ID collision. It is the finite trace of an exact commuting-event law.

---

## 4. Local colored-confluence theorem

Consider a common nonterminal prefix `s` with P1 to move. Let `a`, `b`, and `m` be three distinct columns. Suppose both three-move continuations are legal and no earlier terminal event stops play:

```text
P1:a, P0:m, P1:b
P1:b, P0:m, P1:a
```

Then both continuations reach the same physical colored board.

### Proof

Because `a`, `b`, and `m` are distinct columns:

- the P1 event in column `a` changes only the support height of `a`;
- the P0 event in column `m` changes only the support height of `m`;
- the P1 event in column `b` changes only the support height of `b`.

The two P1 events exchange temporal order but retain the same player label because they occupy equal-parity plies. The P0 event remains the middle event and retains its player label.

Thus each of the three columns receives exactly the same colored stone at exactly the same landing cell in both continuations. Every other column is unchanged. Therefore the final physical colored positions are identical.

C4-0010 `q` is a deterministic function of the resulting support and residual winning requirements, so the final exact `q` states are identical. QED.

### Boundary

The theorem requires legality and absence of an earlier terminal stop. Strategic certificates may additionally care about event order, deadlines, CPC commitments or provenance while the intermediate histories differ. Those contexts must not be erased merely because the final ordinary value state converges.

---

## 5. Known mathematical structure: a two-colored event system

The board support itself is naturally a product of seven finite chains:

```text
(h1, h2, ..., h7),  0 <= hc <= 6.
```

A legal nonterminal drop increments one coordinate. Coordinate increments in distinct columns commute at the support level. Therefore the support Hasse diagram contains the ordinary diamonds of a product poset.

Connect Four adds a global two-color/turn constraint:

```text
rank parity -> player identity.
```

Consequently the relevant histories are not arbitrary commutative words. They are **parity-colored linearizations** of column-local event chains.

The local theorem above is the smallest nontrivial parity-preserving interchange:

```text
a m b  ~  b m a
```

where the two exchanged events belong to the same player and the middle event belongs to the opponent.

This places the structural game naturally beside:

- partially commutative / trace systems;
- event structures and partial-order semantics for concurrency;
- product-poset diamond/confluence laws;
- partial-order reduction, where equivalent interleavings are represented once.

Calling the entire Connect Four game a Mazurkiewicz trace monoid would be too strong without handling turn color, terminal stopping, and strategic observation. The safe statement is:

> Standard Connect Four contains an exact parity-colored local trace/confluence structure generated by independent column events.

---

## 6. Broad structural isomorphism map

The current research stack can now be re-expressed with relatively few mathematical objects.

### 6.1 Support / gravity

```text
Connect4 object:
  seven column heights and future landing events

known structure:
  finite product of chains / event poset
```

Each column is a causal chain. Cross-column interleavings are linear extensions.

### 6.2 Turn parity / CPC

```text
Connect4 object:
  global alternating ownership of future events

known structure:
  two-colored / parity-constrained event labeling
```

This is a precise home for the earlier asynchronous-turn-parity observation: local column chains evolve asynchronously while ownership is assigned by one global rank parity.

### 6.3 WSL residuals

```text
Connect4 object:
  alternative residual winning requirements

known structure:
  monotone Boolean DNF / minimal antichain of finite requirements
```

Move transitions are Boolean cofactors/restrictions followed by absorption normalization.

### 6.4 NDC

```text
Connect4 object:
  nested prerequisites needed before a response/win event becomes usable

known structure:
  causal/dependency closure over the event poset and obligation hypergraph
```

NDC is therefore naturally read as a closure operator over future events rather than an unrelated extra rule system.

### 6.5 Response resources

```text
Connect4 object:
  obligations, response cells, exclusivity, reuse, deadlines

known structure:
  typed matching / capacity-flow / Hall-deficiency system on future events
```

Temporal ordering turns the static bipartite relation into a time/event-expanded capacity problem.

### 6.6 Recursive positive proof

```text
Connect4 object:
  P0 existential witness / P1 universal replies

known structure:
  alternating AND/OR proof DAG / monotone circuit / least fixed point
```

Collapse, unique-hard transport and re-expansion are ordinary constant propagation at universal conjunctions.

### 6.7 Proof-plan alternatives

```text
Connect4 object:
  OR of conjunctions of recursive Win(q) obligations

known structure:
  monotone DNF / antichain of proof terms
```

Literal exact-`q` subset absorption is sound but was empirically non-compressive in the current sibling control.

### 6.8 Typed resource preservation

```text
Connect4 object:
  feasible sets of response resources preserved by a compatible cover

known structure:
  downward-closed set family represented by maximal antichain
```

This is order-dual to minimal proof-obligation antichains.

### 6.9 q and q+Pi0

```text
Connect4 object:
  future-value residual identity / output-sensitive residual identity

known structure:
  residual automaton / output transducer refinement
```

Different histories may collapse when their future value behavior is identical, while provenance observability requires a finer output state.

### 6.10 W/D/L intervals

```text
Connect4 object:
  six exact/one-sided value intervals

known structure:
  nonempty convex subsets of the chain -1 < 0 < +1
```

Player reversal is an order duality exchanging max and min.

---

## 7. What the failed literal antichain compression tells us

The one-step family is already a Sperner-like incomparable family under exact child identity: terms of sizes 1, 2, and 7 coexist without set inclusion.

Therefore the next useful proof normalization cannot merely be:

```text
compare H sets by exact state-ID subset
```

It needs a proved implication preorder on **typed child obligations**.

Conceptually, let

```text
C1 => C2
```

mean that satisfying typed child certificate `C1` is sufficient to satisfy `C2`, with all load-bearing context preserved.

Then conjunctions can be compared under the lifted implication order rather than identity-only subset inclusion.

This is exactly where CPC, NDC, resource contracts, deadlines and progress should enter. It also explains why generic residual-state dominance was too coarse: the needed relation is a **certificate implication relation**, not a guessed state preorder.

---

## 8. Why the event-structure view may matter

Exact `q` interning already merges converged states *after* branches have been generated. Therefore local confluence by itself is not a new state quotient and cannot explain away the previously measured exact-`q` state explosion.

Its possible value is different:

1. prove commuting families symbolically before enumerating every interleaving;
2. represent response policies as partial orders of required events rather than branch matrices;
3. distinguish true causal branching from mere scheduling/interleaving branching;
4. express CPC/NDC/deadlines on one event-poset substrate;
5. seek proof implication between residual **event obligations** rather than between opaque q IDs.

This is consistent with the matrix-free direction: a proof need not retain every physical interleaving when those interleavings are linearizations of the same causal event structure.

---

## 9. Next bounded question

Do **not** run deeper recursion merely to exploit this observation.

The next mathematical question is:

> Can the hard child obligations in the closing siblings and the broad sibling be mapped to finite typed event-poset certificates, with a sound implication/compatibility order that distinguishes their future behavior even though their one-step arity signatures are identical?

A useful candidate representation would retain only:

```text
required future events / residual line obligations
causal precedence
player/parity eligibility
resource exclusivity or reuse
terminal/deadline guards
well-founded progress consequence
```

and quotient away only interleaving order proved irrelevant by local confluence.

Any experiment remains under the repository's current hard five-minute wall-clock rule.

---

## 10. Current conclusion

Two corrections are now established:

```text
literal exact-q proof-term subset antichain
  = mathematically valid
  = zero compression on the four retained sibling controls
```

while

```text
cross-branch event confluence
  = exact and directly visible
  = a better candidate for identifying repeated structure before enumeration
```

The broad landscape is therefore converging toward one composite object:

```text
parity-colored event poset
+ monotone residual obligation hypergraph
+ typed response-capacity relation
+ alternating fixed-point proof algebra
+ provenance annotation
```

rather than a collection of unrelated Connect-Four-specific tricks.

This note does not establish the complete standard-7x6 center-win proof or terminal-line output set.
