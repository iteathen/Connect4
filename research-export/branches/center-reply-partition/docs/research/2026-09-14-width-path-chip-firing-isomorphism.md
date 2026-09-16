# Width-path defect transport as chip-firing/divisor equivalence

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Identify the exact algebraic relation between the previously derived top-defect transport and graph chip-firing/divisor theory on the width path.

The comparison is useful because it proves a negative result: on an ordinary finite-width path board, the boundary transport has no hidden spatial topological class beyond total parity. Therefore the eventual game sign cannot come from another static defect-position invariant inside this subsystem; it must involve stopping, forcing, resources or deadlines.

## 1. Width path

Let `P_W` be the path graph on column vertices

```text
0--1--...--(W-1).
```

Let

```text
partial : F2^(W-1) -> F2^W
```

be the edge-to-vertex boundary map

```text
partial(edge_i)=e_i+e_(i+1).
```

Its image is exactly

```text
Even(F2^W)={u : sum_i u_i=0}.
```

Proof:

- every edge boundary has even weight, so the image is contained in the even subspace;
- the adjacent-pair boundaries `e_i+e_(i+1)` are independent and span a `(W-1)`-dimensional space;
- the even subspace also has dimension `W-1`.

This is the already-qualified phase-boundary isomorphism.

## 2. Pairwise defect transport

A finite top-boundary response cycle with source defect column `c` and free-move target `j` changes the defect vector by

```text
u -> u + e_c + e_j.
```

On the path there is a unique edge interval

```text
z_(c,j)
```

joining `c` and `j`, and

```text
partial z_(c,j)=e_c+e_j.
```

Therefore every defect transport is addition of a path boundary.

Conversely, adjacent defect transports generate every path boundary, so the reachable affine class under unconstrained pair transports is

```text
u + im(partial).
```

## 3. Laplacian / principal-divisor form

Over the integers, orient the path and let `D` be its incidence matrix. The graph Laplacian is

```text
Delta=D D^T
```

(up to row/column convention).

For `c<j`, define an integer vertex potential whose edge gradient is one on the interval from `c` to `j` and zero elsewhere. Its Laplacian is

```text
+e_c-e_j
```

up to orientation sign.

Thus moving one defect from `c` to `j` is the ordinary degree-zero principal-divisor relation on the path. Reducing modulo two turns subtraction into addition and gives exactly

```text
e_c+e_j.
```

So the Connect-4 boundary transport is an exact mod-2 specialization of path divisor/chip-firing equivalence.

## 4. Trivial critical group of the path

A path is a tree. Its reduced Laplacian has determinant one (equivalently, the path has exactly one spanning tree), so its integer critical/Jacobian group is trivial.

The direct mod-2 statement needed here is simpler:

```text
F2^W / im(partial) ~= F2.
```

The quotient coordinate is total parity

```text
chi(u)=sum_c u_c mod 2.
```

Therefore two defect vectors are transport-equivalent iff they have the same total parity, ignoring support/resource/deadline restrictions on which transports are currently legal.

## 5. Relation to the response Laplacian

Let

```text
d=delta phi
```

be the width derivative phase state. If a response transport is represented by a path edge interval `z`, its endpoint boundary is

```text
partial z=e_c+e_j.
```

Differentiating that boundary produces the previously identified edge-space response Laplacian action

```text
d -> d + delta partial z.
```

So the three views are one operation at different levels:

```text
path interval z
 -> endpoint defect transport partial z
 -> derivative/phase transport delta partial z.
```

## 6. Odometer analogy for neutral pair depth

The pure-followup remaining capacity

```text
R_c=2k_c+u_c
```

contains a counter `k_c` of complete neutral response pairs.

Consuming a neutral pair in column `c` performs

```text
k_c -> k_c-1
```

and leaves all mod-2 bulk coordinates unchanged. Such decrements commute across columns.

This is an odometer-like abelian interior: the count of neutral firings matters for the boundary exposure time, while their order does not create a new phase state.

The analogy stops where strategic forcing begins: unlike an ordinary deterministic sandpile stabilization, the opponent may choose which available column/counter to consume and threat certificates may force or forbid choices.

## 7. Exact negative result for a static sign invariant

Because

```text
F2^W / Even(F2^W) ~= F2,
```

the unconstrained width-path defect subsystem has only the conserved charge

```text
chi=sum u mod2.
```

There is no additional defect-position class on an ordinary path board that can encode the full game outcome.

Thus a proposed winner formula based only on

```text
defect locations modulo response transport
```

is structurally incomplete.

Any additional signed information must come from data removed by the unconstrained quotient, such as:

```text
which transports are legal now;
integer pair-depth / exposure times;
forced-response obligations;
resource conflicts;
zero-edge threat creation;
completion-before-deadline;
first-win stopping.
```

This is a useful pruning result for the invariant search.

## 8. Cylinder contrast

For a cyclic width graph, the underlying graph is no longer a tree and a nontrivial graph critical group/topological cycle sector can survive. That is consistent with the earlier need to add cyclic integrability/closure conditions for cylindrical pure-followup phases.

Do not transfer the path's trivial-boundary quotient to a cylindrical board without re-deriving the graph topology.

## 9. External structural isomorph

Standard chip-firing/sandpile theory represents firings by graph Laplacians, records the firing count as an odometer and quotients degree-zero configurations by the Laplacian image to obtain the critical/Jacobian group.

The exact Connect-4 isomorphism claimed here is limited to the width-path boundary transport and its abelian neutral-pair substrate. Chip-firing theory does not supply Connect-4 threat semantics, gravity legality or winner/deadline rules.

## Next target

Model strategic singleton threats and threat combinations as **stopping/forcing conditions on the abelian counter/defect transport**.

The key question is whether the controller can force a terminal zero-edge path before the opponent realizes the all-draw neutral-pair odometer schedule. If that forcing condition admits an order-independent least-action characterization, the chip-firing/abelian-network analogy extends materially; if it depends irreducibly on policy order, the analogy stops at the substrate proved above.

## Proof boundary

The path-boundary and quotient statements are direct linear algebra. The integer principal-divisor statement follows constructively from the unique interval path. The strategic conclusions are only boundary statements: no game outcome is inferred from chip-firing equivalence alone.
