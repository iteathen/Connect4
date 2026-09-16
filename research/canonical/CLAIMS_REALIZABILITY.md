# Realizability and composition claims

**Research direction:** Josh Oshiro  
**Formalization / qualification:** OpenAI ChatGPT

This ledger separates three objects that earlier research sometimes placed under the single word `realizability`:

1. **symbolic ownership-partition image** — whether a fixed-support line-hit pair can come from any coloring of the occupied support;
2. **legal history** — whether a fixed colored support can arise from gravity-respecting alternating play, including first-win stopping where relevant;
3. **dynamic proof/game closure** — whether a structurally possible consequence survives opponent intervention, response-resource competition, deadlines and terminal ordering.

These layers are not interchangeable.

## C4-R0060 — fixed-support line-hit image

**Status:** deductive exact.

At fixed support, line-hit image membership is exactly a pinned NAE CSP over the occupied-cell owner bits. Monochromatic hit status pins an occupied line intersection to one player; dual-hit status requires both owners; empty intersection permits only no-hit status.

This identifies the correlation demanded by C4-R0043 without claiming that the hidden owner variables have already been eliminated compactly.

## C4-R0061 — higher-order obstruction

**Status:** deductive exact counterexample.

On every K=4 board with `W>=5,H>=4`, a two-column/two-high support contains three two-cell line intersections whose dual-hit requests form an odd inequality triangle. Each pair is satisfiable but all three together are impossible. Therefore local and pairwise compatibility are not a complete realizability calculus.

## C4-R0062 — legal-history realizability

**Status:** deductive exact.

The support order is a disjoint union of column chains. A fixed coloring is reachable before terminal stopping exactly when its column owner words can be shuffled into the global alternating turn word, equivalently when the colored support poset admits an alternating/prescribed-color linear extension. A nonterminal final coloring needs no additional stopping guard; a terminal final coloring does.

The smallest clean separation from simple counts is a `2x2`, K=4 support with both bottom-to-top column words `10`: global owner counts are balanced, but every minimal event is P1 while the first move must be P0, so no legal history exists.

## C4-R0063 — lossless join

**Status:** deductive exact.

When exact state is decomposed into projections, exact recombination is the standard database-theory property of a **lossless join** / join dependency. The natural join of correct marginals can contain spurious tuples. C4-R0061 is a Connect-4 witness that higher-order correlation can be required.

Lossless static recombination is still below transition equivalence and below proof/value identity. Support order, alternating legality, opponent-universal intervention, response resources, deadlines and first-win stopping remain explicit higher layers.

## Consequence for the current calculus

The current composition seam should no longer be described as one undifferentiated missing predicate. The strongest exact decomposition presently supported is:

```text
geometry / support
  -> fixed-support ownership-image CSP          [C4-R0060]
  -> legal alternating support history          [C4-R0062]
  -> first-win admissibility
  -> guarded intervention/resource/deadline NDC
  -> terminal certificate
  -> value/sign lift.
```

The first layer is static correlation; the later layers are causal/game relations. A compact owner-free representation of the first relation and a compact guarded quantifier lift through the later relations remain open.
