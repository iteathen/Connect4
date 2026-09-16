# Z2 domain-wall / signed-constraint representation of Connect-4 ownership

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Continue the decomposition-first program into the finite seam/deadline layer.

The key observation is that player ownership can be quotient-represented by edge disagreements rather than by a cell-color field. On a rectangular board this quotient loses exactly one global complement bit. That forgotten bit is precisely the player/sign lift needed to identify the owner of a terminal monochromatic line.

This representation unifies:

- physical neighboring-cell ownership differences;
- the pure-followup derivative word;
- seam transport;
- pair-response XOR constraints;
- parity-union-find consistency;
- global player-complement symmetry;
- and the selected two-bit signed terminal encoding.

It does **not** remove support, resource, first-win or completion-before-deadline semantics.

## 1. Ownership bit convention

Use a binary ownership bit

```text
q(v)=0  -> first player / repository P0 / positive signed winner
q(v)=1  -> second player / repository P1 / negative signed winner.
```

Player-role exchange is therefore the global complement

```text
q -> q+1.
```

For a terminal result use the conceptual two-bit code

```text
[sign/player bit, win bit]
00 = draw
01 = first-player win  = +1
11 = second-player win = -1
10 = reserved/noncanonical.
```

The win bit is semantic only after exact terminal/first-win proof. The player/sign bit is meaningful for a decisive result and is canonicalized to zero for draw.

## 2. Physical edge-disagreement field

For an ownership assignment `q(x,y)` on a rectangular cell region define horizontal and vertical edge bits

```text
H(x,y)=q(x,y)+q(x+1,y)
V(x,y)=q(x,y)+q(x,y+1)
```

in `F2`.

Interpretation:

```text
edge bit 0 -> endpoints have the same owner
edge bit 1 -> endpoints have opposite owners.
```

Thus `(H,V)` is the physical domain-wall/disagreement field of `q`.

## 3. Plaquette flatness

For every unit plaquette,

```text
H(x,y)+H(x,y+1)+V(x,y)+V(x+1,y)=0.
```

Proof: each of the four vertex ownership bits occurs exactly twice in the sum.

Conversely, on a simply connected rectangular cell grid, any horizontal/vertical edge field satisfying every plaquette identity lifts to exactly two ownership fields `q`, differing by global complement.

Choose one anchor ownership bit at one cell and recover all other cells by path integration. Plaquette flatness makes the result path-independent. Flipping the anchor complements every recovered owner and leaves the edge field unchanged.

Therefore the exact sequence is conceptually

```text
0 -> <global complement> -> ownership fields -> flat edge fields -> 0.
```

The edge field is the ownership quotient; one anchor bit chooses a player-labeled lift.

## 4. Every Connect-4 win is the same zero-edge predicate

For any path of four collinear cells

```text
v0-v1-v2-v3,
```

let

```text
e_i=q(v_i)+q(v_(i+1)),  i=0,1,2.
```

The four cells have one common owner iff

```text
e_0=e_1=e_2=0.
```

Hence every horizontal, vertical, rising-diagonal or falling-diagonal Connect-4 terminal line is the same local predicate:

> **three consecutive disagreement edges along the geometric line are `000`.**

The four direction classes differ only in how their edge differences are derived from the horizontal/vertical field.

## 5. Diagonal disagreement is derived

The rising-diagonal edge from `(x,y)` to `(x+1,y+1)` is

```text
D_plus(x,y)
  = q(x,y)+q(x+1,y+1)
  = H(x,y)+V(x+1,y)
  = V(x,y)+H(x,y+1),
```

where equality of the two routes is exactly plaquette flatness.

The falling-diagonal edge between `(x,y+1)` and `(x+1,y)` is

```text
D_minus(x,y)
  = q(x,y+1)+q(x+1,y)
  = H(x,y)+V(x,y)
  = H(x,y+1)+V(x+1,y).
```

So diagonal ownership relations are not independent data. They are path sums of the axis disagreement field.

This is the dynamic/ownership analogue of the earlier result that diagonal third derivatives are derived from the axis derivative algebra.

## 6. Pure-followup is a special flat field

Inside a pure-followup region, write the ownership coloring as

```text
q(x,y)=a + y + phi(x)
```

for one global anchor/complement bit `a` and one column phase word `phi`.

Then

```text
V(x,y)=1
H(x,y)=phi(x)+phi(x+1)=d(x),
```

where

```text
d=delta phi.
```

The diagonal disagreement bits are

```text
D_plus = D_minus = 1+d.
```

Therefore:

```text
horizontal win <=> d has 000
vertical win   <=> impossible in pure followup because V=1
any diagonal win <=> d has 111.
```

Thus the previous pure-followup safety theorem

```text
no 000 and no 111 in d
```

is exactly the universal zero-edge win predicate specialized to the flat pure-followup field.

## 7. Seam defects and exact row transfer

Define the vertical alternation-defect bit

```text
S(x,y)=1+V(x,y).
```

Then

```text
S=0 -> ordinary alternating pure-followup vertical edge
S=1 -> same-owner vertical seam edge.
```

Substituting `V=1+S` into plaquette flatness gives

```text
H(x,y+1)+H(x,y)=S(x,y)+S(x+1,y).
```

In vector form for a row boundary,

```text
H_(y+1) = H_y + delta S_y.
```

This is the exact finite seam operator.

A free move in column `j` after a completed response pair flips the phase above its landing boundary. When the landing row is above an existing cell, this creates the singleton seam

