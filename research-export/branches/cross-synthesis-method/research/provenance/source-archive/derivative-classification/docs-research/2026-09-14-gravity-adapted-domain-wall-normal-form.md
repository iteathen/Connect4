# Gravity-adapted domain-wall normal form and neutral-pair collapse

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Derive a lossless ownership coordinate system aligned with gravity and isolate the exact part of pure-followup play that can be collapsed for arbitrary height.

The previous domain-wall note showed that a cell-ownership field is equivalent, up to one global player anchor, to its `F2` disagreement field. This note chooses a gravity-adapted spanning-tree coordinate system for that field and proves that ordinary same-column response pairs are algebraically neutral macro-steps.

No finite W/D/L table or move-tree search is used.

## 1. Coordinates

Let `q(x,y) in F2` be the ownership bit of a completely assigned or certificate-assigned cell region, with

```text
q=0 -> first player
q=1 -> second player.
```

Choose one anchor

```text
a=q(0,0).
```

On the bottom row define the horizontal disagreement word

```text
h0(x)=q(x,0)+q(x+1,0),  x=0,...,W-2.
```

For every row boundary `y-1 -> y`, `y>=1`, define the vertical alternation-defect mask

```text
S_y(x)=1+q(x,y-1)+q(x,y),  x=0,...,W-1.
```

Thus

```text
S_y(x)=0 -> the two vertically adjacent owners alternate;
S_y(x)=1 -> they are equal, i.e. a seam/phase flip occurs at that edge.
```

The coordinate package is

```text
N(q)=(a,h0,S_1,...,S_(H-1)).
```

## 2. Exact bit count

The package contains

```text
1 + (W-1) + W(H-1) = WH
```

bits, exactly the dimension of the ownership field.

It is not merely dimension-matched; it is a bijective linear/affine reconstruction.

## 3. Reconstruction theorem

For every cell `(x,y)`,

```text
q(x,y)
 = a
   + sum_(i=0)^(x-1) h0(i)
   + y
   + sum_(r=1)^y S_r(x)
   mod 2.
```

Proof:

- the prefix sum of `h0` reconstructs the bottom-row owner from the anchor;
- crossing one vertical row boundary changes owner by `1+S_r(x)`;
- summing those vertical changes contributes `y + sum S_r(x)`.

Therefore `N` is lossless.

Global player exchange changes only

```text
a -> a+1
```

and leaves `h0` and every `S_y` unchanged.

So the player/sign lift is literally one coordinate separated from the ownership quotient.

## 4. Derived horizontal rows

Let `H_y in F2^(W-1)` be the horizontal disagreement word on physical row `y`.

From the plaquette identity,

```text
H_y = h0 + delta(sum_(r=1)^y S_r),
```

or incrementally

```text
H_y = H_(y-1) + delta S_y.
```

Thus an interior seam mask is the exact generator of horizontal phase transport.

The entire two-dimensional disagreement field is generated from one bottom word plus the vertical seam masks.

## 5. Derived vertical and diagonal edge rows

The vertical disagreement row is

```text
V_y = 1 + S_y.
```

For `x=0,...,W-2`, define the edge from bottom-left `(x,y-1)` to top-right `(x+1,y)` by

```text
R_y(x)=1+S_y(x)+H_y(x),
```

and the edge from top-left `(x,y)` to bottom-right `(x+1,y-1)` by

```text
F_y(x)=1+S_y(x)+H_(y-1)(x).
```

These are the two diagonal disagreement rows. They are derived data, not additional state.

## 6. Exact local terminal predicates

A four-cell line is monochromatic exactly when its three consecutive disagreement edges are zero.

When row `y` is added, any newly completed four-line can be detected by:

```text
horizontal:
  a length-3 zero run in H_y;

vertical:
  S_(y-2)(x)=S_(y-1)(x)=S_y(x)=1;

rising diagonal:
  R_(y-2)(x)=R_(y-1)(x+1)=R_y(x+2)=0;

falling diagonal:
  F_y(x)=F_(y-1)(x+1)=F_(y-2)(x+2)=0.
```

Therefore purely geometric terminal detection has bounded row memory independent of total board height. The bound comes from Connect-4's three inter-cell edges, not from a sampled board.

## 7. Pure-followup specialization

A pure-followup region has no vertical seams:

```text
S_y=0.
```

Hence

```text
H_y=h0=d
V_y=1
R_y=F_y=1+d
```

for every row in the region.

The terminal predicates reduce to

```text
horizontal forbidden <=> d has 000
diagonal forbidden   <=> d has 111
vertical impossible.
```

This recovers the safe pure-followup code from the general normal form.

## 8. Remaining-capacity decomposition

Suppose pure followup begins at frontier heights `h_c` with the opponent to move and the controller responding above in the same column whenever possible.

For each column define remaining capacity

```text
R_c=H-h_c.
```

Decompose it uniquely as

```text
R_c=2k_c+u_c,
```

where

```text
k_c=floor(R_c/2)
u_c=R_c mod 2.
```

