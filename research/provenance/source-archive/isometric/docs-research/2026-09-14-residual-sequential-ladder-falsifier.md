# Residual sequential ladder falsifier

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

The qualified first residual quotient establishes a natural 21-dimensional kernel inside the formal aggregate degree-3 boundary image. This note tests whether that can be promoted into the full arithmetic ladder

```text
28 -> 21 -> 14 -> 7 -> 0.
```

It cannot, under either of the two most direct marked sequentializations tested.

## Why mark cofactor events

The aggregate GF(2) residual boundary satisfies

```text
partial_3 * partial_4 = 0.
```

That is the correct homological identity, but it means the aggregate boundary forgets which deletion event occurred and cannot represent sequential cofactor descent by simple iteration.

A marked model keeps the ordered deletion history. Each original line produces one child per selected cofactor event, and later cofactors retain that event history rather than XOR-collapsing different deletion orders.

## Formal marked cofactors

First allow every residual cell to be selected algebraically, independent of gravity accessibility. Reuse the qualified degree-3 frontier rule

```text
pi(S) = topColumns(S) XOR q(S) * supportPhase(S).
```

The exact ranks are:

```text
degree 3: 28 --rank 7--> 21
degree 2: 21 --rank 0--> 21
degree 1: 21 --rank 0--> 21.
```

So even when the first 28 -> 21 contraction survives, the same rule does not continue to 14 or 7.

## Support-ordered marked cofactors

Now enforce the minimum gravity constraint inside each original line: a marked residual cell cannot be cofactored while another still-residual line cell lies below it in the same column. This especially prevents impossible top-before-bottom deletion order in vertical lines.

The exact ranks become:

```text
degree 3: 28 --rank 6--> 22
degree 2: 22 --rank 7--> 15
degree 1: 15 --rank 0--> 15.
```

Thus the first legal-order contraction is not even 28 -> 21 under the current fragment-only frontier rule.

## Interpretation

The result does not falsify the already-qualified 21-dimensional **formal first residual core**. It falsifies the stronger claim that residual arity plus the same frontier formula automatically generates

```text
7*4 -> 7*3 -> 7*2 -> 7*1.
```

Further sequential descent must retain additional state—most plausibly the support/event history that CPC needs after a cofactor has actually occurred. The fragment alone is not sufficient once the first derivative has been taken.

This is consistent with the repository's broader proof boundary: a removed event cannot be treated as though its parity/timing contribution never existed. Any future marked residual calculus must transport those historical contributions explicitly.
