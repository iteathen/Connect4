# Perfect-play line-output algebra

**Date:** 2026-09-13  
**Status:** theoretical research + complete small-game controls; standard 7x6 root not evaluated here  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction, output-subset hypothesis, and conceptual framing:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Question

Can perfect-play value and the subset of geometric lines that can occur as perfect-play terminal wins be represented by one exact set-valued equation rather than by a Boolean value predicate plus a second terminal-line analysis?

Yes.

The construction below is exact for W/D/L-only perfection and makes the desired standard-board line subset a direct output. It does not assume its cardinality.

## 1. Geometric terminal labels

For a game geometry let `Lambda` be its complete mechanically derived geometric winning-line set.

For a terminal position `s` reached by a first-player winning move, define:

```text
T(s) = { L in Lambda | the terminal move completes L }
```

`T(s)` may contain more than one line when one move completes several fours simultaneously.

For a second-player terminal win or a draw, use the empty set for the first-player-winning-line projection.

The empty set is therefore the **bottom value of this projection**, not an extra geometric winning line.

## 2. One set-valued game function

Define:

```text
G(s) subset_of Lambda
```

as the set of first-player terminal winning lines that can occur on at least one W/D/L-perfect trajectory from `s`, provided the first player can force a win from `s`.

If the first player cannot force a win from `s`, define:

```text
G(s) = empty
```

Then:

```text
first player can force a win from s
<=>
G(s) != empty
```

and at the standard empty root:

```text
Lambda_PP = G(root)
```

Thus `PPWinLine(L)` becomes simply:

```text
L in G(root)
```

No separate winning-region predicate is semantically necessary.

## 3. Exact recurrence

### Terminal

```text
first-player terminal win:
G(s) = T(s)

second-player terminal win or draw:
G(s) = empty
```

### First player to move

Let `C(s)` be the legal children.

A W/D/L-perfect first player chooses only winning children if any exist. Empty child sets therefore contribute nothing, while every nonempty child is an equally optimal win for this value-only profile.

Hence:

```text
G(s) = union { G(c) | c in C(s) }
```

This equation works whether or not a winning child exists: if every child is empty, the union is empty.

### Second player to move

A first-player win survives a perfect second-player move iff **every** legal reply remains a first-player win.

Therefore:

```text
G(s) = empty
    if exists c in C(s): G(c) = empty

otherwise

G(s) = union { G(c) | c in C(s) }
```

If all children are nonempty, every legal second-player move still loses under W/D/L and is therefore equally perfect. The possible terminal-line support is consequently the union of all child supports.

This recurrence simultaneously computes:

1. the first-player winning region through emptiness/nonemptiness; and
2. the perfect-play terminal winning-line subset through set membership.

## 4. Algebraic form

For subsets `A,B` of `Lambda`, define:

```text
A (+) B = A union B
```

and

```text
A (*) B =
    empty       if A = empty or B = empty
    A union B   otherwise
```

Then:

- first-player nodes fold children with `+`;
- second-player nodes fold children with `*`.

Both operations are commutative, associative, and idempotent. `*` distributes over `+`. The empty set is the additive identity and the multiplicative annihilator.

There is no multiplicative identity inside the ordinary powerset, so the structure is most naturally treated as an idempotent commutative semiring-like algebra without `1`.

The key point is semantic rather than nomenclatural: alternating perfect-play quantifiers have become two finite set operations.

## 5. Relation to the previous W predicate

The previous formulation used:

```text
W(s) := Value(s) = first-player win
```

plus separate predicates `R_L(s)` for terminal-line reachability.

The new equation subsumes both:

```text
W(s) <=> G(s) != empty

R_L(s) <=> L in G(s)
```

For a second-player-turn state with `G(s) != empty`, every legal child is nonempty by definition of `*`; this is exactly the previously derived universal-successor theorem.

For a first-player-turn state, `+` ignores non-winning children automatically while unioning the terminal-line support of every equally optimal winning child.

## 6. Standard opening boundary facts

Using 1-based mathematical columns, the currently admitted independent boundary premise is:

```text
perfect play after first move column 3 is a draw
```

For the present first-player-win projection this means only:

```text
G(s_3) = empty
```

Reflection derives:

```text
G(s_5) = empty
```

At the root:

```text
G(root) = G(s_1) union G(s_2) union G(s_4)
          union G(s_6) union G(s_7)
```

because the two draw openings contribute the empty set.

Reflection further relates:

```text
G(s_1) <-> reflected G(s_7)
G(s_2) <-> reflected G(s_6)
```

The equation still does not assume which remaining opening states are nonempty.

## 7. Connection to CPC / WSL / NDC

Naively evaluating `G` over physical positions is still ordinary game-state recursion. That is a semantic control, not the desired searchless production proof.

The research objective is now sharper:

> derive the same `G(root)` expression/value directly over the structural quotient using support order, CPC parity, WSL residual requirements/blockers, response resources, deadlines, and NDC proof sharing.

The 625-element WSL universe supplies exact residual submonomials of the 69 original winning-line objectives. CPC supplies GF(2) event-control constraints. NDC supplies shared dependency closure.

A structural proof is complete for this target exactly when it derives the same set-valued `G(root)` without requiring the physical move-state DAG.

## 8. Complete small-game qualification

Prototype:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/line_output_algebra.mjs
```

The prototype derives geometry mechanically and evaluates only the rule-defined recurrence above. It does not consume solved tables, opening books, or terminal-line classifications.

Results:

| Geometry | Geometric lines | `G(root)` size | First-player win? |
|---|---:|---:|---:|
| 4x3 connect-3 | 14 | 14 | yes |
| 4x4 connect-4 | 10 | 0 | no |
| 5x3 connect-4 | 6 | 0 | no |
| 4x5 connect-4 | 17 | 0 | no |

The W/D/L classes agree with the repository's existing independently preserved complete-game controls. The 4x3 winning control additionally demonstrates the intended terminal-line semantics: under W/D/L-only perfect tie-breaking, every one of its 14 geometric lines occurs on at least one perfect-play winning trajectory.

The implementation short-circuits a second-player node as soon as one empty child is proved, because the set product is then necessarily empty. This is semantic pruning of the equation, not external outcome input.

## 9. Important consequence for the standard 7x6 hypothesis

For standard Connect Four:

```text
|Lambda| = 69
```

The research output is simply:

```text
G(empty 7x6 root)
```

Its cardinality is not part of the recurrence. If the current hypothesis is correct, the independently derived root set will have the suspected size; if not, the equation is required to report the different result.

This eliminates a major ambiguity from the earlier formulation: the empty set is a **value of the output algebra**, while the nonempty root result is literally a subset of the 69 geometric winning lines.

## 10. Next structural seam

The next task is not to add more output predicates. It is to find rewrite/production rules that evaluate the `+/*` proof expression over CPC/WSL/NDC objects instead of board states.

A decisive bootstrap remains the first-ply structural boundary:

```text
G(s_1), G(s_2), G(s_4)
```

with `G(s_3)=G(s_5)=empty` already admitted/derived by reflection.

However the set-valued recurrence also permits line-level proofs to proceed without waiting for complete opening classification: any structural certificate that proves a child expression empty or proves a nonempty terminal-line support can propagate through `+/*` immediately.

This is the intended self-proving closure shape.
