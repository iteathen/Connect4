# Hard-frontier recursion calculus for standard 7x6 positive certificates

**Date:** 2026-09-13  
**Research direction / structural target:** Josh Oshiro  
**Formalization / proof / qualification:** OpenAI ChatGPT

## Status

**THEOREM-BACKED VALUE-PROOF CALCULUS / OUTPUT PROVENANCE NOT INCLUDED.**

This note isolates the proof rule exercised by the recent standard-7x6 recursive-frontier controls. The rule is a direct consequence of the accepted alternating predecessor semantics plus exact C4-0010 `q` transition congruence. It does not use Pascal Pons scores, solved values, or suspected terminal-line cardinalities as premises.

External exact solvers may still be used to *discover* candidate P0 witnesses. Once a finite certificate is frozen, the certificate is verified entirely by legal transitions and the rules below.

## 1. Accepted basis

For P0's absolute winning region:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

where:

- `I` is an immediate legal P0 terminal win;
- `PreE(X)` is a P0-to-move state with at least one legal successor in `X`;
- `PreA(X)` is a P1-to-move state whose every legal successor is in `X`.

C4-0010 value identity is exact:

```text
q = exact support
  + normalized P0 residual antichain
  + normalized P1 residual antichain
```

States with equal exact `q` have the same legal `q` successors and terminal results. This permits exact-`q` memoization and duplicate removal for **value** obligations.

## 2. Base positive certificate

Let `B(s)` denote any already-proved positive value certificate whose reuse conditions are respected.

The current experiments instantiate:

```text
B0(s) := I(s) or E(O)(s)
```

with:

```text
O:
  P1 to move has no terminal winning move and every legal P1 move
  leaves P0 an immediate legal terminal win.
```

The recursion theorem does not depend on that particular base alphabet. Additional CPC/WSL/NDC/progress theorems may be added to `B` once independently proved.

## 3. One hard-frontier macro step

Let `s` be a nonterminal P0-to-move state and let `a` be a concrete legal P0 action.

If `a` is an immediate terminal P0 win, the obligation closes.

Otherwise define the defender node:

```text
d = T(s,a)
```

For **every** legal P1 reply `b` from `d`:

1. a terminal P1 win makes `a` an invalid positive certificate witness;
2. otherwise let `c = T(d,b)`;
3. if `B(c)` is proved, discharge that branch;
4. otherwise retain `q(c)` as a hard recursive obligation.

The exact-`q`-normalized hard-successor set is therefore:

```text
H_B(s,a) = qNormalize({ q(c) : c is an undisclosed P0 child after a then b })
```

Duplicate physical branches with the same exact `q` contribute only one value obligation.

## 4. Frontier operator

For a finite frontier `F` of P0-to-move exact-`q` obligations, choose one legal P0 witness action `alpha(q)` for each `q in F`.

Define:

```text
H_B(F,alpha) = union over q in F of H_B(q, alpha(q)), then exact-q normalize.
```

This operator may:

- contract;
- preserve width;
- expand;
- merge transpositions;
- later contract again.

No monotonicity of `|F|` is required.

## 5. Finite hard-frontier certificate theorem

### Theorem

Let

```text
F0, F1, ..., Fn
```

be finite P0-to-move value frontiers satisfying:

```text
Fn = empty
Fi+1 = H_B(Fi, alpha_i)
```

for explicit legal witness maps `alpha_i`, with every P1 reply checked as specified above.

Then every state represented in `F0` is in P0's winning region `W`.

### Proof

Proceed backward from `Fn`.

`Fn` contains no unresolved obligations, so every branch generated from `F(n-1)` under `alpha_(n-1)` is either:

- an immediate P0 terminal win; or
- discharged by the already-proved base certificate `B`.

Thus every selected P0 witness enters a P1 node whose every legal reply is winning for P0. By `PreA`, that defender node is in `W`; by `PreE`, its P0 parent is in `W`.

Assume inductively that every obligation in `Fi+1` is in `W`. For any `q in Fi`, the explicit action `alpha_i(q)` reaches a defender node where every legal P1 reply is either:

- already discharged by `B`; or
- represented by an obligation in `Fi+1` and therefore in `W` by the induction hypothesis.

Again `PreA` proves the defender node and `PreE` proves the P0 parent. Therefore every obligation in `Fi` is in `W`.

By induction, every obligation in `F0` is in `W`. QED.

## 6. Well-founded progress

Frontier width is **not** the progress rank.

Each nonterminal macro step consumes exactly two physical plies:

```text
P0 witness move -> P1 universal reply -> next P0 obligation
```

Therefore a valid rank is simply remaining physical plies:

```text
rho(s) = 42 - supportRank(s)
```

and every retained hard successor satisfies:

```text
rho(child) = rho(parent) - 2.
```

Terminal or base-certified branches stop earlier.

