# Rule-only strong proof lane for position 44

## Scope

This lane is intentionally separate from the solved-action corpora and external
strong-solution data. It consumes no frozen move-score table, opening book, BDD,
or perfect-play map.

The only game inputs are standard 7x6 Connect Four rules and the literal prefix
`44`.

## Exact recurrence

For every legal nonterminal state `s` with player to move:

```
V(s) = max_a strong(-V(child(s,a)))
```

under the repository's strong-score convention, with exact terminal values and
distance bounds determined from remaining plies.

Every legal action is represented in the recurrence. Alpha-beta and the
transposition table only reuse/cut exact proven bounds; they are not value
premises.

Therefore a completed child score vector is derived from game rules, not prior
solve knowledge.

## Proof burden

This is a computational exact proof, not yet the desired compact structural
formula. If a unique best child is obtained, IsoGraph must still derive a
geometry/rule-only sufficient certificate before that result can be called a
searchless formulation.
