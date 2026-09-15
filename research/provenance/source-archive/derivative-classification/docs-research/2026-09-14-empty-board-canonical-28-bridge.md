# Empty-board canonical 28 bridge

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Objective

The external solved-oracle evidence in issues #41/#42 is validation only. The target remains to derive the standard-board `28` from the empty Connect4 signature without solved W/D/L labels, recursive move-tree solving, or a predefined 28/69 target.

This note records a target-free structural construction that reaches the **same 28-line geometry** as the oracle while keeping the remaining semantic gap explicit.

## Primitive signature

Use only

```text
turn modulus = 2
K = 4
H = 6
W = 7
```

Generate all geometric winning predicates from these dimensions.

The existing target-free GF(2) incidence theorem independently derives

```text
L = 69
rank(B) = 35
dim ker(B) = 34
rank(B)-W = dim ker(B)-H = 28.
```

Neither 69 nor 28 is supplied.

## Canonical critical column from empty-board symmetry

Horizontal reflection sends column `c` to `W-1-c`. Because `W` is odd there is exactly one fixed column:

```text
c* = (W-1)/2 = 3 zero-based.
```

Thus the center is not inserted as an opening-book fact; it is the unique reflection-fixed column of the empty geometry.

## Canonical preterminal rank from K

P0 cannot own `K` stones before its K-th move, which occurs on one-based ply

```text
2K-1 = 7.
```

The preceding P0 move is therefore the natural preterminal rank

```text
2K-3 = 5.
```

At this rank P0 owns `K-1=3` events and P1 owns `K-2=2` events.

Now apply the already-qualified GF(2) two-ply phase operator `P`. A same-column two-ply pair has zero displacement:

```text
P_{c,c}: phi -> phi + e_c + e_c = phi.
```

Requiring the paired prefix to remain in the unique reflection-fixed column produces a canonical chain of two zero-displacement pairs followed by P0's preterminal event:

```text
center rows 1..5 one-based
P0, P1, P0, P1, P0.
```

This construction is derived from empty-board symmetry, K, turn parity, gravity and the native `P` operator. It is not imported from the solved opening book.

## Canonical maximal-delay boundary

The board has `WH=42` cells. P0 moves on odd one-based plies, so its latest *possible* terminal ply is the largest odd ply not exceeding board capacity:

```text
T_max = 41.
```

Immediately before that event, two cells remain empty. Gravity therefore restricts the final landing to zero-based rows 4 or 5, the top two rows.

This is a structural **maximal-delay boundary**. The present theorem does **not** yet assert that distance-optimal P1 can force play to this horizon; proving that selection is part of the remaining semantic bridge.

## Target-free terminal envelope

Generate every four-cell winning line. Keep exactly those satisfying both conditions:

1. it contains no P1-owned cell from the canonical critical stack;
2. it contains at least one top-two-row cell not already consumed by the critical stack, so that cell can be the maximal-delay final landing.

The executable control derives the surviving cardinality and then independently checks it against the incidence middle dimension. No target cardinality is present in the selector.

Result:

```text
canonical maximal-delay critical-stack envelope
    = structural GF(2) middle dimension.
```

On the standard board both evaluate to the same emergent value, and the generated line set is exactly the 28-line set later observed in issue #41.

The oracle equality is a post-hoc validation; it is not used by the control.

## Nonrecursive extremal lemma

The same number can be understood without enumerating a game tree.

At the maximal-delay boundary, before any prefix/color refinement, the generated support envelope contains 38 winning-line coordinates.

At preterminal rank 5:

- P1 has exactly two stones.
- P1's first stone can be no higher than row 2 one-based.
- P1's second stone can be no higher than row 4 one-based.
- Using the generated 38-line incidence table together with gravity/support constraints, those two P1 stones can block at most eight distinct support-envelope lines.

P0's already-played stones normally do not reduce the set of possible top-two-row final landings. For P0 to have consumed a top-two-row cell by ply 5, it must occupy row 5 one-based. Gravity makes that possible only when **all five prefix events occurred in one column**.

For a five-event stack in column `c`, the number of support candidates removed by the two P1 blockers is, from left to right,

```text
3, 5, 7, 8, 7, 5, 3.
```

The P0 row-5 stone removes one additional final-landing candidate in every noncentral stack and two in the center stack. Therefore total exclusions are

```text
4, 6, 8, 10, 8, 6, 4.
```

The unique maximum is ten in the reflection-fixed center column. Hence every legal rank-5 prefix leaves at least

```text
38 - 10
```

maximal-delay terminal candidates, and equality is uniquely realized by the canonical five-center stack.

This is a finite geometric/support argument, not recursive game solving.

## What is proved and what remains open

Proved searchlessly from the initial signature:

```text
empty-board incidence middle dimension
  = canonical symmetry/P/maximal-delay terminal-envelope cardinality.
```

The construction also derives the exact geometry later seen in the solved oracle.

Not yet proved:

```text
distance-optimal play must select the canonical reflection-fixed P chain
AND
distance-optimal defense must attain the maximal-delay boundary.
```

Those two **selection statements** are now the precise missing theorem. We no longer need search to discover which 28 lines or which number to target.

A successful final bridge should derive the selection statements from CPC/NDC/support structure, or replace them with a weaker initial-board invariant that implies the same canonical envelope. It must not insert issue #41's first-five-center or ply-41 results as premises.

## Executable control

`research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-empty-board-canonical-28-bridge.mjs`

## Proof boundary

- no solved W/D/L premise;
- no recursive minimax/Negamax/MCTS/PNS premise;
- no predefined 28;
- no predefined 69;
- `T_max=41` means latest parity-compatible P0 terminal capacity, not yet achieved optimal-play distance;
- the canonical critical chain is selected by symmetry plus `P`, not yet proved game-theoretically forced;
- equality of the canonical envelope and oracle set is validation evidence only.