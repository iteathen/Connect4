# Opening-value premise closure and missing-calculus witness

**Date:** 2026-09-13  
**Status:** theoretical research + finite premise-projection control; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction and conceptual framing:** **Josh Oshiro**  
**Formalization and finite checks:** OpenAI ChatGPT

## Purpose

Add stronger independently established W/D/L premises without importing any perfect-play terminal-line classification, then push those premises through the current predicate system to see what becomes provable and where the structural calculus still fails to reproduce value.

The suspected perfect-play winning-line subset cardinality remains an output hypothesis only. It is not used in this note.

Mathematical discussion uses **1-based columns `1..7`**.

## External value-premise boundary

This note admits exact opening/prefix W/D/L values as semantic premises. It does **not** admit:

- perfect-play terminal-line membership;
- a terminal-line count;
- solved-state tables beyond the explicitly stated shallow prefix values;
- a perfect-play witness line sequence;
- any rule tuned to a desired terminal-line subset.

The opening values used here are the published `First Move Results` from James D. Allen, *Expert Play in Connect-Four*, hosted at `https://tromp.github.io/c4.html`.

These values are evidence/premises for this bounded research profile, not a claim that the current CPC/WSL/NDC calculus has already derived them.

## 1. Exact first-move premise

Using absolute P0 values:

```text
column:  1  2  3  4  5  6  7
value:   L  L  D  W  D  L  L
```

or numerically:

```text
[-1, -1, 0, +1, 0, -1, -1]
```

Therefore, under W/D/L-only perfect play from the known P0-winning root:

```text
PerfectFirstMove = {4}
```

This is a derived consequence of value preservation, not an extra move-selection axiom.

The previously admitted column-3 draw premise is contained in this stronger table, and horizontal reflection gives column 5 the same value.

### Consequence

The perfect-play terminal-line output algebra satisfies:

```text
G(root) = G(after first move 4)
```

All other first-move children have empty P0-winning-line projection because P0 cannot force a win from them against a perfect opponent.

This is the first exact root reduction produced by the added value premises.

## 2. P1's second move does not branch value

After P0 opens column 4, the position has absolute P0 value `Win` and P1 is to move.

By ordinary minimax semantics:

```text
P1-to-move AND Value(s)=P0-Win
=> every legal child s' also has Value(s')=P0-Win
```

Therefore all seven legal P1 replies after the center opening are W/D/L-perfect. No separate second-ply value table is required for this conclusion.

This is an important asymmetry:

```text
P0 turn in winning region: existential winning successor condition
P1 turn in winning region: universal winning successor condition
```

The missing calculus must reproduce this existential/universal predecessor structure from CPC/WSL/NDC facts rather than from child-state enumeration.

## 3. Exact third-ply value premise

For the state after:

```text
1. P0 column 4
1... P1 reply j
2. P0 move k
```

the exact W/D/L premise matrix is:

```text
             P0 third move k
P1 reply j   1  2  3  4  5  6  7
----------------------------------
1            D  L  W  W  W  W  W
2            L  W  L  D  D  W  L
3            L  L  D  D  L  W  W
4            L  L  L  W  L  L  L
5            W  W  L  D  D  L  L
6            L  W  D  D  L  W  L
7            W  W  W  W  W  L  D
```

Rows 5..7 are obtained from rows 3..1 by horizontal reflection.

Because P0 is perfect and the parent after every P1 reply remains a P0 win, only `W` entries are value-preserving P0 third moves.

Thus the exact perfect third-move relation is:

```text
P1 reply 1 -> P0 {3,4,5,6,7}
P1 reply 2 -> P0 {2,6}
P1 reply 3 -> P0 {6,7}
P1 reply 4 -> P0 {4}
P1 reply 5 -> P0 {1,2}
P1 reply 6 -> P0 {2,6}
P1 reply 7 -> P0 {1,2,3,4,5}
```

There are exactly:

```text
19 winning/value-preserving edges
10 drawing edges
20 losing edges
```

among the 49 third-ply positions.

This 49-position labeled relation is a compact control set for discovering the missing predecessor calculus. The desired structural calculus should reproduce the `19/10/20` partition from rule-derived predicates; it must not memorize the table.

## 4. Predicate-projection experiment

The accompanying control regenerates the 69 geometric lines and computes, for all 49 third-ply positions:

- both players' raw residual-requirement size histograms;
- both players' minimal-antichain residual size histograms;
- exact column-height/support vector;
- the exact W/D/L premise label.

It then groups states by successively stronger predicate projections.

### 4.1 Raw residual-size summaries are insufficient