```text
S_y=e_j
```

and therefore

```text
H_(y+1)=H_y+delta e_j.
```

This is the previously derived phase/seam transport, now seen as a direct consequence of plaquette flatness rather than as a separate rule.

At the bottom boundary the same phase flip enters through the ownership anchor/boundary condition rather than through an interior vertical edge.

## 8. Bounded local terminal test across seams

The complete no-win test remains local in the edge field.

- Horizontal four-line: three consecutive `H` bits must not be `000`.
- Vertical four-line: three consecutive `V=1+S` bits must not be `000`, equivalently `S` must not contain `111` vertically.
- Rising diagonal: three consecutive derived `D_plus` bits must not be `000`.
- Falling diagonal: three consecutive derived `D_minus` bits must not be `000`.

Therefore a phase change does not require preserving arbitrary colored history. It requires only enough recent edge/seam rows to evaluate length-three edge paths crossing the current transfer boundary.

Because Connect-4 has length four, three edge layers are sufficient for purely geometric terminal detection. Strategic deadlines/resources can require additional certificate state, but not additional geometric memory.

## 9. Strategic XOR constraints are the same object on another graph

Let future/event ownership variables be `q(u)`.

Any exact U1 relation of the form

```text
q(u)+q(v)=b
```

is a `Z2`-labeled edge on a strategic constraint graph.

Examples:

```text
b=0 -> same ownership
b=1 -> opposite ownership / split response.
```

For a connected constraint component:

- choosing one owner anchor determines every other owner by path integration;
- the constraints are consistent iff the XOR of edge labels around every cycle is zero;
- if no fixed ownership anchor exists, the component has exactly the global-complement ambiguity.

This is precisely the algebra implemented by parity union-find/XOR disjoint sets.

Thus physical domain walls and strategic pair-response relations are both exact `F2` 1-coboundary structures; they differ in graph topology and in causal/resource metadata, not in ownership algebra.

## 10. Pair blockers become domain walls through a requirement

If two cells `u,v` belonging to one opponent winning requirement satisfy

```text
q(u)+q(v)=1,
```

they cannot both belong to that opponent. The requirement is blocked.

If `u,v` are nonadjacent along the geometric four-line, their XOR relation is the parity sum of the disagreement edges on the subpath between them.

So the common pair blockers produced by Baseinverse, Vertical, Lowinverse, Highinverse and Baseclaim are naturally odd domain-wall/path-parity certificates through the winning requirement.

The certificate that establishes the XOR relation may still require support, resource sharing and deadline premises. Those premises are not encoded by the edge label alone.

Larger non-pair blockers remain residual/hypergraph facts and are not claimed to reduce completely to one edge relation.

## 11. Deadline is the genuinely extra structure

The ownership/disagreement algebra answers

```text
which events are equal/opposite owners?
which monochromatic requirement is thereby impossible?
```

It does not answer

```text
is the relation established before an opponent completes a requirement?
```

That is the additional NDC temporal structure.

The current decomposition is therefore

```text
Z2 ownership / domain-wall field
+ support legality
+ response resources
+ precedence
+ completion-before-deadline
-> exact strategic certificate.
```

No additional player-color algebra is required.

## 12. Natural signed terminal projection

Suppose a legal terminal certificate establishes a four-cell line whose three disagreement edges are all zero.

All four cells have the same ownership bit `q`. Let

```text
s=q(any cell of the certified line)
w=1.
```

Then the two-bit outcome is

```text
[s,w].
```

Under the chosen convention:

```text
q=0 -> 01 -> first-player win -> +1
q=1 -> 11 -> second-player win -> -1.
```

For draw use canonical

```text
00.
```

Player-role exchange `q->q+1` leaves every disagreement edge unchanged, leaves the win predicate unchanged, and toggles only the sign/player bit:

```text
01 <-> 11,
00 -> 00.
```

Thus the signed output encoding is a direct projection of the same quotient/lift structure used by the ownership field.

## 13. Exact external mathematical isomorphs

This representation has standard counterparts:

- Ising/domain-wall form: vertex spins modulo global spin flip, with edge disagreements recording domain walls;
- `Z2` cochain language: ownership is a 0-cochain and disagreements are its exact 1-coboundary;
- signed / `Z2` gain graphs: pairwise same/opposite relations, cycle-balance consistency, switching/complement equivalence.

These are classification/representation isomorphs for the ownership-XOR layer. They do not supply Connect-4 gravity, move legality or deadlines.

## 14. Next theorem target

Use the row transfer

```text
H_(y+1)=H_y+delta S_y
```

and the local zero-edge predicates to derive the smallest finite-state **causal seam closure** compatible with legal free-move seams.

The state should separate:

```text
flat ownership quotient / disagreement field;
one ownership anchor bit;
recent seam rows needed by length-4 geometry;
support/frontier capacities;
response-resource/deadline certificates.
```

The desired outcome is a bounded transfer object whose size depends on width/certificate structure but not on height, so arbitrary-height theorems follow by operator algebra rather than board-by-board search.

## Proof boundary

Sections 1-8 and 12 are direct `F2` consequences of a binary ownership field on a rectangle. Section 9 is standard XOR-constraint graph algebra and matches the existing U1 parity-union-find semantics. Section 10 applies that algebra to pair blockers while retaining their original certification premises. Section 11 preserves NDC timing as independent load-bearing structure. No solved W/D/L table, move-tree search, or finite board interpolation is used.
