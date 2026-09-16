# Fork-precursor response-capacity theorem and the standard b1 branch

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Derive a generic NDC forcing certificate one step earlier than an immediate multiple-singleton loss and instantiate it on a standard 7x6 center-opening branch.

The certificate says that if one legal enabling move would create more distinct playable singleton obligations than the defender can answer, then the defender's current move is restricted to preempting the enabling move or enough of its future obligation cells.

This converts many physical legal moves into one response-capacity condition without recursive search.

## 1. Immediate fork premise

Fix a nonterminal position with defender `D` to move and attacker `A` to move next if the position remains nonterminal.

Let `m` be an attacker move that will be legal after any defender move under consideration unless the defender occupies `m` itself.

Suppose that after `A` plays `m`, the attacker has a set

```text
T={t_1,...,t_k}
```

of distinct currently playable singleton winning obligations, and suppose:

```text
D has one placement response slot before A can play again;
no immediate D win supersedes the obligations;
one D placement can directly occupy at most one distinct t_i.
```

Then if more than one member of `T` remains after `m`, the defender loses by the ordinary response-capacity theorem.

## 2. Precursor theorem

On the defender's move immediately before `m`, a defensive move can prevent the fork only by:

```text
occupying m itself;
or
preoccupying enough members of T that at most one remains after m;
or
establishing another exact blocker/terminal certificate that discharges the fork under the same deadline.
```

For the common two-threat case `|T|=2`, absent another strategic certificate, the current defender move must belong to

```text
{m,t_1,t_2}.
```

Proof:

- if the defender occupies `m`, the enabling move is unavailable;
- if the defender occupies one of the two future singleton cells, only one direct singleton remains after `m`;
- if the defender plays elsewhere, `m` remains legal and both `t_1,t_2` remain distinct and playable;
- attacker plays `m`;
- defender has one response slot for two obligations, a Hall deficiency `2>1`;
- one singleton survives and attacker completes on the following move.

The proof is a bounded static dependency DAG, not a recursive game-tree argument.

## 3. General capacity form

Let the defender's current action have preemption capacity `c_pre` over the future obligation family and let the post-enabling response horizon have capacity `c_post`.

A sufficient resource obstruction is

```text
|T| > c_pre + c_post
```

unless the enabling move itself is blocked or one action can discharge multiple obligations under an independently qualified coverage relation.

The exact general form is the guarded Hall response graph from the response-capacity theorem; the simple cardinality expression applies when every action covers at most one distinct obligation.

## 4. Standard 7x6 b1 branch

Use ordinary one-based chess-style Connect-4 coordinates `a..g`, rows `1..6`.

Consider the exact three-ply prefix

```text
1. P0 d1
1... P1 b1
2. P0 f1
```

with P1 to move.

P0 currently owns

```text
d1, f1.
```

If `e1` remains empty, it is bottom-playable.

After P0 plays

```text
e1,
```

P0 owns the three-cell horizontal run

```text
d1-e1-f1.
```

This produces two distinct geometric requirements:

```text
c1-d1-e1-f1  -> singleton c1
d1-e1-f1-g1  -> singleton g1.
```

Both `c1` and `g1` are bottom-row cells and therefore immediately playable if still empty.

## 5. Exact restriction on P1's current move

At this early prefix P1 cannot already complete a Connect-4 with one current move.

Therefore, if P1's current move occupies none of

```text
c1, e1, g1,
```

then:

1. `e1` remains legal for P0;
2. P0 plays `e1`;
3. `c1` and `g1` become two distinct playable P0 singleton threats;
4. P1 has one placement response slot;
5. at most one of `c1,g1` can be occupied;
6. P0 completes the other on the next move.

Hence every nonlosing P1 continuation from this prefix must satisfy the current-move obligation

```text
P1 plays one of {c1,e1,g1}.
```

This is proved directly from geometry/support/capacity; the historical solved label is not a premise.

## 6. Proof-hypergraph representation

The physical branch fanout can be replaced by one static certificate:

```text
prefix(d1,b1,f1)
+ e1 enabling move
+ future singleton set {c1,g1}
+ post-enable response capacity 1
-> current P1 move must intersect {c1,e1,g1}.
```

The three surviving physical replies remain alternatives, but every other legal move is eliminated by one semantic proof node.

This is the desired quotient direction: branch on unresolved strategic alternatives only after exact structural closure removes irrelevant legal choices.

## 7. Relation to historical analysis

Allis's Chapter 13 describes the same qualitative restriction in this branch: after the first-player `f1` move, the `e1` idea creates two bottom-row threats and limits the second player's meaningful responses to the same three cells.

The theorem above is independently restated in the current response-capacity language and does not depend on Allis's later search-derived win label.

## 8. Next target

Apply the same precursor/Hall reduction to each of the remaining center-opening first-response classes:

```text
center reply d2;
adjacent reply c1;
far reply a1/b1 up to reflection.
```

Seek a small set of **semantic obligation states** shared across those branches. In particular, test whether the hard center-stack state and the off-center fork branches merge after representing:

```text
control potential;
residual zero-edge targets;
blocker clauses;
response-capacity obligations;
min-max certificate rank.
```

If they do, the standard root proof graph may be much smaller than its historical position tree.

## Proof boundary

The generic precursor theorem assumes the stated unit-capacity/coverage conditions. The standard `b1` instance checks those conditions directly on the bottom row. It proves the move restriction, not the full branch winner.
