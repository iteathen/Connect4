# Dynamic phase action as a path Laplacian over F2

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Relate the previously proved column-path phase transport to the newly derived pure-follow-up bulk phase code.

The result identifies an exact combinatorial-Laplacian coupling. This is the point at which the earlier grid/path Laplacian analogy becomes a literal part of the Connect-4 response calculus rather than only a neighboring mathematical structure.

## 1. Width path operators

Let `P_W` be the path on width vertices `0,...,W-1`, with edge space

```text
E = F2^(W-1)
```

and vertex space

```text
V = F2^W.
```

Let

```text
partial : E -> V
```

be the path boundary map

```text
partial(edge_i)=e_i+e_(i+1).
```

Let

```text
delta : V -> E
```

be the corresponding coboundary / first-difference map

```text
(delta phi)_i = phi_i + phi_(i+1).
```

Then

```text
im(partial)=Even(F2^W)
ker(delta)=span{all-ones vertex word}.
```

The earlier phase-path theorem identifies the regular line-side phase quotient with `im(partial)` and gives every two-column displacement a unique interval lift in `E`.

## 2. Support phase word

For a support frontier with heights `h_c`, define its column phase word

```text
phi_c = h_c mod 2.
```

The pure-follow-up bulk safety code depends only on

```text
d = delta phi in E.
```

The word `d` is safe exactly when no three consecutive edge bits are all `0` and no three are all `1` over a geometric four-column window.

Thus the support phase state naturally lives in the quotient

```text
V / ker(delta),
```

with `d` as its canonical path-edge coordinate.

## 3. Response transport acts on vertex phase

For a response fragment `F`, the already-derived mod-2 column consumption vector is

```text
tau(F)=sum_c (n_c(F) mod 2)e_c in V.
```

Because consuming an odd number of events in a column flips that column's height parity,

```text
phi' = phi + tau(F).
```

For the common two-event cross-column fragment in columns `a,b`,

```text
tau=e_a+e_b.
```

The phase-path theorem gives the unique interval edge vector `z_(a,b)` with

```text
partial z_(a,b) = tau.
```

Same-column response has `z=0`.

## 4. Induced action on the pure-follow-up safety word

Take the width derivative after the response:

```text
d'
 = delta phi'
 = delta(phi+tau)
 = d + delta tau.
```

If `tau=partial z`, then

```text
d' = d + delta partial z.
```

Define

```text
L_E = delta partial : E -> E.
```

Therefore the exact response action on the pure-follow-up edge-phase word is

```text
d' = d + L_E z.
```

`L_E` is the edge Laplacian of the width path over `F2`.

In ordinary matrix notation, if `B_P` is the vertex-edge incidence matrix of `P_W`,

```text
partial = B_P
delta   = B_P^T
L_E     = B_P^T B_P.
```

So the dynamic phase coupling is literally a combinatorial Laplacian.

## 5. Characteristic-two simplification

Each path edge has two endpoints. Over `F2`, the diagonal degree contribution `2` vanishes. Thus

```text
L_E = adjacency(line_graph(P_W))
```

in the interior: each edge bit is mapped to the XOR of its neighboring edge bits.

This gives a useful locality theorem.

A cross-column transport interval may be arbitrarily long, but its action on `d` cancels throughout the interior. Only the derivative boundary of that interval survives.

For a nontrivial interval from column `a` to column `b`, the support-phase safety word changes only on edges incident to the two endpoint columns (subject to board clipping and the adjacent-column cancellation when the two endpoints share an edge).

So long-distance phase transport has **endpoint-local action** on the safe-bulk derivative word.

This is a strong compression of the response effect.

## 6. Three equivalent views of the same fragment

A cross-column even response can now be represented in three exact coordinates:

```text
vertex consumption parity:
  tau = e_a+e_b

path transport:
  z = unique interval lift with partial z=tau

bulk safety action:
  Delta d = L_E z = delta tau.
```

They are not three independent objects. They are connected by the path incidence complex

```text
E --partial--> V --delta--> E.
```

The response/control decomposition therefore has the shape

```text
transport interval
  -> vertex phase boundary
  -> derivative safety perturbation.
```

## 7. Relation to the static phase quotient

The earlier line-side phase quotient is naturally represented by the path edge space through `partial`, while the pure-follow-up bulk quotient `V/span{1}` is naturally represented by the same edge space through `delta`.

The two representations are coupled by

```text
L_E=delta partial.
```

Thus the static line-phase sector and the dynamic support-phase safety sector are not merely equal-dimensional. The path Laplacian gives an explicit natural coupling between their edge coordinates.

This is a stronger structural relationship than the previous rank comparison.

## 8. Consequence for the finite-board transfer problem

Let `S_W` be the set of pure-follow-up safe derivative words

```text
S_W={d in F2^(W-1) : d has no factor 000 or 111}.
```

Every even response fragment acts on `d` by a locally computable translation `L_E z`.

Therefore one dynamic subproblem has become:

```text
starting support phase d_0
+ legal response transports z_1,z_2,...
subject to resources/deadlines
-> reach or preserve S_W before top truncation.
```

The remaining hard part is no longer the geometric effect of a response. It is the causal selection/availability of transports under NDC resource and completion-before-deadline constraints.

## 9. External-isomorph correction

Ordinary grid/path Laplacians were previously classified as only a substrate analogy because they did not reproduce the Connect-4 third-derivative winning geometry.

This note refines that assessment:

- they are **not** an isomorphism of the entire Connect-4 calculus;
- the width-path combinatorial Laplacian **is exactly the dynamic coupling operator** between response transport and the pure-follow-up phase-safety word.

So the Laplacian system is an exact subsystem isomorphism at this layer.

## Proof boundary

All identities above are exact linear algebra over `F2` applied to the already-derived support-consumption and phase-path maps. No finite W/D/L table, move search, or infinite-board outcome is used as a premise.

The safe-set reachability problem remains subject to legal response resources and NDC deadlines; Laplacian reachability alone is not a game-value theorem.