Hence recursion is well-founded even for histories such as:

```text
2 -> 12 -> 0
2 -> 7 -> 2 -> 3 -> 0
```

where frontier width first expands and later collapses.

## 7. Exact-q normalization theorem

At a value frontier, replacing multiple obligations having identical exact C4-0010 `q` with one representative is sound because exact `q` preserves:

- side to move through support rank;
- legal action set;
- terminal outcome of every action;
- exact successor `q` for every legal nonterminal action.

Thus the same remaining hard-frontier certificate can be reused for every physical occurrence of that `q` class.

This is **not** permission to merge under a coarser descriptor whose successor congruence has not been proved.

It is also **not** an output-provenance theorem. Distinct physical/provenance histories that share a value `q` may remain distinguishable under `q + Pi0` and must be retained by the terminal-line output layer.

## 8. Special cases

### Unique-hard transport

If

```text
|H_B(s,a)| = 1
```

then the entire universal branch matrix reduces to one recursive value obligation plus discharged side branches.

This is the generalized one-hard transport operator. Same-column vertical transport is only one geometric subcase; no same-column condition is required by the proof rule.

### Binary hard frontier

If

```text
|F| = 2
```

then the proof is a genuine two-obligation recursive frontier. The frontier may subsequently become wider and later collapse; binary width need not be preserved.

### Empty hard frontier

If

```text
H_B(s,a) = empty
```

then `s` is proved immediately by one `PreE(PreA(...))` composition over the base certificates.

## 9. Standard-7x6 qualification already observed

The recent controls instantiate the theorem on the real depth-8 standard-7x6 positive frontier.

Known constructive closures beyond the 319 immediate-win states are currently:

```text
99  shallow local I/O/E/A roots
62  additional generalized unique-hard chains
24  additional low-width branching-frontier roots
---
185 / 822 recursive depth-8 obligations proved
```

The sets are disjoint by construction:

- the 99 are removed before unresolved-boundary analysis;
- a unique-hard root is counted among the 62 only if its chain reaches structural closure before any multi-hard frontier;
- a low-width branching seed is created only when an unresolved chain first reaches hard width 2..4, so its root cannot simultaneously be one of the 62 closed unique-hard chains.

Including the 319 immediate-win depth-8 leaves:

```text
504 / 1141 depth-8 proof-frontier states
```

now have constructive structural positive certificates under this calculus and the current base grammar.

These counts do **not** prove the empty-board root. The remaining frontier still contains broad re-expansion regimes, and upstream P0 witness selection is not yet generated by a standalone structural theorem.

## 10. Current discovery boundary

The low-width branching pilot found:

```text
55 seeds with first hard width 2..4
24 structurally closed
31 overflowed a width-16 research cap
0 depth-capped
```

By initial width:

```text
width 2: 12 / 13 closed
width 3:  3 / 19 closed
width 4:  9 / 23 closed
```

Representative closed width histories include:

```text
2 -> 0
2 -> 2 -> 0
2 -> 12 -> 0
2 -> 7 -> 2 -> 3 -> 0
2 -> 7 -> 9 -> 3 -> 0
4 -> 5 -> 2 -> 0
```

The single canonical binary overflow was root sequence `46656555` with:

```text
2 -> 6 -> 26
```

Allowing a different exact-winning discovery witness changes that root to:

```text
1 -> 1 -> 1 -> 1 -> 1 -> 6 -> 28
```

so the initial binary expansion is not fundamental; the currently missing structure is a later broad hard-frontier regime.

## 11. What remains missing

This calculus proves **how** a finite expand/collapse frontier constitutes a positive certificate. It does not yet provide a compact structural theorem that chooses successful P0 witnesses for every unresolved obligation.

The next mathematical target is therefore not another generic recursive depth increase. It is one or both of:

1. derive theorem-backed P0 witness-selection/transport rules from CPC, WSL, NDC, support and resource/race structure;
2. add independently proved structural base certificates that discharge the broad 5..7-hard regimes before they expand into large frontiers.

The recent rank-5 blind recursion control already demonstrated why simply increasing depth is the wrong move: it materialized 100,001 `q` states after only 60 of 822 source roots and found zero additional rank-5 closures.

## 12. Reproducibility

Relevant prototypes/workflows include:

- `quotient-standard7x6-local-proof-grammar-census.mjs`
- `quotient-standard7x6-unique-hard-chain.mjs`
- `quotient-standard7x6-low-width-frontier-chain.mjs`
- `quotient-standard7x6-binary-frontier-differential.mjs`
- `quotient-standard7x6-binary-overflow-witness-choice.mjs`

All bounded workflows use hard timeouts. Oracle scores are discovery controls only; every claimed closed certificate can be replayed and checked from its frozen legal witness actions, all legal defender replies, exact C4-0010 transitions and accepted base certificates.