`u_c` is exactly the previously proved unmatched-top defect bit.

`k_c` counts how many complete opponent/controller response pairs remain before the top boundary of that column matters.

## 9. Neutral-pair macro-step theorem

Assume `k_c>0`. The opponent can play the currently exposed event in column `c`; the controller responds immediately above it in the same column.

This consumes two cells and produces

```text
h_c -> h_c+2
k_c -> k_c-1.
```

Every other `k_j,u_j` is unchanged.

The macro-step also leaves unchanged:

```text
column phase h_c mod 2;
vertical seam field S (no seam is inserted);
horizontal bulk derivative d;
top defect bit u_c;
global CPC event-rank parity, because two events were consumed;
phase transport tau, because two events in one column give tau=0.
```

Thus a complete same-column response pair is algebraically neutral for all currently identified mod-2 structural coordinates.

## 10. Neutral pair steps commute

A neutral pair macro-step in column `c` changes only the integer counter `k_c`.

Therefore pair macro-steps in distinct columns commute, and repeated pair steps in one column simply decrement its counter.

Before a top defect fires, the interior pure-followup process is consequently the commutative counter action

```text
k -> k-e_c
```

on any coordinate with positive `k_c`.

Different move orders can alter **when** a boundary/deadline is reached, but they do not create distinct bulk phase states.

This separates structural identity from deadline scheduling.

## 11. Boundary firing condition

If

```text
k_c=0,
u_c=1,
```

then column `c` has exactly one remaining event and it belongs to the opponent under the pure-followup response schedule.

When the opponent consumes it:

```text
u_c -> 0,
```

the column becomes full, and there is no same-column controller response slot.

If the game is nonterminal, the controller receives a free decision elsewhere. A free move in column `j` changes its phase and, above an existing cell, inserts a singleton seam. This is the non-neutral boundary generator studied in the top-defect transport module.

Hence all nontrivial phase/seam dynamics of pure-followup truncation are localized at boundary firings; the arbitrary-height interior is a bank of neutral pair counters.

## 12. Exact boundary deadline rank

For a defective column `u_c=1`, the opponent must spend exactly

```text
k_c
```

complete opponent/controller pair choices in that column before its unmatched top event becomes exposed, then one further opponent choice consumes the top defect.

Focusing exclusively on the column realizes this lower bound. Interleaving other columns can only delay it.

So `k_c` is an exact local pair-depth/deadline rank for first exposure of that top defect under pure followup.

This is integer timing information; it is intentionally not reduced modulo two.

## 13. One-move setup formulas

Start from an empty finite board, let the first player place one setup stone in column `c`, and then enter pure followup with the second player to move.

If

```text
H=2m
```

is even, then

```text
setup column c: k_c=m-1, u_c=1
other columns : k_j=m,   u_j=0.
```

So there is one top defect, in the setup column, one pair-depth layer closer than the other columns' exhaustion boundary.

If

```text
H=2m+1
```

is odd, then

```text
setup column c: k_c=m, u_c=0
other columns : k_j=m, u_j=1.
```

So every non-setup column carries a defect at the same pair depth and the setup column carries none.

These formulas are exact consequences of capacity parity and do not use solved outcomes.

## 14. Standard width-7 center setup

The previously proved unique one-move safe-entry theorem selects `c=3` at width 7.

Therefore:

```text
H=2m:
  one defect at center, depth m-1;

H=2m+1:
  six non-center defects, each depth m.
```

This explains exactly where height parity enters the finite boundary problem while the infinite bulk derivative state remains the same.

It does not yet prove the W/D/L sign.

## 15. Canonical decomposition of the remaining finite problem

After this normal form, arbitrary-height pure-followup closure has four qualitatively different coordinates:

```text
1. one player/sign anchor bit a;
2. finite-width disagreement/seam field for local Connect-4 geometry;
3. integer pair-depth counters k_c for boundary deadlines;
4. unmatched defect bits u_c plus resource/NDC certificate state.
```

The first two are algebraic ownership structure; `k` is exact timing distance; `u` selects boundary firings; NDC owns whether a legal response transport closes before an opponent terminal requirement.

No full stack of `H` colored rows is required by this response profile.

## 16. Next theorem target

Derive the resource-constrained boundary action after a defect fires:

```text
(k,u,H_recent,S_recent,certificate)
  ->
(k',u',H'_recent,S'_recent,certificate').
```

Use the local domain-wall terminal predicates to reject unsafe seam insertions and NDC deadlines to distinguish eventual ownership from ownership-before-completion.

The immediate question is whether the boundary action itself factors into a small finite relation plus symbolic integer counter updates. If so, fixed-width arbitrary-height families can be proved by transfer/counter algebra rather than height enumeration.

## Proof boundary

Sections 1-7 are exact algebraic changes of coordinates on a binary ownership field. Sections 8-14 follow exactly from pure-followup pair consumption and finite capacity. Section 15 is the resulting decomposition. No solved W/D/L label, optimal-move oracle or finite board interpolation is a premise.