The pair of raw residual-size histograms creates 18 equivalence classes, but **three classes contain more than one W/D/L value**.

One explicit collision is:

```text
raw P0 residual sizes: [0,1,7,58]
raw P1 residual sizes: [0,0,2,58]
```

shared by:

```text
(reply 1, third 2) -> Loss
(reply 1, third 7) -> Win
(reply 7, third 1) -> Win
(reply 7, third 6) -> Loss
```

Therefore residual cardinality alone cannot be the missing calculus.

### 4.2 Minimal-antichain size summaries are also insufficient

The pair of minimal-antichain residual-size histograms creates 16 equivalence classes, again with **three mixed-value classes**.

Therefore antichain cardinality compression is not value-complete either.

### 4.3 Restoring exact support height removes these particular collisions

For this 49-position control only, grouping by:

```text
exact 7-column height vector
+ both minimal-antichain size histograms
```

creates 46 classes and **zero mixed-value classes**.

This is evidence that support placement/timing carries material value information lost by cardinality-only WSL summaries.

It is **not** a proof that this projection is globally sufficient. In fact exact residual identity itself is stronger than the cardinality summaries and may distinguish states for other reasons. The result should therefore be read only as a falsifier of cardinality-only calculus and as evidence that support/event location is load-bearing.

## 5. Opening premises do not directly classify the 69 lines

The exact 19 perfect three-ply prefixes were intersected with every geometric winning line using only the immediately occupied P1 cell as a permanent blocker test.

Result:

```text
minimum compatible perfect prefixes for any line: 10
maximum: 19
lines eliminated by direct P1 occupation at ply 2 across all perfect prefixes: 0
```

Compatibility-count histogram:

```text
10 prefixes -> 2 lines
13          -> 2
14          -> 4
16          -> 2
17          -> 6
18          -> 8
19          -> 45
```

Therefore the new shallow value premises do **not** collapse the 69-line output by simple opening occupancy filtering.

This is important: the remaining reduction must come from deeper value-preserving structure—support order, parity/control, response resources, blockers, deadlines, and first-win races—not from a disguised opening-prefix blacklist.

## 6. What the experiment says about the missing calculus

The current evidence narrows the gap.

The missing calculus is not:

```text
residual requirement cardinality
```

and not:

```text
minimal-antichain cardinality
```

alone.

The value distinction already depends on the interaction:

```text
exact residual obligations
+ support/accessibility location
+ event timing/parity
+ adversarial predecessor quantifier
```

This is consistent with the existing CPC/WSL/NDC architecture:

```text
WSL says what remains required.
SUP/order says when those events can occur.
CPC says who controls parity-sensitive events under valid reservoirs.
NDC composes nested dependencies.
```

The still-missing operator is the one that turns these facts into exact existential/universal **value-preserving predecessor** conclusions.

A useful target signature is therefore not merely:

```text
ResidualShape(s)
```

but something of the form:

```text
TemporalRequirement(s,R) =
  residual cells
  + support/event predecessors
  + CPC ownership equations
  + response resources
  + completion deadline
```

with a calculus capable of proving:

```text
ExistsWinningPredecessor(X)
ForallWinningPredecessors(X)
```

directly over these objects.

## 7. Concrete discovery target from the 49-state table

The 49 labeled third-ply states provide a compact anti-unification problem:

1. derive CPC/WSL/support/deadline facts for each state;
2. compare the 19 `Win`, 10 `Draw`, and 20 `Loss` cases;
3. find the smallest temporal requirement relation that separates the classes;
4. express that relation as a generic inference rule rather than a move-specific pattern;
5. test the inferred rule on complete small games where every state/value can be checked independently;
6. only then apply it to the standard root line-output closure.

If the calculus cannot reproduce this shallow exact value partition without effectively solving each child recursively, that is an early falsifier of the proposed searchless closure language.

If it can, the learned rule becomes a candidate component of the missing strategic predecessor calculus.

## 8. Reproduction

```sh
node reference/research-prototypes/2026-09-13-perfect-play-winline/opening_premise_projection.mjs
```

Evidence:

```text
docs/research/evidence/2026-09-13-opening-premise-projection.json
```

## Conclusion

The additional provable W/D/L premises make the calculus gap clearer rather than hiding it.

The root is now reduced exactly to the center-opening child, and the next P0 decision layer supplies 49 exact labeled examples with a 19-edge value-preserving relation. Cardinality-only residual calculus fails on this tiny control. Support/event placement restores distinctions that cardinality loses, but a complete structural predecessor rule is still missing.

That missing rule is now a concrete object to derive and test rather than an abstract suspicion.
